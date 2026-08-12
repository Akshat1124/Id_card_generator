# Architecture — HH Goa 2026 Frame / ID Card Generator

**Version:** 1.0  
**Last Updated:** 9 August 2026

---

## Overview

This is a **pure client-side web application**. There is no backend, no database, no server-side processing of images. Everything — file reading, format conversion, compositing, download, and sharing — happens entirely in the user's browser.

This constraint is a feature: it means zero cold-start latency, zero infrastructure cost, and zero privacy concerns about uploading personal photos to a server.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER'S BROWSER                                 │
│                                                                         │
│  ┌───────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────┐  │
│  │  Upload   │───▶│   Convert    │───▶│  Composite   │───▶│ Output  │  │
│  │  (File    │    │  HEIC→PNG    │    │  (Canvas API)│    │ (Blob)  │  │
│  │   Input)  │    │  (heic2any)  │    │              │    │         │  │
│  └───────────┘    └──────────────┘    └──────────────┘    └────┬────┘  │
│                                              ▲                  │       │
│                                              │                  │       │
│                                    ┌─────────┴──────┐          │       │
│                                    │  Frame / Card  │          │       │
│                                    │  Assets (PNG)  │          │       │
│                                    └────────────────┘          │       │
│                                                                 │       │
│                          ┌──────────────────────────┐          │       │
│                          │   Download (canvas.toBlob │◀─────────┘       │
│                          │   + <a download> link)   │                   │
│                          └──────────────────────────┘                   │
│                          ┌──────────────────────────┐                   │
│                          │   Share to X              │◀─────────────────┘│
│                          │   (Twitter Intent URL /   │                   │
│                          │    Web Share API)         │                   │
│                          └──────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Step 1 — Upload & Decode

```
User selects file
    │
    ▼
upload.js: validateFile(file)       ← check type (jpg/png/heic) & size (< 20 MB)
    │
    ├─ HEIC? → heic2any(file) → PNG Blob
    │
    ▼
createImageBitmap(blob)             ← browser decodes into ImageBitmap
    │
    ▼
ImageBitmap (in memory)             ← passed to compositing step
```

### Step 2 — Compositing (Canvas API)

**Format A — PFP Frame**

```
1. Create offscreen canvas: 1080×1080 px
2. drawImage(userPhoto, ...) with cover-fit crop (center)
3. drawImage(frameOverlayPNG, 0, 0, 1080, 1080)   ← transparent overlay on top
4. canvas.toBlob('image/png') → Blob
```

**Format B — Builder ID Card**

```
1. Create offscreen canvas: 1080×1350 px
2. draw full card (background texture, header assets, photo zone)   ← composited directly
3. drawImage(userPhoto, x, y, w, h)  with zoom/pan crop (cover-fit) ← photo zone (arched clip)
4. ctx.fillText(name, ...)                          ← render name (Playfair Display)
5. ctx.fillText(stack, ...)                         ← render stack/role (dot-separated, Inter)
6. ctx.fillText(teamName, ...)                      ← render team name (Caveat script)
7. draw footer (GOA · AUGUST 2026 || #HHGOA2026) + corner sparkles
8. canvas.toBlob('image/png') → Blob
```

> **Live preview:** the same `compositeFrameA/B` functions power the on-screen preview, regenerated
> on every change (debounced 150 ms) with zoom / position sliders passed as `fields.zoom / offsetX / offsetY`.
> Brand assets are cached in an in-module `imageCache` to keep recomposites fast.

### Step 3 — Download

```
canvas.toBlob() → Blob
    │
    ▼
URL.createObjectURL(blob) → objectURL
    │
    ▼
<a href=objectURL download="HH-Goa-2026-frame.png"> .click()
    │
    ▼
Browser saves file to device
```

### Step 4 — Share to X

**Primary (Twitter Intent):**
```
const tweetText = encodeURIComponent("I'm going to HH Goa 2026! 🚀 #FrameInGoa #HHGoa2026")
const url = `https://twitter.com/intent/tweet?text=${tweetText}`
window.open(url, '_blank')
```

**Enhanced (Web Share API on mobile):**
```
const file = new File([blob], 'hh-goa-2026.png', { type: 'image/png' })
if (isMobile && navigator.canShare?.({ files: [file] })) {
  await navigator.share({ files: [file], text: tweetText })
} else {
  // Desktop fallback: copy PNG to clipboard, then open Twitter Intent URL
  await copyImageToClipboard(blob)
  window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweetText), '_blank')
}
```

---

## Module Dependency Graph

```
main.js
  ├── upload.js        (depends on: heic2any npm/CDN)
  ├── canvas.js        (depends on: browser Canvas API, asset PNGs)
  ├── share.js         (depends on: browser Web Share API, Twitter Intent)
  └── ui.js            (depends on: DOM)
```

---

## Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| No backend | 100% client-side Canvas API | Speed, privacy, zero infra cost |
| HEIC conversion | `heic2any` (CDN/npm) | Best maintained JS HEIC decoder |
| Output format | PNG via `canvas.toBlob('image/png')` | Lossless, widely supported |
| Output resolution | 1080×1080 (A), 1080×1350 (B) | Twitter/X optimal sizes |
| Sharing | Twitter Intent URL + Web Share API fallback | Works on all platforms |
| Hosting | Static on **Vercel** | Free, instant, globally CDN'd (ADR-006) |

> Full rationale for each decision is in [`docs/decisions.md`](./decisions.md).

---

## Canvas Output Specifications

| Format | Canvas Size | Aspect Ratio | Use Case |
|---|---|---|---|
| Format A (PFP Frame) | 1080 × 1080 px | 1:1 | X profile picture |
| Format B (ID Card) | 1080 × 1350 px | 4:5 | X post image |

---

## Asset Requirements

| Asset | Format | Size | Notes |
|---|---|---|---|
| Format A frame overlay | PNG (RGBA) | 1080×1080 | Transparent center for photo |
| Format B card background | PNG (RGBA) | 1080×1350 | Photo zone must be defined |
| HH Goa 2026 logo | SVG or PNG | ≤ 200 KB | Used in UI header and on card |
| Web fonts | WOFF2 | ≤ 100 KB | Self-hosted or Google Fonts |

---

## Performance Budget

| Metric | Target |
|---|---|
| Time to first contentful paint | < 1.5 s |
| Upload → preview rendered | < 3 s |
| Total JS bundle (gzipped) | < 500 KB |
| HEIC conversion time | < 2 s for typical iPhone selfie |

---

## Browser Compatibility

| Browser | Min Version | Notes |
|---|---|---|
| Chrome (Android) | 110+ | Primary mobile target |
| Safari (iOS) | 16+ | `canvas.toBlob()` works; test carefully |
| Chrome (Desktop) | 110+ | Full support |
| Firefox (Desktop) | 115+ | Full support |
| Samsung Internet | 21+ | Web Share API may vary |

### Known Quirks

- **iOS Safari + canvas download:** `canvas.toBlob()` + `<a download>` works on iOS 16+; test on actual device.
- **HEIC on Android:** `heic2any` handles this, but processing may be slower on low-end Androids.
- **Web Share API with files:** Not supported on desktop Chrome/Firefox; Twitter Intent URL is the fallback.
