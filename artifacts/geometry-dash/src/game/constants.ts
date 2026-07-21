export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

export const GROUND_Y = 360;
export const TILE_SIZE = 40;

export const PLAYER_SIZE = 30;
export const PLAYER_X = 120;

export const GRAVITY = 0.4;
export const JUMP_FORCE = -13;
export const BASE_SPEED = 3.15;
export const SPEED_RANGE = 2.45; // speed ramps from BASE_SPEED → BASE_SPEED+SPEED_RANGE over the level

export const LEVEL_LENGTH = 16000;

export const COLORS = {
  sky1: "#0d0d2b",
  sky2: "#1a0a3d",
  ground: "#1a1a4e",
  groundTop: "#7b2fff",
  groundLine: "#5500cc",
  player: "#a855f7",
  playerInner: "#e879f9",
  playerBorder: "#d946ef",
  playerGlow: "rgba(168,85,247,0.6)",
  spike: "#06b6d4",
  spikeGlow: "rgba(6,182,212,0.5)",
  block: "#7c3aed",
  blockTop: "#a855f7",
  blockGlow: "rgba(124,58,237,0.4)",
  orb: "#fbbf24",
  orbGlow: "rgba(251,191,36,0.6)",
  star: "rgba(255,255,255,0.8)",
  trail: "rgba(168,85,247,",
  particle: "#e879f9",
  score: "#e2e8f0",
  scoreGlow: "rgba(168,85,247,0.8)",
};

// Jump physics: GRAVITY=0.4 JUMP_FORCE=-13 → air time ≈ 65 frames ≈ 1.08s (was 0.67s, +0.41s floatier).
// Horizontal coverage = speed × 65  (≈ 205 → 365px = 5 → 9 tiles)

// ── Level 1 patterns (beach/sunset) ─────────────────────────────────────────
// Following obstacle placement guideline: spike (vỏ sò) + block-platform (vỏ ốc)
// Patterns A–H; rhythm: Ground→Ground→Platform→Ground→Platform→Platform→Ground→Rest

// Easy (0–20%): single obstacles, large gaps; long safe platforms to ride
export const EASY_PATTERNS = [
  // A – 1 spike on ground
  [{ type: "spike", x: 0 }],
  // A – 1 low block (jump over)
  [{ type: "block", x: 0, h: 1 }],
  // A – 2 spikes side-by-side
  [{ type: "spike", x: 0 }, { type: "spike", x: 1 }],
  // H – long safe platform (player jumps on and rides ~1.5 s)
  [{ type: "platform", x: 0, h: 2, w: 11 }],
];

// Medium (20–60%): platforms with spike ON them, two-platform sections, mandatory platforms
export const MEDIUM_PATTERNS = [
  // B – 2 spikes with gap
  [{ type: "spike", x: 0 }, { type: "spike", x: 4 }],
  // C – ground spike then low block
  [{ type: "spike", x: 0 }, { type: "block", x: 5, h: 1 }],
  // C – low block then ground spike
  [{ type: "block", x: 0, h: 1 }, { type: "spike", x: 5 }],
  // E – tall block
  [{ type: "block", x: 0, h: 2 }],
  // H – long safe platform (rest zone)
  [{ type: "platform", x: 0, h: 2, w: 11 }],
  // G – long platform (extended) with spike on top AND near end
  [{ type: "platform", x: 0, h: 2, w: 12, onTop: true }, { type: "spike", x: 4 }],
  // Two platforms same height, gap (jump from one to the next)
  [{ type: "platform", x: 0, h: 2, w: 9 }, { type: "platform", x: 12, h: 2, w: 9 }],
  // MANDATORY platform: 3 ground spikes force player to ride the elevated platform above them
  [
    { type: "platform", x: 0, h: 2, w: 11 },
    { type: "spike", x: 2 }, { type: "spike", x: 3 }, { type: "spike", x: 4 },
  ],
];

// Hard (60–100%): longer chains, two-level play, mandatory platforms with more spikes
export const HARD_PATTERNS = [
  // D – two low blocks
  [{ type: "block", x: 0, h: 1 }, { type: "block", x: 5, h: 1 }],
  // D – ascending blocks
  [{ type: "block", x: 0, h: 1 }, { type: "block", x: 5, h: 2 }],
  // F – block · spike · block
  [{ type: "block", x: 0, h: 1 }, { type: "spike", x: 5 }, { type: "block", x: 9, h: 1 }],
  // G – 2 spikes then tall block
  [{ type: "spike", x: 0 }, { type: "spike", x: 1 }, { type: "block", x: 6, h: 2 }],
  // Long platform (extended) with spike on top and near the end
  [{ type: "platform", x: 0, h: 2, w: 12, onTop: true }, { type: "spike", x: 5 }],
  // Platform then ground spike (jump on, jump off clearing the ground spike)
  [{ type: "platform", x: 0, h: 2, w: 11 }, { type: "spike", x: 15 }],
  // Two platforms same height with spike on the second
  [{ type: "platform", x: 0, h: 2, w: 9 }, { type: "platform", x: 12, h: 2, w: 9 }, { type: "spike", x: 15 }],
  // Two platforms same height — h:1 removed so nothing floats near ground
  [{ type: "platform", x: 0, h: 2, w: 9 }, { type: "platform", x: 12, h: 2, w: 9 }],
  // Ground spike → long platform with spike on top
  [{ type: "spike", x: 0 }, { type: "platform", x: 4, h: 2, w: 12, onTop: true }, { type: "spike", x: 8 }],
  // MANDATORY platform: 5 ground spikes across a wide platform — no choice but to ride above
  [
    { type: "platform", x: 0, h: 2, w: 13 },
    { type: "spike", x: 1 }, { type: "spike", x: 2 }, { type: "spike", x: 3 },
    { type: "spike", x: 5 }, { type: "spike", x: 6 },
  ],
  // MANDATORY platform + ground spikes + spike on top: must ride platform, dodge top spike
  [
    { type: "platform", x: 0, h: 2, w: 12, onTop: true },
    { type: "spike", x: 2 }, { type: "spike", x: 3 }, { type: "spike", x: 4 },
  ],
  // Leading spike forces jump, then mandatory platform carries player over ground spikes
  [
    { type: "spike", x: 0 },
    { type: "platform", x: 3, h: 2, w: 11, onTop: true },
    { type: "spike", x: 4 }, { type: "spike", x: 5 }, { type: "spike", x: 6 },
  ],
];

// ── Level 2 patterns (forest/night) ─────────────────────────────────────────
// Pit width in tiles
export const L2_EASY_PATTERNS = [
  [{ type: "pit", x: 0, w: 2 }],
  [{ type: "mushroom", x: 0 }],
  [{ type: "vine", x: 0 }],
];

export const L2_MEDIUM_PATTERNS = [
  [{ type: "pit", x: 0, w: 3 }],
  [{ type: "mushroom", x: 0 }, { type: "mushroom", x: 5 }],
  [{ type: "vine", x: 0 }, { type: "vine", x: 5 }],
  [{ type: "pit", x: 0, w: 2 }, { type: "mushroom", x: 8 }],
  [{ type: "mushroom", x: 0 }, { type: "pit", x: 5, w: 2 }],
];

export const L2_HARD_PATTERNS = [
  [{ type: "pit", x: 0, w: 4 }],
  [{ type: "mushroom", x: 0 }, { type: "vine", x: 7 }],
  [{ type: "vine", x: 0 }, { type: "pit", x: 5, w: 3 }],
  [{ type: "pit", x: 0, w: 2 }, { type: "pit", x: 6, w: 2 }],
  [{ type: "vine", x: 0 }, { type: "mushroom", x: 7 }, { type: "vine", x: 13 }],
];

// ── Level 2 vine+mushroom combo patterns (appear in last 50%) ────────────────
export const L2_COMBO_PATTERNS = [
  [{ type: "mushroom", x: 0 }, { type: "vine", x: 7 }],
  [{ type: "vine", x: 0 }, { type: "mushroom", x: 7 }],
  [{ type: "vine", x: 0 }, { type: "mushroom", x: 7 }, { type: "vine", x: 14 }],
  [{ type: "mushroom", x: 0 }, { type: "vine", x: 7 }, { type: "mushroom", x: 14 }],
  [{ type: "vine", x: 0 }, { type: "vine", x: 7 }, { type: "mushroom", x: 13 }],
  [{ type: "mushroom", x: 0 }, { type: "mushroom", x: 5 }, { type: "vine", x: 12 }],
  [{ type: "vine", x: 0 }, { type: "pit", x: 5, w: 2 }, { type: "mushroom", x: 11 }],
];

// ── Level 3 patterns (dark volcanic sky) ─────────────────────────────────────
// Rocks = solid boulders on ground (kill on contact)
// Lava  = lava pits (kill on fall, like pit but orange)
// Meteors = fireballs that fall from sky, crash-land, leave craters
export const L3_EASY_PATTERNS = [
  [{ type: "rock", x: 0, h: 1 }],
  [{ type: "lava", x: 0, w: 2 }],
  [{ type: "rock", x: 0, h: 1 }, { type: "rock", x: 4, h: 1 }],
];

export const L3_MEDIUM_PATTERNS = [
  [{ type: "lava", x: 0, w: 3 }],
  [{ type: "rock", x: 0, h: 2 }],
  [{ type: "rock", x: 0, h: 1 }, { type: "lava", x: 6, w: 2 }],
  [{ type: "lava", x: 0, w: 2 }, { type: "rock", x: 8, h: 1 }],
  [{ type: "rock", x: 0, h: 1 }, { type: "rock", x: 6, h: 2 }],
];

export const L3_HARD_PATTERNS = [
  [{ type: "lava", x: 0, w: 4 }],
  [{ type: "rock", x: 0, h: 1 }, { type: "rock", x: 7, h: 1 }, { type: "rock", x: 14, h: 2 }],
  [{ type: "rock", x: 0, h: 1 }, { type: "lava", x: 6, w: 3 }],
  [{ type: "lava", x: 0, w: 2 }, { type: "lava", x: 9, w: 3 }],
  [{ type: "rock", x: 0, h: 2 }, { type: "rock", x: 6, h: 2 }],
  [{ type: "lava", x: 0, w: 3 }, { type: "rock", x: 10, h: 1 }],
  [{ type: "rock", x: 0, h: 1 }, { type: "lava", x: 5, w: 2 }, { type: "rock", x: 11, h: 2 }],
];

export const L3_PLATFORM_PATTERNS = [
  // Extended platforms — some with rock on top (onTop: true creates a rock for level 3)
  [{ type: "platform", x: 0, h: 2, w: 8, onTop: true }],
  [{ type: "platform", x: 0, h: 2, w: 9 }],
  [{ type: "platform", x: 0, h: 2, w: 8, onTop: true }, { type: "rock", x: 12, h: 1 }],
  [{ type: "rock", x: 0, h: 1 }, { type: "platform", x: 5, h: 2, w: 8, onTop: true }],
  [{ type: "lava", x: 0, w: 2 }, { type: "platform", x: 6, h: 2, w: 8, onTop: true }],
  [{ type: "platform", x: 0, h: 2, w: 6 }, { type: "platform", x: 9, h: 2, w: 6, onTop: true }],
  [{ type: "platform", x: 0, h: 2, w: 8 }, { type: "lava", x: 11, w: 2 }],
];

export const L3_METEOR_PATTERNS = [
  [{ type: "meteor", x: 3 }],
  [{ type: "meteor", x: 4 }],
  [{ type: "meteor", x: 5 }],
  [{ type: "rock", x: 0, h: 1 }, { type: "meteor", x: 7 }],
  [{ type: "meteor", x: 3 }, { type: "rock", x: 9, h: 1 }],
  [{ type: "lava", x: 0, w: 2 }, { type: "meteor", x: 7 }],
  [{ type: "meteor", x: 2 }, { type: "lava", x: 8, w: 2 }],
];
