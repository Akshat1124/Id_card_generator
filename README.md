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
| **Description** | Overlay/frame that wraps the photo; perfect for an X profile picture | Event badge-style card with photo + name + stack/role + generated builder title |
| **Input fields** | Photo only | Photo + Name + Stack/Role |
| **Output** | Square frame composite | Rectangular ID card |
| **Primary use** | X profile picture | Post as a shareable image |

> **Scope decision:** We implement **both formats**. Users pick which they want on the page.

---

## Live Demo

_Link will be added once deployed._

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Vanilla HTML/CSS/JS** (or Vite if needed) | Zero cold-start, no build step for reviewers, fast load on mobile |
| Image compositing | **HTML5 Canvas API** | Client-side, instant, no server round-trip |
| HEIC support | **heic2any** (JS lib) | Converts iPhone HEIC → PNG in-browser |
| Sharing | Web Share API + Twitter Intent URL | Pre-fills caption + `#FrameInGoa`; works on mobile |
| Hosting | **Vercel / Netlify / GitHub Pages** | TBD — static hosting, zero cost |
| OG image (for link preview) | Dynamic `/og` route or pre-generated image | Ensures X unfurl shows the actual graphic |

---

## Project Structure

```
Id_card_generator/
├── index.html                  # Main entry point
├── styles/
│   ├── main.css                # Global design system tokens & layout
│   └── components.css          # Component-specific styles
├── scripts/
│   ├── main.js                 # App bootstrap & routing
│   ├── canvas.js               # Canvas compositing logic (both formats)
│   ├── upload.js               # File input + HEIC conversion
│   ├── share.js                # Twitter Intent & Web Share API
│   └── ui.js                   # DOM helpers, step transitions
├── assets/
│   ├── frame-a/                # PFP frame overlay PNGs (multiple variants)
│   ├── frame-b/                # ID card background template(s)
│   └── fonts/                  # Self-hosted web fonts (if needed)
├── docs/
│   ├── architecture.md         # Technical architecture & data flow
│   ├── decisions.md            # Architecture decision records (ADRs)
│   └── design-brief.md         # Visual design guidelines & brand notes
├── project_brain/
│   └── HH_Goa_2026_Shortlisting_Task_Frame_ID_Generator.pdf
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
Choose Format (A: PFP Frame  |  B: Builder ID Card)
    │
    ▼
[Format B only] Fill in Name / Stack / Role
    │
    ▼
Canvas composites graphic  ←── near-instant (client-side)
    │
    ▼
Preview shown on screen
    │
    ├──── Download button  →  saves PNG to device
    │
    └──── Share to X button  →  opens pre-filled tweet with #FrameInGoa
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
