from pydantic import BaseModel
from typing import List


class IntentRequest(BaseModel):
    query: str


class IntentResponse(BaseModel):
    budget: int
    tree_type: str
    priority: str


class GeoPoint(BaseModel):
    lat: float
    lon: float
    ndvi: float
    lst: float
    cost: int


class OptimizeRequest(BaseModel):
    budget: int
    geo_data: List[GeoPoint]


class OptimizeResponse(BaseModel):
    selected: List[GeoPoint]
    total_cost: int


class ESGRequest(BaseModel):
    selected: List[GeoPoint]


class ESGResponse(BaseModel):
    trees_planted: int
    carbon_10yr: float
    temp_reduction: float
