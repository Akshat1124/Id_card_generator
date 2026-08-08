# Architecture Decision Records (ADRs)

> This file records every significant technical or design decision made during development. Each ADR explains the context, the options considered, the chosen option, and the rationale. **Never delete an ADR** — mark superseded ones as ⚠️ Superseded instead.

---

## ADR-001: 100% Client-Side Processing (No Backend)

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

## ADR-006: Hosting Platform — TBD

**Date:** 9 August 2026  
**Status:** ⏳ Pending Decision

### Context
The app needs to be hosted at a public URL before the 13 Aug 2026 deadline.

### Options
| Platform | Free Tier | Custom Domain | Deploy from Git | Notes |
|---|---|---|---|---|
| **Vercel** | Yes | Yes | Yes | Best DX; supports edge functions if OG image route is needed |
| **Netlify** | Yes | Yes | Yes | Great for static sites; supports Netlify Functions |
| **GitHub Pages** | Yes | Yes (CNAME) | Yes | Simplest; no serverless functions |

### Pending
Decision depends on whether we need a serverless function for the OG image (see ADR-007).

---

## ADR-007: OG Image Strategy for X Link Preview — TBD

**Date:** 9 August 2026  
**Status:** ⏳ Pending Decision

### Context
When the tool's URL is shared on X, the link preview should show a compelling branded graphic, not a blank thumbnail. The `og:image` meta tag must point to a real, publicly accessible image.

### Options Considered
| Option | Description | Pros | Cons |
|---|---|---|---|
| **Static pre-generated OG image** | A single, fixed branded image in `/assets/` | Zero infra, works with GitHub Pages | Not personalised; shows generic branding |
| **Dynamic OG image via serverless function** | Vercel/Netlify function generates an OG PNG on-demand | Can show real graphic | Requires server function; adds complexity |
| **Canvas-to-URL + hosted upload** | Upload blob to a temp CDN | Personalised preview | Complex, requires an upload service |

### Pending
**Recommended:** Start with Option 1 (static OG image) to hit the deadline. If time allows, explore Option 2 via a Vercel edge function.

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
