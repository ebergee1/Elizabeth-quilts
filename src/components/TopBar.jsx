import { useProject } from "../state/ProjectContext";

const TABS = [
  { key: "setup", label: "Quilt Setup" },
  { key: "canvas", label: "Design Canvas" },
  { key: "blockdesigner", label: "Block Designer" },
  { key: "fabrics", label: "Fabric Library" },
  { key: "cutting", label: "Cutting & Yardage" },
  { key: "export", label: "Pattern Export" },
];

export default function TopBar() {
  const { project, tab, setTab } = useProject();

  return (
    <div
      className="no-print"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "10px 20px",
        borderBottom: "1px solid var(--line)",
        background: "var(--panel)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: "linear-gradient(135deg, var(--berry), var(--coral))",
          }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>{project.name}</div>
          <div className="ui-label" style={{ fontWeight: 500 }}>
            {project.sizeLabel} · {project.blockSize}" blocks · {project.layout.cols}×{project.layout.rows}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginLeft: 24, flex: 1 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="ui-text"
            style={{
              border: "none",
              background: tab === t.key ? "var(--cream-deep)" : "transparent",
              color: tab === t.key ? "var(--berry)" : "var(--charcoal-soft)",
              fontWeight: tab === t.key ? 700 : 500,
              padding: "8px 14px",
              borderRadius: 10,
              fontSize: 13.5,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn small ghost">Undo</button>
        <button className="btn small ghost">Redo</button>
        <button className="btn small" onClick={() => setTab("cutting")}>Calculate</button>
        <button className="btn small coral" onClick={() => setTab("export")}>Export Pattern</button>
      </div>
    </div>
  );
}
