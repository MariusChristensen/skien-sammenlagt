# Skien Frisbeeklubb - Ukegolf Sammenlagt TODO

## 🥇 Top Priority

- Fix API calls to get 2022 hole-by-hole information for weekly and sammenlagt stats/aces

## UI & Feature Improvements

- Implement a dark mode toggle
- Add animations for score changes between weeks
- Create a loading skeleton for better UX during data fetching
- Implement a "Record Breakers" section (lowest round, most consecutive birdies, etc.)
- Add player performance graphs showing trends over time
- Create heatmaps showing hole difficulty across competitions
- Implement player search functionality
- Add proper error boundaries and fallbacks
- Implement caching for API data
- Consider improving Score Distribution to show per-hole data in addition to overall distribution

## 📝 Project Notes

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
- Fixed par value calculation by deriving from Result and Diff data
