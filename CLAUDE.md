# CLAUDE.md — Instructions for Claude

> Project-specific instructions for Claude in this repository.

## Project

**onvi-monitoring-frontend** — TypeScript React SPA (Vite) admin panel for Onvi monitoring. Stack: React 19, Ant Design, Tailwind, SWR, Zustand, Vitest, Playwright, GitHub Actions → GitHub Pages.

## Critical Rules

### Token Efficiency (MOST IMPORTANT)

- **NEVER** auto-run full test suites — costs 100K+ tokens
- **NEVER** auto-run full lint — costs 50K+ tokens
- Use `read_lints` for lint errors
- Default validation: `npm run type-check`
- Prefer single-file Vitest / targeted Playwright
- Ask before any operation that may cost 50K+ tokens
- Keep responses concise: bullets, not essays

### Security (CRITICAL)

- NEVER hardcode secrets, API keys, tokens, or Firebase secrets
- NEVER log PII
- Use env / `VITE_*` for configuration; do not commit `.env*`
- Placeholders for infra: `[AWS_ACCOUNT_ID]`, `[RESOURCE_NAME]`

### Code Standards

- Match existing patterns in `src/pages`, `src/components`, `src/api`
- Ant Design + Tailwind; do not introduce shadcn/MUI unless asked
- i18n keys for user-facing strings
- This is **frontend-only** — no SQL, migrations, or API handler scaffolding

## Project Structure

```
src/
├── api/          # HTTP clients
├── components/   # Shared UI
├── pages/        # Route screens
├── routes/       # Router config
├── services/     # Domain services
├── hooks/        # React hooks
├── config/       # App + i18n config
├── types/        # Shared types
└── …
.cursor/
├── config/project.json
├── rules/ agents/ skills/ commands/ hooks/ templates/
docs/
├── design/           # UI mockups only
└── requirements/     # BRD, FSD, plans (/kickoff)
```

## Workflow

1. Read relevant files before changing
2. Follow established patterns in the codebase
3. UI screens → `DESIGN.md`; mockups → `docs/design/`
4. Run type-check after changes (not full tests)
5. Use `read_lints` instead of full lint
6. Concise, actionable output

## Configuration

`.cursor/config/project.json` — tech stack, paths, test commands.
