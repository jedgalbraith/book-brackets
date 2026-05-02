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

### Data layer (in progress — JS not yet updated to consume these)

Two separate schemas, both YAML (human-authored) or JSON:

**`data/books/`** — content files. Recursive node tree:
```yaml
schema_version: "1"
root:
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
    topics:
      - slug: locations          # slug defines this topic (no _slug suffix)
        title: Locations         # button label
        brackets:
          - range: "1-17"        # always quoted; 1-based index into target's leaves
            label: Jerusalem and wilderness
```

**Naming convention:** `_slug` suffix on a field means it references another entity's slug (e.g. `book_slug`, `target_slug`). Fields that *define* a slug use `slug` without a suffix.

**Range rule:** Both ends of a `range` must be leaf nodes of their `target_slug` node — no cross-level ranges. Use a deeper `target_slug` to get finer-grained brackets.

### Visualization layer (currently being refactored)

- `js/main.js` — thematic visualization, reads `data/book_of_mormon.json` (legacy)
- `js/main-chronological.js` — chronological visualization (deferred, not a priority)
- `visualizations/1-nephi-thematic.html` — loads `main.js`
- `visualizations/1-nephi-chronological.html` — loads `main-chronological.js`

Both JS files share the same pattern: fetch JSON → build flat chapter list → draw D3 text elements → draw SVG bracket lines on button click. The JS has not yet been updated to consume the new `data/books/` and `data/brackets/` schemas — that is the next planned task.

**Known bugs in `main.js`:**
1. `drawText` receives `units` (an array) as its `data` param, then tries to access `data.chapter_url_template` — undefined, so chapter links are broken.
2. `window.onload` is set inside the async `fetchAndDrawData()` callback; by the time the fetch resolves the page load event has already fired, so the first button never auto-clicks.

Both bugs are fixed in `main-chronological.js`.

### Home page

`index.html` is a landing page with cards linking to the two visualizations. Styled by `styles/home.css`. Visualization pages share `styles/styles.css` and `styles/viz.css`.

### YAML parsing

The new data files are YAML. The current JS uses native `fetch` + `JSON.parse`. When the JS is updated to consume YAML files, **js-yaml** (CDN) will be added as a script dependency for browser-side YAML parsing.
