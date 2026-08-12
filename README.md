# HH Goa 2026 — Frame / ID Card Generator

> **Deadline:** 11:59 PM, 13 August 2026 · **Submission:** [https://forms.gle/jM5hTaGvsrfEfixPA](https://forms.gle/jM5hTaGvsrfEfixPA)

A browser-based tool where anyone can upload a photo and instantly receive a branded **HH Goa 2026** graphic — ready to download and share on X (Twitter). No login. No signup. Zero friction.

---

## Table of Contents

- [What We're Building](#what-were-building)
- [Formats](#formats)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [User Flow](#user-flow)
- [Key Requirements](#key-requirements)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## What We're Building

A single-page web application that:

1. Accepts a photo upload (JPG, PNG, HEIC)
2. Optionally collects a name / stack / role (Format B only)
3. Composites the uploaded photo with HH Goa 2026 branding using the HTML5 Canvas API
4. Produces a downloadable image in a single pass, near-instantly
5. Provides a one-click **Share to X** flow with a pre-filled tweet containing `#FrameInGoa`

---

## Formats

| | Format A — PFP Frame | Format B — Builder ID Card |
|---|---|---|
| **Description** | Overlay/frame that wraps the photo; perfect for an X profile picture | Event badge-style card with photo + name + stack/role + team name |
| **Input fields** | Photo only (zoom/position optional) | Photo + Name + Stack/Role + Team name |
| **Output** | Square frame composite | Rectangular ID card |
| **Primary use** | X profile picture | Post as a shareable image |

> **Scope decision:** We implement **both formats**. Users pick which they want on the page.
>
> **Photo controls:** both formats include live preview with **zoom** (100–180 %) and **horizontal/vertical position** sliders, plus a "Reset photo" button.

---

## Status

- ✅ Implemented & verified in headless Chrome (390 px mobile + desktop): upload → live preview → zoom/pan → generate → download / share-on-X, for both formats (1080×1080 / 1080×1350).
- 🚧 **Not yet deployed.** Before deployment: fix the stale builder-title references in `scripts/main.js` (boot `ReferenceError` + broken "Start over"), create `vercel.json`, and add a favicon. See `tasks.md` Phase 3.6 / Phase 6.

---

## Live Demo

_Link will be added once deployed._

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Vanilla HTML/CSS/JS (ES modules)** | Zero build step, fast load on mobile |
| Fonts | Google Fonts: Inter, Playfair Display, Caveat, Victor Mono | Typography from hhgoa.com |
| Image compositing | **HTML5 Canvas API** | Client-side, instant, no server round-trip |
| HEIC support | **heic2any** (JS lib) | Converts iPhone HEIC → PNG in-browser |
| Sharing | Web Share API (mobile) + Twitter Intent URL + clipboard copy (desktop) | Pre-fills caption + `#FrameInGoa`; works on all platforms |
| Hosting | **Vercel** (static, zero cost) | Confirmed decision — see `docs/decisions.md` ADR-006 |
| OG image (for link preview) | Pre-generated static `assets/og-image.png` | Ensures X unfurl shows the graphic |

---

## Project Structure

```
Id_card_generator/
├── index.html                  # Main entry point
├── vercel.json                 # (to create — Vercel static config, see tasks.md Phase 6)
├── styles/
│   ├── main.css                # Global design system tokens & layout
│   └── components.css          # Component-specific styles
├── scripts/
│   ├── main.js                 # App bootstrap, state, live preview, event wiring
│   ├── canvas.js               # Canvas compositing logic (both formats)
│   ├── upload.js               # File input + HEIC conversion
│   ├── share.js                # Twitter Intent, Web Share API, clipboard
│   └── ui.js                   # Step wizard, toasts, loading, errors
├── assets/
│   ├── og-image.png            # Static X/Twitter link-preview image
│   ├── brand/                  # Official hhgoa.com assets (wordmarks, goa_hindi, etc.)
│   ├── frame-a/                # Format A frame overlay PNG (1080×1080)
│   ├── frame-b/                # Format B card background PNG (1080×1350)
│   └── fonts/                  # (empty; Google Fonts CDN)
├── docs/
│   ├── architecture.md         # Technical architecture & data flow
│   ├── decisions.md            # Architecture decision records (ADRs)
│   ├── design-brief.md         # Visual design guidelines & brand notes
│   └── brand-assets-guide.md   # How to use the official hhgoa.com assets
├── project_brain/              # READ-ONLY reference material
├── README.md
├── AGENTS.md                   # Instructions for AI coding assistants
├── PRD.md                      # Product Requirements Document
└── tasks.md                    # Development task list
```

---

## Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd Id_card_generator

# No build step required for vanilla version
# Just open index.html in a browser, or use a local server:
npx serve .
# or
python -m http.server 8080
```

---

## User Flow

```
Upload Photo
    │
    ▼
Configure — format toggle (A: PFP Frame | B: ID Card) + live preview
    │                    with photo zoom & position sliders
    ▼
[Format B only] Fill in Name / Stack / Role / Team name
    │
    ▼
Generate → Canvas composites the graphic (client-side)
    │
    ▼
Output preview on screen
    │
    ├──── Download button  →  saves PNG to device
    │
    └──── Share to X button  →  opens pre-filled tweet with #FrameInGoa
                                (Web Share API on mobile; clipboard + intent on desktop)
```

---

## Key Requirements

- ✅ **No login / signup gate** — result generated in a single pass
- ✅ **Speed** — compositing is client-side; result appears within a few seconds of upload
- ✅ **Real photo handling** — portrait, landscape, off-center crops, any aspect ratio
- ✅ **On-brand** — unmistakably HH Goa 2026, not a generic badge
- ✅ **Downloadable** — saves a real PNG/JPG file, not a screenshot
- ✅ **Working share flow** — pre-filled caption + `#FrameInGoa`; OG image set correctly for link previews
- ✅ **Mobile-first** — responsive layout; HEIC support for iPhone users

---

## Documentation

| File | Purpose |
|---|---|
| [`AGENTS.md`](./AGENTS.md) | Instructions for AI coding assistants working on this repo |
| [`PRD.md`](./PRD.md) | Full Product Requirements Document |
| [`tasks.md`](./tasks.md) | Prioritised task list & sprint board |
| [`docs/architecture.md`](./docs/architecture.md) | System architecture & data-flow diagrams |
| [`docs/decisions.md`](./docs/decisions.md) | Architecture Decision Records |
| [`docs/design-brief.md`](./docs/design-brief.md) | Visual identity & brand guidelines |

---

## Contributing

This is a shortlisting task submission. For questions, open an issue or refer to the `AGENTS.md` for coding conventions.
