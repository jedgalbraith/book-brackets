# Book Brackets — Product Plan

## Vision

A web service where anyone can create and share bracket visualizations for books, scriptures, or any structured text. AI assists in generating and refining the data, making the tool accessible to non-developers while remaining powerful for technical users.

**Domain:** bookbrackets.app

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

## Technical approach

### Data layer
- Content stays in YAML/JSON documents (not normalized into relational tables) — the tree structure of books and brackets is a natural document, not a set of rows
- Thin relational DB for metadata only: user accounts, project ownership, sharing permissions
- YAML blobs in object storage (S3 or equivalent) for content

### Frontend
- Refactor `main.js` to separate data loading from rendering — preview must accept in-memory YAML content, not just fetched files
- Schema validation step between editor and preview with inline error display
- YAML editor with syntax highlighting (CodeMirror or Monaco)

### Backend (deferred to v2)
- Auth (accounts, sessions)
- Project storage API
- Sharing / public URL generation

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
- Schema validation with error display
- Contextual idea prompts
- Import / export YAML files
- No backend, no accounts

*Marketing: build in public — post progress and demos. Recruit early testers from Phase 0 communities.*

### Phase 2 — hosted service
- User accounts and auth
- Cloud project storage
- Public shareable URLs (the primary growth mechanism)
- Open source release
- Pro tier pricing

*Marketing: Show HN + Product Hunt at launch. Open source release drives GitHub discovery. Share page design ensures every shared bracket promotes the tool.*

### Phase 3 — broader audience
- Managed AI option (service covers API cost for non-BYOK users)
- Improved onboarding that hides YAML for casual users
- Template library / community sharing

*Marketing: expand beyond LDS communities to general book clubs, educators, and study groups. Template library becomes its own discovery surface.*
