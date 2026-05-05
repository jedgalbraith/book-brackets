const ROW_HEIGHT = 20;
const centerX = 340;
const BRACKET_SHIFT = 35;
const BRACKET_DEPTH = 20;

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

    // Jump-nav (only if multiple targets)
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
      header.classList.add('section-header');

      const titleEl = document.createElement('h2');
      titleEl.classList.add('section-title');
      titleEl.textContent = targetNode.title || target.target_slug;
      header.appendChild(titleEl);

      const buttonsDiv = document.createElement('div');
      buttonsDiv.classList.add('topic-group');
      target.topics.forEach(topic => {
        const button = document.createElement('button');
        button.classList.add('level-btn');
        button.dataset.topicSlug = topic.slug;
        button.textContent = topic.title;
        buttonsDiv.appendChild(button);
      });
      header.appendChild(buttonsDiv);
      wrapper.appendChild(header);

      const svgWidth = chart.clientWidth || 1200;
      const svgHeight = (leaves.length + 1) * ROW_HEIGHT;
      const svg = d3.create('svg').attr('width', svgWidth).attr('height', svgHeight);

      leaves.forEach((leaf, i) => {
        const chapterNum = i + 1;
        const y = chapterNum * ROW_HEIGHT;
        const drillTarget = isDrillable ? target.drills_into[i] : null;

        svg.append('text')
          .attr('class', isDrillable ? 'unit drillable' : 'unit')
          .attr('x', centerX)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .text(chapterNum)
          .on('click', () => {
            if (drillTarget) {
              document.getElementById(`section-${drillTarget}`)?.scrollIntoView({ behavior: 'smooth' });
            } else if (urlTemplate) {
              window.open(urlTemplate.replace('{index}', chapterNum), '_blank');
            }
          });

        svg.append('text')
          .attr('class', 'description')
          .attr('x', centerX + 30)
          .attr('y', y)
          .text(leaf.description || '');
      });

      wrapper.appendChild(svg.node());
      chart.appendChild(wrapper);

      buttonsDiv.addEventListener('click', (e) => {
        if (e.target.nodeName !== 'BUTTON') return;
        buttonsDiv.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        drawLevel(svg, target, e.target.dataset.topicSlug);
      });

      buttonsDiv.querySelector('button')?.click();
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

fetchAndDrawData();

function chapterY(num) {
  return num * ROW_HEIGHT;
}

function drawTopic(svg, bracket) {
  let [start, end] = bracket.range.split('-').map(Number);
  end = end || start;
  const yStart = chapterY(start) - ROW_HEIGHT / 2;
  const yEnd = chapterY(end) + ROW_HEIGHT / 2;

  svg.append('line')
    .attr('class', 'bracket level-bracket')
    .attr('x1', centerX - BRACKET_SHIFT).attr('x2', centerX - BRACKET_SHIFT)
    .attr('y1', yStart).attr('y2', yEnd);

  svg.append('line')
    .attr('class', 'bracket')
    .attr('x1', centerX - BRACKET_SHIFT).attr('x2', centerX - BRACKET_SHIFT + BRACKET_DEPTH)
    .attr('y1', yStart).attr('y2', yStart);

  svg.append('line')
    .attr('class', 'bracket')
    .attr('x1', centerX - BRACKET_SHIFT).attr('x2', centerX - BRACKET_SHIFT + BRACKET_DEPTH)
    .attr('y1', yEnd).attr('y2', yEnd);

  svg.append('text')
    .attr('class', 'bracket-label')
    .attr('x', centerX - BRACKET_SHIFT - 25)
    .attr('y', (yStart + yEnd) / 2)
    .attr('dy', '.35em')
    .attr('text-anchor', 'end')
    .text(bracket.label);
}

function drawLevel(svg, target, topicSlug) {
  svg.selectAll('.bracket, .bracket-label').remove();
  const topic = target.topics.find(t => t.slug === topicSlug);
  if (!topic) return;
  topic.brackets.forEach(bracket => drawTopic(svg, bracket));
}
