from typing import List, Optional

from pydantic import BaseModel, Field


class GeoPoint(BaseModel):
    lat: float
    lon: float
    ndvi: float
    lst: float
    cost: int
    zone_name: Optional[str] = None
    city: Optional[str] = "Pune"
    state: Optional[str] = "Maharashtra"
    reason: Optional[str] = None
    compliance_penalty: float = Field(default=1.0, ge=0.0, le=1.0)
    Drought_Impact_Score: float | None = 0.0


class LocationRecommendation(BaseModel):
    zone_name: str
    city: str
    state: str = "Maharashtra"
    lat: float
    lon: float
    ndvi: float
    lst: float
    compliance_score: float = Field(ge=0.0, le=1.0)
    reason: str


class PromptRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        example="Allocate 5 lakhs for Kothrud",
    )


class PromptResponse(BaseModel):
    budget: int
    target_zone: Optional[str] = None
    tree_type: str = "native"
    priority: str = "heat_reduction"
    recommended_locations: List[LocationRecommendation] = []
    llm_source: str = "rule_based"
    reasoning: Optional[str] = None


class IntentRequest(BaseModel):
    query: str


class IntentResponse(BaseModel):
    budget: int
    tree_type: str
    priority: str


class OptimizeRequest(BaseModel):
    budget: int = Field(..., gt=0)
    geo_data: List[GeoPoint]
    tree_type: str = "native"
    priority: str = "heat_reduction"
    target_zone: Optional[str] = None
    selected_location: Optional[str] = None
    drought_mode: bool = False


class CompliantOptimizeRequest(OptimizeRequest):
    is_gst_amnesty_quarter: bool = False


class AlternativeLocation(BaseModel):
    zone_name: str
    city: str
    state: str = "Maharashtra"
    score: float
    reason: str
    lat: float
    lon: float
    ndvi: float
    compliance_score: float = Field(ge=0.0, le=1.0)


class ImpactByCity(BaseModel):
    city: str
    impact_percent: float
    selected_zones: int
    total_zones: int


class OptimizeResponse(BaseModel):
    selected: List[GeoPoint]
    total_cost: int
    alternatives: List[AlternativeLocation] = []
    drought_resilient_insights: List[str] = []
    fallback_tree_suggestions: List[str] = []
    zone_reasoning: Optional[str] = None
    llm_source: str = "rule_based"
    impact_vs_city: List[ImpactByCity] = []


class ESGRequest(BaseModel):
    selected: List[GeoPoint]
    source_city: str = "Pune"
    compare_city: str = "Mumbai"


class ESGResponse(BaseModel):
    trees_planted: int
    carbon_10yr: float
    temp_reduction: float
    summary: Optional[str] = None
    llm_source: str = "rule_based"
    source_city: str = "Pune"
    budget_utilized: int = 0
    carbon_credit_value: int = 0
    roi_pct: float = 0.0
    compare_city: str = "Mumbai"
    compare_trees: int = 0
    compare_carbon: float = 0.0
    urgency_zones: List[dict] = []
    sdg_tags: List[str] = ["SDG 11", "SDG 13", "SDG 3", "SDG 15"]
    weekly_trees: int = 0
    monthly_trees: int = 0
    yearly_trees: int = 0
    impact_profile: List[dict] = []


class SpeciesPredictionRequest(BaseModel):
    lst_celsius: float
    soil_moisture: float
    rainfall_mm: float
    species: Optional[str] = None


class SpeciesPrediction(BaseModel):
    species: str
    survival_probability: float
    survival_percent: str
    tier: str
    recommendation: str
    rank: int


class SpeciesPredictionResponse(BaseModel):
    recommendations: List[SpeciesPrediction]
    best_species: str
    zone_summary: str
