# Signal — Technology Intelligence

Signal is a responsive technology intelligence dashboard for full-stack and AI engineers. It aggregates public RSS/Atom feeds and Hacker News, normalizes and deduplicates stories, ranks them by engineering relevance, and presents a daily briefing with impact analysis and learning actions.

![Signal logo](public/logo.svg)

## Highlights

- 38 public technology and research sources
- Daily briefing and discovery views
- Topic and text filtering
- Freshness, launch/release, topic, and source-aware ranking
- Saved items and learning queue persisted in the browser
- Clerk authentication with Google, email/password, and phone support configured by the Clerk dashboard
- Signal, Midnight, Ocean, and Sunset themes
- Responsive desktop and mobile navigation
- No API key required for core feed aggregation

## Technology

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Clerk authentication
- `fast-xml-parser`
- Lucide React
- Node.js test runner through `tsx`

## Quick start

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy the template:

```powershell
Copy-Item .env.example .env.local
```

Populate `.env.local` for local Clerk authentication:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The core RSS feed API can run without authentication keys. However, when valid Clerk keys are configured, the application protects application and API routes by default.

## Commands

```powershell
npm run dev       # Start local development server
npm run lint      # Run ESLint
npm test          # Run unit tests
npm run build     # Create production build
npm start         # Start production build
```

## Main routes

| Route | Purpose |
|---|---|
| `/` | Authenticated dashboard and daily briefing |
| `/sign-in` | Public redirect to the Clerk hosted sign-in page |
| `/sign-up` | Public redirect to the Clerk hosted sign-up page |
| `/api/intelligence` | Aggregated and ranked technology intelligence JSON |

## Architecture summary

```text
Browser
  ├─ React UI and client state
  ├─ localStorage for saved items, queue, and theme
  └─ GET /api/intelligence
        │
        ▼
Next.js route handler
  ├─ 38-source registry
  ├─ concurrent RSS/Atom fetchers
  ├─ normalizer, deduplicator, topic extractor
  ├─ deterministic ranking and insight engine
  └─ 15-minute in-process cache
        │
        ▼
Public upstream RSS/Atom feeds
```

No application article database or AI API is required for the current implementation.

## Storage behavior

- Saved items, learning queue, and theme are stored in browser `localStorage`.
- Clerk stores identity and session data.
- Aggregated feed results are cached in the Next.js process for 15 minutes.
- The cache is not durable and is lost when a serverless instance restarts or is recycled.
- Article content is not stored in a database.

## Vercel deployment

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Add the Clerk and app URL variables in Vercel Project Settings.
4. Configure the Vercel domain in the Clerk dashboard.
5. Use production Clerk keys for production deployments.
6. Deploy with the Next.js build preset.

See [Developer Guide](DEVELOPER_GUIDE.md) for detailed setup, architecture, data flow, security, testing, and deployment instructions.
