const DATA_BASE_URL = 'https://raw.githubusercontent.com/jedgalbraith/bookbrackets-data/main';

async function fetchData(path) {
  const response = await fetch(path);
  const text = await response.text();
  if (path.endsWith('.yaml') || path.endsWith('.yml')) {
    return jsyaml.load(text);
  }
  return JSON.parse(text);
}

// Depth-first search; passes the nearest ancestor's url_template down the recursion.
// Returns { node, urlTemplate } or null.
function findNodeWithTemplate(node, slug, inheritedTemplate = null) {
  const template = node.url_template || inheritedTemplate;
  if (node.slug === slug) return { node, urlTemplate: template };
  if (!node.children || node.children.length === 0) return null;
  for (const child of node.children) {
    const result = findNodeWithTemplate(child, slug, template);
    if (result) return result;
  }
  return null;
}

// Returns a flat array of all leaf nodes (nodes with no children) in document order.
function collectLeaves(node) {
  if (!node.children || node.children.length === 0) return [node];
  return node.children.flatMap(collectLeaves);
}
