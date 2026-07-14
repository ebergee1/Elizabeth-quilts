// Block descriptors: each block is a set of patches (polygons in a 0-100 viewBox) tagged
// with a fabric "slot" letter. BlockSVG renders any of these generically from the patch list,
// so adding a new block to the library is just adding a descriptor here.

const sq = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

function fourPatch(slots) {
  return [
    { slot: slots[0], points: sq(0, 0, 50, 50) },
    { slot: slots[1], points: sq(50, 0, 100, 50) },
    { slot: slots[2], points: sq(0, 50, 50, 100) },
    { slot: slots[3], points: sq(50, 50, 100, 100) },
  ];
}

function ninePatch(pattern) {
  const patches = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      patches.push({ slot: pattern[r * 3 + c], points: sq(c * 33.33, r * 33.33, (c + 1) * 33.33, (r + 1) * 33.33) });
    }
  }
  return patches;
}

function hstPatches(slotA = "A", slotB = "B") {
  return [
    { slot: slotA, points: [[0, 0], [100, 0], [0, 100]] },
    { slot: slotB, points: [[100, 0], [100, 100], [0, 100]] },
  ];
}

function hourglassPatches() {
  return [
    { slot: "A", points: [[0, 0], [100, 0], [50, 50]] },
    { slot: "B", points: [[100, 0], [100, 100], [50, 50]] },
    { slot: "A", points: [[100, 100], [0, 100], [50, 50]] },
    { slot: "B", points: [[0, 100], [0, 0], [50, 50]] },
  ];
}

function flyingGeesePatches() {
  return [
    { slot: "A", points: [[50, 0], [100, 100], [0, 100]] },
    { slot: "B", points: [[0, 0], [50, 0], [0, 100]] },
    { slot: "B", points: [[50, 0], [100, 0], [100, 100]] },
  ];
}

function snowballPatches() {
  const corner = 22;
  return [
    { slot: "B", points: [[0, 0], [corner, 0], [0, corner]] },
    { slot: "B", points: [[100 - corner, 0], [100, 0], [100, corner]] },
    { slot: "B", points: [[100, 100 - corner], [100, 100], [100 - corner, 100]] },
    { slot: "B", points: [[corner, 100], [0, 100], [0, 100 - corner]] },
    {
      slot: "A",
      points: [
        [corner, 0], [100 - corner, 0], [100, corner], [100, 100 - corner],
        [100 - corner, 100], [corner, 100], [0, 100 - corner], [0, corner],
      ],
    },
  ];
}

// Square-in-a-square, n rounds of on-point framing (used for square-in-square and economy
// block). Each round's corner triangles are added in an axis-aligned frame, then the whole
// assembly built so far is rotated 45 deg before the next round is added — this is what
// actually produces the classic alternating square/diamond nesting (center stays
// axis-aligned so a fussy-cut focal print isn't rotated; round 1 reads as a diamond; round 2
// reads as axis-aligned again; and so on), matching the real cut-and-piece geometry where
// each round's finished size is the previous round's size times sqrt(2).
function rotate45([x, y]) {
  const c = Math.SQRT1_2; // cos(45deg) === sin(45deg)
  return [x * c - y * c, x * c + y * c];
}

function squareInSquarePatches(slots) {
  const n = slots.length - 1; // number of framing rounds; slots[0] is the center
  const outerHalf = (k) => 50 / Math.SQRT2 ** (n - k);

  const h0 = outerHalf(0);
  let patches = [{ slot: slots[0], points: [[-h0, -h0], [h0, -h0], [h0, h0], [-h0, h0]] }];

  for (let r = 1; r <= n; r++) {
    const H = outerHalf(r);
    patches = patches.map((p) => ({ slot: p.slot, points: p.points.map(rotate45) }));
    patches.push({ slot: slots[r], points: [[H, H], [H, 0], [0, H]] });
    patches.push({ slot: slots[r], points: [[-H, H], [0, H], [-H, 0]] });
    patches.push({ slot: slots[r], points: [[-H, -H], [-H, 0], [0, -H]] });
    patches.push({ slot: slots[r], points: [[H, -H], [0, -H], [H, 0]] });
  }

  return patches.map((p) => ({ slot: p.slot, points: p.points.map(([x, y]) => [x + 50, y + 50]) }));
}

function logCabinPatches() {
  const rounds = 4;
  const patches = [{ slot: "A", points: sq(43, 43, 57, 57) }];
  let x0 = 43, y0 = 43, x1 = 57, y1 = 57;
  for (let i = 0; i < rounds; i++) {
    const step = 7;
    const light = i % 2 === 0;
    patches.push({ slot: light ? "B" : "C", points: sq(x0, y0 - step, x1, y0) }); // top
    y0 -= step;
    patches.push({ slot: light ? "B" : "C", points: sq(x1, y0, x1 + step, y1) }); // right
    x1 += step;
    patches.push({ slot: light ? "D" : "E", points: sq(x0, y1, x1, y1 + step) }); // bottom
    y1 += step;
    patches.push({ slot: light ? "D" : "E", points: sq(x0 - step, y0, x0, y1) }); // left
    x0 -= step;
  }
  return patches;
}

function sawtoothStarPatches() {
  return [
    { slot: "C", points: sq(0, 0, 33.33, 33.33) },
    { slot: "C", points: sq(66.66, 0, 100, 33.33) },
    { slot: "C", points: sq(0, 66.66, 33.33, 100) },
    { slot: "C", points: sq(66.66, 66.66, 100, 100) },
    { slot: "A", points: sq(33.33, 33.33, 66.66, 66.66) },
    // flying-geese points (top, right, bottom, left)
    { slot: "B", points: [[33.33, 33.33], [66.66, 33.33], [50, 0]] },
    { slot: "C", points: [[33.33, 33.33], [50, 0], [33.33, 0]] },
    { slot: "C", points: [[66.66, 33.33], [66.66, 0], [50, 0]] },
    { slot: "B", points: [[66.66, 33.33], [66.66, 66.66], [100, 50]] },
    { slot: "C", points: [[66.66, 33.33], [100, 50], [100, 33.33]] },
    { slot: "C", points: [[66.66, 66.66], [100, 66.66], [100, 50]] },
    { slot: "B", points: [[66.66, 66.66], [33.33, 66.66], [50, 100]] },
    { slot: "C", points: [[66.66, 66.66], [50, 100], [66.66, 100]] },
    { slot: "C", points: [[33.33, 66.66], [33.33, 100], [50, 100]] },
    { slot: "B", points: [[33.33, 66.66], [33.33, 33.33], [0, 50]] },
    { slot: "C", points: [[33.33, 66.66], [0, 50], [0, 66.66]] },
    { slot: "C", points: [[33.33, 33.33], [0, 33.33], [0, 50]] },
  ];
}

function ohioStarPatches() {
  return [
    { slot: "C", points: sq(0, 0, 33.33, 33.33) },
    { slot: "C", points: sq(66.66, 0, 100, 33.33) },
    { slot: "C", points: sq(0, 66.66, 33.33, 100) },
    { slot: "C", points: sq(66.66, 66.66, 100, 100) },
    { slot: "A", points: sq(33.33, 33.33, 66.66, 66.66) },
    ...hstPatches("B", "C").map((p) => ({ slot: p.slot, points: p.points.map(([x, y]) => [33.33 + (x / 100) * 33.33, (y / 100) * 33.33]) })),
    ...hstPatches("C", "B").map((p) => ({ slot: p.slot, points: p.points.map(([x, y]) => [66.66 + (x / 100) * 33.33, 33.33 + (y / 100) * 33.33]) })),
    ...hstPatches("B", "C").map((p) => ({ slot: p.slot, points: p.points.map(([x, y]) => [33.33 + (x / 100) * 33.33, 66.66 + (y / 100) * 33.33]) })),
    ...hstPatches("C", "B").map((p) => ({ slot: p.slot, points: p.points.map(([x, y]) => [(y / 100) * 33.33, 33.33 + (x / 100) * 33.33]) })),
  ];
}

function pinwheelPatches() {
  const q = (rot) => {
    const map = [
      [[0, 0], [50, 0], [0, 50]],
      [[50, 0], [50, 50], [0, 50]],
    ];
    return map;
  };
  return [
    { slot: "A", points: [[0, 0], [50, 0], [0, 50]] },
    { slot: "B", points: [[50, 0], [50, 50], [0, 50]] },
    { slot: "A", points: [[50, 0], [100, 0], [50, 50]] },
    { slot: "B", points: [[100, 0], [100, 50], [50, 50]] },
    { slot: "A", points: [[100, 50], [100, 100], [50, 50]] },
    { slot: "B", points: [[100, 100], [50, 100], [50, 50]] },
    { slot: "A", points: [[50, 100], [0, 100], [50, 50]] },
    { slot: "B", points: [[0, 100], [0, 50], [50, 50]] },
  ];
}

export const BASIC_UNITS = [
  { id: "square", name: "Square", slots: ["A"], patches: [{ slot: "A", points: sq(0, 0, 100, 100) }], defaultFinished: 6 },
  { id: "rectangle", name: "Rectangle", slots: ["A"], patches: [{ slot: "A", points: sq(0, 25, 100, 75) }], defaultFinished: 6, wide: true },
  { id: "hst", name: "Half-Square Triangle", slots: ["A", "B"], patches: hstPatches(), defaultFinished: 6 },
  { id: "qst", name: "Quarter-Square Triangle", slots: ["A", "B"], patches: hourglassPatches(), defaultFinished: 6 },
  { id: "hourglass", name: "Hourglass", slots: ["A", "B"], patches: hourglassPatches(), defaultFinished: 6 },
  { id: "flyinggeese", name: "Flying Geese", slots: ["A", "B"], patches: flyingGeesePatches(), defaultFinished: 6, wide: true },
  { id: "snowball", name: "Snowball Corner", slots: ["A", "B"], patches: snowballPatches(), defaultFinished: 6 },
  { id: "stitchflip", name: "Stitch-and-Flip Corner", slots: ["A", "B"], patches: snowballPatches(), defaultFinished: 6 },
  { id: "fourpatch", name: "Four-Patch", slots: ["A", "B"], patches: fourPatch(["A", "B", "B", "A"]), defaultFinished: 6 },
  { id: "ninepatch", name: "Nine-Patch", slots: ["A", "B"], patches: ninePatch(["A", "B", "A", "B", "A", "B", "A", "B", "A"]), defaultFinished: 9 },
  { id: "stripunit", name: "Strip Unit", slots: ["A", "B"], patches: [sq(0, 0, 25, 100), sq(25, 0, 50, 100), sq(50, 0, 75, 100), sq(75, 0, 100, 100)].map((points, i) => ({ slot: i % 2 === 0 ? "A" : "B", points })), defaultFinished: 8 },
];

export const TRADITIONAL_BLOCKS = [
  { id: "economy", name: "Economy Block", slots: ["A", "B", "C"], patches: squareInSquarePatches(["A", "B", "C"]), defaultFinished: 17, description: "Two rounds of square-in-a-square framing. Center (A), round 1 (B), round 2 (C)." },
  { id: "squareinsquare", name: "Square-in-a-Square", slots: ["A", "B"], patches: squareInSquarePatches(["A", "B"]), defaultFinished: 8 },
  { id: "sawtoothstar", name: "Sawtooth Star", slots: ["A", "B", "C"], patches: sawtoothStarPatches(), defaultFinished: 12 },
  { id: "variablestar", name: "Variable Star", slots: ["A", "B", "C"], patches: sawtoothStarPatches(), defaultFinished: 12 },
  { id: "ohiostar", name: "Ohio Star", slots: ["A", "B", "C"], patches: ohioStarPatches(), defaultFinished: 12 },
  { id: "friendshipstar", name: "Friendship Star", slots: ["A", "B", "C"], patches: ohioStarPatches(), defaultFinished: 12 },
  { id: "pinwheel", name: "Pinwheel", slots: ["A", "B"], patches: pinwheelPatches(), defaultFinished: 8 },
  { id: "churndash", name: "Churn Dash", slots: ["A", "B", "C"], patches: ninePatch(["B", "C", "B", "C", "A", "C", "B", "C", "B"]), defaultFinished: 9 },
  { id: "bearpaw", name: "Bear Paw", slots: ["A", "B", "C"], patches: ninePatch(["B", "A", "C", "A", "A", "C", "C", "C", "B"]), defaultFinished: 12 },
  { id: "logcabin", name: "Log Cabin", slots: ["A", "B", "C", "D", "E"], patches: logCabinPatches(), defaultFinished: 12 },
  { id: "courthousesteps", name: "Courthouse Steps", slots: ["A", "B", "C", "D", "E"], patches: logCabinPatches(), defaultFinished: 12 },
  { id: "irishchain", name: "Irish Chain", slots: ["A", "B"], patches: ninePatch(["A", "B", "A", "B", "A", "B", "A", "B", "A"]), defaultFinished: 9 },
];

export const ALL_BLOCKS = [...BASIC_UNITS, ...TRADITIONAL_BLOCKS];
export const BLOCKS_BY_ID = Object.fromEntries(ALL_BLOCKS.map((b) => [b.id, b]));
