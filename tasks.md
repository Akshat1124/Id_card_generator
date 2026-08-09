# Tasks — HH Goa 2026 Frame / ID Card Generator

> **Legend:** `[ ]` To Do · `[/]` In Progress · `[x]` Done · `[~]` Blocked

**Deadline: 11:59 PM, 13 August 2026**

---

## Phase 0 — Repository Setup & Documentation

- [x] Read and understand the project PDF spec
- [x] Create repository structure (directories, placeholder files)
- [x] Write `README.md`
- [x] Write `AGENTS.md`
- [x] Write `PRD.md`
- [x] Write `tasks.md` (this file)
- [x] Write `docs/architecture.md`
- [x] Write `docs/decisions.md`
- [x] Write `docs/design-brief.md`

---

## Phase 1 — Foundation & Design System

- [x] Create `index.html` skeleton with semantic structure
  - [x] Header with HH Goa 2026 logo/wordmark
  - [x] Step-wizard layout (Upload → Choose Format → Fill Fields → Preview → Share)
  - [x] Footer with submission credit
- [x] Create `styles/main.css`
  - [x] Define CSS custom properties (colors, fonts, spacing, radii)
  - [x] CSS reset / base styles
  - [x] Typography (Google Fonts: Inter or similar)
  - [x] Mobile-first grid/layout utilities
- [x] Create `styles/components.css`
  - [x] Upload zone (drag-and-drop + tap to select)
  - [x] Format toggle (A / B selector)
  - [x] Form fields (name, stack, role)
  - [x] Preview card
  - [x] Button styles (Download, Share to X)
  - [x] Toast notifications
- [x] Source / create brand assets
  - [x] HH Goa 2026 logo (SVG preferred)
  - [x] Format A frame overlay PNG (1080×1080, transparent center)
  - [x] Format B ID card background template PNG (1080×1350)
  - [x] Choose accent color palette

---

## Phase 2 — Core Logic

- [x] **`scripts/upload.js`** — File handling
  - [x] Accept JPG, PNG, HEIC via `<input type="file">`
  - [x] Drag-and-drop support
  - [x] Validate file type and size (< 20 MB)
  - [x] Integrate `heic2any` library for HEIC → PNG conversion
  - [x] Return `ImageBitmap` for compositing
  - [x] Show immediate photo preview to user

- [x] **`scripts/canvas.js`** — Image compositing
  - [x] `compositeFrameA(imageBitmap)` → `Promise<Blob>`
    - [x] Center-crop uploaded photo to 1080×1080
    - [x] Draw frame overlay on top
  - [x] `compositeFrameB(imageBitmap, fields)` → `Promise<Blob>`
    - [x] Position and crop photo within card template
    - [x] Render name, stack/role, builder title as text on canvas
    - [x] Apply font styling consistent with brand
  - [x] Builder Title generator (random array of fun titles)
  - [x] "Re-roll title" logic

- [x] **`scripts/share.js`** — Sharing
  - [x] `shareToX(blob, text)` — opens Twitter Intent URL
    - [x] Pre-filled text includes `#FrameInGoa #HHGoa2026`
  - [x] `nativeShare(blob, text)` — uses `navigator.share()` on mobile
  - [x] Graceful fallback: if Web Share API not available, use Twitter Intent

- [x] **`scripts/ui.js`** — UI orchestration
  - [x] Step-wizard state machine (steps 1 → 4)
  - [x] Enable/disable buttons based on state
  - [x] Show/hide Format B fields based on selection
  - [x] Display toast messages for errors

- [x] **`scripts/main.js`** — Bootstrap
  - [x] Import all modules
  - [x] Wire up event listeners
  - [x] Handle the full user journey end-to-end

---

## Phase 3 — Polish & UX

- [ ] Smooth step transitions (CSS transitions/animations)
- [ ] Loading state during compositing (brief spinner)
- [ ] Error states with user-friendly messages
  - [ ] Unsupported file type
  - [ ] File too large
  - [ ] HEIC conversion failure
- [ ] Empty state for upload zone (illustrated prompt)
- [ ] Responsive layout tested at: 390 px, 768 px, 1280 px
- [ ] Keyboard accessibility (tab order, Enter key on buttons)
- [ ] ARIA labels on all interactive elements

---

## Phase 4 — Share & OG Image

- [x] Finalize Twitter Intent URL with correct parameters
- [x] Improve desktop share fallback: try Web Share API on all platforms; copy PNG to clipboard + guidance toast when falling back to Intent (Twitter Intent can't auto-attach images)
- [ ] Decide OG image strategy (see `docs/decisions.md` Q5)
  - [ ] **Option A:** Static pre-generated OG image (simple, no server)
  - [ ] **Option B:** Dynamic OG route (requires a small Vercel/Netlify function)
- [ ] Add `<meta>` OG tags to `index.html`
  - [ ] `og:image` points to a graphic that shows the actual branded output
  - [ ] `og:title`, `og:description`, `twitter:card = summary_large_image`
- [ ] Test X link unfurl manually (use Twitter Card Validator)

---

## Phase 5 — Testing & QA

- [ ] Manual testing matrix

  | Scenario | Browser | Device | Pass? |
  |---|---|---|---|
  | JPG upload → Format A download | Chrome | Desktop | |
  | PNG upload → Format B download | Firefox | Desktop | |
  | HEIC upload → Format A download | Safari | iPhone | |
  | Share to X opens correct tweet | Chrome | Android | |
  | Full flow, no console errors | Safari | iPhone 14 | |
  | File > 20 MB shows error | Chrome | Desktop | |

- [ ] Check output image quality (zoom in on downloaded PNG)
- [ ] Validate `canvas.toBlob()` works on iOS Safari (known quirks)
- [ ] Test HEIC conversion with real iPhone photos

---

## Phase 6 — Deployment & Submission

- [ ] Choose hosting platform (Vercel / Netlify / GitHub Pages)
- [ ] Deploy and verify live URL loads correctly
- [ ] Test live URL on a real phone
- [ ] Update `README.md` with live demo link
- [ ] Fill submission form: [https://forms.gle/jM5hTaGvsrfEfixPA](https://forms.gle/jM5hTaGvsrfEfixPA)
- [ ] **Submit by 11:59 PM, 13 August 2026** ⏰

---

## Backlog / Nice-to-Have

- [ ] Multiple frame style variants for Format A
- [ ] Dark / light mode toggle
- [ ] Copy-to-clipboard button for the image
- [ ] Analytics (simple page-view counter via Plausible or similar)
- [ ] "Try another photo" button that resets cleanly without page reload
