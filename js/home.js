async function loadHome() {
  try {
    const index = await fetchData('data/books/index.yaml');
    const grid = document.querySelector('.viz-grid');
    grid.innerHTML = index.books.map(book => `
      <a href="visualizations/visualization.html?book=${book.slug}" class="viz-card">
        <h3>${book.title}</h3>
        <p>${book.description}</p>
        <span class="viz-link" aria-hidden="true">View Visualization</span>
      </a>
    `).join('');
  } catch (error) {
    console.error('Failed to load visualizations index:', error);
  }
}

loadHome();
