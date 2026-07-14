import { useState } from "react";
import { useProject } from "../state/ProjectContext";
import { FABRICS, BUNDLES, MANUFACTURERS } from "../data/fabricCatalog";

function Swatch({ f, size = 46 }) {
  return (
    <div
      title={`${f.colorName} — ${f.sku}`}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: f.hex,
        border: "1px solid rgba(43,38,32,0.15)",
        flexShrink: 0,
        backgroundImage:
          f.print === "blender"
            ? `radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)`
            : f.print === "novelty"
            ? `radial-gradient(rgba(255,255,255,0.4) 3px, transparent 3px)`
            : f.print === "geometric"
            ? `repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 4px, transparent 4px 8px)`
            : "none",
        backgroundSize: f.print === "blender" ? "6px 6px" : f.print === "novelty" ? "14px 14px" : undefined,
      }}
    />
  );
}

export default function FabricLibrary() {
  const { project, update } = useProject();
  const [query, setQuery] = useState("");
  const [manufacturer, setManufacturer] = useState("All");

  const filtered = FABRICS.filter((f) => {
    const matchesQ = !query || `${f.collection} ${f.colorName} ${f.designer} ${f.sku}`.toLowerCase().includes(query.toLowerCase());
    const matchesM = manufacturer === "All" || f.manufacturer === manufacturer;
    return matchesQ && matchesM;
  });

  const inPalette = (id) => project.palette.includes(id);
  const togglePalette = (id) =>
    update((p) => ({ palette: p.palette.includes(id) ? p.palette.filter((x) => x !== id) : [...p.palette, id] }));

  const importBundle = (bundle) => update({ palette: [...new Set([...project.palette, ...bundle.fabricIds])] });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 26, margin: "0 0 4px" }}>Fabric library</h1>
      <p className="ui-text" style={{ color: "var(--charcoal-soft)", marginTop: 0 }}>
        Starter catalog covering Moda and Ruby Star Society. Entries marked <em>sample-data</em> are illustrative placeholders standing in for a full manufacturer feed.
      </p>

      <div style={{ display: "flex", gap: 10, margin: "16px 0" }}>
        <input type="text" placeholder="Search collection, color, designer, SKU…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 320 }} />
        <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}>
          <option>All</option>
          {MANUFACTURERS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="panel" style={{ padding: 18, marginBottom: 20 }}>
        <div className="ui-label" style={{ marginBottom: 10 }}>Fat quarter bundles</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {BUNDLES.map((b) => (
            <div key={b.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 12, width: 260 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {b.fabricIds.map((id) => {
                  const f = FABRICS.find((x) => x.id === id);
                  return <Swatch key={id} f={f} size={30} />;
                })}
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{b.name}</div>
              <div className="ui-text" style={{ fontSize: 12, color: "var(--charcoal-soft)", margin: "4px 0 10px" }}>
                {b.pieceCount} pieces · {b.pieceW}"×{b.pieceH}" each (editable after import)
              </div>
              <button className="btn small primary" onClick={() => importBundle(b)}>Import to project palette</button>
            </div>
          ))}
        </div>
      </div>

      <div className="ui-label" style={{ marginBottom: 10 }}>Catalog ({filtered.length})</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
        {filtered.map((f) => (
          <div key={f.id} className="panel" style={{ padding: 12, display: "flex", gap: 10 }}>
            <Swatch f={f} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{f.colorName}</div>
              <div className="ui-text" style={{ fontSize: 11.5, color: "var(--charcoal-soft)" }}>
                {f.manufacturer} · {f.collection}
              </div>
              <div className="ui-text" style={{ fontSize: 11, color: "var(--charcoal-soft)" }}>SKU {f.sku}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                <span className="pill info">{f.print}</span>
                {f.status === "sample-data" && <span className="pill warn">sample data</span>}
              </div>
              <button
                className="btn small"
                style={{ marginTop: 8, width: "100%", borderColor: inPalette(f.id) ? "var(--berry)" : undefined, color: inPalette(f.id) ? "var(--berry)" : undefined }}
                onClick={() => togglePalette(f.id)}
              >
                {inPalette(f.id) ? "In project palette ✓" : "Add to palette"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
