from schemas import GeoPoint

# teammate note:
# using rough environmental estimates for demo purposes
_CARBON_PER_TREE_10YR = 21.77  # kg CO2
_TEMP_REDUCTION_PER_TREE = 0.02  # °C


def generate_report(selected: list[GeoPoint]) -> dict:
    # teammate note:
    # assume each selected zone can support ~100 trees
    trees = len(selected) * 100

    return {
        "trees_planted": trees,
        "carbon_10yr": round(trees * _CARBON_PER_TREE_10YR, 2),
        "temp_reduction": round(trees * _TEMP_REDUCTION_PER_TREE, 3),
    }