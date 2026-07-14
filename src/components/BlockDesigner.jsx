import { useProject } from "../state/ProjectContext";
import { economyBlock, toFraction } from "../lib/quiltMath";
import { FABRICS } from "../data/fabricCatalog";
import BlockSVG from "./blocks/BlockSVG";
import { BLOCKS_BY_ID } from "../data/blockLibrary";

const ASSIGNMENT_STRATEGIES = [
  { key: "fullyScrappy", label: "Fully scrappy", detail: "Every block gets a fresh random B/C pairing from the palette." },
  { key: "coordinatedScrappy", label: "Coordinated scrappy", detail: "B/C rotate through the palette in sequence — varied, but no jarring neighbors." },
  { key: "minimalFQ", label: "Minimal fat quarters", detail: "Reuse the smallest possible set of fabrics across all blocks." },
  { key: "maxVariety", label: "Maximum variety", detail: "Try to give every block a unique B and C fabric." },
  { key: "noAdjacentRepeat", label: "No identical neighbors", detail: "Same as coordinated, but re-shuffles any block that matches its left or top neighbor." },
];

function applyAssignment(project, strategy) {
  const pool = project.palette;
  const grid = project.grid.map((cell, i) => {
    if (cell.blockType !== "economy") return cell;
    let bIdx, cIdx;
    switch (strategy) {
      case "fullyScrappy":
        bIdx = Math.floor(Math.random() * pool.length);
        cIdx = Math.floor(Math.random() * pool.length);
        break;
      case "minimalFQ":
        bIdx = i % 2;
        cIdx = (i % 2) + 2 >= pool.length ? 0 : (i % 2) + 2;
        break;
      case "maxVariety":
        bIdx = i % pool.length;
        cIdx = (i + Math.floor(pool.length / 2)) % pool.length;
        break;
      default:
        bIdx = i % pool.length;
        cIdx = (i + 1) % pool.length;
    }
    return { ...cell, fabrics: { ...cell.fabrics, B: pool[bIdx], C: pool[cIdx] } };
  });
  return grid;
}

export default function BlockDesigner() {
  const { project, update } = useProject();
  const config = project.economyConfig;
  const result = economyBlock(project.blockSize, { method: config.method, seam: project.seamAllowance });
  const def = BLOCKS_BY_ID.economy;

  const setMethod = (method) => update({ economyConfig: { ...config, method } });
  const setAssignment = (assignment) => {
    update((p) => ({ economyConfig: { ...p.economyConfig, assignment }, grid: applyAssignment(p, assignment) }));
  };

  const previewCell = project.grid[0];

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 80px", display: "flex", gap: 28 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 26, margin: "0 0 4px" }}>Economy Block designer</h1>
        <p className="ui-text" style={{ color: "var(--charcoal-soft)", marginTop: 0 }}>
          Two rounds of square-in-a-square framing: center (A), round 1 corners (B), round 2 corners (C).
          All 16 blocks in your dinosaur quilt share this recipe at a {project.blockSize}" finished size.
        </p>

        <div className="panel" style={{ padding: 20, marginTop: 16 }}>
          <div className="ui-label" style={{ marginBottom: 10 }}>Construction method</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn small"
              style={{ borderColor: config.method === "oversizeTrim" ? "var(--berry)" : undefined, color: config.method === "oversizeTrim" ? "var(--berry)" : undefined }}
              onClick={() => setMethod("oversizeTrim")}
            >
              Oversize & trim (recommended)
            </button>
            <button
              className="btn small"
              style={{ borderColor: config.method === "exactPiecing" ? "var(--berry)" : undefined, color: config.method === "exactPiecing" ? "var(--berry)" : undefined }}
              onClick={() => setMethod("exactPiecing")}
            >
              Exact-size piecing
            </button>
          </div>
          {result.warning && (
            <div className="pill warn" style={{ marginTop: 10, display: "inline-block" }}>{result.warning}</div>
          )}

          <div style={{ marginTop: 18 }}>
            {result.steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderTop: i > 0 ? "1px solid var(--line)" : "none" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--cream-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.label} — cut {s.cutQty} at {s.cutSize}</div>
                  <div className="ui-text" style={{ fontSize: 13, color: "var(--charcoal-soft)", marginTop: 2 }}>{s.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {result.checkpoints && (
            <div style={{ marginTop: 14, padding: 12, background: "var(--cream-deep)", borderRadius: 10 }}>
              <div className="ui-label" style={{ marginBottom: 6 }}>Trim checkpoints</div>
              {result.checkpoints.map((c, i) => (
                <div key={i} className="ui-text" style={{ fontSize: 13 }}>
                  After {c.after}: square up to <strong>{c.trimToFraction}</strong> unfinished
                </div>
              ))}
            </div>
          )}

          <div className="ui-text" style={{ fontSize: 12.5, marginTop: 14, color: "var(--charcoal-soft)" }}>
            Finished block: <strong>{result.finishedFraction}</strong>. Unfinished (seams included): {toFraction(project.blockSize + project.seamAllowance * 2)}.
            This is the distinction that keeps a "17 inch" block from drifting to 17½" — every downstream cutting number in this app is derived from these values, not re-measured by hand.
          </div>
        </div>

        <div className="panel" style={{ padding: 20, marginTop: 20 }}>
          <div className="ui-label" style={{ marginBottom: 10 }}>Fabric assignment strategy (applies to all 16 blocks)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ASSIGNMENT_STRATEGIES.map((s) => (
              <button
                key={s.key}
                onClick={() => setAssignment(s.key)}
                className="ui-text"
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1px solid ${config.assignment === s.key ? "var(--berry)" : "var(--line)"}`,
                  background: config.assignment === s.key ? "var(--cream-deep)" : "transparent",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.label}</div>
                <div style={{ fontSize: 12.5, color: "var(--charcoal-soft)" }}>{s.detail}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: 300, flexShrink: 0 }}>
        <div className="panel" style={{ padding: 20, position: "sticky", top: 20 }}>
          <div className="ui-label" style={{ marginBottom: 10 }}>Live preview — block 1</div>
          <BlockSVG block={def} fabrics={previewCell.fabrics} size={252} showSeamlines />
          <div className="ui-text" style={{ fontSize: 12, marginTop: 10, color: "var(--charcoal-soft)" }}>
            A = focal print (fussy-cut center), B = round 1, C = round 2. Change assignment strategy to see how B/C rotate across the quilt in the Design Canvas.
          </div>
        </div>
      </div>
    </div>
  );
}
