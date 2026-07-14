import { useState } from "react";
import { useProject } from "../state/ProjectContext";
import { BASIC_UNITS, TRADITIONAL_BLOCKS, BLOCKS_BY_ID } from "../data/blockLibrary";
import { FABRICS, FABRICS_BY_ID } from "../data/fabricCatalog";
import BlockSVG from "./blocks/BlockSVG";
import { economyBlock } from "../lib/quiltMath";

function LibraryBlock({ block, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="ui-text"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: 8,
        border: `1px solid ${active ? "var(--berry)" : "var(--line)"}`,
        background: active ? "var(--cream-deep)" : "var(--panel)",
        borderRadius: 10,
        marginBottom: 6,
        textAlign: "left",
      }}
    >
      <BlockSVG block={block} size={36} />
      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{block.name}</span>
    </button>
  );
}

export default function DesignCanvas() {
  const { project, updateBlock, selectedBlockIndex, setSelectedBlockIndex } = useProject();
  const [activeBlockType, setActiveBlockType] = useState(null);
  const [showSeams, setShowSeams] = useState(false);
  const [showUnfinished, setShowUnfinished] = useState(false);

  const { cols, rows } = project.layout;
  const cellPx = Math.min(560 / cols, 560 / rows, 110);

  const placeBlock = (index) => {
    if (!activeBlockType) {
      setSelectedBlockIndex(index);
      return;
    }
    const def = BLOCKS_BY_ID[activeBlockType];
    const fabrics = {};
    def.slots.forEach((s, i) => {
      const pool = project.palette;
      fabrics[s] = s === "A" && def.id === "economy" ? project.focalFabric : pool[i % pool.length];
    });
    updateBlock(index, { blockType: activeBlockType, fabrics, rotation: 0, mirror: false });
    setSelectedBlockIndex(index);
  };

  const selected = selectedBlockIndex != null ? project.grid[selectedBlockIndex] : null;
  const selectedDef = selected ? BLOCKS_BY_ID[selected.blockType] : null;

  const rotate = () => updateBlock(selectedBlockIndex, (b) => ({ rotation: (b.rotation + 90) % 360 }));
  const mirror = () => updateBlock(selectedBlockIndex, (b) => ({ mirror: !b.mirror }));
  const setSlotFabric = (slot, fabricId) => updateBlock(selectedBlockIndex, (b) => ({ fabrics: { ...b.fabrics, [slot]: fabricId } }));

  const econ = selectedDef?.id === "economy" ? economyBlock(project.blockSize, { method: project.economyConfig.method, seam: project.seamAllowance }) : null;

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      {/* Left: block library */}
      <div className="no-print" style={{ width: 220, borderRight: "1px solid var(--line)", overflowY: "auto", padding: 14, background: "var(--panel)" }}>
        <div className="ui-label" style={{ marginBottom: 8 }}>Basic Units</div>
        {BASIC_UNITS.map((b) => (
          <LibraryBlock key={b.id} block={b} active={activeBlockType === b.id} onClick={() => setActiveBlockType(activeBlockType === b.id ? null : b.id)} />
        ))}
        <div className="ui-label" style={{ margin: "14px 0 8px" }}>Traditional Blocks</div>
        {TRADITIONAL_BLOCKS.map((b) => (
          <LibraryBlock key={b.id} block={b} active={activeBlockType === b.id} onClick={() => setActiveBlockType(activeBlockType === b.id ? null : b.id)} />
        ))}
        <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--charcoal-soft)", lineHeight: 1.5 }} className="ui-text">
          Select a block, then click a grid cell to place it. Click a placed block to select it and assign fabrics on the right.
        </div>
      </div>

      {/* Center: grid */}
      <div style={{ flex: 1, overflow: "auto", padding: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <button className="btn small" onClick={() => setShowSeams((v) => !v)}>{showSeams ? "Hide" : "Show"} seamlines</button>
          <button className="btn small" onClick={() => setShowUnfinished((v) => !v)}>{showUnfinished ? "Finished" : "Unfinished"} size labels</button>
        </div>

        <div
          className="panel"
          style={{
            padding: project.layout.borderWidth * 2 + 6,
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
              gap: project.layout.sashing ? Math.max(project.layout.sashing * 3, 4) : 2,
              background: project.layout.sashing ? "var(--cream-deep)" : "transparent",
              padding: project.layout.sashing ? 10 : 0,
            }}
          >
            {project.grid.map((cell, i) => {
              const def = BLOCKS_BY_ID[cell.blockType];
              return (
                <div
                  key={cell.id}
                  onClick={() => placeBlock(i)}
                  style={{
                    width: cellPx,
                    height: cellPx,
                    cursor: "pointer",
                    outline: selectedBlockIndex === i ? "2px solid var(--berry)" : "1px solid rgba(43,38,32,0.08)",
                    outlineOffset: -1,
                    position: "relative",
                  }}
                >
                  <BlockSVG block={def} fabrics={cell.fabrics} size={cellPx} rotation={cell.rotation} mirror={cell.mirror} showSeamlines={showSeams} />
                  {showUnfinished && (
                    <div style={{ position: "absolute", bottom: 2, right: 3, fontSize: 8, background: "rgba(255,255,255,0.85)", padding: "0 3px", borderRadius: 3 }}>
                      {(project.blockSize + project.seamAllowance * 2).toFixed(2)}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="ui-text" style={{ marginTop: 14, fontSize: 12.5, color: "var(--charcoal-soft)" }}>
          Finished quilt: {project.finishedW}" × {project.finishedH}" · {cols}×{rows} · {project.blockSize}" blocks
        </div>
      </div>

      {/* Right: inspector */}
      <div className="no-print" style={{ width: 280, borderLeft: "1px solid var(--line)", overflowY: "auto", padding: 16, background: "var(--panel)" }}>
        <div className="ui-label">Inspector</div>
        {!selected && <div className="ui-text" style={{ fontSize: 13, marginTop: 10, color: "var(--charcoal-soft)" }}>Select a placed block to edit it.</div>}
        {selected && selectedDef && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedDef.name}</div>
            <div className="ui-text" style={{ fontSize: 12.5, color: "var(--charcoal-soft)", marginBottom: 10 }}>
              Block {selectedBlockIndex + 1} of {project.grid.length}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button className="btn small" onClick={rotate}>Rotate 90°</button>
              <button className="btn small" onClick={mirror}>Mirror</button>
            </div>

            <div className="ui-label" style={{ marginBottom: 6 }}>Fabric assignment</div>
            {selectedDef.slots.map((slot) => (
              <div key={slot} style={{ marginBottom: 8 }}>
                <div className="ui-text" style={{ fontSize: 12, marginBottom: 3 }}>Slot {slot}</div>
                <select
                  value={selected.fabrics[slot] || ""}
                  onChange={(e) => setSlotFabric(slot, e.target.value)}
                  style={{ width: "100%" }}
                >
                  {FABRICS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.manufacturer.replace(" Fabrics", "")} · {f.colorName}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {econ && (
              <div style={{ marginTop: 16, padding: 10, background: "var(--cream-deep)", borderRadius: 10 }}>
                <div className="ui-label" style={{ marginBottom: 6 }}>Piece counts (this block)</div>
                {econ.steps.map((s, i) => (
                  <div key={i} className="ui-text" style={{ fontSize: 12, marginBottom: 3 }}>
                    {s.label}: {s.cutQty} @ {s.cutSize}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="ui-label" style={{ marginTop: 22 }}>Warnings</div>
        <WarningsList />
      </div>
    </div>
  );
}

function WarningsList() {
  const { project } = useProject();
  const warnings = [];
  const seen = new Set();
  project.grid.forEach((cell, i) => {
    const key = JSON.stringify(cell.fabrics);
    const prevKey = i % project.layout.cols !== 0 ? JSON.stringify(project.grid[i - 1]?.fabrics) : null;
    if (prevKey && key === prevKey) warnings.push(`Blocks ${i} and ${i + 1} use identical fabrics and are adjacent.`);
  });
  if (warnings.length === 0) return <div className="ui-text" style={{ fontSize: 12.5, color: "var(--sage)" }}>No layout warnings.</div>;
  return (
    <div>
      {warnings.slice(0, 5).map((w, i) => (
        <div key={i} className="pill warn" style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
          {w}
        </div>
      ))}
    </div>
  );
}
