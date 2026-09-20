#!/usr/bin/env python3
"""Fast integrity checks for the deployed Anonymous 37 JSON."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "anonymous37.json"
RAW_UID = "c37f9221f44e9ca35a49180dc05a7587"

with DATA.open(encoding="utf-8") as f:
    d = json.load(f)

assert d["participant"] == "Anonymous 37"
assert d["range"] == {"start":"2018-09-25","end":"2022-06-15","days":1227}
assert len(d["records"]) == 1227
assert RAW_UID not in DATA.read_text(encoding="utf-8"), "Internal UID leaked into deployed JSON"
assert sum((r["backgroundAppsObserved"] or 0) for r in d["records"]) <= d["verification"]["backgroundApplicationObservations"]
assert d["verification"]["backgroundApplicationObservations"] == 68953
assert d["verification"]["rawCallRecords"] == 4884
assert d["verification"]["rawSmsRecords"] == 25881
assert d["verification"]["generalStressResponses"] == 417
assert d["verification"]["generalSocialResponses"] == 417
assert d["verification"]["covidSpecificResponses"] == 295

expected = {
    "before": {"homeHours":11.81,"distanceKm":4.73,"placesVisited":4.0,"movementMinutes":59.11,"sleepHours":7.5,"unlocks":97.0,"stress":2.0},
    "collapse": {"homeHours":15.71,"distanceKm":1.21,"placesVisited":1.0,"movementMinutes":5.08,"sleepHours":7.0,"unlocks":42.0,"stress":3.0},
    "reopening": {"homeHours":11.26,"distanceKm":5.88,"placesVisited":4.0,"movementMinutes":56.27,"sleepHours":6.75,"unlocks":83.0,"stress":2.0},
}
for chapter, metrics in expected.items():
    for key, value in metrics.items():
        actual = d["chapterMedians"][chapter][key]
        assert abs(actual-value) < 0.011, f"{chapter}.{key}: {actual} != {value}"

assert d["normalisation"]["baselineRadiusScore"] == d["chapterMedians"]["before"]["radiusScore"]
assert any(r["backgroundAppsObserved"] is None for r in d["records"]), "Missing app coverage must remain null"
print("RADIUS data validation: PASS")
