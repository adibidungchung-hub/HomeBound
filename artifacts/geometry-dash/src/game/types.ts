export type ObstacleType = "spike" | "block" | "pit" | "mushroom" | "vine" | "platform" | "rock" | "lava" | "meteor";

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  onTop?: boolean;
  // Meteor-specific state
  landed?: boolean;
  landedFrame?: number;
  fallingY?: number;
  fallSpeed?: number;
}

export interface Collectible {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
}

export interface ProtectedZone {
  minX: number;
  maxX: number;
}

export interface GameState {
  level: number;
  playerY: number;
  playerVY: number;
  playerRotation: number;
  isOnGround: boolean;
  isDead: boolean;
  isStarted: boolean;
  isComplete: boolean;
  isPaused: boolean;
  progress: number; // 0..1
  worldOffset: number;
  bgScrollOffset: number;
  speed: number;
  obstacles: Obstacle[];
  collectibles: Collectible[];
  protectedZones: ProtectedZone[];
  score: number;
  lastCollectFrame: number;
  particles: Particle[];
  trail: TrailPoint[];
  stars: Star[];
  frameCount: number;
  deathX: number;
  deathY: number;
  nextSpawnX: number;
  completionFrames: number;
  completionPlayerOffsetX: number;
  introPlayerOffsetX: number;
  isEndless: boolean;
}
