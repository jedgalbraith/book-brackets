# Book Brackets — Product Plan

## Vision

A web service where anyone can create and share bracket visualizations for books, scriptures, or any structured text. AI assists in generating and refining the data, making the tool accessible to non-developers while remaining powerful for technical users.

**Domain:** bookbrackets.app — live, verified, and secured (HTTPS)

## Core services

Three formally-separated layers, each independently useful:

**Schema (the protocol)**
- The YAML format for book and bracket files is a public, versioned standard
- Published as JSON Schema (`schema/book.schema.json`, `schema/brackets.schema.json`)
- Anyone can build tooling against it; not locked to this app or editor

**Authoring (the editor)**
- Web editor for creating and editing book/bracket YAML files
- Non-engineers use it with AI assistance; engineers can author files directly and use the editor for preview/validation
- Two modes: local-only (BYOK, files stay on device) and cloud-connected (files saved to account)

**Registry (the community)**
- Discovery index for book and bracket files
- Authors register a URL to their YAML file; registry stores metadata, not content
- **Preferred registration path: GitHub raw URLs.** `raw.githubusercontent.com` supports CORS, so the frontend fetches and renders directly — no backend proxy needed. Branch links (`/main/`) auto-update when authors push; commit SHA links are pinned and immutable.
- GitHub becomes the collaboration layer: PRs, issues, and forks on the repo are the natural editing workflow. The registry just surfaces the result.
- Fork model: any registered file — book or bracket — can be forked; creates a new registry entry with lineage pointer. Forking a book file allows an alternative chapter structure; forking a bracket file allows a different interpretive reading.
- Hosted storage option for authors who don't want to manage a GitHub repo (this is the paid service hook)

## Core authoring paradigm

Three-panel interface:

```
┌─────────────────┬──────────────────┬──────────────────┐
│  Chat + prompts │   YAML editor    │   Live preview   │
└─────────────────┴──────────────────┴──────────────────┘
```

- **Chat panel** — conversation with AI plus contextual idea prompts that guide users through the workflow progressively (prompts change based on document state)
- **YAML editor** — the source of truth; both AI and user write here; the AI produces full-document replacements with a diff highlight showing what changed
- **Live preview** — pure render of whatever is currently in the editor; schema validation errors surface here rather than silently failing

The YAML editor is intentional — the document format is the product. Keeping the schema visible teaches users the model and makes AI-generated edits inspectable and reversible.

## AI integration

- **Bring Your Own Key (BYOK)** — users provide their own Anthropic API key; AI cost is fully delegated to the user
- AI receives the current YAML as context on each turn so it can make targeted edits
- Schema and examples are embedded in the system prompt (derived from CLAUDE.md / data examples)
- Idea prompts are contextual, rule-based in v1: determined by inspecting document state (no book → no brackets → no descriptions → etc.)

## Target users

**V1 — technical / power users**
- Developers, researchers, serious readers comfortable with YAML
- Already likely to have or be willing to get an Anthropic API key
- Self-sufficient; low support burden

**V2+ — non-developers**
- Teachers, study group leaders, general readers
- Require a managed AI option (service absorbs API cost) — deferred until demand is clear
- Onboarding needs to hide YAML complexity or guide through it via prompts alone

## Business model

Goal: cover infrastructure costs (~$20–50/month). Not a primary revenue driver.

**Strategy: open source + hosted**
- Release the tool code publicly (builds trust, drives adoption, non-devs won't self-host)
- Charge for cloud features

**Free tier**
- Full tool access locally (BYOK, YAML files stay on device)
- No account required

**Pro tier — ~$20/year or $4/month**
- Cloud sync (projects saved to account)
- Public shareable URLs
- Multiple projects

**Not planned**
- Metered AI usage resale (margin risk, accounting complexity — BYOK solves this cleanly)
- Enterprise / teams (out of scope)

## Repositories

Two repos. That's it.

**`bookbrackets-data`** (public GitHub repo)
- `data/books/*.yaml` — canonical book content files
- `data/brackets/*.yaml` — canonical bracket annotation files
- `schema/book.schema.json` + `schema/brackets.schema.json` — the authoritative schema spec
- Registered in the registry like any community member's files — no privileged back channel
- Third-party authors reference the raw GitHub schema URLs in their `yaml-language-server` comments
- Home page discovery: `bookbrackets-data` maintains an `index.yaml`; the home page fetches it by raw GitHub URL in Phase 1, switches to the registry API in Phase 2

**`bookbrackets`** (Rails app, this becomes everything else)
- Visualization engine (D3.js static files in `public/`)
- Home / landing page (starts static in `public/`, graduates to a Rails view when it needs dynamic registry content)
- Editor tool (client-side HTML in `public/`, local-first — no server involvement)
- Registry (browse, search, register, fork)
- User accounts + auth
- Hosted YAML file storage
- Payments

The `book-brackets` JS repo is retired once its files are moved into the Rails app.

## Technical approach

### Data layer
- Content stays in YAML/JSON documents (not normalized into relational tables) — the tree structure of books and brackets is a natural document, not a set of rows
- Thin relational DB for metadata only: user accounts, registry entries, fork lineage, sharing permissions (Supabase or Neon)
- YAML blobs in Cloudflare R2 for hosted content (zero egress fees, S3-compatible)

### Frontend
- Visualization static files (`main.js`, `loader.js`, `visualization.html`, styles) live in Rails `public/` — served as-is, no Rails view layer needed
- Home page starts as a static file in `public/`; graduates to a Rails view when registry entries need to appear dynamically
- Editor is a client-side HTML file in `public/` — local-first, no server involvement regardless of which repo hosts it
- Refactor `main.js` to separate data loading from rendering — preview must accept in-memory YAML content, not just fetched files
- Schema validation step between editor and preview with inline error display
- YAML editor with syntax highlighting (CodeMirror or Monaco)

### Registry data model

**Book entries** and **bracket entries** are separate registry objects. A bracket entry references a book entry by slug — one canonical book structure, many bracket overlays.

Each entry: `{ id, author, title, schema_version, url, url_type, content_hash, last_verified, forked_from? }`

- `url` is the authoritative source; `url_type` is one of `github_branch` | `github_commit` | `hosted` | `external`
- `github_branch` links (e.g. `/main/`) auto-update on push; `github_commit` links are pinned and immutable — registry displays which type
- `content_hash` detects when a file has changed and enables caching a last-known-good copy for resilience if the origin goes down or the repo is deleted
- `last_verified` + periodic re-validation flags stale or broken entries
- `forked_from` preserves lineage in the DB — fork history is data, not just a copy
- For GitHub-hosted files, the backend is purely an index and validator — it does not proxy or serve the file content; the frontend fetches directly

**Discovery facets:** book title / text, topic/tag, author, fork lineage

### Backend

**When it's needed — by phase:**

**Phase 1:** None. The editor runs entirely in the browser; the Anthropic API is called directly from the client via BYOK. No server required.

**Phase 2 (registry launch):** Backend becomes necessary for:
- User accounts and session management — can't be done securely client-side
- Registry database — book/bracket entry metadata, fork lineage, author ownership
- Hosted file storage — serving YAML files for authors who don't use GitHub
- Periodic re-validation jobs — fetch registered URLs, check schema, update `content_hash` and `last_verified`, flag broken entries
- Canonical public URLs (`bookbrackets.app/r/<id>`)
- Pro tier payments (Stripe)
- Note: for GitHub-hosted files, the backend is index-only; no file proxying needed

**Auth: passwordless magic links**
Users enter their email and receive a one-time login link — no password, no reset flow. Right for this app: users log in infrequently and low friction matters more than session security.

Implementation: Rails 8 auth generator (`rails generate authentication`) scaffolds User + Session models; magic link layer is a `MagicLink` model (`token`, `user_id`, `expires_at`, `used_at`) + ActionMailer. No auth gem needed — the logic fits in ~100 lines and is easy to audit.

Security checklist:
- Tokens are single-use — `used_at` set on first click, subsequent clicks rejected
- Tokens expire in 15–30 minutes
- Token generated with `SecureRandom.urlsafe_base64`
- Email sends rate-limited per address to prevent abuse

**Phase 3 (broader audience):** Extends Phase 2 with:
- Service-side Anthropic API calls for managed AI (non-BYOK users)
- Usage metering and cost accounting per user

**Technology: Ruby on Rails (full-stack)**

`rails new` (not API mode) is the right fit:
- Registry UI (browse, search, auth, registration forms, fork UI, user dashboard) is CRUD-heavy — server-rendered Rails views with Hotwire/Turbo are faster to build than a separate SPA
- The existing visualization pages (static HTML/JS/D3) drop into Rails `/public` unchanged — no rewrite needed
- Single repo, single deploy, one place to debug — the right tradeoff for a solo project
- Rails ecosystem covers everything needed: Devise (auth), Active Storage (S3 file uploads), Sidekiq + Redis (background re-validation jobs), stripe-ruby (payments)
- API-only mode would only be justified with a separate React/TypeScript frontend or separate teams — neither applies here

**Deployment stack:**
- **Kamal** (Rails 8 default) deploying to a **Hetzner** CX21 VPS, US region (~$6/month) — Rails + Kamal + Hetzner is the 37signals-endorsed stack; kamal-proxy handles SSL via Let's Encrypt automatically
- **Supabase or Neon** for managed Postgres (free tier to start, no self-hosting)
- **Upstash** for managed Redis / Sidekiq background jobs (free tier, serverless)
- **Cloudflare R2** for hosted YAML file storage — S3-compatible (Active Storage works via S3 adapter, no code changes), zero egress fees, free tier covers 10GB + 10M reads/month; already in the same dashboard as DNS

Estimated cost at launch: ~$6-10/month.

## Security

### SSRF (highest priority)
When the backend fetches registered URLs for re-validation, attackers could register internal addresses (`http://169.254.169.254/`, `http://localhost:5432`, etc.) to probe the server's internal network. Use the `ssrf_filter` gem for all outbound URL fetches. Consider a hostname allowlist — `raw.githubusercontent.com` is the primary legitimate host; others should be explicitly opted in.

### YAML parsing
Always use `Psych.safe_load` (not `Psych.load`) when parsing externally-fetched or user-submitted YAML on the backend. `Psych.load` can execute arbitrary Ruby. The frontend uses js-yaml in safe mode by default — no action needed there.

### XSS via D3 rendering
Bracket labels and descriptions from external YAML files are rendered into the DOM. Audit `main.js` to confirm all user-controlled content uses D3's `.text()` (HTML-escaped) rather than `.html()`. An attacker's YAML file should never become an XSS vector for visitors.

### Anthropic API key (BYOK)
The editor sends the user's API key directly from the browser to Anthropic — never route it through the Book Brackets backend. Enforce by design: the backend should have no endpoint that accepts or proxies Anthropic API calls. HTTPS only.

### Magic link security
- Tokens are single-use — reject any token where `used_at` is set
- Tokens expire in 15–30 minutes
- Validate `return_to` redirect parameters are same-domain before redirecting (open redirect prevention)
- Generate new session on login to prevent session fixation

### Rate limiting
- Magic link email sends: rate limit per address to prevent email bombing
- Re-validation jobs: throttle outbound fetches — don't hammer external servers on every run; cache `last_verified` and space checks appropriately

## Brand

Book Brackets is a tool for readers who think structurally — not casual reading, but deliberate, analytical engagement with texts. The tool's purpose is making structure visible: patterns that were always in the text but hard to see.

**Voice:** Precise, understated. Let the visualization carry the weight. No hype or enthusiasm-inflation. Share observations, not opinions. The brackets do the talking.

**Visual identity:** The bracket lines are the anchor. A consistent screenshot format — clean background, the D3 visualization, minimal caption — becomes recognizable over time without requiring design work per post.

### Post types

Three repeatable formats reduce the "what do I post" decision to a template:

**The observation** — share a finished bracket with one sentence about what the structure reveals. No opinion, just pattern: *"All of 1 Nephi 1–18 takes place before Lehi's family leaves the Arabian peninsula."* The visual makes it interesting; the caption just describes what it shows.

**The build note** — one specific technical decision and why: a D3 rendering choice, the YAML schema, how the AI authoring loop works. Developer audience responds to concrete, specific details. One thing per post, not a comprehensive update.

**The question** — something the tool surfaced that is still open: *"Thematically, does Isaiah 40–55 feel like a distinct unit to you? The bracket data suggests it."* Invites engagement without requiring a stated opinion.

## Growth and visibility

**The output is the marketing.** Every public bracket someone shares in a study group or on social media is an ad — people ask "how did you make this?" Design share pages to make the tool's existence obvious. Shareable public URLs (Phase 2) unlock this flywheel.

**Build in public while building.** Post progress on X/Twitter or a blog: D3 visualizations, the AI authoring flow, interesting brackets created along the way. Builds an audience before launch rather than starting from zero.

**Targeted communities first.** The Book of Mormon use case gives a concrete starting point — LDS study groups, Come Follow Me communities, seminary teachers. Share interesting brackets in Reddit (r/latterdaysaints, r/bookclub), Facebook groups, and Discord servers before the product is finished. Content-first, tool-second.

**Open source visibility.** A well-crafted README with a live demo link drives passive discovery via GitHub search and referrals. Visual output gets starred and shared without active promotion.

**Schema on the home page.** The open format is a credibility and invitation signal aimed at two audiences differently:
- *Developers:* "This is a real, versioned, public format — build on it, host files on GitHub, your data works with any compatible tool." Link "open format" to the published JSON Schema files.
- *General users:* Don't mention the schema directly. Surface the GitHub-first workflow as a concrete benefit: "Put your file on GitHub, share a link, it just works."

The home page implementation is a "How it works" section with three steps — Author (open format, or use the editor) → Host (GitHub or us) → Share (register, get a public URL) — plus a short callout near the top: *"Book Brackets uses an open YAML schema. Author files anywhere, host them on GitHub, share them with anyone."* Avoid a technical deep-dive; the schema matters to developers and they'll find it. Everyone else just needs to know their data isn't locked in.

**At launch:**
- Show HN on Hacker News (D3 + AI + YAML is a compelling technical story)
- Product Hunt
- Indie Hackers to document the journey and share revenue milestones

## Phases

### Phase 0 — current state
Pure frontend visualization. Data is hand-authored YAML files. AI assistance via Claude Code in the IDE (developer only).

*Marketing: start sharing interesting brackets in Book of Mormon communities now, before any product exists. Build content credibility early.*

### Phase 1 — single-user authoring tool (local-first)
- Three-panel UI (chat + YAML editor + preview)
- BYOK AI integration
- Preview renders from in-memory YAML (no file fetch required)
- **Formal schema:** publish `schema/book.schema.json` and `schema/brackets.schema.json`; editor validation uses these schemas
- Schema validation with error display
- Contextual idea prompts
- Import / export YAML files
- No backend, no accounts

*Marketing: build in public — post progress and demos. Recruit early testers from Phase 0 communities.*

### Phase 2 — hosted service + registry
- User accounts and auth
- **Registry launch:** browse, search, and register entries (external URLs accepted)
- **Fork:** one-click fork of any public registry entry — book or bracket files
- Hosted storage for authors who want Book Brackets to serve their files
- Public shareable URLs — each registry entry gets a canonical URL on bookbrackets.app (the primary growth mechanism)
- Open source release
- Pro tier: hosted storage + multiple projects + private entries

*Marketing: Show HN + Product Hunt at launch. Open source release drives GitHub discovery. Share page design ensures every shared bracket promotes the tool.*

### Phase 3 — broader audience
- Managed AI option (service covers API cost for non-BYOK users)
- Improved onboarding that hides YAML for casual users
- Template library / community sharing

*Marketing: expand beyond LDS communities to general book clubs, educators, and study groups. Template library becomes its own discovery surface.*
