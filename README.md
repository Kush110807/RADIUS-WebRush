# RADIUS

**The year a life folded inward.** RADIUS is a frontend-only interactive data story that turns four years of one anonymous student’s digital traces into a living visual archive of contraction, adaptation, and reopening.

> **Opening question:** How far can a life shrink?

## Why this exists

The WebRush challenge **“Your Life, In Receipts”** asks for more than a chronological dump of personal data. RADIUS moves through the chain **raw data → insights → connections → story** by linking daily sensing and survey records into an explorable “living radius.” The experience shows what changed in the records while deliberately avoiding claims about private events, diagnoses, or causation.

The deployed application is **frontend-only**. It uses a compact, privacy-preserving static JSON file prepared offline from the source archive and fetched as a cacheable public asset so the evidence does not inflate the initial JavaScript bundle. There is no backend, database, authentication layer, server-side processing, or raw 2.76 GB dataset in the deployed project.

## Core interaction

The centre of Story Mode is a responsive SVG **living radius**. Dragging the timeline changes the current comparison ring, narrative observation, evidence differences, and receipt context together. The fixed dashed ring is the Before benchmark; the selected-day ring shows change relative to it.

The score is a visual storytelling device built from four daily mobility signals:

```text
radiusScore =
  0.35 × normalisedDistance
+ 0.25 × normalisedPlaces
+ 0.20 × normalisedMovementOnFoot
+ 0.20 × normalisedTimeAwayFromHome
```

Each input is clipped to the participant’s 5th–95th percentile range before being normalised to 0–1. When one input is missing, the available weights are re-normalised rather than treating the missing value as zero. The score is **not scientific, medical, or clinical**.

## Story chapters

| Chapter | Period | Story role |
| --- | --- | --- |
| **Before** | Start of records → 29 Feb 2020 | Reference routine with a broader recorded physical world |
| **Collapse** | 1 Mar → 31 May 2020 | Home time rises while movement and visited places fall sharply |
| **Adaptation** | 1 Jun 2020 → 31 May 2021 | A different routine forms inside a smaller physical world |
| **Reopening** | 1 Jun 2021 → final record | Movement and number of places expand again |

Verified chapter medians used by the story include:

| Signal | Before Mar 2020 | First lockdown | 2021–22 |
| --- | ---: | ---: | ---: |
| Time at home | 11.81 h | 15.71 h | 11.26 h |
| Distance travelled | 4.73 km | 1.21 km | 5.88 km |
| Places visited | 4 | 1 | 4 |
| Detected movement on foot | 59.11 min | 5.08 min | 56.27 min |
| Model-estimated sleep | 7.50 h | 7.00 h | 6.75 h |
| Phone unlocks | 97 | 42 | 83 |
| Self-reported stress | 2/5 | 3/5 | 2/5 |

These are descriptive observations. RADIUS does not claim that lockdown medically or psychologically caused any outcome.

## Features

- Warm editorial landing screen with a clear Before → First Lockdown radius comparison
- Guided **Story Mode** with four keyboard-accessible chapters
- Custom responsive SVG living-radius visual with a fixed Before reference ring and selected-day comparison ring
- Accessible timeline scrubber with mouse, touch, arrow-key, Home/End support from the native range control, a March 2020 disruption marker, and record-density marks
- Five evidence threads: **Movement, Connection, Rest, Attention, Emotion**
- Current-day narrative, chapter comparison, and supporting receipt stack
- Qualified device-detected conversation evidence in the Connection thread; no audio content is included
- Evidence drawer on desktop and bottom-sheet treatment on mobile
- **Archive Mode** with date/year/chapter/metric search, thread filtering, chapter filtering, chronological or unusual-change sorting, result counts, no-results state, and detailed daily evidence
- Methodology and interpretation-limits view
- Responsive layouts for phone, tablet, and desktop
- Reduced-motion support and visible keyboard focus
- Screen-reader summary for the SVG visual and live date announcement
- Lazy-loaded Archive and Methodology views

## Technology

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- Motion for React
- Lucide React
- Custom SVG visualisation
- Locally bundled Newsreader Variable and Manrope Variable font packages

No charting library or state-management framework is used.

## Dataset and citation

Source dataset: **College Experience Study dataset** by Subigya Nepal and collaborators.

- Kaggle: https://www.kaggle.com/datasets/subigyanepal/college-experience-dataset
- Published study: https://doi.org/10.1145/3643501
- Dataset licence: **CC BY-NC-SA 4.0**

RADIUS uses participant `c37f9221f44e9ca35a49180dc05a7587` only during offline preparation. The interface and deployed JSON expose the participant solely as **Anonymous 37**; the internal hash is not exported in daily records or shown in the UI.

## Selected-participant verification

The preparation step verifies, among other things:

- 1,227 daily sensing rows from 25 Sep 2018 to 15 Jun 2022
- 1,226 days with at least one location-derived field available
- 417 participant general-EMA response rows in the extracted source; 416 stress values align to the deployed sensing-day archive
- 417 participant general-EMA response rows for the social field; 416 social-level values align to the deployed sensing-day archive
- 295 COVID EMA rows, of which 96 contain at least one non-null COVID answer field
- 68,953 raw background-application observations; 68,728 align to the deployed sensing days
- 4,884 raw call records
- 25,881 raw SMS metadata records
- raw unlock history for cross-checking

Raw message contents, contact hashes, coordinates, and unnecessary demographic attributes are not exported.

## Data preparation

The original archive is used **only at build/preparation time**. Run:

```bash
python scripts/prepare_data.py "/path/to/archive.zip" public/data/anonymous37.json
python scripts/verify_data.py
```

The script reads participant-specific rows from:

```text
Sensing/sensing.csv
EMA/general_ema.csv
EMA/covid_ema.csv
Raw Sensing/call_log/calllog.csv
Raw Sensing/sms_log/smslog.csv
Raw Sensing/running_apps/<participant>.csv
Raw Sensing/unlock/<participant>.csv
```

It converts raw sensing units into display-ready daily values, aggregates only what the interface needs, calculates chapter medians from the highest-precision source values, computes the living-radius score, and writes `public/data/anonymous37.json` (about 558 KiB). The browser fetches this static file through `archiveRepository.ts`; the source ZIP is never loaded at runtime.

Missing values remain `null`. They are never silently converted to zero.

### Important field language

- **model-estimated sleep**, not measured sleep
- **self-reported stress**, not diagnosed stress
- **background applications observed**, not app usage time
- **detected conversation**, not verified speech content or relationship quality
- changes are **associated with the period**, not claimed to be caused by lockdown

## Accessibility decisions

- Semantic main, nav, section, aside, figure, dialog, and native form controls
- Skip link and logical heading hierarchy
- Keyboard-accessible chapter and thread controls
- Native range input for robust keyboard and touch timeline interaction
- Visible focus rings
- 44 px touch targets on compact/mobile controls where interaction density is highest
- SVG `<title>` / `<desc>` plus an equivalent textual story panel
- Focus-trapped evidence dialog with Escape-to-close and focus restoration
- No required hover-only interactions
- Chapter and evidence meaning is communicated with text as well as colour
- `prefers-reduced-motion` disables non-essential movement and shortens transitions

## Performance decisions

- Static daily aggregates instead of the complete raw archive
- ~558 KiB compact JSON instead of 2.76 GB source data
- The compact JSON is a separate cacheable static asset, so it is not bundled into the initial JavaScript chunk
- Archive and Methodology feature views are lazy-loaded
- No raster hero imagery, 3D, WebGL, map tiles, or particle system
- Custom SVG instead of a charting dependency
- Derived timeline/trail/search values are memoised where useful
- Archive rendering is capped to the first 180 matching daily cards until filters narrow the result
- Variable fonts are bundled through npm rather than loaded from a third-party font CDN

## Local setup

Requirements: **Node.js 22.12+** and npm.

```bash
npm install
npm run verify:data
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run validate:data
npm run verify:data
npm run preflight
npm run lint
npm run final:audit
npm run typecheck
npm run build
npm run preview
```

Vite outputs the production site to `dist/`.

## Deployment

### Netlify

This repository includes `netlify.toml`.

1. Push the project to GitHub.
2. In Netlify choose **Add new site → Import an existing project**.
3. Select the repository.
4. Build command: `npm run build`.
5. Publish directory: `dist`.
6. Deploy.

No environment variables are required.

### GitHub Pages

A workflow is included at `.github/workflows/deploy-pages.yml`.

1. Push the repository’s `main` branch to GitHub.
2. Open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Run or re-run the **Deploy RADIUS to GitHub Pages** workflow.

The workflow builds with a repository-specific Vite base path and publishes `dist/`.

## Architecture

RADIUS uses a small feature-based frontend architecture rather than placing routing, data loading, story state, and view composition inside one component:

```text
main.tsx
  ↓
App.tsx                    composition + lazy feature boundaries
  ↓
app/                       shell, hash navigation, archive loading state
  ↓
features/                  landing, story, archive, methodology
  ↓
components/                reusable visual and interaction primitives
  ↓
data/archiveRepository.ts  static-data access + runtime shape guard + cache
  ↓
public/data/anonymous37.json
```

Story-specific state (timeline index, selected evidence thread, evidence drawer) is owned by `StoryView`. Archive search/filter state remains inside the Archive feature. Shared presentation components do not own application navigation. This keeps data access, feature state, navigation, and rendering responsibilities separate without introducing a state-management framework.

## Responsive design strategy

The interface is designed around content-driven breakpoints rather than device names. The final CSS explicitly covers the evaluation widths and reflows rather than shrinking the desktop layout:

| Width | Behaviour |
| --- | --- |
| **1920 px** | centred max-width editorial composition; radius remains dominant |
| **1440 / 1280 px** | three-column story with fluid column minimums |
| **768 px** | one-column visual flow; chapter controls become a 2×2 grid; observation content stacks |
| **375 px** | compact two-column chapter controls, one-column receipts/archive, mobile bottom sheet |
| **320 px** | secondary metadata simplifies; controls stay within viewport; no page-level horizontal scrolling |

Thread chips intentionally remain horizontally scrollable on small screens because they are a peer filter set; the page itself does not rely on horizontal scrolling. Interactive controls use 44 px minimum touch targets for coarse pointers.

## Verification checklist

For the final post-evaluation repair matrix and QA notes, see [`AUDIT.md`](./AUDIT.md).


Before deployment, run:

```bash
npm run check
```

That command validates the processed dataset, verifies the benchmark medians, runs repository/privacy preflight checks, performs dependency-free submission linting and the final architecture/responsive audit, runs TypeScript validation, and creates the production Vite build. After building, `npm run preview` should be checked at 320, 375, 768, 1280, 1440, and 1920 px.

Manual interaction checks cover: landing CTA, chapter selection, timeline mouse/touch/keyboard control, thread filters, archive search/filter/sort, evidence-dialog focus trapping and dismissal, reduced motion, direct hash routes, page refresh, empty results, loading/error states, and absence of horizontal page overflow.

## Repository structure

```text
public/
└── data/
    └── anonymous37.json       # optimised deployed evidence asset
src/
├── app/
│   ├── AppShell.tsx
│   ├── useArchiveData.ts
│   └── useHashView.ts
├── features/
│   ├── landing/LandingView.tsx
│   ├── story/StoryView.tsx
│   ├── archive/ArchiveView.tsx
│   └── methodology/MethodologyView.tsx
├── components/
│   ├── ArchiveExplorer.tsx
│   ├── ChapterNavigator.tsx
│   ├── CurrentObservation.tsx
│   ├── EvidenceDrawer.tsx
│   ├── LivingRadius.tsx
│   ├── Methodology.tsx
│   ├── ReceiptCard.tsx
│   ├── ThreadSelector.tsx
│   └── TimeScrubber.tsx
├── data/
│   ├── archiveRepository.ts
│   └── chapters.ts
├── hooks/
├── lib/
├── styles/
│   └── responsive.css
├── types/
├── App.tsx
├── main.tsx
└── styles.css
scripts/
├── lint.py
├── prepare_data.py
├── preflight.py
├── validate_data.py
└── verify_data.py
```

## Data limitations

This is one anonymous participant, not a population-level result. Sensing coverage varies by field and day. Survey measures exist only on response days. Phone sensing can describe recorded behavioural patterns but cannot reveal intent, meaning, relationships, private events, or clinical state. The living radius intentionally summarises mobility signals for storytelling and should not be reused as a validated behavioural index.
