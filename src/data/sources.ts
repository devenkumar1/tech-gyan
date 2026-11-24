export type FeedSource = {
  name: string;
  url: string;
  topics: ("AI Agents" | "RAG" | "MCP / A2A" | "Microsoft / Teams" | "React" | "TypeScript" | "Python" | "Programming Languages" | "Cloud" | "Cloud Native" | "Data / Databases" | "Open Source" | "Security" | "Developer Tools")[];
  authority: number;
};

export const SOURCES: FeedSource[] = [
  { name: "Hacker News", url: "https://news.ycombinator.com/rss", topics: ["Developer Tools", "Open Source", "AI Agents"], authority: 72 },
  { name: "GitHub Blog", url: "https://github.blog/feed/", topics: ["Developer Tools", "Open Source", "Security"], authority: 88 },
  { name: "GitHub Changelog", url: "https://github.blog/changelog/feed/", topics: ["Developer Tools", "Open Source"], authority: 86 },
  { name: "Microsoft Azure Blog", url: "https://azure.microsoft.com/en-us/blog/feed/", topics: ["Microsoft / Teams", "Cloud", "AI Agents"], authority: 92 },
  { name: "Microsoft Developer Blogs", url: "https://devblogs.microsoft.com/feed/", topics: ["Microsoft / Teams", "TypeScript", "Cloud", "Developer Tools"], authority: 90 },
  { name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml", topics: ["RAG", "AI Agents", "Open Source", "Python"], authority: 88 },
  { name: "OpenAI News", url: "https://openai.com/news/rss.xml", topics: ["AI Agents", "RAG", "Developer Tools"], authority: 94 },
  { name: "Anthropic", url: "https://www.anthropic.com/news/rss.xml", topics: ["AI Agents", "MCP / A2A", "RAG"], authority: 94 },
  { name: "React", url: "https://react.dev/rss.xml", topics: ["React", "TypeScript", "Developer Tools"], authority: 96 },
  { name: "Python", url: "https://blog.python.org/feeds/posts/default", topics: ["Python", "Open Source"], authority: 94 },
  { name: "Google Cloud Blog", url: "https://cloudblog.withgoogle.com/rss/", topics: ["Cloud", "AI Agents", "RAG"], authority: 90 },
  { name: "AWS News", url: "https://aws.amazon.com/blogs/aws/feed/", topics: ["Cloud", "AI Agents", "Python"], authority: 92 },
  { name: "arXiv AI", url: "https://export.arxiv.org/api/query?search_query=all:(agentic+OR+RAG+OR+MCP+OR+GraphRAG)&start=0&max_results=12&sortBy=submittedDate&sortOrder=descending", topics: ["RAG", "AI Agents", "MCP / A2A"], authority: 84 },
  { name: "Go Blog", url: "https://go.dev/blog/feed.atom", topics: ["Programming Languages", "Cloud Native", "Developer Tools"], authority: 94 },
  { name: "Rust Blog", url: "https://blog.rust-lang.org/feed.xml", topics: ["Programming Languages", "Open Source", "Developer Tools"], authority: 94 },
  { name: "Kotlin Blog", url: "https://blog.jetbrains.com/kotlin/feed/", topics: ["Programming Languages", "Developer Tools"], authority: 88 },
  { name: "Java Community", url: "https://blogs.oracle.com/java/feed", topics: ["Programming Languages", "Cloud Native"], authority: 92 },
  { name: "Node.js", url: "https://nodejs.org/en/feed/blog.xml", topics: ["TypeScript", "Programming Languages", "Developer Tools"], authority: 96 },
  { name: "TypeScript Blog", url: "https://devblogs.microsoft.com/typescript/feed/", topics: ["TypeScript", "Developer Tools"], authority: 92 },
  { name: "Ruby Blog", url: "https://www.ruby-lang.org/en/feeds/news.rss", topics: ["Programming Languages", "Open Source"], authority: 90 },
  { name: "PHP", url: "https://www.php.net/feed.atom", topics: ["Programming Languages", "Developer Tools"], authority: 92 },
  { name: "Swift.org", url: "https://www.swift.org/atom.xml", topics: ["Programming Languages", "Open Source"], authority: 94 },
  { name: ".NET Blog", url: "https://devblogs.microsoft.com/dotnet/feed/", topics: ["Programming Languages", "Microsoft / Teams", "Cloud"], authority: 94 },
  { name: "Kubernetes", url: "https://kubernetes.io/feed.xml", topics: ["Cloud Native", "Cloud", "Developer Tools"], authority: 96 },
  { name: "Docker", url: "https://www.docker.com/feed/", topics: ["Cloud Native", "Developer Tools"], authority: 92 },
  { name: "CNCF", url: "https://www.cncf.io/feed/", topics: ["Cloud Native", "Open Source", "Cloud"], authority: 94 },
  { name: "PostgreSQL", url: "https://www.postgresql.org/news.rss", topics: ["Data / Databases", "Open Source"], authority: 96 },
  { name: "MongoDB", url: "https://www.mongodb.com/blog/rss.xml", topics: ["Data / Databases", "Developer Tools"], authority: 88 },
  { name: "Redis", url: "https://redis.io/blog/rss.xml", topics: ["Data / Databases", "Cloud"], authority: 90 },
  { name: "Elastic", url: "https://www.elastic.co/blog/feed", topics: ["Data / Databases", "Security", "Developer Tools"], authority: 88 },
  { name: "OWASP", url: "https://owasp.org/feed.xml", topics: ["Security", "Developer Tools"], authority: 96 },
  { name: "CISA Advisories", url: "https://www.cisa.gov/cybersecurity-advisories/all.xml", topics: ["Security", "Cloud"], authority: 98 },
  { name: "Microsoft Security", url: "https://www.microsoft.com/en-us/security/blog/feed/", topics: ["Security", "Microsoft / Teams", "Cloud"], authority: 94 },
  { name: "Google Security", url: "https://security.googleblog.com/feeds/posts/default", topics: ["Security", "Open Source", "Cloud"], authority: 94 },
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", topics: ["AI Agents", "Open Source", "Developer Tools", "Cloud"], authority: 90 },
  { name: "InfoQ", url: "https://www.infoq.com/feed/", topics: ["AI Agents", "Cloud", "Developer Tools", "Open Source"], authority: 86 },
  { name: "The Changelog", url: "https://changelog.com/feed", topics: ["Open Source", "Developer Tools", "Programming Languages"], authority: 86 },
  { name: "DevOps.com", url: "https://devops.com/feed/", topics: ["Cloud Native", "Security", "Developer Tools"], authority: 82 },
];
