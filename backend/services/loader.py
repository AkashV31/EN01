"""
Load and normalize real canopy GeoJSON/CSV data for API and map rendering.
"""

from __future__ import annotations

import csv
import json
import logging
import math
import random
from collections import defaultdict
from pathlib import Path
from typing import Any

logger = logging.getLogger("canopyroi.loader")

_DATASET_DIR = Path(__file__).parent.parent / "dataset"
_PUNE_GEOJSON = _DATASET_DIR / "Pune_canopy_data.geojson"
_KOTHRUD_GEOJSON = _DATASET_DIR / "kothrud_canopy_data.geojson"
_KOTHRUD_CSV = _DATASET_DIR / "kothrud_canopy_data.csv"

_COST_MIN, _COST_MAX = 48_000, 95_000
_MAX_POINTS = 450

_ANCHORS = [
    ("Wanowrie", "Pune", 18.5204, 73.8567),
    ("Kothrud", "Pune", 18.5080, 73.8070),
    ("Shivajinagar", "Pune", 18.5308, 73.8474),
    ("Baner", "Pune", 18.5590, 73.8070),
    ("Dhanori", "Pune", 18.4840, 73.8930),
    ("Viman Nagar", "Pune", 18.5930, 73.8990),
    ("Hadapsar", "Pune", 18.4590, 73.8890),
    ("Katraj", "Pune", 18.4960, 73.8280),
    ("Hinjewadi", "Pune", 18.5460, 73.7760),
    ("Aundh", "Pune", 18.5750, 73.8600),
    ("Koregaon Park", "Pune", 18.5120, 73.9230),
    ("Kondhwa", "Pune", 18.4730, 73.8340),
]
_DEFAULT_STATE = "Maharashtra"


def _normalise_lst(raw: float, lst_min: float, lst_max: float) -> float:
    span = lst_max - lst_min if lst_max != lst_min else 1.0
    return round(33.0 + ((raw - lst_min) / span) * 15.0, 2)


def _normalise_ndvi(raw: float, ndvi_min: float, ndvi_max: float) -> float:
    # Avoid flat-zero NDVI when raw values are mostly negative.
    span = ndvi_max - ndvi_min if ndvi_max != ndvi_min else 1.0
    return round(max(0.0, min(1.0, (raw - ndvi_min) / span)), 4)


def _normalise_coordinates(a: float, b: float) -> tuple[float, float]:
    # Handles both [lat, lon] and [lon, lat] safely.
    if abs(a) <= 90 and abs(b) > 90:
        return a, b
    if abs(b) <= 90 and abs(a) > 90:
        return b, a
    # Pune data is known to be [lat, lon].
    return a, b


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    x = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2
    )
    return 2 * r * math.asin(math.sqrt(x))


def _nearest_anchor(lat: float, lon: float) -> tuple[str, str, str]:
    best = min(_ANCHORS, key=lambda a: _haversine_km(lat, lon, a[2], a[3]))
    # City is treated as neighborhood-level city bucket for dynamic highlighting.
    return best[0], best[0], _DEFAULT_STATE


def load_zones() -> dict[str, Any]:
    for path in (_PUNE_GEOJSON, _KOTHRUD_GEOJSON):
        if path.exists():
            logger.info("Loading zones from %s", path.name)
            return _load_prithvi_geojson(path)

    if _KOTHRUD_CSV.exists():
        logger.info("Loading zones from CSV %s", _KOTHRUD_CSV.name)
        return _load_prithvi_csv(_KOTHRUD_CSV)

    logger.warning("Dataset not found. Serving synthetic fallback.")
    return _synthetic_pune_geojson()


def load_location_candidates(limit: int = 12) -> list[dict[str, Any]]:
    zones = load_zones()
    return _aggregate_location_candidates(zones, limit=limit)


def _load_prithvi_geojson(path: Path) -> dict[str, Any]:
    with open(path, encoding="utf-8") as fh:
        raw = json.load(fh)

    source_features = raw.get("features", [])
    if not source_features:
        return _synthetic_pune_geojson()

    lst_values = [
        feature.get("properties", {}).get("LST")
        for feature in source_features
        if feature.get("geometry") and feature.get("properties", {}).get("LST") is not None
    ]
    if not lst_values:
        return _synthetic_pune_geojson()
    ndvi_values = [
        feature.get("properties", {}).get("NDVI")
        for feature in source_features
        if feature.get("geometry") and feature.get("properties", {}).get("NDVI") is not None
    ]
    if not ndvi_values:
        ndvi_values = [0.0, 1.0]

    lst_min, lst_max = min(lst_values), max(lst_values)
    ndvi_min, ndvi_max = min(ndvi_values), max(ndvi_values)
    step = max(1, len(source_features) // _MAX_POINTS)
    sampled = source_features[::step][:_MAX_POINTS]

    rng = random.Random(42)
    normalized_features = []
    for feature in sampled:
        geometry = feature.get("geometry", {})
        props = feature.get("properties", {})
        if geometry.get("type") != "Point":
            continue
        coords = geometry.get("coordinates", [])
        if len(coords) < 2:
            continue

        lat, lon = _normalise_coordinates(float(coords[0]), float(coords[1]))
        zone_name, city, state = _nearest_anchor(lat, lon)
        normalized_features.append(
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [lon, lat]},
                "properties": {
                    "lst": _normalise_lst(float(props.get("LST", 0.0)), lst_min, lst_max),
                    "ndvi": _normalise_ndvi(float(props.get("NDVI", 0.0)), ndvi_min, ndvi_max),
                    "cost": rng.randint(_COST_MIN, _COST_MAX),
                    "zone_name": zone_name,
                    "city": city,
                    "state": state,
                    "compliance_penalty": round(rng.uniform(0.7, 1.0), 2),
                },
            }
        )

    logger.info("Loaded %d normalized features from %s", len(normalized_features), path.name)
    return {"type": "FeatureCollection", "features": normalized_features}


def _load_prithvi_csv(path: Path) -> dict[str, Any]:
    rows: list[dict[str, float]] = []
    with open(path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            try:
                geom = row.get("geometry", "").replace("POINT (", "").replace(")", "").strip()
                a, b = geom.split()
                lat, lon = _normalise_coordinates(float(a), float(b))
                rows.append(
                    {
                        "lat": lat,
                        "lon": lon,
                        "lst": float(row.get("LST", 0.0)),
                        "ndvi": float(row.get("NDVI", 0.0)),
                    }
                )
            except Exception:
                continue

    if not rows:
        return _synthetic_pune_geojson()

    lst_vals = [r["lst"] for r in rows]
    ndvi_vals = [r["ndvi"] for r in rows]
    lst_min, lst_max = min(lst_vals), max(lst_vals)
    ndvi_min, ndvi_max = min(ndvi_vals), max(ndvi_vals)
    rng = random.Random(42)
    step = max(1, len(rows) // _MAX_POINTS)
    sampled = rows[::step][:_MAX_POINTS]

    features = []
    for row in sampled:
        zone_name, city, state = _nearest_anchor(row["lat"], row["lon"])
        features.append(
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [row["lon"], row["lat"]]},
                "properties": {
                    "lst": _normalise_lst(row["lst"], lst_min, lst_max),
                    "ndvi": _normalise_ndvi(row["ndvi"], ndvi_min, ndvi_max),
                    "cost": rng.randint(_COST_MIN, _COST_MAX),
                    "zone_name": zone_name,
                    "city": city,
                    "state": state,
                    "compliance_penalty": round(rng.uniform(0.7, 1.0), 2),
                },
            }
        )
    return {"type": "FeatureCollection", "features": features}


def _aggregate_location_candidates(zones: dict[str, Any], limit: int = 12) -> list[dict[str, Any]]:
    grouped: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for feature in zones.get("features", []):
        props = feature.get("properties", {})
        coords = feature.get("geometry", {}).get("coordinates", [0.0, 0.0])
        key = (props.get("zone_name", "Unknown"), props.get("city", "Unknown"))
        grouped[key].append(
            {
                "lat": coords[1],
                "lon": coords[0],
                "lst": float(props.get("lst", 0.0)),
                "ndvi": float(props.get("ndvi", 0.0)),
                "compliance": float(props.get("compliance_penalty", 1.0)),
            }
        )

    candidates: list[dict[str, Any]] = []
    for (zone_name, city), points in grouped.items():
        n = len(points)
        avg_lst = sum(p["lst"] for p in points) / n
        avg_ndvi = sum(p["ndvi"] for p in points) / n
        avg_compliance = sum(p["compliance"] for p in points) / n
        avg_lat = sum(p["lat"] for p in points) / n
        avg_lon = sum(p["lon"] for p in points) / n

        impact_score = round((avg_lst * 0.6) + ((1 - avg_ndvi) * 30) + (avg_compliance * 8), 2)
        candidates.append(
            {
                "zone_name": zone_name,
                "city": city,
                "state": _DEFAULT_STATE,
                "lat": round(avg_lat, 6),
                "lon": round(avg_lon, 6),
                "ndvi": round(avg_ndvi, 4),
                "lst": round(avg_lst, 2),
                "compliance_score": round(avg_compliance, 2),
                "impact_score": impact_score,
            }
        )

    candidates.sort(key=lambda c: c["impact_score"], reverse=True)
    return candidates[:limit]


def _synthetic_pune_geojson() -> dict[str, Any]:
    zones = [
        [73.8567, 18.5204, 44.2, 0.12, 85000, "Wanowrie", 1.0],
        [73.8070, 18.5080, 41.5, 0.23, 72000, "Kothrud", 1.0],
        [73.8474, 18.5308, 38.9, 0.31, 65000, "Shivajinagar", 1.0],
        [73.8070, 18.5590, 43.1, 0.18, 91000, "Baner", 0.8],
        [73.8930, 18.4840, 46.7, 0.09, 78000, "Dhanori", 1.0],
        [73.8990, 18.5930, 37.4, 0.27, 55000, "Viman Nagar", 0.9],
        [73.8890, 18.4590, 45.3, 0.14, 68000, "Hadapsar", 1.0],
        [73.8280, 18.4960, 35.8, 0.35, 49000, "Katraj", 0.7],
        [73.7760, 18.5460, 42.6, 0.16, 88000, "Hinjewadi", 1.0],
        [73.8600, 18.5750, 39.2, 0.29, 61000, "Aundh", 0.85],
        [73.9230, 18.5120, 43.8, 0.11, 74000, "Koregaon Park", 1.0],
        [73.8340, 18.4730, 40.1, 0.22, 58000, "Kondhwa", 0.95],
    ]
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [zone[0], zone[1]]},
                "properties": {
                    "lst": zone[2],
                    "ndvi": zone[3],
                    "cost": zone[4],
                    "zone_name": zone[5],
                    "city": zone[5],
                    "state": _DEFAULT_STATE,
                    "compliance_penalty": zone[6],
                },
            }
            for zone in zones
        ],
    }
