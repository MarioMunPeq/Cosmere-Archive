# Cosmere Archive

<p align="center">
  <img src="https://raw.githubusercontent.com/MarioMunPeq/Cosmere-Archive/main/public/screenshots/home.png" alt="Cosmere Archive Home" width="900"/>
</p>

<p align="center">
  Interactive visual archive for Brandon Sanderson's Cosmere universe.
</p>

---

## About the project

Cosmere Archive es un proyecto personal creado como una forma de mejorar mis habilidades en desarrollo web moderno, experimentar con nuevas tecnologías y construir una aplicación completa desde cero.

El objetivo principal de este proyecto fue practicar y profundizar en tecnologías como React, TypeScript, Vite y Tailwind CSS, además de trabajar conceptos como arquitectura frontend, modelado de datos, componentes reutilizables y despliegue continuo.

Durante el desarrollo he explorado diferentes áreas como:

- Creación de interfaces interactivas y visuales
- Diseño de arquitecturas frontend escalables
- Gestión de datos estáticos y modelos complejos
- Creación de componentes reutilizables
- Testing y buenas prácticas de código
- Automatización de despliegues con GitHub Actions

El proyecto está basado en uno de mis universos de ficción favoritos: el Cosmere de Brandon Sanderson, utilizando esa temática como motivación para crear una herramienta visual e interactiva.

---

## Screenshots

### Home / Galaxy Map

<img src="https://raw.githubusercontent.com/MarioMunPeq/Cosmere-Archive/main/public/screenshots/home.png" alt="Cosmere Archive Home" width="900"/>

### Characters

<img src="https://raw.githubusercontent.com/MarioMunPeq/Cosmere-Archive/main/public/screenshots/characters.png" alt="Characters" width="900"/>



### Timeline

<img src="https://raw.githubusercontent.com/MarioMunPeq/Cosmere-Archive/main/public/screenshots/timeline.png" alt="Timeline" width="900"/>

---

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router 7
- Vitest
- Testing Library

---

## Getting Started

Clone the repository:

git clone https://github.com/MarioMunPeq/Cosmere-Archive.git

cd Cosmere-Archive

Install dependencies:

corepack pnpm install

Start development server:

corepack pnpm dev

The development server is powered by Vite.

---

## Scripts

Development:

corepack pnpm dev

Build production assets:

corepack pnpm build

Preview production build:

corepack pnpm preview

Run tests:

corepack pnpm test

Run lint:

corepack pnpm lint

Format code:

corepack pnpm format

Check formatting:

corepack pnpm format:check

---

## Project Structure

```text
src/
├─ components/
│  ├─ common/       Shared UI components
│  ├─ detail/       Book and character panels
│  ├─ map/          Galaxy map and worldhopper systems
│  └─ timeline/     Timeline renderer
│
├─ data/
│  ├─ static/       Books, planets, eras and events
│  └─ generated/    Generated character datasets
│
├─ hooks/           Shared React hooks
├─ pages/           Application pages
├─ types/           TypeScript definitions
└─ utils/           Timeline and journey calculations
```
---

## Data Model

The application uses static TypeScript and JSON data.

Main datasets:

- Planets and locations
- Books and sagas
- Timeline events
- Character records
- Worldhopper journeys

Data identifiers are kept stable because they are used by:

- Search
- Routing
- Filters
- Tests

---

## Deployment

The project is deployed using GitHub Pages.

Deployment flow:

Push to main

↓

GitHub Actions

↓

Vite production build

↓

Deploy to GitHub Pages

Live version:

https://mariomunpeq.github.io/Cosmere-Archive/

---

## Attribution

This is an unofficial fan project.

Cosmere, related worlds, characters and book titles belong to Brandon Sanderson and Dragonsteel Entertainment.

Data references include:

- The Coppermind
- Brandon Sanderson official resources