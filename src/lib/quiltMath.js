// Core quilting math. All "finished" sizes are the sewn, pressed, seams-included-once
// measurement. "Unfinished"/"cut" sizes always add the seam allowance back in.
// This file is the single source of truth so a block's numbers never drift between screens.

export const SQRT2 = Math.sqrt(2);

export function round(n, places = 3) {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

// Render an inch value as a friendly fraction (to nearest 1/8") for cut-slip text.
export function toFraction(inches) {
  const whole = Math.floor(inches + 1e-6);
  const frac = inches - whole;
  const eighths = Math.round(frac * 8);
  if (eighths === 0) return `${whole}"`;
  if (eighths === 8) return `${whole + 1}"`;
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(eighths, 8);
  const num = eighths / g;
  const den = 8 / g;
  return whole === 0 ? `${num}/${den}"` : `${whole} ${num}/${den}"`;
}

// ---------- Layout feasibility ----------

export function checkFit({ finishedW, finishedH, blockSize, cols, rows, sashing = 0, borderWidth = 0 }) {
  const bodyW = cols * blockSize + (cols - 1) * sashing;
  const bodyH = rows * blockSize + (rows - 1) * sashing;
  const totalW = bodyW + borderWidth * 2;
  const totalH = bodyH + borderWidth * 2;
  const fitsW = Math.abs(totalW - finishedW) < 0.01;
  const fitsH = Math.abs(totalH - finishedH) < 0.01;

  const suggestions = [];
  if (!fitsW || !fitsH) {
    // Suggest alternate border widths that make it exact, holding block size/count fixed.
    const neededBorderW = (finishedW - bodyW) / 2;
    const neededBorderH = (finishedH - bodyH) / 2;
    if (neededBorderW > 0 && neededBorderH > 0) {
      suggestions.push({
        type: "adjust-border",
        text: `Use a ${toFraction(neededBorderW)} side border and ${toFraction(neededBorderH)} top/bottom border to hit ${finishedW}"x${finishedH}" exactly with ${cols}x${rows} blocks at ${blockSize}".`,
      });
    }
    // Suggest alternate block sizes that divide evenly (search +/- 2" in 0.25" steps)
    for (const testSize of [blockSize, ...stepRange(blockSize, 0.25, 2)]) {
      if (testSize <= 0) continue;
      const w = cols * testSize + (cols - 1) * sashing + borderWidth * 2;
      const h = rows * testSize + (rows - 1) * sashing + borderWidth * 2;
      if (Math.abs(w - finishedW) < 0.01 && Math.abs(h - finishedH) < 0.01 && testSize !== blockSize) {
        suggestions.push({
          type: "adjust-block",
          text: `A ${toFraction(testSize)} finished block (same ${cols}x${rows} layout, same border) fits ${finishedW}"x${finishedH}" exactly.`,
        });
      }
    }
    // Suggest quilt sizes that fit the current block size exactly
    const roundedW = Math.round(totalW);
    const roundedH = Math.round(totalH);
    suggestions.push({
      type: "adjust-quilt",
      text: `Keep the ${blockSize}" blocks and this border, and finish the quilt at ${roundedW}"x${roundedH}" instead.`,
    });
  }

  return { bodyW, bodyH, totalW, totalH, fitsW, fitsH, fits: fitsW && fitsH, suggestions };
}

function stepRange(center, step, count) {
  const out = [];
  for (let i = 1; i <= count / step; i++) {
    out.push(round(center + i * step, 2));
    out.push(round(center - i * step, 2));
  }
  return out;
}

// ---------- Basic unit calculators ----------
// All formulas below are the standard, widely-used quilting-industry cutting formulas.

export function squareCalc(finished, seam = 0.25) {
  const cut = finished + seam * 2;
  return { unit: "Square", finished, cut, note: `Cut ${toFraction(cut)} square.` };
}

export function rectangleCalc(finishedW, finishedH, seam = 0.25) {
  const cutW = finishedW + seam * 2;
  const cutH = finishedH + seam * 2;
  return { unit: "Rectangle", finishedW, finishedH, cutW, cutH, note: `Cut ${toFraction(cutW)} x ${toFraction(cutH)}.` };
}

// Half-square triangle, two-at-a-time: cut square = finished + 7/8", cut once diagonally.
export function hstCalc(finished) {
  const cut = finished + 0.875;
  return {
    unit: "HST",
    finished,
    cut,
    piecesPerSquarePair: 2,
    note: `Cut squares at ${toFraction(cut)}. Layer 2 contrasting squares right sides together, cut once diagonally, sew both resulting pairs 1/4" from the cut edge, press, trim to ${toFraction(finished + 0.5)} unfinished (${finished}" finished). Yields 2 matching HST units per pair of squares.`,
  };
}

// Quarter-square triangle, two-at-a-time: cut square = finished + 1 1/4", cut twice diagonally (X).
export function qstCalc(finished) {
  const cut = finished + 1.25;
  return {
    unit: "QST",
    finished,
    cut,
    piecesPerSquarePair: 4,
    note: `Cut squares at ${toFraction(cut)}. Layer 2 contrasting squares right sides together, cut twice diagonally (X), sew triangle pairs, press, trim to ${toFraction(finished + 0.5)} unfinished (${finished}" finished). Yields 4 QST units per pair of squares.`,
  };
}

// Flying geese, 4-at-a-time / no-waste. Assumes goose finished W = 2x finished H.
export function flyingGeese4up(finishedH) {
  const finishedW = finishedH * 2;
  const largeSquare = finishedW + 1.25;
  const smallSquare = finishedH + 0.875;
  return {
    unit: "Flying Geese (4-at-a-time)",
    finishedW,
    finishedH,
    largeSquare,
    smallSquare,
    note: `1 large square at ${toFraction(largeSquare)} (goose fabric) + 4 small squares at ${toFraction(smallSquare)} (background). Yields 4 flying geese units, each ${finishedW}"x${finishedH}" finished, with no set-in seams and minimal waste.`,
  };
}

// ---------- Economy block (square-in-a-square, two rounds) ----------
// Round 1 adds the "B" corners to center square A; round 2 adds "C" corners.
// Each round grows the finished size by a factor of sqrt(2) (classic on-point framing).
export function economyBlock(finishedSize, { seam = 0.25, method = "oversizeTrim" } = {}) {
  const T2 = finishedSize; // final finished size
  const T1 = round(T2 / SQRT2, 4); // finished size after round 1 (before round 2)
  const A = round(T1 / SQRT2, 4); // center square finished size

  const aCut = round(A + seam * 2, 3);
  const t1UnfinishedTrim = round(T1 + seam * 2, 3);
  const t2UnfinishedTrim = round(T2 + seam * 2, 3);

  if (method === "exactPiecing") {
    // Corner triangles cut from squares, half-square-triangle method: leg = size/2 of the
    // square being framed; hypotenuse (bias) attaches to the center. Cut size = leg + 7/8".
    const bLeg = round(T1 / 2, 4);
    const bCutSquare = round(bLeg + 0.875, 3);
    const cLeg = round(T2 / 2, 4);
    const cCutSquare = round(cLeg + 0.875, 3);
    return {
      method: "exactPiecing",
      finishedSize: T2,
      steps: [
        {
          label: "Center (A)",
          cutQty: 1,
          cutSizeNum: aCut,
          cutSize: `${toFraction(aCut)} square`,
          detail: `Finished center square ${toFraction(A)}. Cut exactly ${toFraction(aCut)} square (no trimming needed).`,
        },
        {
          label: "Round 1 corners (B)",
          cutQty: 2,
          cutSizeNum: bCutSquare,
          cutSize: `${toFraction(bCutSquare)} square, cut once diagonally`,
          detail: `2 squares of B, cut once diagonally, yields 4 triangles. Sew one to each side of A, press outward. Unit should measure ${toFraction(t1UnfinishedTrim)} unfinished (${toFraction(T1)} finished) — precise cutting required, no trim margin.`,
        },
        {
          label: "Round 2 corners (C)",
          cutQty: 2,
          cutSizeNum: cCutSquare,
          cutSize: `${toFraction(cCutSquare)} square, cut once diagonally`,
          detail: `2 squares of C, cut once diagonally, yields 4 triangles. Sew one to each side of the round-1 unit. Block should measure ${toFraction(t2UnfinishedTrim)} unfinished (${toFraction(T2)} finished) — precise cutting required, no trim margin.`,
        },
      ],
      finishedFraction: toFraction(T2),
      warning: "Exact piecing has zero trim margin. A 1/16\" cutting error compounds across both rounds. Recommended only for confident cutters with a rotary ruler that reads 1/8\" increments.",
    };
  }

  // Oversize-and-trim (default, forgiving method): corner squares cut generously oversized,
  // stitch-and-flip (snowball) technique, whole unit trimmed square after each round.
  const bCorner = round(t1UnfinishedTrim / 2 + 1, 2);
  const cCorner = round(t2UnfinishedTrim / 2 + 1, 2);
  return {
    method: "oversizeTrim",
    finishedSize: T2,
    steps: [
      {
        label: "Center (A)",
        cutQty: 1,
        cutSizeNum: aCut,
        cutSize: `${toFraction(aCut)} square`,
        detail: `Finished center ${toFraction(A)}. Cut exactly ${toFraction(aCut)} square — this is the one piece that isn't trimmed later, so cut it accurately. (Fussy-cut here for a novelty print/appliqué focal square.)`,
      },
      {
        label: "Round 1 corners (B) — stitch & flip",
        cutQty: 4,
        cutSizeNum: bCorner,
        cutSize: `${toFraction(bCorner)} square (4 needed)`,
        detail: `Draw a diagonal line on the wrong side of each B square. Lay one on each corner of A, right sides together, stitch on the line, trim 1/4" beyond the seam, press open. Trim the whole unit down to ${toFraction(t1UnfinishedTrim)} square (${toFraction(T1)} finished) — this trim absorbs any small cutting error.`,
      },
      {
        label: "Round 2 corners (C) — stitch & flip",
        cutQty: 4,
        cutSizeNum: cCorner,
        cutSize: `${toFraction(cCorner)} square (4 needed)`,
        detail: `Repeat the stitch-and-flip on all 4 corners of the round-1 unit using C. Trim the finished block down to ${toFraction(t2UnfinishedTrim)} square unfinished (${toFraction(T2)}" finished).`,
      },
    ],
    finishedFraction: toFraction(T2),
    checkpoints: [
      { after: "Round 1", trimTo: t1UnfinishedTrim, trimToFraction: toFraction(t1UnfinishedTrim) },
      { after: "Round 2 (final)", trimTo: t2UnfinishedTrim, trimToFraction: toFraction(t2UnfinishedTrim) },
    ],
    warning: null,
  };
}

// ---------- Fat quarter / yardage / binding / backing ----------

export const FQ_DEFAULT = { w: 18, h: 21 }; // usable inches after pre-wash/trim, user-correctable

export function piecesPerFatQuarter(pieceSize, fq = FQ_DEFAULT) {
  const a = Math.floor(fq.w / pieceSize) * Math.floor(fq.h / pieceSize);
  const b = Math.floor(fq.h / pieceSize) * Math.floor(fq.w / pieceSize);
  const best = Math.max(a, b);
  return best;
}

export function fatQuartersNeeded(totalPieces, pieceSize, fq = FQ_DEFAULT) {
  const perFQ = piecesPerFatQuarter(pieceSize, fq);
  if (perFQ <= 0) return { perFQ: 0, fqNeeded: Infinity };
  return { perFQ, fqNeeded: Math.ceil(totalPieces / perFQ) };
}

// Strips-based yardage for a quantity of same-size squares cut from WOF fabric.
export function yardageForSquares(totalPieces, pieceSize, fabricWidth = 42) {
  const perStrip = Math.floor(fabricWidth / pieceSize);
  const stripsNeeded = Math.ceil(totalPieces / Math.max(perStrip, 1));
  const inchesNeeded = stripsNeeded * pieceSize;
  const yards = round(inchesNeeded / 36, 3);
  return { perStrip, stripsNeeded, inchesNeeded, yards, yardsWithBuffer: round(yards * 1.1, 2) };
}

export function bindingRequirement({ finishedW, finishedH, stripWidth = 2.5, fabricWidth = 42, doubleFold = true }) {
  const perimeter = 2 * (finishedW + finishedH);
  const withSlack = perimeter * 1.15 + 12; // mitred corners + join allowance
  const stripsNeeded = Math.ceil(withSlack / fabricWidth);
  const inchesNeeded = stripsNeeded * stripWidth;
  const yards = round(inchesNeeded / 36, 3);
  return { perimeter, stripsNeeded, stripWidth, yards: Math.max(yards, 0.375), doubleFold };
}

export function backingRequirement({ finishedW, finishedH, overhang = 4, fabricWidth = 42 }) {
  const neededW = finishedW + overhang * 2;
  const neededH = finishedH + overhang * 2;
  const fitsSingleWidth = neededW <= fabricWidth || neededH <= fabricWidth;
  // orient so the shorter backing dimension fits across the fabric width if possible
  const [wof, len] = neededW <= fabricWidth ? [neededW, neededH] : neededH <= fabricWidth ? [neededH, neededW] : [null, null];
  if (wof) {
    const yards = round(len / 36, 2);
    return { pieced: false, yards: Math.max(yards, 1), panels: 1, neededW, neededH };
  }
  // pieced backing: two panels seamed lengthwise
  const panelLen = len; // run fabric the long way, seam parallel to length
  const yards = round((panelLen * 2) / 36, 2);
  return { pieced: true, yards: Math.max(yards, 1), panels: 2, neededW, neededH };
}

export function battingSize({ finishedW, finishedH, overhang = 4 }) {
  return { w: finishedW + overhang * 2, h: finishedH + overhang * 2 };
}

export const STANDARD_SIZES = [
  { key: "baby", label: "Baby", w: 36, h: 52 },
  { key: "crib", label: "Crib", w: 42, h: 60 },
  { key: "lap", label: "Lap / Throw", w: 54, h: 68 },
  { key: "twin", label: "Twin", w: 68, h: 88 },
  { key: "full", label: "Full/Queen", w: 88, h: 92 },
  { key: "king", label: "King", w: 108, h: 92 },
];
