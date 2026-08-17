import { NextResponse } from "next/server";
import { generateIntelligence, retrieveForQuestion } from "../_lib/intelligence";
import { getSources, logQuery, readDependencies, readIntelligence, saveIntelligence, type Finding } from "../_lib/store";

export async function POST(request: Request) {
  try {
    const { question } = await request.json() as { question?: string };
    if (!question?.trim()) return NextResponse.json({ error: "A question is required" }, { status: 400 });
    const allSources = await getSources(); const match = retrieveForQuestion(question, allSources);
    if (!match) { await logQuery(question, "insufficient"); return NextResponse.json({ topic: "Insufficient evidence", answer: "I couldn’t find enough relevant company evidence to answer that reliably. Try asking about Acme deployment, OAuth migration, enterprise pricing, or the Atlas incident.", findings: [], confidence: 0, freshness: "unknown", mode: "insufficient", checkedAt: new Date().toISOString(), changedSources: [], evidence: [] }); }
    const existing = await readIntelligence(match.id); const dependencies = existing ? await readDependencies(match.id) : [];
    const changedSources = dependencies.filter((dep) => match.sources.find((s) => s.id === dep.sourceId)?.version !== dep.sourceVersion).map((dep) => dep.sourceId);
    const mode = !existing ? "created" : changedSources.length ? "refreshed" : "reused";
    let intelligence = existing ? { answer: existing.answer, findings: JSON.parse(existing.findings) as Finding[], confidence: existing.confidence, status: existing.status } : null;
    let checkedAt = existing?.checked_at || new Date().toISOString();
    if (!intelligence || mode === "refreshed") { intelligence = await generateIntelligence(question, match); checkedAt = await saveIntelligence(match.id, match.topic, intelligence, match.sources); }
    await logQuery(question, mode);
    return NextResponse.json({ intelligenceId: match.id, topic: match.topic, ...intelligence, freshness: "fresh", mode, checkedAt, changedSources, retrievalScore: match.score, evidence: match.sources.map((s) => ({ ...s, excerpt: s.content })) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Query failed" }, { status: 500 }); }
}
