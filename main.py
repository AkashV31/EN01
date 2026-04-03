# main.py

# NOTE FOR TEAM:
# This file wires all endpoints together.
# Each endpoint calls logic from services/ folder.
# Keep this thin (no business logic here).

from fastapi import FastAPI
from schemas import (
    IntentRequest, IntentResponse,
    OptimizeRequest, OptimizeResponse,
    ESGRequest, ESGResponse,
)
from services.parser import parse_intent
from services.optimizer import optimize
from services.esg import generate_report

app = FastAPI(title="CanopyROI", version="1.0.0")


@app.post("/parse-intent", response_model=IntentResponse)
async def parse_intent_endpoint(body: IntentRequest) -> IntentResponse:
    # teammate note: converts user text → structured inputs
    result = parse_intent(body.query)
    return IntentResponse(**result)


@app.post("/optimize", response_model=OptimizeResponse)
async def optimize_endpoint(body: OptimizeRequest) -> OptimizeResponse:
    # teammate note: core selection logic (budget constrained)
    selected, total_cost = optimize(body.budget, body.geo_data)
    return OptimizeResponse(selected=selected, total_cost=total_cost)


@app.post("/esg-report", response_model=ESGResponse)
async def esg_report_endpoint(body: ESGRequest) -> ESGResponse:
    # teammate note: converts selected zones → ESG metrics
    report = generate_report(body.selected)
    return ESGResponse(**report)