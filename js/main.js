const ROW_HEIGHT = 20;
const width = 1200;
const centerX = width / 2;
const BRACKET_SHIFT = 35;
const BRACKET_DEPTH = 20;

async function fetchAndDrawData() {
  try {
    const file = new URLSearchParams(window.location.search).get('file');
    if (!file) {
      document.getElementById('chart').textContent = 'No bracket file specified. Add ?file=filename.yaml to the URL.';
      return;
    }

    const brackets = await fetchData(`../data/brackets/${file}`);
    const bookData = await fetchData(`../data/books/${brackets.book_slug}.yaml`);

    document.title = `${brackets.title} | Book Brackets`;
    document.querySelector('.viz-nav h1').textContent = brackets.title;

    const chart = document.getElementById('chart');

    brackets.targets.forEach(target => {
      const { node: targetNode, urlTemplate } = findNodeWithTemplate(bookData.root, target.target_slug);
      const leaves = collectLeaves(targetNode);

      const wrapper = document.createElement('div');
      wrapper.classList.add('section-wrapper');

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

      const svgHeight = (leaves.length + 1) * ROW_HEIGHT;
      const svg = d3.create('svg').attr('width', width).attr('height', svgHeight);

      leaves.forEach((leaf, i) => {
        const chapterNum = i + 1;
        const y = chapterNum * ROW_HEIGHT;

        svg.append('text')
          .attr('class', 'unit')
          .attr('x', centerX)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .text(chapterNum)
          .on('click', () => {
            if (urlTemplate) window.open(urlTemplate.replace('{index}', chapterNum), '_blank');
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
