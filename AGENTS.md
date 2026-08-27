# AGENTS.md — Instructions for AI Agents

> This file provides instructions to AI agents working in this repository.

## Project Overview

**onvi-monitoring-frontend** — React + Vite admin UI for Onvi monitoring (marketing, cards, analytics, POS, finance).

UI screens follow [DESIGN.md](DESIGN.md); visual mockups live only in [docs/design/](docs/design/).

## Key Principles

### 1. Token Efficiency

- NEVER auto-run full test suites (100K+ tokens)
- NEVER auto-run full lint (50K+ tokens)
- Use `read_lints` tool instead of lint commands
- Run type-check (`npm run type-check`) as the default validation
- Prefer single-file / targeted Vitest or Playwright runs
- Require explicit user confirmation for 50K+ token operations

### 2. Security

- NEVER hardcode secrets, API keys, passwords, or Firebase config secrets
- NEVER log PII (names, emails, phones, payment data)
- Use `VITE_*` / env files for configuration — do not commit `.env*`
- Use generic placeholders for infrastructure: `[ACCOUNT_ID]`, `[RESOURCE_NAME]`

### 3. Code Conventions

- React function components + TypeScript
- UI: Ant Design + Tailwind (existing patterns in `src/`)
- Data fetching: SWR + axios; client state: Zustand where already used
- Routing: `react-router-dom` under `src/routes` / `src/pages`
- i18n: `react-i18next` — add keys to locale JSON when changing copy
- Import order: external → internal → relative
- No backend handler / SQL / migration patterns — this is a SPA only

### 4. Testing

- Unit/component: Vitest + Testing Library (`npm run test`)
- E2E: Playwright (`npm run test:e2e` / smoke tag)
- Mock external APIs in unit tests — no real backend calls
- Follow AAA (Arrange-Act-Assert)
- Coverage target: 80% (see `project.json`)

## Configuration

Project settings: `.cursor/config/project.json` (`{{CONFIG.section.key}}` placeholders).

## Component Map

- **Rules**: `.cursor/rules/*.mdc` — always-applied standards
- **Agents**: `.cursor/agents/*.md` — specialized assistants (`@ui-component-agent`, `@testing-agent`, …)
- **Skills**: `.cursor/skills/*/SKILL.md` — workflows (antd, component-creation, testing, …)
- **Commands**: `.cursor/commands/*.md` — `/kickoff`, `/type-check`, `/test-single`, …
- **Hooks**: `.cursor/hooks/*.sh` — secrets scan, format, type-check helpers
- **Design**: `DESIGN.md` + `docs/design/`

## Useful agents for this repo

| Agent | When |
|-------|------|
| `@ui-component-agent` | New/updated React UI |
| `@frontend-styling-agent` | Tailwind / Ant Design layout |
| `@frontend-state-agent` | Zustand / SWR / forms |
| `@frontend-performance-agent` | Render / bundle issues |
| `@accessibility-agent` | a11y |
| `@testing-agent` / `@e2e-testing-agent` | Vitest / Playwright |
| `@devops-ci-cd-agent` | GitHub Actions / deploy |
| `@monitoring-agent` | Datadog RUM / logs |
| `@guardrail-agent` / `@security-audit-agent` | Secrets / auth review |
| `@cursor-setup-agent` | Re-trim handbook components |
