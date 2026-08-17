import type { DemoSource, Finding } from "./store";

export type TopicMatch = { id: string; topic: string; score: number; sources: DemoSource[] };
type Intelligence = { answer: string; findings: Finding[]; confidence: number; status: string };

const topics = [
  { id: "acme-deployment", prefix: "acme", topic: "Acme deployment", terms: ["acme", "deployment", "delay", "delayed", "blocked", "security", "questionnaire"] },
  { id: "oauth-migration", prefix: "oauth", topic: "OAuth migration", terms: ["oauth", "authentication", "login", "identity", "sso", "saml", "pkce", "migration"] },
  { id: "enterprise-pricing", prefix: "pricing", topic: "Enterprise pricing", terms: ["pricing", "price", "discount", "quote", "deal", "finance", "northstar", "contract", "cfo"] },
  { id: "atlas-incident", prefix: "atlas", topic: "Atlas incident", terms: ["atlas", "incident", "outage", "latency", "cache", "regression", "api", "root", "cause"] },
];

const stopWords = new Set(["what", "why", "when", "where", "which", "who", "how", "is", "are", "was", "were", "the", "a", "an", "and", "or", "of", "to", "for", "with", "about", "current", "status", "happening", "did", "do"]);
const words = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((word) => word.length > 1 && !stopWords.has(word));

export function retrieveForQuestion(question: string, allSources: DemoSource[]): TopicMatch | null {
  const queryWords = new Set(words(question));
  const ranked = topics.map((topic) => {
    const direct = topic.terms.reduce((score, term) => score + (queryWords.has(term) ? 3 : 0), 0);
    const topicSources = allSources.filter((source) => source.id.startsWith(`${topic.prefix}-`));
    const recordScore = topicSources.reduce((total, source) => total + words(`${source.title} ${source.content}`).filter((word) => queryWords.has(word)).length, 0);
    return { id: topic.id, topic: topic.topic, score: direct + recordScore, sources: topicSources };
  }).sort((a, b) => b.score - a.score);
  return ranked[0].score >= 3 ? ranked[0] : null;
}

export function deterministicIntelligence(match: TopicMatch): Intelligence {
  if (match.id === "acme-deployment") {
    const resolved = match.sources.some((source) => source.id === "acme-github" && source.content.includes("RESOLVED"));
    return resolved ? { answer: "Acme is no longer blocked. The security questionnaire is complete, approval has been granted, and the deployment may now proceed.", findings: [{ statement: "All security questionnaire items are answered and approval is complete.", sourceIds: ["acme-github"] }, { statement: "The cleared review removes the final deployment blocker.", sourceIds: ["acme-drive", "acme-slack"] }], confidence: .96, status: "ready" }
      : { answer: "The Acme deployment is delayed because its security review is incomplete. Eight questionnaire items remain unanswered, and production access cannot be approved until they are resolved.", findings: [{ statement: "Eight security questionnaire items remain unanswered.", sourceIds: ["acme-github"] }, { statement: "Security approval is required before production deployment.", sourceIds: ["acme-drive", "acme-slack"] }, { statement: "Engineering work is otherwise complete, making security the final blocker.", sourceIds: ["acme-drive"] }], confidence: .94, status: "blocked" };
  }
  if (match.id === "oauth-migration") return { answer: "The OAuth 2.1 migration is approved and the core implementation is merged. The remaining work is production SSO configuration, followed by a phased rollout before legacy login is retired in September.", findings: [{ statement: "OAuth 2.1 with PKCE is the approved default authentication approach.", sourceIds: ["oauth-drive", "oauth-slack"] }, { statement: "Callback, token rotation, and PKCE implementation are already merged.", sourceIds: ["oauth-github"] }, { statement: "Production SSO configuration is the remaining implementation task.", sourceIds: ["oauth-github"] }], confidence: .93, status: "in_progress" };
  if (match.id === "enterprise-pricing") return { answer: "Northstar’s 12% enterprise discount is approved by Finance and configured in the quote service. It is valid if signed before month end; tax validation remains open.", findings: [{ statement: "Finance approved a 12% discount contingent on signing before month end.", sourceIds: ["pricing-slack"] }, { statement: "The discount is within Finance’s 15% approval authority.", sourceIds: ["pricing-drive"] }, { statement: "Quote configuration is complete, while tax validation remains open.", sourceIds: ["pricing-github"] }], confidence: .92, status: "pending" };
  return { answer: "The Atlas incident was caused by a cache TTL changing from five minutes to five seconds, which increased database traffic eightfold. The rollback restored latency after 47 minutes, and no data was lost.", findings: [{ statement: "A cache TTL regression increased database traffic by 8x.", sourceIds: ["atlas-github"] }, { statement: "The rollback at 14:35 restored normal API latency.", sourceIds: ["atlas-slack"] }, { statement: "Customer impact lasted 47 minutes with no data loss.", sourceIds: ["atlas-drive"] }], confidence: .97, status: "resolved" };
}

export async function generateIntelligence(question: string, match: TopicMatch): Promise<Intelligence> {
  const fallback = deterministicIntelligence(match); const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback;
  try {
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5.2", input: `Answer only from the supplied evidence for ${match.topic}. Question: ${question}\nEvidence:\n${match.sources.map((s) => `[${s.id}] ${s.content}`).join("\n")}`, text: { format: { type: "json_schema", name: "company_intelligence", strict: true, schema: { type: "object", additionalProperties: false, required: ["answer", "findings", "confidence", "status"], properties: { answer: { type: "string" }, findings: { type: "array", items: { type: "object", additionalProperties: false, required: ["statement", "sourceIds"], properties: { statement: { type: "string" }, sourceIds: { type: "array", items: { type: "string" } } } } }, confidence: { type: "number" }, status: { type: "string" } } } } } }) });
    if (!response.ok) return fallback; const data = await response.json() as { output_text?: string }; return data.output_text ? JSON.parse(data.output_text) as Intelligence : fallback;
  } catch { return fallback; }
}
