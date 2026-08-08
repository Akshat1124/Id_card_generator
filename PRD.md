# PRD — HH Goa 2026 Frame / ID Card Generator

**Version:** 1.0  
**Date:** 9 August 2026  
**Author:** Akshat Srivastava  
**Source:** [HH Goa 2026 Shortlisting Task PDF](./project_brain/HH_Goa_2026_Shortlisting_Task_Frame_ID_Generator.pdf)  
**Deadline:** 11:59 PM, 13 August 2026

---

## 1. Problem Statement

Attendees and hopeful participants of **HH Goa 2026** want a quick, frictionless way to signal their involvement and generate buzz on X (Twitter). Currently, there's no dedicated branded graphic tool — people either create graphics manually or not at all. This kills organic social momentum.

---

## 2. Goal

Provide a single, mobile-friendly webpage where a user:

1. Uploads their photo
2. (Optionally) fills in their name, stack, and role
3. Instantly receives a branded HH Goa 2026 graphic
4. Downloads it or shares it directly to X with `#FrameInGoa`

**Success looks like:** A user can go from "I have my photo" to "I have a shareable HH Goa graphic" in under 30 seconds, on their phone, with zero account creation.

---

## 3. User Personas

| Persona | Behaviour |
|---|---|
| **Mobile-first attendee** | Opens the link on iPhone, uploads a HEIC selfie, taps share |
| **Desktop builder** | Opens the page on laptop, fills in stack/role fields for the ID card, downloads PNG |
| **Event organiser** | Wants to verify the tool works perfectly before distributing the link |

---

## 4. Scope

### In Scope

| Feature | Priority |
|---|---|
| Format A: PFP Frame overlay | P0 |
| Format B: Builder ID Card | P0 |
| HEIC photo support | P0 |
| Client-side compositing (no server) | P0 |
| PNG download | P0 |
| Share to X (Twitter Intent) | P0 |
| Pre-filled tweet with `#FrameInGoa` | P0 |
| Mobile-responsive UI | P0 |
| OG image meta tags for link preview | P1 |
| Web Share API (native mobile sheet) | P1 |
| Multiple frame style variants | P2 |
| Dark/light mode toggle | P3 |

### Out of Scope

- User accounts, login, authentication
- Server-side image processing
- Paid features or watermark removal
- Printing / physical badge output
- Analytics dashboard (though basic analytics tags are acceptable)

---

## 5. Functional Requirements

### 5.1 Photo Upload

| ID | Requirement |
|---|---|
| FR-01 | Accept JPG, PNG, HEIC file formats |
| FR-02 | Convert HEIC to PNG client-side before compositing |
| FR-03 | Display a preview of the uploaded photo immediately after selection |
| FR-04 | Handle portrait, landscape, and square aspect ratios gracefully (auto-crop / center-fill) |
| FR-05 | Maximum file size: 20 MB (client-side check with user-friendly error) |

### 5.2 Format Selection

| ID | Requirement |
|---|---|
| FR-06 | User must be able to choose between Format A (PFP Frame) and Format B (Builder ID Card) |
| FR-07 | Format selection can happen before or after upload |
| FR-08 | Switching formats re-uses the already-uploaded photo |

### 5.3 Format B Fields

| ID | Requirement |
|---|---|
| FR-09 | Name field (text input, required for Format B) |
| FR-10 | Stack/Role field (text input or dropdown, required for Format B) |
| FR-11 | "Builder Title" — a fun, auto-generated label (e.g. "Prompt Whisperer", "Vibe Coder", "Founding Hacker") |
| FR-12 | Builder Title can be re-rolled by clicking a button |
| FR-13 | All text fields have sensible max lengths (Name: 40 chars, Stack: 60 chars) |

### 5.4 Compositing

| ID | Requirement |
|---|---|
| FR-14 | Compositing happens entirely in the browser via Canvas API |
| FR-15 | Format A output is a square image (1080×1080 px recommended) |
| FR-16 | Format B output is a portrait card (1080×1350 px or similar) |
| FR-17 | Output should feel like a high-quality branded graphic, not a filter |
| FR-18 | Compositing must complete within 3 seconds on a mid-range mobile device |

### 5.5 Download

| ID | Requirement |
|---|---|
| FR-19 | "Download" button triggers a real file download (PNG) using `canvas.toBlob()` |
| FR-20 | Default filename: `HH-Goa-2026-<format>.png` |
| FR-21 | Download must work on iOS Safari and Android Chrome |

### 5.6 Share to X

| ID | Requirement |
|---|---|
| FR-22 | "Share to X" button opens Twitter's Intent URL with pre-filled text |
| FR-23 | Pre-filled caption must include `#FrameInGoa` |
| FR-24 | Suggested pre-filled caption: _"I'm going to HH Goa 2026! 🚀 #FrameInGoa #HHGoa2026"_ |
| FR-25 | If sharing via link (not direct image attach), the link's OG image must show the actual graphic |
| FR-26 | On mobile devices with Web Share API support, offer the native share sheet as primary CTA |

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | **Performance** — time from upload to preview | < 3 seconds |
| NFR-02 | **Availability** — uptime during submission window | 99% (static hosting) |
| NFR-03 | **Mobile compatibility** | iOS Safari 16+, Android Chrome 110+ |
| NFR-04 | **No server dependency** | All processing client-side |
| NFR-05 | **Accessibility** | WCAG 2.1 AA for interactive elements |
| NFR-06 | **Bundle size** | < 500 KB total JS (gzipped) |

---

## 7. UX / Design Principles

1. **Zero friction** — No modals, no accounts, no required email
2. **Mobile-first** — Design at 390 px, enhance upwards
3. **On-brand** — Every pixel screams "HH Goa 2026"
4. **Delightful** — The graphic output should make the user smile and want to share it
5. **Fast feedback** — Instant preview on upload; no long loading states for local ops

---

## 8. Acceptance Criteria

The tool is considered complete when:

- [ ] A user on a desktop can upload a JPG/PNG and download a working Format A graphic
- [ ] A user on a desktop can upload a JPG/PNG, fill in fields, and download a working Format B graphic
- [ ] A user on an iPhone can upload a HEIC photo and the tool processes it correctly
- [ ] The Share to X button opens a tweet pre-filled with `#FrameInGoa`
- [ ] The full flow works on iOS Safari 16+ with no console errors
- [ ] A public live URL exists and is accessible without login

---

## 9. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| Q1 | Final HH Goa 2026 brand colors / logo file? | Designer / Organiser | ⏳ Pending |
| Q2 | Final frame/template design assets (PNGs)? | Designer | ⏳ Pending |
| Q3 | Exact pre-filled tweet copy? | Organiser | ⏳ Pending |
| Q4 | Hosting platform preference (Vercel, Netlify, GitHub Pages)? | Developer | 🔲 Decision needed |
| Q5 | OG image strategy: dynamic route (needs a small server) or static generated image? | Developer | 🔲 Decision needed |

---

## 10. Timeline

| Date | Milestone |
|---|---|
| 9 Aug 2026 | Repo set up, documentation complete |
| 10 Aug 2026 | Core compositing logic + upload working |
| 11 Aug 2026 | UI polished, both formats working end-to-end |
| 12 Aug 2026 | Share flow + OG image + mobile testing |
| 13 Aug 2026 (AM) | Final testing + deployment |
| 13 Aug 2026 (11:59 PM) | **Submission deadline** |
