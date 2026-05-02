# Plan: Update JS to consume new schema

## Context

The new `data/books/` and `data/brackets/` YAML schemas are in place. The existing `js/main.js` still reads the legacy `data/book_of_mormon.json`. This plan updates the visualization JS to load and render from the new schemas, and fixes two known bugs in `main.js` along the way.

Chronological view is deferred — only the thematic visualization is in scope.

---

## Approach

Two files:

1. **`js/loader.js`** — new shared utility. Handles YAML/JSON fetching and book tree traversal. Loaded before `main.js` as a plain `<script>` (no ES modules — consistent with existing code style).

2. **`js/main.js`** — rewritten to use the new schemas via `loader.js`. Same SVG drawing logic, new data loading and traversal.

The visualization HTML (`visualizations/1-nephi-thematic.html`) specifies which bracket file to load via a `data-brackets` attribute on `#chart`. This keeps `main.js` generic — it doesn't hardcode a data path.

---

## Changes

### `visualizations/1-nephi-thematic.html`

Add two script tags before `main.js`:
1. js-yaml from CDN: `https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js`
2. `../js/loader.js`

Add `data-brackets` attribute to `#chart`:
```html
<div id="chart" data-brackets="../data/brackets/book-of-mormon-thematic.yaml"></div>
```

### `js/loader.js` (new file)

Three functions, all globally scoped:

**`fetchData(path)`** — fetches a file and parses it as YAML or JSON based on extension:
```
if .yaml/.yml → jsyaml.load(text)
else          → JSON.parse(text)
```

**`findNodeWithTemplate(node, slug, inheritedTemplate)`** — recursive depth-first search through the book tree. Passes the most recently seen `url_template` down the recursion so the result includes both the node and its resolved URL template (from itself or nearest ancestor). Returns `{ node, urlTemplate }` or `null`.

**`collectLeaves(node)`** — returns a flat array of all nodes with no `children` (or empty `children`) in document order. These become the numbered list in the visualization.

### `js/main.js` (rewrite)

**Data loading** (replaces the single `fetch` call):
1. Read `document.getElementById('chart').dataset.brackets` for the bracket file path
2. `fetchData(bracketsPath)` → bracket data
3. `fetchData('../data/books/' + brackets.book_slug + '.yaml')` → book data
4. `findNodeWithTemplate(bookData.root, target.target_slug)` → `{ node, urlTemplate }`
5. `collectLeaves(node)` → leaf array; indices 1–N become chapter numbers

**Multi-target handling**: Use `brackets.targets[0]` for now (only 1 Nephi exists). Topics come from `target.topics`.

**Button generation** (replaces `topic_types` traversal):
```
target.topics.map(t => t.title) → button labels
button.value = topic.slug (was topic.title)
```

**Bracket drawing** (`drawLevel` / `drawTopic`):
- `drawLevel` filters `target.topics` by `slug === selectedSlug`, then iterates `topic.brackets`
- `drawTopic` uses `bracket.label` instead of `topic.title` — one field rename
- Range parsing (`"X-Y".split('-').map(Number)`) unchanged

**Bug fix 1 — chapter URL links**: Pass `urlTemplate` to `drawText` as a separate argument (same fix already applied in `main-chronological.js`). Replace `{index}` placeholder instead of `{chapter}`.

**Bug fix 2 — `window.onload` timing**: Remove the `window.onload` wrapper. Attach the button click listener and trigger the first button directly after buttons are created — the DOM is already ready at that point in the async function.

---

## Files changed

| File | Action |
|---|---|
| `visualizations/1-nephi-thematic.html` | Add js-yaml CDN, loader.js script tags; add `data-brackets` attribute |
| `js/loader.js` | Create — fetchData, findNodeWithTemplate, collectLeaves |
| `js/main.js` | Rewrite data loading and traversal; fix 2 bugs; rename `title` → `label` in drawTopic |

## Files unchanged

| File | Note |
|---|---|
| `js/main-chronological.js` | Deferred |
| `data/book_of_mormon.json` | Keep until main-chronological.js is updated |
| `data/1_nephi_summary.json` | Keep until main-chronological.js is updated |
| SVG drawing geometry in `drawTopic` | Unchanged |

---

## Verification

1. Start `python3 -m http.server 8000` from the project root
2. Open `http://localhost:8000` — home page loads
3. Click "1 Nephi - Thematic Analysis" → visualization loads with 22 chapters listed
4. Default topic (Locations) brackets render on load
5. Click Events → brackets update correctly
6. Click Years → single bracket spanning chapters 1–16
7. Click a chapter number → opens correct churchofjesuschrist.org URL in new tab
8. Open browser console → no errors
