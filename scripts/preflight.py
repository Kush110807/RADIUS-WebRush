#!/usr/bin/env python3
"""Repository-level preflight checks that require only the Python standard library."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "anonymous37.json"
INTERNAL_UID = "c37f9221f44e9ca35a49180dc05a7587"

payload = json.loads(DATA.read_text(encoding="utf-8"))
records = payload["records"]

required_components = {
    "LivingRadius.tsx",
    "ChapterNavigator.tsx",
    "TimeScrubber.tsx",
    "ThreadSelector.tsx",
    "ReceiptCard.tsx",
    "CurrentObservation.tsx",
    "EvidenceDrawer.tsx",
    "ArchiveExplorer.tsx",
    "Methodology.tsx",
}
actual_components = {path.name for path in (ROOT / "src" / "components").glob("*.tsx")}
assert required_components <= actual_components, required_components - actual_components

assert payload["participant"] == "Anonymous 37"
assert len(records) == 1227
assert len({record["date"] for record in records}) == len(records)
assert records[0]["date"] == "2018-09-25"
assert records[-1]["date"] == "2022-06-15"

for record in records:
    assert "lat" not in record and "lon" not in record and "longitude" not in record and "latitude" not in record
    assert record["chapter"] in {"before", "collapse", "adaptation", "reopening"}
    assert record["radiusScore"] is None or 0 <= record["radiusScore"] <= 100

json_text = DATA.read_text(encoding="utf-8")
assert INTERNAL_UID not in json_text
assert "message_content" not in json_text.lower()
assert "contact_hash" not in json_text.lower()

# Missing app coverage must remain missing rather than becoming a synthetic zero.
assert any(record["backgroundAppsObserved"] is None for record in records)
assert sum((record["backgroundAppsObserved"] or 0) for record in records) == payload["verification"]["deployedBackgroundApplicationObservations"]
assert payload["verification"]["deployedBackgroundApplicationObservations"] < payload["verification"]["backgroundApplicationObservations"]

# Chapter boundaries are deterministic and match the challenge brief.
def chapter(date: str) -> str:
    if date <= "2020-02-29":
        return "before"
    if date <= "2020-05-31":
        return "collapse"
    if date <= "2021-05-31":
        return "adaptation"
    return "reopening"

assert all(record["chapter"] == chapter(record["date"]) for record in records)

# Static-deployment configuration exists and points to the Vite output directory.
netlify = (ROOT / "netlify.toml").read_text(encoding="utf-8")
assert 'command = "npm run build"' in netlify
assert 'publish = "dist"' in netlify
assert (ROOT / ".github" / "workflows" / "deploy-pages.yml").exists()

print("RADIUS repository preflight: PASS")
print(f"{len(records)} records · {len(actual_components)} components · privacy checks passed")
