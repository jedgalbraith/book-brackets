const ROW_HEIGHT = 28;
const BRACKET_DEPTH = 20;
const CHAPTER_X = 340;
const LEFT_X = CHAPTER_X - 35;    // 305 — left bracket vertical line
const LEFT_LABEL_X = LEFT_X - 25; // 280 — text-anchor: end

// Derived from data constraints:
//   descriptions ≤ 90 chars × 6px (EB Garamond 13px) = 540px → end at x=900
//   bracket labels ≤ 40 chars × 5.5px (Playfair 12px italic) = 220px
const DESC_X = CHAPTER_X + 20;                                    // 360
const RIGHT_X = DESC_X + 90 * 6 + 20;                             // 920
const RIGHT_LABEL_X = RIGHT_X + 12;                               // 932
const STRIPE_RIGHT = RIGHT_X;                                      // 920 — row bg stops at right bracket
const MIN_SVG_WIDTH = RIGHT_LABEL_X + 40 * 5.5;                   // 1152

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

    const select = document.getElementById('brackets-select');
    if (bookEntry.brackets.length > 1) {
      select.style.display = '';
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

      let svgRef = null;
      let activeLeftSlug = null;
      let activeRightSlug = null;

      function makeDropdown(side) {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('topic-dropdown-group');

        const label = document.createElement('label');
        label.classList.add('dropdown-label', `dropdown-label-${side}`);
        label.textContent = side === 'left' ? 'Left:' : 'Right:';
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

        select.addEventListener('change', () => {
          const slug = select.value === '__none__' ? null : select.value;
          if (side === 'left') activeLeftSlug = slug;
          else activeRightSlug = slug;
          if (svgRef) {
            drawLevel(svgRef, target, slug, side);
            applyDualHighlight(svgRef, target, activeLeftSlug, activeRightSlug);
          }
        });

        groupDiv.appendChild(select);
        return { groupDiv, select };
      }

      const { groupDiv: leftGroup, select: leftSelect } = makeDropdown('left');
      const { groupDiv: rightGroup } = makeDropdown('right');

      const subtitle = document.createElement('p');
      subtitle.classList.add('dual-subtitle');
      subtitle.textContent = 'Compare two bracket views side by side';
      header.appendChild(subtitle);

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
      svgRef = svg;

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

      // Auto-activate: select first topic on left, leave right at "—"
      if (leftSelect.options.length > 1) {
        leftSelect.selectedIndex = 1;
        activeLeftSlug = leftSelect.value;
        drawLevel(svg, target, activeLeftSlug, 'left');
        applyDualHighlight(svg, target, activeLeftSlug, activeRightSlug);
      }
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
