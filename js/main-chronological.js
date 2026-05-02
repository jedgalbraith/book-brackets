// Constants
const width = 1200;
const height = 1500;
const centerX = width / 2;

async function fetchAndDrawData() {
  try {
    const response = await fetch('../data/1_nephi_summary.json');
    const data = await response.json();

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Data formatting
    const units = createUnitsArray(data);
    const descriptions = createDescriptionsMap(data);

    drawText(svg, "unit", centerX, units, (d) => `${d}`, data);
    drawText(svg, "description", centerX + 30, units, (d) => descriptions[d] || "", data);

    // Buttons
    const topicTypes = data.topic_types.map(topic_type => topic_type.title);
    const buttonContainer = document.getElementById('buttonContainer');

    // Create buttons for each topic type
    topicTypes.forEach((topicType) => {
      const button = document.createElement('button');
      button.classList.add('level-btn');
      button.value = topicType;
      button.innerHTML = topicType;
      buttonContainer.appendChild(button);
    });

    // Event listener for buttons
    window.onload = function () {
      document.getElementById('buttonContainer').addEventListener('click', function (e) {
        if (e.target && e.target.nodeName === "BUTTON") {
          const selectedLevel = e.target.value;
          drawLevel(svg, data, selectedLevel);
        }
      });
      document.querySelector('button').click(); // clicks on the first button
    };

  } catch (error) {
    console.error('Error:', error);
  }
}

fetchAndDrawData();

function createUnitsArray(data) {
  return data.divisions.map((_, i) => i + 1);
}

function createDescriptionsMap(data) {
  const descriptions = {};
  data.divisions.forEach((subdivision, i) => {
    descriptions[i + 1] = subdivision.description;
  });
  return descriptions;
}

function drawText(svg, className, x, data, textCallback, urlData) {
  svg.selectAll(`.${className}`)
    .data(data)
    .enter()
    .append("text")
    .attr("class", className)
    .attr("x", x)
    .attr("y", (d, i) => i * 20 + 20)
    .text(textCallback)
    .attr("text-anchor", className === "unit" ? "middle" : undefined)
    .on("click", (event, d) => {
      if (className === "unit")
        window.location.href = urlData.chapter_url_template.replace('{chapter}', d);
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

  const displayedTopics = [];
  data.topic_types.forEach(topicType => {
    if (topicType.title === level) {
      topicType.topics.forEach(topic => displayedTopics.push(topic));
    }
  });

  displayedTopics.forEach(topic => drawTopic(svg, centerX, topic));
}
