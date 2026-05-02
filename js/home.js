async function loadHome() {
  try {
    const index = await fetchData('data/brackets/index.yaml');
    const grid = document.querySelector('.viz-grid');
    grid.innerHTML = index.brackets.map(entry => `
      <div class="viz-card">
        <h3>${entry.title}</h3>
        <p>${entry.description}</p>
        <a href="visualizations/visualization.html?file=${entry.file}" class="viz-link">View Visualization</a>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load visualizations index:', error);
  }
}

loadHome();
