import { GROUND_Y, PLAYER_SIZE, PLAYER_X, TILE_SIZE, COLORS, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { GameState } from "./types";

export interface BackgroundImages {
  sky: HTMLImageElement | null;
  sun: HTMLImageElement | null;
  sea: HTMLImageElement | null;
  seaFrames: HTMLImageElement[];
  trees: HTMLImageElement | null;
  trees1: HTMLImageElement | null;
  cloud: HTMLImageElement | null;
  floor: HTMLImageElement | null;
  player: CanvasImageSource | null;
  shell1: CanvasImageSource | null;
  shell2: CanvasImageSource | null;
  palmTree: CanvasImageSource | null;
  collectibleImg: CanvasImageSource | null;
  mushroom: CanvasImageSource | null;
  // Level 2 assets
  sky2: HTMLImageElement | null;
  floor2: HTMLImageElement | null;
  tree2: HTMLImageElement | null;
  cloud2: HTMLImageElement | null;
  // Level 3 assets
  rockLow: CanvasImageSource | null;
  rockTall: CanvasImageSource | null;
  meteorImg: CanvasImageSource | null;
  craterImg: CanvasImageSource | null;
  bgVolcanic: HTMLImageElement | null;
  bg3Sky: HTMLImageElement | null;
  bg3Mountains: HTMLImageElement | null;
  bg3Hills: HTMLImageElement | null;
  bg3Clouds: HTMLImageElement | null;
  // Level 2 extra: forest silhouette layer
  forestTrees: CanvasImageSource | null;
}

function drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function drawTiled(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  scrollX: number,
  destY: number,
  destH: number,
  drawW?: number,
  strideW?: number,
) {
  const srcW = img.naturalWidth || img.width || 1;
  const srcH = img.naturalHeight || img.height || 1;
  const aspectW = drawW ?? (srcW / srcH) * destH;
  const stride = strideW ?? aspectW;
  const offset = ((scrollX % stride) + stride) % stride;
  const startX = -offset;
  for (let x = startX; x < CANVAS_WIDTH; x += stride) {
    ctx.drawImage(img, 0, 0, srcW, srcH, x, destY, aspectW, destH);
  }
}

function drawPalmTree(ctx: CanvasRenderingContext2D, bx: number, by: number, h: number) {
  ctx.save();
  const lx = h * 0.18;
  const tw = Math.max(6, h * 0.07);
  const tx = bx + lx;
  const ty = by - h;

  ctx.beginPath();
  ctx.moveTo(bx - tw * 0.4, by);
  ctx.bezierCurveTo(bx + lx * 0.2 - tw * 0.4, by - h * 0.4, tx - lx * 0.1 - tw * 0.4, ty + h * 0.3, tx - tw * 0.5, ty);
  ctx.lineTo(tx + tw * 0.5, ty);
  ctx.bezierCurveTo(tx + lx * 0.1 + tw * 0.6, ty + h * 0.3, bx + lx * 0.2 + tw * 0.6, by - h * 0.4, bx + tw * 0.6, by);
  ctx.closePath();
  const tg = ctx.createLinearGradient(bx, by, tx, ty);
  tg.addColorStop(0, "#6b3000");
  tg.addColorStop(1, "#3d1800");
  ctx.fillStyle = tg;
  ctx.fill();

  for (let i = 1; i <= 5; i++) {
    const t = i / 6;
    const rx = bx + lx * t - tw * 0.1;
    const ry = by - h * t;
    ctx.beginPath();
    ctx.moveTo(rx - tw * 0.3, ry);
    ctx.lineTo(rx + tw * 0.8, ry);
    ctx.strokeStyle = "#2d0e00";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  const angles = [-2.3, -1.85, -1.45, -1.1, -0.7, -0.25, 0.15, 0.5];
  const fl = h * 0.62;
  for (const a of angles) {
    const ex = tx + Math.cos(a) * fl;
    const ey = ty + Math.sin(a) * fl + fl * 0.28;
    const cpx = tx + Math.cos(a) * fl * 0.42;
    const cpy = ty + Math.sin(a) * fl * 0.22 - h * 0.07;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(cpx, cpy, ex, ey);
    ctx.strokeStyle = "#3a2400";
    ctx.lineWidth = tw * 0.85;
    ctx.lineCap = "round";
    ctx.stroke();
    for (let li = 1; li <= 4; li++) {
      const lt = li / 5;
      const pbx = (1-lt)*(1-lt)*tx + 2*(1-lt)*lt*cpx + lt*lt*ex;
      const pby = (1-lt)*(1-lt)*ty + 2*(1-lt)*lt*cpy + lt*lt*ey;
      const tdx = 2*(1-lt)*(cpx-tx) + 2*lt*(ex-cpx);
      const tdy = 2*(1-lt)*(cpy-ty) + 2*lt*(ey-cpy);
      const tl = Math.sqrt(tdx*tdx + tdy*tdy) || 1;
      const px = -tdy / tl;
      const py2 = tdx / tl;
      const ll = h * 0.07;
      ctx.beginPath();
      ctx.moveTo(pbx, pby);
      ctx.lineTo(pbx + px*ll, pby + py2*ll);
      ctx.strokeStyle = "#3a2400";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pbx, pby);
      ctx.lineTo(pbx - px*ll, pby - py2*ll);
      ctx.stroke();
    }
  }

  const cr = tw * 0.9;
  ctx.fillStyle = "#2d1400";
  ctx.beginPath(); ctx.arc(tx - tw*0.4, ty + tw, cr, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(tx + tw*0.4, ty + tw*0.8, cr, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(tx, ty + tw*1.8, cr, 0, Math.PI*2); ctx.fill();

  ctx.restore();
}

function drawPalmTrees(ctx: CanvasRenderingContext2D, scrollX: number, baseY: number, h: number, spacing: number) {
  const offset = ((scrollX % spacing) + spacing) % spacing;
  const startX = -offset;
  for (let x = startX; x < CANVAS_WIDTH + spacing; x += spacing) {
    drawPalmTree(ctx, x + spacing * 0.35, baseY, h);
  }
}

function drawPalmTreeImages(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  scrollX: number,
  baseY: number,
  h: number,
  spacing: number,
) {
  const imgEl = img as HTMLCanvasElement;
  const naturalAspect = (imgEl.width || 1) / (imgEl.height || 1);
  const w = h * naturalAspect;
  const offset = ((scrollX % spacing) + spacing) % spacing;
  const startX = -offset;
  const groundOffset = h * 0.06;
  for (let x = startX; x < CANVAS_WIDTH + spacing; x += spacing) {
    const drawX = x + spacing * 0.35 - w / 2;
    ctx.drawImage(img, drawX, baseY - h + groundOffset, w, h);
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, state: GameState, images: BackgroundImages, level: number) {
  const scroll = state.bgScrollOffset;

  if (level === 2) {
    // ── Level 2: Forest / nature theme ────────────────────────────────────────
    if (images.sky2) {
      ctx.drawImage(images.sky2, 0, 0, CANVAS_WIDTH, GROUND_Y + 20);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      grad.addColorStop(0, "#2d6e2d");
      grad.addColorStop(1, "#7ec87e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
    }

    // Forest tree silhouette — lowest decorative layer (very slow parallax, dim opacity)
    if (images.forestTrees) {
      ctx.globalAlpha = 0.28;
      const ftH = 120;
      drawTiled(ctx, images.forestTrees, scroll * 0.10, GROUND_Y - ftH + 5, ftH, undefined, 1600);
      ctx.globalAlpha = 1;
    }

    if (images.cloud2) {
      ctx.globalAlpha = 0.65;
      drawTiled(ctx, images.cloud2, scroll * 0.4, 20, 110, undefined, 520);
      ctx.globalAlpha = 0.48;
      drawTiled(ctx, images.cloud2, scroll * 0.28 + 300, 90, 80, undefined, 640);
      ctx.globalAlpha = 1;
    }

    if (images.tree2) {
      ctx.globalAlpha = 0.5;
      drawPalmTreeImages(ctx, images.tree2, scroll * 0.55, GROUND_Y + 10, 100, 240);
      ctx.globalAlpha = 1;
      drawPalmTreeImages(ctx, images.tree2, scroll * 0.75 + 140, GROUND_Y + 10, 200, 280);
      ctx.globalAlpha = 1;
    }

    // Solid ground base — ensures spikes/blocks always appear grounded
    ctx.fillStyle = "#3d7a14";
    ctx.fillRect(0, GROUND_Y - 2, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y + 2);
    if (images.floor2) {
      const fh = CANVAS_HEIGHT - GROUND_Y + 10;
      drawTiled(ctx, images.floor2, state.worldOffset * 1.6, GROUND_Y - 2, fh, CANVAS_WIDTH);
    }

    // Subtle green overlay for depth
    ctx.fillStyle = "rgba(0, 20, 5, 0.32)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
  } else if (level === 3) {
    // ── Level 3: Volcanic / Dark Mountain (3-layer parallax) ──────────────────
    // Layer 1: Sky background — STATIC (no scroll)
    if (images.bg3Sky) {
      ctx.drawImage(images.bg3Sky, 0, 0, CANVAS_WIDTH, GROUND_Y);
    } else {
      const grad3 = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      grad3.addColorStop(0, "#1a1035");
      grad3.addColorStop(0.6, "#2a1848");
      grad3.addColorStop(1, "#1a0808");
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
    }

    // Layer 1.5: Purple clouds (very slow parallax, above mountains)
    if (images.bg3Clouds) {
      const cloudH = Math.round(GROUND_Y * 0.88);
      drawTiled(ctx, images.bg3Clouds, scroll * 0.05, -20, cloudH, undefined, 3200);
      ctx.globalAlpha = 0.55;
      drawTiled(ctx, images.bg3Clouds, scroll * 0.035 + 350, 30, Math.round(cloudH * 0.75), undefined, 3800);
      ctx.globalAlpha = 1;
    }

    // Layer 2: Mountains / volcanoes (halved parallax: 0.18 → 0.09)
    if (images.bg3Mountains) {
      const mtH = Math.round(GROUND_Y * 0.68);
      drawTiled(ctx, images.bg3Mountains, scroll * 0.09, GROUND_Y - mtH + 12, mtH, CANVAS_WIDTH);
    }

    // Layer 3: Dark foreground hills (halved parallax: 0.42 → 0.21)
    if (images.bg3Hills) {
      const hillH = Math.round(GROUND_Y * 0.26);
      drawTiled(ctx, images.bg3Hills, scroll * 0.21, GROUND_Y - hillH + 5, hillH, CANVAS_WIDTH);
    }

    // Lava ambient glow near ground
    const glowGrad = ctx.createLinearGradient(0, GROUND_Y - 70, 0, GROUND_Y);
    glowGrad.addColorStop(0, "rgba(160,25,0,0)");
    glowGrad.addColorStop(1, "rgba(160,25,0,0.32)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, GROUND_Y - 70, CANVAS_WIDTH, 70);

    // Volcanic ground base
    ctx.fillStyle = "#1c0808";
    ctx.fillRect(0, GROUND_Y - 2, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y + 2);
    ctx.fillStyle = "#240e0e";
    ctx.fillRect(0, GROUND_Y + 20, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y - 20);
  } else {
    // ── Level 1: Beach / sunset theme ─────────────────────────────────────────
    if (images.sky) {
      ctx.drawImage(images.sky, 0, 0, CANVAS_WIDTH, GROUND_Y + 20);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      grad.addColorStop(0, "#c2380a");
      grad.addColorStop(1, "#f5a623");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
    }

    if (images.sun) {
      const srcW = images.sun.naturalWidth || images.sun.width || 200;
      const srcH = images.sun.naturalHeight || images.sun.height || 120;
      const sunH = 140;
      const sunW = (srcW / srcH) * sunH;
      const sunX = CANVAS_WIDTH / 2 - sunW / 2;
      ctx.drawImage(images.sun, sunX, GROUND_Y - sunH - 10, sunW, sunH);
    }

    if (images.cloud) {
      ctx.globalAlpha = 0.35;
      drawTiled(ctx, images.cloud, scroll * 0.5, 40, 80, undefined, 600);
      ctx.globalAlpha = 0.25;
      drawTiled(ctx, images.cloud, scroll * 0.38 + 700, 115, 60, undefined, 700);
      ctx.globalAlpha = 1;
    }

    // Contrast overlay — darkens sky/clouds so gameplay foreground pops
    ctx.fillStyle = "rgba(10, 5, 0, 0.38)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

    if (images.seaFrames.length > 0) {
      // Custom timing: frame 0 = 5000ms, frames 1-7 = 1000ms each → 12s cycle
      const CYCLE_MS = 5000 + (images.seaFrames.length - 1) * 1000;
      const t = Date.now() % CYCLE_MS;
      const frameIdx = t < 5000 ? 0 : 1 + Math.floor((t - 5000) / 1000);
      const seaFrame = images.seaFrames[Math.min(frameIdx, images.seaFrames.length - 1)];
      const srcW = seaFrame.naturalWidth || seaFrame.width || 1;
      const srcH = seaFrame.naturalHeight || seaFrame.height || 1;
      // Images are 4096×1368; the wave content occupies ~50% of width centered.
      // Scale ×2 so the content fills the full 800px canvas, symmetric overflow clipped.
      const scale = 2.6;
      const destW = CANVAS_WIDTH * scale;
      const destH = (srcH / srcW) * destW;
      // xShift > 0 moves image right to re-center content on canvas
      const xShift = 80;
      const destX = -(destW - CANVAS_WIDTH) / 2 + xShift;
      const destY = GROUND_Y - destH * 0.68 + 105;
      ctx.save();
      ctx.filter = "saturate(0.42) brightness(0.82)";
      ctx.drawImage(seaFrame, 0, 0, srcW, srcH, destX, destY, destW, destH);
      ctx.filter = "none";
      ctx.restore();
      const warmGrad = ctx.createLinearGradient(0, destY, 0, GROUND_Y);
      warmGrad.addColorStop(0, "rgba(230, 150, 30, 0.14)");
      warmGrad.addColorStop(0.5, "rgba(200, 110, 20, 0.10)");
      warmGrad.addColorStop(1, "rgba(160, 70, 10, 0.07)");
      ctx.fillStyle = warmGrad;
      ctx.fillRect(0, destY, CANVAS_WIDTH, GROUND_Y - destY);
    } else if (images.sea) {
      ctx.save();
      ctx.filter = "saturate(0.42) brightness(0.82)";
      drawTiled(ctx, images.sea, scroll * 0.5, GROUND_Y - 110, 130, CANVAS_WIDTH);
      ctx.filter = "none";
      ctx.restore();
    }

    if (images.palmTree) {
      drawPalmTreeImages(ctx, images.palmTree, scroll * 0.6, GROUND_Y, 90, 260);
      drawPalmTreeImages(ctx, images.palmTree, scroll * 0.8 + 180, GROUND_Y, 180, 300);
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = 0.55;
      drawPalmTrees(ctx, scroll * 0.7, GROUND_Y, 110, 280);
      ctx.globalAlpha = 1;
      drawPalmTrees(ctx, scroll * 0.88 + 160, GROUND_Y, 250, 310);
      ctx.globalAlpha = 1;
    }

    // ── 2-layer floor: sandy-orange top strip + dark brown base ──
    // Dark brown base layer
    ctx.fillStyle = "#2a1208";
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Sandy orange-yellow top strip
    const floorGrad = ctx.createLinearGradient(0, GROUND_Y - 2, 0, GROUND_Y + 20);
    floorGrad.addColorStop(0, "#E0A030");
    floorGrad.addColorStop(0.4, "#C88820");
    floorGrad.addColorStop(1, "#8a5010");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, GROUND_Y - 2, CANVAS_WIDTH, 20);

    // Optional floor texture overlay
    if (images.floor) {
      ctx.globalAlpha = 0.18;
      const fh = CANVAS_HEIGHT - GROUND_Y + 10;
      drawTiled(ctx, images.floor, state.worldOffset * 1.6, GROUND_Y - 2, fh, CANVAS_WIDTH);
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = "rgba(10, 4, 0, 0.10)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
  }
}

function drawSpike(ctx: CanvasRenderingContext2D, x: number, y: number, worldOffset: number, shellImg?: CanvasImageSource | null, onTop = false) {
  const sx = x - worldOffset;
  const yOff = onTop ? 0 : 28;

  ctx.save();

  // Sandy pedestal block under floating (on-top-of-block) spikes only
  if (onTop) {
    const pedH = 22;
    const pedGrad = ctx.createLinearGradient(sx, y + TILE_SIZE - pedH, sx, y + TILE_SIZE);
    pedGrad.addColorStop(0, "#D4A030");
    pedGrad.addColorStop(1, "#8a5012");
    ctx.fillStyle = pedGrad;
    ctx.fillRect(sx, y + TILE_SIZE - pedH, TILE_SIZE, pedH);
    ctx.fillStyle = "rgba(255, 200, 80, 0.3)";
    ctx.fillRect(sx, y + TILE_SIZE - pedH, TILE_SIZE, 5);
  }

  if (shellImg) {
    const imgEl = shellImg as HTMLCanvasElement;
    const srcW = imgEl.width || 1;
    const srcH = imgEl.height || 1;
    const aspect = srcW / srcH;
    const targetH = TILE_SIZE * 1.8;
    const targetW = targetH * aspect;
    const drawX = sx + TILE_SIZE / 2 - targetW / 2;
    const drawY = (y + TILE_SIZE) - targetH + yOff;
    ctx.shadowColor = "rgba(255,210,60,0.88)";
    ctx.shadowBlur = 24;
    ctx.drawImage(shellImg, drawX, drawY, targetW, targetH);
    ctx.shadowBlur = 0;
  } else {
    // Procedural fallback: anchor base to ground (y + TILE_SIZE = GROUND_Y for ground spikes)
    const base = y + TILE_SIZE;   // bottom of spike — sits at ground line
    const tip  = base - TILE_SIZE; // tip 1 tile above base
    const cx = sx + TILE_SIZE / 2;
    const grad = ctx.createLinearGradient(sx, base, cx, tip);
    grad.addColorStop(0, "#5a3010");
    grad.addColorStop(1, "#8b5e2a");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, tip);
    ctx.lineTo(sx + 4, base);
    ctx.lineTo(sx + TILE_SIZE - 4, base);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#6b4423";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, worldOffset: number, shellImg?: CanvasImageSource | null) {
  const bx = x - worldOffset;

  ctx.save();
  if (shellImg) {
    const imgEl = shellImg as HTMLCanvasElement;
    const srcW = imgEl.width || 1;
    const srcH = imgEl.height || 1;
    const aspect = srcW / srcH;
    const blockTiles = Math.round(height / TILE_SIZE);
    const targetH = TILE_SIZE * (0.95 + blockTiles * 0.55);
    const targetW = targetH * aspect;
    const centerX = bx + width / 2;
    const drawX = centerX - targetW / 2;
    // Anchor: center the image on the GROUND_Y line so visual seats at ground
    const drawY = GROUND_Y - Math.ceil(targetH / 2);
    ctx.shadowColor = "rgba(255,200,60,0.75)";
    ctx.shadowBlur = 18;
    ctx.drawImage(shellImg, drawX, drawY, targetW, targetH);
    ctx.shadowBlur = 0;
  } else {
    const grad = ctx.createLinearGradient(bx, y, bx, y + height);
    grad.addColorStop(0, "#7a4a1a");
    grad.addColorStop(1, "#4a2a08");
    ctx.fillStyle = grad;
    ctx.fillRect(bx, y, width, height);
    ctx.fillStyle = "#8b5e2a";
    ctx.fillRect(bx, y, width, 5);
    ctx.strokeStyle = "#6b4020";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx + 0.75, y + 0.75, width - 1.5, height - 1.5);
  }
  ctx.restore();
}

// ── Level 2 new obstacle draw functions ──────────────────────────────────────

function drawPit(ctx: CanvasRenderingContext2D, x: number, width: number, worldOffset: number) {
  const bx = x - worldOffset;
  if (bx > CANVAS_WIDTH || bx + width < 0) return;
  ctx.save();
  // Dark void
  ctx.fillStyle = "#050302";
  ctx.fillRect(bx, GROUND_Y, width, CANVAS_HEIGHT - GROUND_Y);
  // Left edge wall shadow
  const ledge = 8;
  const lg = ctx.createLinearGradient(bx - ledge, 0, bx + 6, 0);
  lg.addColorStop(0, "rgba(0,0,0,0)");
  lg.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = lg;
  ctx.fillRect(bx - ledge, GROUND_Y - 10, ledge + 6, CANVAS_HEIGHT - GROUND_Y + 10);
  // Right edge wall shadow
  const rg = ctx.createLinearGradient(bx + width - 6, 0, bx + width + ledge, 0);
  rg.addColorStop(0, "rgba(0,0,0,0.6)");
  rg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(bx + width - 6, GROUND_Y - 10, ledge + 6, CANVAS_HEIGHT - GROUND_Y + 10);
  // Red glow at the bottom of the pit
  const pitGlow = ctx.createLinearGradient(bx, GROUND_Y, bx, CANVAS_HEIGHT);
  pitGlow.addColorStop(0, "rgba(80,10,0,0.7)");
  pitGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = pitGlow;
  ctx.fillRect(bx, GROUND_Y, width, CANVAS_HEIGHT - GROUND_Y);
  ctx.restore();
}

function drawMushroom(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number, height: number,
  worldOffset: number, mushroomImg: CanvasImageSource | null,
) {
  const bx = x - worldOffset;
  if (bx > CANVAS_WIDTH || bx + width < 0) return;
  ctx.save();
  if (mushroomImg) {
    const imgEl = mushroomImg as HTMLCanvasElement;
    const srcW = imgEl.width || 1;
    const srcH = imgEl.height || 1;
    const aspect = srcW / srcH;
    const drawH = height * 1.35;
    const drawW = drawH * aspect;
    const drawX = bx + width / 2 - drawW / 2;
    const drawY = GROUND_Y - drawH + 18;
    ctx.drawImage(mushroomImg, drawX, drawY, drawW, drawH);
  } else {
    // Procedural mushroom fallback
    const cx = bx + width / 2;
    // Stem
    ctx.fillStyle = "#d4b070";
    ctx.fillRect(cx - 7, GROUND_Y - height * 0.55, 14, height * 0.55);
    // Cap
    const capRad = width * 0.56;
    const capY = GROUND_Y - height * 0.55;
    ctx.fillStyle = "#cc2020";
    ctx.beginPath();
    ctx.arc(cx, capY, capRad, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    // Spots
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.beginPath(); ctx.arc(cx - capRad * 0.35, capY - 6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + capRad * 0.3, capY - 8, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx - capRad * 0.05, capY - 14, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawVine(
  ctx: CanvasRenderingContext2D,
  x: number, width: number, height: number,
  worldOffset: number,
) {
  const bx = x - worldOffset;
  if (bx > CANVAS_WIDTH || bx + width < 0) return;
  ctx.save();
  // Cap vine bottom to leave visual clearance for 2× player (60px tall)
  const vineBottom = Math.min(height, GROUND_Y - PLAYER_SIZE * 2 - 16);
  const cx = bx + width / 2;

  // Main vine stem
  ctx.strokeStyle = "#2d5a18";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, vineBottom);
  ctx.stroke();

  // Inner highlight
  ctx.strokeStyle = "#4a8a28";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 1, 0);
  ctx.lineTo(cx - 1, vineBottom);
  ctx.stroke();

  // Leaves along the vine
  const leafColor = "#4a8228";
  const leafColorDark = "#3a6a18";
  const numLeaves = Math.floor(vineBottom / 28);
  for (let i = 0; i < numLeaves; i++) {
    const vy = 18 + i * 28;
    if (vy > vineBottom - 12) break;
    const side = i % 2 === 0 ? -1 : 1;
    ctx.save();
    ctx.translate(cx + side * 2, vy);
    ctx.rotate(side * 0.55);
    ctx.fillStyle = i % 3 === 0 ? leafColorDark : leafColor;
    ctx.beginPath();
    ctx.ellipse(side * 10, 0, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Danger glow at bottom tip
  ctx.shadowColor = "rgba(200,30,30,0.7)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#a82010";
  ctx.beginPath();
  ctx.arc(cx, vineBottom, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawRock(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number, height: number,
  worldOffset: number,
  rockLowImg: CanvasImageSource | null = null,
  rockTallImg: CanvasImageSource | null = null,
) {
  const bx = x - worldOffset;
  if (bx > CANVAS_WIDTH || bx + width < 0) return;
  ctx.save();

  const isLow = height <= TILE_SIZE;
  const img = isLow ? rockLowImg : rockTallImg;

  if (img) {
    // Orange glow — enough to pop but not blinding
    ctx.shadowColor = "rgba(220,100,30,0.85)";
    ctx.shadowBlur = 22;
    ctx.filter = "brightness(1.8)";
    const drawW = width * 1.15;
    const drawX = bx + (width - drawW) / 2;
    ctx.drawImage(img, drawX, y, drawW, height);
    ctx.filter = "none";
  } else {
    // Procedural fallback
    const cx = bx + width / 2;
    const cy = y + height / 2;
    const rx = width * 0.46;
    const ry = height * 0.42;
    ctx.shadowColor = "rgba(255,230,180,0.85)";
    ctx.shadowBlur = 22;
    ctx.fillStyle = "#2e1c1c";
    ctx.beginPath();
    ctx.ellipse(cx, cy + height * 0.06, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#3a2222";
    ctx.beginPath();
    ctx.ellipse(cx - width * 0.06, cy - height * 0.08, rx * 0.72, ry * 0.52, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(220,70,0,0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy + height * 0.06, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawMeteor(
  ctx: CanvasRenderingContext2D,
  obs: { x: number; y: number; width: number; height: number; landed?: boolean; fallingY?: number; landedFrame?: number },
  worldOffset: number,
  frameCount: number,
  meteorImg: CanvasImageSource | null,
  craterImg: CanvasImageSource | null = null,
) {
  const bx = obs.x - worldOffset;
  if (bx > CANVAS_WIDTH + 20 || bx + obs.width < -20) return;
  ctx.save();

  if (!obs.landed) {
    const visualY = obs.fallingY ?? -90;
    const mx = bx + obs.width / 2;
    const imgH = obs.width * 2.2;

    // Fire trail above meteor
    const trailH = Math.max(50, Math.abs(visualY) * 0.25 + 60);
    const trailGrad = ctx.createLinearGradient(mx, visualY - trailH, mx, visualY);
    trailGrad.addColorStop(0, "rgba(255,120,0,0)");
    trailGrad.addColorStop(0.5, "rgba(255,80,0,0.3)");
    trailGrad.addColorStop(1, "rgba(255,50,0,0.7)");
    ctx.fillStyle = trailGrad;
    ctx.beginPath();
    ctx.ellipse(mx, visualY - trailH / 2, obs.width * 0.32, trailH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Meteor fireball image
    if (meteorImg) {
      ctx.drawImage(meteorImg, bx - obs.width * 0.1, visualY - imgH * 0.3, obs.width * 1.2, imgH);
    } else {
      ctx.fillStyle = "#331111";
      ctx.shadowColor = "#ff5500";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(mx, visualY + obs.width / 2, obs.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Landed crater
    const age = frameCount - (obs.landedFrame ?? 0);
    const cx = bx + obs.width / 2;
    const craterY = obs.y + obs.height;

    // Explosion flash (fades in 30 frames)
    if (age < 30) {
      const alpha = (1 - age / 30) * 0.78;
      ctx.globalAlpha = alpha;
      const flashR = obs.width * 2.4;
      const flashGrad = ctx.createRadialGradient(cx, craterY, 0, cx, craterY, flashR);
      flashGrad.addColorStop(0, "#ffffcc");
      flashGrad.addColorStop(0.3, "#ff8800");
      flashGrad.addColorStop(1, "rgba(200,50,0,0)");
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(cx, craterY, flashR, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (craterImg) {
      // Draw crater image — wide, anchored at ground level
      const craterW = obs.width * 3.8;
      const craterH = craterW * 0.42; // image is wide/shallow
      const drawX = cx - craterW / 2;
      const drawY = craterY - craterH * 0.72; // sit at ground line

      // Darken + warm-shift crater to blend with volcanic ground
      ctx.filter = "brightness(0.72) sepia(0.45)";
      ctx.shadowColor = "rgba(255,100,10,0.75)";
      ctx.shadowBlur = 22;
      ctx.drawImage(craterImg, drawX, drawY, craterW, craterH);
      ctx.filter = "none";
      ctx.shadowBlur = 0;

      // Animated ember flicker from cracks
      const flickerAlpha = 0.3 + Math.sin(frameCount * 0.18) * 0.15;
      ctx.globalAlpha = flickerAlpha;
      const emberGrad = ctx.createRadialGradient(cx, craterY - 4, 0, cx, craterY - 4, craterW * 0.38);
      emberGrad.addColorStop(0, "rgba(255,130,0,0.5)");
      emberGrad.addColorStop(0.5, "rgba(200,60,0,0.2)");
      emberGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = emberGrad;
      ctx.beginPath();
      ctx.ellipse(cx, craterY - 4, craterW * 0.38, craterH * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      // Procedural fallback
      ctx.shadowColor = "rgba(200,60,0,0.5)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#1a0808";
      ctx.beginPath();
      ctx.ellipse(cx, craterY - obs.height * 0.2, obs.width * 0.55, obs.height * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(220,70,0,0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, craterY - obs.height * 0.2, obs.width * 0.55, obs.height * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawLava(
  ctx: CanvasRenderingContext2D,
  x: number, width: number,
  worldOffset: number, frameCount: number,
) {
  const bx = x - worldOffset;
  if (bx > CANVAS_WIDTH || bx + width < 0) return;
  ctx.save();

  // Dark pit void
  ctx.fillStyle = "#0a0404";
  ctx.fillRect(bx, GROUND_Y, width, CANVAS_HEIGHT - GROUND_Y);

  // Animated lava surface
  const surfaceY = GROUND_Y + 5;
  ctx.beginPath();
  ctx.moveTo(bx, CANVAS_HEIGHT);
  ctx.lineTo(bx, surfaceY);
  for (let px = 0; px <= width; px += 3) {
    const wave = Math.sin((px / width) * Math.PI * 5 + frameCount * 0.14) * 5
                + Math.sin((px / width) * Math.PI * 2.5 + frameCount * 0.09) * 3;
    ctx.lineTo(bx + px, surfaceY + wave);
  }
  ctx.lineTo(bx + width, CANVAS_HEIGHT);
  ctx.closePath();

  const lavaGrad = ctx.createLinearGradient(bx, surfaceY, bx, surfaceY + 30);
  lavaGrad.addColorStop(0, "#ff5500");
  lavaGrad.addColorStop(0.35, "#cc2200");
  lavaGrad.addColorStop(1, "#7a0800");
  ctx.fillStyle = lavaGrad;
  ctx.fill();

  // Lava bubbles
  const numBubbles = Math.max(1, Math.floor(width / 22));
  ctx.fillStyle = "#ff7700";
  for (let b = 0; b < numBubbles; b++) {
    const bx2 = bx + (b + 0.5) * (width / numBubbles) + Math.sin(frameCount * 0.07 + b * 1.3) * 6;
    const by2 = surfaceY + 9 + Math.sin(frameCount * 0.11 + b * 1.8) * 4;
    const br = 2.5 + Math.sin(frameCount * 0.09 + b * 2.2) * 1;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.arc(bx2, by2, br, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Top glow strip
  ctx.fillStyle = "rgba(255,90,0,0.4)";
  ctx.fillRect(bx, GROUND_Y - 5, width, 9);

  // Left/right edge shadows
  const ledge = 8;
  const lg = ctx.createLinearGradient(bx - ledge, 0, bx + 6, 0);
  lg.addColorStop(0, "rgba(0,0,0,0)");
  lg.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = lg;
  ctx.fillRect(bx - ledge, GROUND_Y - 10, ledge + 6, CANVAS_HEIGHT - GROUND_Y + 10);
  const rg = ctx.createLinearGradient(bx + width - 6, 0, bx + width + ledge, 0);
  rg.addColorStop(0, "rgba(0,0,0,0.55)");
  rg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(bx + width - 6, GROUND_Y - 10, ledge + 6, CANVAS_HEIGHT - GROUND_Y + 10);

  ctx.restore();
}

const COLLECTIBLE_GLOW_COLOR = "#ffcc44";
const COLLECTIBLE_GLOW_BLUR = 14;

function drawCollectibles(ctx: CanvasRenderingContext2D, state: GameState, collectibleImg: CanvasImageSource | null) {
  const radius = 14;

  for (const c of state.collectibles) {
    if (c.collected) continue;
    const cx = c.x - state.worldOffset;
    if (cx < -30 || cx > CANVAS_WIDTH + 30) continue;

    ctx.save();
    ctx.shadowColor = "#ff8820";
    ctx.shadowBlur = COLLECTIBLE_GLOW_BLUR;

    if (collectibleImg) {
      ctx.drawImage(collectibleImg, cx - radius, c.y - radius, radius * 2, radius * 2);
    } else {
      // Procedural fallback orb
      ctx.translate(cx, c.y);
      const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, 0, 0, radius);
      grad.addColorStop(0, "#ffe566");
      grad.addColorStop(0.55, "#ff8800");
      grad.addColorStop(1, "#cc3300");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState, playerImg: CanvasImageSource | null, skinColor = "#E6D4A8") {
  const px = PLAYER_X + state.completionPlayerOffsetX + state.introPlayerOffsetX;
  const py = state.playerY;
  const cx = px + PLAYER_SIZE / 2;
  const cy = py + PLAYER_SIZE / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(state.playerRotation);

  if (playerImg) {
    const imgEl = playerImg as HTMLCanvasElement;
    const imgW = imgEl.width || 1;
    const imgH = imgEl.height || 1;
    const aspect = imgW / imgH;
    const drawH = PLAYER_SIZE * 2.0;
    const drawW = drawH * aspect * 0.9; // 90% width → squarer character
    const drawY = -drawH / 2;
    ctx.shadowColor = skinColor + "99";
    ctx.shadowBlur = 18;
    ctx.drawImage(playerImg, -drawW / 2, drawY, drawW, drawH);
  } else {
    drawGlow(ctx, 0, 0, PLAYER_SIZE * 1.5, COLORS.playerGlow);
    const grad = ctx.createLinearGradient(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE / 2, PLAYER_SIZE / 2);
    grad.addColorStop(0, "#c026d3");
    grad.addColorStop(0.5, "#a855f7");
    grad.addColorStop(1, "#7c3aed");
    ctx.fillStyle = grad;
    ctx.shadowColor = "#a855f7";
    ctx.shadowBlur = 20;
    const r = 5;
    const s = PLAYER_SIZE / 2;
    ctx.beginPath();
    ctx.moveTo(-s + r, -s); ctx.lineTo(s - r, -s);
    ctx.arcTo(s, -s, s, -s + r, r); ctx.lineTo(s, s - r);
    ctx.arcTo(s, s, s - r, s, r); ctx.lineTo(-s + r, s);
    ctx.arcTo(-s, s, -s, s - r, r); ctx.lineTo(-s, -s + r);
    ctx.arcTo(-s, -s, -s + r, -s, r);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawTrail(ctx: CanvasRenderingContext2D, state: GameState) {
  for (let i = state.trail.length - 1; i >= 0; i--) {
    const t = state.trail[i];
    const size = PLAYER_SIZE * (1 - i / state.trail.length) * 0.7;
    ctx.save();
    ctx.globalAlpha = t.alpha * 0.6;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.shadowColor = "rgba(255, 255, 255, 0.45)";
    ctx.shadowBlur = 8;
    ctx.fillRect(t.x + (PLAYER_SIZE - size) / 2, t.y + (PLAYER_SIZE - size) / 2, size, size);
    ctx.restore();
  }
}

function drawPlatform(ctx: CanvasRenderingContext2D, obs: { x: number; y: number; width: number }, worldOffset: number, level = 1) {
  const sx = obs.x - worldOffset;
  if (sx + obs.width < -20 || sx > CANVAS_WIDTH + 20) return;
  const py = obs.y;
  const pw = obs.width;
  const thickness = 18;
  ctx.save();

  if (level === 3) {
    // Stone volcanic platform
    const bodyGrad = ctx.createLinearGradient(sx, py, sx, py + thickness);
    bodyGrad.addColorStop(0, "#8a8a8a");
    bodyGrad.addColorStop(0.45, "#606060");
    bodyGrad.addColorStop(1, "#383838");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: Function }).roundRect(sx, py, pw, thickness, [4, 4, 2, 2]);
    ctx.fill();
    // Top highlight
    ctx.fillStyle = "rgba(200,200,210,0.4)";
    ctx.fillRect(sx + 3, py + 1, pw - 6, 3);
    // Crack marks
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + pw * 0.25, py + 4);
    ctx.lineTo(sx + pw * 0.28, py + thickness - 2);
    ctx.moveTo(sx + pw * 0.65, py + 2);
    ctx.lineTo(sx + pw * 0.62, py + thickness - 3);
    ctx.stroke();
    // Bottom drop shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: Function }).roundRect(sx + 2, py + thickness, pw - 4, 4, [0, 0, 3, 3]);
    ctx.fill();
    // Orange lava glow below
    const glowGrad = ctx.createLinearGradient(sx, py + thickness, sx, py + thickness + 14);
    glowGrad.addColorStop(0, "rgba(200,70,0,0.18)");
    glowGrad.addColorStop(1, "rgba(200,70,0,0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(sx + 4, py + thickness, pw - 8, 14);
  } else {
    // Sandy body with gradient (L1 / L2)
    const bodyGrad = ctx.createLinearGradient(sx, py, sx, py + thickness);
    bodyGrad.addColorStop(0, "#EAC460");
    bodyGrad.addColorStop(0.45, "#C89018");
    bodyGrad.addColorStop(1, "#8A5810");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: Function }).roundRect(sx, py, pw, thickness, [5, 5, 3, 3]);
    ctx.fill();
    // Top highlight
    ctx.fillStyle = "rgba(255, 248, 195, 0.55)";
    ctx.fillRect(sx + 3, py + 1, pw - 6, 3);
    // Bottom drop shadow
    ctx.fillStyle = "rgba(40, 20, 0, 0.28)";
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: Function }).roundRect(sx + 3, py + thickness, pw - 6, 5, [0, 0, 3, 3]);
    ctx.fill();
    // Left/right edge darkening
    ctx.fillStyle = "rgba(0, 0, 0, 0.10)";
    ctx.fillRect(sx, py, 4, thickness);
    ctx.fillRect(sx + pw - 4, py, 4, thickness);
    // Glow below platform
    const glowGrad = ctx.createLinearGradient(sx, py + thickness, sx, py + thickness + 18);
    glowGrad.addColorStop(0, "rgba(220, 165, 40, 0.22)");
    glowGrad.addColorStop(1, "rgba(220, 165, 40, 0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(sx + 4, py + thickness, pw - 8, 18);
  }

  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const p of state.particles) {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  }
}

function drawFinishGlow(ctx: CanvasRenderingContext2D, state: GameState, level: number) {
  if (state.isEndless) return;
  // Show rising glow on the right edge when nearing the end
  const APPEAR_PROGRESS = 0.88;
  if (state.progress < APPEAR_PROGRESS && !state.isComplete) return;

  const progressT = state.isComplete
    ? Math.min(1, state.completionFrames / 55)
    : (state.progress - APPEAR_PROGRESS) / (1 - APPEAR_PROGRESS);

  const edgeX = CANVAS_WIDTH;
  const centerY = GROUND_Y * 0.48;

  // Color theme per level
  const r = level === 2 ? 100 : 255;
  const g = level === 2 ? 255 : 220;
  const b = level === 2 ? 120 : 80;

  ctx.save();

  // Wide glow that bleeds inward from the right wall
  const glowRadius = 120 + progressT * 200;
  const glow = ctx.createRadialGradient(edgeX, centerY, 0, edgeX, centerY, glowRadius);
  glow.addColorStop(0,   `rgba(255,255,255,${0.92 * progressT})`);
  glow.addColorStop(0.15, `rgba(${r},${g},${b},${0.85 * progressT})`);
  glow.addColorStop(0.5,  `rgba(${r},${g},${b},${0.40 * progressT})`);
  glow.addColorStop(1,    "rgba(255,220,100,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Solid bright strip along the right edge
  const stripGrad = ctx.createLinearGradient(edgeX - 80, 0, edgeX, 0);
  stripGrad.addColorStop(0, "rgba(255,255,255,0)");
  stripGrad.addColorStop(1, `rgba(255,255,255,${0.80 * progressT})`);
  ctx.fillStyle = stripGrad;
  ctx.fillRect(edgeX - 80, 0, 80, CANVAS_HEIGHT);

  // Rotating light rays emanating from right-center
  ctx.save();
  ctx.translate(edgeX, centerY);
  const numRays = 10;
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2 + state.frameCount * 0.012;
    const len = 220 + progressT * 280;
    ctx.save();
    ctx.rotate(angle);
    ctx.globalAlpha = 0.14 * progressT;
    ctx.fillStyle = "#ffffd0";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, -18);
    ctx.lineTo(len,  18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Pulsing inner white orb at the wall
  const pulse = 0.85 + 0.15 * Math.sin(state.frameCount * 0.18);
  const orbR = (22 + progressT * 30) * pulse;
  const orb = ctx.createRadialGradient(edgeX, centerY, 0, edgeX, centerY, orbR);
  orb.addColorStop(0, `rgba(255,255,255,${progressT})`);
  orb.addColorStop(0.6, `rgba(255,240,160,${0.7 * progressT})`);
  orb.addColorStop(1,   "rgba(255,200,80,0)");
  ctx.fillStyle = orb;
  ctx.beginPath();
  ctx.arc(edgeX, centerY, orbR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawScoreUI(ctx: CanvasRenderingContext2D, state: GameState, collectibleImg: CanvasImageSource | null, level = 1) {
  ctx.save();

  const isFlashing = state.frameCount - state.lastCollectFrame < 22;
  const flashT = isFlashing ? 1 - (state.frameCount - state.lastCollectFrame) / 22 : 0;

  const pillW = 128;
  const pillH = 44;
  const pillX = 10;
  const pillY = 30;

  // Panel — earthy dark stone background
  ctx.fillStyle = "rgba(28, 18, 8, 0.88)";
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 10);
  ctx.fill();

  // Bottom shadow line (offset-shadow effect)
  const shadowColor = level === 3 ? "#7a1a08" : level === 2 ? "#3e5030" : "#9a4a10";
  ctx.fillStyle = shadowColor;
  ctx.beginPath();
  ctx.roundRect(pillX + 2, pillY + pillH, pillW - 4, 4, [0, 0, 4, 4]);
  ctx.fill();

  // Border
  const borderColor = level === 3 ? "rgba(200,70,20,0.55)" : level === 2 ? "rgba(148,168,116,0.55)" : "rgba(221,138,60,0.55)";
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 10);
  ctx.stroke();

  // Collectible icon
  const iconR = 15;
  const iconX = pillX + 20;
  const iconY = pillY + pillH / 2;

  ctx.save();
  if (isFlashing) {
    ctx.shadowColor = level === 3 ? "#ff6060" : level === 2 ? "#94A874" : "#f0a040";
    ctx.shadowBlur = 10 + flashT * 14;
  }
  if (collectibleImg) {
    ctx.drawImage(collectibleImg, iconX - iconR, iconY - iconR, iconR * 2, iconR * 2);
  } else {
    const pg = ctx.createRadialGradient(iconX - 3, iconY - 3, 0, iconX, iconY, iconR);
    pg.addColorStop(0, "#ffe080");
    pg.addColorStop(0.55, "#dd8a3c");
    pg.addColorStop(1, "#a04010");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Score number
  ctx.fillStyle = level === 3 ? "#e8a090" : level === 2 ? "#b8cc96" : "#E6D4A8";
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 4;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "bold 25px 'Lilita One', cursive";
  ctx.fillText(`${state.score}`, iconX + iconR + 7, pillY + pillH / 2 + 1);

  ctx.restore();
}

function drawProgressBar(ctx: CanvasRenderingContext2D, state: GameState, level = 1) {
  if (state.isEndless) return;
  const barH = 21;
  const pad = 10;
  const barW = CANVAS_WIDTH - pad * 2;
  const pct = state.progress;

  ctx.save();

  // Track
  ctx.fillStyle = "rgba(12, 8, 4, 0.75)";
  ctx.beginPath();
  ctx.roundRect(pad, 5, barW, barH, 5);
  ctx.fill();

  // Fill
  if (pct > 0) {
    const fillW = Math.max(8, barW * pct);
    const c1 = level === 3 ? "#C94A1E" : level === 2 ? "#6E8360" : "#C87020";
    const c2 = level === 3 ? "#E86030" : level === 2 ? "#94A874" : "#E8A030";
    const grad = ctx.createLinearGradient(pad, 0, pad + barW, 0);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(pad, 5, fillW, barH, 5);
    ctx.fill();
    // Shine strip
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.roundRect(pad, 5, fillW, barH * 0.45, [5, 5, 0, 0]);
    ctx.fill();
  }

  // Track border
  const borderC = level === 3 ? "rgba(200,70,20,0.3)" : level === 2 ? "rgba(148,168,116,0.3)" : "rgba(221,138,60,0.3)";
  ctx.strokeStyle = borderC;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(pad, 5, barW, barH, 5);
  ctx.stroke();

  // % label
  ctx.font = "bold 15px 'Lilita One', cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(230, 212, 168, 0.9)";
  ctx.shadowColor = "rgba(0,0,0,0.9)";
  ctx.shadowBlur = 3;
  ctx.fillText(`${Math.floor(pct * 100)}%`, CANVAS_WIDTH / 2, 5 + barH / 2 + 0.5);

  ctx.restore();
}

function drawWinScreen(ctx: CanvasRenderingContext2D, state: GameState, frameCount: number) {
  ctx.save();

  // Flash pulse
  const flashT = Math.min(1, frameCount / 30);
  const flash = Math.sin(flashT * Math.PI) * 0.4;
  ctx.fillStyle = `rgba(255, 220, 80, ${flash})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "rgba(10,5,0,0.72)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.font = "bold 46px 'Lilita One', cursive";
  ctx.textAlign = "center";
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 35;
  ctx.fillStyle = "#ffe57a";
  ctx.fillText("LEVEL COMPLETE!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70);

  ctx.font = "22px 'Lilita One', cursive";
  ctx.shadowColor = "#ff8800";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#ffd27a";
  ctx.fillText("🏖️  YOU MADE IT!  🏖️", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

  // Score display
  ctx.font = "bold 16px 'Lilita One', cursive";
  ctx.shadowColor = "#ffd700";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#ffe090";
  ctx.fillText(`◉  ${state.score} / 30 pebbles collected`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

  // Buttons drawn on canvas (click zones handled in React overlay)
  const btnY = CANVAS_HEIGHT / 2 + 55;
  const btnH = 38;
  const btn1X = CANVAS_WIDTH / 2 - 160;
  const btn2X = CANVAS_WIDTH / 2 + 20;
  const btnW = 140;

  // Next Level button
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#ff8800";
  ctx.fillStyle = "rgba(200,90,0,0.85)";
  ctx.beginPath();
  ctx.roundRect(btn1X, btnY, btnW, btnH, 10);
  ctx.fill();
  ctx.strokeStyle = "#ffaa44";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.font = "bold 14px 'Lilita One', cursive";
  ctx.fillStyle = "#fff8e8";
  ctx.fillText("NEXT LEVEL", btn1X + btnW / 2, btnY + 24);

  // Home button
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#4455aa";
  ctx.fillStyle = "rgba(30,50,120,0.85)";
  ctx.beginPath();
  ctx.roundRect(btn2X, btnY, btnW, btnH, 10);
  ctx.fill();
  ctx.strokeStyle = "#8899ff";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#e8eeff";
  ctx.fillText("HOME", btn2X + btnW / 2, btnY + 24);

  ctx.restore();
}

function drawStartScreen(ctx: CanvasRenderingContext2D, frameCount: number) {
  ctx.save();
  ctx.fillStyle = "rgba(20,10,0,0.45)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const pulse = 0.85 + 0.15 * Math.sin(frameCount * 0.05);

  ctx.font = "bold 20px 'Lilita One', cursive";
  ctx.textAlign = "center";
  ctx.fillStyle = `rgba(255,230,150,${pulse})`;
  ctx.shadowColor = "#ffaa00";
  ctx.shadowBlur = 12 * pulse;
  ctx.fillText("PRESS SPACE / TAP TO START", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);

  ctx.font = "13px 'Lilita One', cursive";
  ctx.fillStyle = "rgba(255,200,100,0.65)";
  ctx.shadowBlur = 0;
  ctx.fillText("Hold space / tap to jump", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 24);
  ctx.restore();
}

function drawDeathScreen(ctx: CanvasRenderingContext2D, _state: GameState, _frameCount: number) {
  ctx.save();
  ctx.fillStyle = "rgba(14, 4, 4, 0.68)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();
}

function drawPauseOverlay(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 5, 0, 0.62)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();
}

export function render(ctx: CanvasRenderingContext2D, state: GameState, images: BackgroundImages, level = 1, skinColor = "#AAAAAA", displayLevel?: number, bgFadeToLevel?: number, bgFadeAlpha?: number) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const bgLevel = displayLevel ?? level;
  drawBackground(ctx, state, images, bgLevel);

  if (bgFadeToLevel && bgFadeAlpha && bgFadeAlpha > 0) {
    ctx.globalAlpha = bgFadeAlpha;
    drawBackground(ctx, state, images, bgFadeToLevel);
    ctx.globalAlpha = 1;
  }

  // Draw pits and lava first (they cut into the floor layer)
  for (const obs of state.obstacles) {
    if (obs.type === "pit") {
      drawPit(ctx, obs.x, obs.width, state.worldOffset);
    } else if (obs.type === "lava") {
      drawLava(ctx, obs.x, obs.width, state.worldOffset, state.frameCount);
    }
  }

  drawCollectibles(ctx, state, images.collectibleImg);

  // Draw platforms first (behind spikes that sit on them)
  for (const obs of state.obstacles) {
    if (obs.type === "platform") {
      drawPlatform(ctx, obs, state.worldOffset, level);
    }
  }

  // Draw falling meteors behind other obstacles
  for (const obs of state.obstacles) {
    if (obs.type === "meteor" && !obs.landed) {
      drawMeteor(ctx, obs, state.worldOffset, state.frameCount, images.meteorImg, images.craterImg);
    }
  }

  for (const obs of state.obstacles) {
    if (obs.type === "spike") {
      drawSpike(ctx, obs.x, obs.y, state.worldOffset, images.shell1, obs.onTop);
    } else if (obs.type === "block") {
      drawBlock(ctx, obs.x, obs.y, obs.width, obs.height, state.worldOffset, images.shell2);
    } else if (obs.type === "mushroom") {
      drawMushroom(ctx, obs.x, obs.y, obs.width, obs.height, state.worldOffset, images.mushroom);
    } else if (obs.type === "vine") {
      drawVine(ctx, obs.x, obs.width, obs.height, state.worldOffset);
    } else if (obs.type === "rock") {
      drawRock(ctx, obs.x, obs.y, obs.width, obs.height, state.worldOffset, images.rockLow, images.rockTall);
    } else if (obs.type === "meteor" && obs.landed) {
      drawMeteor(ctx, obs, state.worldOffset, state.frameCount, images.meteorImg, images.craterImg);
    }
    // pit and lava already handled above
  }

  drawFinishGlow(ctx, state, level);
  drawTrail(ctx, state);
  drawParticles(ctx, state);

  // Player drawn BEFORE overlays
  drawPlayer(ctx, state, images.player, skinColor);

  drawProgressBar(ctx, state, level);
  drawScoreUI(ctx, state, images.collectibleImg, level);

  if (!state.isStarted && !state.isDead && !state.isComplete) {
    drawStartScreen(ctx, state.frameCount);
  }
  if (state.isDead) {
    drawDeathScreen(ctx, state, state.frameCount);
  }
  if (state.isPaused && !state.isComplete) {
    drawPauseOverlay(ctx);
  }
}
