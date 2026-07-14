# Quilt Studio — Product Spec

Quilt-design CAD + fabric planner + cutting optimizer + pattern writer. The goal is a tool
that goes from "what size quilt do you want" to a printable pattern with a verified fabric
shopping list, without the user doing trigonometry on graph paper.

## Guiding workflow

1. **Start with the quilt.** Size, block size, seam allowance, borders/sashing, fabric
   format (yardage / fat quarters / fat eighths / precuts / scraps / stash), skill level,
   construction method. The app checks immediately whether the block size divides evenly
   into the quilt dimensions and proposes fixes when it doesn't.
2. **Design on a canvas.** Figma-like workspace: block library on the left, grid in the
   center, inspector on the right, fabric/cutting summary in a bottom drawer.
3. **Design or configure blocks.** Each block type opens its own editor with the exact
   piece list, fabric-assignment rules, and construction method tradeoffs.
4. **Pull in real fabric.** A manufacturer-backed catalog (starting with Moda and Ruby Star
   Society), fat-quarter/bundle import, and a project palette.
5. **Assign fabric intelligently.** Strategies like fully scrappy, coordinated scrappy,
   minimal fat quarters, maximum variety, or no-adjacent-repeats — with warnings for low
   contrast, inconsistent directional prints, or fabric shortages.
6. **Compute cutting and yardage.** Every unit type supports more than one construction
   method (two-at-a-time vs. no-waste vs. oversize-and-trim vs. foundation paper piecing),
   and the app is explicit about the fabric-efficiency/accuracy/complexity tradeoff instead
   of silently picking one.
7. **Optimize fat-quarter cutting.** A cutting map per fat quarter, optimized across the
   whole project rather than block-by-block, showing usable leftovers and where they get
   reused.
8. **Write the pattern.** A PDF generated from the actual design — not a generic template —
   with fabric requirements, cutting charts, fat-quarter diagrams, block assembly, layout,
   borders/binding/backing, and clear finished/unfinished/cut-size labeling throughout.
9. **Track design history.** Save and compare versions (e.g. "QST filler" vs. "economy
   block filler") side by side on appearance, fabric usage, piece count, waste, and cost.

## Screen layout

- **Top bar:** project name, undo/redo, quilt size, finished/unfinished toggle, Calculate,
  Export Pattern.
- **Left sidebar:** block library (basic units, traditional blocks, custom/saved blocks),
  fabric library, stash, appliqué/image import.
- **Center canvas:** gridded quilt workspace with row/column labels, drag-and-drop, zoom
  from full-quilt to seam-level detail.
- **Right inspector:** selected block's dimensions, fabric assignments, rotation,
  construction method, piece counts, warnings.
- **Bottom drawer:** fabric requirements, cutting plan, waste summary, blocks still needing
  fabric, estimated cost.

## Block library

**Basic units:** square, rectangle, half-square triangle, quarter-square triangle,
hourglass, half-rectangle triangle, flying geese, snowball corner, stitch-and-flip corner,
strip unit, four-patch, nine-patch.

**Traditional blocks:** economy block, sawtooth star, Ohio star, friendship star, churn
dash, log cabin, courthouse steps, pinwheel, bear paw, square-in-a-square, Irish chain,
variable star.

**Custom blocks:** build from a sub-grid, import an image or appliqué shape, save as a
reusable block, alternate colorways, directional-fabric rules.

## Fabric database

Per fabric: manufacturer, designer, collection, release, SKU, color name, image swatch,
repeat size, fabric width, directional/nondirectional, scale, dominant colors, background
color, print type, available precuts, status (current/retired/unknown), user ownership and
quantity. Search by collection/SKU/color/designer/keyword; import a bundle; add individual
fabrics to a project palette; photograph/upload stash fabrics; mark fabrics must-use,
optional, or do-not-cut; substitute visually similar fabrics; save custom bundles.

## Cutting & yardage engine

Computes, per fabric: piece count by shape, finished/unfinished/cut dimensions, fat
quarters or yardage required, strip counts, WOF assumptions, binding yardage, backing
yardage (single-width or pieced), batting size, sashing/border/cornerstone yardage, buffer
for shrinkage/mistakes/directional fabric, and remaining scraps. Supports multiple
construction methods per unit type (e.g. HST two-at-a-time / four-at-a-time / eight-at-a-time
/ oversized-and-trimmed / foundation paper pieced) and always shows the tradeoff rather than
picking one silently.

## Fat-quarter cutting optimizer

Per fat quarter: usable dimensions, selvage/trim allowance, required pieces, cutting order,
leftover areas and where they're reused elsewhere in the project. Optimized across the whole
quilt, not block-by-block. Optional objectives: fewest fat quarters, easiest cutting,
largest useful leftovers, lowest total waste.

## Pattern instructions generator

PDF sections: cover + finished size, skill level, fabric requirements, fabric key with
swatches, cutting chart by fabric, fat-quarter cutting diagrams, block assembly diagrams,
pressing instructions, trim checkpoints, quilt layout diagram, row assembly, borders and
sashing, backing and binding, printable block-location labels, optional coloring sheet,
project notes and version number. Finished size, unfinished unit size, cut size, and
trim-to size are always labeled separately.

## Design history

Save named versions (e.g. "Dinosaur — QST filler," "Dinosaur — economy block," "Dinosaur —
scrappy economy") and compare two side by side: appearance, fabric usage, piece count,
estimated cutting/sewing time, waste, and cost.

## Visual style

Warm quilting-studio interface: cream canvas, charcoal text, berry and coral accents,
tactile-feeling fabric swatches, rounded panels, generous white space so the quilt itself
stays the focus.

## Build phases

**Phase 1 (this prototype):** standard/custom sizing with feasibility check, square
layouts with sashing/borders, core basic units + economy block with full cutting math,
fabric seed catalog + palette + bundle import, fat-quarter and yardage math, binding/backing
/batting calculators, printable pattern export.

**Phase 2:** true drag-and-drop with multi-select/rotate/mirror at the canvas level,
arbitrary custom block sub-grid builder, on-point/diagonal settings, fat-quarter cutting-map
visual optimizer with leftover reuse, design version history and side-by-side comparison,
smart fabric-assignment warnings (contrast, directional consistency, repeat clustering).

**Phase 3:** full manufacturer catalog ingestion beyond the seed set, appliqué/image import,
stash photo scanning and auto-matching, cost estimation, foundation-paper-piecing PDF
generation, multi-user project sharing.
