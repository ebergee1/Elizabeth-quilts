# Quilt Studio

A quilt-design CAD tool, fabric planner, cutting optimizer, and pattern writer — not just a
prettier grid editor. Working prototype seeded with a real project: a 68"×68" dinosaur quilt
built from sixteen 17" Economy Blocks.

See [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) for the full feature roadmap and design
rationale (this build covers the MVP slice of that document).

## What's implemented in this build

- **Quilt Setup** — standard size presets or custom dimensions, block size, sashing/border
  widths, seam allowance, and a live feasibility check that tells you whether your layout
  divides evenly and suggests fixes when it doesn't (`src/lib/quiltMath.js: checkFit`).
- **Design Canvas** — a block library (basic units + traditional blocks) you place onto a
  grid, with rotate/mirror, per-slot fabric assignment, seamline/unfinished-size toggles,
  and layout warnings (e.g. identical fabrics in adjacent blocks).
- **Economy Block designer** — the actual construction math for a two-round
  square-in-a-square block, in both an "oversize and trim" (forgiving) and "exact piecing"
  (precise, zero-margin) method, with explicit finished/unfinished/cut-size labeling at every
  step and trim checkpoints — the fix for the "17 inch vs 17½ inch" drift problem.
- **Fabric Library** — a seed catalog structured for Moda and Ruby Star Society (some
  entries are real long-running lines like Bella Solids and Speckled; entries marked
  `sample-data` are illustrative placeholders), fat-quarter bundle import, and a
  project palette.
- **Cutting & Yardage** — per-fabric piece counts and cut sizes derived from the live
  layout, fat-quarters-needed per fabric, plus binding, backing, and batting calculators.
- **Pattern Export** — a print-ready page (cover, fabric requirements, cutting chart, block
  assembly steps, layout diagram, finishing instructions). Use the browser Print dialog →
  "Save as PDF".

## Not yet implemented (see spec for phased plan)

Real full manufacturer catalog ingestion, drag-and-drop (current interaction is
click-to-place), arbitrary custom sub-grid block building, appliqué/image import, stash
photo scanning, fat-quarter cutting-map visual optimizer, design version history/comparison,
and on-point/diagonal layouts.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
```
