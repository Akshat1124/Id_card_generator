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

- [ ] Create `index.html` skeleton with semantic structure
  - [ ] Header with HH Goa 2026 logo/wordmark
  - [ ] Step-wizard layout (Upload → Choose Format → Fill Fields → Preview → Share)
  - [ ] Footer with submission credit
- [ ] Create `styles/main.css`
  - [ ] Define CSS custom properties (colors, fonts, spacing, radii)
  - [ ] CSS reset / base styles
  - [ ] Typography (Google Fonts: Inter or similar)
  - [ ] Mobile-first grid/layout utilities
- [ ] Create `styles/components.css`
  - [ ] Upload zone (drag-and-drop + tap to select)
  - [ ] Format toggle (A / B selector)
  - [ ] Form fields (name, stack, role)
  - [ ] Preview card
  - [ ] Button styles (Download, Share to X)
  - [ ] Toast notifications
- [ ] Source / create brand assets
  - [ ] HH Goa 2026 logo (SVG preferred)
  - [ ] Format A frame overlay PNG (1080×1080, transparent center)
  - [ ] Format B ID card background template PNG (1080×1350)
  - [ ] Choose accent color palette

---

## Phase 2 — Core Logic

- [ ] **`scripts/upload.js`** — File handling
  - [ ] Accept JPG, PNG, HEIC via `<input type="file">`
  - [ ] Drag-and-drop support
  - [ ] Validate file type and size (< 20 MB)
  - [ ] Integrate `heic2any` library for HEIC → PNG conversion
  - [ ] Return `ImageBitmap` for compositing
  - [ ] Show immediate photo preview to user

- [ ] **`scripts/canvas.js`** — Image compositing
  - [ ] `compositeFrameA(imageBitmap)` → `Promise<Blob>`
    - [ ] Center-crop uploaded photo to 1080×1080
    - [ ] Draw frame overlay on top
  - [ ] `compositeFrameB(imageBitmap, fields)` → `Promise<Blob>`
    - [ ] Position and crop photo within card template
    - [ ] Render name, stack/role, builder title as text on canvas
    - [ ] Apply font styling consistent with brand
  - [ ] Builder Title generator (random array of fun titles)
  - [ ] "Re-roll title" logic

- [ ] **`scripts/share.js`** — Sharing
  - [ ] `shareToX(blob, text)` — opens Twitter Intent URL
    - [ ] Pre-filled text includes `#FrameInGoa #HHGoa2026`
  - [ ] `nativeShare(blob, text)` — uses `navigator.share()` on mobile
  - [ ] Graceful fallback: if Web Share API not available, use Twitter Intent

- [ ] **`scripts/ui.js`** — UI orchestration
  - [ ] Step-wizard state machine (steps 1 → 4)
  - [ ] Enable/disable buttons based on state
  - [ ] Show/hide Format B fields based on selection
  - [ ] Display toast messages for errors

- [ ] **`scripts/main.js`** — Bootstrap
  - [ ] Import all modules
  - [ ] Wire up event listeners
  - [ ] Handle the full user journey end-to-end

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

- [ ] Finalize Twitter Intent URL with correct parameters
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
