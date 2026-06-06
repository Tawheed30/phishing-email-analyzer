# Phishing Email Analyzer

A full-stack web application that analyzes raw emails for phishing indicators using Claude AI. Paste any raw email (headers + body) and receive a structured threat report with verdict, confidence score, IOCs, MITRE ATT&CK mappings, and SOC-ready recommendations — in seconds.

---

## Quick Start

```bash
# 1. Clone and enter the project
git clone <repo-url> && cd phishing-email-analyzer

# 2. Install backend dependencies
cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt

# 3. Configure your Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# 4. Start the backend API
uvicorn app.main:app --reload --port 8000

# 5. In a new terminal, start the frontend
cd frontend && npm install && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — the UI is ready.

---

## Tech Stack

| Layer         | Technology                              | Purpose                                       |
|---------------|-----------------------------------------|-----------------------------------------------|
| Frontend      | React 18 + TypeScript + Vite            | SPA with fast HMR development                 |
| Styling       | Tailwind CSS (dark cyber theme)         | Utility-first responsive design               |
| Backend       | FastAPI + Python 3.11                   | Async REST API with automatic OpenAPI docs     |
| AI Engine     | Anthropic Claude (`claude-sonnet-4-5`)  | Threat analysis and structured JSON output    |
| Validation    | Pydantic v2                             | Request/response schema enforcement           |
| Rate Limiting | slowapi 0.1.9                           | 10 req/min per IP on `/analyze`               |
| Email Parser  | Python stdlib `email` module            | RFC 2822 header and body extraction           |
| Testing       | pytest-asyncio + Vitest + RTL           | 137 tests across backend and frontend         |

---

## API Reference

### `POST /analyze`

Analyzes a raw email and returns a structured threat report.

**Request**

```json
{
  "raw_email": "From: ceo@evil-domain.com\nTo: cfo@company.com\n\nPlease wire $50,000 immediately."
}
```

| Field       | Type   | Constraints                          |
|-------------|--------|--------------------------------------|
| `raw_email` | string | 10 – 500,000 characters (after trim) |

**Response `200 OK`**

```json
{
  "verdict": "phishing",
  "confidence": 94,
  "summary": "High-confidence BEC wire fraud attempt impersonating executive.",
  "red_flags": [
    "SPF authentication failed",
    "Reply-To mismatch detected",
    "Urgency language: 'immediately'"
  ],
  "iocs": [
    {
      "type": "email",
      "value": "ceo@evil-domain.com",
      "context": "Spoofed sender address mimicking executive"
    }
  ],
  "mitre_ttps": [
    {
      "technique_id": "T1566.002",
      "technique_name": "Spearphishing Link",
      "tactic": "Initial Access"
    }
  ],
  "recommendations": [
    "Quarantine and block sender domain evil-domain.com",
    "Alert CFO and finance team",
    "Report to IT security"
  ],
  "analyst_notes": "Classic BEC pattern: executive impersonation + wire transfer urgency.",
  "processing_time_ms": 1842,
  "parsed_email": { "...": "full parsed fields" }
}
```

**Error Responses**

| Status | Cause                                      |
|--------|--------------------------------------------|
| `422`  | Input empty, too short, or exceeds 500KB   |
| `429`  | Rate limit exceeded (10 req/min per IP)    |
| `503`  | Anthropic API unavailable                  |

---

### `GET /health`

```json
{
  "status": "ok",
  "version": "5.0.0",
  "timestamp": "2025-06-05T14:32:00.000Z",
  "api_key_configured": true
}
```

---

## Built for SOC Analysts

This tool accelerates the triage phase of phishing investigations:

**Triage at scale** — Paste a suspicious email directly from your mail client or SIEM alert. The AI parses authentication headers (SPF/DKIM/DMARC), extracts all URLs and attachments, and flags display name mismatches in under 2 seconds.

**Structured threat intelligence** — Every analysis outputs machine-readable IOCs (IPs, domains, URLs, email addresses) and maps adversary behavior to MITRE ATT&CK techniques — ready to feed into your threat intel platform or incident report.

**Analyst handoff-ready** — The "Copy Report" button formats the full analysis as plain text optimized for email threads, ticket systems (Jira, ServiceNow), or Slack. No more manually extracting fields.

**History and comparison** — The last 5 analyses are preserved in-session so you can compare variants of the same campaign or re-examine an earlier sample without re-submitting.

**Typical use cases:**
- Tier-1 SOC analyst triage of end-user reported phishing
- Threat hunting: rapid characterization of suspicious emails from SIEM alerts
- Security awareness training: demonstrating phishing indicators to non-technical staff
- Incident response: extracting IOCs from emails during an active BEC investigation

---

## Project Structure

```
phishing-email-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, middleware, structured logging
│   │   ├── limiter.py           # slowapi rate limiter (env-configurable)
│   │   ├── models/schemas.py    # Pydantic request/response models
│   │   ├── routers/analyze.py   # POST /analyze endpoint
│   │   ├── services/
│   │   │   ├── email_parser.py  # RFC 2822 parser (auth headers, IOC extraction)
│   │   │   └── ai_analyzer.py   # Claude AI integration
│   │   └── prompts/system.txt   # AI system prompt for threat analysis
│   ├── tests/                   # 70 pytest tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # 10 React components (dark cyber UI)
│   │   ├── hooks/useAnalyzer.ts # State machine: analyze, retry, history
│   │   ├── services/api.ts      # Typed fetch wrapper
│   │   └── types/index.ts       # TypeScript interfaces
│   └── src/__tests__/          # 67 Vitest tests
└── README.md
```

---

## Environment Variables

| Variable             | Default     | Description                            |
|----------------------|-------------|----------------------------------------|
| `ANTHROPIC_API_KEY`  | required    | Your Anthropic API key                 |
| `ANALYZE_RATE_LIMIT` | `10/minute` | slowapi rate limit string for /analyze |

---

## Running Tests

```bash
# Backend (70 tests)
cd backend && source .venv/bin/activate && pytest tests/ -v

# Frontend (67 tests)
cd frontend && npm test
```

Total: **137 tests** — unit, integration, and component.

---

## License

MIT
