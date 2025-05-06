# Skien Frisbeeklubb - Ukegolf Sammenlagt

A modern leaderboard and statistics web app for Skien Frisbeeklubb's weekly disc golf competitions.

## About

This application fetches data from the Disc Golf Metrix API and displays:

- Overall leaderboard with dynamic points calculation from weekly competitions
- Weekly competition results with detailed scores
- Statistics and hole averages for each year and week
- Ace Hall of Fame (hole-in-ones) for each year
- Proper display of scores across different years (2020-2025)

## Technologies

- React (with react-router-dom for routing)
- Tailwind CSS
- Disc Golf Metrix API

## Setup

1. Clone the repository
2. Install dependencies:

```sh
npm install
```

3. Run the development server:

```sh
npm run dev
```

## Features

- Multi-page app with Results and Statistics views
- Year, week, and class selection with dynamic dropdowns
- Responsive design for both desktop and mobile (optimized down to 320px)
- Mobile cards display holes in a modern, readable grid
- Color-coded scores: +1 (light red), +2 (medium red), +3+ (dark red)
- Score distribution statistics showing breakdown of eagles, birdies, pars, bogeys, etc.
- Ace Hall of Fame: lists all hole-in-ones for each year
- Fallbacks for 2022 weekly and sammenlagt stats with Metrix links
- Easily add new years/competitions via `src/constants/competitions.js`
- Par values are sourced directly from the course data in the API (Tracks)

## Structure

- `src/pages/Results.jsx` - Results page (overall leaderboard, weekly results)
- `src/pages/Statistics.jsx` - Statistics page (hole averages, Ace Hall of Fame)
- `src/pages/PlayerSearch.jsx` - Player search with detailed statistics
- `src/components/ResultsContainer.jsx` - Main logic for results fetching and view switching
- `src/components/HoleAveragesTable.jsx` - Responsive, color-coded hole averages table
- `src/components/ScoreDistribution.jsx` - Component showing the distribution of scores relative to par
- `src/components/OverallLeaderboard.jsx` - Handles overall leaderboard display and calculations
- `src/components/WeeklyResultsMobileCard.jsx` - Mobile-friendly weekly results card
- `src/components/WeeklyResultsTable.jsx` - Desktop weekly results table
- `src/constants/competitions.js` - Competition IDs and round counts for each year (edit here to add new years)

## API Notes & 2022 Data Handling

### API Structure

- The app connects to the Disc Golf Metrix API using competition IDs for each year (see `src/constants/competitions.js`).
- **2020-2021, 2023+**: Use SubCompetitions format that provides complete hole-by-hole data in a single API call.
- **2022**: Uses TourResults/Events format with different data structure:
  - Main competition ID only provides overall scores per round
  - Hole-by-hole data requires separate API calls for each individual week (24 in total)
  - This creates a performance challenge for comprehensive statistics

### 2022 Data Solutions

To handle the 2022 data challenges while maintaining performance:

1. Overall leaderboard: Works normally with existing data
2. Weekly results: Shows basic scores with links to Metrix for detailed hole-by-hole data
3. Statistics: Currently limited, with plans to implement one of the following:
   - Pre-processed static data file generated from all 24 weeks
   - Smart loading approach with user-triggered data fetching
   - Hybrid approach using representative sample weeks

### Points System

- 1st place = 50 points, 2nd = 45, 3rd = 40, etc.
- Overall standings are calculated from the best 50% of rounds (rounded up).

## Adding a New Year

- Add a new entry to `src/constants/competitions.js` with the year, competition ID, and total planned rounds. The app will update automatically.

---

For questions or contributions, open an issue or PR!
