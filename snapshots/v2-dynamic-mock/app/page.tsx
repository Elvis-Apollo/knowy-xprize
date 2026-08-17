"use client";

import { useEffect, useState } from "react";

type Evidence = { id: string; source: string; title: string; excerpt: string; updatedAt: string; url: string };
type Result = {
  topic: string; answer: string; findings: { statement: string; sourceIds: string[] }[];
  confidence: number; freshness: string; mode: "created" | "reused" | "refreshed" | "insufficient";
  checkedAt: string; evidence: Evidence[]; changedSources?: string[];
};

const demoQuestion = "Why is the Acme deployment delayed?";

export default function Home() {
  const [question, setQuestion] = useState(demoQuestion);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState(["Slack", "GitHub", "Google Drive"]);
  const [notice, setNotice] = useState("Demo data ready");
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState("Ready for the next demo action");

  async function ask(nextQuestion = question, action = "query") {
    setQuestion(nextQuestion);
    setActiveAction(action); setActionFeedback("Checking sources and saved intelligence…");
    setLoading(true); setNotice("Checking company intelligence…");
    try {
      const response = await fetch("/api/query", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: nextQuestion }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Query failed");
      setResult(data);
      setNotice(data.mode === "created" ? "New intelligence created" : data.mode === "reused" ? "Fresh intelligence reused" : data.mode === "refreshed" ? "Stale intelligence refreshed" : "No reliable evidence found");
      setActionFeedback(data.mode === "created" ? `${data.topic} intelligence was created.` : data.mode === "reused" ? `${data.topic} was reused without rebuilding it.` : data.mode === "refreshed" ? `${data.topic} was refreshed from changed evidence.` : "No supported evidence matched that question.");
    } catch (error) { const message = error instanceof Error ? error.message : "Something went wrong"; setNotice(message); setActionFeedback(`Action failed: ${message}`); }
    finally { setLoading(false); setActiveAction(null); }
  }

  async function changeSource() {
    setActiveAction("change-source"); setActionFeedback("Updating GitHub issue #184…"); setLoading(true);
    const response = await fetch("/api/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "resolve" }) });
    if (response.ok) { setNotice("GitHub issue changed — saved intelligence is now stale"); setActionFeedback("GitHub changed. Acme intelligence is now stale—click Refresh answer."); setSources(["Slack", "GitHub · updated", "Google Drive"]); }
    else setActionFeedback("The GitHub update failed. Please try again.");
    setLoading(false); setActiveAction(null);
  }

  async function resetDemo() {
    setActiveAction("reset"); setActionFeedback("Resetting demo data…"); setLoading(true); await fetch("/api/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "reset" }) });
    setResult(null); setSources(["Slack", "GitHub", "Google Drive"]); setNotice("Demo reset — no saved intelligence"); setActionFeedback("Demo reset and ready"); setLoading(false); setActiveAction(null);
  }

  useEffect(() => { fetch("/api/health").catch(() => undefined); }, []);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">K</span><span>Knowy</span></div>
        <nav aria-label="Primary navigation">
          <button className="navItem active"><span>✦</span> Ask Knowy</button>
          <button className="navItem"><span>▱</span> Intelligence</button>
          <button className="navItem"><span>⌁</span> Sources</button>
        </nav>
        <div className="sourcePanel">
          <p className="eyebrow">CONNECTED SOURCES</p>
          {sources.map((source, index) => <div className="sourceRow" key={source}><span className={`sourceIcon s${index}`}>{index === 0 ? "S" : index === 1 ? "G" : "D"}</span><span>{source}</span><i /></div>)}
        </div>
        <div className="sidebarFooter"><span className="avatar">EC</span><div><strong>Demo workspace</strong><small>3 sources connected</small></div></div>
      </aside>

      <section className="workspace">
        <header className="topbar"><div><strong>Company intelligence</strong><span className="live"><i /> Live demo</span></div><button className="reset" onClick={resetDemo}>Reset demo</button></header>
        <div className="content">
          <div className="hero">
            <p className="kicker">KNOWY AI</p>
            <h1>Ask once.<br/><em>Know forever.</em></h1>
            <p>Knowy retrieves only the company evidence your question needs, then turns it into reusable intelligence that stays current.</p>
          </div>

          <form className="askBox" onSubmit={(event) => { event.preventDefault(); ask(); }}>
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} aria-label="Ask a company question" />
            <div className="askFooter"><span><kbd>↵</kbd> Ask across 3 sources</span><button disabled={loading || !question.trim()}>{loading ? "Working…" : "Ask Knowy"} <b>→</b></button></div>
          </form>

          <div className="statusLine"><span className={loading ? "pulse" : ""} />{notice}</div>

          {!result ? (
            <div className="starterGrid">
              <button onClick={() => ask(demoQuestion, "acme")}><span>01</span><strong>Acme deployment</strong><p>Why is the Acme deployment delayed?</p></button>
              <button onClick={() => ask("What is the status of the OAuth migration?", "oauth")}><span>02</span><strong>OAuth migration</strong><p>What is the status of the OAuth migration?</p></button>
              <button onClick={() => ask("Was the Northstar enterprise discount approved?", "pricing")}><span>03</span><strong>Enterprise pricing</strong><p>Was the Northstar discount approved?</p></button>
              <button onClick={() => ask("What caused the Atlas API incident?", "atlas")}><span>04</span><strong>Atlas incident</strong><p>What caused the Atlas API incident?</p></button>
            </div>
          ) : (
            <section className="answerCard" aria-live="polite">
              <div className="answerHeader">
                <div><span className="intelLabel">INTELLIGENCE OBJECT</span><h2>{result.topic}</h2></div>
                <div className={`mode ${result.mode}`}>{result.mode === "created" ? "✦ Created" : result.mode === "reused" ? "↗ Reused" : result.mode === "refreshed" ? "↻ Refreshed" : "? Not found"}</div>
              </div>
              {result.mode === "refreshed" && <div className="changeBanner"><strong>Source change detected</strong><span>GitHub issue was updated. Knowy refreshed this intelligence using the changed evidence.</span></div>}
              <p className="answerText">{result.answer}</p>
              <div className="findings">
                {result.findings.map((finding, index) => <div key={finding.statement}><span>{index + 1}</span><p>{finding.statement} <sup>{finding.sourceIds.map((id) => result.evidence.findIndex((e) => e.id === id) + 1).join(", ")}</sup></p></div>)}
              </div>
              <div className="metaRow"><span><small>CONFIDENCE</small><strong>{result.confidence ? `${Math.round(result.confidence * 100)}%` : "—"}</strong></span><span><small>FRESHNESS</small><strong className={result.freshness === "fresh" ? "freshDot" : ""}>● {result.freshness}</strong></span><span><small>LAST CHECKED</small><strong>Just now</strong></span></div>
              {result.evidence.length > 0 && <div className="evidenceSection"><div className="sectionTitle"><h3>Evidence</h3><span>{result.evidence.length} sources used</span></div>
                <div className="evidenceGrid">{result.evidence.map((item, index) => <a key={item.id} href={item.url} target="_blank" rel="noreferrer"><div className="evidenceTop"><span className={`sourceIcon s${index}`}>{item.source[0]}</span><small>{item.source}</small><b>{index + 1}</b></div><strong>{item.title}</strong><p>{item.excerpt}</p><time>{item.updatedAt}</time></a>)}</div>
              </div>}
              <div className={`actionFeedback ${loading ? "working" : ""}`} role="status" aria-live="polite"><span>{loading ? "●" : "✓"}</span>{actionFeedback}</div>
              {result.topic === "Acme deployment" ? <div className="demoActions"><button onClick={() => ask("What is the current Acme status?", "reuse")} disabled={loading}>{activeAction === "reuse" ? "Checking…" : "Ask again"}<span>Shows reuse</span></button><button onClick={changeSource} disabled={loading}>{activeAction === "change-source" ? "Updating…" : "Update GitHub issue"}<span>Creates staleness</span></button><button onClick={() => ask("Is Acme still blocked?", "refresh")} disabled={loading}>{activeAction === "refresh" ? "Refreshing…" : "Refresh answer"}<span>Detects change</span></button></div> : <div className="demoActions"><button onClick={() => ask(question, "reuse")} disabled={loading}>{activeAction === "reuse" ? "Checking…" : "Ask again"}<span>Shows reuse</span></button><button onClick={() => ask(demoQuestion, "acme")} disabled={loading}>{activeAction === "acme" ? "Loading…" : "Ask about Acme"}<span>New intelligence</span></button><button onClick={() => ask("What caused the Atlas API incident?", "atlas")} disabled={loading}>{activeAction === "atlas" ? "Loading…" : "Ask about Atlas"}<span>Dynamic retrieval</span></button></div>}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
