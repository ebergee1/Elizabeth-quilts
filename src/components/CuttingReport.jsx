import { Fragment, useMemo } from "react";
import { useProject } from "../state/ProjectContext";
import { FABRICS_BY_ID } from "../data/fabricCatalog";
import {
  economyBlock,
  fatQuartersNeeded,
  piecesPerFatQuarter,
  bindingRequirement,
  backingRequirement,
  battingSize,
  toFraction,
} from "../lib/quiltMath";

function tallyFabricPieces(project) {
  const econ = economyBlock(project.blockSize, { method: project.economyConfig.method, seam: project.seamAllowance });
  const stepBySlot = { A: econ.steps[0], B: econ.steps[1], C: econ.steps[2] };
  const bySlotSize = {};
  Object.entries(stepBySlot).forEach(([slot, step]) => {
    bySlotSize[slot] = { qtyPerBlock: step.cutQty, cutSizeText: step.cutSize };
  });

  const tally = {}; // fabricId -> { A: n, B: n, C: n }
  project.grid.forEach((cell) => {
    if (cell.blockType !== "economy") return;
    Object.entries(cell.fabrics).forEach(([slot, fabricId]) => {
      if (!fabricId) return;
      tally[fabricId] = tally[fabricId] || { A: 0, B: 0, C: 0 };
      tally[fabricId][slot] += bySlotSize[slot]?.qtyPerBlock || 0;
    });
  });

  return { tally, econ };
}

export default function CuttingReport() {
  const { project } = useProject();

  const { tally, econ } = useMemo(() => tallyFabricPieces(project), [project]);

  const aCutSize = econ.steps[0].cutSizeNum;
  const bCutSize = econ.steps[1].cutSizeNum;
  const cCutSize = econ.steps[2].cutSizeNum;
  const sizeForSlot = { A: aCutSize, B: bCutSize, C: cCutSize };

  const fqRows = Object.entries(tally).map(([fabricId, counts]) => {
    const fabric = FABRICS_BY_ID[fabricId];
    const rows = ["A", "B", "C"]
      .filter((s) => counts[s] > 0)
      .map((s) => {
        const size = sizeForSlot[s];
        const { perFQ, fqNeeded } = fatQuartersNeeded(counts[s], size, project.fatQuarter);
        return { slot: s, qty: counts[s], size, perFQ, fqNeeded };
      });
    const totalFQ = rows.reduce((sum, r) => sum + r.fqNeeded, 0);
    return { fabricId, fabric, rows, totalFQ };
  });

  const grandTotalFQ = fqRows.reduce((sum, r) => sum + r.totalFQ, 0);

  const binding = bindingRequirement({ finishedW: project.finishedW, finishedH: project.finishedH, stripWidth: project.bindingWidth });
  const backing = backingRequirement({ finishedW: project.finishedW, finishedH: project.finishedH, overhang: project.backingOverhang });
  const batting = battingSize({ finishedW: project.finishedW, finishedH: project.finishedH, overhang: project.backingOverhang });

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 26, margin: "0 0 4px" }}>Cutting & yardage</h1>
      <p className="ui-text" style={{ color: "var(--charcoal-soft)", marginTop: 0 }}>
        Computed directly from your {project.layout.cols}×{project.layout.rows} layout of {project.blockSize}" economy blocks, using the{" "}
        {project.economyConfig.method === "oversizeTrim" ? "oversize-and-trim" : "exact-piecing"} method.
      </p>

      <div className="panel" style={{ padding: 20, marginTop: 16 }}>
        <div className="ui-label" style={{ marginBottom: 12 }}>Fat quarters needed, by fabric</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }} className="ui-text">
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
              <th style={{ padding: "6px 4px" }}>Fabric</th>
              <th style={{ padding: "6px 4px" }}>Role</th>
              <th style={{ padding: "6px 4px" }}>Pieces needed</th>
              <th style={{ padding: "6px 4px" }}>Cut size</th>
              <th style={{ padding: "6px 4px" }}>Pieces / FQ</th>
              <th style={{ padding: "6px 4px" }}>FQs needed</th>
            </tr>
          </thead>
          <tbody>
            {fqRows.map(({ fabricId, fabric, rows, totalFQ }) => (
              <Fragment key={fabricId}>
                {rows.map((r, i) => (
                  <tr key={fabricId + r.slot} style={{ borderBottom: i === rows.length - 1 ? "1px solid var(--line)" : "none" }}>
                    <td style={{ padding: "6px 4px" }}>
                      {i === 0 && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 14, height: 14, borderRadius: 4, background: fabric?.hex, display: "inline-block", border: "1px solid rgba(0,0,0,0.15)" }} />
                          {fabric?.colorName} <span style={{ color: "var(--charcoal-soft)" }}>({fabric?.manufacturer.replace(" Fabrics", "")})</span>
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "6px 4px" }}>{r.slot === "A" ? "Center (A)" : r.slot === "B" ? "Round 1 (B)" : "Round 2 (C)"}</td>
                    <td style={{ padding: "6px 4px" }}>{r.qty}</td>
                    <td style={{ padding: "6px 4px" }}>{toFraction(r.size)} sq</td>
                    <td style={{ padding: "6px 4px" }}>{r.perFQ}</td>
                    <td style={{ padding: "6px 4px" }}>{r.fqNeeded}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={5} style={{ padding: "2px 4px", textAlign: "right", fontWeight: 700, color: "var(--charcoal-soft)" }}>
                    Subtotal
                  </td>
                  <td style={{ padding: "2px 4px", fontWeight: 700 }}>{totalFQ}</td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="ui-text" style={{ fontSize: 13, color: "var(--charcoal-soft)" }}>
            Based on a {project.fatQuarter.w}"×{project.fatQuarter.h}" usable fat quarter (edit in Setup if yours run smaller after prewash).
          </div>
          <div className="pill info" style={{ fontSize: 14 }}>{grandTotalFQ} fat quarters total</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div className="panel" style={{ padding: 20, flex: 1 }}>
          <div className="ui-label" style={{ marginBottom: 10 }}>Binding</div>
          <div className="ui-text" style={{ fontSize: 14, lineHeight: 1.7 }}>
            Perimeter: {toFraction(binding.perimeter)}<br />
            Strip width: {toFraction(binding.stripWidth)} (double-fold)<br />
            Strips needed: {binding.stripsNeeded}<br />
            <strong>Yardage: {binding.yards} yd</strong>
          </div>
        </div>
        <div className="panel" style={{ padding: 20, flex: 1 }}>
          <div className="ui-label" style={{ marginBottom: 10 }}>Backing</div>
          <div className="ui-text" style={{ fontSize: 14, lineHeight: 1.7 }}>
            Needed size: {toFraction(backing.neededW)} × {toFraction(backing.neededH)}<br />
            {backing.pieced ? `Pieced backing — ${backing.panels} panels seamed` : "Single width, no piecing needed"}<br />
            <strong>Yardage: {backing.yards} yd</strong>
          </div>
        </div>
        <div className="panel" style={{ padding: 20, flex: 1 }}>
          <div className="ui-label" style={{ marginBottom: 10 }}>Batting</div>
          <div className="ui-text" style={{ fontSize: 14, lineHeight: 1.7 }}>
            Cut size: {toFraction(batting.w)} × {toFraction(batting.h)}<br />
            ({project.backingOverhang}" overhang per side beyond the quilt top)
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: 20, marginTop: 20 }}>
        <div className="ui-label" style={{ marginBottom: 10 }}>Focal / novelty fabric</div>
        <div className="ui-text" style={{ fontSize: 14 }}>
          {project.grid.length} centers needed at {toFraction(aCutSize)} square (fussy-cut to center the dinosaur motif in each). Buy extra yardage of this
          print beyond the raw math below to allow for motif placement — fussy-cutting typically needs 30-50% more fabric than the straight cut count implies.
        </div>
      </div>
    </div>
  );
}
