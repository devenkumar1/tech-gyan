import test from "node:test";
import assert from "node:assert/strict";
import { dedupe, extractTopics, normalizeId, rankItem } from "./intelligence";
import type { TechItem } from "../types/intelligence";

test("extractTopics identifies MCP and agent concepts", () => {
  const topics = extractTopics("Introducing MCP support for agent tools", "A multi-agent protocol update");
  assert.ok(topics.includes("MCP / A2A"));
  assert.ok(topics.includes("AI Agents"));
});

test("normalizeId creates a stable URL and title key", () => {
  assert.equal(normalizeId("https://example.com/Release", "New Release!"), "https-example-com-release-new-release");
});

test("extractTopics identifies Kubernetes and database concepts", () => {
  const topics = extractTopics("Kubernetes PostgreSQL operator released", "Cloud-native database update");
  assert.ok(topics.includes("Cloud Native"));
  assert.ok(topics.includes("Data / Databases"));
});

test("rankItem rewards launch signals and freshness", () => {
  const ranked = rankItem({
    id: "x",
    title: "New agent launch for TypeScript",
    url: "https://example.com",
    source: "Example",
    publishedAt: new Date().toISOString(),
    summary: "A new AI agent release.",
    topics: ["AI Agents", "TypeScript"],
  });
  assert.ok(ranked.score >= 68);
  assert.equal(ranked.importance, "High");
  assert.ok(ranked.whyItMatters.length > 40);
});

test("dedupe removes repeated IDs", () => {
  const item = {
    id: "same", title: "A", url: "https://a", source: "A", publishedAt: new Date().toISOString(),
    summary: "", topics: ["AI Agents"], score: 50, importance: "Medium", whyItMatters: "", talkingPoint: "",
  } satisfies TechItem;
  assert.equal(dedupe([item, { ...item }]).length, 1);
});
