# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

No build step. Serve the project root with any static file server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. The YAML data files require a server — they cannot be loaded via `file://`.

## Architecture

Book Brackets is a pure-frontend D3.js visualization. It renders a vertical numbered list of chapters and draws SVG bracket lines on the left side grouping chapters by thematic category. Topic buttons toggle between bracket views.

### Data layer

Two separate schemas, both YAML (human-authored):

**`data/books/`** — content files. Recursive node tree:
```yaml
schema_version: "1"
slug: book-of-mormon   # kebab-case, unique within file
type: volume           # user-defined label, renderer ignores it
title: ...
description: ...
url_template: "https://.../{index}?lang=eng"  # {index} = 1-based leaf position
children:              # absent on leaf nodes
  - slug: 1-nephi
    type: book
    children:
      - slug: 1-nephi-1
        type: chapter
        description: ...
```

**`data/brackets/`** — bracket overlay files. Reference a book node by slug; ranges index into that node's leaf children:
```yaml
schema_version: "1"
book_slug: book-of-mormon        # → data/books/book-of-mormon.yaml
targets:
  - target_slug: 1-nephi         # node whose leaf children = the numbered list
    default_left: locations      # optional: topic slug to pre-select on left in dual view
    default_right: themes        # optional: topic slug to pre-select on right in dual view
    topics:
      - slug: locations          # slug defines this topic (no _slug suffix)
        title: Locations         # button label
        brackets:
          - range: "1-17"        # always quoted; 1-based index into target's leaves
            label: Jerusalem and wilderness
```

`default_left` / `default_right` are optional. If absent or the slug is not found, the dual view falls back to selecting the first topic on the left and the second on the right.

**Naming convention:** `_slug` suffix on a field means it references another entity's slug (e.g. `book_slug`, `target_slug`). Fields that *define* a slug use `slug` without a suffix.

**Range rule:** Both ends of a `range` must be leaf nodes of their `target_slug` node — no cross-level ranges. Use a deeper `target_slug` to get finer-grained brackets.

**Character limits:**
- Bracket `label` values: 40 characters max
- Leaf node `description` values: 90 characters max

### Visualization layer

- `js/loader.js` — shared utilities: `fetchData` (fetch + YAML/JSON parse), `findNodeWithTemplate` (depth-first slug lookup that inherits `url_template`), `collectLeaves` (flat array of leaf nodes)
- `js/main.js` — reads `data/books/index.yaml` → fetches the selected book and bracket files → renders D3 SVG with dual left/right topic dropdowns per target section
- `visualizations/visualization.html` — single generic page; takes `?book=<slug>` (required), `?brackets=<file>` (optional), `?left=<slug>` and `?right=<slug>` (optional topic pre-selection)

**YAML parsing:** js-yaml (CDN) is loaded in `visualization.html`; `fetchData` in `loader.js` detects `.yaml`/`.yml` extensions and routes through `jsyaml.load`.

### Home page

`index.html` is a landing page. `js/home.js` fetches `data/books/index.yaml` and renders a card grid linking to `visualization.html?book=<slug>`. Styled by `styles/home.css`. Visualization pages share `styles/styles.css` and `styles/viz.css`.
