const ROW_HEIGHT = 28;
const BRACKET_DEPTH = 20;
const CHAPTER_X = 300;
const LEFT_X = CHAPTER_X - 35;    // 265 — left bracket vertical line
const LEFT_LABEL_X = LEFT_X - 25; // 240 — text-anchor: end

// Derived from data constraints:
//   descriptions ≤ 90 chars × 6px (EB Garamond 13px) = 540px → end at x=860
//   bracket labels ≤ 40 chars × 5.5px (Playfair 12px italic) = 220px
const DESC_X = CHAPTER_X + 20;                                    // 320
const RIGHT_X = DESC_X + 90 * 6 + 10;                             // 870
const RIGHT_LABEL_X = RIGHT_X + 12;                               // 882
const STRIPE_RIGHT = RIGHT_X;                                      // 870 — row bg stops at right bracket
const MIN_SVG_WIDTH = RIGHT_LABEL_X + 40 * 5.5;                   // 1102

async function fetchAndDrawData() {
  try {
    const params = new URLSearchParams(window.location.search);
    const bookSlug = params.get('book');
    const bracketsParam = params.get('brackets');

    if (!bookSlug) {
      document.getElementById('chart').textContent = 'No book specified. Add ?book=<slug> to the URL.';
      return;
    }

    const booksIndex = await fetchData('../data/books/index.yaml');
    const bookEntry = booksIndex.books.find(b => b.slug === bookSlug);
    if (!bookEntry) {
      document.getElementById('chart').textContent = `Book "${bookSlug}" not found.`;
      return;
    }

    const bracketEntry = bracketsParam
      ? bookEntry.brackets.find(b => b.file === bracketsParam) || bookEntry.brackets[0]
      : bookEntry.brackets[0];

    const brackets = await fetchData(`../data/brackets/${bracketEntry.file}`);
    const bookData = await fetchData(`../data/books/${brackets.book_slug}.yaml`);

    document.title = `${bookEntry.title} | Book Brackets`;
    document.querySelector('.viz-nav h1').textContent = bookEntry.title;

    const descEl = document.getElementById('book-description');
    if (descEl && bookData.root.description) {
      descEl.textContent = bookData.root.description.trim();
      descEl.style.display = '';
    }

    const attrEl = document.getElementById('attribution');
    if (attrEl) {
      const bracketAuthor = brackets.author || 'Unknown';
      const bookAuthor = bookData.author || 'Unknown';
      attrEl.textContent = `Brackets by ${bracketAuthor} · Book data by ${bookAuthor}`;
      attrEl.style.display = '';
    }

    const disclaimerEl = document.getElementById('book-disclaimer');
    if (disclaimerEl && bookData.disclaimer) {
      disclaimerEl.textContent = bookData.disclaimer;
      disclaimerEl.style.display = '';
    }

    const select = document.getElementById('brackets-select');
    if (bookEntry.brackets.length > 1) {
      document.getElementById('topic-set-bar').style.display = '';
      bookEntry.brackets.forEach(b => {
        const option = document.createElement('option');
        option.value = b.file;
        option.textContent = b.title;
        option.selected = b.file === bracketEntry.file;
        select.appendChild(option);
      });
      select.addEventListener('change', () => {
        const next = new URLSearchParams(window.location.search);
        next.set('brackets', select.value);
        window.location.search = next.toString();
      });
    }

    const chart = document.getElementById('chart');
    const sections = [];

    if (brackets.targets.length > 1) {
      const jumpNav = document.createElement('div');
      jumpNav.classList.add('jump-nav');
      brackets.targets.forEach(target => {
        const { node: targetNode } = findNodeWithTemplate(bookData.root, target.target_slug);
        const link = document.createElement('a');
        link.href = `#section-${target.target_slug}`;
        link.textContent = targetNode.title || target.target_slug;
        link.classList.add('jump-link');
        jumpNav.appendChild(link);
      });
      chart.parentElement.insertBefore(jumpNav, chart);
    }

    brackets.targets.forEach(target => {
      const { node: targetNode, urlTemplate } = findNodeWithTemplate(bookData.root, target.target_slug);
      const leaves = collectLeaves(targetNode);
      const isDrillable = target.drills_into && target.drills_into.length > 0;

      const wrapper = document.createElement('div');
      wrapper.classList.add('section-wrapper');
      wrapper.id = `section-${target.target_slug}`;

      const header = document.createElement('div');
      header.classList.add('section-header', 'section-header-dual');

      function makeDropdown(side) {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('topic-dropdown-group');

        const label = document.createElement('label');
        label.classList.add('dropdown-label', `dropdown-label-${side}`);
        label.textContent = side === 'left' ? 'Left Topic:' : 'Right Topic:';
        groupDiv.appendChild(label);

        const select = document.createElement('select');
        select.classList.add('topic-select', `topic-select-${side}`);

        const noneOpt = document.createElement('option');
        noneOpt.value = '__none__';
        noneOpt.textContent = '—';
        select.appendChild(noneOpt);

        target.topics.forEach(topic => {
          const opt = document.createElement('option');
          opt.value = topic.slug;
          opt.textContent = topic.title;
          select.appendChild(opt);
        });

        groupDiv.appendChild(select);
        return { groupDiv, select };
      }

      const { groupDiv: leftGroup, select: leftSelect } = makeDropdown('left');
      const { groupDiv: rightGroup, select: rightSelect } = makeDropdown('right');

      const headerRow = document.createElement('div');
      headerRow.classList.add('dual-header-row');

      const titleEl = document.createElement('h2');
      titleEl.classList.add('section-title');
      titleEl.textContent = targetNode.title || target.target_slug;

      headerRow.appendChild(leftGroup);
      headerRow.appendChild(titleEl);
      headerRow.appendChild(rightGroup);
      header.appendChild(headerRow);
      wrapper.appendChild(header);

      const svgWidth = Math.max(chart.clientWidth || MIN_SVG_WIDTH, MIN_SVG_WIDTH);
      const svgHeight = (leaves.length + 1) * ROW_HEIGHT;
      const svg = d3.create('svg').attr('width', svgWidth).attr('height', svgHeight).attr('overflow', 'visible');

      const stripeLeft = LEFT_X;
      leaves.forEach((leaf, i) => {
        const chapterNum = i + 1;
        const y = chapterNum * ROW_HEIGHT;
        const drillTarget = isDrillable ? target.drills_into[i] : null;
        const isClickable = drillTarget || urlTemplate;

        const row = svg.append('g')
          .attr('class', 'chapter-row')
          .attr('data-chapter', chapterNum)
          .style('cursor', isClickable ? 'pointer' : 'default')
          .on('click', () => {
            if (drillTarget) {
              document.getElementById(`section-${drillTarget}`)?.scrollIntoView({ behavior: 'smooth' });
            } else if (urlTemplate) {
              window.open(urlTemplate.replace('{index}', chapterNum), '_blank');
            }
          });

        row.append('rect')
          .attr('class', 'row-bg')
          .attr('x', stripeLeft)
          .attr('y', y - ROW_HEIGHT)
          .attr('width', STRIPE_RIGHT - stripeLeft)
          .attr('height', ROW_HEIGHT)
          .attr('fill', i % 2 === 0 ? 'rgba(26,58,92,0.04)' : 'none');

        row.append('text')
          .attr('class', isDrillable ? 'unit drillable' : 'unit')
          .attr('x', CHAPTER_X)
          .attr('y', y - ROW_HEIGHT / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .text(chapterNum);

        const descText = row.append('text')
          .attr('class', 'description')
          .attr('x', CHAPTER_X + 20)
          .attr('y', y - ROW_HEIGHT / 2)
          .attr('dominant-baseline', 'central');

        if (leaf.title) {
          descText.append('tspan').attr('class', 'leaf-title').text(leaf.title);
          if (leaf.description) {
            descText.append('tspan').attr('dx', 10).text('— ' + leaf.description);
          }
        } else {
          descText.text(leaf.description || '');
        }
      });

      wrapper.appendChild(svg.node());
      chart.appendChild(wrapper);

      sections.push({ svg, target, leftSelect, rightSelect, leftSlug: null, rightSlug: null });
    });

    sections.forEach(sec => {
      ['left', 'right'].forEach(side => {
        const sel = side === 'left' ? sec.leftSelect : sec.rightSelect;
        sel.addEventListener('change', () => {
          const slug = sel.value === '__none__' ? null : sel.value;
          sections.forEach(s => {
            const other = side === 'left' ? s.leftSelect : s.rightSelect;
            const hasSlug = slug === null || !!other.querySelector(`option[value="${slug}"]`);
            if (!hasSlug) return;
            other.value = slug ?? '__none__';
            if (side === 'left') s.leftSlug = slug;
            else s.rightSlug = slug;
            drawLevel(s.svg, s.target, slug, side);
            applyDualHighlight(s.svg, s.target, s.leftSlug, s.rightSlug);
          });
        });
      });

      // Auto-activate: use config defaults if declared, else first on left / second on right
      function resolveDefault(sel, configSlug, fallbackIndex) {
        if (configSlug && sel.querySelector(`option[value="${configSlug}"]`)) return configSlug;
        if (sel.options.length > fallbackIndex) return sel.options[fallbackIndex].value;
        return null;
      }
      const defaultLeft  = resolveDefault(sec.leftSelect,  sec.target.default_left,  1);
      const defaultRight = resolveDefault(sec.rightSelect, sec.target.default_right, sec.rightSelect.options.length > 2 ? 2 : 1);
      if (defaultLeft)  { sec.leftSelect.value  = defaultLeft;  sec.leftSlug  = defaultLeft;  drawLevel(sec.svg, sec.target, sec.leftSlug,  'left');  }
      if (defaultRight) { sec.rightSelect.value = defaultRight; sec.rightSlug = defaultRight; drawLevel(sec.svg, sec.target, sec.rightSlug, 'right'); }
      applyDualHighlight(sec.svg, sec.target, sec.leftSlug, sec.rightSlug);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

fetchAndDrawData();

function chapterY(num) {
  return num * ROW_HEIGHT;
}

function drawTopic(svg, bracket, side) {
  let [start, end] = bracket.range.split('-').map(Number);
  end = end || start;
  const yStart = chapterY(start) - ROW_HEIGHT;
  const yEnd = chapterY(end);

  const bx = side === 'right' ? RIGHT_X : LEFT_X;
  // Caps extend into the description area: left reaches right ~120px past the bracket,
  // right reaches left ~120px past its bracket (symmetric extension into content).
  const capExtend = side === 'right'
    ? RIGHT_X - BRACKET_DEPTH - 120   // 780 — into descriptions from right
    : LEFT_X + BRACKET_DEPTH + 120;   // 445 — into descriptions from left
  const labelX = side === 'right' ? RIGHT_LABEL_X : LEFT_LABEL_X;
  const anchor = side === 'right' ? 'start' : 'end';

  svg.append('line')
    .attr('class', `bracket bracket-${side}`)
    .attr('x1', bx).attr('x2', bx)
    .attr('y1', yStart).attr('y2', yEnd);

  svg.append('line')
    .attr('class', `bracket bracket-${side}`)
    .attr('x1', bx).attr('x2', capExtend)
    .attr('y1', yStart).attr('y2', yStart);

  svg.append('line')
    .attr('class', `bracket bracket-${side}`)
    .attr('x1', bx).attr('x2', capExtend)
    .attr('y1', yEnd).attr('y2', yEnd);

  svg.append('text')
    .attr('class', `bracket-label bracket-label-${side}`)
    .attr('x', labelX)
    .attr('y', (yStart + yEnd) / 2)
    .attr('dy', '.35em')
    .attr('text-anchor', anchor)
    .text(bracket.label);
}

function drawLevel(svg, target, topicSlug, side) {
  svg.selectAll(`.bracket-${side}, .bracket-label-${side}`).remove();
  if (!topicSlug) return;
  const topic = target.topics.find(t => t.slug === topicSlug);
  if (!topic) return;
  topic.brackets.forEach(bracket => drawTopic(svg, bracket, side));
}

function buildBracketMap(target, topicSlug) {
  if (!topicSlug) return new Map();
  const topic = target.topics.find(t => t.slug === topicSlug);
  if (!topic) return new Map();
  const map = new Map();
  topic.brackets.forEach((b, idx) => {
    let [start, end] = b.range.split('-').map(Number);
    end = end || start;
    for (let i = start; i <= end; i++) map.set(i, idx);
  });
  return map;
}

function applyDualHighlight(svg, target, leftSlug, rightSlug) {
  const leftMap = buildBracketMap(target, leftSlug);
  const rightMap = buildBracketMap(target, rightSlug);
  const neitherActive = !leftSlug && !rightSlug;

  svg.selectAll('.chapter-row').each(function() {
    const row = d3.select(this);
    const num = +row.attr('data-chapter');
    const inLeft  = leftMap.has(num);
    const inRight = rightMap.has(num);
    const stripeFill = (num - 1) % 2 === 0 ? 'rgba(26,58,92,0.04)' : 'none';

    row.attr('opacity', neitherActive || inLeft || inRight ? 1 : 0.35);
    row.select('.row-bg').attr('fill', stripeFill);
  });
}
