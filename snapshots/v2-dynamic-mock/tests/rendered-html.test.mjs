import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("contains the finished Knowy product shell", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);
  assert.match(layout, /title: "Knowy AI/);
  assert.match(page, /Ask once/);
  assert.match(page, /Why is the Acme deployment delayed/);
  assert.match(page, /OAuth migration/);
  assert.match(page, /Enterprise pricing/);
  assert.match(page, /Atlas incident/);
  assert.match(page, /setQuestion\(nextQuestion\)/);
  assert.match(page, /actionFeedback/);
  assert.match(page, /GitHub changed\. Acme intelligence is now stale/);
  assert.match(page, /Slack/);
  assert.match(page, /GitHub/);
  assert.match(page, /Google Drive/);
  assert.doesNotMatch(page + layout, /codex-preview|Your site is taking shape/);
});

test("contains the reusable intelligence and freshness pipeline", async () => {
  const [query, store, generator] = await Promise.all([
    readFile(new URL("app/api/query/route.ts", root), "utf8"),
    readFile(new URL("app/api/_lib/store.ts", root), "utf8"),
    readFile(new URL("app/api/_lib/intelligence.ts", root), "utf8"),
  ]);
  assert.match(query, /created.*refreshed.*reused/s);
  assert.match(query, /changedSources/);
  assert.match(store, /intelligence_dependencies/);
  assert.match(store, /source_version/);
  assert.match(generator, /api\.openai\.com\/v1\/responses/);
  assert.match(generator, /deterministicIntelligence/);
  assert.match(generator, /retrieveForQuestion/);
  assert.match(query, /insufficient/);
  assert.match(query, /readIntelligence\(match\.id\)/);
});
