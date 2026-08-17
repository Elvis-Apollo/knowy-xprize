import { env } from "cloudflare:workers";

export type DemoSource = { id: string; source: string; title: string; content: string; version: string; updatedAt: string; url: string };
export type Finding = { statement: string; sourceIds: string[] };
export type StoredIntelligence = { id: string; topic: string; answer: string; findings: string; confidence: number; status: string; checked_at: string };

const seeds: DemoSource[] = [
  { id: "acme-slack", source: "Slack", title: "#acme-account · Deployment thread", content: "Acme security review is the final blocker. The account team is waiting on the questionnaire before confirming production access.", version: "1719853200.000", updatedAt: "Jul 18, 2026", url: "https://slack.com/demo/acme" },
  { id: "acme-github", source: "GitHub", title: "Issue #184 · Complete Acme security review", content: "BLOCKED: Eight security questionnaire items remain unanswered. Owner: Priya. Production deployment cannot proceed.", version: "2026-07-19T14:10:00Z", updatedAt: "Jul 19, 2026", url: "https://github.com/demo/knowy/issues/184" },
  { id: "acme-drive", source: "Google Drive", title: "Acme Deployment Plan", content: "Production launch requires completed security approval. Target launch: July 22. Engineering work is otherwise complete.", version: "2026-07-18T09:20:00Z", updatedAt: "Jul 18, 2026", url: "https://drive.google.com/demo/acme-plan" },
  { id: "oauth-slack", source: "Slack", title: "#identity · OAuth migration decision", content: "The identity team agreed to move customer login from legacy SAML middleware to OAuth 2.1 with PKCE. SSO pilot starts with internal users.", version: "1719880100.000", updatedAt: "Jul 16, 2026", url: "https://slack.com/demo/oauth" },
  { id: "oauth-github", source: "GitHub", title: "PR #441 · OAuth 2.1 authentication", content: "OAuth callback, token rotation, and PKCE support are merged. The remaining task is production SSO configuration.", version: "2026-07-17T15:30:00Z", updatedAt: "Jul 17, 2026", url: "https://github.com/demo/knowy/pull/441" },
  { id: "oauth-drive", source: "Google Drive", title: "Identity Modernization RFC", content: "Approved decision: OAuth 2.1 becomes the default authentication protocol. Rollout is phased, with legacy login supported until September.", version: "2026-07-15T11:00:00Z", updatedAt: "Jul 15, 2026", url: "https://drive.google.com/demo/oauth-rfc" },
  { id: "pricing-slack", source: "Slack", title: "#deal-desk · Northstar pricing approval", content: "Finance approved a 12 percent enterprise discount for Northstar if the contract is signed before month end. A larger discount requires CFO review.", version: "1719912300.000", updatedAt: "Jul 18, 2026", url: "https://slack.com/demo/pricing" },
  { id: "pricing-github", source: "GitHub", title: "Issue #512 · Enterprise billing configuration", content: "Annual enterprise billing and the 12 percent Northstar discount are configured in the quote service. Tax validation remains open.", version: "2026-07-18T16:45:00Z", updatedAt: "Jul 18, 2026", url: "https://github.com/demo/knowy/issues/512" },
  { id: "pricing-drive", source: "Google Drive", title: "Enterprise Pricing Policy FY26", content: "Sales may approve discounts up to 10 percent. Finance may approve up to 15 percent. Discounts above 15 percent require CFO approval.", version: "2026-07-10T13:00:00Z", updatedAt: "Jul 10, 2026", url: "https://drive.google.com/demo/pricing-policy" },
  { id: "atlas-slack", source: "Slack", title: "#inc-atlas · API latency incident", content: "Atlas API latency began after a cache configuration rollout. The team rolled it back at 14:35 and latency returned to normal.", version: "1719934500.000", updatedAt: "Jul 19, 2026", url: "https://slack.com/demo/atlas" },
  { id: "atlas-github", source: "GitHub", title: "Incident #77 · Atlas cache regression", content: "Root cause: a five-minute cache TTL was accidentally changed to five seconds, increasing database traffic by 8x. The fix is deployed.", version: "2026-07-19T19:20:00Z", updatedAt: "Jul 19, 2026", url: "https://github.com/demo/knowy/issues/77" },
  { id: "atlas-drive", source: "Google Drive", title: "Atlas Incident Review", content: "Customer impact lasted 47 minutes. No data was lost. Follow-up actions are configuration validation and a latency rollback alert.", version: "2026-07-20T09:00:00Z", updatedAt: "Jul 20, 2026", url: "https://drive.google.com/demo/atlas-review" },
];

function db() { if (!env.DB) throw new Error("D1 binding DB is unavailable"); return env.DB; }

export async function ensureStore() {
  const d1 = db();
  await d1.batch([
    d1.prepare("CREATE TABLE IF NOT EXISTS source_records (id TEXT PRIMARY KEY, source TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, version TEXT NOT NULL, updated_at TEXT NOT NULL, url TEXT NOT NULL)"),
    d1.prepare("CREATE TABLE IF NOT EXISTS intelligence_objects (id TEXT PRIMARY KEY, topic TEXT NOT NULL, answer TEXT NOT NULL, findings TEXT NOT NULL, confidence REAL NOT NULL, status TEXT NOT NULL, checked_at TEXT NOT NULL)"),
    d1.prepare("CREATE TABLE IF NOT EXISTS intelligence_dependencies (intelligence_id TEXT NOT NULL, source_id TEXT NOT NULL, source_version TEXT NOT NULL, PRIMARY KEY (intelligence_id, source_id))"),
    d1.prepare("CREATE TABLE IF NOT EXISTS query_history (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT NOT NULL, mode TEXT NOT NULL, created_at TEXT NOT NULL)"),
  ]);
  for (const source of seeds) await d1.prepare("INSERT OR IGNORE INTO source_records (id, source, title, content, version, updated_at, url) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(source.id, source.source, source.title, source.content, source.version, source.updatedAt, source.url).run();
}

export async function getSources(): Promise<DemoSource[]> {
  await ensureStore();
  const result = await db().prepare("SELECT id, source, title, content, version, updated_at AS updatedAt, url FROM source_records").all<DemoSource>();
  return result.results;
}

export async function resetStore() {
  await ensureStore(); const d1 = db();
  await d1.batch([d1.prepare("DELETE FROM intelligence_dependencies"), d1.prepare("DELETE FROM intelligence_objects"), d1.prepare("DELETE FROM query_history"), d1.prepare("DELETE FROM source_records")]);
  for (const source of seeds) await d1.prepare("INSERT INTO source_records (id, source, title, content, version, updated_at, url) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(source.id, source.source, source.title, source.content, source.version, source.updatedAt, source.url).run();
}

export async function resolveGithubIssue() {
  await ensureStore();
  await db().prepare("UPDATE source_records SET content = ?, version = ?, updated_at = ? WHERE id = 'acme-github'").bind("RESOLVED: All Acme security questionnaire items are answered. Security approval is complete and production deployment may proceed.", "2026-07-20T20:00:00Z", "Just now").run();
}

export async function readIntelligence(id: string) {
  await ensureStore(); return db().prepare("SELECT * FROM intelligence_objects WHERE id = ?").bind(id).first<StoredIntelligence>();
}

export async function readDependencies(id: string) {
  const result = await db().prepare("SELECT source_id AS sourceId, source_version AS sourceVersion FROM intelligence_dependencies WHERE intelligence_id = ?").bind(id).all<{ sourceId: string; sourceVersion: string }>();
  return result.results;
}

export async function saveIntelligence(id: string, topic: string, input: { answer: string; findings: Finding[]; confidence: number; status: string }, sources: DemoSource[]) {
  const now = new Date().toISOString(); const d1 = db();
  await d1.prepare("INSERT INTO intelligence_objects (id, topic, answer, findings, confidence, status, checked_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET topic=excluded.topic, answer=excluded.answer, findings=excluded.findings, confidence=excluded.confidence, status=excluded.status, checked_at=excluded.checked_at").bind(id, topic, input.answer, JSON.stringify(input.findings), input.confidence, input.status, now).run();
  await d1.prepare("DELETE FROM intelligence_dependencies WHERE intelligence_id = ?").bind(id).run();
  for (const source of sources) await d1.prepare("INSERT INTO intelligence_dependencies (intelligence_id, source_id, source_version) VALUES (?, ?, ?)").bind(id, source.id, source.version).run();
  return now;
}

export async function logQuery(question: string, mode: string) { await db().prepare("INSERT INTO query_history (question, mode, created_at) VALUES (?, ?, ?)").bind(question, mode, new Date().toISOString()).run(); }
