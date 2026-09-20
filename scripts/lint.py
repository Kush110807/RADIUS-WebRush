#!/usr/bin/env python3
"""Fast dependency-free repository lint for submission hygiene."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [ROOT / "src", ROOT / "scripts"]
FORBIDDEN = ("console.log(", "debugger;", "TODO:", "FIXME:")
issues: list[str] = []

for base in TARGETS:
    for path in base.rglob("*"):
        if not path.is_file() or path.suffix not in {".ts", ".tsx", ".css", ".py"}:
            continue
        if path.name == "lint.py":
            continue
        text = path.read_text(encoding="utf-8")
        for line_no, line in enumerate(text.splitlines(), start=1):
            if line.rstrip() != line:
                issues.append(f"{path.relative_to(ROOT)}:{line_no}: trailing whitespace")
            for token in FORBIDDEN:
                if token in line:
                    issues.append(f"{path.relative_to(ROOT)}:{line_no}: forbidden submission token {token!r}")

if issues:
    print("RADIUS lint: FAIL")
    for issue in issues:
        print(f"- {issue}")
    raise SystemExit(1)

print("RADIUS lint: PASS")
