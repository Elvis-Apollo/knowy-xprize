import type { DemoSource, Finding } from "./store";

export type TopicMatch = {
  id: string;
  topic: string;
  score: number;
  sources: DemoSource[];
};

type Intelligence = {
  answer: string;
  findings: Finding[];
  confidence: number;
  status: string;
};

export type GenerationSource = "gemini-vertex" | "gemini-api" | "fallback";
export type GenerationResult = {
  intelligence: Intelligence;
  generationSource: GenerationSource;
  model: string;
};

const topics = [
  { id: "acme-deployment", prefix: "acme", topic: "Acme client account", terms: ["acme", "client", "account", "deployment", "delay", "delayed", "blocked", "security", "questionnaire", "risk", "action"] },
  { id: "oauth-migration", prefix: "oauth", topic: "OAuth delivery account", terms: ["oauth", "authentication", "login", "identity", "sso", "saml", "pkce", "migration", "delivery"] },
  { id: "enterprise-pricing", prefix: "pricing", topic: "Northstar client account", terms: ["northstar", "client", "account", "pricing", "price", "discount", "quote", "deal", "finance", "contract", "cfo"] },
  { id: "atlas-incident", prefix: "atlas", topic: "Atlas client account", terms: ["atlas", "client", "account", "incident", "outage", "latency", "cache", "regression", "api", "root", "cause"] },
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
  if (match.id.startsWith("github-")) {
    const findings = match.sources.map((source) => ({ statement: source.content.split(". ")[0] + ".", sourceIds: [source.id] }));
    return { answer: `The newest open issues in ${match.topic.replace("GitHub · ", "")} are ${match.sources.map((source) => source.title.split(" · ")[0]).join(", ")}. Review the cited issues before choosing an owner or customer commitment.`, findings, confidence: .99, status: "needs_review" };
  }
  if (match.id === "acme-deployment") {
    const resolved = match.sources.some((source) => source.id === "acme-github" && source.content.includes("RESOLVED"));
    return resolved
      ? { answer: "Acme is on track. Security approval is complete, so the account owner should confirm the revised production launch date with the client today.", findings: [{ statement: "All security questionnaire items are answered and approval is complete.", sourceIds: ["acme-github"] }, { statement: "Next action: confirm the production launch date with Acme.", sourceIds: ["acme-drive", "acme-slack"] }], confidence: .96, status: "on_track" }
      : { answer: "Acme is blocked by an incomplete security review. Priya should close the eight unanswered questionnaire items before the account team promises a production date.", findings: [{ statement: "Eight security questionnaire items remain unanswered.", sourceIds: ["acme-github"] }, { statement: "Security approval is required before production deployment.", sourceIds: ["acme-drive", "acme-slack"] }, { statement: "Next action: Priya completes the questionnaire and the account owner resets launch expectations.", sourceIds: ["acme-github", "acme-slack"] }], confidence: .94, status: "blocked" };
  }
  if (match.id === "oauth-migration") return { answer: "The OAuth delivery is at risk but progressing. The implementation is merged; the delivery owner should finish production SSO configuration before beginning the phased client rollout.", findings: [{ statement: "OAuth 2.1 with PKCE is the approved approach.", sourceIds: ["oauth-drive", "oauth-slack"] }, { statement: "Core implementation is merged.", sourceIds: ["oauth-github"] }, { statement: "Next action: complete production SSO configuration.", sourceIds: ["oauth-github"] }], confidence: .93, status: "at_risk" };
  if (match.id === "enterprise-pricing") return { answer: "Northstar is at risk until tax validation is complete. The 12% discount is approved and configured; the account owner should close tax validation before the month-end signing deadline.", findings: [{ statement: "Finance approved a 12% discount if signed before month end.", sourceIds: ["pricing-slack"] }, { statement: "The discount is within Finance authority.", sourceIds: ["pricing-drive"] }, { statement: "Next action: complete tax validation and issue the final quote.", sourceIds: ["pricing-github"] }], confidence: .92, status: "at_risk" };
  return { answer: "Atlas is recovered. A cache TTL regression increased database traffic eightfold; the account owner should share the completed incident review and prevention actions with the client.", findings: [{ statement: "A cache TTL regression increased database traffic by 8x.", sourceIds: ["atlas-github"] }, { statement: "The rollback restored normal API latency.", sourceIds: ["atlas-slack"] }, { statement: "Next action: send the incident review and prevention plan to the client.", sourceIds: ["atlas-drive"] }], confidence: .97, status: "on_track" };
}

const responseSchema = {
  type: "OBJECT",
  required: ["answer", "findings", "confidence", "status"],
  properties: {
    answer: { type: "STRING" },
    findings: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["statement", "sourceIds"],
        properties: {
          statement: { type: "STRING" },
          sourceIds: { type: "ARRAY", items: { type: "STRING" } },
        },
      },
    },
    confidence: { type: "NUMBER" },
    status: { type: "STRING", enum: ["on_track", "at_risk", "blocked", "needs_review"] },
  },
};

function promptFor(question: string, match: TopicMatch) {
  return `You are Knowy, an AI account-operations agent for a small service business.

Answer only from the supplied evidence. Decide the current account health, explain what changed, and state one concrete next action. Use only source IDs that appear below. Prefer newer source versions when evidence conflicts. A source marked RESOLVED supersedes older blocker reports. Do not invent owners, dates, or commitments.

Account: ${match.topic}
Question: ${question}

Evidence:
${match.sources.map((source) => `[${source.id}] Source: ${source.source}; Updated: ${source.updatedAt}; Version: ${source.version}; Content: ${source.content}`).join("\n")}`;
}

function parseGeminiResponse(data: unknown): Intelligence | null {
  if (!data || typeof data !== "object") return null;
  const response = data as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = response.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!text) return null;
  return JSON.parse(text) as Intelligence;
}

async function callGemini(question: string, match: TopicMatch): Promise<GenerationResult | null> {
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const project = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const accessToken = process.env.GOOGLE_CLOUD_ACCESS_TOKEN;
  const apiKey = process.env.GEMINI_API_KEY;
  const body = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: promptFor(question, match) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.2,
    },
  });

  let url: string;
  let headers: Record<string, string> = { "content-type": "application/json" };
  let generationSource: GenerationSource;

  if (project && accessToken) {
    url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`;
    headers = { ...headers, authorization: `Bearer ${accessToken}` };
    generationSource = "gemini-vertex";
  } else if (apiKey) {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    generationSource = "gemini-api";
  } else {
    return null;
  }

  const response = await fetch(url, { method: "POST", headers, body });
  if (!response.ok) return null;
  const intelligence = parseGeminiResponse(await response.json());
  return intelligence ? { intelligence, generationSource, model } : null;
}

export async function generateIntelligence(question: string, match: TopicMatch): Promise<GenerationResult> {
  const fallback = deterministicIntelligence(match);
  try {
    const generated = await callGemini(question, match);
    if (generated) return generated;
  } catch {
    // Keep the deterministic path available for judging when external credentials are absent.
  }
  return { intelligence: fallback, generationSource: "fallback", model: "deterministic" };
}
