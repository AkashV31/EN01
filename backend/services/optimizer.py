from __future__ import annotations

from collections import defaultdict

from schemas import GeoPoint
from services.trees import fallback_species, recommend_species

W_LST_DEFAULT = 0.7
W_NDVI_DEFAULT = 0.3
W_COMPLIANCE_NORMAL = 1.20
W_COMPLIANCE_AMNESTY = 1.0


def _classic_score(point: GeoPoint) -> float:
    """Classic heat+NDVI score for standard optimization."""
    return (point.lst * W_LST_DEFAULT) - (point.ndvi * W_NDVI_DEFAULT)


def _drought_score(point: GeoPoint) -> float:
    """
    Drought impact score — higher means more urgently needs drought-resilient planting.
    Uses LST, low NDVI, low soil moisture, low rainfall.
    """
    soil = point.soil_moisture if point.soil_moisture is not None else 3.0
    rainfall = point.rainfall_mm if point.rainfall_mm is not None else 700.0
    # Normalize soil (0-8) inverted → higher stress = lower soil
    soil_stress = max(0.0, (4.0 - soil) / 4.0)
    # Normalize rainfall stress  (below 600mm = high stress)
    rain_stress = max(0.0, (800.0 - rainfall) / 800.0)
    # LST stress normalized 30-50°C range
    lst_stress = max(0.0, (point.lst - 35.0) / 15.0)
    # NDVI deficiency (low NDVI = high stress)
    ndvi_stress = max(0.0, (0.3 - point.ndvi) / 0.3)
    return (lst_stress * 0.35) + (ndvi_stress * 0.25) + (soil_stress * 0.25) + (rain_stress * 0.15)


def _effective_cost(point: GeoPoint, compliance_weight: float) -> float:
    penalty_factor = 1.0 + (1.0 - point.compliance_penalty) * (compliance_weight - 1.0)
    return max(point.cost * penalty_factor, 1.0)


def _zone_label(point: GeoPoint) -> str:
    return point.zone_name or f"{point.lat:.4f},{point.lon:.4f}"


def _knapsack(
    budget: int,
    geo_data: list[GeoPoint],
    compliance_weight: float,
    drought_mode: bool = False,
) -> tuple[list[GeoPoint], int]:
    def sort_key(p: GeoPoint) -> float:
        score = _drought_score(p) if drought_mode else _classic_score(p)
        return score / max(_effective_cost(p, compliance_weight), 1.0)

    ranked = sorted(geo_data, key=sort_key, reverse=True)

    selected: list[GeoPoint] = []
    remaining = budget
    for point in ranked:
        if point.cost <= remaining:
            if drought_mode:
                ds = _drought_score(point)
                soil = point.soil_moisture or 3.0
                tier = "High" if ds > 0.6 else "Medium" if ds > 0.35 else "Low"
                reason = (
                    f"{_zone_label(point)} — Drought risk {tier} "
                    f"(score {ds:.2f}), LST {point.lst}°C, Soil {soil:.1f}%, NDVI {point.ndvi}"
                )
            else:
                reason = (
                    f"{_zone_label(point)} — Heat {point.lst}°C, NDVI {point.ndvi:.2f}, "
                    f"compliance {point.compliance_penalty:.2f}"
                )
            selected.append(point.model_copy(update={"reason": reason}))
            remaining -= point.cost
    return selected, budget - remaining


def optimize(budget: int, geo_data: list[GeoPoint], drought_mode: bool = False) -> tuple[list[GeoPoint], int]:
    return _knapsack(budget, geo_data, W_COMPLIANCE_NORMAL, drought_mode)


def optimize_with_compliance(
    budget: int,
    geo_data: list[GeoPoint],
    is_gst_amnesty_quarter: bool,
    drought_mode: bool = False,
) -> tuple[list[GeoPoint], int]:
    compliance_weight = W_COMPLIANCE_AMNESTY if is_gst_amnesty_quarter else W_COMPLIANCE_NORMAL
    return _knapsack(budget, geo_data, compliance_weight, drought_mode)


def suggest_alternatives(
    requested_tree: str,
    selected_location: str | None,
    geo_data: list[GeoPoint],
    limit: int = 5,
    drought_mode: bool = False,
) -> tuple[list[dict], list[str], list[str]]:
    grouped: dict[str, list[GeoPoint]] = defaultdict(list)
    for point in geo_data:
        grouped[_zone_label(point)].append(point)

    records = []
    normalized_tree = requested_tree.strip().lower()
    for zone_name, points in grouped.items():
        avg_lst = sum(p.lst for p in points) / len(points)
        avg_ndvi = sum(p.ndvi for p in points) / len(points)
        avg_compliance = sum(p.compliance_penalty for p in points) / len(points)
        avg_lat = sum(p.lat for p in points) / len(points)
        avg_lon = sum(p.lon for p in points) / len(points)
        avg_drought = sum(_drought_score(p) for p in points) / len(points)
        available = recommend_species(zone_name, avg_lst, avg_ndvi)
        available_lc = {species.lower() for species in available}
        has_tree = normalized_tree in available_lc or requested_tree.lower() == "native"
        score = (avg_drought * 50 if drought_mode else avg_lst * 0.7 - avg_ndvi * 0.3) + (avg_compliance * 10) + (8 if has_tree else 0)

        records.append(
            {
                "zone_name": zone_name,
                "city": points[0].city or "Pune",
                "state": points[0].state or "Maharashtra",
                "score": round(score, 2),
                "reason": (
                    f"{zone_name} supports {requested_tree} and has strong heat-mitigation potential."
                    if has_tree
                    else f"{requested_tree} is weak-fit here. Better for fallback species {', '.join(available[:2])}."
                ),
                "lat": round(avg_lat, 6),
                "lon": round(avg_lon, 6),
                "ndvi": round(avg_ndvi, 4),
                "compliance_score": round(avg_compliance, 2),
                "supports_requested_tree": has_tree,
                "available_species": available,
                "avg_lst": round(avg_lst, 2),
                "drought_score": round(avg_drought, 3),
            }
        )

    records.sort(key=lambda item: item["score"], reverse=True)

    selected_record = None
    if selected_location:
        for record in records:
            if record["zone_name"].lower() == selected_location.lower():
                selected_record = record
                break

    drought_insights = [
        "Prioritize Neem, Arjun, Karanj, and Moringa in high-heat micro-zones.",
        "Schedule pit mulching and drip irrigation during the first 6-8 weeks to improve survival.",
        "Cluster plantation near low-NDVI corridors for faster shade-linked cooling impact.",
        "Khejri and Rohida are viable for zones with soil moisture below 2.5% and rainfall under 600mm.",
        "Avoid mono-species planting in drought-stressed zones — mixed native species improve resilience.",
    ]
    fallback = fallback_species(selected_location or "default")

    if selected_record and not selected_record["supports_requested_tree"]:
        drought_insights.insert(
            0,
            f"{requested_tree} is not ideal for {selected_record['zone_name']}; switching to drought-hardy native species is recommended.",
        )

    alternatives = [
        {
            "zone_name": item["zone_name"],
            "city": item["city"],
            "state": item.get("state", "Maharashtra"),
            "score": item["score"],
            "reason": item["reason"],
            "lat": item["lat"],
            "lon": item["lon"],
            "ndvi": item["ndvi"],
            "compliance_score": item["compliance_score"],
        }
        for item in records
        if not selected_location or item["zone_name"].lower() != selected_location.lower()
    ][:limit]

    return alternatives, drought_insights, fallback


def compute_impact_vs_city(selected: list[GeoPoint], geo_data: list[GeoPoint]) -> list[dict]:
    grouped_total: dict[str, list[GeoPoint]] = defaultdict(list)
    grouped_selected: dict[str, list[GeoPoint]] = defaultdict(list)
    for point in geo_data:
        grouped_total[point.city or "Pune"].append(point)
    for point in selected:
        grouped_selected[point.city or "Pune"].append(point)

    impact_rows = []
    for city, all_points in grouped_total.items():
        total_score = sum(_classic_score(p) for p in all_points) or 1.0
        selected_score = sum(_classic_score(p) for p in grouped_selected.get(city, []))
        impact_percent = max(0.0, min(100.0, (selected_score / total_score) * 100))
        impact_rows.append(
            {
                "city": city,
                "impact_percent": round(impact_percent, 2),
                "selected_zones": len(grouped_selected.get(city, [])),
                "total_zones": len(all_points),
            }
        )
    impact_rows.sort(key=lambda row: row["impact_percent"], reverse=True)
    return impact_rows