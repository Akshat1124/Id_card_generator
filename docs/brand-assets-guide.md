# Brand Assets Guide — HH Goa 2026
### Official assets extracted directly from hhgoa.com · Added 9 August 2026

> **CRITICAL INSTRUCTION FOR OPENCODE**: All assets in `assets/brand/` are extracted from the **official hhgoa.com website**. The UI of this project MUST visually match hhgoa.com as closely as possible. These assets are the ground truth. Use them. Do not generate or invent replacements.

---

## Asset Inventory (`assets/brand/`)

| File | What it is | Size |
|---|---|---|
| `goa_hindi.svg` | **"गोआ"** — Devanagari script in yellow fill + hot pink outline stroke. The signature decorative accent from the hero section. | 25 KB |
| `hacker_house_wordmark_sm.svg` | **"HACKER HOUSE"** editorial SVG wordmark — yellow `#FEE101`, two-line layout, high-contrast serif style | 26 KB |
| `hacker_house_wordmark_lg.svg` | **"HACKERHOUSE"** same wordmark, taller/larger variant | 26 KB |
| `decorative_border.svg` | Repeating teardrop/leaf shapes in **green `#9AC95F`**, 1282px wide — used as a horizontal section divider on the real site | 35 KB |
| `logo_247pm.svg` | **"2:47"** studio logo — the designer's mark. Yellow fill `#FEE101`. Multi-letterform SVG. | 32 KB |
| `sunrise_illustration.png` | Full Goa beach/sunrise illustration — palm trees, beach shacks, sky in green/yellow palette. Large hero image. | 3.1 MB |
| `hackers.png` | Group photo/illustration of hackers at the event | 2 MB |
| `footer_trees.png` | Palm tree illustration used at the footer of hhgoa.com | 2.3 MB |
| `details.png` | Event details section illustration | 2 MB |
| `agenda.png` | Agenda section illustration | 2.4 MB |

---

## How to Use Each Asset

### In the Web UI (`index.html` + `styles/components.css`)

#### 1. Header — Replace plain text logo with real wordmark

**Current** (plain text):
```html
<div class="header__logo">HH GOA 2026</div>
```

**Target** (real SVG wordmark):
```html
<div class="header__logo">
  <img src="assets/brand/hacker_house_wordmark_sm.svg"
       alt="Hacker House Goa 2026"
       class="header__wordmark">
</div>
```

CSS for the wordmark:
```css
.header__wordmark {
  height: 48px;        /* scale to fit header height */
  width: auto;
  display: block;
  margin: 0 auto;
}
```

#### 2. Header — Add "गोआ" Devanagari decorative accent

Add the `goa_hindi.svg` as a decorative overlay next to or behind the wordmark:
```html
<div class="header__logo-wrap">
  <img src="assets/brand/hacker_house_wordmark_sm.svg" alt="Hacker House" class="header__wordmark">
  <img src="assets/brand/goa_hindi.svg" alt="" aria-hidden="true" class="header__goa-hindi">
</div>
```

CSS:
```css
.header__logo-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.header__goa-hindi {
  height: 40px;
  width: auto;
  opacity: 0.9;
}
```

#### 3. Replace `× × ×` text dividers with real decorative border

The `decorative_border.svg` is the actual section divider from hhgoa.com (green teardrop shapes). Replace the plain cross-divider text:

**Current** (`index.html`):
```html
<div class="cross-divider" aria-hidden="true">× × × × × × × × ×</div>
```

**Target**:
```html
<div class="cross-divider" aria-hidden="true">
  <img src="assets/brand/decorative_border.svg" alt="" class="divider__img">
</div>
```

CSS:
```css
.cross-divider {
  text-align: center;
  padding: 4px 0;
  overflow: hidden;
  line-height: 0;
}
.divider__img {
  width: 100%;
  max-width: 100%;
  height: 20px;
  object-fit: cover;
  opacity: 0.7;
}
```

#### 4. Footer — Add palm tree illustration

Add `footer_trees.png` as a decorative background behind the footer:
```html
<footer class="site-footer">
  <img src="assets/brand/footer_trees.png" alt="" aria-hidden="true" class="footer__trees">
  <p>HH Goa 2026 · <a href="https://forms.gle/jM5hTaGvsrfEfixPA" target="_blank" rel="noopener">Submit your entry</a></p>
</footer>
```

CSS:
```css
.site-footer {
  position: relative;
  overflow: hidden;
}
.footer__trees {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 700px;
  opacity: 0.12;   /* very subtle — behind text */
  pointer-events: none;
  z-index: 0;
}
.site-footer p { position: relative; z-index: 1; }
```

#### 5. Upload zone background — Use sunrise illustration (subtle)

Add `sunrise_illustration.png` as a very low-opacity background to the main app area to give it the tropical feel:
```css
.app {
  position: relative;
}
.app::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('../assets/brand/sunrise_illustration.png') center bottom / cover no-repeat;
  opacity: 0.04;   /* extremely subtle — just a texture hint */
  pointer-events: none;
  z-index: 0;
  border-radius: inherit;
}
.step { position: relative; z-index: 1; }
```

---

## How to Use Assets in the CANVAS (Generated Graphics)

### Format A — PFP Frame (`canvas.js` → `compositeFrameA`)

Add the `goa_hindi.svg` as a small watermark on the generated frame:
- Load it via `loadImage('assets/brand/goa_hindi.svg', fallback)`
- Draw it at the **bottom-left corner** of the frame, approx. `60×60px`, with `globalAlpha = 0.85`
- This directly matches how hhgoa.com uses it — as a decorative accent

```js
// Inside compositeFrameA, after drawing the overlay:
const goaHindi = await loadImage('assets/brand/goa_hindi.svg', () => {})
if (goaHindi.width > 0) {
  ctx.save()
  ctx.globalAlpha = 0.85
  ctx.drawImage(goaHindi, 40, FRAME_A_SIZE - 100, 80, 80)
  ctx.restore()
}
```

### Format B — Builder ID Card (`canvas.js` → `compositeFrameB`)

Use the `hacker_house_wordmark_sm.svg` in the **header bar** of the card instead of plain canvas text:
- Load it and draw it centered in the yellow top bar (y: 0–200px)
- This replaces the `ctx.fillText('HH GOA 2026', ...)` call

Also add `goa_hindi.svg` as a decorative element in the **footer bar**:
- Draw it at the right end of the yellow bottom bar, small (~50px height)
- `globalAlpha = 0.7`

Add the `decorative_border.svg` as a thin horizontal line between the photo zone and text zone:
- Load and draw at `x: 480, y: 490, width: 560, height: 20`
- This replaces the manual `ctx.strokeStyle` divider line

---

## Color Accuracy Notes (from SVG source)

Reading the downloaded SVGs confirmed these **exact brand color values**:

| Color name | Exact hex from SVG | Where used |
|---|---|---|
| Brand Yellow | **`#FEE101`** | All wordmarks, goa_hindi fill, decorative elements |
| Brand Pink | **`#FF0080`** | goa_hindi outline/stroke — hot pink |
| Border Green | **`#9AC95F`** | decorative_border.svg fill — lighter tropical green |

> **NOTE**: The yellow is `#FEE101` (not `#F0E040` as we estimated earlier). These are very close but `#FEE101` is the accurate value. Update `--color-brand-accent` in `main.css` to `#FEE101`.

---

## Files OpenCode Must NOT Use in Production UI

These are event-specific content images for the hhgoa.com main site only. Do not embed them directly in the UI (they are very large PNGs and not relevant to the generator):

- `hackers.png` — group photo, 2 MB
- `details.png` — event details illustration, 2 MB  
- `agenda.png` — agenda section illustration, 2.4 MB
- `sunrise_illustration.png` — only use at very low opacity as texture (see §5 above)

---

## Summary of All Changes Required

| Area | Change | Asset |
|---|---|---|
| `index.html` header | Replace text logo with SVG wordmark | `hacker_house_wordmark_sm.svg` |
| `index.html` header | Add Devanagari "गोआ" accent | `goa_hindi.svg` |
| `index.html` dividers | Replace `× × ×` text with real border SVG | `decorative_border.svg` |
| `index.html` footer | Add palm tree illustration behind footer | `footer_trees.png` |
| `styles/main.css` | Update `--color-brand-accent` from `#F0E040` → `#FEE101` | (from SVG source) |
| `styles/components.css` | Add `.header__wordmark`, `.header__goa-hindi`, `.footer__trees`, `.divider__img` | — |
| `scripts/canvas.js` | Use wordmark SVG in card header bar | `hacker_house_wordmark_sm.svg` |
| `scripts/canvas.js` | Add goa_hindi watermark to both formats | `goa_hindi.svg` |
| `scripts/canvas.js` | Use decorative_border SVG as card divider | `decorative_border.svg` |
