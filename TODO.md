# Skien Frisbeeklubb - Ukegolf Sammenlagt TODO

## 🥇 Top Priority

- Handle 2022 data completeness issue:

  - Option 1: Create a pre-processing script to fetch all 24 weeks of 2022 data and compile into a static JSON file
  - Option 2: Implement smart/lazy loading for 2022 data with clear UI indicators
  - Option 3: Use a hybrid approach with a representative sample of weeks from 2022

  - Fixing Alex fuckup

## Completed

- ✅ Use Tracks data for par values instead of calculating from Result and Diff data

## UI & Feature Improvements

- Implement a dark mode toggle
- Add animations for score changes between weeks
- Create a loading skeleton for better UX during data fetching
- Implement a "Record Breakers" section (lowest round, most consecutive birdies, etc.)
- Add player performance graphs showing trends over time
- Create heatmaps showing hole difficulty across competitions
- Implement player search functionality
- Add proper error boundaries and fallbacks
- Implement caching for API data (especially important for 2022 data if using on-demand loading)
- Consider improving Score Distribution to show per-hole data in addition to overall distribution

## 📝 Project Notes

- 2022 data has a different API structure (TourResults/Events format):

  - Main competition ID only provides overall scores, not hole-by-hole data
  - Would require 24 separate API calls (one per week) to get complete hole-by-hole data
  - Need to balance data completeness vs. performance concerns
  - Consider localStorage caching once data is fetched to avoid repeat API calls

- Routing and statistics page refactored and improved
- Ace Hall of Fame implemented and positioned above stats table
- Mobile stats grid improved for 320px screens and below
- Fallbacks for 2022 weekly and sammenlagt stats with Metrix links
- COMPETITIONS constant moved to constants/competitions.js for clean imports and easy future updates
- Project structure cleaned up for maintainability
- Competition IDs for reference:
  - 2025: "3268191"
  - 2024: "2886967"
  - 2023: "2503707"
  - 2022: "2079115"
  - 2021: "1660549"
  - 2020: "1222406"
- Maximum counting competitions: 50% of total competitions
- Display at least 20 weeks for visual consistency
- Mobile weekly results now use a two-row layout for holes, with responsive sizing and color-coded above-par scores
- Refactored leaderboard and weekly results components for modularity and maintainability
- Removed unused props and cleaned up codebase after refactor
- Improved color logic for above-par scores (+1, +2, +3+)
- Score Distribution component added to show breakdown of eagles, birdies, pars, etc.
- Par values now sourced directly from Tracks data in the API
