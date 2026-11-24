export type Topic = "AI Agents" | "RAG" | "MCP / A2A" | "Microsoft / Teams" | "React" | "TypeScript" | "Python" | "Programming Languages" | "Cloud" | "Cloud Native" | "Data / Databases" | "Open Source" | "Security" | "Developer Tools";

export type TechItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  topics: Topic[];
  score: number;
  importance: "High" | "Medium" | "Watch";
  whyItMatters: string;
  talkingPoint: string;
};

export type IntelligenceResponse = {
  updatedAt: string;
  cached: boolean;
  sourcesChecked: number;
  sourcesHealthy: number;
  items: TechItem[];
};
