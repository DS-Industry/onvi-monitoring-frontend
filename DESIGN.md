# DESIGN.md — Design System & Visual Language

> Design specification for **onvi-monitoring-frontend**.
> **Purpose:** single source of truth for generating screens.
> Visual reference lives in [docs/design/](docs/design/).
> Pair with [AGENTS.md](AGENTS.md) for agent behavior.

Do **not** invent brand colors, screens, or copy. Leave `TBD` if unknown.

## Status legend

- **[TARGET]** — design we are building toward. Not fully in code yet.
- **[CURRENT]** — what exists in the repo today (name the files).

**State of the codebase (audited 2026-08-21):** React + Vite SPA with Ant Design, Tailwind, existing pages under `src/pages/`. Brand tokens not yet centralized in this doc.

**UI:** yes — web admin panel.

---

## 1. Product overview

| | |
|---|---|
| **Name** | onvi-monitoring-frontend |
| **Product** | Frontend admin panel for Onvi monitoring |
| **Platforms** | web |
| **Personality** | TBD |
| **Feel** | TBD |
| **Anti-goals** | TBD |

**One-line mood:** TBD

### Design DNA

1. TBD
2. TBD

---

## 2. Implementation stack [CURRENT]

| Layer | Choice | Notes |
|---|---|---|
| UI kit | Ant Design (`antd`) | Also Material Tailwind / Headless UI in places |
| Styling | Tailwind CSS (+ DaisyUI) | `tailwind.config.js` |
| Navigation | React Router DOM | `src/routes`, `src/pages` |
| Icons | TBD | prefer one set; avoid mixing packs |
| Theme | TBD | Ant Design theme + Tailwind — consolidate over time |

Token source in code: `tailwind.config.js` (hex values should not live in components long-term).

### Migration checklist (CURRENT → TARGET)

1. Document brand palette / typography tokens here (do not invent — audit CSS / Ant theme)
2. Prefer Ant Design primitives for tables, forms, modals; Tailwind for layout spacing

---

## 3. Tokens

### 3.1 Color

| Token | Hex | Usage | Contrast notes |
|---|---|---|---|
| TBD | | | |

### 3.2 Typography

| Role | Family | Size / line | Class / token |
|---|---|---|---|
| Display | TBD | | |
| Body | TBD | | |
| Caption | TBD | | |
| Mono | TBD | | |

### 3.3 Shape, space, elevation

| Token | Value | Class |
|---|---|---|
| Radius card / pill / media | TBD | |
| Spacing scale | TBD | Tailwind scale |
| Screen padding | TBD | |
| Shadows | TBD | |

---

## 4. Components

### 4.1 Current library [CURRENT]

| Component | Variants / API | Gaps vs target |
|---|---|---|
| Ant Design Button / Table / Form / Modal / Drawer | project-wide | Document preferred variants |
| Shared components in `src/components/` | TBD | Catalog over time |

### 4.2 Target patterns [TARGET]

- **Buttons** — Ant Design primary / default / link
- **Cards** — layout containers; avoid nested card chrome unless interactive
- **Inputs / selection** — Ant Design Form + Select / DatePicker
- **Feedback** — `message` / Modal; loading via Spin / Skeleton
- **Navigation chrome** — existing layout in `src/layout`

---

## 5. Screens

| ID | Screen | Route | Role | Primary CTA | States | Mockup |
|---|---|---|---|---|---|---|
| S1 | TBD | | | | empty / loading / error | [docs/design/](docs/design/) |

**Navigation map:** TBD — see `src/routes` and `src/layout`

---

## 6. Mockups

**All visual mockups live in [`docs/design/`](docs/design/).** Do not paste screenshots into this file.

| File | Screen IDs | Format |
|---|---|---|
| [docs/design/README.md](docs/design/README.md) | index | markdown |
| `docs/design/S1-<slug>.html` | S1 | HTML mockup (preferred) |
| `docs/design/*.png` | optional | raster |

If `docs/design/` is empty, agents look there **before** inventing UI.

---

## 7. Motion, accessibility, do / don't

- **Motion:** prefer short fades; respect `prefers-reduced-motion`
- **A11y:** WCAG 2.1 AA; do not encode state by hue alone; labels in product language (i18n)
- **Do:** follow Ant Design + existing page patterns; add i18n keys for copy
- **Don't:** invent mockups when `docs/design/` has a file; introduce a second UI kit without agreement

---

## 8. Reference index

- Mockups: [docs/design/](docs/design/)
- Agents: [AGENTS.md](AGENTS.md)
- BRD / FSD: `docs/requirements/`
- Token source in code: `tailwind.config.js`
