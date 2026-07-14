import { FABRICS_BY_ID } from "../../data/fabricCatalog";

const SLOT_FALLBACK = { A: "#d8cdb8", B: "#c98a6b", C: "#8f2d52", D: "#7c8f6e", E: "#c99a3a" };

export default function BlockSVG({ block, fabrics = {}, size = 64, rotation = 0, mirror = false, showSeamlines = false }) {
  const colorFor = (slot) => {
    const fabricId = fabrics[slot];
    const fabric = fabricId && FABRICS_BY_ID[fabricId];
    return fabric ? fabric.hex : SLOT_FALLBACK[slot] || "#ddd";
  };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{
        transform: `rotate(${rotation}deg) scaleX(${mirror ? -1 : 1})`,
        borderRadius: 4,
        display: "block",
      }}
    >
      <rect x={0} y={0} width={100} height={100} fill="#fff" />
      {block.patches.map((p, i) => (
        <polygon
          key={i}
          points={p.points.map(([x, y]) => `${x},${y}`).join(" ")}
          fill={colorFor(p.slot)}
          stroke={showSeamlines ? "rgba(0,0,0,0.18)" : "none"}
          strokeWidth={showSeamlines ? 0.5 : 0}
        />
      ))}
      <rect x={0.5} y={0.5} width={99} height={99} fill="none" stroke="rgba(43,38,32,0.15)" strokeWidth={1} />
    </svg>
  );
}
