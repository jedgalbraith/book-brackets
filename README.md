# Book Brackets

A web visualization tool that draws interactive brackets around Book of Mormon chapters to show thematic groupings and relationships.

## Overview

This project creates an interactive visualization that displays:
- A numbered list of Book of Mormon chapters with descriptions
- Dynamic buttons for different topic categories (Locations, Events, Years)
- Visual brackets that group chapters according to selected topics
- Clickable chapter numbers that link to the actual scripture text

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: D3.js v7.9.0
- **Data**: JSON structure with chapters and topic groupings

## Getting Started

### Prerequisites
- Node.js (for dependency management)
- Python 3 (for local server) or any web server

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Project

Start a local web server:

```bash
# Option 1: Using Python (recommended)
python3 -m http.server 8000

# Option 2: Using Node.js
npx serve .

# Option 3: Using VS Code Live Server extension
```

Then open `http://localhost:8000` in your browser.

## Project Structure

```
book-brackets-js/
├── index.html              # Main HTML file
├── js/
│   └── main.js            # Core visualization logic
├── styles/
│   └── styles.css         # Styling for brackets and UI
├── data/
│   ├── book_of_mormon.json # Primary data file
│   └── book_of_mormon.yaml # Alternative data format (unused)
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## How It Works

1. **Data Loading**: Fetches Book of Mormon data from JSON file
2. **Chapter Rendering**: Displays numbered chapters with descriptions
3. **Button Generation**: Creates buttons for each topic type
4. **Bracket Drawing**: Draws SVG brackets around chapter ranges when topics are selected
5. **Interactivity**: Chapters link to scripture; buttons toggle different topic views

## JSON Schema ERD

```
Book of Mormon Data Structure
├── title: string
├── description: string
├── divisions_type: "Book"
└── divisions: Array[Division]
    └── Division
        ├── title: string (e.g., "1 Nephi")
        ├── description: string
        ├── divisions_type: "Chapter"
        ├── divisions: Array[Chapter]
        │   └── Chapter
        │       └── description: string
        └── topic_types: Array[TopicType]
            └── TopicType
                ├── title: string (e.g., "Locations", "Events", "Years")
                ├── description: string
                └── topics: Array[Topic]
                    └── Topic
                        ├── range: string (e.g., "1-17", "18")
                        └── title: string (e.g., "Jerusalem and wilderness")
```

### Schema Relationships

```
Book of Mormon (Root)
    ↓
Divisions (Books)
    ↓
├── Chapters (1 per array element)
│   └── Description
│
└── Topic Types (Categories)
    └── Topics (Ranges)
        ├── Range (Chapter numbers)
        └── Title (Topic name)
```

## Data Example

```json
{
  "title": "Book of Mormon",
  "divisions": [
    {
      "title": "1 Nephi",
      "divisions": [
        {"description": "Lehi's vision and prophecies..."},
        {"description": "Lehi's family departs..."}
      ],
      "topic_types": [
        {
          "title": "Locations",
          "topics": [
            {"range": "1-17", "title": "Jerusalem and wilderness"},
            {"range": "18", "title": "Ocean"}
          ]
        }
      ]
    }
  ]
}
```

## Features

- **Interactive Brackets**: Click topic buttons to show different thematic groupings
- **Chapter Navigation**: Click chapter numbers to open scripture in new tab
- **Responsive Design**: Clean, readable layout with proper spacing
- **Semantic Topics**: Meaningful categories (Locations, Events, Years)
- **Rich Descriptions**: Detailed chapter summaries for context

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern browsers with ES6+ support

## Development

### Key Functions

- `fetchAndDrawData()`: Main entry point, loads data and initializes visualization
- `drawLevel()`: Renders brackets for selected topic type
- `drawTopic()`: Draws individual bracket around chapter range
- `createUnitsArray()`: Creates numbered chapter list
- `createDescriptionsMap()`: Maps chapter numbers to descriptions

### Styling

- `.bracket`: SVG lines for bracket visualization
- `.bracket-label`: Topic titles next to brackets
- `.level-btn`: Topic selection buttons
- `.unit/.description`: Chapter text styling

## License

ISC License
