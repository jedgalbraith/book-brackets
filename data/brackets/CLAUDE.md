# Bracket Overlay Files — Authoring Guide

Files in this directory are human-authored YAML describing bracket groupings over a book's chapters.

## Required top-level fields

```yaml
schema_version: "1"
author: "AI: Claude"              # or human name
title: "Old Testament — Thematic Analysis"
book_slug: bible-old-testament    # must match the root slug of the book file (= filename stem)
targets:
  - target_slug: genesis          # slug of the node whose leaf children form the numbered list
    default_right: years          # optional: topic slug pre-selected on the right in dual view
    topics:
      - slug: phases
        title: Phases
        description: "The major narrative phases of Genesis."  # optional, short phrase
        brackets:
          - range: "1-11"
            label: Primeval history
```

## Topic sets by genre

Apply the standard set for the genre; add or omit topics that don't fit (e.g., skip locations for books without meaningful geographic movement).

### Pentateuch (Genesis–Deuteronomy)

Order: **phases/sections/speeches** → **themes** → **key-figures** → **key-events** → **locations** → **covenants** → **years** → **come-follow-me**

| Slug | Title | Notes |
|------|-------|-------|
| `phases` / `sections` / `speeches` | Phases / Sections / Speeches | use whichever fits the book's structure |
| `themes` | Themes | always include |
| `key-figures` | Key Figures | always include |
| `key-events` | Key Events | always include |
| `locations` | Locations | include for Genesis, Exodus, Numbers; omit for Leviticus |
| `covenants` | Covenants | Pentateuch only |
| `years` | Years | always include; set as `default_right` |
| `come-follow-me` | Come, Follow Me 2026 | always include; always last |

### Historical Books (Joshua–Esther)

Order: **phases** → **themes** → **key-figures** → **key-events** → **locations** → **years** → **come-follow-me**

(No covenants. Omit locations only if the book has no significant geographic movement.)

### Future genres (define when first encountered)

- Wisdom/Poetry (Job, Psalms, Proverbs, Ecclesiastes, Song)
- Major Prophets (Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel)
- Minor Prophets (Hosea–Malachi)
- NT Gospels
- NT Epistles

## Topic ordering rule

Structural grouping first → thematic content → covenants (Pentateuch only) → years → come-follow-me last.

Never reorder within a book after initial authoring — the UI preserves the file order.

## Bracket label rules

- **Max 40 characters** — hard limit
- No terminal punctuation
- Use title case for proper names, sentence case otherwise
- Years: `"~YYYY–YYYY BC"` or `"~YYYY BC"` — tilde, en dash (–), always quoted

## Come, Follow Me conventions

**Label format:** `"Week N · Mon DD–DD"` — e.g., `"Week 21 · May 18–24"`

- Use middle dot (·) not a dash
- Abbreviate month to 3 letters (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec)
- Use en dash (–) between days, no spaces around it

**Non-contiguous assignments:** If a week covers non-adjacent chapters, create one bracket entry per range, all with the same label:

```yaml
- slug: come-follow-me
  title: Come, Follow Me 2026
  brackets:
    - range: "19-20"
      label: "Week 17 · Apr 20–26"
    - range: "24-24"
      label: "Week 17 · Apr 20–26"
    - range: "31-34"
      label: "Week 17 · Apr 20–26"
```

**CFM 2026 OT schedule source:**
https://www.churchofjesuschrist.org/study/manual/come-follow-me-for-home-and-church-old-testament-2026?lang=eng

**Weeks completed so far:**

| Weeks | Books |
|-------|-------|
| Weeks 1–20 | (pre-Joshua; already in file) |
| Week 21 · May 18–24 | Joshua 1–8, 23–24 |
| Week 22 · May 25–31 | Judges 2–4, 6–8, 13–16 |
| Week 23 · Jun 1–7 | Ruth; 1 Samuel 1–3 |
| Week 24 · Jun 8–14 | 1 Samuel 8–13 |
| Week 25 · Jun 15–21 | 1 Samuel 16–18, 24, 26 |
| Week 26 · Jun 22–28 | 2 Samuel 11–12; 1 Kings 3, 5–6, 8, 11 |
| Week 27 · Jun 29–Jul 5 | 1 Kings 17–19 |
| Week 28 · Jul 6–12 | 2 Kings 2–7 |
| Week 29 · Jul 13–19 | 2 Kings 16–25 |

## `default_right` convention

- OT books: always `default_right: years`
- Set `default_left` only when a topic other than the first makes a better left-side default
- Both fields are optional; if absent, dual view defaults to first topic left, second topic right

## Other top-level fields

- `drills_into:` — on a target, lists child target slugs for drill-down navigation (used in BOM overview target; rare)
