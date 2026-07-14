import { createContext, useContext, useMemo, useState } from "react";
import { FABRICS_BY_ID } from "../data/fabricCatalog";

const ProjectContext = createContext(null);

function makeDinoBlock(i, palette) {
  const bcOptions = palette.length ? palette : ["rss-speckled-berry", "rss-speckled-citrus"];
  const b = bcOptions[i % bcOptions.length];
  const c = bcOptions[(i + 1) % bcOptions.length];
  return {
    id: `blk-${i}`,
    blockType: "economy",
    rotation: 0,
    mirror: false,
    fabrics: { A: "moda-dino-novelty", B: b, C: c },
  };
}

const DEFAULT_PALETTE = ["rss-speckled-warm", "rss-speckled-berry", "rss-speckled-bark", "rss-speckled-citrus"];

function defaultProject() {
  const cols = 4, rows = 4;
  const grid = Array.from({ length: cols * rows }, (_, i) => makeDinoBlock(i, DEFAULT_PALETTE));
  return {
    name: "Dinosaur Quilt",
    sizeMode: "custom",
    sizeLabel: "Custom (68\" x 68\")",
    finishedW: 68,
    finishedH: 68,
    seamAllowance: 0.25,
    blockSize: 17,
    layout: { cols, rows, sashing: 0, borderWidth: 0 },
    grid,
    economyConfig: { method: "oversizeTrim", assignment: "coordinatedScrappy" },
    palette: DEFAULT_PALETTE,
    focalFabric: "moda-dino-novelty",
    bindingWidth: 2.5,
    backingOverhang: 4,
    fatQuarter: { w: 18, h: 21 },
  };
}

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(defaultProject);
  const [tab, setTab] = useState("setup");
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(null);

  const update = (patch) => setProject((p) => ({ ...p, ...(typeof patch === "function" ? patch(p) : patch) }));

  const updateBlock = (index, patch) =>
    setProject((p) => {
      const grid = [...p.grid];
      grid[index] = { ...grid[index], ...(typeof patch === "function" ? patch(grid[index]) : patch) };
      return { ...p, grid };
    });

  const resizeGrid = (cols, rows) =>
    setProject((p) => {
      const total = cols * rows;
      const grid = Array.from({ length: total }, (_, i) => p.grid[i] || makeDinoBlock(i, p.palette));
      return { ...p, layout: { ...p.layout, cols, rows }, grid };
    });

  const fabricFor = (id) => FABRICS_BY_ID[id];

  const value = useMemo(
    () => ({ project, setProject, update, updateBlock, resizeGrid, fabricFor, tab, setTab, selectedBlockIndex, setSelectedBlockIndex }),
    [project, tab, selectedBlockIndex]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
