import re


_TREE_KEYWORDS: dict[str, str] = {
    "oak": "oak",
    "pine": "pine",
    "maple": "maple",
    "neem": "neem",
    "banyan": "banyan",
    "palm": "palm",
}

_PRIORITY_KEYWORDS: dict[str, str] = {
    "heat": "heat_reduction",
    "temperature": "heat_reduction",
    "carbon": "carbon_sequestration",
    "co2": "carbon_sequestration",
    "shade": "shade_coverage",
    "canopy": "shade_coverage",
    "green": "biodiversity",
    "biodiversity": "biodiversity",
}


def parse_intent(query: str) -> dict:
    lower = query.lower()

    budget = 50000
    match = re.search(r"[₹$]?(\d[\d,]*)\s*(k)?\b", lower)
    if match:
        raw = match.group(1).replace(",", "")
        value = int(raw)
        budget = value * 1000 if match.group(2) == "k" else value

    tree_type = "native"
    for kw, val in _TREE_KEYWORDS.items():
        if kw in lower:
            tree_type = val
            break

    priority = "heat_reduction"
    for kw, val in _PRIORITY_KEYWORDS.items():
        if kw in lower:
            priority = val
            break

    return {"budget": budget, "tree_type": tree_type, "priority": priority}
