// Constants
const width = 1200;
const height = 1500;
const centerX = width / 2;

async function fetchAndDrawData() {
  try {
    const response = await fetch('./data/book_of_mormon.json');
    const data = await response.json();

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Data formatting
    const units = createUnitsArray(data);
    const descriptions = createDescriptionsMap(data);

    drawText(svg, "unit", centerX, units, (d) => `${d}`);
    drawText(svg, "description", centerX + 30, units, (d) => descriptions[d] || "");

    // Buttons

    // Get all titles of the topic types
    const topicTypes = data.divisions.flatMap(division => division.topic_types.map(topic_type => topic_type.title));
    // Get unique topic types
    const uniqueTopicTypes = [...new Set(topicTypes)];

    const buttonContainer = document.getElementById('buttonContainer');

    // Create buttons for each unique topic type
    uniqueTopicTypes.forEach((topicType) => {
      const button = document.createElement('button');
      button.classList.add('level-btn');
      button.value = topicType; // the value is now the topic type title
      button.innerHTML = topicType; // Change it according to the content you want on buttons.
      buttonContainer.appendChild(button);
    });

    // Modify event listener for these dynamic buttons
    window.onload = function () {
      document.getElementById('buttonContainer').addEventListener('click', function (e) {
        if (e.target && e.target.nodeName === "BUTTON") {
          const selectedLevel = e.target.value; // 'selectedLevel' now contains the title of the topic type
          // you must implement or update your 'drawLevel' function to handle this 'selectedLevel' based on your requirements.
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
  const units = [];
  data.divisions.forEach(division => {
    division.divisions.forEach(subdivision => {
      units.push(subdivision);
    });
  });
  return units.map((_, i) => i + 1);
}

function createDescriptionsMap(data) {
  const descriptions = {};
  data.divisions.forEach(division => {
    division.divisions.forEach((subdivision, i) => {
      descriptions[i + 1] = subdivision.description;
    });
  });
  return descriptions;
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
    .attr("text-anchor", className === "unit" ? "middle" : undefined)
    .on("click", (event, d) => {
      if (className === "unit")
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

  const displayedTopics = [];
  data.divisions.forEach(division => {
    division.topic_types.forEach(topicType => {
      if (topicType.level === level) {
        topicType.topics.forEach(topic => displayedTopics.push(topic));
      }
    });
  });

  displayedTopics.forEach(topic => drawTopic(svg, centerX, topic));
}
