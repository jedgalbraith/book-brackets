// Constants
const width = 1200;
const height = 1500;
const centerX = width / 2;

async function fetchAndDrawData() {
  try {
    const response = await fetch('./data/bood_of_mormon.json');
    const data = await response.json();

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Data formatting
    const chapters = createChaptersArray(data);
    const descriptions = createDescriptionsMap(data);
    const yearRanges = createYearRangesMap(data);

    drawText(svg, "chapter", centerX, chapters, (d) => `${d}`);
    drawText(svg, "description", centerX + 30, chapters, (d) => descriptions[d] || "");
    drawText(svg, "year-range", centerX + 400, chapters, (d) => yearRanges[d] || "");

    window.onload = function() {
      document.querySelectorAll('.level-btn').forEach(button => {
        button.addEventListener('click', function() {
          const selectedLevel = parseInt(this.value);
          drawLevel(svg, data, selectedLevel);
        });
      });

      document.querySelector('button[value="1"]').click();
    };

  } catch (error) {
    console.error('Error:', error);
  }
}

fetchAndDrawData();

function createChaptersArray(data) {
  return d3.range(1, data["Book of Mormon"]["Alma"]["chapters"] + 1);
}

function createDescriptionsMap(data) {
  return data["Book of Mormon"]["Alma"]["descriptions"].reduce((acc, val) => {
    acc[val.chapter] = val.desc;
    return acc;
  }, {});
}

function createYearRangesMap(data) {
  return data["Book of Mormon"]["Alma"]["descriptions"].reduce((acc, val) => {
    acc[val.chapter] = val.years;
    return acc;
  }, {});
}

function drawText(svg, className, x, data, textCallback) {
  svg.selectAll(`.${className}`)
    .data(data)
    .enter()
    .append("text")
    .attr("class", className)
    .attr("x", x)
    .attr("y", (d, i) => i * 20 + 20)
    .text(textCallback)
    .attr("text-anchor", className === "chapter" ? "middle" : undefined)
    .on("click", (event, d) => {
      if (className === "chapter")
        window.location.href = `https://www.churchofjesuschrist.org/study/scriptures/bofm/alma/${d}?lang=eng`;
    });
}

function clearBrackets(svg) {
  svg.selectAll('.bracket').remove();
  svg.selectAll('.bracket-label').remove();
}

function drawTopic(svg, centerX, topic) {
  let [start, end] = topic.range.split('-').map(Number);
  end = end || start;
  let yStart = (start - 1) * 20 + 10;
  let yEnd = (end - 1) * 20 + 30;
  const bracketShift = 35;
  const bracketDepth = 20;

  svg.append("line")
    .attr("class", "bracket level-bracket")
    .attr("x1", centerX - bracketShift)
    .attr("x2", centerX - bracketShift)
    .attr("y1", yStart)
    .attr("y2", yEnd);

  svg.append("line")
    .attr("class", "bracket")
    .attr("x1", centerX - bracketShift)
    .attr("x2", centerX - bracketShift + bracketDepth)
    .attr("y1", yStart)
    .attr("y2", yStart);

  svg.append("line")
    .attr("class", "bracket")
    .attr("x1", centerX - bracketShift)
    .attr("x2", centerX - bracketShift + bracketDepth)
    .attr("y1", yEnd)
    .attr("y2", yEnd);

  svg.append("text")
    .attr("class", "bracket-label")
    .attr("x", centerX - bracketShift - 25)
    .attr("y", (yStart + yEnd) / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .text(topic.title);
}

function drawLevel(svg, data, level) {
  clearBrackets(svg);

  const displayedTopics = data["Book of Mormon"]["Alma"]["topics"].filter(t => t.level === level);
  displayedTopics.forEach(topic => drawTopic(svg, centerX, topic));
}
