import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("presents the focused XPRIZE account-operations product", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);
  assert.match(layout, /AI account operations/);
  assert.match(page, /Every client account/);
  assert.match(page, /Gemini agent/);
  assert.match(page, /ACCOUNT HEALTH/);
  assert.match(page, /EXECUTION/);
  assert.match(page, /Acme client account/);
  assert.match(page, /Northstar account/);
  assert.match(page, /Atlas account/);
  assert.match(page, /GitHub connector/);
  assert.doesNotMatch(page + layout, /codex-preview|Your site is taking shape/);
});

test("contains Gemini, reusable intelligence, freshness, and execution evidence", async () => {
  const [query, store, generator] = await Promise.all([
    readFile(new URL("app/api/query/route.ts", root), "utf8"),
    readFile(new URL("app/api/_lib/store.ts", root), "utf8"),
    readFile(new URL("app/api/_lib/intelligence.ts", root), "utf8"),
  ]);
  assert.match(query, /created.*refreshed.*reused/s);
  assert.match(query, /logAgentExecution/);
  assert.match(store, /agent_executions/);
  assert.match(store, /intelligence_dependencies/);
  assert.match(generator, /aiplatform\.googleapis\.com/);
  assert.match(generator, /generativelanguage\.googleapis\.com/);
  assert.match(generator, /gemini-2\.5-flash/);
  assert.match(generator, /responseSchema/);
  assert.match(generator, /deterministicIntelligence/);
  assert.match(generator, /RESOLVED supersedes older blocker reports/);
});
