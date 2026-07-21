# Blade Generator

Offline pipeline that converts Honorblade PNG/WebP silhouettes into optimized 3D GLB meshes. Run once, commit the result — the website never generates geometry at runtime.

## Folder Structure

```
tools/blade-generator/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts            # Entry point — orchestrates the pipeline
    ├── Config.ts           # All tunable parameters in one place
    ├── Logger.ts           # Console logging with timing
    ├── ImageLoader.ts      # Read image → raw RGBA pixels (via sharp)
    ├── AlphaExtractor.ts   # Alpha channel → binary mask
    ├── MarchingSquares.ts  # Outer contour extraction
    ├── DouglasPeucker.ts   # Polyline simplification
    ├── ShapeBuilder.ts     # Contour → THREE.Shape (scale, pivot, winding)
    ├── GeometryBuilder.ts  # THREE.Shape → ExtrudeGeometry
    └── GLBExporter.ts      # Geometry → binary GLB file

public/
└── images/
    └── aharietam/          # Input: .webp sword images
└── models/
    └── aharietam/          # Output: .glb blade meshes
```

## Prerequisites

- Node.js 20+
- pnpm (or npm)

## Installation

```bash
cd tools/blade-generator
pnpm install
```

## Usage

```bash
# Generate all blades
pnpm blades

# Alternative alias
pnpm generate:blades
```

The generator scans `public/images/aharietam/`, processes every `.png` and `.webp` file, and writes `.glb` files to `public/models/aharietam/`.

## Pipeline

For each image:

1. **Load** — read image with sharp
2. **Alpha mask** — pixels above threshold → solid, below → empty
3. **Marching Squares** — extract outer contour from the binary mask
4. **Douglas–Peucker** — simplify the contour (default tolerance 1.5px)
5. **Shape** — flip Y, scale to reference height (5.2 units), set pivot at insertion point
6. **Extrude** — THREE.ExtrudeGeometry with configurable depth and bevel
7. **GLB** — export as binary GLTF (geometry only, no materials)

## Configuration

Edit `src/Config.ts`:

| Parameter           | Default | Description                         |
| ------------------- | ------- | ----------------------------------- |
| `extrusionDepth`    | 0.06    | How thick the blade mesh is         |
| `bevelThickness`    | 0.015   | Bevel roundness                     |
| `bevelSize`         | 0.012   | Bevel extent                        |
| `alphaThreshold`    | 128     | Alpha cutoff (0–255)                |
| `simplifyTolerance` | 1.5     | Douglas–Peucker tolerance in pixels |
| `globalScale`       | 1.0     | Uniform scale applied to all blades |

## Adding a New Honorblade

1. Place `{name}.webp` (or `.png`) in `public/images/aharietam/`
2. Run `pnpm blades`
3. The output appears in `public/models/aharietam/{name}.glb`

The blade ID in the data (`src/data/static/aharietiam.ts`) must match the filename (e.g. `jezrien.webp` → `jezrien.glb`).

## Regeneration

Re-run `pnpm blades` at any time. Existing `.glb` files are overwritten. The generator processes every image — there is no incremental mode.

## Troubleshooting

| Symptom                       | Likely Cause                 | Fix                                        |
| ----------------------------- | ---------------------------- | ------------------------------------------ |
| "Cannot read input directory" | Wrong working directory      | Run from project root (`cosmere-archive/`) |
| "Contour has only N points"   | Alpha threshold too high     | Lower `alphaThreshold` in Config.ts        |
| No images found               | Wrong format or empty folder | Check `public/images/aharietam/`           |
| GLB looks too jagged          | Simplify tolerance too high  | Reduce `simplifyTolerance`                 |

## Website Integration

`Blade3D.tsx` loads the GLB from `public/models/aharietam/{id}.glb` via `useLoader(GLTFLoader, ...)`. Materials (color, emissive, metalness) are applied at runtime — the GLB contains only geometry.
