# Book Content Files — Authoring Guide

Files in this directory are human-authored YAML describing the content of a text (volume → book → chapter).

## File naming

Filename must match the root node's `slug` + `.yaml` — the JS derives the file path directly from the slug.

- Bible volumes are prefixed with `bible-` (e.g., `bible-old-testament.yaml`, `bible-new-testament.yaml`)
- All other volumes: `{slug}.yaml` (e.g., `book-of-mormon.yaml`, `moby-dick.yaml`)

## Required top-level fields

```yaml
schema_version: "1"
author: "AI: Claude"        # or human name
disclaimer: "..."           # copy standard LDS disclaimer from any existing bible file
root:
  slug: bible-old-testament # must match filename stem exactly
  type: testament           # testament | volume | book — renderer ignores this label
  title: Old Testament
  description: >
    One or two sentences describing the volume.
  children:
    - slug: genesis
      type: book
      title: Genesis
      url_template: "https://..."
      children:
        - slug: genesis-1
          type: chapter
          description: "..."
```

## Chapter description rules

- **Max 90 characters** — hard limit, checked by convention not code
- One sentence, active present tense: "God creates the heavens and earth in six days."
- Focus on what happens, not theological interpretation
- Omit the chapter number from the description

## Scripture URL templates

The base URL is `https://www.churchofjesuschrist.org/study/scriptures`. `{index}` is the 1-based chapter number.

### Old Testament

| Book | Path segment |
|------|-------------|
| Genesis | `/ot/gen/{index}?lang=eng` |
| Exodus | `/ot/ex/{index}?lang=eng` |
| Leviticus | `/ot/lev/{index}?lang=eng` |
| Numbers | `/ot/num/{index}?lang=eng` |
| Deuteronomy | `/ot/deut/{index}?lang=eng` |
| Joshua | `/ot/josh/{index}?lang=eng` |
| Judges | `/ot/judg/{index}?lang=eng` |
| Ruth | `/ot/ruth/{index}?lang=eng` |
| 1 Samuel | `/ot/1-sam/{index}?lang=eng` |
| 2 Samuel | `/ot/2-sam/{index}?lang=eng` |
| 1 Kings | `/ot/1-kgs/{index}?lang=eng` |
| 2 Kings | `/ot/2-kgs/{index}?lang=eng` |
| 1 Chronicles | `/ot/1-chr/{index}?lang=eng` |
| 2 Chronicles | `/ot/2-chr/{index}?lang=eng` |
| Ezra | `/ot/ezra/{index}?lang=eng` |
| Nehemiah | `/ot/neh/{index}?lang=eng` |
| Esther | `/ot/esth/{index}?lang=eng` |
| Job | `/ot/job/{index}?lang=eng` |
| Psalms | `/ot/ps/{index}?lang=eng` |
| Proverbs | `/ot/prov/{index}?lang=eng` |
| Ecclesiastes | `/ot/eccl/{index}?lang=eng` |
| Song of Solomon | `/ot/song/{index}?lang=eng` |
| Isaiah | `/ot/isa/{index}?lang=eng` |
| Jeremiah | `/ot/jer/{index}?lang=eng` |
| Lamentations | `/ot/lam/{index}?lang=eng` |
| Ezekiel | `/ot/ezek/{index}?lang=eng` |
| Daniel | `/ot/dan/{index}?lang=eng` |
| Hosea | `/ot/hosea/{index}?lang=eng` |
| Joel | `/ot/joel/{index}?lang=eng` |
| Amos | `/ot/amos/{index}?lang=eng` |
| Obadiah | `/ot/obad/{index}?lang=eng` |
| Jonah | `/ot/jonah/{index}?lang=eng` |
| Micah | `/ot/micah/{index}?lang=eng` |
| Nahum | `/ot/nahum/{index}?lang=eng` |
| Habakkuk | `/ot/hab/{index}?lang=eng` |
| Zephaniah | `/ot/zeph/{index}?lang=eng` |
| Haggai | `/ot/hag/{index}?lang=eng` |
| Zechariah | `/ot/zech/{index}?lang=eng` |
| Malachi | `/ot/mal/{index}?lang=eng` |

### New Testament

| Book | Path segment |
|------|-------------|
| Matthew | `/nt/matt/{index}?lang=eng` |
| Mark | `/nt/mark/{index}?lang=eng` |
| Luke | `/nt/luke/{index}?lang=eng` |
| John | `/nt/john/{index}?lang=eng` |
| Acts | `/nt/acts/{index}?lang=eng` |
| Romans | `/nt/rom/{index}?lang=eng` |
| 1 Corinthians | `/nt/1-cor/{index}?lang=eng` |
| 2 Corinthians | `/nt/2-cor/{index}?lang=eng` |
| Galatians | `/nt/gal/{index}?lang=eng` |
| Ephesians | `/nt/eph/{index}?lang=eng` |
| Philippians | `/nt/philip/{index}?lang=eng` |
| Colossians | `/nt/col/{index}?lang=eng` |
| 1 Thessalonians | `/nt/1-thes/{index}?lang=eng` |
| 2 Thessalonians | `/nt/2-thes/{index}?lang=eng` |
| 1 Timothy | `/nt/1-tim/{index}?lang=eng` |
| 2 Timothy | `/nt/2-tim/{index}?lang=eng` |
| Titus | `/nt/titus/{index}?lang=eng` |
| Philemon | `/nt/philem/{index}?lang=eng` |
| Hebrews | `/nt/heb/{index}?lang=eng` |
| James | `/nt/james/{index}?lang=eng` |
| 1 Peter | `/nt/1-pet/{index}?lang=eng` |
| 2 Peter | `/nt/2-pet/{index}?lang=eng` |
| 1 John | `/nt/1-jn/{index}?lang=eng` |
| 2 John | `/nt/2-jn/{index}?lang=eng` |
| 3 John | `/nt/3-jn/{index}?lang=eng` |
| Jude | `/nt/jude/{index}?lang=eng` |
| Revelation | `/nt/rev/{index}?lang=eng` |

## Chapter counts (for planning batch sizes)

### Old Testament — completed

| Book | Chapters | Status |
|------|----------|--------|
| Genesis | 50 | done |
| Exodus | 40 | done |
| Leviticus | 27 | done |
| Numbers | 36 | done |
| Deuteronomy | 34 | done |
| Joshua | 24 | done |
| Judges | 21 | done |
| Ruth | 4 | done |
| 1 Samuel | 31 | done |
| 2 Samuel | 24 | done |
| 1 Kings | 22 | done |
| 2 Kings | 25 | done |

### Old Testament — remaining

| Book | Chapters |
|------|----------|
| 1 Chronicles | 29 |
| 2 Chronicles | 36 |
| Ezra | 10 |
| Nehemiah | 13 |
| Esther | 10 |
| Job | 42 |
| Psalms | 150 |
| Proverbs | 31 |
| Ecclesiastes | 12 |
| Song of Solomon | 8 |
| Isaiah | 66 |
| Jeremiah | 52 |
| Lamentations | 5 |
| Ezekiel | 48 |
| Daniel | 12 |
| Hosea | 14 |
| Joel | 3 |
| Amos | 9 |
| Obadiah | 1 |
| Jonah | 4 |
| Micah | 7 |
| Nahum | 3 |
| Habakkuk | 3 |
| Zephaniah | 3 |
| Haggai | 2 |
| Zechariah | 14 |
| Malachi | 4 |

### New Testament

| Book | Chapters | Status |
|------|----------|--------|
| Matthew | 28 | done |
| Mark | 16 | done |
| Luke | 24 | done |
| John | 21 | done |
| Acts | 28 | — |
| Romans | 16 | — |
| 1 Corinthians | 16 | — |
| 2 Corinthians | 13 | — |
| Galatians | 6 | — |
| Ephesians | 6 | — |
| Philippians | 4 | — |
| Colossians | 4 | — |
| 1 Thessalonians | 5 | — |
| 2 Thessalonians | 3 | — |
| 1 Timothy | 6 | — |
| 2 Timothy | 4 | — |
| Titus | 3 | — |
| Philemon | 1 | — |
| Hebrews | 13 | — |
| James | 5 | — |
| 1 Peter | 5 | — |
| 2 Peter | 3 | — |
| 1 John | 5 | — |
| 2 John | 1 | — |
| 3 John | 1 | — |
| Jude | 1 | — |
| Revelation | 22 | — |
