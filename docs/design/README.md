# docs/design — mockups

Visual source of truth for [DESIGN.md](../../DESIGN.md) (project root).

Put **one file per screen**: `S<n>-<slug>.html` (preferred for design-mode generation) or `.png` / `.pdf`.

| File | Screen IDs | Notes |
|------|------------|-------|
| `S2-fiscal-object-toggle.png` | S2 | Просмотр филиала, переключатель «Интеграция миниПК» |
| `S3-fiscal-list.png` | S3 | Список «Связка с Казначеем» |
| `S4-fiscal-card.png` | S4 | Карточка объекта, две истории |

## Rules

- Agents must look here **before** inventing UI.
- Do not paste screenshots into `DESIGN.md` — link here instead.
- HTML mockups are preferred over raster when both exist.
- Keep filenames stable (`S7-home.html`) so screen IDs in `DESIGN.md` stay valid.
