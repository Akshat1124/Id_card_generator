# Design Brief — HH Goa 2026 Frame / ID Card Generator

**Version:** 1.0  
**Date:** 9 August 2026

> This document defines the visual identity, brand guidelines, and design specifications for the UI and the generated graphics. Update this file as soon as final brand assets are received.

---

## 1. Brand Context

**HH Goa 2026** is a builder-focused event in Goa. The vibe is:
- Energetic and modern — builders, hackers, founders
- Tropical meets tech — Goa backdrop + startup culture
- Exclusive but warm — shortlisted builders, community feeling

The graphic output should feel like a **premium event credential**, not a generic image filter.

---

## 2. Color Palette

> ⚠️ **Pending:** Final brand colors to be confirmed by the event organiser. The palette below is a placeholder derived from typical HH branding patterns. Update when official assets are received.

### Primary Palette (Proposed)

| Role | Color | Hex | Notes |
|---|---|---|---|
| Brand Primary | Deep Navy | `#0A0E1A` | Background base |
| Brand Accent | Electric Violet | `#6C47FF` | CTA buttons, highlights |
| Brand Gold | Warm Gold | `#F5C518` | Name text on card, premium feel |
| Surface | Dark Charcoal | `#141824` | Card / container background |
| Text Primary | Off-White | `#F0F0F0` | Main body text |
| Text Secondary | Muted Gray | `#8A8FA8` | Labels, captions |
| Success | Mint Green | `#22C55E` | Download confirmation |

### CSS Custom Properties

```css
:root {
  /* Brand */
  --color-brand-primary:   #0A0E1A;
  --color-brand-accent:    #6C47FF;
  --color-brand-gold:      #F5C518;

  /* Surfaces */
  --color-bg:              #0A0E1A;
  --color-surface:         #141824;
  --color-surface-raised:  #1E2433;
  --color-border:          rgba(255, 255, 255, 0.08);

  /* Text */
  --color-text-primary:    #F0F0F0;
  --color-text-secondary:  #8A8FA8;
  --color-text-accent:     #6C47FF;

  /* Semantic */
  --color-success:         #22C55E;
  --color-error:           #EF4444;
  --color-warning:         #F59E0B;
}
```

---

## 3. Typography

### UI Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Page heading | **Inter** | 800 | 2rem – 3rem |
| Section heading | **Inter** | 700 | 1.25rem – 1.5rem |
| Body | **Inter** | 400 | 1rem |
| Labels/captions | **Inter** | 500 | 0.875rem |
| Button | **Inter** | 600 | 1rem |

**Load via Google Fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Canvas Typography (Generated Graphics)

| Element | Font | Weight | Size (canvas px) | Color |
|---|---|---|---|---|
| Name (Format B) | Inter | 800 | 64px | `#F5C518` (Gold) |
| Stack / Role | Inter | 500 | 36px | `#F0F0F0` |
| Builder Title | Inter | 700 italic | 40px | `#6C47FF` (Accent) |
| Event Label (HH Goa 2026) | Inter | 700 | 32px | `#F0F0F0` |

> **Note:** Canvas text rendering requires loading the font before drawing. Use `document.fonts.load('700 64px Inter')` before calling canvas text functions.

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

  --radius-sm:  8px;
  --radius-md:  16px;
  --radius-lg:  24px;
  --radius-pill: 999px;
}
```

**Layout:** Max content width `720px`, centered, with `1rem` side padding on mobile.

---

## 5. UI Component Specifications

### Upload Zone
- Large dashed border (2px dashed `--color-border`)
- Centered icon (upload arrow) + "Tap to upload or drag your photo here"
- Subtle hover/active glow effect (box-shadow with accent color)
- Minimum tap target: 44×44 px (for touch)

### Format Toggle (A / B)
- Two segmented buttons side by side
- Active state: filled with `--color-brand-accent`, white text
- Inactive state: transparent border, muted text
- Smooth 200ms transition on switch

### Primary Button (Download / Share)
- Background: `--color-brand-accent` (`#6C47FF`)
- Hover: 10% lighter / scale(1.02) transform
- Active: scale(0.98)
- Border-radius: `--radius-pill`
- Padding: `14px 28px`
- Full-width on mobile

### Card Preview Container
- Rounded corners: `--radius-lg`
- Shadow: `0 20px 60px rgba(0,0,0,0.5)`
- Max width: `360px`, centered

---

## 6. Format A — PFP Frame Specification

```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │       User Photo        │ │  ← square crop, 1080×1080 base
│ │                         │ │
│ └─────────────────────────┘ │
│      [ FRAME OVERLAY ]      │  ← semi-transparent frame sits on top
│   HH Goa 2026 branding at   │
│   corners / edges            │
└─────────────────────────────┘
```

- **Canvas size:** 1080 × 1080 px
- **Photo:** center-crop to fill the canvas completely (cover-fit)
- **Frame overlay:** PNG with transparent center, HH Goa 2026 branding at corners/edges

---

## 7. Format B — Builder ID Card Specification

```
┌─────────────────────────────────────┐
│         HH GOA 2026                 │  ← event name / logo
│         BUILDER PASS                │
├──────────────┬──────────────────────┤
│              │  Name                │
│  User Photo  │  Stack / Role        │
│  (cropped)   │  ─────────────────   │
│              │  "Builder Title"     │
├──────────────┴──────────────────────┤
│   GOA · AUGUST 2026  |  #HHGoa2026  │  ← footer strip
└─────────────────────────────────────┘
```

- **Canvas size:** 1080 × 1350 px (4:5 ratio)
- **Photo zone:** Left ~40% of card, vertically centered, rounded corners, circular or rectangular crop
- **Text zone:** Right 60% of card
- **Header:** Full-width, contains event name + logo
- **Footer:** Full-width dark strip with event details and hashtag
- **Background:** Dark gradient or textured background consistent with brand palette

---

## 8. Tone & Copy Guidelines

| Element | Tone | Example |
|---|---|---|
| Builder Titles (Format B) | Fun, aspirational, hacker-y | "Prompt Whisperer", "Founding Hacker", "Vibe Architect", "Zero-to-One Enjoyer", "Full-Stack Dreamer", "Ship It or Skip It", "Context Window Surfer" |
| Download button | Action-oriented | "Download Your Card" |
| Share button | Exciting | "Share on X 🚀" |
| Upload prompt | Friendly, simple | "Drop your photo here" |
| Error messages | Clear, non-blaming | "That file format isn't supported. Try JPG, PNG, or HEIC." |

---

## 9. Animation & Motion

- **Upload zone hover:** `border-color` transition, `box-shadow` glow — 200ms ease
- **Format toggle:** Background color transition — 200ms ease
- **Step transitions:** `opacity 0→1` + `translateY(8px→0)` — 300ms ease-out
- **Preview card entrance:** Scale `0.95→1` + fade in — 400ms ease-out
- **Button hover:** `transform: scale(1.02)` — 150ms ease
- **No animations on compositing** — keep the canvas operations perceived as instant

---

## 10. Open Design Questions

| # | Question | Status |
|---|---|---|
| D1 | Official HH Goa 2026 logo file? | ⏳ Pending from organiser |
| D2 | Official frame/card design template PNGs? | ⏳ Pending from organiser |
| D3 | Official brand colors (confirm or update palette above)? | ⏳ Pending from organiser |
| D4 | Exact official event hashtags and tweet copy? | ⏳ Pending from organiser |
