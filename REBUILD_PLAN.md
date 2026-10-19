# REBUILD_PLAN.md — Cosmere Archive

> Auditoría completa del estado actual + plan de rebuild.
> Fecha de la auditoría: 2026-10-15 · Commit `ff6199a` · 62 commits · rama `main`.
> Documento de análisis. **No se ha modificado ningún otro fichero del repo.**

---

## Índice

0. [Resumen ejecutivo](#0-resumen-ejecutivo)
   **0.1 [Decisiones cerradas (entrevista de dirección)](#01-decisiones-cerradas-entrevista-de-dirección-2026-10-15)** ← **léase primero**
   **0.2 [D-DIEG: identidad diegética](#02-decisión-d-dieg-identidad-diegética-2026-10-19)** — **por encima de las otras veinte**
   **0.2 [D-DIEG: identidad dieg\u00e9tica](#02-decisi\u00f3n-d-dieg-identidad-dieg\u00e9tica-2026-10-19)** \u2014 **por encima de las otras veinte**
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
