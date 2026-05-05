async function loadHome() {
  try {
    const index = await fetchData('data/books/index.yaml');
    const grid = document.querySelector('.viz-grid');
    grid.innerHTML = index.books.map(book => `
      <div class="viz-card">
        <h3>${book.title}</h3>
        <p>${book.description}</p>
        <a href="visualizations/visualization.html?book=${book.slug}" class="viz-link">View Visualization</a>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load visualizations index:', error);
  }
}

loadHome();
