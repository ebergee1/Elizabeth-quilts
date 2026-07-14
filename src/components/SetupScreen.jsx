import { useState } from "react";
import { useProject } from "../state/ProjectContext";
import { STANDARD_SIZES, checkFit, toFraction } from "../lib/quiltMath";

const SKILL_LEVELS = ["Beginner", "Confident Beginner", "Intermediate", "Advanced"];
const CONSTRUCTION = ["Piecing (machine)", "Foundation paper piecing", "Hand piecing", "English paper piecing"];

export default function SetupScreen() {
  const { project, update, resizeGrid, setTab } = useProject();
  const [customW, setCustomW] = useState(project.finishedW);
  const [customH, setCustomH] = useState(project.finishedH);
  const [blockSize, setBlockSize] = useState(project.blockSize);
  const [cols, setCols] = useState(project.layout.cols);
  const [rows, setRows] = useState(project.layout.rows);
  const [sashing, setSashing] = useState(project.layout.sashing);
  const [borderWidth, setBorderWidth] = useState(project.layout.borderWidth);
  const [seam, setSeam] = useState(project.seamAllowance);
  const [fabricFormat, setFabricFormat] = useState("Fat Quarters");
  const [skill, setSkill] = useState("Intermediate");
  const [construction, setConstruction] = useState("Piecing (machine)");

  const fit = checkFit({ finishedW: customW, finishedH: customH, blockSize, cols, rows, sashing, borderWidth });

  const applyStandard = (s) => {
    setCustomW(s.w);
    setCustomH(s.h);
  };

  const commit = () => {
    update({
      finishedW: customW,
      finishedH: customH,
      sizeLabel: `${customW}" x ${customH}"`,
      blockSize,
      layout: { cols, rows, sashing, borderWidth },
      seamAllowance: seam,
    });
    resizeGrid(cols, rows);
    setTab("canvas");
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 24px 80px" }}>
      <h1 style={{ fontSize: 28, margin: "0 0 4px" }}>Start a new quilt</h1>
      <p className="ui-text" style={{ color: "var(--charcoal-soft)", marginTop: 0 }}>
        Pick a size, a block, and how you'll shop for fabric — everything downstream (canvas, cutting, yardage) follows from these numbers.
      </p>

      <div className="panel" style={{ padding: 24, marginTop: 20 }}>
        <div className="ui-label">1. Quilt size</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          {STANDARD_SIZES.map((s) => (
            <button
              key={s.key}
              className="btn small"
              style={{
                borderColor: customW === s.w && customH === s.h ? "var(--berry)" : undefined,
                color: customW === s.w && customH === s.h ? "var(--berry)" : undefined,
              }}
              onClick={() => applyStandard(s)}
            >
              {s.label} — {s.w}"×{s.h}"
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 16, alignItems: "center" }}>
          <label className="ui-text" style={{ fontSize: 13 }}>
            Custom finished width
            <input type="number" value={customW} onChange={(e) => setCustomW(+e.target.value)} style={{ display: "block", width: 110, marginTop: 4 }} />
          </label>
          <label className="ui-text" style={{ fontSize: 13 }}>
            Custom finished height
            <input type="number" value={customH} onChange={(e) => setCustomH(+e.target.value)} style={{ display: "block", width: 110, marginTop: 4 }} />
          </label>
          <label className="ui-text" style={{ fontSize: 13 }}>
            Seam allowance
            <select value={seam} onChange={(e) => setSeam(+e.target.value)} style={{ display: "block", width: 110, marginTop: 4 }}>
              <option value={0.25}>1/4" (standard)</option>
              <option value={0.5}>1/2"</option>
            </select>
          </label>
        </div>
      </div>

      <div className="panel" style={{ padding: 24, marginTop: 20 }}>
        <div className="ui-label">2. Block layout</div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          <label className="ui-text" style={{ fontSize: 13 }}>
            Finished block size
            <input type="number" value={blockSize} onChange={(e) => setBlockSize(+e.target.value)} style={{ display: "block", width: 100, marginTop: 4 }} />
          </label>
          <label className="ui-text" style={{ fontSize: 13 }}>
            Columns
            <input type="number" value={cols} min={1} onChange={(e) => setCols(+e.target.value)} style={{ display: "block", width: 90, marginTop: 4 }} />
          </label>
          <label className="ui-text" style={{ fontSize: 13 }}>
            Rows
            <input type="number" value={rows} min={1} onChange={(e) => setRows(+e.target.value)} style={{ display: "block", width: 90, marginTop: 4 }} />
          </label>
          <label className="ui-text" style={{ fontSize: 13 }}>
            Sashing width
            <input type="number" value={sashing} onChange={(e) => setSashing(+e.target.value)} style={{ display: "block", width: 90, marginTop: 4 }} />
          </label>
          <label className="ui-text" style={{ fontSize: 13 }}>
            Border width (each side)
            <input type="number" value={borderWidth} onChange={(e) => setBorderWidth(+e.target.value)} style={{ display: "block", width: 90, marginTop: 4 }} />
          </label>
        </div>

        <div style={{ marginTop: 18, padding: 16, borderRadius: 12, background: fit.fits ? "#eef4e8" : "#fbeee0" }}>
          <div className={`pill ${fit.fits ? "ok" : "warn"}`}>{fit.fits ? "Fits exactly" : "Doesn't divide evenly"}</div>
          <div className="ui-text" style={{ marginTop: 8, fontSize: 14 }}>
            {cols}×{rows} blocks at {toFraction(blockSize)} + {toFraction(sashing)} sashing + {toFraction(borderWidth)} borders ={" "}
            <strong>{toFraction(fit.totalW)} × {toFraction(fit.totalH)}</strong>{" "}
            {fit.fits ? "— matches your target." : `— target is ${customW}" × ${customH}".`}
          </div>
          {!fit.fits && (
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 18 }}>
              {fit.suggestions.map((s, i) => (
                <li key={i} className="ui-text" style={{ fontSize: 13.5, marginBottom: 4 }}>
                  {s.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="panel" style={{ padding: 24, marginTop: 20 }}>
        <div className="ui-label">3. Fabric format & skill</div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          <label className="ui-text" style={{ fontSize: 13 }}>
            Fabric format
            <select value={fabricFormat} onChange={(e) => setFabricFormat(e.target.value)} style={{ display: "block", width: 220, marginTop: 4 }}>
              {["Yardage", "Fat Quarters", "Fat Eighths", "Precuts (jelly roll / charm)", "Scraps / Stash"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="ui-text" style={{ fontSize: 13 }}>
            Skill level
            <select value={skill} onChange={(e) => setSkill(e.target.value)} style={{ display: "block", width: 200, marginTop: 4 }}>
              {SKILL_LEVELS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="ui-text" style={{ fontSize: 13 }}>
            Construction method
            <select value={construction} onChange={(e) => setConstruction(e.target.value)} style={{ display: "block", width: 220, marginTop: 4 }}>
              {CONSTRUCTION.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <button className="btn primary" onClick={commit} style={{ padding: "12px 28px", fontSize: 14 }}>
          Continue to Design Canvas →
        </button>
      </div>
    </div>
  );
}
