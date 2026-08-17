import { NextResponse } from "next/server";
import { generateIntelligence, retrieveForQuestion } from "../_lib/intelligence";
import { isGitHubQuestion, searchGitHub } from "../_lib/github";
import { getSources, logAgentExecution, logQuery, readDependencies, readIntelligence, saveIntelligence, type Finding } from "../_lib/store";

export async function POST(request: Request) {
  try {
    const { question } = await request.json() as { question?: string };
    if (!question?.trim()) return NextResponse.json({ error: "A question is required" }, { status: 400 });
    const allSources = await getSources();
    let match = retrieveForQuestion(question, allSources);
    if (isGitHubQuestion(question)) {
      const live = await searchGitHub(question);
      match = { id: `github-${live.repository.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`, topic: `GitHub · ${live.repository}`, score: 100, sources: live.sources };
    }
    if (!match) { await logQuery(question, "insufficient"); return NextResponse.json({ topic: "Insufficient evidence", answer: "I couldn’t find enough relevant company evidence to answer that reliably. Try asking about Acme deployment, OAuth migration, enterprise pricing, or the Atlas incident.", findings: [], confidence: 0, freshness: "unknown", mode: "insufficient", checkedAt: new Date().toISOString(), changedSources: [], evidence: [] }); }
    const existing = await readIntelligence(match.id); const dependencies = existing ? await readDependencies(match.id) : [];
    const changedSources = dependencies.filter((dep) => match.sources.find((s) => s.id === dep.sourceId)?.version !== dep.sourceVersion).map((dep) => dep.sourceId);
    if (dependencies.length && dependencies.length !== match.sources.length) changedSources.push(`${match.id}:result-set`);
    const mode = !existing ? "created" : changedSources.length ? "refreshed" : "reused";
    let intelligence = existing ? { answer: existing.answer, findings: JSON.parse(existing.findings) as Finding[], confidence: existing.confidence, status: existing.status } : null;
    let generationSource: "gemini-vertex" | "gemini-api" | "fallback" | "saved" = existing ? "saved" : "fallback";
    let model = existing ? "saved-intelligence" : "deterministic";
    let checkedAt = existing?.checked_at || new Date().toISOString();
    if (!intelligence || mode === "refreshed") { const generated = await generateIntelligence(question, match); intelligence = generated.intelligence; generationSource = generated.generationSource; model = generated.model; checkedAt = await saveIntelligence(match.id, match.topic, intelligence, match.sources); }
    await logQuery(question, mode);
    const execution = await logAgentExecution({ intelligenceId: match.id, topic: match.topic, question, decision: intelligence.status, mode, provider: generationSource, model, evidenceCount: match.sources.length });
    return NextResponse.json({ intelligenceId: match.id, topic: match.topic, ...intelligence, freshness: "fresh", mode, generationSource, model, execution, checkedAt, changedSources, retrievalScore: match.score, evidence: match.sources.map((s) => ({ ...s, excerpt: s.content })) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Query failed" }, { status: 500 }); }
}
