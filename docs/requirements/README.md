# Requirements

Put intake docs here so `/kickoff` can find them.

```
docs/requirements/
  BRD.md
  FSD.md
  plans/
    <TICKET>.plan.md    # written after /kickoff approval
```

- **BRD.md** — business goals, users, constraints
- **FSD.md** — functional slices with ticket ids (e.g. BR-17)
- **plans/** — implementation plans from `/kickoff` (do not hand-author unless replacing a kickoff output)

UI spec is **not** in this folder:

- **`DESIGN.md`** (project root) — design system / visual language
- **`docs/design/`** — mockups (`S<n>-<slug>.html` or `.png`)
