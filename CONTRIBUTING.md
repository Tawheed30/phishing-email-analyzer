# Contributing to Phishing Email Analyzer

Thank you for your interest in contributing! This guide covers everything you need to get started.

---

## Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/Tawheed30/phishing-email-analyzer.git
cd phishing-email-analyzer

# 2. Set up the backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env          # then add your ANTHROPIC_API_KEY

# 3. Start the backend (from project root)
uvicorn app.main:app --reload --port 8000

# 4. Set up the frontend (new terminal)
cd frontend && npm install

# 5. Start the frontend dev server
npm run dev                       # opens http://localhost:5173
```

---

## Running Tests

```bash
# Backend — 70 tests
cd backend
source .venv/bin/activate
pytest tests/ -v --tb=short

# Frontend — 67 tests
cd frontend
npm test

# Both in one go (from project root)
cd backend && source .venv/bin/activate && pytest tests/ -q && cd ../frontend && npm test
```

All tests must pass before opening a PR. CI will block merges on any failure.

---

## Branch Naming

| Prefix | When to use | Example |
|--------|-------------|---------|
| `feature/` | New functionality | `feature/export-csv-report` |
| `fix/` | Bug fixes | `fix/dkim-parse-multiline` |
| `chore/` | Deps, CI, docs, refactors | `chore/bump-fastapi-0.115` |

---

## PR Checklist

Before opening a pull request, confirm all of the following:

- [ ] **Tests pass** — `pytest tests/ -v` (backend) and `npm test` (frontend) both green
- [ ] **New behaviour is tested** — added or updated tests for any changed logic
- [ ] **Build passes** — `cd frontend && npm run build` completes without errors
- [ ] **No secrets committed** — run `git grep -r "sk-ant-" .` and confirm zero real key hits
- [ ] **`.env` not staged** — `git status` shows no `.env` files in the diff
- [ ] **README updated** — if you added a feature, endpoint, or env var, update `README.md`
- [ ] **Lint clean** — `ruff check backend/app/` and `npx tsc --noEmit` pass locally

The PR template (`.github/pull_request_template.md`) will remind you of these when you open a PR.

---

## Code Style

**Backend (Python):**
- Formatter: `ruff format` (line length 100)
- Linter: `ruff check` — F, E, W, I rules
- Type hints on all public functions

**Frontend (TypeScript):**
- Strict TypeScript (`"strict": true` in `tsconfig.json`)
- No implicit `any`
- Component files: PascalCase `.tsx`; hooks: camelCase `.ts`

---

## Security

- **Never log raw email bodies.** The `raw_email` field must not appear in any log statement.
- **No hardcoded secrets.** All credentials via environment variables only.
- If you find a security vulnerability, please open a **private** GitHub issue rather than a public one.
