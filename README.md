# Book Brackets

An interactive visualization that draws bracket overlays on chapter lists to show thematic groupings across books of scripture. Built with D3.js and plain HTML — no build step.

## Demo

Hosted on GitHub Pages: [jedgalbraith.github.io/book-brackets](https://jedgalbraith.github.io/book-brackets)

## How it works

The home page reads a manifest (`data/brackets/index.yaml`) and renders a card for each available visualization. Each visualization page loads two YAML files:

- **`data/books/`** — the book content: a recursive node tree of volumes, books, and chapters with titles and descriptions
- **`data/brackets/`** — the bracket overlays: which node to target, what topics to show, and what chapter ranges each topic covers

Clicking a topic button draws SVG bracket lines grouping the relevant chapters. Clicking a chapter number opens it on ChurchofJesusChrist.org.

## Running locally

No install required. Serve from the project root (YAML files require HTTP — `file://` won't work):

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Adding content

### New book data

Add a file to `data/books/` following the recursive node schema:

```yaml
schema_version: "1"
root:
  slug: my-book
  type: volume
  title: My Book
  children:
    - slug: part-one
      type: book
      title: Part One
      url_template: "https://example.com/book/{index}"
      children:
        - slug: part-one-1
          type: chapter
          description: Chapter summary here.
```

`url_template` is inherited by child nodes. `{index}` is replaced with the 1-based chapter number within that book.

### New bracket overlay

Add a file to `data/brackets/` and register it in `data/brackets/index.yaml`:

```yaml
schema_version: "1"
title: My Book — Thematic Analysis
book_slug: my-book        # matches a file in data/books/
targets:
  - target_slug: part-one  # slug of the node whose leaves = the numbered list
    topics:
      - slug: themes
        title: Themes
        brackets:
          - range: "1-5"   # 1-based, always quoted, must be contiguous
            label: Introduction
```

Then add an entry to `data/brackets/index.yaml`:

```yaml
brackets:
  - file: my-book.yaml
    title: My Book — Thematic Analysis
    description: Explore chapters by theme.
```

No code changes needed.

## Tech stack

- **D3.js v7** — SVG bracket rendering
- **js-yaml** — browser-side YAML parsing
- **Vanilla JS / HTML / CSS** — everything else

## Project structure

```
data/
  books/          # book content files (recursive node trees)
  brackets/       # bracket overlay files + index.yaml manifest
js/
  loader.js       # fetchData(), findNodeWithTemplate(), collectLeaves()
  main.js         # visualization: renders chapters + bracket interactivity
  home.js         # home page: reads index.yaml, renders cards
styles/
  styles.css      # SVG element styles (brackets, chapter text)
  viz.css         # visualization page layout
  home.css        # home page layout
visualizations/
  visualization.html   # visualization shell (loads main.js)
index.html        # home page shell (loads home.js)
```