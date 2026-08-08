# AGENTS.md — AI Coding Assistant Guide

> This file is the primary context document for any AI coding assistant (Antigravity, Claude Code, OpenCode, Cursor, Copilot, etc.) working on this repository. **Read this file first before touching any code.**

---

## Project in One Sentence

Build a **client-side, zero-login web tool** that lets users upload a photo and instantly download/share a branded **HH Goa 2026** graphic (either a PFP frame or a Builder ID card) on X (Twitter).

---

## Repo Map

```
Id_card_generator/
├── index.html              ← Single entry point; all UI lives here
├── styles/
│   ├── main.css            ← Design tokens (colors, fonts, spacing), layout, reset
│   └── components.css      ← Per-component styles
├── scripts/
│   ├── main.js             ← App bootstrap; orchestrates module imports
│   ├── canvas.js           ← ALL image compositing logic (Canvas API)
│   ├── upload.js           ← File input handling + HEIC→PNG conversion
│   ├── share.js            ← Twitter Intent URL + Web Share API
│   └── ui.js               ← DOM helpers, step-wizard transitions, toasts
├── assets/
│   ├── frame-a/            ← PFP frame overlay PNGs
│   ├── frame-b/            ← ID card background template(s)
│   └── fonts/              ← Self-hosted fonts (if any)
├── docs/
│   ├── architecture.md     ← System design & data flow
│   ├── decisions.md        ← Architecture Decision Records (ADRs)
│   └── design-brief.md     ← Visual design & branding guidelines
├── project_brain/          ← Original PDF spec; read-only reference
├── README.md
├── PRD.md                  ← Full product requirements
└── tasks.md                ← Task list & progress tracker
```

---

## Core Constraints — Never Violate These

| # | Rule |
|---|---|
| 1 | **No backend required.** All image compositing must happen in the browser via the Canvas API. |
| 2 | **No login / signup gate** before the user sees their result. |
| 3 | **HEIC must be supported** — use the `heic2any` library for client-side conversion. |
| 4 | **Output must be a real downloadable file** (PNG), not a CSS screenshot. Use `canvas.toBlob()` + an `<a download>` link. |
| 5 | **Mobile-first.** Every UI interaction must work on a phone. Test at 390 px wide. |
| 6 | **Share to X must include `#FrameInGoa`** in the pre-filled tweet text. |
| 7 | **Speed is UX.** Processing must feel near-instant. Never show a long spinner for local canvas operations. |

---

## Coding Style & Conventions

### HTML
- Semantic elements (`<main>`, `<section>`, `<figure>`, `<button>`, etc.)
- All interactive elements must have unique `id` attributes for testability
- Single `<h1>` per page

### CSS
- Vanilla CSS only (no Tailwind, no Bootstrap)
- Use CSS custom properties for all design tokens:
  ```css
  :root {
    --color-brand-primary: /* HH Goa accent color */;
    --color-bg: /* dark background */;
    --font-heading: 'Inter', sans-serif;
    --radius-card: 16px;
  }
  ```
- BEM-like naming: `.card__photo`, `.card__title`, `.btn--primary`
- Mobile-first media queries: `@media (min-width: 768px) { … }`

### JavaScript
- ES2020+ modules (`import / export`)
- No frameworks (React, Vue, etc.) unless explicitly approved
- Keep each module focused: `canvas.js` only does compositing; `upload.js` only does file handling
- Use `async/await`; never raw `.then()` chains
- Always handle errors with user-visible feedback (toast/alert)

---

## Key Module Contracts

### `canvas.js`
```js
// Exports:
export async function compositeFrameA(imageBitmap): Promise<Blob>  // PFP overlay
export async function compositeFrameB(imageBitmap, fields): Promise<Blob>  // ID card
// fields = { name: string, stack: string, role: string, builderTitle: string }
```

### `upload.js`
```js
export async function handleUpload(file: File): Promise<ImageBitmap>
// Converts HEIC→PNG if needed, then returns ImageBitmap
```

### `share.js`
```js
export function shareToX(imageBlob: Blob, text: string): void
// Opens Twitter Intent URL with pre-filled text including #FrameInGoa
export async function nativeShare(imageBlob: Blob, text: string): Promise<void>
// Uses navigator.share() on mobile if available
```

---

## Task Tracking

All pending, in-progress, and completed tasks are in [`tasks.md`](./tasks.md).  
**Update `tasks.md` whenever you start or finish a task.**

---

## Design Decisions

Log every non-trivial technical decision in [`docs/decisions.md`](./docs/decisions.md) using the ADR format defined there. This prevents rehashing settled questions.

---

## What NOT to Do

- ❌ Do not add a server, database, or any persistent storage
- ❌ Do not add authentication of any kind
- ❌ Do not add Tailwind CSS or any CSS framework without explicit user approval
- ❌ Do not add a React/Vue/Svelte framework without explicit user approval
- ❌ Do not commit binary assets (fonts, PNGs) over 500 KB without approval
- ❌ Do not modify files inside `project_brain/` — treat as read-only source-of-truth spec
- ❌ Do not leave placeholder text (e.g. "Lorem ipsum") in any UI element

---

## Submission Checklist

- [ ] Both Format A (PFP Frame) and Format B (Builder ID Card) work end-to-end
- [ ] HEIC upload works (test with an iPhone photo)
- [ ] Download produces a real PNG file
- [ ] Share to X opens a pre-filled tweet with `#FrameInGoa`
- [ ] Works on mobile (390 px wide, Chrome/Safari)
- [ ] No login required before viewing result
- [ ] Deployed to a live public URL
- [ ] URL submitted to: https://forms.gle/jM5hTaGvsrfEfixPA by **11:59 PM, 13 Aug 2026**
