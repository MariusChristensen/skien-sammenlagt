# Skien Frisbeeklubb - Ukegolf Sammenlagt

A leaderboard application that displays disc golf weekly competition results and overall standings for Skien Frisbeeklubb.

## About

This application fetches data from Disc Golf Metrix API and displays:

- Overall leaderboard with points calculated from weekly competitions
- Weekly competition results with detailed scores
- Proper display of scores across different years (2020-2025)

## Technologies

- React
- Tailwind CSS
- Disc Golf Metrix API

## Setup

1. Clone the repository
2. Install dependencies:

```
npm install
```

3. Run the development server:

```
npm run dev
```

## Features

- View overall leaderboard with points from best 11 competitions
- Filter by player class (Open, Master, etc.)
- View weekly results with detailed hole-by-hole scores
- Select different competition years
- Responsive design for both desktop and mobile

## Structure

- `src/components/FetchResults.jsx` - Main component handling data fetching and view switching
- `src/components/OverallLeaderboard.jsx` - Handles overall leaderboard display and calculations
- Selection between years and player classes handled with buttons
- Supports both SubCompetitions format (2020-2021, 2023-2025) and TourResults format (2022)

## API Notes

The application connects to the Disc Golf Metrix API using competition IDs for each year:

- 2020-2025 competition data is fetched from their respective endpoints
- Each year may have 20+ weeks of competition
- Points system: 1st place = 50 points, 2nd = 45, 3rd = 40, etc.
- Overall standings are calculated from the 11 best results
