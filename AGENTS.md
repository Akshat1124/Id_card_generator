# AGENTS.md — Implementation Manual for OpenCode

> **Who reads this:** OpenCode (or any AI coding assistant). This is your primary instruction file. Read every section before writing a single line of code. All decisions have already been made — your job is to implement them exactly as described here.

---

## 0. Mission

Build a **client-side, zero-login web tool** called the **HH Goa 2026 Frame / ID Card Generator**. Users upload a photo and instantly get a branded graphic to download and share on X (Twitter). No backend. No framework. Deadline: **11:59 PM, 13 August 2026**.

For full context, read these files in order:
1. [`PRD.md`](./PRD.md) — what to build and why
2. [`docs/architecture.md`](./docs/architecture.md) — how it works technically
3. [`docs/design-brief.md`](./docs/design-brief.md) — how it looks
4. [`docs/decisions.md`](./docs/decisions.md) — every major decision already made
5. [`tasks.md`](./tasks.md) — the ordered task list; mark tasks as you go

---

## 1. Locked-In Decisions (Do Not Re-Debate)

| Decision | Answer |
|---|---|
| Backend? | ❌ None. 100% client-side Canvas API only. |
| Framework? | ❌ None. Vanilla HTML + CSS + ES modules only. |
| CSS framework? | ❌ None. Vanilla CSS with custom properties. |
| HEIC support? | ✅ Use `heic2any` from CDN. |
| Output format? | ✅ PNG via `canvas.toBlob('image/png')`. |
| Output sizes? | Format A: 1080×1080 px · Format B: 1080×1350 px |
| Hosting? | ✅ Vercel. Create `vercel.json`. |
| Share to X? | ✅ Web Share API (mobile) + Twitter Intent URL (fallback). |
| Hashtag? | ✅ `#FrameInGoa` must appear in every pre-filled tweet. |

---

## 2. Repository Layout

Implement files in this exact structure. Do not create any other top-level files or directories without approval.

```
Id_card_generator/              ← repo root
├── index.html                  ← ONLY HTML file; all UI is here
├── styles/
│   ├── main.css                ← Design tokens + global reset + layout
│   └── components.css          ← Per-component styles
├── scripts/
│   ├── main.js                 ← Entry point; wires everything together
│   ├── canvas.js               ← ALL compositing logic
│   ├── upload.js               ← File input + HEIC conversion
│   ├── share.js                ← Twitter Intent + Web Share API
│   └── ui.js                   ← Step wizard, DOM helpers, toasts
├── assets/
│   ├── frame-a/
│   │   └── overlay.png         ← PFP frame overlay (1080×1080, transparent center)
│   ├── frame-b/
│   │   └── card-bg.png         ← ID card background (1080×1350)
│   └── fonts/                  ← (empty; use Google Fonts CDN)
├── docs/                       ← Do not modify these during implementation
├── project_brain/              ← READ ONLY. Never modify.
├── vercel.json
├── .gitignore
├── README.md
├── AGENTS.md                   ← This file
├── PRD.md
└── tasks.md
```

---

## 3. Placeholder Assets

**Real brand assets are being arranged.** Until they arrive, you MUST generate placeholder assets programmatically so the app is fully functional. The code must require **zero changes** when real assets drop in.

### Placeholder Strategy

Generate both placeholder PNGs using a **one-time canvas script** (`scripts/generate-placeholders.js`) that writes files to `assets/`. Better yet, draw the placeholders directly in canvas at runtime if files are missing — detect via `img.onerror`.

**Placeholder Frame A (overlay.png):**
- 1080×1080 transparent PNG
- 40px border ring of `#F0E040` (bright yellow)
- Bottom strip (height 120px): `#F0E040` background, dark `#0A0A0A` text "HH GOA 2026" centered, 48px Inter 700
- Small "#FrameInGoa" text at bottom right in dark `#0A0A0A`, 24px

**Placeholder Card Background (card-bg.png):**
- 1080×1350 px
- Forest green gradient background: `#1C5E2A` → `#174F23`
- Header zone (top 200px): `#F0E040` bar, "HH GOA 2026" + "BUILDER PASS" in dark `#0A0A0A` Inter 800 56px centered
- Photo zone outline: dashed white rectangle at left 40% × center vertical
- Footer zone (bottom 100px): `#F0E040` bar, "GOA · AUGUST 2026  |  #HHGoa2026" centered dark `#0A0A0A` 28px

### Runtime Fallback Pattern

```js
// In canvas.js — load an asset with a programmatic fallback
async function loadAsset(src, fallbackDrawFn) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => {
      // Real asset not found; create it programmatically on a temp canvas
      const c = document.createElement('canvas')
      fallbackDrawFn(c)
      const fallbackImg = new Image()
      fallbackImg.onload = () => resolve(fallbackImg)
      fallbackImg.src = c.toDataURL()
    }
    img.src = src
  })
}
```

---

## 4. Implementation — File by File

Work through these in order. Mark each task `[/]` when started and `[x]` when done in `tasks.md`.

---

### 4.1 `index.html`

**Rules:**
- Single `<h1>` on the page
- All interactive elements have unique `id` attributes
- Google Fonts loaded in `<head>` (Inter 400, 500, 600, 700, 800)
- `heic2any` loaded from CDN before `scripts/main.js`
- `<script type="module" src="scripts/main.js">` at bottom of `<body>`
- Full OG meta tags in `<head>`

**Structure (exact sections, in order):**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HH Goa 2026 — Frame Generator</title>
  <meta name="description" content="Generate your branded HH Goa 2026 graphic. Upload your photo, download your frame, share on X. #FrameInGoa">

  <!-- OG / Twitter Card -->
  <meta property="og:title" content="HH Goa 2026 — Frame Generator">
  <meta property="og:description" content="Get your HH Goa 2026 builder frame. Upload, generate, share. #FrameInGoa">
  <meta property="og:image" content="assets/og-image.png">  <!-- generate this static OG image -->
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="assets/og-image.png">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="styles/main.css">
  <link rel="stylesheet" href="styles/components.css">
</head>
<body>

  <!-- HEADER -->
  <header class="site-header">
    <div class="header__logo">HH GOA 2026</div>
    <p class="header__tagline">Get your builder frame. Share on X.</p>
  </header>

  <div class="cross-divider" aria-hidden="true">× × × × × × × × × × × × × × × × × × × × × × × × ×</div>

  <!-- MAIN APP -->
  <main class="app" id="app">

    <!-- STEP 1: Upload -->
    <section class="step step--active" id="step-upload" aria-label="Step 1: Upload photo">
      <h1 class="step__title">Drop your photo</h1>
      <div class="upload-zone" id="upload-zone" role="button" tabindex="0" aria-label="Upload photo">
        <div class="upload-zone__icon">↑</div>
        <p class="upload-zone__text">Tap to upload or drag your photo here</p>
        <p class="upload-zone__hint">JPG, PNG, HEIC · Max 20 MB</p>
        <input type="file" id="file-input" accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif" hidden>
      </div>
      <p class="upload-zone__error" id="upload-error" role="alert" hidden></p>
    </section>

    <!-- STEP 2: Format + Fields -->
    <section class="step" id="step-config" aria-label="Step 2: Choose format" hidden>

      <!-- Photo preview -->
      <div class="photo-preview" id="photo-preview-container">
        <img id="photo-preview" alt="Your uploaded photo" class="photo-preview__img">
        <button class="btn btn--ghost btn--sm" id="btn-change-photo">Change photo</button>
      </div>

      <!-- Format toggle -->
      <div class="format-toggle" id="format-toggle" role="group" aria-label="Choose format">
        <button class="format-toggle__btn format-toggle__btn--active" id="btn-format-a" data-format="a">
          <span class="format-toggle__label">PFP Frame</span>
          <span class="format-toggle__desc">Wraps your photo for X profile</span>
        </button>
        <button class="format-toggle__btn" id="btn-format-b" data-format="b">
          <span class="format-toggle__label">Builder ID Card</span>
          <span class="format-toggle__desc">Event badge with your details</span>
        </button>
      </div>

      <!-- Format B fields (shown only when B is selected) -->
      <div class="fields" id="fields-b" hidden>
        <label class="field" for="input-name">
          <span class="field__label">Your Name</span>
          <input class="field__input" id="input-name" type="text" placeholder="Akshat Srivastava" maxlength="40" autocomplete="name">
        </label>
        <label class="field" for="input-stack">
          <span class="field__label">Stack / Role</span>
          <input class="field__input" id="input-stack" type="text" placeholder="Full-Stack · Builder · Founder" maxlength="60">
        </label>
        <div class="field field--title">
          <span class="field__label">Your Builder Title</span>
          <div class="builder-title">
            <span class="builder-title__text" id="builder-title-display">Prompt Whisperer</span>
            <button class="btn btn--ghost btn--sm" id="btn-reroll" aria-label="Generate new builder title">🎲 Re-roll</button>
          </div>
        </div>
      </div>

      <button class="btn btn--primary btn--lg" id="btn-generate">Generate My Graphic ✨</button>
    </section>

    <!-- STEP 3: Output -->
    <section class="step" id="step-output" aria-label="Step 3: Your graphic" hidden>
      <h2 class="step__title">Here's your graphic! 🚀</h2>
      <div class="output-preview" id="output-preview-container">
        <img id="output-preview" alt="Your HH Goa 2026 graphic" class="output-preview__img">
      </div>
      <div class="output-actions">
        <button class="btn btn--primary btn--lg" id="btn-download">⬇ Download PNG</button>
        <button class="btn btn--x btn--lg" id="btn-share-x">𝕏 Share on X</button>
      </div>
      <button class="btn btn--ghost btn--sm" id="btn-start-over">Start over</button>
    </section>

    <!-- Loading overlay -->
    <div class="loading-overlay" id="loading-overlay" hidden aria-live="polite">
      <div class="loading-overlay__spinner"></div>
      <p class="loading-overlay__text">Generating your graphic…</p>
    </div>

  </main>

  <div class="cross-divider" aria-hidden="true">× × × × × × × × × × × × × × × × × × × × × × × × ×</div>

  <!-- FOOTER -->
  <footer class="site-footer">
    <p>HH Goa 2026 · <a href="https://forms.gle/jM5hTaGvsrfEfixPA" target="_blank" rel="noopener">Submit your entry</a></p>
  </footer>

  <!-- heic2any CDN -->
  <script src="https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js"></script>
  <!-- ADR-010: detect CDN load failure before any upload attempt -->
  <script>window.__heic2anyLoaded = typeof heic2any !== 'undefined'</script>

  <!-- App entry point -->
  <script type="module" src="scripts/main.js"></script>
</body>
</html>
```

---

### 4.2 `styles/main.css`

Define all CSS custom properties here. No component-specific rules (those go in `components.css`).

```css
/* =========================================================
   DESIGN TOKENS
   ========================================================= */
:root {
  /* Brand */
  --color-brand-primary:   #1C5E2A;   /* forest green — main bg */
  --color-brand-accent:    #F0E040;   /* bright yellow — main accent */
  --color-brand-accent-h:  #F5E860;   /* yellow hover state */
  --color-brand-gold:      #F0E040;   /* same as accent */
  --color-brand-pink:      #E91E8C;   /* hot pink — decorative only */

  /* Surfaces */
  --color-bg:              #1C5E2A;   /* forest green */
  --color-surface:         #174F23;   /* slightly darker green */
  --color-surface-raised:  #1E6B2F;   /* elevated panels */
  --color-border:          rgba(255, 255, 255, 0.15);

  /* Text */
  --color-text-primary:    #FFFFFF;
  --color-text-secondary:  rgba(255, 255, 255, 0.7);
  --color-text-accent:     #F0E040;   /* yellow */

  /* Semantic */
  --color-success:         #1A7A3A;   /* dark green (harmonizes) */
  --color-error:           #CC3333;
  --color-x-black:         #000000;   /* X/Twitter brand color */

  /* Button text — dark on yellow */
  --color-btn-text:        #0A0A0A;

  /* Cross divider rows */
  --color-cross-divider:   #D4C830;   /* slightly muted yellow */

  /* Spacing */
  --space-xs:   4px;
  --space-sm:   8px;
  --space-md:   16px;
  --space-lg:   24px;
  --space-xl:   40px;
  --space-2xl:  64px;

  /* Typography */
  --font-body:    'Inter', -apple-system, sans-serif;
  --font-heading: 'Playfair Display', Georgia, serif;

  /* Radii — sharp corners, no pills */
  --radius-sm:   4px;
  --radius-md:   4px;
  --radius-lg:   8px;
  --radius-pill: 4px;   /* override — no pill shapes in this brand */

  /* Shadows */
  --shadow-card:  0 8px 30px rgba(0, 0, 0, 0.4);
  --shadow-btn:   0 4px 14px rgba(0, 0, 0, 0.4);

  /* Transitions */
  --transition-fast:   150ms ease;
  --transition-base:   200ms ease;
  --transition-slow:   300ms ease-out;
}

/* =========================================================
   RESET & BASE
   ========================================================= */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-body);
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  line-height: 1.6;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
}

img { max-width: 100%; display: block; }

a { color: var(--color-brand-accent); text-decoration: none; }
a:hover { text-decoration: underline; }

/* =========================================================
   LAYOUT
   ========================================================= */
.site-header {
  padding: var(--space-lg) var(--space-md);
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

.app {
  flex: 1;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-md);
  position: relative;
}

.site-footer {
  padding: var(--space-lg) var(--space-md);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  border-top: 1px solid var(--color-border);
}

/* =========================================================
   STEP SYSTEM
   ========================================================= */
.step {
  animation: stepIn var(--transition-slow) both;
}

@keyframes stepIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.step__title {
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 5vw, 2.25rem);
  font-weight: 800;
  text-align: center;
  text-transform: uppercase;
  margin-bottom: var(--space-lg);
  color: var(--color-brand-accent);   /* solid yellow — no gradient */
}

/* =========================================================
   RESPONSIVE
   ========================================================= */
@media (min-width: 640px) {
  .app { padding: var(--space-2xl) var(--space-xl); }
}
```

---

### 4.3 `styles/components.css`

Implement **all** component styles here. Key components:

**Header logo:** `var(--font-heading)` (Playfair Display), yellow `var(--color-brand-accent)`, uppercase. NO gradient clip-text. Tagline in muted secondary color.

**Cross divider:** rows of `×` as section separators:
```css
.cross-divider {
  color: var(--color-cross-divider);
  font-size: 0.875rem;
  letter-spacing: 0.15em;
  text-align: center;
  padding: var(--space-sm) 0;
  overflow: hidden;
  white-space: nowrap;
  opacity: 0.7;
  user-select: none;
}
```

**Upload Zone:**
- Minimum height 220px, dashed border `1.5px dashed rgba(255,255,255,0.25)`, background `rgba(0,0,0,0.15)`, border-radius `var(--radius-md)`
- On hover/focus: border-color → `var(--color-brand-accent)`, soft glow `box-shadow: 0 0 0 4px rgba(240,224,64,0.15)`
- Transition: `var(--transition-base)` on border-color and box-shadow
- Cursor: pointer
- Drag-over state: add `.upload-zone--drag-over` class → filled background `rgba(240,224,64,0.08)`

**Format Toggle:**
- Two buttons side by side in a flex row, border-radius `var(--radius-md)` (4px)
- Active: background `var(--color-brand-accent)`, text `var(--color-btn-text)` (`#0A0A0A`), `box-shadow: var(--shadow-btn)`
- Inactive: `border: 1.5px solid rgba(255,255,255,0.2)`, background `rgba(0,0,0,0.2)`, secondary text
- Labels: UPPERCASE, `letter-spacing: 0.05em`
- Transition: all properties `var(--transition-base)`

**Buttons:**
```css
/* Base */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-sm);
       font-family: inherit; font-size: 1rem; font-weight: 700; cursor: pointer;
       border: none; border-radius: var(--radius-pill); /* 4px — sharp, no pill */
       transition: all var(--transition-fast);
       text-decoration: none; white-space: nowrap; }

/* Sizes */
.btn--sm  { padding: 8px 16px;  font-size: 0.875rem; }
.btn--lg  { padding: 16px 32px; font-size: 1.0625rem; width: 100%; }

/* Variants */
.btn--primary { background: var(--color-brand-accent); color: var(--color-btn-text);
                border: 2px dashed rgba(0, 0, 0, 0.4);   /* signature dashed border */
                text-transform: uppercase; letter-spacing: 0.06em; box-shadow: var(--shadow-btn); }
.btn--primary:hover { background: var(--color-brand-accent-h); transform: translateY(-2px); }
.btn--primary:active { transform: translateY(0); }

.btn--x { background: var(--color-x-black); color: #fff;
          border: 2px dashed rgba(255, 255, 255, 0.2);
          text-transform: uppercase; letter-spacing: 0.06em; }
.btn--x:hover { background: #1a1a1a; transform: translateY(-2px); }

.btn--ghost { background: transparent; color: rgba(255, 255, 255, 0.7);
              border: 1.5px solid rgba(255, 255, 255, 0.3); border-radius: var(--radius-md); }
.btn--ghost:hover { border-color: var(--color-brand-accent); color: var(--color-brand-accent); }
```

**Fields (Format B):** Dark panels `rgba(0,0,0,0.25)`, label above input (UPPERCASE, tracked), input border `1.5px solid rgba(255,255,255,0.2)`, yellow focus ring `0 0 0 3px rgba(240,224,64,0.2)`.

**Output preview:** Centered, max-width 360px, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-card)`. Scale in on appearance.

**Loading overlay:** Fixed full-screen overlay, background `rgba(15,50,20,0.95)` (green-tinted), with centered spinner (CSS `@keyframes spin` on a `border-radius: 50%` div) whose top color segment is `var(--color-brand-accent)` (yellow).

**Toast notifications:** Fixed bottom-center, auto-dismiss after 3s, slide up on appear, `border-radius: var(--radius-md)`. Success `#1A7A3A`, error `#CC3333`, info `rgba(0,0,0,0.85)` with white border.

---

### 4.4 `scripts/upload.js`

```js
// scripts/upload.js
// Handles file selection, validation, HEIC conversion, and ImageBitmap creation.

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']
const MAX_SIZE_BYTES = 20 * 1024 * 1024  // 20 MB

/**
 * Validate a File object. Returns null if valid, or an error message string.
 * @param {File} file
 * @returns {string|null}
 */
export function validateFile(file) {
  const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')
  const typeOk = ACCEPTED_TYPES.includes(file.type) || isHeic
  if (!typeOk) return 'Unsupported file type. Please use JPG, PNG, or HEIC.'
  if (file.size > MAX_SIZE_BYTES) return 'File is too large. Maximum size is 20 MB.'
  return null
}

/**
 * Convert a File to an ImageBitmap, handling HEIC conversion via heic2any.
 * @param {File} file
 * @returns {Promise<ImageBitmap>}
 */
export async function fileToImageBitmap(file) {
  let blob = file
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif'
                 || file.name.toLowerCase().endsWith('.heic')
                 || file.name.toLowerCase().endsWith('.heif')

  if (isHeic) {
    // ADR-010: guard against CDN load failure
    if (typeof heic2any === 'undefined') {
      throw new Error(
        'HEIC conversion library failed to load. ' +
        'Please convert your photo to JPG on your device and try again.'
      )
    }
    blob = await heic2any({ blob: file, toType: 'image/png', quality: 0.92 })
    if (Array.isArray(blob)) blob = blob[0]
  }

  return createImageBitmap(blob)
}
```

---

### 4.5 `scripts/canvas.js`

This is the most important file. All image compositing happens here.

```js
// scripts/canvas.js
// Produces final PNG Blobs by compositing the user photo with brand assets.

const FRAME_A_SIZE  = 1080          // square
const CARD_W        = 1080
const CARD_H        = 1350

const BUILDER_TITLES = [
  'Prompt Whisperer', 'Founding Hacker', 'Vibe Architect',
  'Zero-to-One Enjoyer', 'Full-Stack Dreamer', 'Ship It or Skip It',
  'Context Window Surfer', 'Recursive Thinker', 'Chaos Engineer',
  'Async Adventurer', 'Serial Deployer', 'Edge Case Collector',
  'Latency Whisperer', 'Rubber Duck Wrangler', 'Git Push Philosopher',
]

export function randomBuilderTitle() {
  return BUILDER_TITLES[Math.floor(Math.random() * BUILDER_TITLES.length)]
}

/**
 * Load an image from src. On error, draws a placeholder via fallbackFn.
 */
async function loadImage(src, fallbackFn) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      const c = Object.assign(document.createElement('canvas'), { width: 1080, height: 1080 })
      fallbackFn(c.getContext('2d'), c)
      const fi = new Image()
      fi.onload = () => resolve(fi)
      fi.src = c.toDataURL()
    }
    img.src = src
  })
}

/**
 * Draw user photo centered + cropped (CSS object-fit: cover behaviour).
 */
function drawCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height
  const targetRatio = w / h
  let sx, sy, sw, sh
  if (imgRatio > targetRatio) {
    sh = img.height; sw = sh * targetRatio
    sx = (img.width - sw) / 2; sy = 0
  } else {
    sw = img.width; sh = sw / targetRatio
    sx = 0; sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

/** Draw rounded rect clip path */
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

// ─── FORMAT A ─────────────────────────────────────────────────────────────────

function drawFrameAFallback(ctx, canvas) {
  canvas.width = FRAME_A_SIZE; canvas.height = FRAME_A_SIZE
  // Transparent center, yellow border
  ctx.clearRect(0, 0, FRAME_A_SIZE, FRAME_A_SIZE)
  // Border ring
  const bw = 40
  ctx.fillStyle = '#F0E040'
  // Top
  ctx.fillRect(0, 0, FRAME_A_SIZE, bw)
  // Bottom
  ctx.fillRect(0, FRAME_A_SIZE - bw - 120, FRAME_A_SIZE, bw + 120)
  // Left
  ctx.fillRect(0, bw, bw, FRAME_A_SIZE - bw * 2 - 120)
  // Right
  ctx.fillRect(FRAME_A_SIZE - bw, bw, bw, FRAME_A_SIZE - bw * 2 - 120)
  // Bottom text strip
  ctx.fillStyle = '#F0E040'
  ctx.fillRect(0, FRAME_A_SIZE - 120, FRAME_A_SIZE, 120)
  ctx.fillStyle = '#0A0A0A'
  ctx.font = '700 48px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('HH GOA 2026', FRAME_A_SIZE / 2, FRAME_A_SIZE - 55)
  ctx.font = '500 24px Inter, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('#FrameInGoa', FRAME_A_SIZE - 24, FRAME_A_SIZE - 20)
}

/**
 * @param {ImageBitmap} userPhoto
 * @returns {Promise<Blob>}
 */
export async function compositeFrameA(userPhoto) {
  const canvas = document.createElement('canvas')
  canvas.width = FRAME_A_SIZE; canvas.height = FRAME_A_SIZE
  const ctx = canvas.getContext('2d')

  // 1. Draw user photo (cover-fit square)
  drawCover(ctx, userPhoto, 0, 0, FRAME_A_SIZE, FRAME_A_SIZE)

  // 2. Draw frame overlay on top
  const frame = await loadImage('assets/frame-a/overlay.png', drawFrameAFallback)
  ctx.drawImage(frame, 0, 0, FRAME_A_SIZE, FRAME_A_SIZE)

  return new Promise((res) => canvas.toBlob(res, 'image/png'))
}

// ─── FORMAT B ─────────────────────────────────────────────────────────────────

function drawCardBgFallback(ctx, canvas) {
  canvas.width = CARD_W; canvas.height = CARD_H
  // Forest green gradient bg
  const grad = ctx.createLinearGradient(0, 0, 0, CARD_H)
  grad.addColorStop(0, '#1C5E2A'); grad.addColorStop(1, '#174F23')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, CARD_W, CARD_H)
  // Header bar
  ctx.fillStyle = '#F0E040'
  ctx.fillRect(0, 0, CARD_W, 200)
  ctx.fillStyle = '#0A0A0A'
  ctx.font = '800 56px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('HH GOA 2026', CARD_W / 2, 90)
  ctx.font = '600 32px Inter, sans-serif'
  ctx.fillText('BUILDER PASS', CARD_W / 2, 148)
  // Footer bar
  ctx.fillStyle = '#F0E040'
  ctx.fillRect(0, CARD_H - 100, CARD_W, 100)
  ctx.fillStyle = '#0A0A0A'
  ctx.font = '500 28px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('GOA · AUGUST 2026  |  #HHGoa2026', CARD_W / 2, CARD_H - 38)
}

/**
 * @param {ImageBitmap} userPhoto
 * @param {{ name: string, stack: string, builderTitle: string }} fields
 * @returns {Promise<Blob>}
 */
export async function compositeFrameB(userPhoto, fields) {
  // Ensure fonts are loaded before drawing text on canvas
  await Promise.all([
    document.fonts.load('800 64px Inter'),
    document.fonts.load('700 40px Inter'),
    document.fonts.load('500 36px Inter'),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W; canvas.height = CARD_H
  const ctx = canvas.getContext('2d')

  // 1. Background card
  const bg = await loadImage('assets/frame-b/card-bg.png', drawCardBgFallback)
  ctx.drawImage(bg, 0, 0, CARD_W, CARD_H)

  // 2. User photo — left 42% of card, vertically centered in the middle zone
  const photoX = 40, photoY = 240
  const photoW = 400, photoH = 400
  ctx.save()
  roundedRect(ctx, photoX, photoY, photoW, photoH, 24)
  ctx.clip()
  drawCover(ctx, userPhoto, photoX, photoY, photoW, photoH)
  ctx.restore()

  // 3. Text — right side
  const textX = 480
  ctx.textAlign = 'left'

  // Name
  ctx.fillStyle = '#F0E040'  // yellow
  ctx.font = '800 56px Inter, sans-serif'
  wrapText(ctx, fields.name || 'Your Name', textX, 310, 560, 68)

  // Stack / role
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '500 32px Inter, sans-serif'
  wrapText(ctx, fields.stack || 'Builder', textX, 420, 560, 44)

  // Divider line
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(textX, 490); ctx.lineTo(CARD_W - 40, 490); ctx.stroke()

  // Builder title
  ctx.fillStyle = '#F0E040'
  ctx.font = 'italic 700 36px Inter, sans-serif'
  ctx.fillText('"' + (fields.builderTitle || 'Builder') + '"', textX, 545)

  return new Promise((res) => canvas.toBlob(res, 'image/png'))
}

/**
 * Simple text wrapping for canvas.
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y); y += lineHeight; line = word
    } else { line = test }
  }
  ctx.fillText(line, x, y)
}
```

---

### 4.6 `scripts/share.js`

```js
// scripts/share.js

const TWEET_TEXT = "I'm going to HH Goa 2026! 🚀 #FrameInGoa #HHGoa2026"
const DOWNLOAD_FILENAME_A = 'HH-Goa-2026-frame.png'
const DOWNLOAD_FILENAME_B = 'HH-Goa-2026-id-card.png'

/**
 * Trigger a PNG download.
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadImage(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: filename,
  })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/**
 * Copy a PNG Blob to the system clipboard so the user can paste it into the
 * X composer. Best-effort — returns false if the Clipboard API is unavailable.
 * @param {Blob} blob
 * @returns {Promise<boolean>}
 */
export async function copyImageToClipboard(blob) {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') return false
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return true
  } catch (e) {
    console.warn('Clipboard image copy failed', e)
    return false
  }
}

/**
 * Share to X.
 *
 * Primary path: Web Share API with the PNG file attached. On iOS/Android the X
 * app opens a composer with the image + caption ready to post. On Windows/Mac
 * the native OS share sheet opens (works when the X app is a share target).
 *
 * Fallback: Twitter Intent URL. The Intent API can ONLY pre-fill text — it can
 * never auto-attach a local image. So we also copy the PNG to the clipboard so
 * the user can paste it into the tweet.
 *
 * @param {Blob} blob
 * @param {'a'|'b'} format
 * @returns {Promise<'shared'|'cancelled'|'intent'>}
 */
export async function shareToX(blob, format) {
  const filename = format === 'a' ? DOWNLOAD_FILENAME_A : DOWNLOAD_FILENAME_B
  const file = new File([blob], filename, { type: 'image/png' })

  // Primary: native share with the image attached — try on ALL platforms, not
  // just mobile. Desktop Chrome/Edge/Win11 and macOS Safari support file shares.
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: TWEET_TEXT, title: 'HH Goa 2026' })
      return 'shared'
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled'   // user dismissed the sheet
      console.warn('Share with image failed, falling back', err)
    }
  }

  // Fallback: copy the image to the clipboard so the X composer can be made
  // "ready to post" with a single paste.
  await copyImageToClipboard(blob)

  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(TWEET_TEXT)}`
  window.open(url, '_blank', 'noopener')
  return 'intent'
}

export { DOWNLOAD_FILENAME_A, DOWNLOAD_FILENAME_B }
```

> **Note (share-to-X limitation):** `twitter.com/intent/tweet` can only pre-fill text — it can never attach a local image. Only the Web Share API (X app on mobile / OS share sheet on desktop) delivers an image-ready composer. The Intent fallback therefore copies the PNG to the clipboard and the UI tells the user to paste it. This is the best possible UX with a zero-backend build.

---

### 4.7 `scripts/ui.js`

```js
// scripts/ui.js
// DOM helpers, step navigation, toasts.

/**
 * Show a step by ID, hide all others.
 * @param {'step-upload'|'step-config'|'step-output'} stepId
 */
export function showStep(stepId) {
  document.querySelectorAll('.step').forEach((el) => {
    const isTarget = el.id === stepId
    el.hidden = !isTarget
    el.classList.toggle('step--active', isTarget)
  })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * Show / hide the loading overlay.
 */
export function setLoading(visible) {
  document.getElementById('loading-overlay').hidden = !visible
}

/**
 * Show a toast notification that auto-dismisses.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
export function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.className = `toast toast--${type}`
  toast.textContent = message
  toast.setAttribute('role', 'status')
  document.body.appendChild(toast)

  requestAnimationFrame(() => toast.classList.add('toast--visible'))
  setTimeout(() => {
    toast.classList.remove('toast--visible')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

/** Show an inline error under the upload zone */
export function showUploadError(message) {
  const el = document.getElementById('upload-error')
  el.textContent = message
  el.hidden = false
}
export function clearUploadError() {
  const el = document.getElementById('upload-error')
  el.textContent = ''
  el.hidden = true
}
```

---

### 4.8 `scripts/main.js`

```js
// scripts/main.js
// App bootstrap. Wires all modules together.

import { validateFile, fileToImageBitmap } from './upload.js'
import { compositeFrameA, compositeFrameB, randomBuilderTitle } from './canvas.js'
import { downloadImage, shareToX, DOWNLOAD_FILENAME_A, DOWNLOAD_FILENAME_B } from './share.js'
import { showStep, setLoading, showToast, showUploadError, clearUploadError } from './ui.js'

// ─── STATE ────────────────────────────────────────────────────────────────────
let currentImageBitmap = null
let currentBlob = null
let currentFormat = 'a'  // 'a' | 'b'
let currentBuilderTitle = randomBuilderTitle()

// ─── DOM REFS ─────────────────────────────────────────────────────────────────
const uploadZone       = document.getElementById('upload-zone')
const fileInput        = document.getElementById('file-input')
const photoPreview     = document.getElementById('photo-preview')
const btnChangePhoto   = document.getElementById('btn-change-photo')
const btnFormatA       = document.getElementById('btn-format-a')
const btnFormatB       = document.getElementById('btn-format-b')
const fieldsB          = document.getElementById('fields-b')
const inputName        = document.getElementById('input-name')
const inputStack       = document.getElementById('input-stack')
const builderTitleDisp = document.getElementById('builder-title-display')
const btnReroll        = document.getElementById('btn-reroll')
const btnGenerate      = document.getElementById('btn-generate')
const outputPreview    = document.getElementById('output-preview')
const btnDownload      = document.getElementById('btn-download')
const btnShareX        = document.getElementById('btn-share-x')
const btnStartOver     = document.getElementById('btn-start-over')

// ─── UPLOAD HANDLING ──────────────────────────────────────────────────────────
async function handleFile(file) {
  clearUploadError()
  const err = validateFile(file)
  if (err) { showUploadError(err); return }

  setLoading(true)
  try {
    currentImageBitmap = await fileToImageBitmap(file)  // throws if heic2any missing

    // ADR-009: use regular canvas (not OffscreenCanvas) for Safari compatibility
    const previewCanvas = document.createElement('canvas')
    previewCanvas.width = currentImageBitmap.width
    previewCanvas.height = currentImageBitmap.height
    previewCanvas.getContext('2d').drawImage(currentImageBitmap, 0, 0)
    const previewObjectURL = await new Promise((resolve) => {
      previewCanvas.toBlob((blob) => resolve(URL.createObjectURL(blob)), 'image/jpeg', 0.8)
    })
    photoPreview.src = previewObjectURL
    showStep('step-config')
  } catch (e) {
    // Show the specific error message if it came from our guards, otherwise generic
    const msg = e.message && e.message.includes('HEIC')
      ? e.message
      : 'Could not process your photo. Please try a different file.'
    showUploadError(msg)
    console.error(e)
  } finally {
    setLoading(false)
  }
}

uploadZone.addEventListener('click', () => fileInput.click())
uploadZone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click() })

fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) handleFile(e.target.files[0])
})

// Drag and drop
uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('upload-zone--drag-over') })
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('upload-zone--drag-over'))
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault()
  uploadZone.classList.remove('upload-zone--drag-over')
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
})

// ─── FORMAT TOGGLE ────────────────────────────────────────────────────────────
function setFormat(fmt) {
  currentFormat = fmt
  btnFormatA.classList.toggle('format-toggle__btn--active', fmt === 'a')
  btnFormatB.classList.toggle('format-toggle__btn--active', fmt === 'b')
  fieldsB.hidden = fmt !== 'b'
}

btnFormatA.addEventListener('click', () => setFormat('a'))
btnFormatB.addEventListener('click', () => setFormat('b'))

// ─── BUILDER TITLE RE-ROLL ────────────────────────────────────────────────────
btnReroll.addEventListener('click', () => {
  currentBuilderTitle = randomBuilderTitle()
  builderTitleDisp.textContent = currentBuilderTitle
})

// ─── GENERATE ─────────────────────────────────────────────────────────────────
btnGenerate.addEventListener('click', async () => {
  if (!currentImageBitmap) return
  setLoading(true)
  try {
    if (currentFormat === 'a') {
      currentBlob = await compositeFrameA(currentImageBitmap)
    } else {
      currentBlob = await compositeFrameB(currentImageBitmap, {
        name: inputName.value.trim(),
        stack: inputStack.value.trim(),
        builderTitle: currentBuilderTitle,
      })
    }
    outputPreview.src = URL.createObjectURL(currentBlob)
    showStep('step-output')
  } catch (e) {
    showToast('Generation failed. Please try again.', 'error')
    console.error(e)
  } finally {
    setLoading(false)
  }
})

// ─── DOWNLOAD ─────────────────────────────────────────────────────────────────
btnDownload.addEventListener('click', () => {
  if (!currentBlob) return
  const filename = currentFormat === 'a' ? DOWNLOAD_FILENAME_A : DOWNLOAD_FILENAME_B
  downloadImage(currentBlob, filename)
  showToast('Downloading your graphic! 🎉', 'success')
})

// ─── SHARE TO X ───────────────────────────────────────────────────────────────
btnShareX.addEventListener('click', async () => {
  if (!currentBlob) return
  try {
    const result = await shareToX(currentBlob, currentFormat)
    if (result === 'shared') {
      showToast('Composer opened with your graphic ready to post! 🚀', 'success')
    } else if (result === 'intent') {
      showToast('Image copied to clipboard — paste it in the tweet, then hit Post.', 'info')
    }
  } catch (e) {
    showToast('Could not share. Try downloading and posting manually.', 'error')
  }
})

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
btnChangePhoto.addEventListener('click', () => {
  fileInput.value = ''
  showStep('step-upload')
})

btnStartOver.addEventListener('click', () => {
  currentImageBitmap = null
  currentBlob = null
  currentFormat = 'a'
  fileInput.value = ''
  inputName.value = ''
  inputStack.value = ''
  currentBuilderTitle = randomBuilderTitle()
  builderTitleDisp.textContent = currentBuilderTitle
  setFormat('a')
  showStep('step-upload')
})

// ─── INIT ─────────────────────────────────────────────────────────────────────
showStep('step-upload')
builderTitleDisp.textContent = currentBuilderTitle
```

---

### 4.9 `vercel.json`

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

---

## 5. Static OG Image

Generate `assets/og-image.png` (1200×630 px) using a canvas script or by hand. It should:
- Have the dark brand background
- Say "HH GOA 2026" in large white/gold text
- Say "Get your builder frame · #FrameInGoa" in subtitle
- Use the brand accent violet for accents

This image is served statically and referenced in the `<head>` OG meta tags.

---

## 6. Quality Checklist Before Committing

For every PR / commit, verify:

- [ ] `upload.js`: JPG, PNG, HEIC all convert to ImageBitmap without error
- [ ] `canvas.js`: Format A produces a 1080×1080 PNG Blob
- [ ] `canvas.js`: Format B produces a 1080×1350 PNG Blob with name/stack/title text visible
- [ ] `share.js`: Download saves a real PNG file to the device
- [ ] `share.js`: Share to X opens a tweet with `#FrameInGoa` in the text
- [ ] Full flow works at 390 px wide (mobile viewport)
- [ ] No console errors on Chrome or Safari
- [ ] Loading overlay appears during compositing and hides on completion
- [ ] "Start over" resets all state cleanly

---

## 7. Updating `tasks.md`

After completing each group of tasks, update [`tasks.md`](./tasks.md):
- `[ ]` → `[/]` when you start a task
- `[/]` → `[x]` when you finish it
- If a new task arises, add it to the appropriate Phase section

---

## 8. What NOT to Do

- ❌ No backend, server, or serverless functions (except possibly for OG image — see ADR-007)
- ❌ No React, Vue, Svelte, Angular, or any component framework
- ❌ No Tailwind CSS or Bootstrap
- ❌ No changes to files inside `project_brain/`
- ❌ No placeholder text visible in the UI (no "Lorem ipsum")
- ❌ Do not create files outside the structure defined in §2
- ❌ Do not remove or overwrite existing `docs/` files unless instructed

---

## 9. Submission

Once deployed to Vercel:
1. Copy the live URL
2. Update `README.md` → Live Demo section with the URL
3. Submit at: **https://forms.gle/jM5hTaGvsrfEfixPA**
4. Deadline: **11:59 PM, 13 August 2026**
