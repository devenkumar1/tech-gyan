# Signal — Developer Guide

Version: 1.0

This document describes the current implementation of **Signal — Technology Intelligence**, an application for discovering and learning from technology trends across AI, cloud, open source, programming languages, security, databases, developer tools, and Microsoft ecosystems.

## 1. Product summary

Signal turns public technology publications into a ranked briefing for a full-stack or AI engineer.

The primary workflow is:

1. Fetch public RSS, Atom, and Hacker News feeds.
2. Normalize article metadata.
3. Extract broad topic categories.
4. Score and rank articles by freshness and relevance.
5. Generate deterministic “why it matters” guidance.
6. Return the normalized briefing through a Next.js API route.
7. Allow a user to search, filter, save, and add articles to a learning queue.

The application is currently a free or low-cost MVP. It does not require an AI provider key or database for its core data flow.

## 2. Goals and scope

### Current goals

- Reduce the number of tabs required to track technology change.
- Surface launch announcements, releases, research, security updates, and ecosystem changes.
- Add enough explanation for users to discuss or evaluate an item in a team meeting.
- Keep the data source registry maintainable.
- Keep personal saved-state private in the browser.
- Protect the application with Clerk when keys are configured.

### Non-goals in the current version

- Guaranteed real-time indexing of every technology event.
- Full-text indexing or storage of complete articles.
- AI-generated summaries based on an external model.
- Historical trend storage and graph analytics.
- Shared server-side user preferences.
- Cross-device saved-item synchronization.
- Autonomous posting to Teams or Slack.
- Scraping or bypassing paywalls.

## 3. Architecture overview

```text
┌──────────────────────────────────────────────────────────┐
│                         Browser                          │
│                                                          │
│  React UI                                                │
│  ├─ Briefing, Discovery, Saved, Learning views           │
│  ├─ Search and topic filters                             │
│  ├─ Theme selection                                      │
│  └─ localStorage persistence                             │
└──────────────────────────┬───────────────────────────────┘
                           │ GET /api/intelligence
                           ▼
┌──────────────────────────────────────────────────────────┐
│                   Next.js App Router                     │
│                                                          │
│  Clerk middleware                                        │
│  ├─ Protect routes and API requests                      │
│  └─ Permit public sign-in/sign-up redirect routes        │
│                                                          │
│  /api/intelligence                                       │
│  ├─ 15-minute in-process cache                            │
│  ├─ Source registry                                      │
│  ├─ Concurrent feed fetchers                             │
│  ├─ XML parsing                                          │
│  ├─ Topic extraction                                     │
│  ├─ Deduplication                                        │
│  ├─ Ranking                                              │
│  └─ Insight templates                                    │
└──────────────────────────┬───────────────────────────────┘
                           │ HTTPS
                           ▼
┌──────────────────────────────────────────────────────────┐
│                 Public upstream sources                  │
│                                                          │
│  Official blogs • Hacker News • Research • GitHub        │
│  Cloud providers • Language projects • Security feeds    │
└──────────────────────────────────────────────────────────┘
```

### Runtime boundaries

- **Client:** presentation, search, filters, saved items, learning queue, theme preference.
- **Next.js server:** authentication middleware, feed retrieval, parsing, ranking, and API responses.
- **External sources:** public RSS/Atom feeds and public research endpoints.
- **Clerk:** authentication, session identity, account UI, social providers, and MFA configuration.
- **Browser storage:** saved IDs and theme/settings only.

## 4. Technology stack

| Area | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 App Router | Routing, server components, route handlers, proxy middleware |
| UI | React 19 | Interactive dashboard |
| Language | TypeScript 5 | Shared contracts and application logic |
| Styling | Tailwind CSS 4 and CSS variables | Base pipeline and themeable visual system |
| Authentication | Clerk 7 for Next.js | Sign-in, sign-up, session and account UI |
| Feed parsing | `fast-xml-parser` | RSS and Atom XML parsing |
| Icons | Lucide React | Consistent interface iconography |
| Tests | Node test runner through `tsx` | Ranking and dedupe unit tests |
| Lint | ESLint 9 | Static code validation |
| Hosting | Vercel | Serverless Next.js deployment |

## 5. Repository layout

```text
app/
  api/intelligence/route.ts    Intelligence API route
  globals.css                  Theme system and UI styles
  layout.tsx                   Root layout, metadata, ClerkProvider
  page.tsx                     Main dashboard client component
  sign-in/page.tsx             Hosted Clerk sign-in redirect
  sign-up/page.tsx             Hosted Clerk sign-up redirect
  icon.svg                     Vector app icon
  icon.png                     PNG app icon

public/
  logo.svg / logo.png          Public brand assets
  favicon.png                  Browser/favicon asset

src/
  data/sources.ts              RSS/Atom source registry
  lib/feed.ts                  Source fetch and XML normalization
  lib/intelligence.ts          Topics, scores, insights, dedupe
  lib/intelligence.test.ts     Unit tests
  types/intelligence.ts        Shared TypeScript data types

proxy.ts                       Clerk route protection
next.config.ts                 Next.js configuration
package.json                   Dependencies and scripts
.env.example                   Environment variable template
.gitignore                     Private file and build exclusions
README.md                      Quick project overview
DEVELOPER_GUIDE.md             Detailed developer documentation
```

Private planning files are expected to exist outside this repository if maintained locally.

## 6. Shared data model

### Topics

The application uses a closed set of topic categories:

- AI Agents
- RAG
- MCP / A2A
- Microsoft / Teams
- React
- TypeScript
- Python
- Programming Languages
- Cloud
- Cloud Native
- Data / Databases
- Open Source
- Security
- Developer Tools

Types are maintained in `src/types/intelligence.ts`.

### TechItem

```typescript
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
```

### IntelligenceResponse

```typescript
export type IntelligenceResponse = {
  updatedAt: string;
  cached: boolean;
  sourcesChecked: number;
  sourcesHealthy: number;
  items: TechItem[];
};
```

The API contract allows the UI to remain independent from upstream XML formats.

## 7. Source registry

The source registry is in `src/data/sources.ts`.

Each source includes:

```typescript
{
  name: string;
  url: string;
  topics: Topic[];
  authority: number;
}
```

The registry currently includes feeds for:

- AI labs and model providers
- Microsoft, Azure, and Teams-related properties
- Cloud providers
- Hacker News
- GitHub
- arXiv
- React and Node.js
- Python and .NET
- Go, Rust, Java, Kotlin, Ruby, PHP, and Swift
- Kubernetes and CNCF ecosystems
- PostgreSQL, MongoDB, Redis, and Elastic
- OWASP, CISA, and security research
- TechCrunch and engineering publications

### Adding a source

1. Open `src/data/sources.ts`.
2. Add a new typed entry.
3. Confirm the public URL exposes RSS or Atom.
4. Assign relevant topic categories.
5. Set a reasonable authority value.
6. Restart or redeploy.
7. Validate `sourcesHealthy` and its returned item count.

## 8. End-to-end ingestion flow

### Step 1: Browser request

The React page initially calls:

```text
GET /api/intelligence
```

The refresh button calls the same endpoint with `cache: "no-store"`.

### Step 2: Route cache check

`app/api/intelligence/route.ts` stores two module variables:

- `cache`: latest response
- `cacheAt`: response creation time

A request uses the response only when it is less than 15 minutes old.

The cache is process-local and can be lost when:

- The server restarts.
- A Vercel serverless instance is recycled.
- A second serverless region or instance has independent memory.

The response also sends cache headers for platform caching.

### Step 3: Concurrent source fetch

The route calls `Promise.all(SOURCES.map(fetchFeed))`.

Every source fetch uses:

- A 6.5-second abort timeout.
- A fixed user agent.
- Next.js fetch revalidation.
- Per-source exception isolation.

Failure of one source does not reject the complete API call.

### Step 4: XML parsing

`src/lib/feed.ts` uses `fast-xml-parser` and supports:

- RSS `channel.item` entries.
- Atom `feed.entry` entries.
- String and object feed links.
- RSS descriptions and Atom summaries/content.
- `pubDate`, `published`, `updated`, and `dc:date` dates.

Invalid or missing dates fall back to the current time.

### Step 5: Normalization

Each feed entry is converted to an initial item with:

- Stable normalized ID
- Title
- Original URL
- Source name
- Publication timestamp
- Short summary
- Extracted topics

HTML is stripped from titles and summaries.

### Step 6: Topic extraction

`extractTopics()` combines title and summary text and matches keyword lists in `src/lib/intelligence.ts`.

If no keyword matches, source-configured topics are used.

No external NLP model is used in the current implementation.

### Step 7: Relevance ranking

`rankItem()` computes a score from:

- Freshness: up to a 24-hour freshness window.
- Preferred engineering topics.
- Launch/release announcement keywords.
- Item topic count.

Importance is derived:

- `High`: score 68 or greater
- `Medium`: score 42 to 67
- `Watch`: score below 42

### Step 8: Deduplication

Items are deduplicated by normalized URL/title IDs using a `Set`.

The implementation reduces exact duplicate feed entries but does not yet use semantic similarity or canonical-story clustering.

### Step 9: Insight generation

`makeInsight()` uses templates based on the first detected topic.

It returns:

- `whyItMatters`
- `talkingPoint`

This is deterministic and not LLM-generated.

### Step 10: API response

The route returns:

```json
{
  "updatedAt": "ISO timestamp",
  "cached": false,
  "sourcesChecked": 38,
  "sourcesHealthy": 31,
  "items": []
}
```

The browser replaces its loaded data and updates source health and refresh status.

## 9. Ranking behavior and limitations

### Current strengths

- Fast and cost-free.
- Transparent and explainable.
- Easy to extend or replace.
- Stable enough for unit testing.

### Current limitations

- Authority field is present but not currently included in the score.
- Freshness can incorrectly advantage undated or recently malformed feed dates.
- Keyword matching can misclassify content.
- There is no source-level semantic classification.
- Deduplication is exact, not semantic.
- The insight text is templated rather than researched or summarized.
- Social signals such as GitHub stars are not yet included.

A future ranking implementation should use a documented weighted formula or ML model and include source reliability metadata.

## 10. Frontend architecture

The main dashboard is a client component in `app/page.tsx`.

### State

- `data`: latest intelligence response
- `loading`: refresh/loading state
- `topic`: active topic filter
- `search`: text search
- `view`: Briefing, Discover, Saved, or Learning
- `saved`: saved item IDs
- `learning`: learning queue item IDs
- `mobileNav`: mobile sidebar state
- `theme`: active visual theme
- `dateLabel`: client date label

### Views

- **Briefing:** lead story, four related signals, and additional watch list.
- **Discover:** complete filtered feed.
- **Saved:** items whose IDs appear in saved storage.
- **Learning:** items whose IDs appear in the learning queue.

### Filter sequence

1. Filter by active view: Saved or Learning.
2. Filter by selected topic.
3. Filter by title, summary, and source text.
4. Display matching items.

### Persistence

Browser keys:

| Key | Data |
|---|---|
| `signal-saved` | JSON array of saved item IDs |
| `signal-learning` | JSON array of learning item IDs |
| `signal-theme` | Active theme name |

This state is not synchronized across devices and is not stored in Clerk metadata or a database.

## 11. Theme system

Themes are controlled through `html[data-theme]` in `app/globals.css`.

Available themes:

- `signal`: light green editorial theme
- `midnight`: dark neutral theme
- `ocean`: blue technology theme
- `sunset`: warm neutral theme

Theme colors use CSS variables for:

- Paper/background
- Surface/cards
- Text and muted text
- Lines and borders
- Brand and accent
- Hero gradient
- Shadows

The sidebar and header expose theme cycling controls.

## 12. Authentication architecture

Clerk is integrated using:

- `ClerkProvider` in `app/layout.tsx`
- `clerkMiddleware` in `proxy.ts`
- Clerk `<Show>`, `<UserButton>`, and `<SignInButton>` UI components
- Hosted redirect routes under `/sign-in` and `/sign-up`

### Route protection

Unless both public and secret Clerk variables exist, the proxy permits access. This provides a graceful local mode before Clerk setup.

When configured, Clerk middleware protects every route not matched as public.

Public routes:

- `/sign-in(.*)`
- `/sign-up(.*)`

### Enabled authentication categories

Exact available methods are controlled in the Clerk dashboard. The application UI can support:

- Google
- Email and password
- Email verification
- Password reset
- Phone/SMS
- MFA
- Passkeys
- Enterprise SSO
- Social provider OAuth
- Session/account management

The application does not maintain separate password storage or identity tables.

### Clerk redirect design

The current sign-in and sign-up pages redirect to the Clerk Account Portal host.

For production, replace the hard-coded hosted domain with environment variables or Clerk’s standard embedded/hosted configuration flow.

A production deployment must update:

- Allowed domains
- Redirect URLs
- OAuth provider authorized domains
- Publishable key
- Secret key
- App URL

## 13. Environment variables

Create `.env.local` using `.env.example`.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk mode | Public Clerk instance key |
| `CLERK_SECRET_KEY` | Clerk mode | Server-side Clerk secret |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Recommended | Local sign-in route |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Recommended | Local sign-up route |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Recommended | Post-sign-in destination |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Recommended | Post-sign-up destination |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical application URL |

Never expose `CLERK_SECRET_KEY` to client code.

Never commit `.env.local`, `.env.production`, real keys, certificates, or local credentials.

## 14. Local setup

### Prerequisites

- Node.js compatible with Next.js 16
- npm
- Windows PowerShell or a Unix shell
- Internet access for public feeds
- Optional Clerk account

### Install

```powershell
npm install
```

### Configure local environment

```powershell
Copy-Item .env.example .env.local
```

Update the Clerk values when using authentication.

### Run development

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

### Stop a server

Use the process-specific shell session or stop the Next.js process through VS Code/PowerShell.

## 15. Build and quality workflow

### Lint

```powershell
npm run lint
```

### Unit tests

```powershell
npm test
```

The test suite validates:

- MCP and agent topic extraction
- Kubernetes/database classification
- Stable IDs
- Fresh release ranking
- Deduplication

### Production build

```powershell
npm run build
npm start
```

### Recommended pull-request checks

1. `npm test`
2. `npm run lint`
3. `npm run build`
4. Call `/api/intelligence` and inspect source health.
5. Test Briefing, Discover, Saved, and Learning views.
6. Test all themes.
7. Test mobile navigation.
8. Test signed-in and signed-out authentication states.

## 16. API documentation

### GET `/api/intelligence`

Purpose: Aggregate, normalize, rank, and deduplicate technology updates.

Request:

```text
GET /api/intelligence
Accept: application/json
```

Response:

```json
{
  "updatedAt": "2026-11-24T09:30:00.000Z",
  "cached": false,
  "sourcesChecked": 38,
  "sourcesHealthy": 31,
  "items": [
    {
      "id": "normalized-article-id",
      "title": "Example technology release",
      "url": "https://example.com/article",
      "source": "Example Blog",
      "publishedAt": "2026-11-24T08:20:00.000Z",
      "summary": "Short source description",
      "topics": ["AI Agents", "Developer Tools"],
      "score": 82,
      "importance": "High",
      "whyItMatters": "Why this may affect engineering decisions",
      "talkingPoint": "Suggested team-meeting talking point"
    }
  ]
}
```

### Response behavior

- `cached: true` indicates an in-process cached response.
- `sourcesHealthy` counts sources returning at least one item.
- `sourcesChecked` is the complete source registry count.
- At least 12 live items reduce or remove seed fallback usage.
- The result is limited to 60 items.

### Failure behavior

- Individual source failures return no item from that source.
- Fetch aborts after 6.5 seconds.
- XML parsing failures are isolated to the source.
- Invalid publication dates fall back to now.
- Cache fallback behavior should be strengthened before production.

## 17. Security model

### Authentication

Clerk controls user identity and sessions.

The middleware protects application routes and API requests when Clerk keys are configured.

### Secrets

- `.env.local` is ignored by Git.
- `.env*` is ignored by Git.
- Secret keys must remain server-only.
- Never place secret values in browser code or `NEXT_PUBLIC_*` variables.

### SSRF and source handling

The MVP does not accept arbitrary user feed URLs. Fetch targets are restricted to `src/data/sources.ts`.

Recommended future hardening:

- Allowlist protocol and domain.
- Reject redirects to private network ranges.
- Limit response size.
- Limit item count and text length.
- Add per-domain circuit breakers.
- Cache and retry failures.

### External links

Article links open externally with `target="_blank"` and `rel="noreferrer"`.

### Browser privacy

Saved IDs and theme preferences remain in browser storage. They are not sent to source websites by the application.

### Dependency and package security

- Run `npm audit` before deployment.
- Pin or lock dependencies with `package-lock.json`.
- Review Clerk Core upgrades before changing control components.
- Keep Next.js patched.

## 18. Performance model

### Current fast paths

- Static navigation shell.
- 15-minute route cache.
- Platform cache headers.
- Concurrent source calls.
- Per-source timeouts.
- Client-side filtering and view changes.

### Current bottlenecks

- Cold API calls wait for 38 upstream sources concurrently.
- Slow/invalid sources are bounded only at 6.5 seconds.
- RSS payloads are fetched in full before parsing.
- The route cache is process memory rather than shared storage.
- No persisted feed history or incremental ingestion.

### Recommended improvements

- Shared Redis or database cache.
- Background ingestion worker.
- Cron or scheduled refresh.
- Stale-while-revalidate feed snapshots.
- Incremental source health metrics.
- CDN-cached public briefing artifacts.
- Pagination and virtualized feed lists.

## 19. Deployment on Vercel

### Prerequisites

- GitHub repository
- Vercel account
- Clerk application
- Production or test Clerk keys

### Steps

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Select the Next.js framework preset.
4. Set build command: `npm run build`.
5. Set install command: `npm install`.
6. Configure environment variables.
7. Deploy.

### Required environment variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_APP_URL=https://your-domain.example
```

### Clerk domain configuration

Configure the Vercel domain as an allowed application domain in Clerk. Update OAuth provider callback domains if social login is enabled.

For production, use production Clerk keys rather than development keys.

### Deployment caveat

The sign-in and sign-up pages currently redirect to a hard-coded local Clerk Account Portal host. This must be corrected for a custom production domain or replaced with standard Clerk component routing.

## 20. Troubleshooting

### Too many redirects

Possible causes:

- `/sign-in` is accidentally protected by middleware.
- Clerk redirect variables point back to `/sign-in` or the Clerk host incorrectly.
- Cached local server is still running old build output.

Fix:

- Keep sign-in and sign-up public.
- Restart Next.js after environment changes.
- Confirm `NEXT_PUBLIC_APP_URL` matches the browser origin.
- Rebuild before restarting production server.

### Loading sign-in forever

Possible causes:

- Embedded Clerk component routes are incompatible with the current prerender setup.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is missing or invalid.
- Browser blocks cross-origin Clerk scripts.
- The local redirect route uses the wrong Account Portal host.

Fix:

- Use the public hosted redirect route.
- Verify the publishable key and domain.
- Inspect browser network failures.

### Feed API returns few items

Possible causes:

- Upstream feed changed format or URL.
- Source blocked the user agent or timed out.
- XML parser did not recognize an RSS/Atom structure.
- Source changed TLS or redirects.

Fix:

- Test the URL directly.
- Inspect `sourcesHealthy`.
- Add parser support for the source shape.
- Increase the timeout only with a total-route timeout budget.

### Invalid date values

Use `Number.isNaN(parsedDate.getTime())` checks and normalize to ISO. Invalid dates must not pass to ranking code as `Invalid Date`.

### Clerk structural CSS warning

Pinning Clerk UI internals is not recommended. Use Clerk’s supported UI and upgrade guides when changing versions.

### TypeScript alias resolution

The alias `@/*` is mapped to `src/*` in `tsconfig.json`.

Files under `app/` must use relative or root alias imports appropriate to the current project structure.

## 21. Testing strategy

### Unit tests

Located in `src/lib/intelligence.test.ts`.

Test topic extraction, normalized IDs, ranking, insight creation, and dedupe behavior.

### Integration tests to add

- `/api/intelligence` returns 200.
- `sourcesChecked` equals registry length.
- At least one source or seed item is returned.
- Every item has a valid URL and ISO date.
- There are no duplicate IDs.
- Signed-out requests redirect safely.
- Signed-in requests display the dashboard.

### Browser tests to add

- Search updates filtered items.
- Topic selection updates items.
- Save toggles persist after reload.
- Learning queue persists after reload.
- Refresh updates loading state.
- Mobile sidebar opens and closes.
- Theme selection persists.
- External links open safely.

## 22. Extending the platform

### Durable database

Recommended next persistence layer:

- PostgreSQL or another relational database
- Article table keyed by canonical URL
- Source table
- User-saved article relation
- User learning queue relation
- Refresh/history timestamps

### Background ingestion

Recommended options:

- Vercel Cron
- GitHub Actions
- A worker service
- Queue with retries and dead-letter handling

### Vector RAG workspace

Recommended stack:

- PostgreSQL with pgvector or managed vector database
- Embedding provider
- Chunk extraction from selected articles
- Metadata filters by topic and source
- Retrieval citations
- LLM provider abstraction

### GraphRAG

Recommended entities:

- Article
- Technology
- Organization
- Person
- Repository
- Standard or protocol
- Release
- Concept
- Dependency

Use only after a stable ingestion pipeline and reliable article corpus exist.

### Teams connector

Add:

- Teams bot or app manifest
- Adaptive Card renderer
- Incoming webhook or connector
- Daily summary scheduling
- User opt-in preferences
- Source and topic filters

### MCP/A2A support

Introduce protocol watch sources and structured metadata for:

- MCP server releases
- MCP SDK changes
- A2A protocol updates
- Agent framework compatibility
- Security and interoperability changes

### GitHub Trending

Options:

- Public trending page parsing
- GitHub API search or repository metadata
- Release and commit feeds

GitHub API limits should be considered even if public unauthenticated endpoints are used.

## 23. Known implementation limitations

1. The source catalog is broad but not exhaustive.
2. The feed is not an archival database.
3. The server cache is ephemeral.
4. Browser state is not shared across devices.
5. Topic extraction is keyword-based.
6. Importance scoring is heuristic.
7. Deduplication is exact rather than semantic.
8. Insight copy is template-based.
9. The sign-in redirect contains deployment-specific host details.
10. Source authority is recorded but not currently used in ranking.
11. Error telemetry and dashboards are not implemented.
12. Accessibility testing is manual and should be automated.

## 24. Recommended production readiness order

1. Add a shared persistent cache/database.
2. Make sign-in and sign-up redirect configuration fully environment-driven.
3. Add stale-cache fallback.
4. Add structured logging and source health records.
5. Add per-source metrics and retries.
6. Add semantic deduplication.
7. Add GitHub Trending and release monitoring.
8. Add server-side user preferences.
9. Add Teams/email digest delivery.
10. Add an optional AI summarization provider behind a cost cap.
11. Add RAG only after persistent article storage exists.
12. Add automated browser and API test suites.

## 25. Maintenance checklist

### Weekly

- Check source health.
- Remove broken source URLs.
- Review unexpected duplicates.
- Review ranking distribution.
- Review Clerk sign-in logs.

### Per release

- Run tests, lint, and build.
- Verify environment variables.
- Verify authentication flows.
- Verify `/api/intelligence`.
- Verify desktop/mobile layouts.
- Verify all themes.
- Review dependency updates.

### Per source addition

- Confirm legal and technical feed terms.
- Confirm RSS/Atom structure.
- Confirm feed contains trustworthy publication dates.
- Assign topics.
- Verify source name and original outbound link.

## 26. Security and licensing considerations

- Respect source terms, robots policies, and API limits.
- Store only summaries and metadata unless licensed article content is explicitly permitted.
- Show source attribution and outbound links.
- Do not reproduce full paywalled articles.
- Display trademarked names appropriately.
- Follow Clerk and OAuth provider policies.

## 27. Final architecture principle

Signal should keep ingestion, normalization, ranking, presentation, identity, and optional AI/RAG capabilities as separate concerns.

The current implementation already creates that separation at a high level:

- Sources are data configuration.
- Parsing is isolated from ranking.
- Ranking is isolated from UI rendering.
- Identity is isolated in Clerk.
- Browser personalization is local by default.

This allows database, RAG, GraphRAG, connectors, and MCP/A2A features to be added without replacing the complete application shell.
