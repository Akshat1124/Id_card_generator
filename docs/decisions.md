# Architecture Decision Records (ADRs)

> This file records every significant technical or design decision made during development. Each ADR explains the context, the options considered, the chosen option, and the rationale. **Never delete an ADR** — mark superseded ones as ⚠️ Superseded instead.

---

## ADR-001: 100% Client-Side Processing (No Backend)

> **Brand assets status (9 Aug 2026):** Official logo, frame PNGs, and card template PNGs are being arranged by the project owner. Until they arrive, OpenCode must build with **placeholder assets** (see `docs/design-brief.md` §10 and `AGENTS.md` §Placeholder Assets). The code must be written so swapping in real PNGs requires only replacing files in `assets/`, with **zero code changes**.


**Date:** 9 August 2026  
**Status:** ✅ Accepted

### Context
The project requires image compositing (overlaying a frame or building an ID card). This can be done either server-side (e.g., Sharp.js on Node, PIL on Python) or client-side (Canvas API in the browser).

### Options Considered
| Option | Pros | Cons |
|---|---|---|
| **Server-side (Node + Sharp)** | Consistent output, easy to test headlessly | Requires a server, adds latency, privacy concern (photo leaves device) |
| **Client-side (Canvas API)** | Instant (no network round-trip), free, photo never leaves device | Browser quirks (iOS Safari), limited image manipulation |
| **Hybrid (upload to server, return processed image)** | Best quality control | Complex, expensive, privacy issue |

### Decision
**Client-side Canvas API only.** No server needed for image processing.

### Rationale
- Speed requirement ("a few seconds, not a loading screen") is easiest to meet client-side
- Privacy: users' photos never leave their device
- Deployment: a static site is simpler, cheaper, and more reliable
- The Canvas API is sufficient for the required operations (crop, overlay, text)

---

## ADR-002: HEIC Conversion via `heic2any`

**Date:** 9 August 2026  
**Status:** ✅ Accepted

### Context
iPhones capture photos in HEIC format by default. The Canvas API cannot decode HEIC natively in any current browser. We must convert HEIC to a supported format (PNG/JPEG) before compositing.

### Options Considered
| Option | Notes |
|---|---|
| **`heic2any`** | Pure JS, well-maintained, supports browser environments, ~200 KB gzipped |
| **`libheif.js`** | More complete but significantly heavier (~2 MB) |
| **Reject HEIC, ask user to convert** | Terrible UX for the majority of iPhone users |
| **Server-side HEIC conversion** | Contradicts ADR-001 |

### Decision
Use **`heic2any`** loaded via CDN (or npm/bundler if Vite is adopted later).

### Rationale
- Adequate quality for the use case
- Reasonable bundle size
- Actively maintained
- No server dependency

---

## ADR-003: Output Format is PNG (not JPEG)

**Date:** 9 August 2026  
**Status:** ✅ Accepted

### Context
`canvas.toBlob()` supports both `image/png` and `image/jpeg`. We need to choose one for the downloaded file.

### Decision
**PNG** for all outputs.

### Rationale
- Lossless — no compression artifacts on the frame/text overlays
- Transparency preserved (important for Format A frame compositing)
- Twitter/X handles PNG natively and at full quality
- File size is acceptable at 1080×1080 (typically 500 KB – 2 MB)

---

## ADR-004: Output Canvas Sizes

**Date:** 9 August 2026  
**Status:** ✅ Accepted

### Context
The output image dimensions affect visual quality and platform compatibility.

### Decision
| Format | Canvas Size | Rationale |
|---|---|---|
| Format A (PFP Frame) | 1080 × 1080 px | Twitter profile picture & post standard size |
| Format B (ID Card) | 1080 × 1350 px | Twitter 4:5 portrait post — maximizes feed presence |

---

## ADR-005: No JavaScript Framework

**Date:** 9 August 2026  
**Status:** ✅ Accepted

### Context
Should we use React, Vue, Svelte, or another framework for the UI?

### Decision
**Vanilla HTML/CSS/JS (ES modules).** No framework.

### Rationale
- The UI is a simple step-wizard with minimal state — no framework needed
- Faster initial load (no framework runtime to download)
- Easier for any AI coding assistant or contributor to understand without framework knowledge
- If complexity grows significantly, migrate to Vite + vanilla JS (no framework component model needed)

### Review Trigger
If the UI grows beyond 3 distinct "pages" or requires complex reactive state, revisit and potentially adopt a lightweight framework (Preact, Solid, or Svelte).

---

## ADR-006: Hosting Platform — Vercel

**Date:** 9 August 2026  
**Status:** ✅ Accepted

### Decision
**Vercel** — confirmed by project owner on 9 August 2026.

### Rationale
- Best developer experience for static sites
- Supports Vercel Edge Functions if a dynamic OG image route is needed later
- Zero-config deploy from GitHub
- Free tier is sufficient for the submission window

### Deployment Steps (for OpenCode)
1. Ensure `vercel.json` is created at repo root with correct config
2. Run `npx vercel --prod` from the repo root, or connect GitHub repo to Vercel dashboard
3. Set the output directory to `.` (root) since there is no build step for the vanilla version
4. Update `README.md` live demo link once the URL is known

---

## ADR-007: OG Image Strategy for X Link Preview

**Date:** 9 August 2026  
**Status:** ✅ Accepted

### Context
When the tool's URL is shared on X, the link preview should show a compelling branded graphic, not a blank thumbnail. The `og:image` meta tag must point to a real, publicly accessible image.

### Options Considered
| Option | Description | Pros | Cons |
|---|---|---|---|
| **Static pre-generated OG image** | A single, fixed branded image in `/assets/` | Zero infra, works on Vercel | Not personalised; shows generic branding |
| **Dynamic OG image via serverless function** | Vercel edge function generates PNG on-demand | Personalised | Adds complexity, tight deadline |
| **Canvas-to-URL + hosted upload** | Upload blob to a temp CDN | Personalised | Complex, requires an upload service |

### Decision
**Option 1 — Static pre-generated OG image.** Confirmed by project owner to hit the deadline.

### Implementation (for OpenCode)
1. Generate `assets/og-image.png` (1200×630 px) programmatically using a one-time canvas script during development
2. Content: dark brand background + "HH GOA 2026" large text + "#FrameInGoa" subtitle
3. Reference it in `index.html`:
   ```html
   <meta property="og:image" content="https://<your-vercel-domain>/assets/og-image.png">
   <meta name="twitter:image" content="https://<your-vercel-domain>/assets/og-image.png">
   ```
4. The absolute URL must be used (not a relative path) for X/Twitter card validator to pick it up
5. Validate with [Twitter Card Validator](https://cards-dev.twitter.com/validator) after deploy

---

## ADR-008: Twitter Sharing — Intent URL vs. Direct Image Attach

**Date:** 9 August 2026  
**Status:** ✅ Accepted

### Context
Twitter's Intent URL (`https://twitter.com/intent/tweet?text=…`) lets us pre-fill tweet text but **cannot attach a local image blob** directly. Users must download the image and attach it manually, or we serve a hosted image URL.

### Decision
- **Primary CTA:** "Download" button first, then "Share to X" opens Intent URL with pre-filled text
- **Mobile Enhancement:** Use Web Share API (`navigator.share({ files: [pngFile] })`) on mobile — this allows sharing the actual image file directly to Twitter/X from the device share sheet
- **Pre-filled caption:** `"I'm going to HH Goa 2026! 🚀 #FrameInGoa #HHGoa2026"`

### Rationale
The Web Share API on mobile (especially iOS 16+ and Android) supports sharing files including images, which the X mobile app can pick up directly. This gives the best mobile UX. Desktop falls back to the Intent URL.

---

## ADR-009: Avoid `OffscreenCanvas` for Photo Preview — Use Regular Canvas

**Date:** 9 August 2026  
**Status:** ✅ Accepted

### Context
The original `main.js` snippet in `AGENTS.md` used `OffscreenCanvas.convertToBlob()` to generate the photo preview thumbnail. `OffscreenCanvas` is **not supported in older iOS Safari (< 16.4)** and its `convertToBlob()` method has patchy mobile coverage.

### Decision
Do **not** use `OffscreenCanvas` anywhere in the codebase. For generating the photo preview, use a regular `<canvas>` element:

```js
// ✅ Safe: regular canvas
async function bitmapToObjectURL(bitmap) {
  const c = document.createElement('canvas')
  c.width = bitmap.width
  c.height = bitmap.height
  c.getContext('2d').drawImage(bitmap, 0, 0)
  return new Promise((resolve) => {
    c.toBlob((blob) => resolve(URL.createObjectURL(blob)), 'image/jpeg', 0.8)
  })
}
```

### Applies To
`scripts/main.js` — the photo preview generation after upload.

---

## ADR-010: `heic2any` CDN Failure — Graceful Error Path Required

**Date:** 9 August 2026  
**Status:** ✅ Accepted

### Context
`heic2any` is loaded from `cdn.jsdelivr.net`. If the CDN is down or the user's network blocks it, `window.heic2any` will be `undefined`, causing a silent crash when an iPhone user uploads a HEIC file.

### Decision
In `scripts/upload.js`, guard every `heic2any` call:

```js
if (isHeic) {
  if (typeof heic2any === 'undefined') {
    throw new Error(
      'HEIC conversion library failed to load. ' +
      'Please convert your photo to JPG on your device and try again.'
    )
  }
  blob = await heic2any({ blob: file, toType: 'image/png', quality: 0.92 })
  if (Array.isArray(blob)) blob = blob[0]
}
```

The calling code in `main.js` must catch this error and show a user-friendly toast:
```
"HEIC conversion failed. Please convert your photo to JPG and try again."
```

### Also: detect load failure at startup
In `index.html` after the `heic2any` script tag, add an inline check:
```html
<script>
  window.__heic2anyLoaded = typeof heic2any !== 'undefined'
</script>
```
Then in `upload.js`, check `window.__heic2anyLoaded` before attempting HEIC conversion.
