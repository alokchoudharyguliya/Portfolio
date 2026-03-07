// Classic Turtle Mahjong Layout — 144 tile positions [layer, row, col]
// Coordinate rules:
//   layer : 0 = bottom, 3 = top
//   row   : 0–7  (top → bottom)
//   col   : even values 0–26 (tiles are spaced 2 apart so neighbour = ±2)
//
// Counts per layer:
//   Layer 0 :  9 + 11 + 14×4 + 11 + 9  = 96 tiles  (turtle body)
//   Layer 1 :  9×4                       = 36 tiles  (shell 2nd layer)
//   Layer 2 :  4×2                       =  8 tiles  (shell 3rd layer)
//   Layer 3 :  2×2                       =  4 tiles  (shell peak)
//                                          ─────────
//                                          144 tiles ✓

function r(start, end, step = 2) {
  const out = [];
  for (let i = start; i <= end; i += step) out.push(i);
  return out;
}

export const CLASSIC_LAYOUT = [
  // ── Layer 0: turtle body (96 tiles) ──────────────────────────────────────
  ...r(4, 20).map((c) => [0, 0, c]),   // row 0 — narrow top   (9)
  ...r(2, 22).map((c) => [0, 1, c]),   // row 1               (11)
  ...r(0, 26).map((c) => [0, 2, c]),   // row 2 — wide body   (14)
  ...r(0, 26).map((c) => [0, 3, c]),   // row 3               (14)
  ...r(0, 26).map((c) => [0, 4, c]),   // row 4               (14)
  ...r(0, 26).map((c) => [0, 5, c]),   // row 5               (14)
  ...r(2, 22).map((c) => [0, 6, c]),   // row 6               (11)
  ...r(4, 20).map((c) => [0, 7, c]),   // row 7 — narrow tail  (9)

  // ── Layer 1: shell middle (36 tiles) ─────────────────────────────────────
  ...r(4, 20).map((c) => [1, 1, c]),   //  9
  ...r(4, 20).map((c) => [1, 2, c]),   //  9
  ...r(4, 20).map((c) => [1, 3, c]),   //  9
  ...r(4, 20).map((c) => [1, 4, c]),   //  9

  // ── Layer 2: shell upper (8 tiles) ───────────────────────────────────────
  ...r(8, 14).map((c) => [2, 2, c]),   //  4
  ...r(8, 14).map((c) => [2, 3, c]),   //  4

  // ── Layer 3: shell peak (4 tiles) ────────────────────────────────────────
  ...r(10, 12).map((c) => [3, 2, c]),  //  2
  ...r(10, 12).map((c) => [3, 3, c]),  //  2
];

// Sanity-check (runs once at import time in dev, stripped in prod)
if (CLASSIC_LAYOUT.length !== 144) {
  console.error(`[classic.js] Expected 144 tiles, got ${CLASSIC_LAYOUT.length}`);
}
