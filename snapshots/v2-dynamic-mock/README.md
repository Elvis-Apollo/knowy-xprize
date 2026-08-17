# Knowy AI

**Ask once. Know forever.**

Knowy is a small, hackathon-ready company intelligence layer. It retrieves a focused set of enterprise evidence, creates a source-backed intelligence object, reuses that object while its dependencies are current, and refreshes it when a source changes.

Four included topics—Acme deployment, OAuth migration, enterprise pricing, and the Atlas incident—work without external credentials. Question terms are matched and ranked against normalized source records before evidence is retrieved. An optional OpenAI Responses API path generates the same structured intelligence contract when `OPENAI_API_KEY` is configured.

## What the demo proves

1. Ask **“Why is the Acme deployment delayed?”**
2. Knowy reads three mock enterprise sources and saves a cited intelligence object.
3. Ask again to see the saved object reused without repeated synthesis.
4. Click **Update GitHub issue** to resolve the security review and change its source version.
5. Click **Refresh answer**. Knowy detects the changed dependency, fetches current evidence, and refreshes the object.

The three source adapters are represented by twelve realistic Slack, GitHub, and Google Drive records. Their normalized contract is intentionally small: ID, source, title, content, version, updated time, and URL. Unsupported questions return “insufficient evidence” rather than a fabricated answer. Replace mock retrieval with real API calls later without changing the intelligence or freshness layers.

Each topic gets its own intelligence object and dependency versions, so asking about OAuth does not reuse or invalidate Acme intelligence. The original single-topic implementation remains available in `snapshots/v1-hardcoded-demo` with restore guidance in `snapshots/README.md`.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the local URL shown in the terminal. No API key is needed for the demo.

Optional OpenAI integration:

```bash
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-5.2
```

## Validate

```bash
npm run build
npm run lint
```

## Architecture

```text
Question
   ↓
Intelligence lookup ─── fresh match ───→ reuse
   ↓ no match / stale
Source router
   ↓
Slack · GitHub · Drive (mock adapters)
   ↓
Structured intelligence generator
   ↓
D1 / SQLite-compatible relational store
   ├── intelligence object
   ├── evidence references
   └── source dependency versions
```

The implementation uses a single Next.js TypeScript application, API routes, Cloudflare D1 (SQLite), and an optional OpenAI Responses API call with strict structured output. If OpenAI is unavailable, the evidence-grounded deterministic builder keeps the demo reliable.

## Key project areas

- `app/page.tsx` — polished single-page demo
- `app/api/query/route.ts` — create, reuse, and refresh flow
- `app/api/demo/route.ts` — deterministic source-change controls
- `app/api/_lib/intelligence.ts` — structured OpenAI integration and fallback
- `app/api/_lib/store.ts` — schema initialization, seed data, and persistence
- `db/schema.ts` — Postgres-portable relational shape expressed for SQLite/D1

## Scope after the hackathon

The next steps are real OAuth connectors, source-system permission propagation, event-driven version checks, human verification, and entity relationships. The MVP deliberately avoids a crawler, vector database, ontology editor, graph database, and multi-agent framework.

## Three-minute demo script

- **0:00–0:30** — The gap: company AI searches, answers, then forgets.
- **0:30–1:15** — Ask why Acme is delayed; inspect the three citations and saved intelligence object.
- **1:15–1:40** — Ask again; point out the **Reused** state.
- **1:40–2:30** — Resolve the GitHub issue, refresh, and show the updated conclusion.
- **2:30–3:00** — Vision: reusable intelligence shared safely by employees and AI agents.
