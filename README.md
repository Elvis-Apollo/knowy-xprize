# Knowy XPRIZE

**Every client account. One clear next action.**

Knowy is a Gemini-powered account-operations agent for small agencies, consultancies, recruiters, and managed-service firms. It turns scattered client evidence into a current account-health decision, cited brief, and concrete next action.

**Build with Gemini XPRIZE category:** Small Business Services

## What it does

1. Retrieves only evidence relevant to a client-account question.
2. Checks whether a reusable account brief already exists.
3. Compares source versions to determine whether the brief is fresh.
4. Uses Gemini to classify the account as `on_track`, `at_risk`, `blocked`, or `needs_review`.
5. Produces a source-backed explanation and next action.
6. Saves the brief and its source dependencies.
7. Records every agent execution with provider, model, decision, evidence count, and timestamp.
8. Reuses fresh intelligence or refreshes it when source evidence changes.

## XPRIZE technical requirements

### Gemini in the deployed application

The production generator in `app/api/_lib/intelligence.ts` calls Gemini and requests a strict structured result. It supports:

- **Gemini on Vertex AI** using `GOOGLE_CLOUD_PROJECT_ID`, `GOOGLE_CLOUD_LOCATION`, and `GOOGLE_CLOUD_ACCESS_TOKEN`.
- **Gemini Developer API** using `GEMINI_API_KEY` for fast local testing.

The Developer API fallback uses `gemini-3.6-flash`. The verified production path uses `gemini-2.5-flash` on Vertex AI, satisfying both the required Gemini call and direct use of a Google Cloud product.

### AI-native operation

Gemini executes the core operational decision:

- account health;
- most important risk or blocker;
- what changed;
- one evidence-grounded next action; and
- the cited findings supporting that decision.

The application—not the model—controls retrieval, source access, version comparison, caching, persistence, validation, and refresh boundaries.

### Execution evidence

Each run writes an `agent_executions` record containing:

- intelligence object and account;
- user question;
- decision;
- created/reused/refreshed mode;
- Gemini provider and model;
- evidence count; and
- timestamp.

`GET /api/executions` returns the latest execution records for judging and operational evidence.

## Human versus AI

| Gemini agent | Application code | Human operator |
|---|---|---|
| Synthesizes selected evidence | Retrieves authorized records | Supplies or connects customer data |
| Classifies account health | Compares source versions | Reviews recommendations |
| Identifies the priority risk | Reuses or refreshes intelligence | Approves customer-facing actions |
| Recommends the next action | Persists citations and execution logs | Owns consent, billing, and escalation |

## Demo flow

1. Ask: **“Why is the Acme deployment delayed?”**
2. Knowy retrieves Slack, GitHub, and Google Drive evidence.
3. Gemini creates an account-health decision and next action.
4. Run the question again to demonstrate reusable intelligence.
5. Click **Resolve blocker** to change the GitHub source version.
6. Click **Refresh decision** to demonstrate stale detection and targeted refresh.
7. Show the account-health status, evidence, Gemini model, and execution ID.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

For Gemini Developer API testing:

```bash
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-3.6-flash
```

For Gemini on Vertex AI:

```bash
GOOGLE_CLOUD_PROJECT_ID=your-project
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CLOUD_ACCESS_TOKEN=your-short-lived-token
GEMINI_MODEL=gemini-2.5-flash
```

Never commit `.env.local`, API keys, access tokens, customer data, or financial records.

## Validate

```bash
npm run lint
npm test
```

## Architecture

```text
Client question
      ↓
Selective evidence retrieval
      ↓
Fresh intelligence? ── yes ──→ reuse + execution log
      ↓ no / stale
Gemini on Vertex AI
      ↓
Structured account decision
      ↓
Reusable brief + citations + dependency versions
      ↓
Agent execution log
```

## Data and safety

- Demo records are fictional.
- Unsupported questions return insufficient evidence.
- Gemini receives only selected evidence, not the full company dataset.
- Findings must cite supplied source IDs.
- External actions remain human-approved.
- A deterministic fallback keeps the demo inspectable when credentials are absent, but the XPRIZE deployment must be configured so the UI shows a Gemini provider.

## Repository history disclosure

This XPRIZE edition was created during the hackathon submission period from the Knowy hackathon prototype. The reusable retrieval, freshness, and intelligence-object foundation was adapted into a new Gemini-powered small-business account-operations workflow. The XPRIZE-specific Gemini provider, agent decision contract, execution logging, product positioning, submission materials, and production configuration are contained in this repository.

## Submission materials

- `SUBMISSION_CHECKLIST.md` — pass/fail requirements and evidence checklist.
- `SUBMISSION_NARRATIVE.md` — editable 500–1000 word narrative draft.
- `XPRIZE_5_STEP_PLAN.md` — scope and commercialization plan.
- `assets/knowy-ai-hackathon-thumbnail.png` — project thumbnail.

## Important evidence boundary

Code cannot satisfy the competition's real-user and real-revenue requirements by itself. The entrant must provide genuine third-party customer, revenue, expense, consent, and testimonial evidence. Do not fabricate or commit private evidence to this public repository.
