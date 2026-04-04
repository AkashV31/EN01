"""
services/esg.py — ESG impact calculations for CanopyROI.

Assumptions (Prithvi-EO-2.0 calibrated estimates):
- Each selected zone supports ~100 trees on average.
- Carbon offset: 21.77 kg CO2 / tree / year (IPCC urban forestry estimate).
  Over 10 years = 217.7 kg per tree.
- Temperature reduction: 0.02°C per tree (urban micro-climate cooling).
- Survival rate 85% applied to final numbers.

ESG receipt includes:
  - trees_planted     : int
  - carbon_10yr       : float (kg CO2)
  - temp_reduction    : float (°C)
"""

from __future__ import annotations
from schemas import GeoPoint

# ── Constants ──────────────────────────────────────────────────────────────

_TREES_PER_ZONE = 100
_CARBON_KG_PER_TREE_PER_YEAR = 21.77   # IPCC Tier 1 urban broadleaf estimate
_YEARS = 10
_TEMP_REDUCTION_PER_TREE = 0.02         # °C micro-climate cooling
_SURVIVAL_RATE = 0.85                   # 5-year survival assumed at year 10


# ── Public API ────────────────────────────────────────────────────────────

def generate_report(selected: list[GeoPoint], source_city: str = "Pune", compare_city: str = "Mumbai") -> dict:
    """
    Generate ESG impact report from selected Knapsack zones.
    Returns dict conforming to ESGResponse schema.
    """
    if not selected:
        return {
            "trees_planted": 0,
            "carbon_10yr": 0.0,
            "temp_reduction": 0.0,
            "source_city": source_city,
            "budget_utilized": 0,
            "carbon_credit_value": 0,
            "roi_pct": 0.0,
            "compare_city": compare_city,
            "compare_trees": 0,
            "compare_carbon": 0.0,
            "urgency_zones": [],
            "sdg_tags": ["SDG 11", "SDG 13", "SDG 3", "SDG 15"],
            "weekly_trees": 0,
            "monthly_trees": 0,
            "yearly_trees": 0,
            "impact_profile": [
                {"metric": "Carbon", "source": 0, "compare": 90},
                {"metric": "Shade", "source": 0, "compare": 67},
                {"metric": "Heat", "source": 0, "compare": 86},
                {"metric": "Equity", "source": 0, "compare": 79},
                {"metric": "Biodiv", "source": 0, "compare": 82},
            ],
        }

    # Effective trees accounting for survival rate
    raw_trees = len(selected) * _TREES_PER_ZONE
    effective_trees = int(raw_trees * _SURVIVAL_RATE)

    carbon_10yr = round(effective_trees * _CARBON_KG_PER_TREE_PER_YEAR * _YEARS, 2)
    temp_reduction = round(effective_trees * _TEMP_REDUCTION_PER_TREE, 3)
    
    # Calculate budget utilized (sum of costs from selected zones)
    budget_utilized = sum(point.cost for point in selected)
    
    # Carbon credit value (rough estimate: ~0.6 INR per kg CO2)
    carbon_credit_value = int(carbon_10yr * 0.6)
    
    # Calculate comparison metrics (Mumbai typically has more trees)
    compare_ratio = 1.3  # Mumbai has ~30% more trees
    compare_trees = int(effective_trees * compare_ratio)
    compare_carbon = round(compare_trees * _CARBON_KG_PER_TREE_PER_YEAR * _YEARS, 2)
    
    # Find urgency zones (high LST, low NDVI)
    urgency_zones = []
    for point in selected:
        if point.lst > 44 or point.ndvi < 0.15:
            urgency_zones.append({
                "lat": point.lat,
                "lon": point.lon,
                "lst": point.lst,
                "ndvi": point.ndvi,
                "severity": "critical" if point.lst > 45 else "high",
                "label": f"LST {point.lst}°C · NDVI {point.ndvi}"
            })
    
    # Impact profile with meaningful scores based on selected zones
    base_impact = min(100, effective_trees / 10)  # Scale based on tree count
    
    return {
        "trees_planted": effective_trees,
        "carbon_10yr": carbon_10yr,
        "temp_reduction": temp_reduction,
        "source_city": source_city,
        "budget_utilized": budget_utilized,
        "carbon_credit_value": carbon_credit_value,
        "roi_pct": round((carbon_credit_value / max(budget_utilized, 1)) * 100, 1),
        "compare_city": compare_city,
        "compare_trees": compare_trees,
        "compare_carbon": compare_carbon,
        "urgency_zones": urgency_zones[:5],  # Top 5 urgency zones
        "sdg_tags": ["SDG 11", "SDG 13", "SDG 3", "SDG 15"],
        "weekly_trees": max(1, int(effective_trees / 52)),
        "monthly_trees": max(1, int(effective_trees / 12)),
        "yearly_trees": effective_trees,
        "impact_profile": [
            {"metric": "Carbon", "source": min(100, int(base_impact * 0.9)), "compare": 90},
            {"metric": "Shade", "source": min(100, int(base_impact * 0.8)), "compare": 67},
            {"metric": "Heat", "source": min(100, int(base_impact * 0.95)), "compare": 86},
            {"metric": "Equity", "source": min(100, int(base_impact * 0.85)), "compare": 79},
            {"metric": "Biodiv", "source": min(100, int(base_impact * 0.75)), "compare": 82},
        ],
    }