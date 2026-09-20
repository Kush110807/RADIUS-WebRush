#!/usr/bin/env python3
"""Fast integrity checks for the deployed Anonymous 37 JSON.

Uses only the Python standard library so it can run without the source archive.
"""
from __future__ import annotations
import json
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "src" / "data" / "anonymous37.json"
payload = json.loads(DATA.read_text(encoding="utf-8"))
records = payload["records"]

assert payload["participant"] == "Anonymous 37"
assert payload["range"] == {"start": "2018-09-25", "end": "2022-06-15", "days": 1227}
assert len(records) == 1227
assert len({r["date"] for r in records}) == 1227
assert all(records[i]["date"] < records[i + 1]["date"] for i in range(len(records) - 1))
assert not any("c37f9221f44e9ca35a49180dc05a7587" in json.dumps(r) for r in records)

expected = {
    "before": {"homeHours": 11.81, "distanceKm": 4.73, "placesVisited": 4.0, "movementMinutes": 59.11, "sleepHours": 7.5, "unlocks": 97.0, "stress": 2.0},
    "collapse": {"homeHours": 15.71, "distanceKm": 1.21, "placesVisited": 1.0, "movementMinutes": 5.08, "sleepHours": 7.0, "unlocks": 42.0, "stress": 3.0},
    "reopening": {"homeHours": 11.26, "distanceKm": 5.88, "placesVisited": 4.0, "movementMinutes": 56.27, "sleepHours": 6.75, "unlocks": 83.0, "stress": 2.0},
}
for chapter, values in expected.items():
    for key, value in values.items():
        actual = payload["chapterMedians"][chapter][key]
        assert actual == value, f"{chapter}.{key}: expected {value}, got {actual}"

verification = payload["verification"]
for key, value in {
    "generalStressResponses": 417,
    "generalSocialResponses": 417,
    "covidSpecificResponses": 295,
    "locationCoverageDays": 1226,
    "rawCallRecords": 4884,
    "rawSmsRecords": 25881,
    "backgroundApplicationObservations": 68953,
}.items():
    assert verification[key] == value, f"{key}: expected {value}, got {verification[key]}"

assert all(r.get("backgroundAppsObserved") is None or r["backgroundAppsObserved"] >= 0 for r in records)
assert all(r.get("radiusScore") is None or 0 <= r["radiusScore"] <= 100 for r in records)
print("RADIUS data verification: PASS")
print(f"{len(records)} daily records · {DATA.stat().st_size / 1024:.1f} KiB static JSON")
