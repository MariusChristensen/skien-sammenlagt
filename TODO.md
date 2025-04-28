# Skien Frisbeeklubb - Ukegolf Sammenlagt TODO

## 🎨 Styling & UI Enhancements

- [ ] Implement a dark mode toggle
- [ ] Add player profile images (if available in API)
- [ ] Improve mobile cards with two-row weekly hole layout (major readability improvement)
- [ ] Add animations for score changes between weeks
- [ ] Create a loading skeleton for better UX during data fetching

## 🏆 Hall of Fame Features

- [ ] Create a dedicated "Hall of Fame" page for special achievements
- [ ] Track and display all hole-in-ones across years
- [ ] Add player spotlights for exceptional performances
- [ ] Implement a "Record Breakers" section (lowest round, most consecutive birdies, etc.)

## 📊 Statistics & Data Visualization

- [ ] Add player performance graphs showing trends over time
- [ ] Create heatmaps showing hole difficulty across competitions
- [ ] Implement comparative stats between players
- [ ] Add filtering by date ranges
- [ ] Calculate and display player improvement metrics

## ✨ Additional Features

- [ ] Add course maps with hole details
- [ ] Implement player search functionality
- [ ] Create an "export to PDF" option for printable leaderboards
- [ ] Add course conditions/weather data for each competition
- [ ] Implement social sharing for results

## 🔧 Technical Improvements

- [ ] Add proper error boundaries and fallbacks
- [ ] Implement caching for API data
- [ ] Create unit tests for critical components
- [ ] Optimize bundle size with code splitting

## 📝 Project Notes

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
