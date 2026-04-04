from dotenv import load_dotenv
load_dotenv(encoding='utf-8-sig')

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import (
    PromptRequest,
    PromptResponse,
    IntentRequest,
    IntentResponse,
    OptimizeRequest,
    OptimizeResponse,
    ESGRequest,
    ESGResponse,
    CompliantOptimizeRequest,
    SpeciesPredictionRequest,
    SpeciesPredictionResponse,
    SpeciesPrediction,
)
from services.agentic import (
    enrich_optimization_with_llm,
    generate_esg_summary,
    parse_prompt_with_groq,
)
from services.optimizer import (
    compute_impact_vs_city,
    optimize,
    optimize_with_compliance,
    suggest_alternatives,
)
from services.esg import generate_report
from services.loader import load_location_candidates, load_zones

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("canopyroi.api")

app = FastAPI(title="CanopyROI", version="2.0.0", description="Spatial AI for ESG Urban Forestry")

# Add CORS middleware with proper preflight handling
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # Cache preflight for 24 hours
)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "CanopyROI", "version": "2.0.0"}


@app.get("/zones")
def get_zones():
    try:
        return load_zones()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Zone loader error: {e}")


@app.post("/parse-prompt", response_model=PromptResponse)
async def parse_prompt_endpoint(body: PromptRequest) -> PromptResponse:
    try:
        candidates = load_location_candidates(limit=12)
        result = await parse_prompt_with_groq(body.prompt, candidates)
        logger.info("parse-prompt llm_source=%s", result.get("llm_source", "unknown"))
        return PromptResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Prompt parse failed: {e}")


@app.post("/parse-intent", response_model=IntentResponse)
async def parse_intent_endpoint(body: IntentRequest) -> IntentResponse:
    from services.parser import parse_intent
    result = parse_intent(body.query)
    return IntentResponse(**result)


async def _build_optimization_response(
    *,
    budget: int,
    geo_data,
    tree_type: str,
    priority: str,
    target_zone: str | None,
    selected_location: str | None,
    is_compliant_mode: bool,
    drought_mode: bool = False,
) -> OptimizeResponse:
    if is_compliant_mode:
        selected, total_cost = optimize_with_compliance(budget, geo_data, True, drought_mode)
    else:
        selected, total_cost = optimize(budget, geo_data, drought_mode)

    selected_zone_names = [point.zone_name or f"{point.lat:.4f},{point.lon:.4f}" for point in selected]
    effective_location = selected_location or target_zone
    alternatives, drought_insights, fallback_suggestions = suggest_alternatives(
        requested_tree=tree_type,
        selected_location=effective_location,
        geo_data=geo_data,
        limit=6,
        drought_mode=drought_mode,
    )

    llm_payload = await enrich_optimization_with_llm(
        selected_zone_names=selected_zone_names,
        alternatives=alternatives,
        priority=priority,
        tree_type=tree_type,
        drought_resilient_insights=drought_insights,
        fallback_tree_suggestions=fallback_suggestions,
    )
    impact_rows = compute_impact_vs_city(selected, geo_data)
    logger.info("optimize llm_source=%s", llm_payload.get("llm_source", "unknown"))

    return OptimizeResponse(
        selected=selected,
        total_cost=total_cost,
        alternatives=alternatives,
        drought_resilient_insights=llm_payload.get("drought_resilient_insights", drought_insights),
        fallback_tree_suggestions=llm_payload.get("fallback_tree_suggestions", fallback_suggestions),
        zone_reasoning=llm_payload.get("zone_reasoning"),
        llm_source=llm_payload.get("llm_source", "rule_based"),
        impact_vs_city=impact_rows,
    )


@app.post("/optimize", response_model=OptimizeResponse)
async def optimize_endpoint(body: OptimizeRequest) -> OptimizeResponse:
    return await _build_optimization_response(
        budget=body.budget,
        geo_data=body.geo_data,
        tree_type=body.tree_type,
        priority=body.priority,
        target_zone=body.target_zone,
        selected_location=body.selected_location,
        is_compliant_mode=False,
        drought_mode=body.drought_mode,
    )


@app.post("/optimize/compliant", response_model=OptimizeResponse)
async def optimize_compliant_endpoint(body: CompliantOptimizeRequest) -> OptimizeResponse:
    selected, total_cost = optimize_with_compliance(
        body.budget,
        body.geo_data,
        body.is_gst_amnesty_quarter,
        body.drought_mode,
    )
    selected_zone_names = [point.zone_name or f"{point.lat:.4f},{point.lon:.4f}" for point in selected]
    effective_location = body.selected_location or body.target_zone
    alternatives, drought_insights, fallback_suggestions = suggest_alternatives(
        requested_tree=body.tree_type,
        selected_location=effective_location,
        geo_data=body.geo_data,
        limit=6,
        drought_mode=body.drought_mode,
    )
    llm_payload = await enrich_optimization_with_llm(
        selected_zone_names=selected_zone_names,
        alternatives=alternatives,
        priority=body.priority,
        tree_type=body.tree_type,
        drought_resilient_insights=drought_insights,
        fallback_tree_suggestions=fallback_suggestions,
    )
    impact_rows = compute_impact_vs_city(selected, body.geo_data)
    logger.info("optimize-compliant llm_source=%s", llm_payload.get("llm_source", "unknown"))
    return OptimizeResponse(
        selected=selected,
        total_cost=total_cost,
        alternatives=alternatives,
        drought_resilient_insights=llm_payload.get("drought_resilient_insights", drought_insights),
        fallback_tree_suggestions=llm_payload.get("fallback_tree_suggestions", fallback_suggestions),
        zone_reasoning=llm_payload.get("zone_reasoning"),
        llm_source=llm_payload.get("llm_source", "rule_based"),
        impact_vs_city=impact_rows,
    )


@app.post("/esg-report", response_model=ESGResponse)
async def esg_report_endpoint(body: ESGRequest) -> ESGResponse:
    report = generate_report(body.selected, body.source_city, body.compare_city)
    zone_names = [point.zone_name or f"{point.lat:.4f},{point.lon:.4f}" for point in body.selected]
    summary, source = await generate_esg_summary(report, zone_names)
    logger.info("esg-report llm_source=%s", source)
    return ESGResponse(**report, summary=summary, llm_source=source)


@app.post("/predict-species", response_model=SpeciesPredictionResponse)
async def predict_species_endpoint(body: SpeciesPredictionRequest) -> SpeciesPredictionResponse:
    """Predict tree species survival based on climate conditions."""
    from services.trees import recommend_species, get_survival_rate
    
    # Get species recommendations based on zone conditions
    zone_name = body.species or "default"
    species_list = recommend_species(zone_name, body.lst_celsius, 0.5)
    
    # Calculate survival probabilities for each species
    recommendations = []
    for i, species in enumerate(species_list[:6]):
        survival_prob = get_survival_rate(species, body.lst_celsius, 0.5)
        
        # Adjust based on conditions
        if body.soil_moisture < 2.5:
            survival_prob -= 0.1
        if body.lst_celsius > 44:
            survival_prob -= 0.05
        if body.rainfall_mm < 600:
            survival_prob -= 0.05
            
        survival_prob = max(0.4, min(0.98, survival_prob))
        
        tier = "A" if survival_prob >= 0.85 else "B" if survival_prob >= 0.75 else "C"
        
        recommendations.append(SpeciesPrediction(
            species=species,
            survival_probability=survival_prob,
            survival_percent=f"{int(survival_prob * 100)}%",
            tier=tier,
            recommendation=f"{species} — {int(survival_prob * 100)}% survival" if survival_prob >= 0.8 else f"{species} — consider irrigation support",
            rank=i + 1
        ))
    
    return SpeciesPredictionResponse(
        recommendations=recommendations,
        best_species=recommendations[0].species if recommendations else "Neem",
        zone_summary=f"Zone with LST {body.lst_celsius}°C, soil moisture {body.soil_moisture}, rainfall {body.rainfall_mm}mm"
    )
