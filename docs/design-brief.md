# Design Brief — HH Goa 2026 Frame / ID Card Generator

**Version:** 2.0 — Updated from actual hhgoa.com screenshots  
**Date:** 9 August 2026

> **⚠️ Version 1.0 of this document contained WRONG placeholder colors (dark navy + violet).
> Version 2.0 is based on real screenshots of hhgoa.com and supersedes everything in v1.0.**

---

## 1. Brand Context

**HH Goa 2026** is a builder residency in Goa, organized by **2:47 PM Studio**. The visual identity is:

- **Tropical editorial** — lush forest green canvas, warm and vibrant
- **High-contrast serif display type** — massive serif headings, very editorial
- **3-color palette only** — Green + Yellow + Hot Pink. Nothing else.
- **Illustrated flat art** — Goa beach scenes (palm trees, sunset, beach shacks) in the brand palette
- **Dashed border CTAs** — signature button style with yellow fill + dashed border

The graphic output should feel like an **authentic HH Goa event credential** that matches the real website's visual identity.

---

## 2. Color Palette — CONFIRMED FROM SCREENSHOTS

### The 3-Color System

| Role | Color | Hex | Usage |
|---|---|---|---|
| **Background** | Forest Green | `#1C5E2A` | Main page background — the dominant canvas color |
| **Accent** | Bright Yellow | `#F0E040` | ALL headings, buttons, dividers, active states |
| **Decorative** | Hot Pink / Magenta | `#E91E8C` | Only for "गोवा" Devanagari accent — nowhere else |
| **Body Text** | Pure White | `#FFFFFF` | All body copy, secondary text |
| **Button Text** | Near-Black | `#0A0A0A` | Text that sits on yellow buttons |

### CSS Custom Properties (Replace v1.0 tokens entirely)

```css
:root {
  /* Brand — CONFIRMED from hhgoa.com screenshots */
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
  --color-x-black:         #000000;   /* X/Twitter brand */

  /* Button text — dark on yellow */
  --color-btn-text:        #0A0A0A;

  /* Cross divider rows */
  --color-cross-divider:   #D4C830;   /* slightly muted yellow */

  /* Shadows */
  --shadow-card:  0 8px 30px rgba(0, 0, 0, 0.4);
  --shadow-btn:   rgba(0, 0, 0, 0.4);
}
```

---

## 3. Typography — CONFIRMED FROM SCREENSHOTS

### What the Real Site Uses

- **`HACKER HOUSE` heading** — massive, full-width, condensed **high-contrast serif** with strong thin/thick stroke variation. The closest Google Font match is **`Playfair Display`** (weight 700–800).
- **Body text** — clean, readable sans-serif. **`Inter`** works perfectly.
- **Buttons / nav / footer** — ALL CAPS, heavy weight, tracked out.

### Font Tokens

```css
:root {
  --font-body:    'Inter', -apple-system, sans-serif;
  --font-heading: 'Playfair Display', Georgia, serif;
}
```

### Google Fonts URL for `index.html`

```
https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap
```

### Typography Style Rules

| Element | Font | Weight | Color | Transform |
|---|---|---|---|---|
| Step titles (h1, h2) | Playfair Display | 800 | `#F0E040` (yellow) | UPPERCASE |
| Section labels | Inter | 600 | `rgba(255,255,255,0.6)` | UPPERCASE + tracked |
| Body / FAQ text | Inter | 400 | `#FFFFFF` | Title Case |
| Button text | Inter | 700 | `#0A0A0A` on primary | UPPERCASE |
| Header logo | Inter or Playfair | 700 | `#F0E040` | UPPERCASE |
| Footer copyright | Inter | 400 | `#F0E040` | UPPERCASE |

> **No gradient clip-text on headings.** Solid yellow `#F0E040` fill only. Remove all `-webkit-background-clip: text` tricks from `.step__title`.

---

## 4. Spacing & Layout

```css
:root {
  --space-xs:   4px;
  --space-sm:   8px;
  --space-md:   16px;
  --space-lg:   24px;
  --space-xl:   40px;
  --space-2xl:  64px;

  /* All components use sharp corners, NOT pill shapes */
  --radius-sm:   4px;
  --radius-md:   4px;
  --radius-lg:   8px;
  --radius-pill: 4px;   /* Override — no pill shapes in this brand */
}
```

**Max content width**: `600px`, centered.

---

## 5. UI Component Specifications

### 5.1 Header Logo (`.header__logo`)
- Font: `var(--font-heading)` (Playfair Display)
- Color: `#F0E040` (yellow) — NOT white, NOT gradient
- Text transform: `uppercase`
- Letter spacing: `0.06em`

### 5.2 Upload Zone (`.upload-zone`)
- Border: `1.5px dashed rgba(255,255,255,0.25)` — white dashed on green
- Background: `rgba(0,0,0,0.15)` — darker panel on green bg
- Hover border: `#F0E040` (yellow glow)
- Hover box-shadow: `0 0 0 4px rgba(240,224,64,0.15)`
- Drag-over background: `rgba(240,224,64,0.08)`

### 5.3 Format Toggle Buttons (`.format-toggle__btn`)
- Border-radius: `4px` — **sharp corners**
- Inactive: `background: rgba(0,0,0,0.2)`, `border: 1.5px solid rgba(255,255,255,0.2)`
- Active: `background: #F0E040`, `color: #0A0A0A` (dark text on yellow)
- Labels: UPPERCASE, `letter-spacing: 0.05em`

### 5.4 Primary Button (`.btn--primary`) — SIGNATURE STYLE
The hhgoa.com CTA button has a distinctive **dashed border inside a yellow fill**:
- Background: `#F0E040` (yellow)
- Color: `#0A0A0A` (dark text)
- Border: `2px dashed rgba(0,0,0,0.4)` — the dashed inner border is the brand signature
- Border-radius: `4px` — **sharp, no pill**
- Text: UPPERCASE, `letter-spacing: 0.06em`
- Hover: `background: #F5E860`, `transform: translateY(-2px)`

### 5.5 Ghost Button (`.btn--ghost`)
- Background: transparent
- Border: `1.5px solid rgba(255,255,255,0.3)`
- Color: `rgba(255,255,255,0.7)`
- Border-radius: `4px`

### 5.6 X/Twitter Button (`.btn--x`)
- Background: `#000000`
- Color: `#FFFFFF`
- Border: `2px dashed rgba(255,255,255,0.2)` — matches dashed style
- Border-radius: `4px`

### 5.7 Form Inputs (`.field__input`)
- Background: `rgba(0,0,0,0.25)` — dark panel on green
- Border: `1.5px solid rgba(255,255,255,0.2)`
- Color: `#FFFFFF`
- Focus: `border-color: #F0E040`, `box-shadow: 0 0 0 3px rgba(240,224,64,0.2)`
- Border-radius: `4px`

### 5.8 Cross Divider Pattern (`.cross-divider`) — ADD THIS
The site uses rows of `×` characters as visual section separators:
```css
.cross-divider {
  color: var(--color-cross-divider);   /* #D4C830 muted yellow */
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
Add `<div class="cross-divider" aria-hidden="true">× × × × × × × × × × × × × × × × × × × × × × × × ×</div>` between major sections in `index.html`.

### 5.9 Loading Overlay (`.loading-overlay`)
- Background: `rgba(15,50,20,0.95)` — green-tinted dark overlay
- Spinner top-color: `#F0E040` (yellow)

### 5.10 Toasts (`.toast`)
- Border-radius: `4px` (not pill)
- Success: `#1A7A3A` (dark green)
- Error: `#CC3333`
- Info: `rgba(0,0,0,0.85)` with white border

---

## 6. Format A — PFP Frame Specification

```
┌─────────────────────────────┐  ← yellow border #F0E040
│                             │
│       User Photo            │  ← 1080×1080 px, cover-fit
│       (full bleed)          │
│                             │
├─────────────────────────────┤
│   HH GOA 2026  #FrameInGoa  │  ← yellow strip, dark text
└─────────────────────────────┘
```

- **Canvas size:** 1080 × 1080 px
- **Photo:** center-crop to fill canvas (cover-fit)
- **Frame overlay color:** `#F0E040` (yellow border + bottom strip)
- **Strip text:** `HH GOA 2026` — dark `#0A0A0A` on yellow
- **Hashtag:** `#FrameInGoa` — bottom-right, dark on yellow

---

## 7. Format B — Builder ID Card Specification

```
┌──────────────────────────────────────┐
│    HH GOA 2026   BUILDER PASS        │  ← yellow bar #F0E040, dark text
├──────────────────────────────────────┤
│              │  Name                 │
│  User Photo  │  Stack / Role         │  ← green bg #1C5E2A
│  (left 40%)  │  ─────────────────    │
│              │  "Builder Title"      │
├──────────────────────────────────────┤
│   GOA · AUGUST 2026  |  #HHGoa2026  │  ← yellow bar, dark text
└──────────────────────────────────────┘
```

- **Canvas size:** 1080 × 1350 px (4:5 ratio)
- **Background:** Forest green gradient `#1C5E2A` → `#174F23`
- **Header bar:** `#F0E040` yellow, dark text, full-width
- **Footer bar:** `#F0E040` yellow, dark text, full-width
- **Photo zone:** Left ~40%, dashed white outline rectangle
- **Text zone:** Right 60% — name in yellow, stack in white, builder title in yellow italic

### Canvas Text Colors (Format B)
| Element | Color | Size |
|---|---|---|
| Name | `#F0E040` (yellow) | 64px bold |
| Stack / Role | `#FFFFFF` (white) | 36px |
| Builder Title | `#F0E040` (yellow, italic) | 40px |
| Event label | `#0A0A0A` (dark on yellow bar) | 32px |

---

## 8. Placeholder Asset Requirements

Until final brand assets arrive, generate placeholders programmatically matching these specs:

### `assets/frame-a/overlay.png` (1080×1080)
- Transparent center
- Yellow `#F0E040` border ring ~40px wide
- Yellow bottom strip 120px, text `HH GOA 2026` in dark `#0A0A0A`
- `#FrameInGoa` bottom-right in dark, 24px

### `assets/frame-b/card-bg.png` (1080×1350)
- Forest green gradient background
- Yellow top bar 200px: `HH GOA 2026` + `BUILDER PASS` in dark
- Dashed white photo zone outline (left side)
- Yellow bottom bar 100px: `GOA · AUGUST 2026 | #HHGoa2026` in dark

### `assets/og-image.png` (1200×630)
- Forest green `#1C5E2A` background
- Yellow `HH GOA 2026` headline centered
- White `Frame Generator · #FrameInGoa` subtext
- Yellow border inset 20px from edge

---

## 9. Animation & Motion

- **Upload zone hover:** `border-color` + `box-shadow` transition — 200ms ease
- **Format toggle:** background/color transitions — 200ms ease
- **Step entrance:** `opacity 0→1` + `translateY(12px→0)` — 300ms ease-out
- **Preview card entrance:** scale `0.95→1` + fade — 400ms ease-out
- **Button hover:** `translateY(-2px)` lift — 150ms ease
- **No animations on canvas compositing** — keep generation perceived as instant

---

## 10. Tone & Copy Guidelines

| Element | Tone | Example |
|---|---|---|
| Builder Titles | Fun, hacker-culture | "Prompt Whisperer", "Founding Hacker", "Vibe Architect", "Zero-to-One Enjoyer", "Ship It or Skip It" |
| Download button | Action-oriented | "⬇ Download PNG" |
| Share button | Exciting | "𝕏 Share on X" |
| Upload prompt | Friendly, simple | "Drop your photo here" |
| Error messages | Clear, non-blaming | "Unsupported file type. Please use JPG, PNG, or HEIC." |

---

## 11. Open Design Questions

| # | Question | Status |
|---|---|---|
| D1 | Official HH Goa 2026 logo file (PNG/SVG)? | ⏳ Pending from organiser |
| D2 | Official frame/card design template PNGs? | ⏳ Pending from organiser |
| D3 | Exact brand color confirmation from 2:47 PM Studio? | Approximated from screenshots |
| D4 | Official event hashtags beyond `#FrameInGoa` and `#HHGoa2026`? | ⏳ Pending |
