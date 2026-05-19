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

**Full CFM 2026 OT schedule:**

Note: 1 Chronicles and Song of Solomon have no CFM 2026 assignment. Week 14 (Mar 30–Apr 5) is Easter; Week 52 (Dec 21–27) is Christmas — neither has a reading assignment.

| Week | Dates | Assignment |
|------|-------|------------|
| 1 | Dec 29–Jan 4 | Introduction to the Old Testament |
| 2 | Jan 5–11 | Moses 1; Abraham 3 |
| 3 | Jan 12–18 | Genesis 1–2; Moses 2–3; Abraham 4–5 |
| 4 | Jan 19–25 | Genesis 3–4; Moses 4–5 |
| 5 | Jan 26–Feb 1 | Genesis 5; Moses 6 |
| 6 | Feb 2–8 | Moses 7 |
| 7 | Feb 9–15 | Genesis 6–11; Moses 8 |
| 8 | Feb 16–22 | Genesis 12–17; Abraham 1–2 |
| 9 | Feb 23–Mar 1 | Genesis 18–23 |
| 10 | Mar 2–8 | Genesis 24–33 |
| 11 | Mar 9–15 | Genesis 37–41 |
| 12 | Mar 16–22 | Genesis 42–50 |
| 13 | Mar 23–29 | Exodus 1–6 |
| 14 | Mar 30–Apr 5 | Easter (no assignment) |
| 15 | Apr 6–12 | Exodus 7–13 |
| 16 | Apr 13–19 | Exodus 14–18 |
| 17 | Apr 20–26 | Exodus 19–20; 24; 31–34 |
| 18 | Apr 27–May 3 | Exodus 35–40; Leviticus 1; 4; 16; 19 |
| 19 | May 4–10 | Numbers 11–14; 20–24; 27 |
| 20 | May 11–17 | Deuteronomy 6–8; 15; 18; 29–30; 34 |
| 21 | May 18–24 | Joshua 1–8; 23–24 |
| 22 | May 25–31 | Judges 2–4; 6–8; 13–16 |
| 23 | Jun 1–7 | Ruth; 1 Samuel 1–7 |
| 24 | Jun 8–14 | 1 Samuel 8–10; 13; 15–16 |
| 25 | Jun 15–21 | 1 Samuel 17–18; 24–26; 2 Samuel 5–7 |
| 26 | Jun 22–28 | 2 Samuel 11–12; 1 Kings 3; 6–9; 11 |
| 27 | Jun 29–Jul 5 | 1 Kings 12–13; 17–22 |
| 28 | Jul 6–12 | 2 Kings 2–7 |
| 29 | Jul 13–19 | 2 Kings 16–25 |
| 30 | Jul 20–26 | 2 Chronicles 14–20; 26; 30 |
| 31 | Jul 27–Aug 2 | Ezra 1; 3–7; Nehemiah 2; 4–6; 8 |
| 32 | Aug 3–9 | Esther |
| 33 | Aug 10–16 | Job 1–3; 12–14; 19; 21–24; 38–40; 42 |
| 34 | Aug 17–23 | Psalms 1–2; 8; 19–33; 40; 46 |
| 35 | Aug 24–30 | Psalms 49–51; 61–66; 69–72; 77–78; 85–86 |
| 36 | Aug 31–Sep 6 | Psalms 102–3; 110; 116–19; 127–28; 135–39; 146–50 |
| 37 | Sep 7–13 | Proverbs 1–4; 15–16; 22; 31; Ecclesiastes 1–3; 11–12 |
| 38 | Sep 14–20 | Isaiah 1–12 |
| 39 | Sep 21–27 | Isaiah 13–14; 22; 24–30; 35 |
| 40 | Sep 28–Oct 4 | Isaiah 40–49 |
| 41 | Oct 5–11 | Isaiah 50–57 |
| 42 | Oct 12–18 | Isaiah 58–66 |
| 43 | Oct 19–25 | Jeremiah 1–3; 7; 16–18; 20 |
| 44 | Oct 26–Nov 1 | Jeremiah 31–33; 36–38; Lamentations 1; 3 |
| 45 | Nov 2–8 | Ezekiel 1–3; 33–34; 36–37; 47 |
| 46 | Nov 9–15 | Daniel 1–7 |
| 47 | Nov 16–22 | Hosea 1–6; 10–14; Joel |
| 48 | Nov 23–29 | Amos; Obadiah; Jonah |
| 49 | Nov 30–Dec 6 | Micah; Nahum; Habakkuk; Zephaniah |
| 50 | Dec 7–13 | Haggai 1–2; Zechariah 1–4; 7–14 |
| 51 | Dec 14–20 | Malachi |
| 52 | Dec 21–27 | Christmas (no assignment) |

## `default_right` convention

- OT books: always `default_right: years`
- Set `default_left` only when a topic other than the first makes a better left-side default
- Both fields are optional; if absent, dual view defaults to first topic left, second topic right

## Other top-level fields

- `drills_into:` — on a target, lists child target slugs for drill-down navigation (used in BOM overview target; rare)
