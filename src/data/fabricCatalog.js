// Starter fabric catalog — a small, representative seed dataset for Moda and Ruby Star
// Society so the fabric-planning workflow (bundles, palettes, cutting maps) has real
// structure to work against. Swatch colors are illustrative approximations, not verified
// pantone/print matches. A production build would replace this with a licensed or
// scraped catalog feed keyed by manufacturer SKU.

export const MANUFACTURERS = ["Moda Fabrics", "Ruby Star Society"];

export const FABRICS = [
  // --- Moda: Bella Solids (long-running solids line, real collection) ---
  { id: "moda-bella-charcoal", manufacturer: "Moda Fabrics", designer: "Moda House Designers", collection: "Bella Solids", sku: "9900-190", colorName: "Charcoal", hex: "#3a3733", print: "solid", scale: "n/a", directional: false, value: "dark", widthIn: 42, status: "current" },
  { id: "moda-bella-coral", manufacturer: "Moda Fabrics", designer: "Moda House Designers", collection: "Bella Solids", sku: "9900-84", colorName: "Coral", hex: "#e2795a", print: "solid", scale: "n/a", directional: false, value: "medium", widthIn: 42, status: "current" },
  { id: "moda-bella-cream", manufacturer: "Moda Fabrics", designer: "Moda House Designers", collection: "Bella Solids", sku: "9900-63", colorName: "Porcelain", hex: "#f4ecdc", print: "solid", scale: "n/a", directional: false, value: "light", widthIn: 42, status: "current" },
  { id: "moda-bella-fern", manufacturer: "Moda Fabrics", designer: "Moda House Designers", collection: "Bella Solids", sku: "9900-45", colorName: "Fern", hex: "#7c8f5f", print: "solid", scale: "n/a", directional: false, value: "medium", widthIn: 42, status: "current" },
  // --- Moda: Grunge (blender texture line, real collection) ---
  { id: "moda-grunge-mustard", manufacturer: "Moda Fabrics", designer: "BasicGrey", collection: "Grunge", sku: "30150-249", colorName: "Mustard", hex: "#cf9a34", print: "blender", scale: "small", directional: false, value: "medium", widthIn: 42, status: "current" },
  { id: "moda-grunge-armor", manufacturer: "Moda Fabrics", designer: "BasicGrey", collection: "Grunge", sku: "30150-169", colorName: "Armor", hex: "#5c6570", print: "blender", scale: "small", directional: false, value: "dark", widthIn: 42, status: "current" },
  { id: "moda-grunge-paperwhite", manufacturer: "Moda Fabrics", designer: "BasicGrey", collection: "Grunge", sku: "30150-101", colorName: "Paper White", hex: "#f1ece2", print: "blender", scale: "small", directional: false, value: "light", widthIn: 42, status: "current" },
  // --- Moda: dino-friendly novelty placeholder for a kids' print collection ---
  { id: "moda-dino-novelty", manufacturer: "Moda Fabrics", designer: "Sample Studio", collection: "Prehistoric Pals (sample)", sku: "SAMPLE-DINO-01", colorName: "Multi Dino Toss", hex: "#9fae7a", print: "novelty", scale: "large", directional: false, value: "medium", widthIn: 42, status: "sample-data" },

  // --- Ruby Star Society: Speckled (real, long-running blender line) ---
  { id: "rss-speckled-warm", manufacturer: "Ruby Star Society", designer: "Ruby Star Society", collection: "Speckled", sku: "RS5027-40", colorName: "Warm Sand", hex: "#e3cda5", print: "blender", scale: "small", directional: false, value: "light", widthIn: 42, status: "current" },
  { id: "rss-speckled-berry", manufacturer: "Ruby Star Society", designer: "Ruby Star Society", collection: "Speckled", sku: "RS5027-46", colorName: "Berry", hex: "#8f2d52", print: "blender", scale: "small", directional: false, value: "dark", widthIn: 42, status: "current" },
  { id: "rss-speckled-bark", manufacturer: "Ruby Star Society", designer: "Ruby Star Society", collection: "Speckled", sku: "RS5027-13", colorName: "Bark", hex: "#4a3d33", print: "blender", scale: "small", directional: false, value: "dark", widthIn: 42, status: "current" },
  { id: "rss-speckled-citrus", manufacturer: "Ruby Star Society", designer: "Ruby Star Society", collection: "Speckled", sku: "RS5027-33", colorName: "Citrus", hex: "#e8a23a", print: "blender", scale: "small", directional: false, value: "medium", widthIn: 42, status: "current" },
  // --- Ruby Star Society: Rise/Firefly style sample geometrics ---
  { id: "rss-geo-teal", manufacturer: "Ruby Star Society", designer: "Melody Miller", collection: "Sample Geometrics", sku: "SAMPLE-RSS-GEO-1", colorName: "Teal Bolt", hex: "#3f7f80", print: "geometric", scale: "medium", directional: false, value: "medium", widthIn: 42, status: "sample-data" },
  { id: "rss-geo-coral", manufacturer: "Ruby Star Society", designer: "Melody Miller", collection: "Sample Geometrics", sku: "SAMPLE-RSS-GEO-2", colorName: "Coral Bolt", hex: "#e8734a", print: "geometric", scale: "medium", directional: false, value: "medium", widthIn: 42, status: "sample-data" },
];

export const FABRICS_BY_ID = Object.fromEntries(FABRICS.map((f) => [f.id, f]));

export const BUNDLES = [
  {
    id: "rss-speckled-fq-bundle",
    manufacturer: "Ruby Star Society",
    collection: "Speckled",
    name: "Speckled — Fat Quarter Bundle (sample, 4pc)",
    pieceCount: 4,
    pieceType: "fat quarter",
    pieceW: 18,
    pieceH: 21,
    fabricIds: ["rss-speckled-warm", "rss-speckled-berry", "rss-speckled-bark", "rss-speckled-citrus"],
  },
  {
    id: "moda-bella-fq-bundle",
    manufacturer: "Moda Fabrics",
    collection: "Bella Solids",
    name: "Bella Solids — Curated Fat Quarter Bundle (sample, 4pc)",
    pieceCount: 4,
    pieceType: "fat quarter",
    pieceW: 18,
    pieceH: 21,
    fabricIds: ["moda-bella-charcoal", "moda-bella-coral", "moda-bella-cream", "moda-bella-fern"],
  },
];
