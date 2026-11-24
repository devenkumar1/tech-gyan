import { NextResponse } from "next/server";
import { SOURCES } from "@/data/sources";
import { fetchFeed } from "@/lib/feed";
import { dedupe } from "@/lib/intelligence";
import type { IntelligenceResponse, TechItem } from "@/types/intelligence";

let cache: IntelligenceResponse | null = null;
let cacheAt = 0;

const seedItems: TechItem[] = [
  { id:"agentic-rag", title:"From Traditional RAG to Agentic Graph RAG", url:"https://arxiv.org/abs/2501.09136", source:"Research Watch", publishedAt:new Date().toISOString(), summary:"Agentic RAG combines planning, reflection, tool use, and graph retrieval into adaptive systems.", topics:["RAG","AI Agents"], score:92, importance:"High", whyItMatters:"This changes retrieval architecture from a fixed pipeline into a plan-and-act system. Teams should compare answer quality and latency before replacing proven RAG.", talkingPoint:"Graph RAG is strongest when relationships matter; agentic RAG adds control-flow complexity that needs traces and evaluation." },
  { id:"mcp-a2a", title:"MCP and A2A: complementary agent interoperability patterns", url:"https://github.com/modelcontextprotocol", source:"Protocol Watch", publishedAt:new Date(Date.now()-2*36e5).toISOString(), summary:"MCP connects agents to tools and context; A2A coordinates communication between agents.", topics:["MCP / A2A","AI Agents"], score:88, importance:"High", whyItMatters:"A useful architecture boundary is emerging: tools use MCP, while cross-agent collaboration uses A2A or a comparable protocol.", talkingPoint:"MCP and A2A solve different layers; avoid mixing tool contracts with peer-agent orchestration." },
  { id:"teams-agents", title:"Teams SDK patterns for building agents and Adaptive Cards", url:"https://learn.microsoft.com/microsoftteams/platform/", source:"Microsoft Learn", publishedAt:new Date(Date.now()-5*36e5).toISOString(), summary:"Microsoft Teams agents can use routed activities, streaming, cards, feedback, and enterprise data connectors.", topics:["Microsoft / Teams","AI Agents"], score:84, importance:"High", whyItMatters:"Teams is becoming an application surface for enterprise agents, not only a notification channel.", talkingPoint:"Design Teams agents around conversational state, permissions, graceful degradation, and measurable task completion." },
  { id:"github-releases", title:"GitHub Release feeds for dependency and toolchain monitoring", url:"https://docs.github.com/rest/activity/feeds", source:"GitHub Docs", publishedAt:new Date(Date.now()-8*36e5).toISOString(), summary:"Public repository release feeds make dependency changes available without repository credentials.", topics:["Open Source","Developer Tools"], score:76, importance:"Medium", whyItMatters:"Lightweight release monitoring reduces surprise upgrades and gives teams an auditable source for dependency decisions.", talkingPoint:"For critical dependencies, track release notes and security advisories rather than merely stars or downloads." },
  { id:"react-server", title:"React Server Components and modern TypeScript application boundaries", url:"https://react.dev/reference/rsc/server-components", source:"React", publishedAt:new Date(Date.now()-11*36e5).toISOString(), summary:"Server Components separate server-only work from interactive client behavior in React applications.", topics:["React","TypeScript"], score:74, importance:"Medium", whyItMatters:"The decision changes bundle boundaries, data fetching, and how secrets and server dependencies reach the browser.", talkingPoint:"Use Server Components for server-owned data; keep client components small and intentionally interactive." },
  { id:"kubernetes-ai", title:"Running AI workloads on Kubernetes: from notebooks to production", url:"https://kubernetes.io/blog/", source:"Kubernetes", publishedAt:new Date(Date.now()-15*36e5).toISOString(), summary:"Production AI infrastructure increasingly requires scheduling, autoscaling, observability, and workload isolation.", topics:["Cloud","AI Agents","Python"], score:70, importance:"Medium", whyItMatters:"Container orchestration remains relevant for durable agents and model serving, but the control plane should match actual scale.", talkingPoint:"Serverless is attractive until cold starts, egress, runtime limits, and stateful workloads dominate." },
];

export async function GET() {
  const now = Date.now();
  if (cache && now - cacheAt < 15 * 60 * 1000) {
    return NextResponse.json({ ...cache, cached: true }, { headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=3600" } });
  }

  const batches = await Promise.all(SOURCES.map(fetchFeed));
  const live = dedupe(batches.flat()).sort((a, b) => b.score - a.score);
  const items = live.length >= 12 ? live.slice(0, 60) : dedupe([...live, ...seedItems]).sort((a, b) => b.score - a.score).slice(0, 60);
  const healthy = batches.filter((batch) => batch.length > 0).length;

  cache = {
    updatedAt: new Date().toISOString(),
    cached: false,
    sourcesChecked: SOURCES.length,
    sourcesHealthy: healthy,
    items,
  };
  cacheAt = now;

  return NextResponse.json(cache, { headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=3600" } });
}
