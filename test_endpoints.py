import urllib.request
import json
import sys

BASE = "http://127.0.0.1:8000"


def post(path: str, payload: dict) -> dict:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def test_parse_intent():
    r = post("/parse-intent", {"query": "Plant oak trees for heat reduction with a budget of 20k"})
    print("parse-intent:", r)

    assert r["budget"] == 20000, f"Expected 20000 got {r['budget']}"
    assert r["tree_type"] == "oak", f"Expected oak got {r['tree_type']}"
    assert r["priority"] == "heat_reduction", f"Expected heat_reduction got {r['priority']}"

    # default fallback
    r2 = post("/parse-intent", {"query": "plant some trees"})
    print("parse-intent (defaults):", r2)

    assert r2["budget"] == 50000
    assert r2["tree_type"] == "native"
    assert r2["priority"] == "heat_reduction"


def test_optimize():
    geo = [
        {"lat": 1.0, "lon": 1.0, "ndvi": 0.4, "lst": 35.0, "cost": 5000},
        {"lat": 2.0, "lon": 2.0, "ndvi": 0.2, "lst": 40.0, "cost": 8000},
        {"lat": 3.0, "lon": 3.0, "ndvi": 0.6, "lst": 32.0, "cost": 3000},
        {"lat": 4.0, "lon": 4.0, "ndvi": 0.1, "lst": 38.0, "cost": 12000},
    ]

    r = post("/optimize", {"budget": 15000, "geo_data": geo})
    print("optimize:", r)

    assert r["total_cost"] <= 15000, f"Over budget: {r['total_cost']}"
    assert isinstance(r["selected"], list)
    assert len(r["selected"]) > 0, "Should select at least one point"

    # verify greedy score/cost ordering
    def ratio(p):
        return ((p["lst"] * 0.7) - (p["ndvi"] * 0.3)) / p["cost"]

    selected_ratios = [ratio(p) for p in r["selected"]]
    assert selected_ratios == sorted(selected_ratios, reverse=True), "Not sorted by score/cost ratio"

    # verify reason field exists
    for p in r["selected"]:
        assert "reason" in p and p["reason"] is not None

    # zero-budget edge case
    r_zero = post("/optimize", {"budget": 0, "geo_data": geo})
    assert r_zero["selected"] == []
    assert r_zero["total_cost"] == 0

    return r["selected"]


def test_esg(selected: list):
    r = post("/esg-report", {"selected": selected})
    print("esg-report:", r)

    n = len(selected)
    expected_trees = n * 100

    assert r["trees_planted"] == expected_trees
    assert r["carbon_10yr"] == round(expected_trees * 21.77, 2)
    assert r["temp_reduction"] == round(expected_trees * 0.02, 3)

    # empty input
    r_empty = post("/esg-report", {"selected": []})
    assert r_empty["trees_planted"] == 0
    assert r_empty["carbon_10yr"] == 0.0
    assert r_empty["temp_reduction"] == 0.0


if __name__ == "__main__":
    try:
        test_parse_intent()
        selected = test_optimize()
        test_esg(selected)
        print("\nALL TESTS PASSED")
    except AssertionError as e:
        print(f"\nFAILED: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"\nERROR: {e}", file=sys.stderr)
        sys.exit(1)
