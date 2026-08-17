# Knowy AI — XPRIZE Five-Step Plan

## Decision

Do not submit Knowy as a generic “company brain.”

For the Build with Gemini XPRIZE, position Knowy as:

> **The AI account-operations agent for small service businesses.**

Knowy connects the scattered information around a client account, creates a current account brief, detects changes, recommends the next action, and logs what it did. The first paying customer profile is a small agency, consultancy, recruiting firm, or managed-service provider with 5–25 employees.

Category: **Small Business Services**

## The required outcome

By August 17, 2026, Knowy must show:

1. A deployed product with at least one live Gemini API call.
2. At least one Google Cloud product in production.
3. AI agent execution that makes a useful operational decision.
4. Real users outside the founding team.
5. Arms-length third-party revenue.
6. Agent logs, API usage evidence, user feedback, and financial evidence.
7. A public three-minute demonstration and a complete repository.

## Step 1 — Make every requirement less dumb

### Requirements that are truly mandatory

- Gemini must make at least one LLM call in the deployed product.
- The product must use a Google Cloud product.
- The business must be operated with AI, not merely include a chatbot.
- The product must have real users and real revenue.
- The submission must include product, user, and financial evidence.

### Assumptions to reject

- We do not need a universal enterprise platform.
- We do not need Slack, Drive, GitHub, Notion, Jira, and CRM integrations.
- We do not need a knowledge graph.
- We do not need autonomous multi-agent coordination.
- We do not need a polished self-serve SaaS billing system before selling.
- We do not need hundreds of users. A few genuine paying customers with clear evidence are more valuable than fake scale.
- We do not need to remove GPT-5.6. Gemini can become the required primary production path while the provider boundary remains extensible.

## Step 2 — Delete

Delete or defer:

- broad “company intelligence for every enterprise” positioning;
- four unrelated demo topics as the primary story;
- simulated connector breadth as a product claim;
- ontology and company-brain language;
- background crawling;
- complex authentication and permissions;
- model picker UI;
- multi-agent architecture;
- automatic billing integration;
- nonessential animations and dashboard pages.

Keep:

- selective retrieval;
- normalized source records;
- evidence-backed answers;
- reusable intelligence objects;
- source versions and freshness;
- stale-object refresh;
- live GitHub connector as technical proof;
- deterministic demo fallback.

## Step 3 — Simplify and optimize

### One customer

Small professional-service firms managing multiple client accounts.

### One painful job

Create a trustworthy weekly client account brief and decide the next follow-up.

### One input path

For the first production version, accept:

- pasted notes;
- uploaded text/Markdown/CSV; and
- one optional live source connector.

### One agent decision

Gemini decides:

- account health: `on_track`, `at_risk`, or `blocked`;
- the most important reason;
- the next recommended action;
- the owner and due date when evidence supports them; and
- whether the existing intelligence object can be reused or needs refresh.

Application code still controls permissions, retrieval, source version comparison, persistence, and execution boundaries.

### One output

An evidence-backed account brief:

- current status;
- what changed;
- risks;
- next action;
- citations;
- freshness;
- agent execution record.

### Minimal production architecture

```text
Customer input / source records
            ↓
Deterministic retrieval and version check
            ↓
Gemini on Vertex AI
            ↓
Structured account decision
            ↓
Intelligence object + agent execution log
            ↓
Next-action brief for the customer
```

Deploy the Next.js application to **Google Cloud Run**. Use **Gemini through Vertex AI** for the required production LLM call. Store the small MVP dataset in the simplest production-compatible store available to the team; do not add infrastructure solely for appearance.

## Step 4 — Accelerate cycle time

### Daily build loop

1. Ship one production improvement.
2. Put it in front of one prospective customer.
3. Record the objection or failure.
4. Fix only the highest-friction issue.
5. Capture evidence.

### Execution sequence

#### Phase 1 — Eligibility

- Add a provider interface and Gemini/Vertex AI generator.
- Keep the current structured intelligence contract.
- Add an agent-execution log with timestamp, model, inputs used, decision, and outcome.
- Deploy to Cloud Run.
- Verify one complete production run.

#### Phase 2 — Sell before expanding

- Create a one-page offer.
- Contact 20 small agencies or consultancies.
- Offer a paid “client intelligence setup” pilot.
- Manually onboard the first customers.
- Charge immediately, even if the pilot price is small.

Suggested pilot:

> $49 for a two-week pilot covering up to five client accounts, including setup and weekly AI-generated account briefs.

#### Phase 3 — Evidence

- Preserve invoices or Stripe/payment records.
- Track revenue and expenses by month.
- Get written customer consent for submitted evidence.
- Capture testimonials and product feedback.
- Export Gemini/Vertex usage records.
- Save screenshots of agent execution logs.
- Record before/after time spent preparing account updates.

#### Phase 4 — Submission

- Record the three-minute product video.
- Write the 500–1000 word AI-native operations narrative.
- Include human-versus-AI responsibilities.
- Include jobs and economic opportunities enabled.
- Prepare simple P&L and revenue evidence.
- Verify repository access and testing instructions.

## Step 5 — Automate

Automate only after the first paid workflow works manually:

- scheduled weekly account refresh;
- source-version checks;
- automatic stale-object regeneration;
- customer delivery email;
- lead follow-up reminders;
- onboarding checklist;
- revenue and expense evidence collection;
- anonymized product metrics;
- submission evidence export.

Do not automate prospecting, billing, or connector onboarding until manual execution reveals the stable process.

## Human versus AI

### Gemini agent

- synthesizes selected evidence;
- classifies account health;
- identifies the highest-priority risk;
- recommends the next action;
- produces a structured, cited brief;
- refreshes the conclusion after evidence changes.

### Application code

- retrieves allowed records;
- compares source versions;
- decides whether cached intelligence is fresh;
- persists intelligence and execution logs;
- validates structured output;
- prevents unsupported actions.

### Human operator

- connects or supplies customer data;
- approves external actions;
- corrects evidence or conclusions;
- owns the customer relationship;
- handles billing, consent, and escalation.

## Metrics that matter

- paying customers;
- arms-length revenue;
- weekly active businesses;
- account briefs generated;
- percentage of briefs reused versus refreshed;
- time saved per client update;
- customer-confirmed useful decisions;
- Gemini agent executions and success rate;
- cost per completed brief;
- pilot-to-renewal conversion.

## Kill criteria

Stop adding product features if:

- no prospective customer agrees the weekly brief is painful;
- no one will pay even a small pilot price;
- the account decision cannot be grounded in visible evidence; or
- the workflow does not save meaningful time.

If customers reject account briefs, reuse the same intelligence engine for the closest paid workflow they repeatedly request. Do not return to broad platform-building.

## Immediate next build

1. Replace the primary OpenAI-only generation path with a provider abstraction.
2. Add Gemini through Vertex AI while preserving the existing output schema.
3. Add an `agent_executions` record and visible run history.
4. Narrow the UI to the client-account brief workflow.
5. Deploy to Cloud Run.
6. Begin paid pilot outreach before adding another connector.
