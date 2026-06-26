# Changelog

## 0.1.0 — 2026-06-18

### Added

- Interactive SVG map of 10 Cosmere planets with zoom, pan, and planet detail panels
- Per-planet SVG renderers with unique visual art (Roshar, Scadrial, Sel, Nalthis, Taldain, Threnody, First of the Sun, Komashi, Lumar, Canticle)
- Worldhopper route visualization with curved paths between planets
- Shard filter legend — filter planets by invested Shard
- Global search bar with keyboard navigation, ARIA combobox, and 5 categories (planets, characters, worldhoppers, events, books)
- Book and character detail overlay panels accessed via search results
- About page with project info and data source credits
- 404 page
- 42 canonical characters in characters.json with English IDs
- 68 timeline events (pre-Shattering through Cosmere Awakening)
- 11 cosmic eras
- Skip-to-content link, ARIA labels, and keyboard accessibility
- TypeScript strict mode enabled
- ESLint flat config with react-hooks rules
- Mobile responsive layout for panels and navigation
- Error Boundary with fallback UI
- Runtime validation for JSON character data
- Vitest test suite with validation tests
- Prettier config
- GitHub Actions CI/CD for Pages deployment
- Dockerfile with nginx

### Data

- 100% English canonical content (books, sagas, planets, events, eras, character titles)
- Consistent character IDs (elend, spook, rashek, wax, shallan, etc.)
- English translations of all Cosmere terminology
