# REBUILD_PLAN.md — Cosmere Archive

> Auditoría completa del estado actual + plan de rebuild.
> Fecha de la auditoría: 2026-10-15 · Commit `ff6199a` · 62 commits · rama `main`.
> Documento de análisis. **No se ha modificado ningún otro fichero del repo.**

---

## Índice

0. [Resumen ejecutivo](#0-resumen-ejecutivo)
   **0.1 [Decisiones cerradas (entrevista de dirección)](#01-decisiones-cerradas-entrevista-de-dirección-2026-10-15)** ← **léase primero**
   **0.2 [D-DIEG: identidad diegética](#02-decisión-d-dieg-identidad-diegética-2026-10-19)** — **por encima de las otras veinte**
1. [Auditoría del estado actual](#1-auditoría-del-estado-actual)
2. [Diagnóstico: por qué se ve cutre](#2-diagnóstico-por-qué-se-ve-cutre)
3. [Visión y principios de diseño](#3-visión-y-principios-de-diseño)
4. [Sistema de diseño base](#4-sistema-de-diseño-base)
5. [Rediseño por experiencia (v2)](#5-rediseño-por-experiencia-v2--decisiones-cerradas)
6. [Decisión de stack](#6-decisión-de-stack)
7. [Modelo de datos y contenido](#7-modelo-de-datos-y-contenido)
8. [Assets](#8-assets)
9. [Arquitectura](#9-arquitectura)
10. [Testing y CI](#10-testing-y-ci)
11. [Roadmap por hitos (v2)](#11-roadmap-por-hitos-v2--orden-cerrado)
12. [Riesgos y preguntas abiertas](#12-riesgos-y-preguntas-abiertas-post-entrevista)
    A. [Apéndice — 12 ideas extra temáticas](#apéndice-a--12-ideas-extra-temáticas)

---

## 0. Resumen ejecutivo

El problema **no es el stack, es el sistema de diseño**. El repositorio es técnicamente competente (React 19 + Vite 8 + TS 6 + Tailwind 4, 203 tests verdes, CI con lint/typecheck/test/build, PWA, GitHub Pages) pero **carece por completo de un sistema de tokens compartido**:

- Hay **al menos 11 colores de texto distintos escritos a mano** en los componentes (`#3a2a1a`, `#8a7050`, `#a09070`, `#e8dcc8`, `rgba(80,60,40,0.18)` …) sin ninguna escala semántica.
- **17 de 30 combinaciones texto/fondo medidas fallan WCAG AA**, con ratios de **1,20:1 a 2,47:1** (el mínimo AA es 4,5:1). Los casos extremos: numerales de la portada a **1,46:1**, anotaciones de folio a **1,20:1**, etiquetas de planeta en el índice de personajes a **2,21:1**.
- **El 100 % de las "imágenes" de la biblioteca son el mismo fallback**: los 22 libros declaran 7 emblemas, de los cuales **solo existen 3 ficheros**, y el componente cae en un fallback de "círculo con 4 remaches" idéntico para 17 de 22 libros.
- **Shadesmar arranca con zoom 0,5 sobre un mundo de 1 unidad** → en un viewport 2557 px el contenido ocupa ~15 % del ancho (confirmado matemáticamente y coincidente con la captura).
- **173 KB de código muerto** (4 páginas no enrutadas + dos subárboles `components/map/` y `components/star-chart/` completos) que solo se alimentan entre sí.
- `dist/` pesa **22,4 MB**, de los cuales **12,6 MB son 10 ficheros idénticos** (`md5 F04DDBA2…`) en `public/images/aharietam/`.
- La navegación global no aparece en las capturas porque **el menú está escondido tras un hamburguesa de 24×24 px con tres puntos de 2×2 px a 2,43:1 de contraste**.

**Recomendación: mantener React 19 + Vite + TypeScript + Tailwind 4.** Cambiar de framework no arregla ninguno de estos problemas y costaría 3–5 semanas de reescritura sin ganancia. El rebuild debe ser **de capa de contenido + capa visual**, manteniendo `Shadesmar` en Canvas2D.

---

## 0.1 Decisiones cerradas (entrevista de dirección, 2026-10-15)

> Las 20 decisiones están **cerradas**. Este apartado es la referencia canónica; si en algún momento un cambio contradice una de estas líneas, la decisión gana.
> Cada decisión lleva su **efecto medible** para poder comprobarla.

### Marco (decidido antes de la entrevista)

|     | Decisión                                                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F.1 | Las imágenes actuales **se quedan**.                                                                                                                                    |
| F.2 | Todo el contenido **en inglés**.                                                                                                                                        |
| F.3 | Se elimina **el código muerto**.                                                                                                                                        |
| F.4 | Núcleo del rebuild = **Biblioteca de Jasnah · Shadesmar · Registros (árbol + relaciones) · Diagrama de Taravangian**.                                                   |
| F.5 | Las secciones restantes (/stats, /mind-map, Aharietiam, Ars Arcanum, Chronology, About) **no se borran**: van a un apartado **"Historical Archive"**, fuera del núcleo. |
| F.6 | Stack: **React 19 + Vite 8 + TypeScript 6 + Tailwind 4**. No se questiona.                                                                                              |

### Las 20 decisiones

| ID           | Ámbito             | Decisión                                                                                                         | Efecto medible                                                             |
| ------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **D-NAV**    | Navegación         | **Barra superior visible** con los 4 destinos del núcleo + Historical + búsqueda; barra inferior de 5 en <768 px | Cada enlace ≥ 4,5:1 (hoy "About" = 2,43:1); targets ≥ 44×44 px (hoy 24×24) |
| **D-TONE**   | Tono               | **Oscuro base, papel solo en salas** (#0D1119 en todo el sitio; #F4EFE4 solo en Historical)                      | Un solo `--surface-base` por zona; contraste verificado en tokens          |
| **D-HOME**   | Portada            | **Cuatro puertas al núcleo** con contadores reales (22 / 93 / 103 / 118) + banda Historical                      | 4 `<a>` válidos, `scrollWidth ≤ 320`, axe limpio                           |
| **D-SHD**    | Shadesmar          | **Canvas 2D a pantalla completa**, zoom + arrastre + foco por perpendicularidad                                  | `bounds()` ≥ 65 % del menor lado; 0 `fillText`                             |
| **D-LIB**    | Biblioteca         | **Portadas reales como lomos** (franja + velo + tipografía foil)                                                 | 22 lomos únicos; contraste del título ≥ 4,5:1 sobre la imagen              |
| **D-SHDEXP** | Shadesmar          | Recorrido: **zoom + arrastre + foco** por perpendicularidad, sin autoplay                                        | Zoom 0,25–4; vuelo 800 ms; pellizco en móvil                               |
| **D-REC**    | Registros          | **Sidebar + ficha de una columna** (no doble página)                                                             | `max-width: 860px`; sidebar 232–288 px; sin `rotateY`                      |
| **D-DIA**    | Diagrama           | **Mural clicable**: el mural se conserva, cada papel abre un panel de lectura                                    | 9 `<button>`; texto ≥ 13 px y ≥ 4,5:1 (hoy 7–8 px)                         |
| **D-HIST**   | Historical         | **Una ruta `/historical` con índice**; las 5 rutas viejas redirigen                                              | 5 secciones con contador real y nota de estado                             |
| **D-DATA**   | Datos              | **Monogramas como diseño**, no como parche; retrato si existe, monograma si no                                   | 93 monogramas únicos; 0 imágenes 404                                       |
| **D-TYPE**   | Tipografía         | **EB Garamond + Inter + JetBrains Mono**, self-hosted                                                            | 3 familias variable; 0 requests a Google CDN                               |
| **D-MOTION** | Movimiento         | **Escala de 4 duraciones**: 120 / 220 / 400 / 900 ms; stagger 40 ms máximo 8                                     | Ninguna animación fuera de los 4 tokens; `prefers-reduced-motion` global   |
| **D-DENS**   | Densidad           | **Alta en fichas, baja en piezas espaciales**                                                                    | Ficha = 5 secciones + `<dl>`; Shadesmar/Diagrama con aire                  |
| **D-SEARCH** | Búsqueda           | **Índice real con fuzzy** (MiniSearch 8 KB)                                                                      | `kaz` → Kaladin; ~400 docs; < 5 ms; rutas corregidas                       |
| **D-MOB**    | Móvil              | **Versión propia**, no reducto                                                                                   | `scrollWidth ≤ 320` en las 9 rutas; targets ≥ 44 px; pellizco              |
| **D-ORN**    | Ornamento          | **Geométrico y sobrio** (filetes 1 px, foil, sellos)                                                             | Sin manchas, sin tilt, sin `text-shadow` multiple                          |
| **D-REL**    | Relaciones         | **Escribir las relaciones que faltan** (objetivo: ≥ 200 aristas, los 93 personajes con ≥ 1)                      | 73 % del elenco deja de estar vacío                                        |
| **D-M1**     | Alcance 1ª entrega | **Base + Shell + portada + navegación + búsqueda** (M1+M2), sin tocar el núcleo                                  | Entregable publicable en 5–7 semanas                                       |
| **D-ORDER**  | Orden              | **Biblioteca → Registros → Shadesmar → Diagrama**                                                                | M3→M4→M5→M6                                                                |
| **D-DEAD**   | Limpieza           | **Matar el código muerto primero** (−223 KB, y `dist/` de 22,4 MB a < 6 MB)                                      | `grep "components/map\|star-chart" src/` = 0                               |

### Consecuencias que cambian el plan original

1. **El §5 anterior (9 experiencias por rediseñar) se reduce a 4 + Historical.** Ya no hay que rediseñar `/mind-map` ni `/compare` como piezas propias: se envuelven en `/historical` con el layout compartido.
2. **El budget de §4 (tokens) pasa a ser la Paleta Oscura como sistema base**, con el papel relegado a un único contexto (Historical). Antes se preveían dos paletas equivalentes; D-TONE fija una sola como norma y la otra como excepción.
3. **La Biblioteca ya no necesita inventar adornos SVG**: usa las portadas que ya existen. Eso ahorra el bloque "SpineOrnament" de §8.3 y libera esfuerzo para Shadesmar.
4. **`/records` es la ruta nueva del Códice** (sustituye a `/characters` como ruta canónica; `/characters` queda como redirect).
5. **La primera entrega es más pequeña** (M1+M2) que la propuesta original (M1–M2 sí, pero sin Search como hito aparte: entra en M2).
6. **`d3-force` y el código de grafo de `components/detail/` pasan a borrarse en M1**, no a conservarse, porque el grafo de relaciones se rehace en M4 con la tabla normalizada.

### Impacto en el stack (sin cambio de framework)

| Antes                                          | Ahora                        | Motivo                                                                                              |
| ---------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `motion` (framer-motion) previsto para paneles | **CSS + tokens de duración** | D-MOTION fija la escala; framer-motion solo si hace falta para gestos de Shadesmar, y se carga lazy |
| `spineOrnament` SVG (8 patrones)               | **Portadas reales + velo**   | D-LIB                                                                                               |
| Pixi.js como fase 2                            | **Descartado**               | D-SHD; 103 almas no lo justifican                                                                   |
| Prerender de todas las rutas                   | **Tras M2**                  | Se aplaza a M7 para no bloquear M1/M2                                                               |
| `lucide` iconos                                | **Lucide**, confirmado       | Reemplaza `icons.tsx` + `icons.svg`                                                                 |

## 0.2 Decisión D-DIEG: identidad diegética (2026-10-19)

> **Esta decisión está por encima de las otras veinte.** Si alguna de ellas
> contradice ésta, **ésta gana**. Se añadió después de M5 y reescribe el criterio
> con el que se juzga todo lo demás.

### Qué significa

**El visitante no está usando una web. Está dentro del Cosmere.**

No es una metáfora de marketing ni una capa de texto encima de interfaces
normales. Es una regla de construcción con consecuencias medibles, y se aplica
a **cada pantalla y a cada bloque de código**, incluidos los ya terminados.

### Por qué se añadió

Cinco hitos Mientras el rebuild avanzaba, la sección 3 ("Visión y principios")
seguía diciendo cosas como _"navegación clara"_ y _"el usuario siempre sabe
dónde está"_, y el resultado era un sitio correcto y plano: un sitio web sobre
el Cosmere. Las cinco pantallasNavigate web-shaped existen porque el documento
que las gobernaba nunca dijo que no podían.

### La regla

| Allowed                                     | Prohibido                                  |
| ------------------------------------------- | ------------------------------------------ |
| Una caja de búsqueda que es un **registro** | Una barra de búsqueda con placeholder      |
| Un índice que es una **página de un libro** | Un sidebar con `<Link>`s                   |
| Un contador que es un **dato del mundo**    | Una tarjeta de KPI con flecha de tendencia |
| "Open record"                               | "View profile"                             |
| "Leave"                                     | "Back to library"                          |
| Un error que es una **página raspada**      | Un `404` con el logo de la web             |

**El test de una frase:** si lo que se está construyendo seguiría siendo lo
mismo en cualquier sitio sobre cualquier tema, no es diegético. El Diagrama de
Taravangian podría ser el mural de notas de un investigador de biología. El
Shadesmar no podría ser nada más.

### Consecuencias concretas, ya aplicadas o pendientes

| #   | Consecuencia                                                                                                                                                                                 | Estado          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| G.1 | El encabezado de Shadesmar (`Shadesmar · 95 souls · 11 realms` + `<details>`) es **cromo de web**, no un objeto del mundo. Pasa a ser una lámina del Dominio: una carta de índice con sello. | Pendiente M6→M7 |
| G.2 | `ShadesmarHud` (`+ − ⌂` con `aria-label="Zoom in"`) es una cámara de photographer. En un Dominio la Kingston no se amplía: **se travels**. Botones diegéticos: avanzar, retroceder, mirar.   | Pendiente       |
| G.3 | "View record →" abre un `Link` con flecha. Debe abrir una **página de registro** — lo que ya es `/characters?character=` — etiquetada como el archivo, no como un perfil.                    | Pendiente       |
| G.4 | `/stats` es una hoja de cálculo con diez gráficos de barras. Es lo **más anti-diegético del sitio** y sufusionar con el Diagrama es lo que M6 resuelve.                                      | **En curso**    |
| G.5 | Los skeletons con `animate-pulse` son la página aún cargando. Una página raspada dice "la tinta aún se seca".                                                                                | Pendiente M7    |
| G.6 | `/about` y `/404` son, por definición, meta. Se permiten **solo** como unlugar diegético: el about es la nota del archivista y el 404 es una hoja perdida.                                   | Pendiente M7    |
| G.7 | El contador del nav ("4 secciones") es una métrica de sitio. Debe contar **libros, mundos, almas**.                                                                                          | Pendiente       |

### Lo que esta decisión **no** autoriza

- **No es un CMS ni una wiki disfrazada.** El diegético no excuse una copia
  mal escrita. El contenido sigue siendo lo que es: bueno, con huecos
  declarados.
- **No rompe la accesibilidad.** Un lector de pantalla que recorra el sitio
  tiene derecho a un árbol semántico y a nombres claros. Diegético significa que
  _la forma_ cuenta una historia, no que el _texto_ se vuelva ininteligible.
- **No justifica romper los tokens de contraste.** El papel viejo es legible
  porque los tokens están medidos; oscurecerlos para que "parezca más viejo"
  sería decides el rigor por la estética.

### Cómo se verifica

Los criterios de §11 pasan a llevar, donde aplique, una pregunta nueva:

> **¿Esto podría ser el mismo componente en un sitio sobre otro tema?**

Un criterio que se responde "no" sin explicación no pasa.

---

## 1. Auditoría del estado actual

## 1. Auditoría del estado actual

### 1.1 Métricas del repositorio

| Métrica                      | Valor                                                                   |
| ---------------------------- | ----------------------------------------------------------------------- |
| Ficheros `src/**/*.{ts,tsx}` | **243**                                                                 |
| Líneas de código `src`       | **37.250**                                                              |
| Peso `src`                   | **1.312,9 KB**                                                          |
| `components/`                | 830 KB                                                                  |
| `data/`                      | 275,9 KB                                                                |
| `pages/`                     | 145,3 KB                                                                |
| `test/`                      | 59,4 KB (22 ficheros, 203 tests)                                        |
| CSS                          | 1 fichero, 16,6 KB, 950 líneas                                          |
| `dist/` total                | **22,4 MB**                                                             |
| `dist/assets` gzip           | 548 KB                                                                  |
| Bundle mayor                 | `react-three-fiber.esm` **861 KB raw / 227 KB gzip / 186 KB brotli**    |
| Tests                        | 203 unit + **12 e2e Playwright (100 % obsoletos, no ejecutados en CI)** |

### 1.2 Inventario de rutas (`src/App.tsx`)

| Ruta                | Componente                     | Estado       | Observación                          |
| ------------------- | ------------------------------ | ------------ | ------------------------------------ |
| `/`                 | `LandingPage`                  | vivo         | Índice de 10 capítulos sobre papel   |
| `/celestial-charts` | `KhrissAtlas`                  | vivo         | Atlas de Khriss, 12 spreads          |
| `/about`            | `About`                        | vivo         |                                      |
| `/magic`            | `MagicSystemsPage`             | vivo         | Ars Arcanum                          |
| `/aharietiam`       | `AharietiamPage`               | vivo         | Escena R3F                           |
| `/books`            | `StandaloneBooksPage`          | vivo         |                                      |
| `/books/:id`        | `BookPage`                     | vivo         |                                      |
| `/characters`       | `BiographicalArchivesPage`     | vivo         | Manuscrito de 3 capítulos            |
| `/chronology`       | `StandaloneChronologyPage`     | vivo         | Línea temporal SVG                   |
| `/library`          | `LibraryPage`                  | vivo         | Estanterías 3D (CSS)                 |
| `/stats`            | `StatsPage`                    | vivo         | Diagrama de Taravangian              |
| `/compare`          | `ComparePage`                  | vivo         |                                      |
| `/mind-map`         | `MindMapPage`                  | vivo         |                                      |
| `/shadesmar`        | `ShadesmarPage`                | vivo         | Canvas2D                             |
| `*`                 | `NotFound`                     | vivo         |                                      |
| `/map`              | → `/celestial-charts`          | **redirect** | ruta muerta                          |
| `/locations`        | → `/celestial-charts`          | **redirect** | ruta muerta                          |
| `/shards`           | → `/celestial-charts`          | **redirect** | ruta muerta                          |
| `/timeline`         | → `/chronology`                | **redirect** | ruta muerta                          |
| `/glossary`         | → `/magic`                     | **redirect** | ruta muerta (el módulo ya no existe) |
| `/heralds`          | → `/aharietiam`                | **redirect** | ruta muerta                          |
| `/family-tree`      | → `/characters?tab=bloodlines` | **redirect** | ruta muerta                          |

**19 rutas públicas para 14 pantallas reales.** Los redirects son un agujero: cualquier enlace externo a `/map` lleva a un sitio que ya no significa lo que significaba.

### 1.3 Código muerto verificado

Análisis automático de referencias entrantes sobre los 243 ficheros TS/TSX:

| Fichero / subárbol                                                            | Peso                           | Consumido por        | Acción                                                                                            |
| ----------------------------------------------------------------------------- | ------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------- |
| `src/pages/CharactersPage.tsx`                                                | 23,3 KB                        | **nada**             | **BORRAR** (es la versión antigua con tabs; `/characters` usa `BiographicalArchivesPage`)         |
| `src/pages/CelestialChartsPage.tsx`                                           | 5,1 KB                         | **nada**             | **BORRAR** (sustituido por `KhrissAtlas`)                                                         |
| `src/pages/LocationsPage.tsx`                                                 | 9,0 KB                         | **nada**             | **BORRAR**                                                                                        |
| `src/pages/MapPage.tsx`                                                       | 7,4 KB                         | **nada**             | **BORRAR**                                                                                        |
| `src/components/map/**` (13 ficheros)                                         | 94,5 KB                        | solo `MapPage`       | **BORRAR** (`UniverseMap`, `PlanetRenderer`, `HighstormFluid`, `StarField`, `NavigationConsole`…) |
| `src/components/star-chart/**` (5 ficheros)                                   | 34,1 KB                        | solo `LocationsPage` | **BORRAR**                                                                                        |
| `src/utils/fly-to.ts`, `journey.ts`, `screen-to-world.ts`, `simplex-noise.ts` | ~35 KB                         | solo `map/` + tests  | **BORRAR** junto con sus tests                                                                    |
| `src/test/fly-to.test.ts`, `journey-utils.test.ts`                            | 14,4 KB                        | —                    | **BORRAR**                                                                                        |
| **Total recuperable**                                                         | **~223 KB (≈17 % del código)** |                      |                                                                                                   |

Exports nunca referenciados (8):

| Export                    | Fichero                                  |
| ------------------------- | ---------------------------------------- |
| `weightForKind`           | `components/shadesmar/entity-catalog.ts` |
| `getScreenPos`            | `components/shadesmar/Renderer.ts`       |
| `MAGIC_SYSTEM_CATEGORIES` | `data/static/magic-systems.ts`           |
| `SHARD_THEME_LIST`        | `data/static/shard-themes.ts`            |
| `bookIdsToTitles`         | `utils/book-title.ts`                    |
| `fbm3D`                   | `utils/simplex-noise.ts`                 |
| `getStoneTexture`         | `utils/textures.ts`                      |
| `renderWithRouter`        | `test/test-utils.tsx`                    |

### 1.4 Calidad y cobertura de datos

#### Contenido existente

| Entidad                  | Cantidad                  | Fichero                             | Estado                                                                                                                  |
| ------------------------ | ------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Libros                   | **22**                    | `data/static/books.ts`              | Synopsis de calidad Coppermind. `wordCount` falta en 1 (`dawnshard`).                                                   |
| Personajes               | **93**                    | `data/generated/characters.json`    | Descripciones de 443–798 chars (mediana 603). 3 con pronunciación.                                                      |
| Planetas                 | **11**                    | `data/static/planets.ts`            | `yolen, roshar, scadrial, sel, nalthis, taldain, threnody, first-of-the-sun, komashi, lumar, canticle`                  |
| Sistemas de magia        | **49**                    | `data/static/magic-systems.ts`      | El mejor bloque de datos. Incluye 12 metales alománticos.                                                               |
| Eventos cronológicos     | **118**                   | `data/static/timeline/events.ts`    | Rango −20000 … 1620.                                                                                                    |
| Eras                     | **11**                    | `data/static/timeline/eras.ts`      |                                                                                                                         |
| Lifespans                | 52                        | `timeline/character-lifespans.ts`   |                                                                                                                         |
| Worldhoppers             | 5                         | `timeline/worldhopper-journeys.ts`  |                                                                                                                         |
| Honorblades              | 10                        | `data/static/aharietiam.ts`         | Con `attributes`, `essence`, `soulcasting`, `honorbladeGrants`.                                                         |
| Relaciones               | **41** (55 en el fichero) | `data/static/static-data.ts`        | **Solo cubren 25 de 93 personajes.** 68 personajes con 0 relaciones.                                                    |
| Familias                 | 7                         | `data/static/family-data.ts`        |                                                                                                                         |
| Notas de campo de Khriss | 94                        | `data/static/khriss-field-notes.ts` |                                                                                                                         |
| Sagas                    | 9                         | `data/static/sagas.ts`              | `color` es un **nombre de clase Tailwind** (`'gray'`, `'red'`, `'teal'`), no un hex → obliga al mapa `TAILWIND_TO_HEX`. |

#### Defectos de datos concretos (verificados con script)

| #   | Defecto                                                                                                                                                                                                                            | Impacto                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| D1  | **Solo 24 de 93 personajes tienen retrato en disco.** Los 69 restantes apuntan a un `.webp` inexistente.                                                                                                                           | 74 % de las fichas de personaje muestran un marco vacío o un icono roto.            |
| D2  | **`public/characters/placeholder.webp` NO existe.** `character-portrait.ts:14,30` lo devuelve como fallback.                                                                                                                       | El `<img>` final hace 404 en red en cada personaje sin retrato.                     |
| D3  | **10 retratos huérfanos**: `Aesudan, Balat, Davar, Dedelin, Evi, Gavinor, Helaran, Jushu, Lin, Wikim` — existen como fichero pero `normalizeName()` no produce ese nombre.                                                         | 10 imágenes se descargan para nada y 10 personajes no las ven.                      |
| D4  | `normalizeName()` devuelve `"The"` para 2 personajes cuyo nombre empieza por "The" (p. ej. _The Lord Ruler_).                                                                                                                      | Colisión de retrato.                                                                |
| D5  | **4 de los 7 emblemas declarados no existen**: `elantris.webp`, `warbreaker.webp`, `white-sand.webp`, `arcanum.webp`, `secret-projects.webp` (5 en realidad). Solo existen `mistborn.webp`, `stormlight.webp`, `stormlight2.webp`. | 17 de 22 libros caen al fallback "círculo con 4 remaches" idéntico → **captura 1**. |
| D6  | `stormlight2.webp` no lo referencia ningún libro.                                                                                                                                                                                  | 94,5 KB de asset muerto.                                                            |
| D7  | **Los 10 ficheros de `public/images/aharietam/*.webp` son binariamente idénticos** (MD5 `F04DDBA2E9CBEF48A7235BB42A8A778A`), 1.261 KB cada uno.                                                                                    | **12,6 MB de los 22,4 MB del `dist` son el mismo fichero 10 veces.**                |
| D8  | **68 de 93 personajes tienen 0 relaciones**; 41 relaciones cubren 25 personajes.                                                                                                                                                   | El diagrama de conexiones está vacío para el 73 % del elenco.                       |
| D9  | `entity-catalog.ts:63` — `connSet()` prefija con `soul_` los **IDs de libros** (`the_way_of_kings` → `soul_the_way_of_kings`), que no corresponde a ningún alma.                                                                   | Las líneas de conexión de Shadesmar **no se dibujan nunca**.                        |
| D10 | `family-data.ts` declara a Navani como esposa de `gavilar` y madre de Jasnah. Canónicamente Gavilar estuvo casado con Iali.                                                                                                        | Error de lore visible.                                                              |
| D11 | `sagas.ts` almacena `"color": "red"` (clase Tailwind) mientras `planets.ts` almacena `"#ef4444"` (hex).                                                                                                                            | Dos sistemas de color en el mismo modelo.                                           |
| D12 | `KhrissAtlas.tsx:232-247` — `getPlanetName()` **duplica a mano los 11 nombres de planeta** en un `Record<string,string>`.                                                                                                          | Deriva garantizada al añadir un planeta.                                            |
| D13 | `books.ts` no tiene campo `cover`; la ruta se construye por convención `${BASE}images/covers/${book.id}.webp` en `BookCover.tsx:31` y `PlanetPanel.tsx:28`.                                                                        | Renombrar un id rompe la portada silenciosamente.                                   |
| D14 | No existe `characters.json` → `Character.image` (**0 de 93 lo usan**). El retrato se resuelve por heurística de nombre.                                                                                                            | Sin control editorial sobre qué retrato se muestra.                                 |
| D15 | `validate.ts:4` — `warn()` solo imprime en `import.meta.env.DEV`. En producción un registro corrupto **desaparece sin aviso**.                                                                                                     | Fallo silencioso.                                                                   |

#### Cobertura de tests de datos

`src/test/data-integrity.test.ts` (43 tests) es **el activo más valioso del repo**. Valida: unicidad de IDs en 8 colecciones, integridad referencial de `event.planets`, `event.saga`, `planet.books`, `planet.sagas`, `book.saga`, `character.requiredBooks`, `character.planet`, `worldhopper.planets`, `worldhopper.sagas`, `character-span.planet`, `planet.connectedPlanets`, rangos de año, valores de `importance`, orden de libros, metales alománticos, surges de los Honorblades.

**No cubre:** `MAGIC_SYSTEMS`, `FAMILY_TREES`, `khriss-field-notes`, `shard-themes`, `book-archive-entries`, existencia de los ficheros de assets referenciados, ni longitud mínima de descripciones.

### 1.5 Assets

```
public/
├─ favicon.svg                     (SVG, sí existe)
├─ icon-192.png  icon-512.png      (7,2 KB / 23,4 KB)
├─ icons.svg                       (sprite de iconos, 5 KB)
├─ robots.txt  sitemap.xml         ⚠ dominio equivocado (vercel)
├─ characters/                     34 ficheros .webp  (1.718 KB)
│     └─Placeholder AUSENTE  ⚠
├─ images/
│   ├─ covers/                     22 .webp  (4.514 KB) — ✅ 22/22 IDs coinciden
│   ├─ aharitam/                   10 .webp  (12.611 KB) — ⚠ 10 ficheros IDÉNTICOS
│   ├─ emblems/                    3 .webp  (175 KB) — ⚠ faltan 5 declarados
│   └─ decorations/wood-pattern.png  110,9 KB (203×317 px)
└─ screenshots/                    ⚠ BORRADOS (git los ve como deleted) pero el
                                       manifest PWA aún los referencia
```

- `public/characters/*.webp` — resoluciones **muy desiguales**: de 200×200 (`Spook.webp`) a 1440×1800 (`Davar.webp`). Sin `srcset`, sin AVIF, sin `width`/`height` → CLS.
- `public/images/covers/*.webp` — de 387×600 a 1604×2493. Sin `srcset`. `the_sunlit_man.webp` pesa 882 KB y se sirve a móvil.
- `wood-pattern.png` mide **203×317 px** y se estira a `repeat 0 0 / <plankHeight*15>px 100%` en estanterías de 2.700 px → **13× de upscale**, borroso y visible.
- **`public/screenshots/home.png|characters.png|timeline.png` están borrados del working tree** pero `vite.config.ts:52-57` los declara en `manifest.screenshots` y `includeAssets`. La PWA se registra con capturas inexistentes.
- **`index.html` usa rutas absolutas** (`/favicon.svg`, `/icon-512.png`) mientras `base: '/Cosmere-Archive/'` → **404 en GitHub Pages**.
- **`sitemap.xml` apunta a `https://cosmere-archive.vercel.app/`** (el proyecto ya se despliega en GitHub Pages) y lista 14 rutas de las que **6 están muertas**: `/relationships`, `/glossary`, `/reading-order`, `/shards`, `/locations`, `/timeline`.
- `AGENTS.md` documenta `/heralds` y `/map` como rutas válidas.

**Procedencia de los assets:** los 22 lomos y los 34 retratos no tienen fuente declarada. `wood-pattern.png` sí (Texturize.app, dominio público). El `AGENTS.md` menciona "Honorblade PNG assets" como si fueran propios. **Hay que confirmar la procedencia de los lomos/retratos antes de publicar** (ver §12, P1).

### 1.6 Desempeño

| Chunk                          | raw      | gzip         | brotli   |
| ------------------------------ | -------- | ------------ | -------- |
| `react-three-fiber.esm`        | 861,0 KB | **227,0 KB** | 186,3 KB |
| `vendor` (react+router)        | 227,3 KB | 72,3 KB      | 62,3 KB  |
| `index` (App + Layout + datos) | 226,4 KB | 69,7 KB      | 55,6 KB  |
| `AharietiamPage`               | 158,8 KB | 53,1 KB      | 46,9 KB  |
| `LibraryPage`                  | 67,6 KB  | 21,8 KB      | 18,2 KB  |
| `BiographicalArchivesPage`     | 64,1 KB  | 16,6 KB      | 14,3 KB  |
| `index.css`                    | 89,7 KB  | 15,3 KB      | 12,4 KB  |
| **Total assets**               | 1,88 MB  | **548 KB**   | —        |

Problemas:

1. **`chunkSizeWarningLimit: 1000`** (`vite.config.ts:13`) silencia el aviso del bundle de 861 KB que R3F produce. Se está ocultando una regresión, no arreglándola.
2. `manualChunks` (`vite.config.ts:17-27`) solo separa react/react-router y d3. **No separa `three`** → el chunk de R3F incluye `three` completo aunque solo lo use `/aharietiam`.
3. **`index-BR8HQiqC.js` = 226 KB raw** carga en la home: incluye `Layout`, `CommandPalette`, `SearchBar`, `ParchmentMenu` **y todo el barrel `@/data/static`** (books + characters.json + magic-systems + planets + sagas + relationships).
4. `characters.json` pesa **70,7 KB** y se importa **completo y estáticamente** en `index` (vía `Layout → SearchBar → useSearch`), en `CharactersPage` (muerto), en `entity-catalog`, y en `BiographicalArchivesPage`. Se serializa en el HTML-path de varias rutas.
5. **`LibraryPage` = 67,6 KB raw para mostrar 22 lomos.** El peso viene de `BookSpine.tsx` (21 KB) + `BookCanvas/BookScene/BookModel3D` (R3F) + `page-texture.ts` (12,8 KB) + `DustMotes`.
6. `Math.random()` en `Renderer.ts:25-31` (`initFog`) + flag de módulo `fogInit` → la niebla **no se regenera al redimensionar** y hace el render no determinista (rompe tests visuales futuros).
7. Sin `content-visibility: auto`, sin `contain-intrinsic-size`, sin virtualización en listas largas.
8. **Sin presupuesto de rendimiento en CI**: nada impide que el bundle crezca.

### 1.7 Accesibilidad

- Nada de texto por debajo de **12 px**; en la información el mínimo es **13 px**; running headers y folios nunca por debajo de **11 px**.
- `src/test/a11y.test.tsx` solo prueba `SearchBar` (4 tests). **No hay auditoría axe, ni tests de contraste, ni de teclado, ni de lector de pantalla.**
- `Layout.tsx:85,91` — dos skip-links pero con `class="skip-link"` cuya clase **no existe en `index.css`** (CSS muerto); funcionan por `sr-only` + `focus:not-sr-only`, correcto aunque frágil.
- Foco: `index.css:269-273` define `*:focus-visible { outline: 2px solid var(--color-accent) }` con `--color-accent: #a855f7` (morado). Sobre papel `#f2ece0` el morado da **2,84:1** → **falla WCAG 2.2 SC 1.4.11** (3:1 mínimo para anillo de foco). `index.css:386` lo sobreescribe con `rgba(138,112,80,0.5)` solo dentro de `.manuscript-focus` (**1,94:1**), lo cual es peor.
- Elementos interactivos no semánticos: `<div role="button" tabIndex={0}>` en `BiographicalContents`, `ConnectionDiagram`, `ArchivalIndex`, `AtlasIndex`… Búsqueda: **36 `onClick=`** en el árbol.
- Shadesmar **no tiene ninguna representación en el DOM**: todo (nombres, descripciones, conexiones) se pinta con `ctx.fillText`. Un lector de pantalla no encuentra nada. No hay `role`, ni `aria-live`, ni lista alternativa.
- `Layout.tsx:82` usa `h-screen` (=`100vh`) → en iOS/Android la barra de direcciones móvil descuadra la altura.
- Responsive real prácticamente inexistente: **79 usos de `sm:`, 3 de `md:`, 8 de `lg:`, 0 de `xl:`**. `ArchivalViewer` es un `flex-1 flex` de dos páginas de ancho fijo con `px-14` (56 px) de padding interno → en 375 px de ancho quedan **263 px de página**, es decir, **131 px por página**.
- Objetos táctiles: el hamburguesa de `Layout.tsx:113-132` es un botón de **24×24 px** con tres barras de **2×2 px**. El mínimo recomendado (WCAG 2.2 SC 2.5.8) es **24×24 px** — justo en el límite, y con puntos de 2 px dentro.

### 1.8 Builds, CI y despliegue

- **CI** (`.github/workflows/ci.yml`): `pnpm install --frozen-lockfile` → `lint` → `typecheck` → `test` → `build`. Correcto pero **mínimo**: no hay `format:check`, no hay cobertura, no hay e2e, no hay Lighthouse, no hay job de validación de datos, no hay `pnpm audit`, no hay Dependabot.
- **Deploy** (`deploy.yml`): build → `actions/upload-pages-artifact` → `actions/deploy-pages`. Sin caché de pnpm, sin `pnpm fetch --frozen-lockfile`, sin verificación previa de que CI pasó (deploy dispara en cualquier push a `main`, incluso si el build de CI falla).
- **Playwright no está en ningún workflow.** Los 12 tests e2e son de una generación anterior: referencian `/glossary`, `/relationships`, `/family-tree`, `/heralds`, `/reading-order`, `role=img[description*="Interactive map"]`, `page.fill('input[placeholder*="Search"]')`. **Todos fallarían.**
- `eslint.config.js` incluye `react-hooks` v7 con la regla `purity` activa (por eso hay `hashSeed()` en `PlanetForceGraph`) — buena decisión, mantener.
- Husky + lint-staged activos: `prettier --write` + `eslint --fix` en pre-commit.
- `Dockerfile` + `nginx.conf` presentes para despliegue en Docker, no usados por el pipeline.

---

## 2. Diagnóstico: por qué se ve cutre

### 2.1 Jerarquía

**No existe una jerarquía tipográfica.** Hay 33 usos de `clamp()` con `vw` y **no una sola escala tipográfica declarada**. Cada componente decide sus tamaños por intuición:

- `ArchivalViewer.tsx:108` — running header a **9 px**.
- `ArchivalViewer.tsx:118` — folio a **8 px**.
- `BiographicalArchivesPage.tsx:161` — botón "Clear" a **9 px**.
- `BiographicalArchivesPage.tsx:262` — enlace "← Contents" a **10 px**.
- `ArchivalViewer.tsx:198` — folio a **8 px**.
- `BiographicalArchivesPage.tsx:405` — "— Silverlight Edition —" a `clamp(8px, 0.7vw, 10px)` → **8 px**.
- `BiographicalArchivesPage.tsx:209` — nombre del personaje a **14 px**, igual que el encabezado de sección.

UnRunning header a 8-9 px que es **menos legible que el texto que titula** invierte la jerarquía: lo accesorio grita más que lo principal. En la captura 2 esto produce exactamente el efecto "todo lavado e ilegible".

**Ausencia de jerarquía de superficie.** No hay un modelo de elevación. El `box-shadow` se escribe a mano en 30+ sitios con valores adivinados (`0 1px 3px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.14), 0 24px 64px rgba(0,0,0,0.18)` en `Manuscript.tsx:103`; `0 20px 60px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)` en `CosmereLibrary.tsx:341-345`). Dos "niveles" de sombra totalmente distintos conviven.

### 2.2 Contraste — la causa raíz nº 1

Medí **30 combinaciones reales** texto/fondo del código. Resultados (mínimo AA = **4,5:1**; texto grande ≥24 px o ≥18,66 px negrita = 3:1):

#### Sobre papel de `Manuscript.tsx` (`#f5efe6`)

| Elemento                              | Código                    | Tamaño | Color efectivo | Ratio    | Veredicto             |
| ------------------------------------- | ------------------------- | ------ | -------------- | -------- | --------------------- |
| `h1` COSMERE ARCHIVE                  | `#6a5a3a`                 | 26 px  | `#6a5a3a`      | 5,86     | PASS                  |
| Título de capítulo                    | `#5a4a3a`                 | 15 px  | `#5a4a3a`      | 7,42     | PASS                  |
| Subtítulo                             | `#8a7a6a`                 | 12 px  | `#8a7a6a`      | 3,62     | FAIL (texto pequeño)  |
| Descripción de capítulo               | `#8a7a6a`                 | 13 px  | `#8a7a6a`      | 3,62     | FAIL                  |
| **Numeral (I, II, III…)**             | `rgba(160,140,110,0.40)`  | 14 px  | `#dbd1c0`      | **1,46** | **FAIL**              |
| **Anotación de folio**                | `rgba(160,140,110,0.20)`  | 9 px   | `#eee8dc`      | **1,20** | **FAIL**              |
| **Pie "— Archives of the Cosmere —"** | `rgba(160,140,110,0.30)`  | 10 px  | `#e6dfd1`      | **1,32** | **FAIL**              |
| Chip de hover                         | `rgba(160,140,110,0.035)` | 14 px  | `#f2ece2`      | 1,03     | decorativo, aceptable |

→ **Coincide exactamente con la captura 3**: se ve el título y las descripciones; los numerales son invisibles.

#### Sobre papel de `ArchivalViewer` (`#f2ece0`)

| Elemento                          | Código                | Tamaño | Color efectivo   | Ratio     | Veredicto            |
| --------------------------------- | --------------------- | ------ | ---------------- | --------- | -------------------- |
| Running header                    | `#5a3d28`             | 9 px   | —                | 8,37      | PASS (pero 9 px)     |
| Folio                             | `#7a6040`             | 8 px   | —                | 4,99      | PASS (pero 8 px)     |
| **`h2` CHARACTER INDEX**          | `rgba(60,45,30,0.45)` | 14 px  | `#a09689`        | **2,47**  | **FAIL**             |
| Cabecera de letra (A, B, C)       | `rgba(60,45,30,0.35)` | 12 px  | `#b9aea0`        | **1,97**  | **FAIL**             |
| Nombre en índice (inactivo)       | `rgba(45,26,14,0.60)` | 14 px  | `#7c6e62`        | 4,19      | FAIL (texto pequeño) |
| Texto del buscador                | `rgba(60,40,25,0.65)` | 13 px  | `#7c6d5f`        | 4,24      | FAIL                 |
| **Placeholder del buscador**      | `rgba(80,60,40,0.30)` | 13 px  | `#c1b7a9`        | **1,68**  | **FAIL**             |
| **Botón "Clear"**                 | `rgba(80,60,40,0.18)` | 9 px   | `#d5ccbf`        | **1,35**  | **FAIL**             |
| **Etiqueta de planeta (ros/sca)** | `${planetColor}70`    | 10 px  | p. ej. `#b3c3ca` | **≈2,21** | **FAIL**             |
| "No entries match your query."    | `rgba(80,60,40,0.30)` | 12 px  | `#c1b7a9`        | **1,68**  | **FAIL**             |
| Enlace "← Contents"               | `rgba(80,60,40,0.25)` | 10 px  | `#cac0b2`        | **1,53**  | **FAIL**             |

→ **Coincide exactamente con la captura 2**: las etiquetas de planeta "ros"/"sca" son invisibles, el buscador está desvaído, el índice A–D apenas se lee.

#### Barra de navegación (`Layout.tsx`, fondo `#d4c4b2`)

| Elemento                   | Código    | Tamaño | Ratio    | Veredicto |
| -------------------------- | --------- | ------ | -------- | --------- |
| "COSMERE ARCHIVE"          | `#3a2a1a` | 16 px  | 8,09     | PASS      |
| **"About"**                | `#8a7a6a` | 10 px  | **2,43** | **FAIL**  |
| **Puntos del hamburguesa** | `#8a7a6a` | 2 px   | **2,43** | **FAIL**  |

→ **Coincide con las 5 capturas**: la barra es un listón beige de 32 px con un logo a la izquierda y "About" a la derecha, todo minúsculo. Es el único elemento de navegación visible; los 11 destinos están ocultos tras un icono invisible.

#### Errores de contraste por bug (no por estética)

| Fichero                      | Bug                                                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CharactersPage.tsx:502,518` | El texto del nombre del personaje es `#3a2a1a` (tinta oscura) sobre tarjetas con fondo `rgba(80,60,40,0.08)` en modo oscuro → ratio efectivo **1,43:1**. Texto invisible. |
| `CharactersPage.tsx:296`     | `<h1>` a `#e8dcc8` sobre el mismo fondo oscuro → 14,5:1 OK, pero convive con nombres a 1,43:1 en la misma vista.                                                          |
| `KhrissAtlas.tsx:196,219`    | Chevron de navegación `rgba(80,60,40,0.12)` sobre papel → **≈1,26:1**. Los controles ‹ › son invisibles.                                                                  |
| `index.css:270`              | Anillo de foco `--color-accent: #a855f7` sobre `#f2ece0` → **2,84:1**. Falla SC 1.4.11.                                                                                   |
| `index.css:386`              | `.manuscript-focus` fuerza `rgba(138,112,80,0.5)` → **1,94:1**. Peor.                                                                                                     |
| `Renderer.ts:292`            | Líneas de conexión `globalAlpha = 0.1` → **1,22:1**. Invisible por diseño.                                                                                                |

### 2.3 Escala y medida

- **33 usos de unidades `vw` para tamaño de fuente.** En el viewport de 2557 px de las capturas, `clamp(8px, 0.7vw, 10px)` da 10 px y `clamp(26px, 3.5vw, 48px)` da 48 px. El resultado: **encabezados que no crecen** (topados por `clamp`) y **microtexto que no se encoge** (limitado por el mínimo). La escala se aplana en los extremos, justo donde más se necesita contraste entre niveles.
- **Sin medida de línea (measure) declarada.** `BiographicalArchivesPage.tsx:386-390` limita el párrafo a `max-w-[420px]`, pero `CharacterRecord` y el cuerpo de texto no tienen `max-width`. En 2557 px, una columna de texto sin medida llega a 120+ caracteres por línea.
- `KhrissAtlas.tsx:196,219` — los chevrons usan `fontSize: 'clamp(16px, 1.5vw, 24px)'` → topados a 24 px pero con opacidad de hover al 60 %.

### 2.4 Espaciado

- `CosmereLibrary.tsx:321` — `gap-36` (144 px) **entre estanterías**. En un viewport de 970 px de alto, dos huecos de 144 px se comen el 30 % de la pantalla.
- `ArchivalViewer.tsx:107,114` — `px-14` (56 px) de padding interno por página × 2 páginas = 112 px + 24 px de lomo = **136 px de estructura fija**. A 375 px de viewport quedan 239 px útiles → 119 px por página.
- `Manuscript.tsx:124` — `px-12 py-12 sm:px-16 sm:py-14` (48–64 px). Razonable.
- `BiographicalContents` / `HouseArchiveEntry` usan `space-y-[5px]` y `mb-5`/`mb-6` mezclados.
- No hay escala de espaciado: se mezclan valores arbitrarios (`py-[7px]`, `p-[2px]`, `gap-x-[0.25em]`, `space-y-[1px]`) con la escala de Tailwind.
- `index.css` **no define ninguna custom property de espaciado**.

### 2.5 Uso del espacio / composición

Esto es lo que más sorprende en las capturas:

**Captura 2 (registro de personaje).** El libro abierto mide 1.640 px de ancho (limitado por `max-w-[1680px]`, `ArchivalViewer.tsx:44`) y ~880 px de alto. El contenido real —una foto de 64 px, un nombre y 6 líneas de texto— ocupa **~420 × 380 px**, es decir el **8 % del área**. El 92 % restante es papel vacío. El problema no es que falte contenido: es que **el contenedor es fijo y el contenido es variable, y no hay ningún mecanismo de}densidad**. Un panel de texto de 68 caracteres de ancho dentro de una página de 800 px produce un vacío estructural permanente.

**Captura 3 (Shadesmar).** `Camera.ts:13-15` — `x = 0.5, y = 0.5, zoom = 0.5`. `Camera.ts:42` mapea con `zoom * min(w, h)`. En 2557 × 970, `min(w,h) = 970`, escala = 485 px/unidad. El clúster de Roshar (`types.ts:96`) tiene `cx=0.311, cy=0.396, radius=0.14` → se dibuja en un círculo de **136 px de diámetro** en el centro de una pantalla de 2.557 px = **5,3 % del ancho**. Los 12 clústeres juntos ocupan ~575 px. **Coincide exactamente con la captura.**

**Captura 1 (biblioteca).** `CosmereLibrary.tsx:298` calcula `availableWidth = containerWidth - 100`, pero el contenedor real usa `px-24` (**96 px por lado = 192 px**) más `2 * columnWidth` (hasta 84 px). El ancho real que se necesita es `totalWidth + 84 + 192`, pero se reserva `totalWidth + 84` sobre un área de `containerWidth - 192`. **Desbordamiento horizontal de 192 px sistemático** → Dawnshard (último de la estantería _The Cosmere Collection_, y el de menor `wordCount` porque el campo falta → `?? 50000` → el lomo más estrecho) queda **recortado a la derecha**. Confirmado en la captura.

Además `CosmereLibrary.tsx:188`: `fontSize = max(7, min(13, width * 0.28))` con `columnWidth = clamp(26, 42, …)`. A 2.557 px, `columnWidth = 42` → `fontSize = 12 px`. Ese es el **"texto minúsculo ilegible suelto sobre la madera a la izquierda"** de la captura: las palabras apiladas verticalmente de `SideColumn`, a 12 px, con `color: '#0d0703'` y `opacity` implícita de la madera oscura.

**Captura 5 (Diagrama).** `DiagramCanvas` escala un muro de 5.000 × 5.000 unidades a `initialScale 0.5` → 2.500 px de contenido en 2.557 px de pantalla, con 9 documentos «esparcidos». No hay punto focal, no hay jerarquía de tamaño de documento, y las fórmulas flotantes son de 7–8 px. Falla el mismo problema que Shadesmar: **el sistema de coordenadas no está calibrado para llenar el viewport**.

### 2.6 Placeholders repetidos

**El hallazgo más importante de la auditoría de assets.** Los 22 libros declaran emblemas:

| Emblema declarado      | Libros                     | ¿Fichero existe? |
| ---------------------- | -------------------------- | ---------------- |
| `mistborn.webp`        | 7 (mistborn-era-1 + era-2) | ✅ sí            |
| `stormlight.webp`      | 6                          | ✅ sí            |
| `elantris.webp`        | 1                          | ❌ **no**        |
| `warbreaker.webp`      | 1                          | ❌ **no**        |
| `white-sand.webp`      | 3                          | ❌ **no**        |
| `arcanum.webp`         | 1                          | ❌ **no**        |
| `secret-projects.webp` | 3                          | ❌ **no**        |
| _(sin emblem)_         | 0                          | —                |

17 de 22 libros entran en `BookSpine.tsx:232-286` → `if (!emblem || failed)` → **el fallback dibuja siempre lo mismo**: un anillo `border 1.5px solid ${foil}66` con **4 remaches en cruz y un punto central**. Los 7 libros de Mistborn comparten `mistborn.webp` → misma imagen. Los 6 de Stormlight comparten `stormlight.webp` → misma imagen.

**Resultado: 17 libros con el mismo glifo genérico y 5 grupos de libros compartiendo 3 imágenes. Solo cambian el título y el color del material.** Eso es exactamente lo que describe la captura 1: _"TODAS llevan la misma ilustración (figura dentro de un círculo con 4 puntos) y solo cambia el título abajo"_.

Otros placeholders:

- 69 de 93 retratos de personaje → 404 silencioso.
- 10 de 10 Honourblades → el mismo fichero de 1,26 MB.
- `CharacterAvatar` → iniciales sobre círculo de color (correcto como fallback, pero es lo que ve el 74 % de los personajes).

### 2.7 Solapamientos

- **`Renderer.ts:216-271` (`drawSelectionInfo`)** dibuja el nombre del personaje a 17 px **centrado exactamente sobre la posición del alma**, y la descripción a 11 px justo debajo, **sin placa de fondo, sin sombra y sin caja**. Las partículas del clúster se dibujan en `drawSouls` (línea 159) y la info **después** (línea 169), así que el texto queda encima — pero al no tener fondo, los puntos brillan a través de las letras. Es exactamente el "SOLAPADOS por las partículas" de la captura 3.
- El texto se dibuja con `ctx.fillText` a **tamaño fijo en px CSS**, pero el canvas se escala con `ctx.scale(dpr, dpr)`: en un monitor 2× el texto se ve nítido pero **11 px es 11 px**, no crece con el zoom. Al hacer zoom a la vez crece la posición pero no el tamaño → desproporción.
- `ArchivalViewer.tsx:117,198` — el folio es `position: absolute; bottom: 5px` **dentro** de un contenedor que hace scroll. Se solapa con el contenido si la página es larga.
- `BiographicalArchivesPage.tsx:231-247` — el enlace "← Contents" también es absoluto sobre la zona desplazable.

### 2.8 Responsive

| Breakpoint      | Uso en el código | Nota             |
| --------------- | ---------------- | ---------------- |
| `sm:` (640 px)  | 79               | —                |
| `md:` (768 px)  | **3**            | casi inexistente |
| `lg:` (1024 px) | 8                | —                |
| `xl:` / `2xl:`  | **0**            | —                |

Consecuencias:

1. **`ArchivalViewer` no tiene ninguna variante responsive.** Es `flex-1 flex` con dos páginas `flex-1` y `px-14` fijos. Es el layout de `/characters`, `/celestial-charts` y `/magic` — **3 de las 5 experiencias principales**.
2. **`CosmereLibrary` no tiene variantes responsive.** `gap-36`, `px-24`, `pt-16` fijos.
3. `Shadesmar` sí tiene `touch-none` y pointer events, pero **no tiene controles táctiles de zoom** ni botón de "volver al mapa general". `Canvas.tsx:304-315` solo registra `onWheel` → **en móvil no hay forma de hacer zoom**.
4. `Layout.tsx:82` usa `h-screen` (= `100vh`), no `100dvh` → desajuste con la barra de direcciones móvil.
5. No hay `srcset` en ningún `<img>` → en móvil se descargan `the_sunlit_man.webp` (882 KB) o `Davar.webp` (115 KB) completos.
6. **Los 33 `clamp(...vw...)` sí son fluidos**, pero con topes tan bajos (8 px) que no escalan.

### 2.9 Rendimiento (percepción)

- **Sin estados de carga por ruta.** `RouteFallback` es genérico; solo `/books` tiene `BooksPageSkeleton`. Las demás rutas lazy muestran un fallback genérico o un hueco.
- **`useSearch` no tiene índice.** 7 bucles `for` secuenciales sobre 11 + 52 + 5 + 118 + 22 + 49 + 10 = **267 objetos** en cada pulsación, con `toLowerCase()` en cada comparación (no precalculado) y un tope arbitrario de 4 resultados por categoría (`MAX_PER_CATEGORY = 4`). Buscar "a" devuelve los 4 primeros de cada categoría en orden de array, sin relevance.
- **`PhysicsSystem` + `grid.rebuild(souls)` en cada frame** (`Canvas.tsx:131,133`) reconstruye el grid espacial completo 60 veces por segundo sobre 700+ almas, incluso cuando el cluster está congelado.
- `Math.random()` en `initFog` sin semilla → el canvas difiere entre renders; imposible de testear visualmente.

### 2.10 Resumen de la lista de causas

| #   | Causa                                                                 | Evidencia                          | Gravedad    |
| --- | --------------------------------------------------------------------- | ---------------------------------- | ----------- |
| C1  | Sin sistema de tokens: 11+ colores de texto sueltos                   | grep sobre `src/**/*.tsx`          | **Crítica** |
| C2  | 17/30 combinaciones de contraste fallan AA (1,20–2,47:1)              | medición, §2.2                     | **Crítica** |
| C3  | Placeholders idénticos en 17/22 libros                                | MD5 + `BookSpine.tsx:232`          | **Crítica** |
| C4  | Escala tipográfica inexistente; 8–9 px en running headers             | `ArchivalViewer.tsx:108,118,198`   | **Crítica** |
| C5  | Shadesmar mal calibrado: zoom 0,5 sobre mundo de 1 un.                | `Camera.ts:13-15` + math           | **Alta**    |
| C6  | Texto de Shadesmar dibujado en canvas sin fondo                       | `Renderer.ts:238-267`              | **Alta**    |
| C7  | `ArchivalViewer` no responsive (136 px de estructura fija)            | `ArchivalViewer.tsx:107,125`       | **Alta**    |
| C8  | `CosmereLibrary` desborda 192 px → lomos recortados                   | `CosmereLibrary.tsx:298` vs `:321` | **Alta**    |
| C9  | 223 KB de código muerto                                               | §1.3                               | **Alta**    |
| C10 | 12,6 MB de assets duplicados                                          | §1.5                               | **Media**   |
| C11 | 74 % de personajes sin retrato; placeholder inexistente               | §1.4 D1–D4                         | **Media**   |
| C12 | 68/93 personajes sin relaciones                                       | `static-data.ts`                   | **Media**   |
| C13 | e2e obsoletos y fuera de CI                                           | `e2e/*.spec.ts`                    | **Media**   |
| C14 | sitemap/manifest/base con rutas y dominio rotos                       | §1.5                               | **Media**   |
| C15 | Sin tests de accesibilidad; foco a 1,94–2,84:1                        | `index.css:270,386`                | **Media**   |
| C16 | `three` no separado; `chunkSizeWarningLimit: 1000` silencia la alerta | `vite.config.ts:13,17`             | **Media**   |
| C17 | Sin estados de carga/errror por ruta                                  | `RouteFallback`                    | **Baja**    |

---

## 3. Visión y principios de diseño

### 3.1 Qué debe sentir cada zona

| Zona                     | Sensación objetivo                                                                                   | Referencia mental                         | Densidad                    | Paleta                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------- | -------------------------------- |
| **Home / índice**        | Una sala de archivo a media luz. Sobria, con autoridad, que invita a explorar.                       | Vestíbulo de una biblioteca privada       | Baja-media, 10 entradas     | Papel cálido                     |
| **Biblioteca de Jasnah** | Madera, polvo, luz cenital. **Física**: los libros pesan, tienen grosor, están mal alineados.        | Librería de segunda mano bien cuidada     | Media-alta                  | Madera + lomos por serie         |
| **Shadesmar**            | Abismo silencioso. Frío, vasto, **respetuoso**. El abalorio es un objeto, no un punto.               | Cosmología china — elrediterráneo inmóvil | Muy baja (espacio negativo) | Negro azulado + acento por Shard |
| **Registro / códice**    | Página de archivo real: tinta densa, jerarquía fuerte, márgenes generosos.                           | Códice de archivo del British Library     | **Alta**                    | Papel + tinta                    |
| **Ars Arcanum**          | Manual académico con criterio. Diagramas, tablas, citas.                                             | _Ars Arcanum_ real / un _bestiario_       | Media                       | Papel frío                       |
| **Cronología**           | Registro histórico. Frío, vasto, cronológico.                                                        | Anales / línea temporal de museo          | Media                       | Tinta sobre pergamino            |
| **Aharietiam**           | Solemne, ceremonial, silencioso.                                                                     | Santuario                                 | Muy baja                    | Piedra + luz cálida              |
| **Global**               | Un solo sistema: misma base tipográfica, mismo ritmo de espaciado, mismos estados, misma navegación. | —                                         | —                           | —                                |

### 3.2 Qué es «cohesión de calidad» (no «apariencia idéntica»)

Cinco(tokens compartidos) + libertad por encima:

**Los 5 tokens globales que NUNCA cambian entre experiencias:**

1. **Base tipográfica**: misma familia serif para titulares, misma sans para UI/datos, mismos pesos disponibles, misma altura de línea. Un lector que pasa de la biblioteca al registro percibe el mismo "cuerpo".
2. **Escala de espaciado**: múltiplos de 4 px, nombrados. Ninguna página inventa `py-[7px]`.
3. **Estados de interacción**: `:hover`, `:focus-visible`, `:active`, `[aria-current]`, `[disabled]`. Un botón es reconocible en cualquier página por su **forma y su anillo de foco**, aunque su color cambie.
4. **Ritmo de movimiento**: mismas duraciones y curvas. 120 ms para micro-estados, 220 ms para entradas, 400 ms para transiciones de zona. Nada dura 1,2 s salvo una animación deAmbientación.
5. **Geometría de navegación**: mismo grosor de anillo de foco (2 px + 2 px offset), mismo radio mínimo (2 px en papel, 4 px en UI), mismo tamaño mínimo de objetivo (44×44 px táctil).

**La libertad por experiencia:**

- Paleta de acento (una por zona, cada una verificada ≥3:1 sobre su superficie).
- Textura de fondo (papel / madera / vacío / piedra).
- Iluminación y profundidad (sombra plana en códice, con volumen en biblioteca).
- Densidad de información.
- Ritmo propio de animación **dentro** de la escala global.

### 3.3 Reglas de redacción

- Máximo **68 caracteres** por línea en cuerpo de texto.
- Máximo **4 niveles** de jerarquía en una vista.
- Toda etiqueta decorativa (numerales, folios, marcas de agua) debe seguir siendo **legible** (≥3:1) o **no existir**.

---

## 4. Sistema de diseño base

Todos los valores de esta sección están **verificados por cálculo de contraste** (no estimados).

### 4.1 Paleta

#### Superficies — modo oscuro (por defecto)

| Token               | Hex       | Uso                                                      |
| ------------------- | --------- | -------------------------------------------------------- |
| `--surface-void`    | `#07090F` | Fondo global del documento                               |
| `--surface-base`    | `#0D1119` | Tarjetas, paneles, superficies de contenido              |
| `--surface-raised`  | `#141A24` | Elementos elevada (dropdowns, popovers, headers pegados) |
| `--surface-inset`   | `#090C12` | Zanjas, campos de formulario, código                     |
| `--surface-overlay` | `#111823` | Backdrops modales (con `alpha` aparte)                   |

#### Texto — modo oscuro (todas las razones calculadas sobre `#0D1119`)

| Token              | Hex       | Ratio     | Uso                                             | Mínimo |
| ------------------ | --------- | --------- | ----------------------------------------------- | ------ |
| `--text-primary`   | `#E9E7E2` | **15,29** | Títulos, cuerpo, nombres                        | 15 px  |
| `--text-secondary` | `#B4BCCB` | **9,89**  | Descripciones, subtítulos                       | 13 px  |
| `--text-tertiary`  | `#8C97A8` | **6,40**  | Metadatos, etiquetas, timestamps                | 12 px  |
| `--text-disabled`  | `#5B6472` | **3,16**  | Elementos deshabilitados (**no informational**) | —      |
| `--text-link`      | `#7CC4E8` | **9,82**  | Enlaces, acciones                               | 14 px  |
| `--text-accent`    | `#C8A96A` | **8,40**  | Acento de marca (oro de Stormlight)             | 14 px  |

#### Superficies — modo papel (códice, atlas, Ars Arcanum, cronología)

| Token              | Hex       |
| ------------------ | --------- |
| `--surface-page`   | `#F4EFE4` |
| `--surface-raised` | `#EDE6D8` |
| `--surface-inset`  | `#E4DCCB` |
| `--surface-edge`   | `#CFC4AE` |

#### Texto — modo papel (razones sobre `#F4EFE4`)

| Token              | Hex       | Ratio     | Uso                                   | Mínimo    |
| ------------------ | --------- | --------- | ------------------------------------- | --------- |
| `--text-primary`   | `#241A12` | **14,87** | Tinta principal                       | 15 px     |
| `--text-secondary` | `#4A382A` | **9,69**  | Etiquetas de campo, cuerpo secundario | 13 px     |
| `--text-tertiary`  | `#6B5744` | **5,96**  | Folios, running headers, metadatos    | **11 px** |
| `--text-disabled`  | `#9C8B78` | 2,87      | Deshabilitado (no informational)      | —         |
| `--text-link`      | `#1F5E86` | **6,10**  | Enlaces, referencias cruzadas         | 14 px     |
| `--text-accent`    | `#7E601C` | **5,12**  | Acento de sello, folio, tinta roja    | 12 px     |

> Nota: `--text-accent` de papel es `#7E601C` (**no** `#8A6A22`, que daba 4,40:1 y quedaba justo por debajo de AA).

#### Bordes y reglas

| Token                           | Hex       | Ratio                        | Regla                                      |
| ------------------------------- | --------- | ---------------------------- | ------------------------------------------ |
| `--border-interactive` (oscuro) | `#5A6880` | **3,35** / 3,10 sobre raised | Bordes que transmiten estado (WCAG 1.4.11) |
| `--border-interactive` (papel)  | `#8C7A5C` | **3,62** / 3,05 sobre inset  | Ídem                                       |
| `--border-subtle` (oscuro)      | `#1F2833` | decorativo                   | Separadores internos                       |
| `--border-subtle` (papel)       | `#C9BCA4` | decorativo                   | Separadores internos                       |
| `--divider-strong` (papel)      | `#8C7A5C` | 3,62                         | Filetes con significado                    |

#### Colores de Shard (acento de UI, todos ≥3:1 sobre `#0D1119`)

| Shard         | Hex       | Ratio |
| ------------- | --------- | ----- |
| Honor         | `#5AA9E6` | 7,43  |
| Cultivation   | `#59C08A` | 8,40  |
| Odium         | `#D9534F` | 4,77  |
| Preservation  | `#3D7DD6` | 4,59  |
| Ruin          | `#C2703A` | 5,10  |
| Harmony       | `#D9A441` | 8,40  |
| Autonomy      | `#C74BC8` | 4,74  |
| Adonalsium    | `#B08CE8` | 6,98  |
| Yolen (ruina) | `#9B87D4` | 6,13  |
| Sin Shard     | `#7A8798` | 5,17  |

> Ruin y Harmony se separan ahora (`#C2703A` vs `#D9A441`). Antes ambos mapeaban al mismo naranja.

### 4.2 Tipografía

**Familias (Google Fonts / Fontsource, SIL Open Font License 1.1):**

| Rol                    | Familia            | Pesos                            | Uso                                            |
| ---------------------- | ------------------ | -------------------------------- | ---------------------------------------------- |
| Display / títulos      | **EB Garamond**    | 400, 500, 600 + _italic_ 400     | Títulos de página, nombres propios, epigrafías |
| UI / datos             | **Inter**          | 400, 500, 600, 700               | Labels, navegación, tablas, metadatos          |
| Mono / códigos         | **JetBrains Mono** | 400, 500                         | Fórmulas del Diagrama, identificadores, años   |
| Alternativa manuscrita | _opcional, M2_     | **IM Fell English** 400 + italic | Citas textuales, epigrafías del Códice         |

**Auto-alojadas vía `@fontsource-variable/*` (no Google Fonts CDN):** elimina 2 requests de terceros, cumple RGPD sin cookies y funciona offline con la PWA.

**Escala modular — ratio 1,2 sobre 16 px.** Todos los valores en px y rem:

| Token            | px  | rem       | line-height | letter-spacing | Peso | Uso                                                     |
| ---------------- | --- | --------- | ----------- | -------------- | ---- | ------------------------------------------------------- |
| `--text-display` | 48  | 3rem      | 1,08        | −0,02em        | 600  | Título de portada                                       |
| `--text-h1`      | 36  | 2,25rem   | 1,15        | −0,01em        | 600  | Título de página                                        |
| `--text-h2`      | 28  | 1,75rem   | 1,2         | 0              | 600  | Sección                                                 |
| `--text-h3`      | 22  | 1,375rem  | 1,25        | 0              | 600  | Subsección                                              |
| `--text-h4`      | 18  | 1,125rem  | 1,3         | 0,005em        | 600  | Nombre propio                                           |
| `--text-lead`    | 19  | 1,1875rem | 1,5         | 0              | 400  | Texto introductorio                                     |
| `--text-body`    | 16  | 1rem      | 1,65        | 0              | 400  | Cuerpo                                                  |
| `--text-body-s`  | 15  | 0,9375rem | 1,6         | 0              | 400  | Cuerpo en columna estrecha                              |
| `--text-ui`      | 14  | 0,875rem  | 1,45        | 0,005em        | 500  | Interfaz                                                |
| `--text-meta`    | 13  | 0,8125rem | 1,4         | 0,01em         | 500  | Metadatos, etiquetas                                    |
| `--text-micro`   | 12  | 0,75rem   | 1,35        | 0,04em         | 500  | Running headers, folios, chips (**mínimo absoluto**)    |
| `--text-nano`    | 11  | 0,6875rem | 1,3         | 0,08em         | 600  | Mayúsculas decorativas (**solo sobre fondos con ≥7:1**) |

**Regras duras:**

- **Ningún tamaño por debajo de 11 px.** Los folios actuales de 8 px pasan a 12 px.
- **Ningún `clamp()` con `vw` para tipografía.** Responsive se resuelve con tokens por breakpoint, no con `vw`. Esto elimina los 33 `clamp` actuales.
- **Medida**: `--measure: 68ch`. Aplicado a todo bloque de texto corrido.
- `--measure-narrow: 52ch` para descripciones de ficha lateral.
- `--measure-wide: 78ch` para sinopsis de libro.

### 4.3 Espaciado

Escala de **4 px** con nombres semánticos:

| Token         | px  | Uso                              |
| ------------- | --- | -------------------------------- |
| `--space-3xs` | 2   | Relleno interno de chip          |
| `--space-2xs` | 4   | Gap entre icono y texto          |
| `--space-xs`  | 8   | Padding de botón pequeño         |
| `--space-sm`  | 12  | Padding de tarjeta, gap en línea |
| `--space-md`  | 16  | Padding estándar de bloque       |
| `--space-lg`  | 24  | Gap entre secciones de página    |
| `--space-xl`  | 32  | Padding de tarjeta grande        |
| `--space-2xl` | 48  | Separación entre bloques mayores |
| `--space-3xl` | 64  | Padding vertical de página       |
| `--space-4xl` | 96  | Separación de zonas              |
| `--space-5xl` | 144 | Solo en Home                     |

**Eliminado:** `gap-36` (144 px entre estanterías → `--space-2xl` 48 px), `px-14` fijos en páginas de papel → `--space-xl` 32 px en desktop / `--space-md` 16 px en móvil.

### 4.4 Layout / contenedores

| Token           | Valor                                          |
| --------------- | ---------------------------------------------- |
| `--page-max`    | 1440 px                                        |
| `--reading-max` | 720 px                                         |
| `--sidebar-w`   | 280 px (≥1024 px), 232 px (≥1280 px)           |
| `--nav-h`       | 56 px (≥768 px), 52 px (<768 px)               |
| `--gutter`      | 20 px (móvil), 32 px (tablet), 48 px (desktop) |
| `--radius-sm`   | 2 px (papel)                                   |
| `--radius-md`   | 4 px (UI)                                      |
| `--radius-lg`   | 8 px (paneles)                                 |
| `--radius-pill` | 999 px (chips)                                 |

### 4.5 Elevación

Cuatro niveles, tokens fijos (sustituyen los ~30 `box-shadow` adivinados):

| Token           | Valor                                                                                         | Uso                      |
| --------------- | --------------------------------------------------------------------------------------------- | ------------------------ |
| `--shadow-0`    | `none`                                                                                        | Superficie base          |
| `--shadow-1`    | `0 1px 2px rgba(0,0,0,.24), 0 1px 1px rgba(0,0,0,.16)`                                        | Tarjetas                 |
| `--shadow-2`    | `0 4px 12px rgba(0,0,0,.28), 0 2px 4px rgba(0,0,0,.16)`                                       | Hover, popovers          |
| `--shadow-3`    | `0 12px 32px rgba(0,0,0,.36), 0 4px 8px rgba(0,0,0,.20)`                                      | Modales                  |
| `--shadow-book` | `0 2px 6px rgba(0,0,0,.34), 0 12px 32px rgba(0,0,0,.44), inset 0 1px 0 rgba(255,255,255,.06)` | Libro en 3D / estantería |

### 4.6 Movimiento

**Tokens de duración** (todos los valores actuales se relajan a esta escala):

| Token           | ms  | Curva                     | Uso                                      |
| --------------- | --- | ------------------------- | ---------------------------------------- |
| `--dur-instant` | 80  | `cubic-bezier(.4,0,.2,1)` | Feedback inmediato                       |
| `--dur-fast`    | 120 | `cubic-bezier(.4,0,.2,1)` | Hover, foco, chips                       |
| `--dur-base`    | 220 | `cubic-bezier(.2,0,0,1)`  | Entradas de panel, tooltips              |
| `--dur-slow`    | 400 | `cubic-bezier(.2,0,0,1)`  | Transiciones de zona, cambio de capítulo |
| `--dur-ambient` | 900 | `linear`                  | Solo ciclos de fondo                     |

**Curvas** (definidas una vez, reutilizadas):

- `--ease-standard: cubic-bezier(.2, 0, 0, 1)`
- `--ease-decelerate: cubic-bezier(0, 0, 0, 1)`
- `--ease-spring: cubic-bezier(.34, 1.56, .64, 1)` — solo para elementos físicos (lomos)
- `--ease-exit: cubic-bezier(.4, 0, 1, 1)`

**Stagger**: 40 ms entre elementos hermanos, máximo 8 elementos (400 ms). Se elimina el `animationDelay: 1.5 + globalIdx * 0.08s` de `Manuscript.tsx:170` (que retrasaba 2,3 s la aparición del último capítulo).

**`prefers-reduced-motion: reduce`** — bloque obligatorio y global:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Hoy `index.css` solo desactiva `scroll-behavior` (líneas 262-266) y envuelve las animaciones en `@media (prefers-reduced-motion: no-preference)` — pero `quoteReveal`, `panel-slide-in/out`, `planet-rotate`, `dust-drift`, `label-appear`, `halo-breathe`, `magma-glow`, `aon-pulse`, `color-shift`, `mist-drift`, `ash-fall`, `spore-drift`, `ember-drift`, `ancient-float` (líneas 9-67 y 510-705) quedan **fuera** de esa protección.

**Regla de rendimiento**: máximo **3** animaciones `transform`/`opacity` concurrentes. Nada de animar `width`, `height`, `top`, `left`, `filter` ni `box-shadow` en bucles. Hoy `ArchivalViewer` anima `clip-path` (`parchment-unfold`) y `Shadesmar` recalcula un grid de 700+ almas por frame.

### 4.7 Foco

```css
--focus-ring: 0 0 0 2px var(--surface-base), 0 0 0 4px var(--focus-color);
--focus-color: #7cc4e8; /* ratio 9,82 sobre #0D1119 */
--focus-color-paper: #1f5e86; /* ratio 6,10 sobre #F4EFE4 */
```

Ambos superan 3:1 en el anillo exterior (SC 1.4.11). Nunca `outline: none` sin sustituto.

### 4.8 Iconografía

- Un solo set: **Lucide** (ISC, 24×24, stroke 1,5 px, `currentColor`).
- Tamaños: 16 / 20 / 24 px. Nunca escala por `currentColor` con opacidad < 0,6 (falla 1.4.11 si es el único indicador).
- Iconos funcionales con `aria-hidden="true"` + texto visible. Iconos solos con `aria-label` + `role="img"`.
- **Sustituye** `src/components/common/icons.tsx` (hand-rolled) y `public/icons.svg`.

---

## 5. Rediseño por experiencia (v2 — decisiones cerradas)

> Redactado tras la entrevista de dirección. Las 20 decisiones están en §0.1.
> Breakpoints: **M** 360–767 px · **T** 768–1023 px · **D** 1024–1439 px · **UW** ≥1440 px.

---

### 5.1 Navegación global — barra superior visible

**Decisión D-NAV.** Sustituye al hamburguesa de 24×24 px con puntos de 2×2 px a 2,43:1 (`Layout.tsx:113-132`).

**Desktop (≥1024 px) — barra de 56 px, 2 filas lógicas.**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ◆ COSMERE ARCHIVE   Library  Records  Shadesmar  Taravangian           │
│    ───────────────     Historical Archive ▾          [ ⌕ Search  ⌘K ]  │
└──────────────────────────────────────────────────────────────────────────┘
```

| Elemento               | Medida                                                                          | Color                                                                        | Ratio verificado |
| ---------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------- |
| Barra (fondo)          | 56 px                                                                           | `--surface-base` `#0D1119` + borde inferior 1 px `--border-subtle` `#1F2833` | —                |
| Wordmark               | 16 px, tracking 0,18em, `--text-primary` `#E9E7E2`                              |                                                                              | **15,29**        |
| Enlaces de navegación  | `--text-ui` 14 px / 500, `--text-secondary` `#B4BCCB`                           |                                                                              | **9,89**         |
| Enlace activo          | `--text-primary` + filete inferior 2 px `--text-accent` `#C8A96A`               |                                                                              | **8,40**         |
| `Historical Archive ▾` | `--text-ui` 14 px + chevron 16 px `--text-tertiary`                             |                                                                              | **6,40**         |
| Buscador               | botón 36 px alto, `--text-ui` 14 px, `--text-secondary` sobre `--surface-inset` |                                                                              | **9,89**         |
| Área de tabulación     | ≥ 44×44 px en todos los enlaces                                                 |                                                                              | SC 2.5.8         |

- `aria-current="page"` en el enlace activo (nunca solo color).
- El logo es un `<a href="/">` real, no un `<div onClick>`.
- **Barra pegajosa** con `backdrop-filter: blur(12px)` y `background: color-mix(in srgb, var(--surface-base) 88%, transparent)`.

**Móvil (<768 px) — barra inferior fija de 5 destinos.**

```
┌──────────────────────────────────┐
│  ◆      📚     🌊     ⚙     🔍  │  64 px + env(safe-area-inset-bottom)
└──────────────────────────────────┘
```

| Destino   | Ícono        | Etiqueta                         |
| --------- | ------------ | -------------------------------- |
| Home      | ◆ 24 px      | —                                |
| Library   | 24 px Lucide | Library                          |
| Records   | 24 px        | Records                          |
| Shadesmar | 24 px        | Shadesmar                        |
| Más       | 24 px        | Más → abre `/historical` + About |

Cada target: **56×56 px**, `min-height: 44px` garantizado. Icono solo con `aria-label` + `role="img"`; etiqueta visible a ≥768 px, oculta por debajo.

**Dropdown de Historical.** Panel de 320 px bajo la barra, con los 5 destinos en sus 2 columnas, cierre con `Esc` / clic fuera, navegación por flechas, `role="menu"`.

**Criterios de aceptación.**

| #   | Criterio                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------- |
| N.1 | En ≥1024 px los 4 destinos del núcleo + Historical son **enlazables**, con `aria-current` en el activo  |
| N.2 | Contraste de cada enlace de navegación **≥ 4,5:1** sobre `#0D1119` (medido, no estimado)                |
| N.3 | Todo target interactivo de la barra mide **≥ 44×44 px** (test Playwright sobre `getBoundingClientRect`) |
| N.4 | En <768 px la barra inferior tiene 5 destinos y **cero scroll horizontal** a 320 px                     |
| N.5 | No queda ningún `<div onClick>` en `src/app/` ni en `src/components/layout/` (grep = 0)                 |

---

### 5.2 Portada `/` — cuatro puertas al núcleo

**Decisión D-HOME.** Sustituye al índice de 10 capítulos con numerales a 1,46:1.

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        C O S M E R E   A R C H I V E                   │  48px
│        An archive of worlds, histories, and shattered ideals.           │  19px
│                                                                         │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│   │     📚       │ │      ⚗       │ │      🌊      │ │      ◈       │  │
│   │   LIBRARY    │ │   RECORDS    │ │  SHADESMAR   │ │  DIAGRAM     │  │
│   │ 22 volumes   │ │ 93 records   │ │ 103 souls    │ │ 118 events   │  │  ← contador REAL
│   │  9 series    │ │ 80 concepts  │ │ 12 realms    │ │ 11 eras      │  │
│   └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                                         │
│        ┌─────────────────────────────────────────────┐                 │
│        │  ARCHIVED  ·  Aharietiam · Ars Arcanum ·     │  ← banda tenue
│        │  Chronology · Mind Map                      │                 │
│        └─────────────────────────────────────────────┘                 │
└────────────────────────────────────────────────────────────────────────┘
```

**Layout.**

| BP  | Contenedor          | Título                 | Rejilla de puertas | Ancho de puerta    |
| --- | ------------------- | ---------------------- | ------------------ | ------------------ |
| M   | `calc(100% - 32px)` | `--text-h1` 36 px      | 1 columna × 4      | `calc(100% - 0px)` |
| T   | 640 px              | `--text-h1` 36 px      | 2×2                | 304 px             |
| D   | 1040 px             | `--text-display` 48 px | 4×1                | 244 px             |
| UW  | 1200 px             | `--text-display` 48 px | 4×1                | 282 px             |

**Cada puerta.** `<a>` real, no botón.

| Elemento            | Medida                                                                         | Token               |
| ------------------- | ------------------------------------------------------------------------------ | ------------------- |
| Tarjeta             | `padding: --space-xl` 32 px, `--radius-lg` 8 px, `--surface-base` `#0D1119`    | —                   |
| Borde               | 1 px `--border-subtle`; hover → `--border-interactive` `#5A6880` (3,35:1)      |                     |
| Sombra              | `--shadow-1`; hover `--shadow-2` (120 ms)                                      |                     |
| Ícono               | 40×40 px Lucide, `--text-accent` `#C8A96A` (8,40:1)                            |                     |
| Título              | `--text-h3` 22 px / 600, `--text-primary`                                      | **15,29**           |
| Contador principal  | `--text-h4` 18 px / 600, `--text-accent`, `font-variant-numeric: tabular-nums` | **8,40**            |
| Contador secundario | `--text-meta` 13 px, `--text-tertiary` `#8C97A8`                               | **6,40**            |
| Hover               | `translateY(-4px)`, `--shadow-2`, borde interactivo                            | `--dur-fast` 120 ms |
| Focus-visible       | anillo `--focus-color` `#7CC4E8` 2 px + 2 px offset (9,82:1)                   |                     |

**Los contadores son datos reales, no texto de relleno:** 22 (BOOKS.length), 93 (ALL_CHARACTERS.length), 103 = 93 + 10 Honorblades, 118 (TIMELINE_EVENTS.length). Se generan en build, no se escriben a mano.

**Banda Historical.** 1 fila, `--surface-inset` `#090C12`, `--radius-md` 4 px, `--text-micro` 12 px `--text-tertiary` (6,40:1), 5 enlaces separados por `·` de 4 px. En <768 px pasa a columna.

**Sin manuscrito, sin papel, sin madera.** La portada vive en el tema oscuro: es el índice, no una página de libro.

**Criterios de aceptación.**

| #   | Criterio                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------ |
| H.1 | Las 4 puertas son `<a href>` con destino válido (test Playwright de red: 0 × 404)                                  |
| H.2 | Los 4 contadores coinciden con `BOOKS.length`, `ALL_CHARACTERS.length`, suma+HONORBLADES, `TIMELINE_EVENTS.length` |
| H.3 | A 320 px: `document.documentElement.scrollWidth <= 320`                                                            |
| H.4 | `axe` (`wcag2aa` + `wcag22aa`) pasa sin violaciones                                                                |
| H.5 | Con `prefers-reduced-motion: reduce` las tarjetas son visibles en el primer frame                                  |
| H.6 | Lighthouse `/`: Performance ≥ 95, Accessibility = 100                                                              |

---

### 5.3 Biblioteca de Jasnah — portadas reales como lomos

**Decisión D-LIB.** Las 22 portadas existentes pasan a ser los lomos. Sustituye al fallback "círculo con 4 remaches" que hoy muestran 17 de 22 libros.

#### 5.3.1 El problema a resolver

Las portadas tienen **relaciones de aspecto distintas** (de 2:3 en `the_alloy_of_law.webp` 387×600 hasta 2:3 en `tress` 1600×2487) y tamaños de 46 KB a 883 KB. Un lomo de 40–90 px de ancho mostrado a altura completa mostraría la portada comprimida a ~13 % de su escala: el título sería ilegible.

**Solución en 3 capas por lomo.**

```
┌─ Lomo 56 px ──────────┐
│ ░░░░░░░░░░░░░░░░░░░░░ │ ← 1. FRANJA: recorte lateral de la portada real
│ ░░░  4 px  ░░░░░░░░░░ │    object-fit: cover; object-position por serie
│ ░░ T ░░░░░░░░░░░░░░░ │ ← 2. VEIL: overlay vertical al 55 %
│ ░░░░ O ░░░░░░░░░░░░░ │    para bajar el contraste de la imagen
│ ░░░ K ░░░░░░░░░░░░░░ │ ← 3. TIPO: título sobre el lomo, foil de la serie
│ ░░░░░ I ░░░░░░░░░░░░ │
│ ░░░░░░ D ░░░░░░░░░░░ │
└───────────────────────┘
```

| Capa                 | Técnica                                                                                                                                           | Valores                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 1. Franja de portada | `<div>` con `background-image` de `images/covers/{id}.webp`, `background-size: cover`, `background-position` según `series.crop`                  | `scale(1.9)` para que la franja lea el título |
| 2. Velo              | Overlay `linear-gradient(180deg, color-mix(in srgb, var(--series.ink) 45%, transparent), color-mix(in srgb, var(--series.ink) 72%, transparent))` | Baja la imagen a un rango controlable         |
| 3. Tipografía        | Título en vertical (`writing-mode: vertical-rl`) o en 2–4 líneas, `--text-ui` 14 px, `color: var(--series.foil)`, `text-shadow` de 1 px           | Legible sobre cualquier foto                  |

**Posición del recorte por serie** (`series.crop`, valores concretos):

| Serie               | `background-position` | Razon                                           |
| ------------------- | --------------------- | ----------------------------------------------- |
| `stormlight`        | `50% 18%`             | La franja del título está en el tercio superior |
| `mistborn-era-1`    | `50% 22%`             | Ídem                                            |
| `mistborn-era-2`    | `50% 20%`             | Ídem                                            |
| `elantris`          | `50% 15%`             | Título muy arriba                               |
| `warbreaker`        | `50% 25%`             | Centrado-alto                                   |
| `white-sand`        | `50% 16%`             | Título en el borde superior                     |
| `secret-projects`   | `50% 28%`             | Centrado                                        |
| `arcanum-unbounded` | `50% 20%`             | Centrado-alto                                   |

**Si una portada falla al cargar** (`onError`): el lomo pasa a `background: var(--series.ink)` + foil, sin franja. Nunca queda roto.

#### 5.3.2 Los 8 materiales (se mantienen, se limpian)

`BookSpine.tsx` ya define `MATERIALS` con 8 series. Se conservan los valores de cuero y foil, se **eliminan** las 10 capas de gradiente actuales y se reduce a 4:

| Capa      | Valor                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Base      | `linear-gradient(90deg, {dark} 0%, {base} 22%, {light} 42%, {base} 62%, {dark} 100%)`                                            |
| Curvatura | `linear-gradient(90deg, rgba(0,0,0,.55) 0%, transparent 16%, rgba(255,255,255,.045) 30%, transparent 52%, rgba(0,0,0,.50) 100%)` |
| Grano     | `repeating-linear-gradient(88deg, transparent, rgba(255,255,255,.003) .8px, transparent 1.6px)`                                  |
| Borde     | `0.5px solid {highlight}22`                                                                                                      |

**Token nuevo por serie: `ink`** — el color base con el que se vela la portada. Es lo que garantiza que la tipografía del lomo pase 4,5:1 **sobre la imagen**, no solo sobre un color plano.

#### 5.3.3 Layout de la estantería

| BP  | Columna lateral | Ancho útil            | Lomos/estante | Filas | Alto de lomo |
| --- | --------------- | --------------------- | ------------- | ----- | ------------ |
| M   | oculta          | `calc(100% - 32px)`   | 3–4           | 2     | 168 px       |
| T   | oculta          | `calc(100% - 48px)`   | 5–6           | 1     | 216 px       |
| D   | 56 px           | `calc(100% - 96px)`   | 6–7           | 1     | 264 px       |
| UW  | 72 px           | `--page-max` − 144 px | 7–8           | 1     | 300 px       |

**Correcciones obligatorias del bug actual:**

| Bug actual (`CosmereLibrary.tsx`)                                                                                                             | Corrección                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `availableWidth = containerWidth - 100` vs `px-24` (96×2 = 192) + `2 × columnWidth` (84) → **desbordamiento de 192 px** que recorta Dawnshard | `availableWidth = containerWidth - paddingX*2 - 2*columnWidth`, medido con `ResizeObserver` sobre el elemento real                                |
| `gap-36` (144 px) entre estanterías                                                                                                           | `--space-2xl` = **48 px**                                                                                                                         |
| `SideColumn` con `fontSize = clamp(7, 13, width*0.28)` → 12 px a 2557 px                                                                      | Título de serie a `--text-h3` 22 px horizontal sobre la balda en <1024 px; `--text-h4` 18 px vertical en ≥1024 px. **Nunca por debajo de 13 px.** |
| Anchos sin renormalizar tras `scale`                                                                                                          | Second pass: si `totalWidth > available`, `scale ×= 0.86` hasta que quepa o se pase a 2 filas. **Ningún lomo se recorta jamás.**                  |

#### 5.3.4 Profundidad (3 capas, con tokens)

| Capa             | Valor                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Fondo de sala    | `radial-gradient(ellipse 130% 90% at 45% 8%, #0B0D12, #06070A 70%)`                            |
| Fondo del hueco  | `linear-gradient(180deg, #0A0C11, #05060A 60%, #030407)`                                       |
| Sombra del hueco | `linear-gradient(180deg, rgba(0,0,0,.55), transparent 28%)` + `inset 0 0 120px rgba(0,0,0,.6)` |
| Polvo            | ≤ 24 partículas CSS, opacidad 0,04–0,10, deriva 18–26 s                                        |

**Textura de madera: SVG procedimental 512×512.** Sustituye a `wood-pattern.png` (203×317 px, estirado 13× a 2700 px). `feTurbulence baseFrequency="0.012 0.09" numOctaves="5"` + 12 vetas dibujadas + 4 nudos. Vectorial, ~4 KB, sin blur.

#### 5.3.5 Interacción

| Estado                   | Efecto                                                                   | Duración            |
| ------------------------ | ------------------------------------------------------------------------ | ------------------- |
| Hover                    | `translateY(-8px)`, `--shadow-2`, brillo `rgba(255,255,255,.06)` overlay | `--dur-fast` 120 ms |
| Focus-visible            | Anillo `--focus-color` 2 px + 2 px offset                                | inmediato           |
| Active                   | `translateY(-4px) scale(.99)`                                            | 80 ms               |
| Cargando                 | Silueta del lomo + shimmer 1400 ms en `--surface-raised`                 | —                   |
| Sin portada              | `background: var(--series.ink)` + foil, sin error                        | —                   |
| Vacío (serie sin libros) | 3 lomos fantasma + "No volumes in this series" `--text-meta`             | —                   |

**Teclado.** Cada lomo es `<button>` con `aria-label="The Way of Kings — Stormlight Archive, book 1 of 6"`. `←/→` recorren la estantería, `↑/↓` cambian de estantería, `Enter`/`Space` abren.

**Vista alternativa.** Toggle "Shelves / List" en la cabecera: la vista de lista da una tabla con portada, título, serie, año y palabras — accesible y buscable. Es el fallback cuando la estantería no aplica.

#### 5.3.6 Criterios de aceptación

| #    | Criterio                                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| B.1  | Los **22** lomos muestran una franja reconocible de su portada (`background-image` resuelta, sin 404)                        |
| B.2  | Contraste del título del lomo **≥ 4,5:1 sobre la franja real**, verificado con captura + muestreo de píxeles en las 8 series |
| B.3  | Ningún texto dentro de un lomo mide **< 11 px** (test Playwright sobre las 22 etiquetas)                                     |
| B.4  | A 375 / 768 / 1440 / 2560 px: `scrollWidth <= clientWidth` en el contenedor                                                  |
| B.5  | `dawnshard` (sin `wordCount`) tiene ancho **≥ 24 px** y es visible por completo                                              |
| B.6  | `gap` entre estanterías = **48 px** exactos (`getBoundingClientRect`)                                                        |
| B.7  | Los 22 libros aparecen en la estantería **y** en la vista de lista                                                           |
| B.8  | `axe` pasa en `/library` en los 4 breakpoints                                                                                |
| B.9  | Ningún fichero de `public/images/covers/` supera **220 KB** (variantes 400/800 px + AVIF)                                    |
| B.10 | Con el teclado se recorre la estantería completa sin ratón                                                                   |

---

### 5.4 Registros — sidebar + ficha de una columna

**Decisión D-REC.** Sustituye al libro de dos páginas de `ArchivalViewer` (136 px de estructura fija).

#### 5.4.1 Layout

| BP  | Índice                                 | Ficha                                                  | Gutter |
| --- | -------------------------------------- | ------------------------------------------------------ | ------ |
| M   | Drawer (botón 44×44 px en la cabecera) | `calc(100% - 32px)`, `--space-md` 16 px                | 0      |
| T   | 232 px fijo                            | `1fr`, `padding: --space-lg` 24 px                     | 16 px  |
| D   | 264 px fijo                            | `1fr`, `max-width: 780px`, `padding: --space-xl` 32 px | 20 px  |
| UW  | 288 px fijo                            | `1fr`, `max-width: 860px`, centrada                    | 24 px  |

Fondo de la página: `--surface-void` `#07090F`. La ficha es una tarjeta `--surface-base` `#0D1119`, `--radius-lg` 8 px, `--shadow-1`, `padding: --space-xl`.

**Sin `rotateY`, sin transformaciones 3D.** El texto no se desenfoca nunca.

#### 5.4.2 Índice A–Z

| Elemento                 | Medida                                                                      | Token              | Ratio                    |
| ------------------------ | --------------------------------------------------------------------------- | ------------------ | ------------------------ |
| Título `CHARACTER INDEX` | `--text-micro` 12 px, mayúsculas, tracking 0,14em                           | `--text-tertiary`  | **6,40**                 |
| Buscador                 | 40 px alto, texto `--text-body` 16 px                                       | `--text-primary`   | **15,29**                |
| Placeholder del buscador | `--text-meta` 13 px                                                         | `--text-secondary` | **9,89**                 |
| Letra de grupo (A, B, C) | `--text-meta` 13 px / 600                                                   | `--text-tertiary`  | **6,40**                 |
| Entrada                  | `--text-body` 16 px                                                         | `--text-primary`   | **15,29**                |
| Chip de planeta          | 11 px, `padding: 3px 8px`, fondo `--surface-inset`, punto del Shard 6 px    | `--text-secondary` | **8,15** sobre `#090C12` |
| Entrada activa           | fondo `--surface-raised`, marca 3 px `--text-accent`, `aria-current="true"` |                    |                          |
| Contador de entradas     | `--text-nano` 11 px, tabular-nums                                           | `--text-tertiary`  | **6,40**                 |
| Puntos guía              | `border-bottom: 1px dotted var(--border-subtle)`                            |                    |                          |

**Sustituye** la etiqueta de 10 px con opacidad 0,44 que hoy mide **2,21:1**.

#### 5.4.3 Ficha de personaje

| Elemento                            | Medida                                                               | Token                   | Ratio     |
| ----------------------------------- | -------------------------------------------------------------------- | ----------------------- | --------- |
| Running header                      | `--text-micro` 12 px, tracking 0,12em                                | `--text-tertiary`       | **6,40**  |
| Retrato / Monograma                 | 128×128 px, `--radius-sm` 2 px, borde 3 px `--text-accent`           |                         |           |
| Nombre                              | `--text-display` 48 px / 1.05                                        | `--text-primary`        | **15,29** |
| Epíteto                             | `--text-h4` 18 px italic                                             | `--text-secondary`      | **9,89**  |
| Chips de estado (Roshar · Deceased) | `--text-nano` 11 px, `--surface-inset`                               | `--text-secondary`      | **8,15**  |
| **Biografía**                       | `--text-body` 16 px / 1.65, `max-width: 68ch`                        | `--text-primary`        | **15,29** |
| Título de sección                   | `--text-h3` 22 px / 600                                              | `--text-primary`        |           |
| Etiqueta de campo                   | `--text-meta` 13 px, mayúsculas, tracking 0,1em, columna fija 140 px | `--text-tertiary`       | **6,40**  |
| Valor de campo                      | `--text-body-s` 15 px                                                | `--text-primary`        | **15,29** |
| Enlace / "ver también"              | `--text-body-s` underline                                            | `--text-link` `#7CC4E8` | **9,82**  |

**Separaciones:** entre secciones `--space-xl` 32 px · entre etiqueta y valor `--space-3xs` 2 px · entre campos `--space-sm` 12 px.

**Estructura de secciones** (densidad alta, D-DENS):

```
┌─ IDENTITY ────────────────────────────────────────────────┐
│  BORN              1475 FE · Hearthstone, Roshar           │
│  FIRST APPEARS     The Way of Kings (vol. 1, 2010)        │
│  STATUS            Deceased — Shadow Death                 │
│  CLASSIFICATION    Biographical Record · CA-KAL-0041      │
├─ INVESTITURE ─────────────────────────────────────────────┤
│  Surgebinding      Windrunner · Surges 1 & 2               │
│  Voidbinding       Bonded to one Honoring spren             │
├─ APPEARS IN ───────────────────────────────────────────────┤
│  ● The Way of Kings   ● Words of Radiance   ● Oathbringer │
├─ RELATIONSHIPS ────────────────────────────────────────────┤
│  Sylphrena         Nahel bond            → /records/syl…  │
│  Shallan           Ally · Bridge Four                     │
│  Adolin            Brother-in-arms                        │
├─ ALSO IN ──────────────────────────────────────────────────┤
│  [Kholin Dynasty]  [Bridge Four]  [Knights Radiant]        │
└────────────────────────────────────────────────────────────┘
```

`<dl>` semántico. Separador 1 px `--border-subtle` entre secciones. Todos los valores enlazables son `<a>`.

#### 5.4.4 Monogramas (D-DATA)

Sustituyen a los 69 retratos rotos.

```
┌────────────┐
│  ╱╲    ╱╲  │ ← adorno SpineOrnament al 18 %
│     KA     │ ← iniciales, --text-h1 36px, --text-primary
│  ╲╱    ╲╱  │
└────────────┘
  128×128, fondo: radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--shard-color) 18%, transparent), var(--surface-raised))
```

- Iniciales de hasta 2 letras, `letter-spacing: 0.05em`.
- Color del Shard del planeta como acento de anillo (todos ≥3:1 verificado).
- **93 monogramas únicos, 0 KB, 0 errores 404.**
- Si hay retrato (`public/characters/*.webp` y el nombre resuelve), se usa el retrato; si no, monograma. Nunca un hueco.

#### 5.4.5 Árbol genealógico y relaciones

El árbol vive **dentro de Registros**, no como ruta aparte (`/family-tree` ya redirige a `/characters?tab=bloodlines`).

- **Sub-vista "Bloodlines"**: árbol SVG expandible, generado con `computeGenealogyLayout()` extraído de los utils actuales. Navegable por teclado (nodos como `<button>` en el SVG), con búsqueda que resalta un linaje.
- **Sub-vista "Connections"**: grafo de relaciones de la ficha, no un mural. Cada nodo es un `<a>` con monograma + nombre.
- **Ambas se alimentan de la tabla de relaciones** (D-REL, §7.3), con objetivo de cobertura de los 93 personajes.

#### 5.4.6 Estados

| Estado                     | Comportamiento                                                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Carga                      | Esqueleto: bloque 48 px, 6 líneas de 16 px, bloque `<dl>` de 5 filas. Shimmer `--dur-ambient` 900 ms                                            |
| No existe                  | 404 real + `NotFound` con el nombre solicitado                                                                                                  |
| Sin relaciones             | "No recorded relationships." `--text-meta` `--text-tertiary`                                                                                    |
| Sin retrato                | Monograma (§5.4.4)                                                                                                                              |
| Spoiler activo y bloqueado | Nombre, retrato y origen visibles; el resto con `aria-hidden="true"` y replaced por un panel `--surface-inset` con borde `--border-interactive` |
| Búsqueda vacía             | `<EmptyState>` unificado: "No records match «x»" + botón "Clear search"                                                                         |

**Animación.** Cambio de ficha: crossfade `--dur-slow` 400 ms + `translateY(8px)`. Sin stagger (es un documento, no una lista).

**Criterios de aceptación.**

| #    | Criterio                                                                                              |
| ---- | ----------------------------------------------------------------------------------------------------- |
| R.1  | Cero peticiones 404 de imagen al navegar los **93** personajes (test Playwright de red)               |
| R.2  | A 375 px: `scrollWidth <= 375`                                                                        |
| R.3  | Las **93** fichas pasan `axe` (`wcag2aa` + `wcag22aa`)                                                |
| R.4  | El chip de planeta del índice mide **≥ 4,5:1** (antes ≈ 2,21:1)                                       |
| R.5  | El placeholder del buscador mide **≥ 4,5:1** (antes 1,68:1)                                           |
| R.6  | Cero `<div onClick>` en `src/features/records/`                                                       |
| R.7  | Los **93** personajes tienen **≥ 1** relación visible en su ficha                                     |
| R.8  | Con el modo spoiler activo y 0 libros leídos, nombre y origen visibles; el resto `aria-hidden="true"` |
| R.9  | El índice A–Z muestra las **93** entradas agrupadas A–Z                                               |
| R.10 | La navegación por teclado completa una ficha sin ratón                                                |
| R.11 | Ningún texto de la ficha mide **< 11 px**                                                             |

---

### 5.5 Shadesmar — Canvas 2D a pantalla completa

**Decisión D-SHD.** Zoom + arrastre + foco por perpendicularidad. Sin WebGL. Sin lista gemela como interfaz primaria.

#### 5.5.1 Calibración de cámara (el bug principal)

`Camera.ts:13-15` arranca en `zoom = 0.5` sobre un mundo de 1×1. Con `min(w,h) = 970`, la escala es 485 px/unidad y el clúster de Roshar (`radius: 0.14`) mide **136 px en una pantalla de 2557 px = 5,3 %**.

| Parámetro             | Antes                                   | Después                                                                    |
| --------------------- | --------------------------------------- | -------------------------------------------------------------------------- |
| Mundo                 | 1 × 1                                   | **2,4 × 1,6** (aspecto 3:2)                                                |
| `zoom` inicial        | `0.5` fijo                              | **`fitToViewport()`** = `0.82 / worldSpanY`, recalculado en cada `resize`  |
| Posiciones de clúster | 12 escritas a mano en `types.ts:95-116` | **Derivadas**: rejilla 4×3 con jitter determinista `±0.025` por `hash(id)` |
| Radio de constelación | 0.07–0.14 (irregular)                   | **0.19 × worldSpan, fijo**                                                 |
| Zoom range            | 0.3 – 5.0                               | 0.25 – 4.0                                                                 |
| Duración del vuelo    | 800 ms                                  | 800 ms `--ease-standard`                                                   |

**Resultado esperado:** con `fitToViewport`, las 12 perpendicularidades ocupan **≥ 65 % del menor lado del viewport** en cualquier resolución entre 360×640 y 3840×2160.

#### 5.5.2 Interacción

| Gesto                     | Desktop                                      | Móvil               | Valores                                  |
| ------------------------- | -------------------------------------------- | ------------------- | ---------------------------------------- |
| Desplazar                 | arrastrar con botón izq.                     | 1 dedo              | inercia 0,97, `touch-action: none`       |
| Zoom                      | rueda (`zoomAt`, foco en el cursor)          | pellizco de 2 dedos | factor 0,92 / 1,08 por paso              |
| Enfocar perpendicularidad | clic en el nombre                            | doble toque         | vuelo 800 ms + expansión 160 %           |
| Salir del foco            | `Esc` o clic en vacío                        | botón "Back"        | vuelo 600 ms al estado guardado          |
| Seleccionar alma          | clic                                         | toque               | radio 0.08 unidades, `CLICK_RADIUS` real |
| Ver ficha                 | doble clic / "View record →" en el inspector | botón               | → `/records/{id}`                        |

**Botones de HUD** (para quien no use gestos): `+` `−` `⌂` (vista general), 44×44 px, esquina inferior derecha, siempre visibles.

#### 5.5.3 Capa de información HTML (accesibilidad)

**Regla dura: cero `ctx.fillText`.** Toda la información vive en el DOM.

```
┌────────────────────────────────────────────────────────────┐
│ Shadesmar        103 souls · 12 realms      [ ⌕ ]          │ 56px, --surface-raised
├────────────────────────────────────────────────────────────┤
│                                                            │
│                      CANVAS (pointer events)               │
│                                                            │
│              ┌─ inspector ────────────────┐                │
│              │ ROSHAR              38    │ ← +28 px del
│              │ A realm of highstorms      │   abalorio
│              │ Bonded to Honor. …         │   NUNCA encima
│              │ [View record →]            │                │
│              └────────────────────────────┘                │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ ○ Roshar  ○ Scadrial  ○ Sel  ○ Nalthis  ○ Taldain …  [+] │ 48px
└────────────────────────────────────────────────────────────┘
```

**Inspector:** `<aside>` posicionado con `transform: translate()`, `max-width: 340px`, `--surface-raised` `#141A24` con `backdrop-filter: blur(12px)`, borde 1 px `--border-interactive`, `--shadow-3`, entrada `--dur-base` 220 ms.

| Elemento               | Medida                                       | Token                   | Ratio                     |
| ---------------------- | -------------------------------------------- | ----------------------- | ------------------------- |
| Nombre del mundo       | `--text-h4` 18 px / 600                      | `--text-primary`        | **14,13** sobre `#141A24` |
| Tipo + contador        | `--text-meta` 13 px                          | `--text-secondary`      | **9,14**                  |
| Descripción            | `--text-meta` 13 px / 1.5, `max-width: 34ch` | `--text-secondary`      | **9,14**                  |
| Enlace "View record →" | `--text-body-s` 15 px                        | `--text-link` `#7CC4E8` | **9,08**                  |

**Alternativa accesible:** un `<details>` "List all souls" en el HUD despliega una `<ul>` en el DOM con los **103** almas agrupadas por perpendicularidad, cada una un `<a>` a su ficha. Cerrado por defecto, no estorba a la vista.

**Leyenda deraud:** los 12 realms con su color, `--text-meta` 13 px, `--text-tertiary`. Sirve de índice navegable: cada realm es un `<button>` que hace `flyToFit`.

#### 5.5.4 Rendimiento (cambios concretos sobre el loop actual)

| Problema                                               | Corrección                                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `grid.rebuild(souls)` en cada frame (`Canvas.tsx:133`) | Reconstruir **solo** cuando un alma se mueve > `cellSize/4`                                            |
| `visible.sort()` por frame (`Renderer.ts:105`)         | Ordenar por capa **una vez** en la generación                                                          |
| Sin LOD                                                | 3 niveles: `zoom < 0.4` punto 1 px · `0.4–1.2` abalorio simple · `> 1.2` abalorio completo con fresnel |
| `Math.random()` en `initFog` + flag de módulo          | PRNG con semilla `mulberry32(0x5A4E)`, regenerado en `resize`                                          |
| `devicePixelRatio` sin tope                            | `Math.min(devicePixelRatio, 2)`                                                                        |
| `drawImage` de 6× radio siempre                        | Solo si `glow > 0.5` **y** `visible.length < 900`                                                      |

#### 5.5.5 Estados

| Estado             | Comportamiento                                                              |
| ------------------ | --------------------------------------------------------------------------- |
| Vacío (sin filtro) | Las 12 perpendicularidades visibles, 0 almas seleccionadas                  |
| Filtrado           | Las realms sin coincidencias bajan a `opacity 0.28` (`--dur-base`)          |
| Sin resultados     | Panel DOM: "No souls match «x»" + "Clear"                                   |
| Hover              | Abalorio `scale 1.18`, halo `--text-link`, etiqueta a +14 px (`--dur-fast`) |
| Selección          | Inspector abierto, resto a `opacity 0.35`                                   |
| Reduce-motion      | Sin deriva de partículas ni auto-rotación; la exploración sigue operativa   |

**Criterios de aceptación.**

| #    | Criterio                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------ |
| S.1  | `window.__shadesmar.bounds()` ocupa **≥ 65 % del menor lado** del viewport en 5 resoluciones (360×640 … 3840×2160) |
| S.2  | Cero llamadas a `fillText`/`strokeText` en `src/features/shadesmar/` (grep = 0)                                    |
| S.3  | El `<details>` "List all souls" expone **103** `<a>` en el DOM (Playwright `ariaSnapshot`)                         |
| S.4  | Frame time p95 **< 16 ms** con 1.200 almas (script en CI)                                                          |
| S.5  | A 375 px: pellizco cambia el zoom, 1 dedo desplaza, doble toque enfoca                                             |
| S.6  | El inspector nunca se solapa con un abalorio (offset ≥ 28 px, verificado por captura)                              |
| S.7  | Cero llamadas a `Math.random()` en el bucle de render                                                              |
| S.8  | `axe` pasa en `/shadesmar`                                                                                         |
| S.9  | Los botones `+` `−` `⌂` miden ≥ 44×44 px                                                                           |
| S.10 | Los 12 realms de la leyenda son navegables por teclado                                                             |

---

### 5.6 Diagrama de Taravangian — mural clicable

**Decisión D-DIA.** El mural se conserva pero deja de ser decorativo.

#### 5.6.1 Layout

```
┌──────────────────────────────────────────────────────────────┐
│ ← Back      THE DIAGRAM                        [ ⟳ ] [ ⌕ ]  │ 56px
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ╔════════════╗                                              │
│   ║ prophecy 3 ║                          ┌─ panel ───────┐  │
│   ╚════════════╝   ╔═════════╗            │ TITLE         │  │
│                    ║ sheet 5 ║  → clic     │ ─────────     │  │ 360px
│      ╔═══════╗     ╚═════════╝            │ BODY 16px     │  │
│      ║ 11/1  ║                            │ ─────────     │  │ Panel
│      ╚═══════╝         ╔══════╗            │ [Open →]     │  │ fijo
│                        ║ 07/2 ║            └───────────────┘  │ derecha
│                        ╚══════╝                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

| BP  | Mural                                 | Panel de lectura                         |
| --- | ------------------------------------- | ---------------------------------------- |
| M   | Scroll vertical, 1 columna de papeles | Sheet inferior a pantalla completa, 88vh |
| T   | 2–3 columnas                          | 360 px fijo a la derecha                 |
| D   | Rejilla 3×3 escalable                 | 360 px fijo                              |
| UW  | Rejilla 3×3, `--page-max` centrado    | 400 px fijo                              |

#### 5.6.2 Correcciones del mural actual

`DiagramScene.tsx` coloca 9 documentos (`WALL_DOCS`) en un rango de 400–3600 × 800–4100 con rotaciones de −18° a +22°, sobre `DiagramBackground` (ladrillo). A `initialScale 0.5` el contenido mide 2500 px en 2557 px de pantalla, sin punto focal y con fórmulas de 7–8 px.

| Cambio                    | Valor                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Escala inicial            | `fitToViewport()` como Shadesmar (`0.82 / worldSpan`)                                                                                         |
| Zoom                      | 0,4 – 2,5 · arrastre con inercia 0,9                                                                                                          |
| Formato de documento      | A–5 (210×297): portada 12 px de margen, título `--text-h3` 22 px, cuerpo `--text-body-s` 15 px, fórmula `--text-mono` 13 px `--text-tertiary` |
| Rotación                  | −6° … +6° (de −18…+22)                                                                                                                        |
| **Z-order por document**  | Orden alfabético fijo, no aleatorio: el orden de lectura es determinista                                                                      |
| Hover                     | `translateY(-6px)`, `--shadow-2`, `cursor: pointer`, borde 2 px `--border-interactive`                                                        |
| Foco                      | Cada papel es un `<button>` con `aria-label="Prophecy sheet 3: …"` y anillo de foco visible                                                   |
| Tamaño mínimo en pantalla | **220×310 px** (si `fitToViewport` no lo permite, se ofrece zoom automático al enfocar)                                                       |

**El papel se lee de verdad:** el texto del documento vive en el DOM (el SVG/canvas es solo el fondo de papel y las fórmulas). Click en el papel → panel lateral con el texto a `--text-body` 16 px y `max-width: 52ch` (9,89:1 sobre `#141A24`).

**Contenido.** Los 9 documentos existentes (`DiagramWritings.tsx`, 37 KB) se conservan como contenido y se les añade un enlace a los registros y eventos relacionados (`→ /records/hoid`, `→ /chronology?event=…`).

#### 5.6.3 Estados

| Estado                         | Comportamiento                                                  |
| ------------------------------ | --------------------------------------------------------------- |
| Carga                          | "Reconstructing the mural…" `--text-body` centrado + 9 siluetas |
| Vacío (búsqueda sin resultado) | `<EmptyState>`: "No sheet matches «x»" + Clear                  |
| Sin selección                  | Panel muestra el índice de los 9 documentos, 12 px de margen    |
| Hover de un papel              | Vista previa del título en el panel, sin cambiar la selección   |
| Reduce-motion                  | Sin paralaje, sin partículas; el pan sigue manual               |

**Criterios de aceptación.**

| #   | Criterio                                                                                 |
| --- | ---------------------------------------------------------------------------------------- |
| D.1 | Los **9** documentos son `<button>` alcanzables por teclado con `aria-label`             |
| D.2 | El texto de cada documento mide **≥ 13 px** y su contraste es **≥ 4,5:1** (antes 7–8 px) |
| D.3 | Al enfocar un documento, su alto en pantalla es **≥ 310 px**                             |
| D.4 | El panel de lectura tiene `--text-body` a 16 px con `max-width: 52ch`                    |
| D.5 | Cada documento enlaza a **≥ 1** registro del archivo                                     |
| D.6 | A 375 px el mural es usable y el panel ocupa 88vh                                        |
| D.7 | `axe` pasa en `/taravangian`                                                             |
| D.8 | `Math.random()` = 0 en el componente (las posiciones son deterministas)                  |

---

### 5.7 Historical Archive — `/historical`

**Decisión D-HIST.** Una sola ruta con índice, no cinco rutas sueltas.

```
┌────────────────────────────────────────────────────────────────┐
│  ⟵ Back to archive                                              │
│  H I S T O R I C A L   A R C H I V E                            │ 48px
│  Preserved sections of the archive, kept in their original form.│ 19px
│                                                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   ⚔  Aharietiam │ │  ✦  Ars Arcanum │ │  ⧗  Chronology  │   │
│  │  10 honorblades │ │  49 systems     │ │  118 events     │   │
│  ├─────────────────┤ ├─────────────────┤ ├─────────────────┤   │
│  │   ◈  Mind Map   │ │  ℹ  About       │ │                 │   │
│  │  archive-wide   │ │  the project    │ │                 │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

| BP  | Rejilla                  |
| --- | ------------------------ |
| M   | 1 columna, 5 tarjetas    |
| T   | 2 columnas               |
| D   | 3 columnas               |
| UW  | 3 columnas, `--page-max` |

**Las 5 secciones conservan su implementación actual** y solo cambian: el contenedor de layout, la cabecera y el breadcrumb. Cada una recibe una **nota de estado** visible (12 px, `--text-tertiary`) que dice si está mantenida o es legado. Honesto y sin marketing.

**Rutas.** Las 5 rutas viejas (`/aharietiam`, `/mind-map`, `/magic`, `/chronology`, `/about`) **se mantienen** y redirigen con `replace` a su versión bajo `/historical/*`, para no romper enlaces externos.

**Criterios de aceptación.**

| #   | Criterio                                                                       |
| --- | ------------------------------------------------------------------------------ |
| A.1 | `/historical` lista las 5 secciones con contador real y enlace válido          |
| A.2 | Las 5 rutas viejas redirigen a su destino nuevo (HTTP 200 tras la redirección) |
| A.3 | Cada sección de Historical muestra una nota de estado legible (≥ 4,5:1)        |
| A.4 | El breadcrumb marca `Historical Archive` como ancestro en las 5                |
| A.5 | `axe` pasa en `/historical` y en las 5 subrutas                                |

---

### 5.8 Búsqueda global — índice real

**Decisión D-SEARCH.** MiniSearch (8 KB gzip, Apache-2.0).

**Motor.** `minisearch` v7, índice generado en build por `scripts/generate-search-index.ts` → `src/data/search-index.json` (~400 documentos).

```
SearchDoc { id, route, type, title, subtitle, body, aliases[], boost }
```

**Interfaz.** `<dialog>` nativo (foco atrapado, `Esc` e `inert` de fondo, gratis).

| Elemento               | Medida                                                                   | Token              | Ratio     |
| ---------------------- | ------------------------------------------------------------------------ | ------------------ | --------- |
| Dialog                 | `min(640px, calc(100vw - 32px))`, `--shadow-3`                           | `--surface-raised` |           |
| Input                  | `--text-body` 16 px, `autofocus`                                         | `--text-primary`   | **14,13** |
| Rol                    | `combobox` + `aria-expanded` + `aria-controls` + `aria-activedescendant` |                    |           |
| Resultados             | `<ul role="listbox">`, `<li role="option" aria-selected>`                |                    |           |
| Título del resultado   | `--text-body` 16 px                                                      | `--text-primary`   | **14,13** |
| Subtítulo              | `--text-meta` 13 px                                                      | `--text-tertiary`  | **5,91**  |
| Resaltado              | `<mark>` fondo `--text-accent` `#C8A96A`, texto `#0D1119`                |                    | **8,40**  |
| Separador de categoría | `--text-nano` 11 px, mayúsculas                                          | `--text-tertiary`  | **5,91**  |
| Empty                  | "No matches for «x». Try a character, planet, or book." + 3 sugerencias  | `--text-body`      |           |

- Debounce **120 ms**. Placeholder **fijo** (se elimina el `setInterval` que hoy re-renderiza 4× cada 4 s).
- Máximo 12 resultados visibles, agrupados por tipo con separadores.
- Atajos: `Ctrl/Cmd+K` abre · `↑/↓` mueve · `Enter` navega · `Esc` cierra. `/` enfoca el buscador local.

**Rutas corregidas** (hoy 3 de 7 categorías apuntan a rutas equivocadas):

| Tipo      | Hoy                                     | Después                            |
| --------- | --------------------------------------- | ---------------------------------- |
| Libro     | `/celestial-charts?focus=book&id=X` ❌  | `/library?book=X`                  |
| Magia     | `/magic` ❌ (pierde el sistema)         | `/historical/ars-arcanum?system=X` |
| Personaje | `/celestial-charts?focus=character&…` ⚠ | `/records/{id}`                    |
| Evento    | `/celestial-charts?focus=event&id=X` ⚠  | `/historical/chronology?event=X`   |
| Planeta   | `/celestial-charts?focus=planet&id=X` ⚠ | `/shadesmar?realm=X`               |
| Herald    | `/aharietiam` ⚠                         | `/historical/aharietiam?h=X`       |

**Criterios de aceptación.**

| #   | Criterio                                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------- |
| Q.1 | `kaz` → Kaladin · `preserv` → Preservation · `saz` → Sazed · `tall` → Talenel                                              |
| Q.2 | Las **~400** entidades son alcanzables por búsqueda                                                                        |
| Q.3 | Los 12 primeros resultados de cada categoría devuelven HTTP 200 (test Playwright de red)                                   |
| Q.4 | Tiempo de búsqueda **< 5 ms** para 400 documentos                                                                          |
| Q.5 | El placeholder **no cambia** en 60 s sin interacción                                                                       |
| Q.6 | El chunk principal `index.js` ≤ **180 KB gzip**                                                                            |
| Q.7 | `axe` pasa: roles `combobox`/`listbox`/`option` correctos, foco atrapado, `Esc` cierra, foco restaurado al elemento origen |

---

### 5.9 Responsive — móvil como versión propia

**Decisión D-MOB.** No es un reducto.

| Pieza          | M (<768)                                                | T (768–1023)      | D (1024–1439)                 | UW (≥1440)                    |
| -------------- | ------------------------------------------------------- | ----------------- | ----------------------------- | ----------------------------- |
| **Navegación** | Barra inferior 5 destinos, 64 px                        | Barra superior    | Barra superior                | Barra superior                |
| **Portada**    | 1 columna                                               | 2×2               | 4×1                           | 4×1, más ancha                |
| **Biblioteca** | 2 filas/estante, sin columna, lomos 168 px              | 5–6 lomos, 1 fila | 6–7 + columna 56 px           | 7–8 + columna 72 px           |
| **Registros**  | 1 columna + drawer de índice                            | Índice 232 px     | Índice 264 px, lectura 780 px | Índice 288 px, lectura 860 px |
| **Shadesmar**  | HUD colapsado, gestos táctiles, botones `+/−/⌂` siempre | Completo          | Completo                      | Completo, mundo más amplio    |
| **Diagrama**   | Scroll 1 columna, panel 88vh                            | 360 px            | 360 px                        | 400 px                        |

**Reglas globales (verificables).**

| Regla              | Valor                                                                |
| ------------------ | -------------------------------------------------------------------- |
| Altura             | `100dvh`, **nunca** `100vh` (el bug actual está en `Layout.tsx:82`)  |
| Scroll horizontal  | Cero a 320 px en las 9 rutas                                         |
| Target táctil      | ≥ 44×44 px (WCAG 2.2 SC 2.5.8)                                       |
| Safe area          | `viewport-fit=cover` + `env(safe-area-inset-*)` en la barra inferior |
| Gutter             | 20 px (M) · 32 px (T) · 48 px (D)                                    |
| Zoom táctil        | **Obligatorio** en Shadesmar (hoy solo existe `onWheel`)             |
| `devicePixelRatio` | Limitado a 2 en canvas                                               |
| Formularios        | 16 px mínimo en inputs (evita el zoom automático de iOS)             |

**Criterios de aceptación.**

| #   | Criterio                                                                   |
| --- | -------------------------------------------------------------------------- |
| M.1 | `document.documentElement.scrollWidth <= 320` en las **9** rutas a 320×640 |
| M.2 | Todos los targets interactivos ≥ 44×44 px (test automático)                |
| M.3 | Shadesmar responde a pellizco en un viewport emulado de 375 px             |
| M.4 | Ningún input tiene `font-size < 16px`                                      |
| M.5 | `axe` pasa en las 9 rutas a 375 px                                         |

---

## 6. Decisión de stack

### 6.1 Comparativa

| Criterio                                  | **React 19 + Vite 8 + TS 6 + Tailwind 4**                | Astro 5 (static)                                                                  | SvelteKit (adapter-static)   | Next.js (output export)                                   |
| ----------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------- |
| Despliegue gratis en GH Pages             | ✅                                                       | ✅                                                                                | ✅                           | ⚠️ `output:'export'` sin Image Optimization ni middleware |
| Coste de migración desde el código actual | **0**                                                    | Alto (hay ~37.000 líneas de componentes React; `@react-three/*`, hooks, contexto) | Muy alto (reescritura total) | Alto                                                      |
| Ecosistema de librería 3D                 | ✅ R3F ya instalado                                      | ⚠️ islands por componente                                                         | ❌ sin soporte nativo        | ✅                                                        |
| Sistema de diseño con Tailwind            | ✅ ya instalado                                          | ✅                                                                                | ✅                           | ✅                                                        |
| Bundle JS inicial                         | ⚠️ 70 KB gzip (vendor+index)                             | ✅ mínimo                                                                         | ✅ mínimo                    | ⚠️ mayor                                                  |
| Prerendering / SSG por ruta               | ⚠️ manual                                                | ✅ nativo                                                                         | ✅ nativo                    | ✅ nativo                                                 |
| Bundle de datos por ruta                  | ⚠️ monolith (70,7 KB `characters.json` en el chunk raíz) | ✅ por ruta                                                                       | ✅ por ruta                  | ✅ por ruta                                               |
| `pnpm test` + Vitest actual               | ✅ 203 tests válidos                                     | ❌ hay que migrar Testing Library                                                 | ❌ hay que migrar            | ❌ hay que migrar                                         |
| Plazo de migración                        | **0**                                                    | medio                                                                             | alto                         | medio                                                     |

| Veredicto | ✅ **GANADOR** | viable pero no justificado | ❌ | ❌ |

### 6.2 Recomendación

**Mantener React 19 + Vite 8 + TypeScript 6 + Tailwind 4.**

**Motivos:**

1. **El problema es de diseño, no de arquitectura.** Cambiar de framework reescribe 37.000 líneas para volver a tener el mismo problema.
2. **Se conservan los 203 tests.** `data-integrity.test.ts` (43 tests) es un activo de calidad de datos que no depende del framework de render.
3. **El presupuesto de 0 € y el objetivo de GitHub Pages** se cumplen hoy.
4. **Astro no ayuda donde más duele.** El dolor es contraste, escala tipográfica, placeholders y calibración de cámara. Astro solo mejoraría el TTI, que **no está en el top 5 de problemas medidos**.
5. **R3F ya está instalado y testeado** para Aharietiam.

**Lo que sí cambia (dentro del stack actual):**

- **Pre-render de las rutas de contenido en build** (ver §9.2) — resuelve el problema del `characters.json` monolith sin cambiar de framework.
- **Separación correcta de chunks** (`three` en su propio chunk, `datos` por dominio).
- **Eliminar 223 KB de código muerto.**

### 6.3 Alternativa considerada: pre-render sin cambiar de framework

Como Astro no aporta, se implementa **pre-rendering estático** dentro de Vite con un plugin propio (§9.2). Beneficios:

- HTML estático por ruta → TTI improvement, SEO real, funciona sin JS.
- Los 70,7 KB de `characters.json` se inyectan **por ruta**, no en el chunk raíz.
- `sitemap.xml` se **genera** desde las mismas rutas (arreglando el dominio y las rutas muertas de golpe).

Coste: ~150 líneas de plugin. Coste cero en licences.

### 6.4 Librerías

| Necesidad           | Elección                              | Licencia               | Tamaño gz                 | Justificación                                                                                                                                                                    |
| ------------------- | ------------------------------------- | ---------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | --- | --------------- | ------------------------------------------------ |
| Bundle / dev        | **Vite 8** (actual)                   | MIT                    | —                         |                                                                                                                                                                                  |
| Framework           | **React 19** (actual)                 | MIT                    | —                         |                                                                                                                                                                                  |
| Estilos             | **Tailwind 4** (actual)               | MIT                    | —                         | Ya instalado; migrar los `style={{}}` inline a clases/vars                                                                                                                       |
| Animación DOM       | **CSS + tokens de duración** (§4.6)   | —                      | **0 KB**                  | D-MOTION fija una escala de 4 duraciones; el CSS cubre micro-estados, entradas y transiciones de zona. framer-motion solo si un gesto de Shadesmar lo justifica, y se carga lazy | `^12` | MIT | **+38 KB** lazy | Solo para paneles/modales; el CSS cubre el resto |
| Animación 3D        | **GSAP 3** (actual)                   | GSAP Standard (gratis) | +24 KB lazy               | Ya usado en Aharietiam                                                                                                                                                           |
| Estado global       | **Ninguna librería**                  | —                      | 0 KB                      | Contexto + `useSyncExternalStore`; Zustand añadiría 3 KB para 6 valores                                                                                                          |
| Estado servidor     | **Ninguna**                           | —                      | —                         | Sin API                                                                                                                                                                          |
| Búsqueda local      | **MiniSearch** `^7`                   | Apache-2.0             | **+8 KB**                 | D-SEARCH; §5.8                                                                                                                                                                   |       |
| Shadesmar           | **Canvas 2D nativo**                  | —                      | 0 KB                      | D-SHD; §5.5                                                                                                                                                                      |       |
| 3D Aharietiam       | **Three.js + R3F** (actual)           | MIT                    | 227 KB gz, lazy           | Un solo caso de uso                                                                                                                                                              |
| Fuentes             | **@fontsource-variable**              | OFL-1.1                | ~60 KB woff2, self-hosted | Sin Google Fonts CDN                                                                                                                                                             |
| Iconos              | **Lucide**                            | ISC                    | **+2 KB** tree-shaken     | Sustituye `icons.tsx` + `icons.svg` (confirmado)                                                                                                                                 |       |
| Validación de datos | **Zod** `^3`                          | MIT                    | **+13 KB** (solo build)   | Genera los tipos desde el esquema                                                                                                                                                |
| Testing e2e         | **Playwright** (actual)               | Apache-2.0             | —                         | Añadir a CI                                                                                                                                                                      |
| Accesibilidad       | **axe-core** + `@axe-core/playwright` | MPL-2.0                | dev-only                  | Auditoría automática                                                                                                                                                             |
| Lighthouse CI       | **@lhci/cli**                         | Apache-2.0             | dev-only                  | Presupuesto de rendimiento                                                                                                                                                       |
| Faker               | **@faker-js/faker**                   | MIT                    | dev-only                  | Generar datos de prueba                                                                                                                                                          |

**Dependencias a eliminar:** `d3-force` (13,3 KB raw; solo lo usan `ForceGraph.tsx` y `PlanetForceGraph.tsx`, ambos en subárboles muertos), `framer-motion` no está actualmente (bueno), `vite-plugin-pwa` se mantiene.

**Presupuesto de dependencias nuevas: ~61 KB gzip, todas lazy salvo MiniSearch.**

---

## 7. Modelo de datos y contenido

### 7.1 Principio rector

**El contenido se amplía sin tocar código.** Un `content/` con ficheros por entidad, validados contra JSON Schema en CI, y un `pnpm content:new` que genera un esqueleto.

### 7.2 Estructura

```
content/
├─ schema/
│  ├─ common.schema.json
│  ├─ book.schema.json
│  ├─ character.schema.json
│  ├─ concept.schema.json
│  ├─ planet.schema.json
│  ├─ shard.schema.json
│  ├─ hero.schema.json
│  ├─ magic-system.schema.json
│  ├─ relationship.schema.json
│  ├─ event.schema.json
│  ├─ family.schema.json
│  └─ index.schema.json
├─ shards/
│  └─ honor.json  cultivation.json odium.json … (18 Shards)
├─ planets/
│  └─ roshar.json scadrial.json sel.json nalthis.json taldain.json
│     lumar.json komashi.json canticle.json threnody.json
│     first-of-the-sun.json yolen.json
├─ series/                    ← NUEVO: sustituye a SAGAS + series de lomos
│  └─ stormlight.json mistborn-era-1.json mistborn-era-2.json
│     elantris.json warbreaker.json white-sand.json
│     secret-projects.json arcanum-unbounded.json
├─ books/
│  └─ the-final-empire.json … (22)
├─ characters/
│  └─ kaladin.json … (objetivo 150+)
├─ concepts/                  ← NUEVO: la entidad que falta hoy
│  ├─ allomancy.json stormlight.json shard.json soulcasting.json
│  ├─ feruchemy.json hemalurgy.json metalminds.json … (objetivo 80+)
├─ heroes/                    ← NUEVO (Heralds + Knights + Shards)
│  └─ jezrien.json talenel.json nal.json …
├─ magic-systems/
│  └─ allomancy.json surgebinding.json old-magic.json … (49)
├─ relationships/             ← NUEVO: tabla normalizada
│  └─ relationships.json      (1 fichero, 400+ aristas)
├─ events/
│  └─ events.json             (118+)
├─ eras/    eras.json
├─ families/ families.json
└─ meta/
   ├─ contributors.json
   └─ field-notes.json        (notas de Khriss, 94)
```

### 7.3 Esquemas (extracto; los completos en `content/schema/`)

#### `book.schema.json`

```json
{
  "$id": "book",
  "type": "object",
  "required": ["id", "title", "series", "order", "summary"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$" },
    "title": { "type": "string", "minLength": 1, "maxLength": 120 },
    "subtitle": { "type": "string", "maxLength": 200 },
    "series": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "order": { "type": "integer", "minimum": 1 },
    "volume": { "type": ["integer", "null"] },
    "published": { "type": "integer", "minimum": 2005, "maximum": 2035 },
    "wordCount": { "type": ["integer", "null"], "minimum": 40000, "maximum": 600000 },
    "pages": { "type": ["integer", "null"] },
    "summary": { "type": "string", "minLength": 200, "maxLength": 900 },
    "setting": { "type": "array", "items": { "$ref": "planet" }, "minItems": 1 },
    "characters": { "type": "array", "items": { "$ref": "character" } },
    "magic": { "type": "array", "items": { "$ref": "magic-system" } },
    "cover": { "$ref": "common.asset" },
    "spineArt": { "$ref": "common.ornament" },
    "spoilerLevel": { "enum": ["none", "light", "heavy"], "default": "light" },
    "status": { "enum": ["published", "announced", "in-progress", "unreleased"] }
  }
}
```

#### `character.schema.json` (extracto)

```json
{
  "required": ["id", "name", "summary", "origin", "firstAppearance"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$" },
    "name": { "type": "string", "minLength": 1 },
    "aliases": { "type": "array", "items": { "type": "string" }, "maxItems": 6 },
    "pronunciation": { "type": "string" },
    "summary": { "type": "string", "minLength": 200, "maxLength": 900 },
    "origin": { "$ref": "planet" },
    "roles": {
      "type": "array",
      "items": {
        "enum": [
          "poet",
          "scholar",
          "soldier",
          "noble",
          "mistborn",
          "radiant",
          "herald",
          "shard",
          "worldhopper",
          "sculptor",
          "reporter",
          "smuggler",
          "spouse",
          "parent",
          "child",
          "mentor",
          "student",
          "enemy",
          "ally",
          "other"
        ]
      }
    },
    "status": { "enum": ["living", "deceased", "unknown", "transformed"] },
    "born": { "type": ["integer", "null"] },
    "died": { "type": ["integer", "null"] },
    "firstAppearance": { "type": "array", "items": { "$ref": "book" }, "minItems": 1 },
    "portrait": { "$ref": "common.asset" },
    "unlockAt": { "type": "array", "items": { "$ref": "book" } },
    "families": { "type": "array", "items": { "$ref": "family" } },
    "magic": { "type": "array", "items": { "$ref": "magic-system" } },
    "alsoKnownAs": { "type": "array", "items": { "$ref": "concept" } }
  }
}
```

**Campos nuevos frente al modelo actual:** `aliases`, `roles`, `status` (hoy implícito), `born`/`died` (hoy solo en `CHARACTER_SPANS`, en otro fichero → **desnormalización que causa la incoherencia de 52 vs 93**), `portrait` explícito (elimina la heurística `normalizeName()` y los 69 404), `unlockAt` (renombra `requiredBooks` con semántica clara).

#### `concept.schema.json` — **la entidad que hoy no existe**

```json
{
  "required": ["id", "name", "category", "summary"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "aliases": { "type": "array", "items": { "type": "string" } },
    "category": {
      "enum": ["metaphysics", "people", "places", "objects", "cultures", "languages", "history", "creatures", "terms"]
    },
    "summary": { "type": "string", "minLength": 150, "maxLength": 800 },
    "detail": { "type": "string", "maxLength": 3000 },
    "origin": { "$ref": "planet" },
    "shard": { "$ref": "shard" },
    "firstAppearance": { "type": "array", "items": { "$ref": "book" } },
    "related": { "type": "array", "items": { "$ref": "concept" } },
    "seeAlso": { "type": "array", "items": { "type": "string" } },
    "unlockAt": { "type": "array", "items": { "$ref": "book" } }
  }
}
```

**Objetivo: 80 conceptos** cubriendo las 9 categorías. Ejemplos: Shattering, Shard, Honor, Odium, Cultivation, Preservation, Ruin, Harmony, Autonomy, Allomancy, Feruchemy, Hemalurgy, Soulcasting, Surgebinding, Voidbinding, Old Magic, Stormlight, Spren, Nahel bond, Listeners, Radiants, Knights Radiant, Unmade, Fused, Ghostbloods, Voidspren, Shardblades, Oathpulse, Highstorm, Everstorm, Parshmen, Pattern, Sympathy, Awakening, Forgery, Ruin, Realmatic, Elantrian script, Irial, Alethi, Vorin, Windsreach, Stormseat, Urithiru, Kholin, Hoid, Adonalsium, Shattering of Adonalsium, Dawnshard, Nightblood, Sibling, Yspren, Divine…

#### `relationship.schema.json` — tabla normalizada

```json
{
  "type": "object",
  "required": ["id", "from", "type", "to"],
  "properties": {
    "id": { "type": "string", "pattern": "^rel-[a-z0-9-]+$" },
    "from": { "type": "string" },
    "to": { "type": "string" },
    "type": {
      "enum": [
        "parent",
        "child",
        "spouse",
        "sibling",
        "mentor",
        "student",
        "ally",
        "enemy",
        "rival",
        "bonded",
        "commander",
        "subordinate",
        "creator",
        "creation",
        "member",
        "leader",
        "heir"
      ]
    },
    "label": { "type": "string", "maxLength": 60 },
    "kind": { "enum": ["character", "concept", "family", "planet", "book", "group"], "default": "character" },
    "firstAppearance": { "type": "array", "items": { "$ref": "book" } },
    "weight": { "type": "number", "minimum": 0, "maximum": 1, "default": 0.5 }
  }
}
```

**Objetivo: 400+ aristas**, cubriendo los 68 personajes que hoy no tienen ninguna y los 80 conceptos nuevos. `weight` alimenta el grosor de las aristas en el diagrama y el Shadesmar.

### 7.4 Migración del contenido existente

| Origen                                                                    | Destino                                                | Acción                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data/static/books.ts`                                                    | `content/books/*.json` (22)                            | **Conservar las sinopsis** (son el mejor activo textual del repo). Añadir `cover`, `setting`, `characters`, `magic`, `spoilerLevel`, `volume`.                                                                                                                           |
| `data/generated/characters.json` (93)                                     | `content/characters/*.json` (93)                       | **Conservar las descripciones** (443–798 chars, calidad alta). Añadir `aliases`, `roles`, `status`, `born`/`died` (fusionar `CHARACTER_SPANS`), `portrait` explícito, `families`. **Corregir**: D10 (Navani/Gavilar), D4 ("The …"), los 10 nombres de retrato huérfanos. |
| `data/static/planets.ts` (11)                                             | `content/planets/*.json` (11)                          | Conservar. Añadir `shardRefs[]` (array, no string), `region`, `population`, `aliases`. **Eliminar** `x`, `y`, `size` (posiciones de un mapa 2D que se va a rediseñar) y `color` hardcodeado (pasar a token de Shard).                                                    |
| `data/static/sagas.ts` (9)                                                | `content/series/*.json` (8)                            | **Renombrar**: `Sagas` (narrativas) ≠ `Series` (agrupación de lomos). `stormlight` como saga se elimina; solo queda como serie. `color` pasa de `'red'` a hex validado.                                                                                                  |
| `data/static/magic-systems.ts` (49 + 12 metales)                          | `content/magic-systems/*.json`                         | **Conservar intacto** — el bloque de datos más estructurado del repo.                                                                                                                                                                                                    |
| `data/static/static-data.ts` (41 relaciones)                              | `content/relationships/relationships.json`             | Expandir a 400+. Eliminar `CHARACTER_SPANS` fusionando en `characters`.                                                                                                                                                                                                  |
| `data/static/timeline/*` (118 eventos, 11 eras, 52 spans, 5 worldhoppers) | `content/events/events.json`, `content/eras/eras.json` | **Conservar**. Fusionar `CHARACTER_SPANS` en `characters`. Eventos ganan `relatedEntities[]`.                                                                                                                                                                            |
| `data/static/aharietiam.ts` (10)                                          | `content/heroes/herald-*.json`                         | **Conservar** (tiene `attributes`, `essence`, `soulcasting`, `honorbladeGrants`). Los Heralds pasan a `heroes` junto a Radiants y Shards.                                                                                                                                |
| `data/static/family-data.ts` (7)                                          | `content/families/families.json`                       | Conservar, corregir D10.                                                                                                                                                                                                                                                 |
| `data/static/khriss-field-notes.ts` (94)                                  | `content/meta/field-notes.json`                        | **Conservar**.                                                                                                                                                                                                                                                           |
| `data/static/book-archive-entries.ts` (22)                                | fusionado en `content/books/*.json`                    | Eliminar fichero paralelo → una sola fuente de verdad por libro.                                                                                                                                                                                                         |
| `data/static/planet-visuals.ts`, `shard-themes.ts`                        | —                                                      | **ELIMINAR** (configuración de un mapa que se rediseña).                                                                                                                                                                                                                 |
| **NUEVO**                                                                 | `content/concepts/*.json` (80)                         | Nuevo contenido.                                                                                                                                                                                                                                                         |
| **NUEVO**                                                                 | `content/shards/*.json` (18)                           | Nuevo contenido.                                                                                                                                                                                                                                                         |

**Volumen objetivo:** 22 libros + 150 personajes + 80 conceptos + 11 planetas + 18 Shards + 30 heroes + 49 sistemas + 400 relaciones + 150 eventos + 7 familias ≈ **917 entidades**.

### 7.5 Validación en CI

**Esquema (JSON Schema 2020-12) + reglas semánticas**, ejecutadas por `pnpm content:validate`:

| #   | Regla                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------ |
| V1  | Todos los ficheros validan contra su schema (`additionalProperties: false`)                            |
| V2  | IDs únicos **dentro** de cada tipo                                                                     |
| V3  | IDs únicos **globales** (un concepto y un personaje no pueden compartir id)                            |
| V4  | Todas las referencias `$ref` resuelven (book, planet, shard, character, concept, magic-system, family) |
| V5  | Sin ciclos en `relationships` de tipo `parent`/`child`                                                 |
| V6  | `born <= died` cuando ambos existen                                                                    |
| V7  | `firstAppearance` no vacío en libros, personajes y conceptos                                           |
| V8  | `unlockAt ⊆ firstAppearance` (no se puede desbloquear antes de aparecer)                               |
| V9  | `summary` entre 150 y 900 caracteres en todas las entidades con descripción                            |
| V10 | `wordCount` presente en el 100 % de los libros con `status: published`                                 |
| V11 | **Todo fichero de `portrait`, `cover`, `spineArt` existe en `public/`**                                |
| V12 | `aliases` no colisionan con el `name` de otra entidad                                                  |
| V13 | Cada concepto tiene ≥ 1 `related` o `seeAlso`                                                          |
| V14 | Cada entidad es alcanzable desde al menos un `index` (búsqueda)                                        |
| V15 | Sin `id` que contenga `_` (normalizar los 22 ids actuales con guiones bajos)                           |

**Se conserva y extiende `data-integrity.test.ts`** (43 tests) como capa de Vitest, porque da mensajes de error más útiles que un validador puro.

**Salida de CI:**

```
✔ 917 entities validated (14 schemas)
✔ 0 broken references
✔ 0 missing assets (verified against public/)
✖ content/concepts/foo.json: V4 unresolved ref "bar" at $.related[0]
```

**Script de creación:**

```bash
pnpm content:new character kaladin
# → crea content/characters/kaladin.json con el esqueleto del schema
#   y abre un mensaje con los campos requeridos
```

### 7.6 Tipos TypeScript generados

```jsonc
// package.json
{
  "scripts": {
    "content:validate": "tsx scripts/validate-content.ts",
    "content:types": "tsx scripts/generate-types.ts",
    "content:new": "tsx scripts/new-entry.ts",
  },
}
```

Los tipos se **generan desde los JSON Schema** (`zod` → `z.infer`), nunca se escriben a mano. Esto elimina la deriva actual entre `src/types/book.ts` (sin `cover`) y los datos reales.

---

## 8. Assets

### 8.1 Regla de procedencia

> **Prohibido extraer assets con copyright de libros, cubiertas oficiales, mapamundis o ilustraciones de Dragonsteel / Tor / Hormragon.** Cualquier imagen usada debe ser: (a) generada por nosotros en SVG/CSS/Canvas, (b) dominio público verificado, (c) CC0, o (d) generada por IA con licencia que permita uso comercial.

**Acción de M1 (decisión F.1 — las imágenes se quedan):** documentar la procedencia de `public/characters/*.webp` (34 ficheros) y `public/images/covers/*.webp` (22 ficheros) en `public/content/PROVENANCE.md`. No se sustituye ninguna imagen; lo único que se borra son los 12,6 MB de ficheros duplicados de `afarietam/`.

### 8.2 Estado: qué existe y qué falta

| Asset                      | Estado                                                             | Peso           | Acción                                              |
| -------------------------- | ------------------------------------------------------------------ | -------------- | --------------------------------------------------- |
| **Lomos de libro**         | ❌ **7 declarados, 3 existen, 0 únicos**                           | 175 KB         | **Sustituir por SVG procedimental** (§8.3)          |
| **Portraits de personaje** | ⚠ 34 ficheros, 24 útiles, 10 huérfanos, procedencia sin documentar | 1.718 KB       | **Rehacer**: siluetas SVG + 24 retratos verificados |
| **Cubiertas de libro**     | ✅ 22/22 presentes                                                 | 4.514 KB       | **Verificar procedencia**; añadir `srcset` + AVIF   |
| **Honorblades**            | ❌ **10 ficheros idénticos**, 1,26 MB cada uno                     | 12.611 KB      | **Rehacer en SVG**; eliminar los 10                 |
| `wood-pattern.png`         | ⚠ 203×317 px, estirable a 2.700 px                                 | 111 KB         | Sustituir por SVG procedimental 512×512             |
| Textura de papel           | ✅ generada en Canvas (`textures.ts`)                              | 0 KB (runtime) | Migrar a SVG inline; **eliminar `Math.random()`**   |
| Textura de piedra          | ⚠ `getStoneTexture()` sin usar                                     | 0 KB           | Eliminar                                            |
| Favicon / iconos PWA       | ✅                                                                 | 31 KB          | Actualizar con el nuevo símbolo                     |
| `icons.svg`                | ⚠ sprite propio, 5 KB                                              | 5 KB           | Sustituir por Lucide                                |
| `public/screenshots/*.png` | ❌ **borrados**, referenciados en el manifest                      | 0 KB           | Regenerar o eliminar del manifest                   |
| Fuentes                    | ⚠ Google Fonts CDN (`index.css:1-2`)                               | —              | Auto-alojar con Fontsource                          |
| Texturas de audio          | ❌ no existen                                                      | 0 KB           | Opcional (§8.6)                                     |

**Ahorro inmediato:** eliminar `public/images/afarietam/` = **−12.611 KB (56 % del `dist`)**.

### 8.3 Adornos de lomo — REVISADO POR D-LIB

`SpineOrnament` ya no genera los adornos principales: **los lomos usan las portadas reales** (§5.3.1). El componente sobrevive con un uso reducido:

- **En los monogramas** (D-DATA): adorno geométrico al 18 % detrás de las iniciales.
- **En los lomos sin portada** o con portada ilegible: sello geométrico del Shard como fallback.

Los 8 patrones SVG originales pasan a **3** (`circle-dots`, `diamond-cross`, `stepped-frame`), porque D-ORN fija un ornamento geométrico y sobrio. **No se generan 22 combinaciones**: eso ya lo dan las 22 portadas.

### 8.4 Retratos de personaje — estrategia escalonada

**Fase 1 (M1, coste 0 €, decisión D-DATA): monogramas como diseño.**
Sin imágenes. Un componente `Monogram` de 128×128 px:

- Fondo: `radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--shard-color) 18%, transparent), var(--surface-raised))`.
- Anillo: 2 px `--border-interactive` + punto del Shard.
- Iniciales: `--text-h1` 36 px, `--text-primary`, tracking 0,05em.
- Ornamento: `SpineOrnament` (3 patrones geométricos, D-ORN) al 18 %.
- **93 monogramas únicos, 0 KB, 0 errores 404.** Elimina D1, D2, D3 y D4 de un plumazo.
- Si hay retrato y el nombre resuelve, se usa el retrato; si no, monograma. Nunca un hueco.

**Fase 2 (fuera de alcance).** Siluetas SVG por rol (diagrama de fuerzas para un Radiant, retícula para un scholar) eran una alternativa; **D-DATA las descarta** porque el monograma geométrico ya cumple el papel y suma menos complejidad.

**Fase 3 (fuera de alcance).** Retratos ilustrados nuevos: proyecto aparte, no bloquea nada.

| Textura             | Método                                                                                                      | Peso                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------ |
| Papel               | `feTurbulence fractalNoise baseFrequency 0.8 numOctaves 4` + `feColorMatrix` a alfa, `opacity 0.035`        | ~600 B inline            |
| Papel envejecido    | 4 manchas radiales SVG + máscara de borde                                                                   | ~1,2 KB                  |
| Madera              | `feTurbulence baseFrequency 0.012 0.09 numOctaves 5` + 12 vetas a mano + 4 nudos, 512×512, `RepeatWrapping` | ~4 KB                    |
| Cuero (lomos)       | `feTurbulence baseFrequency 1.4 numOctaves 3` al 6 % + gradiente de curvatura                               | ~800 B                   |
| Piedra (Aharietiam) | `feTurbulence baseFrequency 0.02 0.05 numOctaves 6` + grietas SVG                                           | ya existe (`Platform3D`) |
| Brillo Stormlight   | `conic-gradient` animado en `mask-image`                                                                    | 0 KB                     |

Todas se generan en build o inline. **Cero ficheros de textura.**

### 8.6 Cubiertas de libro

| Acción                | Detalle                                                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Verificar procedencia | Ver `public/content/PROVENANCE.md` (único requisito pendiente de M1)                                                                                                                                                     |
| Normalizar            | Todas a **relación 2:3**, WebP, `quality 82`, máx 800 × 1200 px                                                                                                                                                          |
| Variantes             | Generar 400 px / 800 px / 1200 px con `<picture>` + `srcset`                                                                                                                                                             |
| Formato moderno       | AVIF con fallback WebP (GitHub Pages sirve ambos; AVIF pesa ~35 % menos)                                                                                                                                                 |
| Presupuesto           | ≤ 55 KB por portada en la variante de 800 px                                                                                                                                                                             |
| Procedencia           | **Las imágenes se quedan** (decisión F.1). Documentar en `public/content/PROVENANCE.md` quién es el autor y bajo qué licencia están las 22 portadas y los 34 retratos. Es el único requisito documental pendiente de M1. |

### 8.7 Tipografías

| Familia              | Fuente                                | Licencia | Peso        | Formato                     |
| -------------------- | ------------------------------------- | -------- | ----------- | --------------------------- |
| EB Garamond Variable | `@fontsource-variable/eb-garamond`    | OFL-1.1  | 45 KB woff2 | variable                    |
| Inter Variable       | `@fontsource-variable/inter`          | OFL-1.1  | 48 KB woff2 | variable                    |
| JetBrains Mono       | `@fontsource-variable/jetbrains-mono` | OFL-1.1  | 38 KB woff2 | variable                    |
| IM Fell English      | `@fontsource/im-fell-english`         | OFL-1.1  | 22 KB woff2 | 400 + italic (opcional, M2) |

Total **131 KB woff2**, self-hosted, `font-display: swap`, `preload` solo de EB Garamond e Inter.

### 8.8 Audio (opcional, 0 €)

**No bloqueante.** Si se quiere ambiente:

| Sonido               | Origen                                                           | Volumen |
| -------------------- | ---------------------------------------------------------------- | ------- |
| Viento de Shadesmar  | Web Audio API — ruido blanco filtrado (banda 200–800 Hz) con LFO | −28 dB  |
| Latido de Honorblade | Web Audio — oscilador 55 Hz con envolvente                       | −32 dB  |
| Paneo de página      | Web Audio — ráfaga de ruido con filtro paso-banda 2 kHz          | −24 dB  |

**0 KB de assets**: todo sintetizado con `AudioContext`. Toggle de sonido en el menú, desactivado por defecto, `localStorage` para la preferencia. `prefers-reduced-motion` no lo controla, pero el sonido nunca se auto-reproduce.

### 8.9 Assets que tendrás que preparar a mano

| Asset                     | Cantidad           | Formato                | Dónde                       |
| ------------------------- | ------------------ | ---------------------- | --------------------------- |
| **Portadas de libro**     | 22                 | WebP/AVIF 2:3, ≤ 55 KB | `public/content/covers/`    |
| **Retratos de personaje** | 24 (opcional, M5+) | WebP 512², ≤ 45 KB     | `public/content/portraits/` |
| **Iconos de app**         | 3                  | PNG 192/512 + SVG      | `public/`                   |
| **Capturas PWA**          | 3                  | PNG 1280×720           | `public/screenshots/`       |
| **Captura de Open Graph** | 1                  | PNG 1200×630           | `public/og.png`             |

**Todo lo demás se genera con SVG/CSS/Canvas. 0 €.**

---

## 9. Arquitectura

### 9.1 Estructura de carpetas objetivo

```
cosmere-archive/
├─ content/                      ← NUEVO: datos, un fichero por entidad
│  ├─ schema/*.schema.json
│  ├─ shards/ planets/ series/ books/ characters/
│  ├─ concepts/ heroes/ magic-systems/ relationships/
│  ├─ events/ eras/ families/ meta/
│  └─ index/                     ← el índice de búsqueda (generado)
├─ public/
│  ├─ content/covers/ content/portraits/   ← NUEVO (nombres planos)
│  ├─ fonts/                     ← NUEVO (woff2 self-hosted)
│  └─ …iconos, og.png
├─ scripts/
│  ├─ validate-content.ts        ← NUEVO
│  ├─ generate-types.ts          ← NUEVO
│  ├─ new-entry.ts               ← NUEVO
│  ├─ generate-search-index.ts   ← NUEVO
│  ├─ prerender.ts               ← NUEVO (§9.2)
│  └─ generate-sitemap.ts        ← NUEVO
├─ src/
│  ├─ app/                       ← NUEVO: shell, rutas, providers
│  │  ├─ router.tsx
│  │  ├─ routes.tsx
│  │  ├─ ErrorBoundary.tsx
│  │  └─ AppShell.tsx            ← nav + CommandPalette + skip-links
│  ├─ design/                    ← NUEVO: sistema de diseño
│  │  ├─ tokens.css              ← §4 completo
│  │  ├─ fonts.css
│  │  ├─ motion.css
│  │  ├─ reset.css
│  │  └─ utilities.ts            ← cn(), tokens en JS
│  ├─ components/
│  │  ├─ primitives/             ← Button, Link, Chip, Field, Dialog, Tabs,
│  │  │                            Tooltip, Toast, Skeleton, EmptyState
│  │  ├─ layout/                 ← AppShell, NavBar, NavDrawer, Footer,
│  │  │                            PageHeader, Sidebar, SplitView
│  │  ├─ media/                  ← Monogram, Portrait, BookCover, OrnamentSprite,
│  │  │                            PaperTexture, WoodTexture
│  │  └─ …features/ (ver abajo)
│  ├─ features/                  ← NUEVO: una carpeta por experiencia
│  │  ├─ archive/          (home)
│  │  ├─ library/          (biblioteca de Jasnah)
│  │  ├─ shadesmar/        (canvas + HUD)
│  │  ├─ codex/            (registro de personaje)
│  │  ├─ concepts/         (registro de concepto)
│  │  ├─ atlas/            (celestial charts)
│  │  ├─ arcanum/          (magic systems)
│  │  ├─ chronology/
│  │  ├─ aharietiam/
│  │  ├─ diagram/          (Taravangian)
│  │  └─ search/
│  ├─ data/                      ← NUEVO: capa de acceso, no datos
│  │  ├─ client.ts              ← carga y cachea los JSON de content/
│  │  ├─ graph.ts               ← índice de relaciones (adjacency + CSR)
│  │  └─ hooks.ts               ← useBook, useCharacter, useConcept…
│  ├─ hooks/                    ← useMediaQuery, useFocusTrap, useSeo,
│  │                              useLocalStorage, useReducedMotion, useHotkey
│  ├─ lib/                      ← minisearch, ritz-decompose, color, format
│  ├─ routes/                   ← 15 páginas finas, < 80 líneas cada una
│  ├─ styles/                   ← CSS por feature (o .module.css)
│  └─ types/                    ← GENERADOS desde JSON Schema
└─ tests/
   ├─ unit/  component/  a2e/  visual/  content/
```

**Regla de imports (ESLint `no-restricted-imports`):**

- `src/features/X/**` **no puede** importar de `src/features/Y/**`. Las features se comunican solo vía `src/data/` y `src/design/`.
- Nada fuera de `src/design/**` puede usar `style={{}}` inline con colores literales. Los colores vienen de `var(--…)`.

### 9.2 Carga diferida y pre-rendering

**Estrategia en tres capas:**

**Capa 1 — Route-level splitting (ya existe, se mantiene).**
`React.lazy` por ruta. Cada ruta es un chunk.

**Capa 2 — Data splitting (NUEVO, resuelve el monolith).**

- Los JSON de `content/` se importan **por dominio**:
  - `content/characters/index.json` → un array con `{id, name, aliases, origin, status, roles, unlockAt, firstAppearance, summary}` (**sin** descripciones largas).
  - `content/characters/{id}.json` → la ficha completa, cargado **solo** al abrir la ficha.
- Resultado: el índice de personajes pasa de **70,7 KB** (bloque único) a **~14 KB** en el chunk raíz; cada ficha añade ~1,2 KB.
- **Pre-render**: un script de build (`scripts/prerender.ts`) genera HTML estático para `/`, `/about`, `/records/{id}`, `/historical/*` y la vista de lista de `/library` con el contenido crítico en el HTML. **Se implementa en M7** (decisión Q3), no antes: M2 debe entregarse sin él para no bloquear.

**Capa 3 — Chunking corregido (arregla `vite.config.ts`):**

```ts
manualChunks(id) {
  if (/node_modules\/(react|react-dom|scheduler|react-router)/.test(id)) return 'vendor'
  if (/node_modules\/three/.test(id))            return 'three'
  if (/node_modules\/@react-three/.test(id))     return 'r3f'
  if (/node_modules\/(framer-motion|motion-dom|motion-utils)/.test(id)) return 'motion'
  if (/node_modules\/minisearch/.test(id))       return 'search'
  if (id.includes('node_modules'))               return 'vendor-misc'
}
```

Y **bajar `chunkSizeWarningLimit` de 1000 a 400**, para que cualquier regresión futura falle de verdad.

**Presupuesto de chunks:**

| Chunk                              | Objetivo gzip | Nota                                |
| ---------------------------------- | ------------- | ----------------------------------- |
| `vendor` (react + router)          | ≤ 70 KB       | 72,3 KB actual ✔                    |
| `index` (shell + nav + datos raíz) | **≤ 180 KB**  | 69,7 KB actual + índice de búsqueda |
| `search` (MiniSearch + índice)     | ≤ 20 KB       |                                     |
| Por ruta                           | ≤ 60 KB       | lazy                                |
| `three` + `r3f`                    | ≤ 250 KB      | lazy, solo `/afarietiam`            |
| `motion`                           | ≤ 40 KB       | lazy                                |
| CSS global (carga inicial)         | ≤ 30 KB gzip  | 29,2 KB actual                      |
| CSS de rutas lazy                  | ≤ 6 KB gzip   | 5,7 KB actual                       |

### 9.3 Estado

| Tipo                         | Solución                                       | Notas                                                                                                                       |
| ---------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Estado de servidor           | **Ninguno**                                    | No hay API. Los datos son estáticos.                                                                                        |
| Estado global (≤ 6 valores)  | `React.createContext` + `useSyncExternalStore` | `ThemeProvider`, `SpoilerProvider`, `ReadingProgressProvider`                                                               |
| Estado global complejo       | **Nada**                                       | No hay necesidad real. Zustand añadiría 3 KB gz para 6 valores.                                                             |
| Estado de URL                | **`useSearchParams`**                          | Fuente de verdad para filtros seleccionables (`?planet=`, `?book=`, `?q=`). Hace la app compartible y el prerender posible. |
| Estado local                 | `useState` / `useReducer`                      | Componentes                                                                                                                 |
| Estado de canvas (Shadesmar) | **`useRef` + clases imperativas**              | Fuera de React: `Camera`, `Interaction`, `Render loop` ya son clases. Mantener.                                             |
| Persistencia                 | `useLocalStorage` con prefijo `cosmere:`       | Versión del esquema: `cosmere:v2:*`                                                                                         |

**Anti-patrón a eliminar:** `useSearch` rota el placeholder con `setInterval` global (re-render perpetuo). Se elimina.

### 9.4 Rendimiento — presupuesto y objetivos

**Objetivos Lighthouse** (móvil emulado, en `/`, `/records/kaladin`, `/library` y `/shadesmar`):

| Métrica        | Objetivo     |
| -------------- | ------------ |
| Performance    | **≥ 95**     |
| Accessibility  | **100**      |
| Best Practices | **≥ 95**     |
| SEO            | **≥ 95**     |
| LCP            | **≤ 2,0 s**  |
| CLS            | **≤ 0,02**   |
| INP            | **≤ 150 ms** |
| TBT            | **≤ 150 ms** |

**Presupuesto de peso:**

| Recurso                           | Presupuesto              |
| --------------------------------- | ------------------------ |
| HTML inicial (crítico)            | ≤ 30 KB gzip             |
| CSS inicial (global)              | ≤ 30 KB gzip             |
| CSS de rutas lazy (agregado)      | ≤ 6 KB gzip              |
| JS del shell (crítico)            | ≤ 180 KB gzip            |
| JS total cargado en la home       | ≤ 260 KB gzip            |
| JS total cargado en `/afarietiam` | ≤ 520 KB gzip            |
| Fuentes                           | ≤ 140 KB                 |
| Imágenes por encima del fold      | ≤ 120 KB                 |
| `dist/` total                     | **≤ 6 MB** (hoy 22,4 MB) |

**Técnicas aplicadas:**

1. **`content-visibility: auto` + `contain-intrinsic-size`** en cada sección de lista larga.
2. **`loading="lazy" decoding="async"` + `width`/`height`** en todas las imágenes (elimina CLS).
3. **`<picture>` con `srcset`** + AVIF/WebP.
4. **Fontsource con `font-display: swap`** + `preload` de las 2 críticas.
5. **`decode()` de fuentes** antes del primer render de texto.
6. **Rejilla espacial de Shadesmar reconstruida solo bajo umbral** (§5.3.2).
7. **`devicePixelRatio` limitado a 2** en canvas.
8. **Pre-render HTML** de las rutas de contenido (§9.2).
9. **`vite-plugin-pwa` con `globPatterns` restringido**: `maxSize: 2 MB` por entrada, `maxFileSizeToCacheInBytes` para excluir los `.webp` de 1,26 MB actuales.
10. **Sin `Math.random()`** en ningún render (determinismo).

### 9.5 Accesibilidad

**Objetivo: WCAG 2.2 AA completo, auditado automáticamente.**

| Criterio                      | Cómo se cumple                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| 1.1.1 Contenido no textual    | Todos los SVG decorativos con `aria-hidden` + `role="img"` + `<title>` cuando son informativos     |
| 1.3.1 Info y relaciones       | `<dl>` para metadatos, `<nav>` para índices, `<article>` para fichas, `<ol>` para listas ordenadas |
| 1.3.2 Secuencia significativa | DOM en orden lógico; CSS order solo para elementos puramente decorativos                           |
| 1.4.3 Contraste (mínimo)      | Tokens verificados: **0 combinaciones bajo 4,5:1** (§4.1)                                          |
| 1.4.4 Redimensionar texto     | `rem` en todo el texto; sin `max-height` en contenedores de texto                                  |
| 1.4.10 Reflow                 | Cero scroll horizontal a 320 px de ancho (test Playwright)                                         |
| 1.4.11 Contraste no textual   | `--border-interactive` ≥ 3:1; anillo de foco ≥ 3:1 en ambos modos                                  |
| 1.4.12 Espaciado del texto    | Sin alturas fijas en contenedores de texto; `line-height` ≥ 1,4                                    |
| 2.1.1 Teclado                 | **100 %** de la funcionalidad accesible por teclado; test automático de tabulación                 |
| 2.1.2 Sin trampas de teclado  | `<dialog>` nativo para modales; `focus trap` verificado                                            |
| 2.4.1 Evitar bloques          | Skip-links: "Saltar al contenido", "Saltar a la navegación"                                        |
| 2.4.7 Foco visible            | `--focus-ring` con 2 ratios ≥ 3:1; nunca `outline: none` sin sustituto                             |
| 2.5.5 Tamaño del objetivo     | Mínimo **44×44 px** táctil (test automático sobre todos los `<button>` y `<a>` interactivos)       |
| 2.5.8 Tamaño mínimo           | 24×24 px como mínimo absoluto                                                                      |
| 3.1.2 Idioma de partes        | `lang` en passages en inglés                                                                       |
| 3.2.3 Navegación coherente    | El mismo componente `NavBar` en todas las rutas, mismo orden                                       |
| 3.3.2 Etiquetas               | Todos los inputs con `<label>` (no solo `placeholder`)                                             |
| 4.1.2 Nombre, rol, valor      | Roles ARIA correctos en buscador, filtros y diálogos                                               |
| 4.1.3 Mensajes de estado      | `aria-live="polite"` en contador de resultados y en transiciones de capítulo                       |
| **Shadesmar**                 | Lista DOM alternativa (§5.3.3)                                                                     |

**Herramientas:**

- `eslint-plugin-jsx-a11y` (ya implícito vía `eslint-plugin-react-hooks`? → **añadir explícitamente**).
- `axe-core` en los tests unitarios de cada componente de `primitives/`.
- `@axe-core/playwright` en e2e, con `withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'])`.
- **Test de contraste propio** que parsea `src/design/tokens.css`, extrae todos los pares `--text-*` / `--surface-*` y verifica la ratio. Falla el build si alguna baja de 4,5.

### 9.6 SEO

**Problema actual:** `sitemap.xml` apunta a `cosmere-archive.vercel.app` y lista 14 rutas de las que 6 están muertas. `index.html` usa rutas absolutas que rompen bajo `/Cosmere-Archive/`. No hay canonical, ni Open Graph, ni datos estructurados.

**Solución:**

1. **`scripts/generate-sitemap.ts`**: recorre el registro de rutas y emite `public/sitemap.xml` con el dominio de `import.meta.env.VITE_SITE_URL` (por defecto `https://<user>.github.io`). Incluye **todas** las entidades: 22 libros + 93 personajes + 80 conceptos + 11 planetas + 49 sistemas.
2. **Prerender** (§9.2) genera además un `public/404.html` (GitHub Pages lo sirve para rutas desconocidas).
3. **`useSEOMeta` mejorado** por ruta:
   - `<title>` ≤ 60 caracteres, único.
   - `<meta name="description">` 120–158 caracteres.
   - `<link rel="canonical">` con URL absoluta.
   - Open Graph: `og:title`, `og:description`, `og:image` (1200×630), `og:type`, `og:url`.
   - Twitter `summary_large_image`.
   - **JSON-LD**:
     - Home / páginas de sección: `WebSite` + `SearchAction`.
     - `/library?book=X`: `Book` (`name`, `author: Brandon Sanderson`, `datePublished`, `inLanguage`).
     - `/records/{id}`: `Person` (`name`, `description`).
     - `/concepts/{id}`: `DefinedTerm` (`name`, `description`, `inDefinedTermSet`).
4. **`robots.txt`**: `Sitemap: <URL real>/sitemap.xml`.
5. **Base path**: `import.meta.env.BASE_URL` en **todas** las URLs de `index.html` (`href="%BASE_URL%favicon.svg"`), y Vite lo sustituye en build.
6. **Rutas limpias**: mantener `HashRouter` (compatible con GH Pages sin configuración) **pero** con un plugin de Vite que genere las redirecciones de las URLs limpias → hash. Ver §12-P4.

### 9.7 Responsive — la matriz real

| Breakpoint | Ancho     | Navegación                                        | Códice                                    | Biblioteca                      | Shadesmar                      |
| ---------- | --------- | ------------------------------------------------- | ----------------------------------------- | ------------------------------- | ------------------------------ |
| **M**      | 320–767   | Barra inferior fija de 5 destinos + "Más" (56 px) | 1 columna, índice en drawer               | 2 filas/estante, columna oculta | HUD colapsado, gestos táctiles |
| **T**      | 768–1023  | Barra superior completa (8 destinos)              | 2 páginas, sidebar 232 px                 | 4–5 lomos/estante               | Completo                       |
| **D**      | 1024–1439 | Barra superior completa                           | 2 páginas, sidebar 264 px                 | 5–6 lomos, columna 56 px        | Completo                       |
| **UW**     | ≥ 1440    | Barra superior + CommandPalette visible           | 2 páginas, sidebar 288 px, lectura 860 px | 6–7 lomos, columna 72 px        | Completo, mundo más amplio     |

**Reglas globales:**

- `100dvh` en lugar de `100vh` (`Layout.tsx:82`).
- Contenedor `--page-max` 1440 px, centrado.
- `--gutter` 20/32/48 px.
- Targets táctiles ≥ 44×44 px.
- Cero scroll horizontal a 320 px (verificado por test).
- `viewport-fit=cover` + `env(safe-area-inset-*)` en la barra inferior móvil.

---

## 10. Testing y CI

### 10.1 Qué se conserva

| Activo                                                               | Decisión                                                                                      |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `data-integrity.test.ts` (43 tests)                                  | **Conservar y extender** a los nuevos esquemas (§7.5)                                         |
| `journey-utils.test.ts` (43 tests)                                   | **BORRAR** en M1 — prueba `fly-to`/`journey`, código muerto                                   |
| `validate.test.ts` (15 tests)                                        | **Reescribir** contra Zod                                                                     |
| `fly-to.test.ts` (9 tests)                                           | **BORRAR** en M1 — código muerto                                                              |
| Tests de página (`BooksPage`, `CharactersPage`, `MagicSystemsPage`…) | **Reescribir**; `CharactersPage` → `/records`, `MagicSystemsPage` → `/historical/ars-arcanum` |
| `a11y.test.tsx` (4 tests)                                            | **Ampliar** a todos los `primitives/`                                                         |
| Configuración de Vitest + jsdom                                      | Conservar                                                                                     |
| Playwright                                                           | Conservar, **reescribir los 12 tests** y **añadir a CI**                                      |
| Husky + lint-staged                                                  | Conservar                                                                                     |
| `eslint-plugin-react-hooks` v7 con `purity`                          | **Conservar** — fue una buena decisión                                                        |
| `rollup-plugin-visualizer`                                           | Conservar                                                                                     |

### 10.2 Qué se añade

**Tests de contenido (nuevos, ~90 tests).**

- Validación de los 14 esquemas.
- V1–V15 de §7.5.
- Verificación de existencia de assets (V11).
- Verificación de que cada entidad es alcanzable desde el índice de búsqueda.

**Tests de contraste (nuevos, bloqueantes).**

- Parsear `tokens.css` y verificar todas las combinaciones `--text-*` × `--surface-*` ≥ 4,5:1.
- Verificar `--border-interactive` ≥ 3:1.
- Verificar los pares foil/cuero de las 8 series de lomos.

**Tests de accesibilidad (nuevos, ~40 tests).**

- `axe-core` sobre cada componente de `primitives/` (Button, Chip, Dialog, Tabs, Field, Tooltip, EmptyState, Skeleton, CommandPalette).
- Roles ARIA correctos del buscador (`combobox`/`listbox`/`option`/`activedescendant`).
- `aria-current` en la navegación.
- Targets táctiles ≥ 44 px.

**Tests de componentes (nuevos, ~80 tests).**

- `BookSpine`: los 22 lomos resuelven su portada sin 404, y el velo `series.ink` garantiza ≥ 4,5:1 sobre la franja real.
- `Monogram`: 93 iniciales únicas, colores de Shard válidos.
- `ArchivalCodex`: navegación por teclado, buscador, índice.
- `Library`: reflow a 320/768/1440 sin scroll horizontal; ningún lomo recortado.
- `ShadesmarHUD`: lista accesible, inspector, estados vacío/selección.

**E2E Playwright (reescritos + nuevos, ~35 tests).**

| Suite        | Tests                                                                        |
| ------------ | ---------------------------------------------------------------------------- |
| `smoke`      | 6 rutas cargan, título correcto, sin errores de consola                      |
| `a11y`       | axe sobre 8 rutas con `withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa'])` |
| `search`     | 10 consultas → resultados correctos, todas las rutas válidas                 |
| `library`    | reflow en 4 breakpoints; ningún lomo recortado; apertura de libro            |
| `codex`      | navegación teclado completa; cambios de capítulo                             |
| `shadesmar`  | zoom, arrastre, selección, lista accesible                                   |
| `responsive` | **cero scroll horizontal a 320 px en las 12 rutas**                          |
| `assets`     | **cero 404 de red** en navegación completa                                   |
| `motion`     | con `prefers-reduced-motion: reduce` no hay transiciones                     |

**Tests visuales (nuevos, ~24 snapshots).**
Playwright screenshot en 3 breakpoints × 8 rutas. Threshold 0.02 (pixelmatch). Se guardan en `tests/visual/__screenshots__/` y **bloquean el CI** si cambian sin actualizar explícitamente.

**Tests de rendimiento (nuevos).**

- Presupuesto de chunks (`tests/unit/budget.test.ts`): falla si `index.js` gz > 180 KB o `dist/` > 6 MB.
- Presupuesto de assets: ningún fichero en `public/` > 250 KB sin lista blanca.

### 10.3 Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push: main, pull_request: main]
concurrency: { group: ci, cancel-in-progress: true }

jobs:
  validate: # 1. Datos primero — fail fast
    runs-on: ubuntu-latest
    steps:
      - pnpm install --frozen-lockfile
      - run: pnpm content:validate # V1–V15
      - run: pnpm content:types --check # tipos al día

  quality:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm lint --max-warnings 0
      - run: pnpm typecheck
      - run: pnpm test -- --coverage
        # thresholds: 85% líneas / 85% ramas en src/design, src/data, src/lib
      - run: pnpm test:contrast # ratios de tokens

  build:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - run: pnpm build
      - run: pnpm test:budget # KB y chunks
      - run: pnpm test:assets # assets referenciados existen
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }

  e2e:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist }
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e # smoke, a2y, search, responsive, assets
      - run: pnpm test:visual # screenshots contra baselines
      - uses: actions/upload-artifact@v4
        with: { name: playwright-report, path: playwright-report/ }

  lighthouse:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist }
      - run: pnpm dlx @lhci/cli autorun
        # asserts en lighthouserc.json:
        #   performance ≥ 0.95, accessibility = 1.0
        #   lcp ≤ 2000ms, cls ≤ 0.02, tbt ≤ 150ms

  # playwright no depende de lighthouse para no bloquear

deploy:
  needs: [e2e, lighthouse] # ← ahora SÍ depende de CI
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  permissions: { contents: read, pages: write, id-token: write }
  environment:
    name: github-pages
    url: ${{ steps.deployment.outputs.page_url }}
  steps:
    - run: pnpm install --frozen-lockfile
    - run: pnpm build
    - uses: actions/configure-pages@v5
    - uses: actions/upload-pages-artifact@v3
      with: { path: dist }
    - id: deployment
      uses: actions/deploy-pages@v4
```

**Extras:**

- **Semgrep / CodeQL** en `schedule` semanal.
- **Dependabot** (`npm` + `github-actions`) semanal.
- **pnpm audit --audit-level high** en el job `quality`.
- `pnpm dlx publint && pnpm dlx depcheck` (opcional).

---

## 11. Roadmap por hitos (v2 — orden cerrado)

> Orden acordado: **Base → Shell/Portada/Nav/Búsqueda → Biblioteca → Registros → Shadesmar → Diagrama → Historical**
> Cada hito deja el sitio publicable y coherente. Nada queda a medias.

| Hito   | Contenido                                 | Semanas | Acumulado |
| ------ | ----------------------------------------- | ------- | --------- |
| **M1** | Base: tokens + datos + código muerto + CI | 3–4     | 3–4       |
| **M2** | Shell + portada + navegación + búsqueda   | 2–3     | 5–7       |
| **M3** | Biblioteca de Jasnah                      | 3       | 8–10      |
| **M4** | Registros (ficha + árbol + relaciones)    | 3–4     | 11–14     |
| **M5** | Shadesmar                                 | 2       | 13–16     |
| **M6** | Diagrama de Taravangian                   | 2       | 15–18     |
| **M7** | Historical + pulido final                 | 2       | 17–20     |

**Total estimado: 4–5 meses a 15–20 h/semana.** La primera entrega publicable es **M1 + M2** (5–7 semanas) e incluye base, portada, navegación y búsqueda.

---

### M1 — Base: sistema de diseño + datos + limpieza

**Objetivo.** La base sobre la que se construye todo. No cambia ninguna pantalla. Al terminar, **todo el sitio** (incluido el código viejo que aún vive) tiene contraste AA y un presupuesto de peso.

**Entregables.**

1. **Código muerto eliminado** (decisión D-DEAD).
   - 4 páginas no enrutadas: `CharactersPage.tsx`, `CelestialChartsPage.tsx`, `LocationsPage.tsx`, `MapPage.tsx`.
   - `src/components/map/**` (13 ficheros, 94,5 KB) y `src/components/star-chart/**` (5 ficheros, 34,1 KB) + los 4 utils que solo ellos usan (`fly-to`, `journey`, `screen-to-world`, `simplex-noise`) + sus 2 test files.
   - 7 rutas redirect de `App.tsx` y las 6 URLs muertas de `sitemap.xml`.
   - 8 exports sin referencias.
2. **Assets.** Borrar `public/images/afarietam/` (−12.611 KB, 10 ficheros idénticos). Documentar la procedencia de los 56 ficheros que **se quedan** en `public/content/PROVENANCE.md` (decisión: las imágenes se quedan).
3. **Tokens** (`src/design/tokens.css`, §4): paleta oscura verificada + paleta de papel para Historical, escala tipográfica de 12 tokens, escala de espaciado de 11 tokens, 5 sombras, 4 duraciones, easing, anillo de foco, `prefers-reduced-motion` **global**.
4. **Tipografías self-hosted**: EB Garamond Variable + Inter Variable + JetBrains Mono vía `@fontsource-variable`, con `font-display: swap` y `preload` de las 2 críticas. Elimina los 2 requests al CDN de Google.
5. **Datos a `content/` + JSON Schema**: los 14 esquemas; migrar los 22 libros, 93 personajes, 11 planetas, 49 sistemas, 41 relaciones, 118 eventos, 11 eras, 7 familias, 94 notas, 10 herolds. Fusionar `CHARACTER_SPANS` dentro de `characters` (elimina la desnormalización 52 vs 93). Añadir `portrait` explícito (fin del bug de monónimos). Corregir D4 ("The …") y D10 (Navani/Gavilar).
6. **Monograma** (decisión D-DATA): componente SVG con iniciales + Shard + adorno. Se usa ya en M1 para que los 69 retratos rotos desaparezcan de golpe.
7. **CI real**: `content:validate` (V1–V15), `format:check`, `lint --max-warnings 0`, `test:contrast`, `test:budget`, `test:assets`. **`deploy` pasa a depender de `ci`.**
8. **Chunking corregido** (`three`/`r3f`/`motion`/`search` separados) y `chunkSizeWarningLimit` de 1000 → **400**.

**Criterios de aceptación.**

| #     | Criterio verificable                                                                            |
| ----- | ----------------------------------------------------------------------------------------------- |
| M1.1  | `pnpm content:validate` imprime `✔ 0 broken references` y `✔ 0 missing assets`                  |
| M1.2  | `pnpm test:contrast` pasa: **0** pares `--text-*`×`--surface-*` por debajo de 4,5:1             |
| M1.3  | `pnpm test:budget` pasa: ningún chunk de ruta > 60 KB gzip, `index.js` < 180 KB, `dist/` < 6 MB |
| M1.4  | `grep -rn "components/map\|star-chart\|flight-to\|fly-to" src/` = **0**                         |
| M1.5  | `pnpm test` ≥ 200 tests verdes; los 43 de `data-integrity` migrados a los nuevos esquemas       |
| M1.6  | `pnpm lint --max-warnings 0` y `pnpm typecheck` limpios                                         |
| M1.7  | Las **9** rutas de `sitemap.xml` devuelven 200 (test Playwright)                                |
| M1.8  | `index.html` no contiene ninguna ruta que empiece por `/` sin `%BASE_URL%`                      |
| M1.9  | Los 10 ficheros de `afarietam/` borrados; `dist/` ≤ 6 MB (hoy 22,4 MB)                          |
| M1.10 | `deploy` no se ejecuta si `ci` falla (verificable en el YAML)                                   |
| M1.11 | Todas las URLs de `index.html` y del manifest resuelven bajo `/Cosmere-Archive/`                |

---

### M2 — Shell + portada + navegación + búsqueda

**Objetivo.** La primera entrega publicable. Arregla de golpe el contraste, la orientación y la búsqueda de todo el sitio. No toca todavía ninguna pieza del núcleo.

**Entregables.**

1. **`primitives/`** (14): `Button`, `Link`, `Chip`, `Field`, `Dialog`, `Tabs`, `Tooltip`, `Toast`, `Skeleton`, `EmptyState`, `SegmentedControl`, `ScrollArea`, `VisuallyHidden`, `Icon`.
2. **`layout/`**: `AppShell`, `NavBar` (desktop), `BottomNav` (móvil), `HistoricalMenu`, `PageHeader`.
3. **Navegación global** (decisión D-NAV, §5.1): barra de 56 px con 4 destinos del núcleo + Historical + búsqueda; barra inferior de 5 en <768 px; dropdown de Historical; `aria-current`; skip-links funcionales.
4. **Portada** (decisión D-HOME, §5.2): cuatro puertas con contadores reales + banda Historical. Sustituye a `Manuscript.tsx`.
5. **Búsqueda** (decisión D-SEARCH, §5.8): `minisearch` + índice de build + `<dialog>` + rutas corregidas.
6. **`/about`** y **`/404`** rediseñados, más `public/404.html` para que GH Pages devuelva un 404 real.
7. **404/estado vacío unificado** (`EmptyState`) en los 6 sitios que hoy lo hacen a mano.

**Criterios de aceptación.**

| #     | Criterio verificable                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------- |
| M2.1  | Los 4 destinos del núcleo + Historical + About son `<a>`/`<button>` alcanzables por teclado desde `/`   |
| M2.2  | Contraste de **cada** texto de la barra de navegación ≥ 4,5:1 sobre `#0D1119` (antes: "About" a 2,43:1) |
| M2.3  | Todos los targets de la barra ≥ 44×44 px                                                                |
| M2.4  | A 320 px: `scrollWidth <= 320` en `/`, `/about`, `/404`                                                 |
| M2.5  | `kaz` encuentra a Kaladin en la búsqueda global                                                         |
| M2.6  | Los 12 primeros resultados de cada categoría devuelven 200 (test Playwright de red)                     |
| M2.7  | `axe` (`wcag2aa`+`wcag22aa`) pasa en `/`, `/about`, `/404`                                              |
| M2.8  | Lighthouse en `/`: Performance ≥ 95, Accessibility = 100, SEO ≥ 95                                      |
| M2.9  | El anillo de foco es ≥ 3:1 en tema oscuro y en tema papel (antes 2,84 y 1,94)                           |
| M2.10 | `grep "setInterval" src/` sin el placeholder rotatorio de `useSearch`                                   |

---

### M3 — Biblioteca de Jasnah

**Objetivo.** Que deje de parecer un placeholder. Es la pieza que sale primero del núcleo.

**Entregables.**

1. `content/series/*.json` con `ink`, `foil` y `crop` por serie (8 series).
2. **Lomos con portada real** (decisión D-LIB, §5.3): franja de `images/covers/{id}.webp` + velo `--series.ink` + tipografía foil. `object-position` por serie.
3. Limpieza de materiales: de 10 capas de gradiente a 4.
4. Layout de estantería con el **bug de desbordamiento de 192 px corregido**, reflow a 2 filas en móvil, columnas laterales con texto ≥ 13 px.
5. Textura de madera SVG 512×512 (sustituye a `wood-pattern.png` de 203×317).
6. Vista alternativa "Shelves / List".
7. Apertura del libro con `clip-path` 2D (decisión provisional; ver §12-Q1).

**Criterios de aceptación.**

| #    | Criterio verificable                                                                                           |
| ---- | -------------------------------------------------------------------------------------------------------------- |
| M3.1 | Las **22** portadas aparecen como franja reconocible en su lomo, sin 404                                       |
| M3.2 | Contraste del título del lomo ≥ 4,5:1 **sobre la franja real** en las 8 series (captura + muestreo de píxeles) |
| M3.3 | Ningún texto de lomo < 11 px                                                                                   |
| M3.4 | `scrollWidth <= clientWidth` a 375 / 768 / 1440 / 2560 px                                                      |
| M3.5 | `dawnshard` visible por completo (ancho ≥ 24 px)                                                               |
| M3.6 | `gap` entre estanterías = 48 px exactos                                                                        |
| M3.7 | `axe` pasa en `/library` en los 4 breakpoints                                                                  |
| M3.8 | Vista de lista con los 22 libros, ordenable y con la misma info que la estantería                              |
| M3.9 | Ningún fichero de `covers/` > 220 KB (variantes 400/800 + AVIF)                                                |

---

### M4 — Registros (ficha + árbol + relaciones)

**Objetivo.** Arreglar la captura 2. Es la página que más gente usa.

**Entregables.**

1. Layout sidebar + ficha de una columna (decisión D-REC, §5.4), responsive real, sin `rotateY`.
2. Índice A–Z con chips de planeta legibles (≥ 4,5:1).
3. Ficha de personaje con las 5 secciones y `<dl>` semántico.
4. **Monogramas** en las 93 fichas (ya en M1, aquí se integra el bloque en la ficha).
5. **Relaciones escritas** (decisión D-REL): ampliar `content/relationships/` de 41 a **≥ 200 aristas** para cubrir los 93 personajes con ≥ 1 relación. Se escribe lo que es claramente canónico; donde no hay dato, la ficha lo dice.
6. Sub-vista **Bloodlines**: árbol genealógico expandible y navegable por teclado.
7. Sub-vista **Connections**: grafo dentro de la ficha, con `<a>` por nodo.
8. Modo spoiler conectado por fin (el hook ya existe; hoy solo vive en una página muerta).

**Criterios de aceptación.**

| #    | Criterio verificable                                                                      |
| ---- | ----------------------------------------------------------------------------------------- |
| M4.1 | Cero 404 de imagen al navegar los 93 personajes                                           |
| M4.2 | Las 93 fichas pasan `axe`                                                                 |
| M4.3 | Chip de planeta ≥ 4,5:1 (antes ≈ 2,21:1); placeholder del buscador ≥ 4,5:1 (antes 1,68:1) |
| M4.4 | Cero `<div onClick>` en `src/features/records/`                                           |
| M4.5 | Los 93 personajes tienen ≥ 1 relación visible                                             |
| M4.6 | `content/relationships/` tiene ≥ 200 aristas y `content:validate` da 0 referencias rotas  |
| M4.7 | El árbol Bloodlines es navegable por teclado y tiene búsqueda que resalta linaje          |
| M4.8 | Modo spoiler: con 0 libros leídos, nombre y origen visibles, resto `aria-hidden="true"`   |
| M4.9 | A 375 px: `scrollWidth <= 375`                                                            |

---

### M5 — Shadesmar

**Objetivo.** Que por fin se parezca a Shadesmar: ocupe la pantalla, sea legible y sea accesible.

**Entregables.**

1. `fitToViewport()` + mundo 2,4×1,6 + posiciones derivadas por rejilla con jitter determinista (decisión D-SHD, §5.5).
2. Gesto de zoom táctil (pellizco) — hoy no existe.
3. Inspector HTML a +28 px del abalorio, con placa real; **cero `fillText`**.
4. HUD con contador real, buscador, leyenda de 12 realms navegable, botones `+/−/⌂`.
5. `<details>` "List all souls" con los 103 `<a>` en el DOM.
6. LOD de 3 niveles, `devicePixelRatio` ≤ 2, PRNG con semilla, `grid.rebuild` por umbral.
7. Arreglar D9 (`entity-catalog` prefijaba libros con `soul_` → conexiones nunca dibujadas).

**Criterios de aceptación.**

| #    | Criterio verificable                                                        |
| ---- | --------------------------------------------------------------------------- |
| M5.1 | `window.__shadesmar.bounds()` ocupa ≥ 65 % del menor lado en 5 resoluciones |
| M5.2 | `grep "fillText\|strokeText" src/features/shadesmar/` = 0                   |
| M5.3 | El `<details>` expone 103 `<a>` (ariaSnapshot)                              |
| M5.4 | Frame time p95 < 16 ms con 1.200 almas                                      |
| M5.5 | Pellizco cambia el zoom a 375 px; 1 dedo desplaza; doble toque enfoca       |
| M5.6 | El inspector nunca se solapa con un abalorio (offset ≥ 28 px)               |
| M5.7 | `Math.random()` = 0 en el bucle de render                                   |
| M5.8 | `axe` pasa; los 12 realms de la leyenda son navegables por teclado          |

---

### M6 — Diagrama de Taravangian

**Objetivo.** Que el mural deje de ser decorativo y pase a ser el índice del archivo.

**Entregables.**

1. `fitToViewport` + zoom 0,4–2,5 + arrastre con inercia (decisión D-DIA, §5.6).
2. Documentos con formato A–5 legible (título 22 px, cuerpo 15 px, fórmulas mono 13 px) — hoy son fórmulas de 7–8 px.
3. Panel lateral de lectura con el texto en DOM (`--text-body` 16 px, `52ch`).
4. Z-order determinista por documento (orden alfabético, no aleatorio).
5. Cada documento como `<button>` con `aria-label`, alcanzable por teclado.
6. Enlaces desde cada documento a registros y eventos relacionados.
7. Rotación reducida a −6°…+6°.

**Criterios de aceptación.**

| #    | Criterio verificable                                                      |
| ---- | ------------------------------------------------------------------------- |
| M6.1 | Los 9 documentos son `<button>` con `aria-label`, alcanzables por teclado |
| M6.2 | Texto de documento ≥ 13 px y ≥ 4,5:1                                      |
| M6.3 | Al enfocar un documento, su alto en pantalla ≥ 310 px                     |
| M6.4 | Cada documento enlaza a ≥ 1 registro del archivo                          |
| M6.5 | `axe` pasa en `/taravangian`; usable a 375 px (panel 88vh)                |
| M6.6 | Posiciones deterministas (`Math.random()` = 0)                            |

---

### M7 — Historical Archive + pulido final

**Objetivo.** Que las 5 secciones no-núcleo convivan sin parecer abandonadas, y cerrar el sitio.

**Entregables.**

1. Ruta `/historical` con índice de las 5 secciones + contador real (decisión D-HIST, §5.7).
2. Las 5 secciones envueltas en el layout nuevo, cada una con **nota de estado** visible (mantenida / legado).
3. Redirecciones de las 5 rutas viejas a sus destinos nuevos.
4. Pre-render de las rutas de contenido (§9.2).
5. `sitemap.xml` generado con todas las entidades; JSON-LD; OG image 1200×630; `robots.txt` con el dominio real.
6. Auditoría final de contraste en las 9 rutas; purga de `style={{}}` inline con colores literales.
7. `d3-force` eliminado (13,3 KB; solo lo usan `ForceGraph`/`PlanetForceGraph`, ya muertos en M1).

**Criterios de aceptación.**

| #    | Criterio verificable                                                            |
| ---- | ------------------------------------------------------------------------------- |
| M7.1 | `sitemap.xml` ≥ 300 URLs, todas con 200                                         |
| M7.2 | Las 9 rutas pasan `axe` (`wcag2aa`+`wcag22aa`)                                  |
| M7.3 | Cero scroll horizontal a 320 px en las 9 rutas                                  |
| M7.4 | `dist/` ≤ 6 MB; Lighthouse ≥ 90 Performance, = 100 Accessibility en las 9 rutas |
| M7.5 | `grep "style={{.*color: '#" src/` = 0 (todo el color pasa por tokens)           |
| M7.6 | Las 5 rutas viejas redirigen con HTTP 200                                       |
| M7.7 | Cero errores de `console` en la navegación completa (test Playwright)           |

---

## 12. Riesgos y preguntas abiertas (post-entrevista)

> Las 20 decisiones de dirección están **cerradas** (§0.1). Solo quedan 3 preguntas técnicas de ejecución y las mitigaciones de riesgo.

### 12.1 Riesgos vivos

| #   | Riesgo                                                                                                                                                                                                                                    | Prob.    | Impacto | Mitigación                                                                                                                                                                                                                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **D-LIB tiene un riesgo visual que no era visible en la pregunta**: las 22 portadas son imágenes muy distintas entre sí (387×600 a 1604×2487). Puestas como franja de lomo, 3 o 4 pueden quedar ilegibles o romper la paleta de la serie. | **Alta** | Alto    | Doble capa de seguridad ya diseñada (§5.3.1): velo `--series.ink` al 45–72 % + tipografía foil encima. **En M3 se hace una prueba de contraste por las 8 series en la primera semana**; si alguna falla, esa serie pasa a lomo tipográfico sin franja (fallback ya contemplado). Criterio B.2 lo verifica. |
| R2  | Abandonar a mitad (el repo ya tiene 62 commits con reescrituras completas de página).                                                                                                                                                     | Media    | Alto    | Hitos **bloqueantes y publicables**. M1 y M2 por sí solos ya arreglan contraste, navegación y búsqueda de todo el sitio.                                                                                                                                                                                   |
| R3  | D-MOB (móvil como versión propia) multiplica el trabajo de M3–M6.                                                                                                                                                                         | Media    | Medio   | Cada hito incluye sus criterios responsive como parte de la aceptación (no es "después"). Si falta tiempo, M3–M6 se entregan solo en D/UW y el móvil entra en M7, pero **el layout nunca usa `h-screen` ni `px-14` fijos**, así que no hay deuda técnica.                                                  |
| R4  | D-REL exige escribir ~160 relaciones nuevas. Es trabajo de contenido, no de código.                                                                                                                                                       | Media    | Medio   | Es lo que hace que M4 valga. Si falta tiempo, se prioriza cubrir los 60 personajes más referenciados y el resto muestra el estado vacío diseñado.                                                                                                                                                          |
| R5  | El Diagrama como mural puede seguir siendo "decorativo con enlaces" si no se trabaja el panel de lectura.                                                                                                                                 | Media    | Medio   | Criterio D.4 lo ata: panel con `--text-body` 16 px a 52ch y ≥ 1 enlace por documento.                                                                                                                                                                                                                      |
| R6  | D-MOTION mal aplicado: 4 duraciones pueden sentirse "sistema" o "aburrido".                                                                                                                                                               | Baja     | Bajo    | Las 4 duraciones son un techo, no un piso. Cada hito puede usar 2 de ellas.                                                                                                                                                                                                                                |
| R7  | Perder los 203 tests al reescribir.                                                                                                                                                                                                       | Media    | Medio   | M1 los mantiene verdes **antes** de tocar nada. Los 43 de integridad de datos son inviolables.                                                                                                                                                                                                             |

### 12.2 Las 3 preguntas técnicas que quedan

| #      | Pregunta                                                                                                                                                                               | Por qué la dejo abierta                                                                                  | Recomendación por defecto                                                                                                  |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Q1** | **Apertura del libro en la Biblioteca: ¿2D `clip-path` o 3D R3F?** Con D-LIB (portada real como lomo) el 3D puede seguir siendo bonito, pero cuesta ~227 KB gzip lazy y varias piezas. | No es dirección, es un intercambio coste/impacto que depende de cuánto valor tenga para ti el efecto 3D. | **2D `clip-path` (≈700 ms)**. Si en M3 el resultado 2D te parece plano, se recupera el 3D en M7 sin tocar la arquitectura. |
| **Q2** | **¿Sitemap/canonical con dominio real?** Hoy `sitemap.xml` apunta a `cosmere-archive.vercel.app` pero el deploy es GitHub Pages.                                                       | Necesito el dominio final para generar el sitemap y los OG tags correctos.                               | Asumo `https://<usuario>.github.io/Cosmere-Archive/` y que lo cambias en una variable `VITE_SITE_URL` en M7.               |
| **Q3** | **Pre-render: ¿en M7 o antes?** El prerender de las rutas de contenido mejora SEO y TTI, pero puede bloquear M2 si se hace pronto.                                                     | Es una decisión de secuencia, no de diseño.                                                              | **En M7**, como está en el plan. M2 entrega un sitio navegable sin él.                                                     |

### 12.3 Lo que necesito para arrancar M1

Solo esto (el resto ya está decidido):

1. **Q1** — 2D o 3D para la apertura del libro (o "2D y lo vemos").
2. **Q2** — el dominio final (o "usa el de GitHub Pages").
3. **Confirmación de ritmo**: ¿15–20 h/semana? Si son menos, el orden M3–M6 se puede recortar sin tocar M1/M2.

Con eso, **M1 está listo para ejecutar**: es código y datos, no depende de ninguna otra decisión.

---

### 12.4 Decisiones ya NO abiertas (recordatorio)

Las 20 de §0.1 están cerradas y no se vuelven a preguntar: navegación, tono, portada, Shadesmar (motor, exploración, legibilidad), diferenciación de libros, layout de Registros, identidad del Diagrama, Historical, tratamiento de datos incompletos, tipografías, movimiento, densidad, búsqueda, móvil, ornamento, relaciones, alcance de M1, orden de hitos, limpieza previa.

## Apéndice A — 12 ideas extra temáticas

### I1. Mapa de Roshar y Urithiru

**Concepto.** Mapa de Alethkar en estilo carta náutica, con la Tormenta Eternal marcada, las ciudades como asentamientos y Urithiru como ciudad de torres en sección.
**Viabilidad.** Alta — SVG puro con paths.
**Coste.** Alto (2–4 semanas de dibujo) + alto riesgo de precisión cartográfica (no hay mapa canónico publicado).
**Datos.** Coordenadas de ~30 ciudades (1.000 tokens de JSON).
**¿Lo recomiendo?** Solo si te importa mucho la precisión. Alternativa más fiable: **mapa esquemático de las cuatro regiones de Herdazar** (Rosh, Iri, Shinovar, Tashikk), mucho más seguro de dibujar sin un mapa canónico.

### I2. Tabla de Alomancia / Feruquimia / Hemalurgia

**Concepto.** Los 12 metales con sus tres poderes, agrupados por categoría, expandibles, con los aleaciones correspondencia.
**Viabilidad.** **Muy alta** — los 12 metales **ya están modelados** en `magic-systems.ts` con `allomanticPower`, `feruchemicalPower`, `hemalurgicProperty`, `color`.
**Coste.** Bajo (1 semana).
**Datos.** 0 nuevos.
**¿Lo recomiendo?** **Sí, en M6.** Es el bloque de datos más listo del repo y ahora solo se muestra en una tabla estática.

### I3. Glifos y Ars Arcanum

**Concepto.** Alfabetos Vorin, Elantriano, Irial, Canticle y Hermal manifests como SVG, con un visualizador de «escribe tu nombre en Vorin».
**Viabilidad.** Alta.
**Coste.** Medio (diseño de cada alfabeto + un parser).
**Datos.** ~60 glifos por alfabeto.
**¿Lo recomiendo?** **Sí**, es muy «fan-made» y muy compartible. Alto retorno por unidad de esfuerzo.

### I4. Mapa de los 10 Ideales y las Surgebinding

**Concepto.** Los 10 Ideales de los Knights Radiant, sus juramentos, los powers asociados y qué Radiantes los cumplir.
**Viabilidad.** Muy alta.
**Coste.** Bajo.
**Datos.** 10 Ideales + ~40 Radiantes con su Ideal.
**¿Lo recomiendo?** **Sí, en M6.** Datos concentrados y muy buscados por los lectores.

### I5. «La Tormenta» como transición entre páginas

**Concepto.** Cada navegación entre zonas va acompañada de un fundido de Stormlight de 400 ms (`--dur-slow`), con un relámpago ocasional (probabilidad 1/8) y un sonido sintetizado.
**Viabilidad.** Alta (CSS + Web Audio).
**Coste.** Bajo.
**Riesgo.** Puede ser molesto si se repite. Mitigación: **máximo 1 de cada 4 transiciones**, y desactivado con `prefers-reduced-motion`.
**¿Lo recomiendo?** Sí, con moderación. Es el tipo de detalle que separa «fan page» de «experiencia».

### I6. Modo spoiler-safe por libro leído

**Concepto.** El usuario marca qué libros ha leído; todo lo que no ha leído aparece bloqueado con un sello, y el contenido sigue presente en el DOM (accesible pero oculto visualmente).
**Viabilidad.** **Muy alta** — `useSpoilerMode.ts` ya existe y funciona (solo hay que conectarlo; hoy está **solo en una página muerta**).
**Coste.** Bajo.
**¿Lo recomiendo?** **Sí, en M5.** Es la función más pedida por los lectores de Cosmere y ya está a medio hacer.

### I7. Órbita de Investiture

**Concepto.** Diagrama radial: los 18 Shards en el centro, irradiando a los 11 planetas, y de cada planeta sus sistemas de Investiture. Interactivo.
**Viabilidad.** Alta (SVG).
**Coste.** Medio.
**Datos.** Falta modelar los 18 Shards (hoy solo hay strings sueltos en `planet.shard`).
**¿Lo recomiendo?** Sí, es el diagrama que mejor resume el Cosmere.

### I8. Calculadora de Allomancia / Feruquimia

**Concepto.** Dado un «estilo de magia» (agresivo / preciso / silencioso / Manufactor), recomienda los metales más adecuados. Inspirado en el juego de mesa de Mistborn.
**Viabilidad.** Alta.
**Coste.** Bajo.
**Datos.** Los 12 metales.
**¿Lo recomiendo?** Divertido, de bajo compromiso. Prioridad baja.

### I9. «El Pozo» — los componentes posibles de Allomancia

**Concepto.** Mostrar los **10 metales, sus 4 modos de push/pull, y las 10 Spatial Powers** como un árbol de decisión, con un contador de combinaciones posibles.
**Viabilidad.** Alta.
**Coste.** Medio.
**¿Lo recomiendo?** Sí, es el tipo de profundidad que Coppermind tiene.

### I10. «¿Qué Shard te toca?»

**Concepto.** Mini-test de 8 preguntas que asigna al visitante a uno de los 18 Shards.
**Viabilidad.** Muy alta.
**Coste.** Bajo (1 semana).
**¿Lo recomiendo?** Sí — alto engagement, alto valor de compartir, cero riesgo.

### I11. Genealogía como árbol real

**Concepto.** Sustituir el mural por un árbol genealógico expandible y navegable, con búsqueda y resaltado de líneas.
**Viabilidad.** Alta.
**Coste.** Bajo (los datos ya están en `family-data.ts`).
**¿Lo recomiendo?** Sí. El árbol actual es el elemento más bonito del repo; hacerlo navegable lo hace útil.

### I12. Ambiente sonoro sintetizado

**Concepto.** Ver §8.8. Todo con Web Audio API, 0 KB de assets.
**Viabilidad.** Alta.
**Coste.** Bajo.
**¿Lo recomiendo?** Sí, como mejora de M7, con toggle.

---

_Fin del documento._
_Auditoría realizada sobre el commit `ff6199a`. Ningún fichero del repositorio ha sido modificado salvo la creación de este documento._
