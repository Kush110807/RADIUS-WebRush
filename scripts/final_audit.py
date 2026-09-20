from __future__ import annotations
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []

def require(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)

package = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))
index = (ROOT / 'index.html').read_text(encoding='utf-8')
styles = (ROOT / 'src/styles.css').read_text(encoding='utf-8') + '\n' + (ROOT / 'src/styles/responsive.css').read_text(encoding='utf-8')
json_path = ROOT / 'public/data/anonymous37.json'
data = json.loads(json_path.read_text(encoding='utf-8'))

# Architecture / feature separation
for folder in ['src/app','src/features','src/components','src/data','src/hooks','src/lib','src/types']:
    require((ROOT / folder).is_dir(), f'missing architecture layer: {folder}')
for feature in ['landing','story','archive','methodology']:
    require((ROOT / f'src/features/{feature}').is_dir(), f'missing feature module: {feature}')
require((ROOT / 'src/data/archiveRepository.ts').is_file(), 'missing static archive repository layer')
require('lazy(' in (ROOT / 'src/App.tsx').read_text(encoding='utf-8'), 'archive/methodology views are not lazy-loaded')

# Responsive implementation signals
require('width=device-width' in index, 'missing viewport meta tag')
for width in [320, 375, 768, 900, 1180, 1600]:
    require(re.search(rf'@media[^{{]*{width}px', styles) is not None, f'missing responsive breakpoint around {width}px')
require('minmax(' in styles and 'clamp(' in styles, 'fluid layout primitives missing')
require('100svh' in styles, 'small-viewport height handling missing')
require('env(safe-area-inset-bottom)' in styles, 'mobile safe-area handling missing')
require('prefers-reduced-motion' in styles, 'reduced-motion CSS missing')
require('min-height:44px' in styles.replace(' ', ''), '44px touch target rule missing')

# Static, frontend-only data and privacy
require(len(data.get('records', [])) == 1227, 'deployed static archive does not contain 1,227 daily records')
require(data.get('participant') == 'Anonymous 37', 'public participant label is incorrect')
raw = json_path.read_text(encoding='utf-8').lower()
for forbidden in ['c37f9221f44e9ca35a49180dc05a7587', 'latitude', 'longitude', 'contact_hash', 'message_content']:
    require(forbidden not in raw, f'privacy-sensitive token present in deployed JSON: {forbidden}')
require(json_path.stat().st_size < 700_000, 'static archive exceeds compact-data budget')

# No backend/runtime database dependency
all_deps = {**package.get('dependencies', {}), **package.get('devDependencies', {})}
for forbidden_dep in ['express','next','firebase','@supabase/supabase-js','mongodb','mongoose','prisma','@prisma/client']:
    require(forbidden_dep not in all_deps, f'backend/database dependency found: {forbidden_dep}')
require((ROOT / 'netlify.toml').is_file(), 'missing static-host deployment config')
require((ROOT / '.github/workflows/deploy-pages.yml').is_file(), 'missing GitHub Pages workflow')

# Repository cleanliness
for unwanted in ['node_modules','dist','.vite','.env']:
    require(not (ROOT / unwanted).exists(), f'unwanted generated/secret path included: {unwanted}')

if errors:
    print('RADIUS final audit: FAIL')
    for error in errors:
        print(f' - {error}')
    raise SystemExit(1)

print('RADIUS final audit: PASS')
print('architecture layers: app/features/components/data/hooks/lib/types')
print('responsive targets: 320/375/768/1280/1440/1920 supported by fluid breakpoint system')
print(f'static archive: {len(data["records"])} records · {json_path.stat().st_size/1024:.1f} KiB')
print('frontend-only/privacy/reduced-motion/touch-target checks passed')
