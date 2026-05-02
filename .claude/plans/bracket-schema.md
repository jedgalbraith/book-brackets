# Plan: Bracket Schema

## Context

Book content schema is done (`data/books/book-of-mormon.yaml`). This plan defines the bracket overlay schema — the thematic groupings that become buttons and SVG brackets in the visualization. A single bracket file can annotate multiple sections of a book, supporting e.g. one file covering all of the Book of Mormon.

Scope: thematic view only (chronological view deferred).

---

## Schema Design

```yaml
schema_version: "1"
title: string            # optional display name for this bracket set
book_slug: string        # slug matching a file in data/books/ → data/books/{book_slug}.yaml
targets:
  - target_slug: string    # slug of a node in the book file; its leaf children become the numbered list
    topics:
      - slug: string       # this topic's own slug — kebab-case, unique within the file
        title: string      # button label in the UI
        description: string  # optional
        brackets:
          - range: "X-Y"   # always quoted; 1-based index into section's leaf children
            label: string  # text displayed next to the bracket line
```

### Field reference

| Field | Level | Purpose |
|---|---|---|
| `book_slug` | root | References `data/books/{book_slug}.yaml` |
| `targets` | root | Array of book nodes being targeted for annotation |
| `target_slug` | target | Slug of a node in the book file; its leaf `children` define the index space for `range` |
| `topics` | target | Array of thematic groupings; each produces one button |
| `slug` | topic | This topic's own slug (defines, not references — no `_slug` suffix) |
| `title` | topic | Button label displayed in the UI |
| `brackets` | topic | Array of bracket lines to draw when this topic is active |
| `range` | bracket | Always quoted. `"X-Y"` or `"X"` — 1-based index into the section's leaf nodes |
| `label` | bracket | Text displayed next to the bracket line |

### Rules
- **Same-level ranges only** — both ends of a `range` must be leaf nodes of their `target_slug` node. Use a deeper `target_slug` for finer-grained brackets.
- **`range` always quoted** — prevents YAML from parsing single values like `18` as integers.
- **`_slug` suffix convention** — fields that reference another entity's slug carry `_slug`; fields that define a slug do not.

---

## File to create

**`data/brackets/book-of-mormon-thematic.yaml`**

```yaml
schema_version: "1"
title: Book of Mormon — Thematic Analysis
book_slug: book-of-mormon
targets:
  - target_slug: 1-nephi
    topics:
      - slug: locations
        title: Locations
        description: The locations where the chapters took place.
        brackets:
          - range: "1-17"
            label: Jerusalem and wilderness
          - range: "18"
            label: Ocean
          - range: "19-22"
            label: Promised Land

      - slug: events
        title: Events
        description: The events that occur in the chapters.
        brackets:
          - range: "3-5"
            label: Return for plates
          - range: "8"
            label: "Lehi's vision of the Tree of Life"

      - slug: years
        title: Years
        description: The years that the chapters took place.
        brackets:
          - range: "1-16"
            label: "600 B.C."
```

---

## Directory structure

```
data/
  books/
    book-of-mormon.yaml
  brackets/
    book-of-mormon-thematic.yaml
```

---

## Verification

1. Confirm `data/brackets/book-of-mormon-thematic.yaml` is valid YAML
2. Confirm `book_slug: book-of-mormon` resolves to `data/books/book-of-mormon.yaml`
3. Confirm `target_slug: 1-nephi` exists as a slug in `book-of-mormon.yaml`
4. Confirm all `range` values are quoted strings
5. Confirm no chapter descriptions or other content data appear in the bracket file
