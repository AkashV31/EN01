from schemas import GeoPoint


# teammate note:
# score = prioritize hotter areas (lst) and penalize vegetation (ndvi)
def _score(point: GeoPoint) -> float:
    return (point.lst * 0.7) - (point.ndvi * 0.3)


def optimize(budget: int, geo_data: list[GeoPoint]) -> tuple[list[GeoPoint], int]:
    ranked = sorted(
        geo_data,
        key=lambda p: _score(p) / p.cost if p.cost > 0 else 0,
        reverse=True,
    )

    selected: list[GeoPoint] = []
    remaining = budget

    for point in ranked:
        if point.cost <= remaining:
            # teammate note: adding explanation for why this point was chosen
            # Use model_copy so we don't mutate the original Pydantic object (immutable in v2)
            annotated = point.model_copy(update={"reason": f"High heat ({point.lst}) and low vegetation ({point.ndvi})"})
            selected.append(annotated)
            remaining -= point.cost

    return selected, budget - remaining
