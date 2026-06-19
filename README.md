# Cosmere Archive

Interactive visual archive for Brandon Sanderson's Cosmere, built as a static React app.

The project focuses on browsing the known Cosmere through a galaxy map, timeline, character views,
book panels, Shard filters, and worldhopper travel animations. All data is bundled with the app;
there is no backend service or database.

## Tech Stack

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- React Router 7
- Vitest and Testing Library

## Getting Started

```bash
corepack enable
corepack pnpm install
corepack pnpm dev
```

The development server is provided by Vite.

## Scripts

```bash
corepack pnpm dev           # Start local development
corepack pnpm build         # Type-check and build production assets
corepack pnpm preview       # Preview the production build
corepack pnpm test          # Run the Vitest suite once
corepack pnpm test:watch    # Run Vitest in watch mode
corepack pnpm lint          # Run ESLint
corepack pnpm format        # Format source files with Prettier
corepack pnpm format:check  # Check formatting
```

## Project Structure

```text
src/
  components/
    common/      Shared layout, search, skeletons, icons, error boundary
    detail/      Detail panels for books and characters
    map/         Galaxy map, planet panels, worldhopper UI, renderers
    timeline/    SVG timeline renderer
  data/
    generated/   Generated character data and validation
    static/      Books, planets, sagas, timeline events, journeys
  hooks/         Shared React hooks
  pages/         Main map shell, timeline view, about page, 404
  test/          Vitest setup and test suites
  types/         Shared TypeScript types
  utils/         Timeline and journey calculations
```

## Data Model

The app uses static TypeScript and JSON data:

- `src/data/static/planets.ts` for planetary metadata.
- `src/data/static/books.ts` for books and sagas.
- `src/data/static/timeline/` for eras, events, lifespans, and worldhopper journeys.
- `src/data/generated/characters.json` for generated character data.
- `src/data/generated/validate.ts` for runtime validation of generated character records.

When adding or editing data, keep identifiers stable because search, panels, routes, and tests rely
on those IDs.

## Deployment

The repository includes:

- GitHub Pages workflow: `.github/workflows/deploy.yml`
- Docker production image: `Dockerfile`
- Nginx static config: `nginx.conf`

Routing uses hash-based URLs so the static GitHub Pages deployment can refresh and deep-link
without server-side fallback rules.

## Quality Gates

Before publishing changes, run:

```bash
corepack pnpm lint
corepack pnpm test
corepack pnpm build
corepack pnpm format:check
```

## Attribution

This is an unofficial fan project. Cosmere, related worlds, characters, and book titles belong to
Brandon Sanderson and Dragonsteel Entertainment. Data references include The Coppermind and Brandon
Sanderson's official website.
