import type { TechItem, Topic } from "@/types/intelligence";

const KEYWORDS: Record<Topic, string[]> = {
  "AI Agents": ["agent", "agentic", "llm", "language model", "copilot", "reasoning", "model"],
  RAG: ["rag", "retrieval", "embedding", "vector", "graph rag", "knowledge graph"],
  "MCP / A2A": ["mcp", "model context protocol", "a2a", "agent-to-agent", "tool protocol", "connector"],
  "Microsoft / Teams": ["microsoft", "teams", "azure", "copilot studio", "m365", "outlook"],
  React: ["react", "next.js", "nextjs", "react server", "javascript"],
  TypeScript: ["typescript", "ts5", "javascript", "node.js"],
  Python: ["python", "pytorch", "fastapi", "django", "pip"],
  "Programming Languages": ["rust", "golang", "go language", "java", "kotlin", "swift", "ruby", "php", "c#", "dotnet", "cpp", "zig", "dart", "scala", "elixir", "clang"],
  Cloud: ["cloud", "aws", "azure", "gcp", "serverless"],
  "Cloud Native": ["kubernetes", "container", "docker", "helm", "prometheus", "istio", "cncf", "platform engineering"],
  "Data / Databases": ["database", "postgres", "mysql", "mongodb", "redis", "sql", "nosql", "data engineering", "analytics"],
  "Open Source": ["open source", "github", "release", "repository", "community"],
  Security: ["security", "vulnerability", "cve", "auth", "supply chain", "privacy"],
  "Developer Tools": ["developer", "sdk", "api", "cli", "framework", "runtime", "ide", "release"],
};

export function extractTopics(title: string, summary = "") {
  const text = `${title} ${summary}`.toLowerCase();
  return (Object.entries(KEYWORDS) as [Topic, string[]][])
    .filter(([, words]) => words.some((word) => text.includes(word)))
    .map(([topic]) => topic)
    .slice(0, 3);
}

export function makeInsight(title: string, topics: Topic[]) {
  const topic = topics[0] ?? "technology";
  const why = `This could affect implementation choices around ${topic.toLowerCase()}. Validate whether it changes an existing dependency, architecture decision, or team workflow before adopting it.`;
  const talkingPoint = `For ${topic}, I would assess the operational trade-offs—adoption cost, interoperability, security, and evaluation—rather than treating the headline as an immediate upgrade decision.`;
  return { whyItMatters: why, talkingPoint };
}

export function normalizeId(url: string, title: string) {
  const source = `${url || ""}|${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return source.slice(0, 100);
}

export function rankItem(item: Omit<TechItem, "score" | "importance" | "whyItMatters" | "talkingPoint">) {
  const preferred: Topic[] = ["AI Agents", "RAG", "MCP / A2A", "Microsoft / Teams", "React", "TypeScript", "Python", "Programming Languages", "Cloud", "Cloud Native", "Data / Databases", "Security", "Open Source", "Developer Tools"];
  const ageHours = Math.max(0, (Date.now() - new Date(item.publishedAt).getTime()) / 36e5);
  const freshness = Math.max(0, 24 - ageHours) * 1.25;
  const topicScore = item.topics.reduce((sum, topic) => sum + (preferred.includes(topic) ? 14 : 5), 0);
  const signal = /(launch|release|announc|introduc|new|preview|breaking|security)/i.test(item.title) ? 16 : 4;
  const authority = 0;
  const score = Math.round(freshness + topicScore + signal + authority);
  const importance = score >= 68 ? "High" : score >= 42 ? "Medium" : "Watch";
  const insight = makeInsight(item.title, item.topics);
  return { ...item, score, importance: importance as TechItem["importance"], ...insight };
}

export function dedupe(items: TechItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
