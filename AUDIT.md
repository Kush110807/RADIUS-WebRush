# RADIUS — Final Submission Audit

This document records the final repair pass performed after the first FAIE/FQE evaluation. The repair preserves the RADIUS concept and verified Anonymous 37 dataset while directly targeting responsive-design, architecture, performance, and documentation quality.

## Repair focus

- Reorganised application composition into `app/`, `features/`, reusable `components/`, `data/`, `hooks/`, `lib/`, and `types/` layers.
- Moved the 1,227-day processed archive out of the JavaScript bundle to `public/data/anonymous37.json` and added a small cached repository loader with runtime shape checks.
- Added explicit loading and fetch-error states.
- Lazy-loaded Archive and Methodology feature views.
- Hardened responsive reflow for 320, 375, 768, 1280, 1440, and 1920 px.
- Replaced mobile chapter horizontal scrolling with a 2×2 grid; only peer thread filters intentionally scroll horizontally on narrow screens.
- Added ultrawide max-widths, compact-desktop column minimums, tablet stacking, phone bottom-sheet evidence, and 44 px coarse-pointer targets.
- Preserved reduced-motion, focus, semantic controls, dialog trapping, native range keyboard/touch behaviour, and screen-reader summaries.

## Data integrity

Automated checks validate:

- 1,227 daily sensing records.
- Participant displayed only as `Anonymous 37`.
- Internal participant hash absent from deployed JSON.
- Missing values remain `null`, never synthetic zeroes.
- Benchmark chapter medians match the verified source extraction.
- No coordinates, contact hashes, message contents, or unnecessary demographic attributes are deployed.

The living-radius score remains a transparent storytelling device, not a scientific or clinical score.

## Responsive verification matrix

| Width | Expected layout |
| ---: | --- |
| 1920 px | Centred max-width three-column editorial story; dominant radius |
| 1440 px | Three-column story with fluid columns |
| 1280 px | Compact three-column story without overlap |
| 768 px | Single-column visual flow; 2×2 chapter grid; stacked evidence |
| 375 px | Two-column chapter grid; one-column receipts/archive; bottom-sheet evidence |
| 320 px | Simplified metadata and controls kept inside viewport |

Page-level horizontal scrolling is not part of the layout. Evidence-thread chips intentionally use contained horizontal scrolling on narrow touch screens because they are a peer filter group.

## Interaction checklist

- Landing CTA enters Story Mode.
- Chapter controls select the first available day of each chapter.
- Timeline uses a native range input for mouse, touch, arrow keys, Home, and End.
- Thread selection updates visual emphasis and supporting evidence.
- Evidence dialog opens, traps focus, closes with Escape/backdrop/close control, and restores focus.
- Archive search recognises dates, years, chapters, evidence categories, and common metric names.
- Chapter/thread filters and chronological/unusual-change sorting are implemented.
- Empty results expose a clear reset action.
- Hash routes support `#story`, `#archive`, and `#methodology`; refresh remains frontend-only and static-host safe.
- Reduced-motion mode removes non-essential motion while preserving state changes.

## Automated repository checks

Run:

```bash
npm run validate:data
npm run verify:data
npm run preflight
npm run lint
npm run final:audit
npm run typecheck
npm run build
```

The five dependency-free checks (`validate:data`, `verify:data`, `preflight`, `lint`, `final:audit`) pass in the final working tree. TypeScript and Vite production build require installed npm dependencies.

## Frontend-only compliance

- No backend server.
- No database.
- No authentication.
- No server-side processing.
- No runtime parsing of the original source ZIP.
- The browser fetches one preprocessed static JSON asset.

## Final repair verification

The final repaired tree passes data validation, source-data verification, privacy/repository preflight, submission lint, the architecture/responsive final audit, and an internal TypeScript structural compile using the system TypeScript compiler with temporary external-package shims. No internal TypeScript errors were found.

## Known verification limitation of the packaging environment

The final packaging container could not reach the npm registry, so dependencies could not be installed there and a fresh dependency-aware `tsc`/Vite build could not be rerun inside that container. The GitHub Actions workflow performs dependency installation, data checks, TypeScript validation, and the production build before deployment. A green Pages workflow is therefore the authoritative dependency-aware build verification.
