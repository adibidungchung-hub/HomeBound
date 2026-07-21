export interface LevelProgress {
  best: number;
  completed: boolean;
  pebbles: number;
}

const STORAGE_KEY = "gd_progress_v1";
const SPENT_KEY = "gd_spent_v1";

function getAll(): Record<string, LevelProgress> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getLevelProgress(level: number): LevelProgress {
  const p = getAll()[String(level)];
  return p ? { best: p.best, completed: p.completed, pebbles: p.pebbles ?? 0 } : { best: 0, completed: false, pebbles: 0 };
}

export function saveLevelProgress(level: number, progressFraction: number, completed: boolean, pebbles = 0): void {
  try {
    const all = getAll();
    const key = String(level);
    const current = all[key] ?? { best: 0, completed: false, pebbles: 0 };
    const bestPct = Math.min(100, Math.round(progressFraction * 100));
    all[key] = {
      best: Math.max(current.best, bestPct),
      completed: current.completed || completed,
      // Only award pebbles when the level is completed
      pebbles: (current.pebbles ?? 0) + (completed ? pebbles : 0),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage may not be available
  }
}

export function getTotalPebbles(): number {
  const all = getAll();
  return Object.values(all).reduce((sum, p) => sum + (p.pebbles ?? 0), 0);
}

export function getSpentPebbles(): number {
  try {
    return parseInt(localStorage.getItem(SPENT_KEY) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

export function spendPebbles(amount: number): void {
  try {
    const current = getSpentPebbles();
    localStorage.setItem(SPENT_KEY, String(current + amount));
  } catch {}
}

export function getAvailablePebbles(): number {
  return Math.max(0, getTotalPebbles() - getSpentPebbles());
}
