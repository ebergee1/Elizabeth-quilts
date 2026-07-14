import { useProject } from "../state/ProjectContext";
import { FABRICS_BY_ID } from "../data/fabricCatalog";
import { BLOCKS_BY_ID } from "../data/blockLibrary";
import BlockSVG from "./blocks/BlockSVG";
import {
  economyBlock,
  fatQuartersNeeded,
  bindingRequirement,
  backingRequirement,
  battingSize,
  toFraction,
} from "../lib/quiltMath";

export default function PatternExport() {
  const { project } = useProject();
  const econ = economyBlock(project.blockSize, { method: project.economyConfig.method, seam: project.seamAllowance });
  const binding = bindingRequirement({ finishedW: project.finishedW, finishedH: project.finishedH, stripWidth: project.bindingWidth });
  const backing = backingRequirement({ finishedW: project.finishedW, finishedH: project.finishedH, overhang: project.backingOverhang });
  const batting = battingSize({ finishedW: project.finishedW, finishedH: project.finishedH, overhang: project.backingOverhang });
  const def = BLOCKS_BY_ID.economy;

  const tally = {};
  const sizeForSlot = { A: econ.steps[0].cutSizeNum, B: econ.steps[1].cutSizeNum, C: econ.steps[2].cutSizeNum };
  const qtyForSlot = { A: econ.steps[0].cutQty, B: econ.steps[1].cutQty, C: econ.steps[2].cutQty };
  project.grid.forEach((cell) => {
    Object.entries(cell.fabrics).forEach(([slot, fabricId]) => {
      tally[fabricId] = tally[fabricId] || {};
      tally[fabricId][slot] = (tally[fabricId][slot] || 0) + qtyForSlot[slot];
    });
  });

  const palette = Object.keys(tally).map((id) => FABRICS_BY_ID[id]).filter(Boolean);

  return (
    <div style={{ background: "#f0ebe0", minHeight: "100%" }}>
      <div className="no-print" style={{ position: "sticky", top: 0, background: "var(--panel)", borderBottom: "1px solid var(--line)", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 5 }}>
        <div className="ui-text" style={{ fontSize: 13, color: "var(--charcoal-soft)" }}>
          Print-ready pattern. Use your browser's Print dialog and choose "Save as PDF" for a shareable file.
        </div>
        <button className="btn primary" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "40px 20px 100px" }}>
        {/* Cover */}
        <section className="panel" style={{ padding: 40, marginBottom: 24, textAlign: "center" }}>
          <div className="ui-label">Quilt Pattern</div>
          <h1 style={{ fontSize: 34, margin: "10px 0 6px" }}>{project.name}</h1>
          <div className="ui-text" style={{ fontSize: 15, color: "var(--charcoal-soft)" }}>
            Finished size {project.finishedW}" × {project.finishedH}" · {project.layout.cols}×{project.layout.rows} economy blocks at {project.blockSize}" finished
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${project.layout.cols}, 42px)`, gap: 2 }}>
              {project.grid.map((cell) => (
                <BlockSVG key={cell.id} block={def} fabrics={cell.fabrics} size={42} rotation={cell.rotation} mirror={cell.mirror} />
              ))}
            </div>
          </div>
          <div className="ui-text" style={{ marginTop: 16, fontSize: 12, color: "var(--charcoal-soft)" }}>
            Skill level: Intermediate · Construction: Pieced by machine · v1
          </div>
        </section>

        {/* Fabric requirements */}
        <section className="panel" style={{ padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontSize: 19, marginTop: 0 }}>Fabric requirements</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            {palette.map((f) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid var(--line)", borderRadius: 10, padding: "5px 10px" }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, background: f.hex, border: "1px solid rgba(0,0,0,0.15)" }} />
                <span className="ui-text" style={{ fontSize: 12.5 }}>{f.colorName}</span>
              </div>
            ))}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }} className="ui-text">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                <th style={{ padding: "6px 4px" }}>Fabric</th>
                <th style={{ padding: "6px 4px" }}>Role(s)</th>
                <th style={{ padding: "6px 4px" }}>Fat quarters</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(tally).map(([id, counts]) => {
                const f = FABRICS_BY_ID[id];
                const fq = Object.entries(counts).reduce((sum, [slot, qty]) => sum + fatQuartersNeeded(qty, sizeForSlot[slot], project.fatQuarter).fqNeeded, 0);
                return (
                  <tr key={id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "6px 4px" }}>{f?.colorName}</td>
                    <td style={{ padding: "6px 4px" }}>{Object.keys(counts).join(", ")}</td>
                    <td style={{ padding: "6px 4px" }}>{fq}</td>
                  </tr>
                );
              })}
              <tr>
                <td style={{ padding: "6px 4px" }}>Binding</td>
                <td style={{ padding: "6px 4px" }}>—</td>
                <td style={{ padding: "6px 4px" }}>{binding.yards} yd</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 4px" }}>Backing</td>
                <td style={{ padding: "6px 4px" }}>—</td>
                <td style={{ padding: "6px 4px" }}>{backing.yards} yd</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 4px" }}>Batting</td>
                <td style={{ padding: "6px 4px" }}>—</td>
                <td style={{ padding: "6px 4px" }}>{toFraction(batting.w)} × {toFraction(batting.h)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Block assembly */}
        <section className="panel" style={{ padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontSize: 19, marginTop: 0 }}>Economy block assembly ({project.grid.length} blocks)</h2>
          {econ.steps.map((s, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{i + 1}. {s.label} — cut {s.cutQty} at {s.cutSize}</div>
              <div className="ui-text" style={{ fontSize: 13, color: "var(--charcoal-soft)" }}>{s.detail}</div>
            </div>
          ))}
          {econ.checkpoints && (
            <div className="ui-text" style={{ fontSize: 13, marginTop: 8 }}>
              <strong>Trim checkpoints:</strong> {econ.checkpoints.map((c) => `${c.after} → ${c.trimToFraction}`).join("  ·  ")}
            </div>
          )}
        </section>

        {/* Layout */}
        <section className="panel" style={{ padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontSize: 19, marginTop: 0 }}>Quilt layout</h2>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${project.layout.cols}, 64px)`, gap: 3 }}>
              {project.grid.map((cell, i) => (
                <div key={cell.id} style={{ position: "relative" }}>
                  <BlockSVG block={def} fabrics={cell.fabrics} size={64} rotation={cell.rotation} mirror={cell.mirror} showSeamlines />
                  <div style={{ position: "absolute", top: 2, left: 3, fontSize: 9, background: "rgba(255,255,255,0.8)", padding: "0 3px", borderRadius: 3 }}>{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="ui-text" style={{ fontSize: 13, marginTop: 14, textAlign: "center" }}>
            Assemble in {project.layout.rows} rows of {project.layout.cols}. Sew blocks into rows, press seams alternating direction row to row, then join rows.
            Add borders ({toFraction(project.layout.borderWidth)} each side) after the body is assembled and squared.
          </div>
        </section>

        {/* Binding & finishing */}
        <section className="panel" style={{ padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontSize: 19, marginTop: 0 }}>Backing, batting & binding</h2>
          <ul className="ui-text" style={{ fontSize: 13.5, lineHeight: 1.8 }}>
            <li>Piece backing to at least {toFraction(backing.neededW)} × {toFraction(backing.neededH)} ({backing.pieced ? "2 panels seamed horizontally" : "single width"}).</li>
            <li>Baste with batting cut to {toFraction(batting.w)} × {toFraction(batting.h)}.</li>
            <li>Quilt as desired.</li>
            <li>Cut {binding.stripsNeeded} strips at {toFraction(binding.stripWidth)} × width of fabric for double-fold binding; join on the diagonal, press in half, attach with a 3/8" seam, miter corners.</li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 19, marginTop: 0 }}>Project notes</h2>
          <div className="ui-text" style={{ fontSize: 13, color: "var(--charcoal-soft)" }}>
            Generated by Quilt Studio · v1 · {new Date().toLocaleDateString()}. All measurements include a {toFraction(project.seamAllowance)} seam allowance unless noted as finished.
          </div>
        </section>
      </div>
    </div>
  );
}
