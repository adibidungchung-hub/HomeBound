import {
  GROUND_Y, PLAYER_SIZE, PLAYER_X, GRAVITY, JUMP_FORCE,
  BASE_SPEED, SPEED_RANGE, TILE_SIZE, COLORS,
  EASY_PATTERNS, MEDIUM_PATTERNS, HARD_PATTERNS,
  L2_EASY_PATTERNS, L2_MEDIUM_PATTERNS, L2_HARD_PATTERNS, L2_COMBO_PATTERNS,
  L3_EASY_PATTERNS, L3_MEDIUM_PATTERNS, L3_HARD_PATTERNS, L3_PLATFORM_PATTERNS, L3_METEOR_PATTERNS,
  CANVAS_WIDTH, CANVAS_HEIGHT, LEVEL_LENGTH
} from "./constants";
import type { GameState, Obstacle, Particle, TrailPoint, Star, Collectible, ProtectedZone } from "./types";

let obstacleIdCounter = 0;

// ─── Collectible + seeded obstacle generation ──────────────────────────────
interface CollectibleSetup {
  collectibles: Collectible[];
  protectedZones: ProtectedZone[];
  seededObstacles: Obstacle[];
}

function generateCollectibles(): CollectibleSetup {
  const collectibles: Collectible[] = [];
  const protectedZones: ProtectedZone[] = [];
  const seededObstacles: Obstacle[] = [];
  let id = 0;

  const horizGroups = [1300, 3950, 6800, 8600, 10600];
  for (const baseX of horizGroups) {
    const y = GROUND_Y - PLAYER_SIZE / 2;
    const count = baseX === 3950 || baseX === 10600 ? 5 : 6;
    const spanW = (count - 1) * 52 + 52;
    protectedZones.push({ minX: baseX - 80, maxX: baseX + spanW + 80 });
    for (let i = 0; i < count; i++) {
      collectibles.push({ id: id++, x: baseX + i * 52, y, collected: false });
    }
  }

  const arcGroups = [{ baseX: 2900 }, { baseX: 5400 }];
  const arcJump = JUMP_FORCE * 0.88;
  const arcSpeed = 5.8;

  for (const g of arcGroups) {
    const arcOriginX = g.baseX;
    const spikeX = g.baseX + 65;
    obstacleIdCounter++;
    seededObstacles.push({
      id: obstacleIdCounter,
      type: "spike",
      x: spikeX,
      y: GROUND_Y - TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
    } as Obstacle);
    protectedZones.push({ minX: arcOriginX - 380, maxX: spikeX + TILE_SIZE + 420 });

    const frames = [3, 7, 12, 17, 22, 27];
    for (const t of frames) {
      const dx = arcSpeed * t;
      const dy = arcJump * t + 0.5 * GRAVITY * t * t;
      collectibles.push({
        id: id++,
        x: arcOriginX + dx,
        y: (GROUND_Y - PLAYER_SIZE) + dy - 4,
        collected: false,
      });
    }
  }

  return { collectibles, protectedZones, seededObstacles };
}

function generateL3Collectibles(): CollectibleSetup {
  const collectibles: Collectible[] = [];
  const protectedZones: ProtectedZone[] = [];
  const seededObstacles: Obstacle[] = [];
  let id = 0;

  // L3 horiz groups are elevated above ground so player can grab them even over lava pits
  const horizGroups = [1500, 4800, 7000, 9200, 11000];
  for (const baseX of horizGroups) {
    const y = GROUND_Y - PLAYER_SIZE * 0.55;
    const count = baseX === 4800 || baseX === 11000 ? 5 : 6;
    const spanW = (count - 1) * 52 + 52;
    protectedZones.push({ minX: baseX - 160, maxX: baseX + spanW + 160 });
    for (let i = 0; i < count; i++) {
      collectibles.push({ id: id++, x: baseX + i * 52, y, collected: false });
    }
  }

  const arcGroups = [{ baseX: 3200 }, { baseX: 5800 }];
  const arcJump = JUMP_FORCE * 0.88;
  const arcSpeed = 5.8;

  for (const g of arcGroups) {
    const arcOriginX = g.baseX;
    const rockX = g.baseX + 65;
    obstacleIdCounter++;
    seededObstacles.push({
      id: obstacleIdCounter,
      type: "rock",
      x: rockX,
      y: GROUND_Y - TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
    } as Obstacle);
    protectedZones.push({ minX: arcOriginX - 380, maxX: rockX + TILE_SIZE + 420 });

    const frames = [3, 7, 12, 17, 22, 27];
    for (const t of frames) {
      const dx = arcSpeed * t;
      const dy = arcJump * t + 0.5 * GRAVITY * t * t;
      collectibles.push({
        id: id++,
        x: arcOriginX + dx,
        y: (GROUND_Y - PLAYER_SIZE) + dy - 4,
        collected: false,
      });
    }
  }

  return { collectibles, protectedZones, seededObstacles };
}


function generateL2Collectibles(): CollectibleSetup {
  const collectibles: Collectible[] = [];
  const protectedZones: ProtectedZone[] = [];
  const seededObstacles: Obstacle[] = [];
  let id = 0;

  // Horizontal groups at safe zones for level 2
  const horizGroups = [1200, 3500, 4500, 7800, 9500];
  for (const baseX of horizGroups) {
    const y = GROUND_Y - PLAYER_SIZE / 2;
    const count = baseX === 3500 || baseX === 9500 ? 5 : 6;
    const spanW = (count - 1) * 52 + 52;
    protectedZones.push({ minX: baseX - 80, maxX: baseX + spanW + 80 });
    for (let i = 0; i < count; i++) {
      collectibles.push({ id: id++, x: baseX + i * 52, y, collected: false });
    }
  }

  // Arc groups
  const arcGroups = [{ baseX: 2800 }, { baseX: 6200 }];
  const arcJump = JUMP_FORCE * 0.88;
  const arcSpeed = 5.8;

  for (const g of arcGroups) {
    const arcOriginX = g.baseX;
    protectedZones.push({ minX: arcOriginX - 300, maxX: arcOriginX + 400 });
    const frames = [3, 7, 12, 17, 22, 27];
    for (const t of frames) {
      const dx = arcSpeed * t;
      const dy = arcJump * t + 0.5 * GRAVITY * t * t;
      collectibles.push({
        id: id++,
        x: arcOriginX + dx,
        y: (GROUND_Y - PLAYER_SIZE) + dy - 4,
        collected: false,
      });
    }
  }

  return { collectibles, protectedZones, seededObstacles };
}

export function createInitialState(level = 1): GameState {
  const bgStars: Star[] = [];
  for (let i = 0; i < 80; i++) {
    bgStars.push({
      x: Math.random() * 800,
      y: Math.random() * 300,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      phase: Math.random() * Math.PI * 2,
    });
  }
  const { collectibles, protectedZones, seededObstacles } =
    level === 2 ? generateL2Collectibles() : level === 3 ? generateL3Collectibles() : generateCollectibles();

  return {
    level,
    playerY: GROUND_Y - PLAYER_SIZE,
    playerVY: 0,
    playerRotation: 0,
    isOnGround: true,
    isDead: false,
    isStarted: false,
    isComplete: false,
    isPaused: false,
    progress: 0,
    worldOffset: 0,
    bgScrollOffset: 0,
    speed: BASE_SPEED,
    obstacles: seededObstacles,
    collectibles,
    protectedZones,
    score: 0,
    lastCollectFrame: -100,
    particles: [],
    trail: [],
    stars: bgStars,
    frameCount: 0,
    deathX: 0,
    deathY: 0,
    nextSpawnX: CANVAS_WIDTH + TILE_SIZE * 4,
    completionFrames: 0,
    completionPlayerOffsetX: 0,
    introPlayerOffsetX: 0,
    isEndless: false,
  };
}

export function spawnObstacles(state: GameState, canvasWidth: number): void {
  if (!state.isEndless && state.progress >= 0.99) return;
  if (state.nextSpawnX > state.worldOffset + canvasWidth + TILE_SIZE * 2) return;

  const endBonus = state.progress > 0.8 ? 3.5 : 0;
  const minGapTiles = 7 + state.progress * 2 + endBonus;
  const maxGapTiles = 11 + state.progress * 2 + endBonus;
  const gap = TILE_SIZE * (minGapTiles + Math.random() * (maxGapTiles - minGapTiles));

  let spawnX = state.nextSpawnX;

  const MAX_PATTERN_REACH = TILE_SIZE * 8;
  let skipped = true;
  while (skipped) {
    skipped = false;
    for (const zone of state.protectedZones) {
      const patternEnd = spawnX + MAX_PATTERN_REACH;
      if (patternEnd >= zone.minX && spawnX <= zone.maxX) {
        spawnX = zone.maxX + TILE_SIZE * 3;
        state.nextSpawnX = spawnX;
        skipped = true;
        break;
      }
    }
  }

  // Pick patterns based on level (endless cycles through all 3 zones)
  const spawnLevel = state.isEndless
    ? (Math.floor(state.worldOffset / 3500) % 3) + 1
    : state.level;
  let pool: typeof EASY_PATTERNS;
  if (spawnLevel === 2) {
    if (state.progress < 0.3) {
      pool = L2_EASY_PATTERNS;
    } else if (state.progress < 0.5) {
      pool = Math.random() < 0.55 ? L2_EASY_PATTERNS : L2_MEDIUM_PATTERNS;
    } else if (state.progress < 0.7) {
      // 50-70%: introduce vine+mushroom combos heavily
      const r = Math.random();
      pool = r < 0.15 ? L2_EASY_PATTERNS : r < 0.5 ? L2_MEDIUM_PATTERNS : r < 0.8 ? L2_COMBO_PATTERNS : L2_HARD_PATTERNS;
    } else {
      // 70-100%: dominated by hard + combos
      const r = Math.random();
      pool = r < 0.05 ? L2_EASY_PATTERNS : r < 0.25 ? L2_MEDIUM_PATTERNS : r < 0.6 ? L2_COMBO_PATTERNS : L2_HARD_PATTERNS;
    }
  } else if (spawnLevel === 3) {
    if (state.progress < 0.3) {
      const r = Math.random();
      pool = r < 0.6 ? L3_EASY_PATTERNS : r < 0.85 ? L3_PLATFORM_PATTERNS : L3_METEOR_PATTERNS;
    } else if (state.progress < 0.6) {
      const r = Math.random();
      pool = r < 0.3 ? L3_EASY_PATTERNS : r < 0.5 ? L3_PLATFORM_PATTERNS : r < 0.72 ? L3_MEDIUM_PATTERNS : r < 0.88 ? L3_METEOR_PATTERNS : L3_HARD_PATTERNS;
    } else if (state.progress < 0.8) {
      const r = Math.random();
      pool = r < 0.15 ? L3_PLATFORM_PATTERNS : r < 0.42 ? L3_MEDIUM_PATTERNS : r < 0.68 ? L3_METEOR_PATTERNS : L3_HARD_PATTERNS;
    } else {
      // last 20% — sparser: more platforms/medium, less hard
      const r = Math.random();
      pool = r < 0.22 ? L3_PLATFORM_PATTERNS : r < 0.48 ? L3_MEDIUM_PATTERNS : r < 0.70 ? L3_METEOR_PATTERNS : L3_HARD_PATTERNS;
    }
  } else {
    if (state.progress < 0.3) {
      pool = EASY_PATTERNS;
    } else if (state.progress < 0.6) {
      pool = Math.random() < 0.6 ? EASY_PATTERNS : MEDIUM_PATTERNS;
    } else if (state.progress < 0.8) {
      const r = Math.random();
      pool = r < 0.2 ? EASY_PATTERNS : r < 0.7 ? MEDIUM_PATTERNS : HARD_PATTERNS;
    } else {
      // last 20% — sparser: more easy/medium, less hard
      const r = Math.random();
      pool = r < 0.28 ? EASY_PATTERNS : r < 0.65 ? MEDIUM_PATTERNS : HARD_PATTERNS;
    }
  }

  const pattern = pool[Math.floor(Math.random() * pool.length)];

  let patternSpan = TILE_SIZE;
  for (const item of pattern) {
    const itemW = (item as { w?: number }).w ?? 1;
    const itemRight = item.x * TILE_SIZE + itemW * TILE_SIZE;
    if (itemRight > patternSpan) patternSpan = itemRight;
  }

  state.nextSpawnX = spawnX + patternSpan + gap;

  for (const item of pattern) {
    obstacleIdCounter++;

    if (item.type === "spike") {
      const atH = (item as { atHeight?: number }).atHeight;
      const spikeY = atH
        ? GROUND_Y - atH * TILE_SIZE - TILE_SIZE
        : GROUND_Y - TILE_SIZE;
      state.obstacles.push({
        id: obstacleIdCounter,
        type: "spike",
        x: spawnX + item.x * TILE_SIZE,
        y: spikeY,
        width: TILE_SIZE,
        height: TILE_SIZE,
        onTop: !!atH,
      });
    } else if (item.type === "block") {
      const blockHeight = ((item as { h?: number }).h ?? 1) * TILE_SIZE;
      state.obstacles.push({
        id: obstacleIdCounter,
        type: "block",
        x: spawnX + item.x * TILE_SIZE,
        y: GROUND_Y - blockHeight,
        width: TILE_SIZE,
        height: blockHeight,
      });
      if ((item as { onTop?: boolean }).onTop) {
        obstacleIdCounter++;
        state.obstacles.push({
          id: obstacleIdCounter,
          type: "spike",
          x: spawnX + item.x * TILE_SIZE,
          y: GROUND_Y - blockHeight - TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE,
          onTop: true,
        });
      }
    } else if (item.type === "platform") {
      const platH = ((item as { h?: number }).h ?? 2) * TILE_SIZE;
      const platW = ((item as { w?: number }).w ?? 4) * TILE_SIZE;
      state.obstacles.push({
        id: obstacleIdCounter,
        type: "platform",
        x: spawnX + item.x * TILE_SIZE,
        y: GROUND_Y - platH,
        width: platW,
        height: 16,
      });
      if ((item as { onTop?: boolean }).onTop) {
        obstacleIdCounter++;
        const spikeOffsetX = Math.floor(platW / 2) - TILE_SIZE / 2;
        if (state.level === 3) {
          state.obstacles.push({
            id: obstacleIdCounter,
            type: "rock",
            x: spawnX + item.x * TILE_SIZE + spikeOffsetX,
            y: GROUND_Y - platH - TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          });
        } else {
          state.obstacles.push({
            id: obstacleIdCounter,
            type: "spike",
            x: spawnX + item.x * TILE_SIZE + spikeOffsetX,
            y: GROUND_Y - platH - TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            onTop: true,
          });
        }
      }
    } else if (item.type === "pit") {
      const pitW = ((item as { w?: number }).w ?? 2) * TILE_SIZE;
      state.obstacles.push({
        id: obstacleIdCounter,
        type: "pit",
        x: spawnX + item.x * TILE_SIZE,
        y: GROUND_Y,
        width: pitW,
        height: CANVAS_HEIGHT - GROUND_Y,
      });
    } else if (item.type === "mushroom") {
      const mushroomH = Math.round(TILE_SIZE * 1.5);
      state.obstacles.push({
        id: obstacleIdCounter,
        type: "mushroom",
        x: spawnX + item.x * TILE_SIZE,
        y: GROUND_Y - mushroomH,
        width: TILE_SIZE,
        height: mushroomH,
      });
    } else if (item.type === "vine") {
      // Vine hangs from ceiling; bottom gives clearance for player to pass underneath
      const vineBottom = GROUND_Y - PLAYER_SIZE * 2 - 20;
      state.obstacles.push({
        id: obstacleIdCounter,
        type: "vine",
        x: spawnX + item.x * TILE_SIZE,
        y: 0,
        width: 22,
        height: vineBottom, // how far it hangs from top
      });
    } else if (item.type === "rock") {
      const hVal = (item as { h?: number }).h ?? 1;
      const rockH = hVal === 1 ? TILE_SIZE : Math.round(TILE_SIZE * 1.5);
      state.obstacles.push({
        id: obstacleIdCounter,
        type: "rock",
        x: spawnX + item.x * TILE_SIZE,
        y: GROUND_Y - rockH,
        width: TILE_SIZE,
        height: rockH,
      });
    } else if (item.type === "lava") {
      const lavaW = ((item as { w?: number }).w ?? 2) * TILE_SIZE;
      state.obstacles.push({
        id: obstacleIdCounter,
        type: "lava",
        x: spawnX + item.x * TILE_SIZE,
        y: GROUND_Y,
        width: lavaW,
        height: CANVAS_HEIGHT - GROUND_Y,
      });
    } else if (item.type === "meteor") {
      state.obstacles.push({
        id: obstacleIdCounter,
        type: "meteor",
        x: spawnX + item.x * TILE_SIZE,
        y: -9999,
        width: TILE_SIZE,
        height: 32,
        fallingY: -90,
        fallSpeed: 0,
        landed: false,
        landedFrame: 0,
      });
    }
  }

  state.obstacles = state.obstacles.filter(o => o.x + o.width > state.worldOffset - TILE_SIZE);
}

export function jump(state: GameState): void {
  if (!state.isStarted) {
    state.isStarted = true;
  }
  if (state.isOnGround && !state.isDead) {
    state.playerVY = JUMP_FORCE;
    state.isOnGround = false;
  }
}

export function spawnDeathParticles(state: GameState): void {
  const px = PLAYER_X;
  const py = state.playerY;
  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    state.particles.push({
      x: px + PLAYER_SIZE / 2,
      y: py + PLAYER_SIZE / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      life: 1,
      maxLife: 1,
      size: Math.random() * 8 + 4,
      color: i % 2 === 0 ? COLORS.player : COLORS.playerInner,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
    });
  }
}

function checkCollision(state: GameState): boolean {
  const px = PLAYER_X + 3;
  const py = state.playerY + 3;
  const pw = PLAYER_SIZE - 6;
  const ph = PLAYER_SIZE - 6;

  for (const obs of state.obstacles) {
    const ox = obs.x - state.worldOffset;

    if (obs.type === "spike") {
      const tipX = ox + TILE_SIZE / 2;
      const tipY = obs.y;
      const baseLeft = ox;
      const baseRight = ox + TILE_SIZE;
      const baseY = obs.y + TILE_SIZE;

      const points = [
        [tipX, tipY],
        [baseLeft + 4, baseY],
        [baseRight - 4, baseY],
      ];

      for (const [ptx, pty] of points) {
        if (ptx > px && ptx < px + pw && pty > py && pty < py + ph) return true;
      }

      if (px < baseRight - 2 && px + pw > baseLeft + 2 && py + ph > tipY + 4 && py < baseY) {
        const relX = (px + pw / 2) - tipX;
        const relY = (py + ph) - tipY;
        const slopeLeft = (TILE_SIZE / 2);
        const expectedY = Math.abs(relX) * (TILE_SIZE / slopeLeft);
        if (relY > expectedY * 0.55) return true;
      }
    } else if (obs.type === "block") {
      if (px < ox + obs.width && px + pw > ox && py < obs.y + obs.height && py + ph > obs.y) {
        return true;
      }
    } else if (obs.type === "mushroom") {
      // AABB collision — mushroom is a solid obstacle
      if (px < ox + obs.width && px + pw > ox && py < obs.y + obs.height && py + ph > obs.y) {
        return true;
      }
    } else if (obs.type === "rock") {
      // Rock is a solid boulder — same AABB collision
      if (px < ox + obs.width && px + pw > ox && py < obs.y + obs.height && py + ph > obs.y) {
        return true;
      }
    } else if (obs.type === "meteor") {
      // Crater — only collidable after landing
      if (obs.landed && px < ox + obs.width && px + pw > ox && py < obs.y + obs.height && py + ph > obs.y) {
        return true;
      }
    } else if (obs.type === "vine") {
      // Vine hangs from ceiling; height = how far it hangs down
      const vineBottom = obs.height;
      const vineRight = ox + obs.width;
      // Collision only if player is at the vine's X and above its bottom
      if (px < vineRight && px + pw > ox && py < vineBottom) {
        return true;
      }
    }
    // "pit" type: no direct collision — handled via ground physics
  }
  return false;
}

function collectItems(state: GameState): void {
  const cx = PLAYER_X + PLAYER_SIZE / 2;
  const cy = state.playerY + PLAYER_SIZE / 2;
  const radius = PLAYER_SIZE * 0.9;

  for (const c of state.collectibles) {
    if (c.collected) continue;
    const sx = c.x - state.worldOffset;
    if (Math.abs(sx - cx) > radius * 2) continue;
    const dist = Math.hypot(sx - cx, c.y - cy);
    if (dist < radius) {
      c.collected = true;
      state.score++;
      state.lastCollectFrame = state.frameCount;
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        state.particles.push({
          x: sx, y: c.y,
          vx: Math.cos(angle) * 1.6,
          vy: Math.sin(angle) * 1.6 - 1.0,
          life: 0.6, maxLife: 0.6,
          size: 4, color: "#ffb830",
          rotation: 0, rotSpeed: 0.08,
        });
      }
    }
  }
}

export function update(state: GameState): void {
  if (state.introPlayerOffsetX < 0) {
    state.introPlayerOffsetX = Math.min(0, state.introPlayerOffsetX + 5);
    state.frameCount++;
    return;
  }

  if (state.isPaused) return;

  if (!state.isDead && !state.isComplete) {
    state.bgScrollOffset += 3.0;
  }
  if (!state.isStarted || state.isDead) {
    state.frameCount++;
    state.particles = state.particles.filter(p => p.life > 0);
    for (const p of state.particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= 0.025; p.rotation += p.rotSpeed;
    }
    return;
  }

  state.frameCount++;

  if (state.isComplete) {
    state.completionFrames++;
    if (state.completionFrames === 1) state.trail = [];
    state.completionPlayerOffsetX += 6;
    state.playerVY += GRAVITY;
    state.playerY += state.playerVY;
    if (state.playerY >= GROUND_Y - PLAYER_SIZE) {
      state.playerY = GROUND_Y - PLAYER_SIZE;
      state.playerVY = 0;
    }
    state.playerRotation = 0;
    state.particles = state.particles.filter(p => p.life > 0);
    for (const p of state.particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.02; p.rotation += p.rotSpeed;
    }
    return;
  }

  state.speed = BASE_SPEED + state.progress * SPEED_RANGE * 0.55;
  state.worldOffset += state.speed;
  state.progress = Math.min(1, state.worldOffset / LEVEL_LENGTH);

  if (state.progress >= 0.98 && !state.isComplete && !state.isEndless) {
    state.isComplete = true;
    state.obstacles = [];
    return;
  }

  // Meteor physics: fall when visible, explode on landing
  for (const obs of state.obstacles) {
    if (obs.type !== "meteor" || obs.landed) continue;
    const screenX = obs.x - state.worldOffset;
    if (screenX > CANVAS_WIDTH + 100) continue;
    obs.fallSpeed = (obs.fallSpeed ?? 0) + 0.22;
    obs.fallingY = (obs.fallingY ?? -90) + obs.fallSpeed;
    if ((obs.fallingY ?? 0) + obs.height >= GROUND_Y) {
      obs.fallingY = GROUND_Y - obs.height;
      obs.landed = true;
      obs.landedFrame = state.frameCount;
      obs.y = GROUND_Y - obs.height;
      const cx = screenX + obs.width / 2;
      const cols = ["#ff8800", "#cc3300", "#ffcc44"];
      for (let i = 0; i < 18; i++) {
        const angle = (Math.PI * 2 / 18) * i;
        const spd = 3 + Math.random() * 5;
        state.particles.push({
          x: cx, y: GROUND_Y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 6,
          life: 1, maxLife: 1,
          size: 4 + Math.random() * 7,
          color: cols[i % 3],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.25,
        });
      }
    }
  }

  state.playerVY += GRAVITY;
  state.playerY += state.playerVY;

  // Check if player is over a pit — skip floor snap if so
  let isOverPit = false;
  for (const obs of state.obstacles) {
    if (obs.type !== "pit" && obs.type !== "lava") continue;
    const pitLeft = obs.x - state.worldOffset;
    const pitRight = pitLeft + obs.width;
    // Player hitbox inner edge
    if (PLAYER_X + PLAYER_SIZE - 4 > pitLeft && PLAYER_X + 4 < pitRight) {
      isOverPit = true;
      break;
    }
  }

  // Platform ceiling: solid bottom — player cannot jump up through a platform
  if (state.playerVY < 0) {
    const playerWorldLeft = state.worldOffset + PLAYER_X;
    const playerWorldRight = playerWorldLeft + PLAYER_SIZE;
    for (const obs of state.obstacles) {
      if (obs.type !== "platform") continue;
      const platBottom = obs.y + obs.height;          // bottom surface of platform slab
      const prevTop = state.playerY - state.playerVY; // player top one frame ago (VY<0 → prevTop > playerY)
      if (
        playerWorldLeft + 4 < obs.x + obs.width &&
        playerWorldRight - 4 > obs.x &&
        prevTop > platBottom &&    // was below platform bottom (larger Y = lower on screen)
        state.playerY <= platBottom // now at or past the bottom surface
      ) {
        state.playerY = platBottom; // push back to just below the surface
        state.playerVY = 0;         // stop rising
        break;
      }
    }
  }

  // Platform landing: player can land on top of elevated platforms (not deadly)
  let landedOnPlatform = false;
  if (state.playerVY >= 0) {
    const playerWorldLeft = state.worldOffset + PLAYER_X;
    const playerWorldRight = playerWorldLeft + PLAYER_SIZE;
    for (const obs of state.obstacles) {
      if (obs.type !== "platform") continue;
      const playerBottom = state.playerY + PLAYER_SIZE;
      const prevBottom = playerBottom - state.playerVY;
      if (
        playerWorldLeft + 4 < obs.x + obs.width &&
        playerWorldRight - 4 > obs.x &&
        prevBottom <= obs.y + 4 &&
        playerBottom >= obs.y
      ) {
        state.playerY = obs.y - PLAYER_SIZE;
        state.playerVY = 0;
        landedOnPlatform = true;
        break;
      }
    }
  }

  if (!isOverPit && state.playerY >= GROUND_Y - PLAYER_SIZE) {
    state.playerY = GROUND_Y - PLAYER_SIZE;
    state.playerVY = 0;
    state.isOnGround = true;
  } else if (landedOnPlatform) {
    state.isOnGround = true;
  } else {
    state.isOnGround = false;
  }

  if (!state.isOnGround) {
    state.playerRotation += (Math.PI * 2) / 40;
  } else {
    state.playerRotation = 0;
  }

  state.trail.unshift({ x: PLAYER_X, y: state.playerY, alpha: 0.6 });
  if (state.trail.length > 12) state.trail.pop();
  state.trail.forEach((t, i) => { t.alpha = (0.6 * (1 - i / state.trail.length)); });

  spawnObstacles(state, 800);
  collectItems(state);

  if (checkCollision(state)) {
    state.isDead = true;
    state.deathX = PLAYER_X;
    state.deathY = state.playerY;
    spawnDeathParticles(state);
  }

  state.particles = state.particles.filter(p => p.life > 0);
  for (const p of state.particles) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.02; p.rotation += p.rotSpeed;
  }

  // Pit death: trigger immediately when player falls below ground level in a pit
  if (isOverPit && state.playerY > GROUND_Y) {
    state.isDead = true;
    state.deathX = PLAYER_X;
    state.deathY = state.playerY;
    spawnDeathParticles(state);
  } else if (state.playerY > CANVAS_HEIGHT + 50) {
    state.isDead = true;
    spawnDeathParticles(state);
  }
}
