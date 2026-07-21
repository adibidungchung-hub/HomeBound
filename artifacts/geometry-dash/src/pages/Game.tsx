import { useEffect, useRef, useCallback, useState } from "react";
import { useParams, useLocation } from "wouter";
import EndingCutscene from "./EndingCutscene";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_X, PLAYER_SIZE } from "../game/constants";
import { createInitialState, jump, update } from "../game/engine";
import { render } from "../game/renderer";
import type { GameState } from "../game/types";
import type { BackgroundImages } from "../game/renderer";
import { saveLevelProgress } from "../lib/progress";
import { soundManager } from "../game/sound";
import { getEquippedSkin } from "../lib/skins";
import { useLang, T } from "../lib/lang";
import { GearIcon, SettingsModal } from "../components/SettingsModal";

import skyUrl from "@assets/Sky_1781684548659.png";
import sunUrl from "@assets/Sun_1781684548660.png";
import seaUrl from "@assets/Sea_1781684548657.png";
import sea1Url from "@assets/1_1784568337693.png";
import sea2Url from "@assets/2_1784568337690.png";
import sea3Url from "@assets/3_1784568337692.png";
import sea4Url from "@assets/4_1784568337692.png";
import sea5Url from "@assets/5_1784568337692.png";
import sea6Url from "@assets/6_1784568337692.png";
import sea7Url from "@assets/7_1784568337693.png";
import sea8Url from "@assets/8_1784568337693.png";
import treesUrl from "@assets/Trees_1781684548660.png";
import trees1Url from "@assets/Trees-1_1781684548661.png";
import cloudUrl from "@assets/Cloud_1781684548661.png";
import floorUrl from "@assets/Floor_1781684548662.png";
const playerUrl = getEquippedSkin().image;
import shell1Url from "@assets/Map_1_BEach_1782286950955.png";
import shell2Url from "@assets/Map_1_BEach_(1)_1782286953057.png";
import palmTreeUrl from "@assets/Gemini_Generated_Image_n4abpun4abpun4ab-Photoroom_upscayl_4x_r_1783954439742.png";
const collectibleUrl = "/sunstone.png";
import sky2Url from "@assets/Sky_1784048652271.png";
import floor2Url from "@assets/Floor_1784048654500.png";
import tree2Url from "@assets/Gemini_Generated_Image_ep0xl0ep0xl0ep0x-Photoroom_1784048617948.png";
import cloud2Url from "@assets/Gemini_Generated_Image_jqguo0jqguo0jqgu-Photoroom_1784048615844.png";
import rockLowUrl from "@assets/image_1784562318248.png";
import meteorUrl from "@assets/image_1784562395598.png";
import rockTallUrl from "@assets/image_1784562536288.png";
import bgVolcanicUrl from "@assets/image_1784562580569.png";
const craterUrl = "/crater.png";
const bg3SkyUrl = "/bg3-sky.png";
const bg3MountainsUrl = "/bg3-mountains.png";
const bg3HillsUrl = "/bg3-hills.png";
const bg3CloudsUrl = "/bg3-clouds.png";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });
}

function removeWhiteBg(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const cx = c.getContext("2d")!;
  cx.drawImage(img, 0, 0);
  const d = cx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) {
    if (d.data[i] > 220 && d.data[i + 1] > 220 && d.data[i + 2] > 220) d.data[i + 3] = 0;
  }
  cx.putImageData(d, 0, 0);
  return c;
}

function removeBlackBg(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const cx = c.getContext("2d")!;
  cx.drawImage(img, 0, 0);
  const d = cx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) {
    const r = d.data[i], g = d.data[i + 1], b = d.data[i + 2];
    if (r < 45 && g < 45 && b < 45) d.data[i + 3] = 0;
  }
  cx.putImageData(d, 0, 0);
  return c;
}

function processPalmTree(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const cx = c.getContext("2d")!;
  cx.drawImage(img, 0, 0);
  const d = cx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) {
    if (d.data[i] > 200 && d.data[i + 1] > 200 && d.data[i + 2] > 200 && d.data[i + 3] > 10) d.data[i + 3] = 0;
  }
  cx.putImageData(d, 0, 0);
  return c;
}

const MAX_LEVELS = 3;

const TITLE_F = "'Lilita One', cursive";
const BODY_F = "'Nunito', sans-serif";

const HomeIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const RetryIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
const PlayIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21"/></svg>;
const NextIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;

const CIRC: React.CSSProperties = {
  width: 60, height: 60, borderRadius: "50%", border: "none",
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 4px 0 rgba(0,0,0,0.4)",
};

function CircBtn({ color, shadow, onClick, label, children }: {
  color: string; shadow: string; onClick: () => void; label: string; children: React.ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <button
        ref={ref}
        onClick={() => { soundManager.playSfx("btn"); onClick(); }}
        style={{
          ...CIRC,
          background: color,
          boxShadow: `0 4px 0 ${shadow}`,
          transform: hovered ? "translateY(-3px) scale(1.08)" : "translateY(0) scale(1)",
          filter: hovered ? "brightness(1.18)" : "brightness(1)",
          transition: "transform 0.13s ease, filter 0.13s ease, box-shadow 0.13s ease",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); if (ref.current) { ref.current.style.transform = ""; ref.current.style.boxShadow = `0 4px 0 ${shadow}`; } }}
        onMouseDown={() => {
          setHovered(false);
          if (ref.current) { ref.current.style.transform = "translateY(3px) scale(0.96)"; ref.current.style.boxShadow = `0 1px 0 ${shadow}`; }
        }}
        onMouseUp={() => {
          if (ref.current) { ref.current.style.transform = "translateY(0) scale(1)"; ref.current.style.boxShadow = `0 4px 0 ${shadow}`; }
        }}
      >
        {children}
      </button>
      <span style={{ fontFamily: BODY_F, fontWeight: "700", fontSize: 9, color: "rgba(230,212,168,0.65)", letterSpacing: 1, textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}

function HomeSmallBtn({ level, onClick }: { level: number; onClick: (e: React.MouseEvent) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const accent = level === 2 ? "rgba(148,220,120,0.9)" : level === 3 ? "rgba(255,120,60,0.9)" : "rgba(255,200,100,0.9)";
  const border = level === 2 ? "rgba(148,168,116,0.5)" : level === 3 ? "rgba(200,70,20,0.5)" : "rgba(221,138,60,0.5)";
  const shadow = level === 2 ? "#3e5030" : level === 3 ? "#7a1a08" : "#8a3a08";
  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={() => { if (ref.current) { ref.current.style.transform = "translateY(2px) scale(0.94)"; ref.current.style.boxShadow = `0 1px 0 ${shadow}`; } }}
      onMouseUp={() => { if (ref.current) { ref.current.style.transform = ""; ref.current.style.boxShadow = `0 3px 0 ${shadow}`; } }}
      style={{
        position: "absolute", top: 52, right: 12,
        width: 57, height: 57, borderRadius: "50%",
        background: "rgba(28, 18, 8, 0.82)",
        border: `1.5px solid ${border}`,
        boxShadow: `0 3px 0 ${shadow}`,
        cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center", zIndex: 10,
        transform: hovered ? "translateY(-2px) scale(1.1)" : "translateY(0) scale(1)",
        filter: hovered ? "brightness(1.25)" : "brightness(1)",
        transition: "transform 0.13s ease, filter 0.13s ease",
      }}
    >
      <svg width="27" height="24" viewBox="0 0 18 16" fill="none">
        <path d="M9 1L1 8h2.5v6h4v-4h3v4h4V8H17L9 1z" fill={accent} />
      </svg>
    </button>
  );
}

function PauseBtn({ level, onClick }: { level: number; onClick: (e: React.MouseEvent) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const accent = level === 2 ? "rgba(148,220,120,0.9)" : level === 3 ? "rgba(255,120,60,0.9)" : "rgba(255,200,100,0.9)";
  const border = level === 2 ? "rgba(148,168,116,0.5)" : level === 3 ? "rgba(200,70,20,0.5)" : "rgba(221,138,60,0.5)";
  const shadow = level === 2 ? "#3e5030" : level === 3 ? "#7a1a08" : "#8a3a08";
  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={() => { if (ref.current) { ref.current.style.transform = "translateY(2px) scale(0.94)"; ref.current.style.boxShadow = `0 1px 0 ${shadow}`; } }}
      onMouseUp={() => { if (ref.current) { ref.current.style.transform = ""; ref.current.style.boxShadow = `0 3px 0 ${shadow}`; } }}
      style={{
        position: "absolute", top: 52, right: 12,
        width: 57, height: 57, borderRadius: "50%",
        background: "rgba(28, 18, 8, 0.82)",
        border: `1.5px solid ${border}`,
        boxShadow: `0 3px 0 ${shadow}`,
        cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center", gap: 5, zIndex: 10,

        transform: hovered ? "translateY(-2px) scale(1.1)" : "translateY(0) scale(1)",
        filter: hovered ? "brightness(1.25)" : "brightness(1)",
        transition: "transform 0.13s ease, filter 0.13s ease",
      }}
    >
      <span style={{ width: 4, height: 18, background: accent, borderRadius: 2, display: "block" }} />
      <span style={{ width: 4, height: 18, background: accent, borderRadius: 2, display: "block" }} />
    </button>
  );
}

const BTN: React.CSSProperties = {
  padding: "13px 0",
  width: 200,
  borderRadius: 14,
  fontFamily: TITLE_F,
  fontWeight: "400",
  fontSize: 17,
  cursor: "pointer",
  letterSpacing: 1.5,
  color: "#fff",
  textAlign: "center",
  border: "none",
  boxShadow: "0 4px 0 rgba(0,0,0,0.4)",
  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
};

export default function Game() {
  const params = useParams<{ level: string }>();
  const [, navigate] = useLocation();
  const level = Math.max(1, Math.min(MAX_LEVELS, parseInt(params?.level ?? "1", 10)));
  const levelRef = useRef(level);

  const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState(level));
  const animRef = useRef<number>(0);
  const jumpPressedRef = useRef(false);
  const isPausedRef = useRef(false);
  const progressSavedRef = useRef(false);
  const isStartedRef = useRef(false);
  const isEndingRef = useRef(false);
  const completeFiredRef = useRef(false);

  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEndingCutscene, setIsEndingCutscene] = useState(false);
  const fadingToBlackRef = useRef(false);
  const [fadeToBlack, setFadeToBlack] = useState(false);
  const wasDeadRef = useRef(false);
  const prevScoreRef = useRef(0);
  const landedMeteorsRef = useRef<Set<number>>(new Set());
  const deathProgressRef = useRef(0);
  const deathScoreRef = useRef(0);
  const skinColorRef = useRef(getEquippedSkin().color);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hintFaded, setHintFaded] = useState(false);
  const [lang] = useLang();
  const t = T[lang];

  useEffect(() => {
    const t = setTimeout(() => setHintFaded(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const imagesRef = useRef<BackgroundImages>({
    sky: null, sun: null, sea: null, seaFrames: [],
    trees: null, trees1: null, cloud: null, floor: null,
    player: null, shell1: null, shell2: null, palmTree: null,
    collectibleImg: null, mushroom: null,
    sky2: null, floor2: null, tree2: null, cloud2: null,
    rockLow: null, rockTall: null, meteorImg: null, craterImg: null, bgVolcanic: null,
    bg3Sky: null, bg3Mountains: null, bg3Hills: null, bg3Clouds: null,
    forestTrees: null,
  });

  useEffect(() => {
    const seaFrameUrls = [sea1Url, sea2Url, sea3Url, sea4Url, sea5Url, sea6Url, sea7Url, sea8Url];
    Promise.all([
      loadImage(skyUrl), loadImage(sunUrl), loadImage(seaUrl),
      loadImage(treesUrl), loadImage(trees1Url), loadImage(cloudUrl),
      loadImage(floorUrl), loadImage(playerUrl), loadImage(shell1Url),
      loadImage(shell2Url), loadImage(palmTreeUrl), loadImage(collectibleUrl),
      loadImage(sky2Url), loadImage(floor2Url), loadImage(tree2Url), loadImage(cloud2Url),
      loadImage("/mushroom.png"),
      loadImage(rockLowUrl), loadImage(rockTallUrl), loadImage(meteorUrl), loadImage(bgVolcanicUrl),
      loadImage(craterUrl),
      loadImage(bg3SkyUrl), loadImage(bg3MountainsUrl), loadImage(bg3HillsUrl), loadImage(bg3CloudsUrl),
      loadImage("/forest-trees-silhouette.png"),
      ...seaFrameUrls.map(loadImage),
    ]).then(([sky, sun, sea, trees, trees1, cloud, floor, playerRaw, shell1Raw, shell2Raw, palmTreeRaw, collectibleRaw, sky2, floor2, tree2Raw, cloud2Raw, mushroomRaw, rockLowRaw, rockTallRaw, meteorRaw, bgVolcanicRaw, craterRaw, bg3SkyRaw, bg3MountainsRaw, bg3HillsRaw, bg3CloudsRaw, forestTreesRaw, ...seaFrames]) => {
      imagesRef.current = {
        sky, sun, sea,
        seaFrames: seaFrames as HTMLImageElement[],
        trees, trees1, cloud, floor,
        player: removeWhiteBg(playerRaw),
        shell1: removeWhiteBg(shell1Raw),
        shell2: removeWhiteBg(shell2Raw),
        palmTree: processPalmTree(palmTreeRaw),
        collectibleImg: removeBlackBg(collectibleRaw),
        mushroom: removeWhiteBg(mushroomRaw),
        sky2: sky2 as HTMLImageElement,
        floor2: floor2 as HTMLImageElement,
        tree2: removeWhiteBg(tree2Raw) as unknown as HTMLImageElement,
        cloud2: removeWhiteBg(cloud2Raw) as unknown as HTMLImageElement,
        rockLow: removeWhiteBg(rockLowRaw),
        rockTall: removeWhiteBg(rockTallRaw),
        meteorImg: removeWhiteBg(meteorRaw),
        craterImg: removeWhiteBg(craterRaw),
        bgVolcanic: bgVolcanicRaw as HTMLImageElement,
        bg3Sky: bg3SkyRaw as HTMLImageElement,
        bg3Mountains: bg3MountainsRaw as HTMLImageElement,
        bg3Hills: bg3HillsRaw as HTMLImageElement,
        bg3Clouds: removeBlackBg(bg3CloudsRaw) as unknown as HTMLImageElement,
        forestTrees: removeWhiteBg(forestTreesRaw),
      };
      soundManager.loadMusic(
        level === 3 ? "/music-level3.mp3" : level === 2 ? "/music-level2.mp3" : "/music-level1.mp3"
      );
      soundManager.loadSfx("jump", "/sfx-jump.mp3");
      soundManager.loadSfx("collect", "/sfx-collect.mp3", 4, 1.5);
      soundManager.loadSfx("complete", "/sfx-complete.mp3");
      soundManager.loadSfx("btn", "/sfx-btn.mp3", 4, 1.3);
      setIsLoaded(true);
      soundManager.playMusic();
    });
  }, []);

  const saveProgress = useCallback(() => {
    if (progressSavedRef.current) return; // already saved this run's pebbles
    progressSavedRef.current = true;
    const s = stateRef.current;
    saveLevelProgress(level, s.progress, s.isComplete, s.score);
  }, [level]);

  const togglePause = useCallback(() => {
    const state = stateRef.current;
    if (!state.isStarted || state.isDead || state.isComplete) return;
    const next = !isPausedRef.current;
    isPausedRef.current = next;
    state.isPaused = next;
    setIsPaused(next);
    soundManager.playSfx("btn");
  }, []);

  const handleResume = useCallback(() => {
    isPausedRef.current = false;
    stateRef.current.isPaused = false;
    setIsPaused(false);
  }, []);

  const handleRetry = useCallback(() => {
    saveProgress();
    progressSavedRef.current = false; // allow next run to save
    setIsComplete(false);
    setIsDead(false);
    wasDeadRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    soundManager.restartMusic();
    const newState = createInitialState(level);
    stateRef.current = newState;
  }, [saveProgress, level]);

  const handleDeathRetry = useCallback(() => {
    saveProgress();
    progressSavedRef.current = false; // allow next run to save
    setIsDead(false);
    wasDeadRef.current = false;
    setIsComplete(false);
    const newState = createInitialState(level);
    stateRef.current = newState;
    newState.isStarted = true;
    isPausedRef.current = false;
    setIsPaused(false);
    soundManager.restartMusic();
    jump(newState);
  }, [saveProgress, level]);

  const handleGoHome = useCallback(() => {
    saveProgress();
    navigate("/levels");
  }, [saveProgress, navigate]);

  const handleJump = useCallback(() => {
    const state = stateRef.current;
    if (state.isPaused) return;
    if (state.isComplete) return;
    soundManager.playSfx("jump");
    if (state.isDead) {
      saveProgress();
      progressSavedRef.current = false; // allow next run to save
      prevScoreRef.current = 0;
      setIsDead(false);
      wasDeadRef.current = false;
      setIsComplete(false);
      const newState = createInitialState(level);
      stateRef.current = newState;
      newState.isStarted = true;
      isPausedRef.current = false;
      setIsPaused(false);
      soundManager.restartMusic();
      jump(newState);
    } else {
      jump(state);
    }
  }, [saveProgress, level]);

  useEffect(() => {
    stateRef.current = createInitialState(level);
    levelRef.current = level;
    setIsComplete(false);
    setIsDead(false);
    setIsPaused(false);
    setIsStarted(false);
    isPausedRef.current = false;
    progressSavedRef.current = false;
    wasDeadRef.current = false;
    isStartedRef.current = false;
    prevScoreRef.current = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function loop() {
      if (!ctx) return;
      const cv = ctx.canvas;
      const physW = Math.round(cv.offsetWidth * dpr);
      const physH = Math.round(cv.offsetHeight * dpr);
      if (physW > 0 && physH > 0 && (cv.width !== physW || cv.height !== physH)) {
        cv.width = physW;
        cv.height = physH;
      }
      ctx.setTransform(cv.width / CANVAS_WIDTH, 0, 0, cv.height / CANVAS_HEIGHT, 0, 0);
      if (!isEndingRef.current) update(stateRef.current);
      render(ctx, stateRef.current, imagesRef.current, levelRef.current, skinColorRef.current);
      const s = stateRef.current;
      // Detect meteor landings and play boom SFX
      for (const obs of s.obstacles) {
        if (obs.type === "meteor" && obs.landed && obs.landedFrame === s.frameCount - 1) {
          if (!landedMeteorsRef.current.has(obs.x)) {
            landedMeteorsRef.current.add(obs.x);
            soundManager.playSynthMeteorBoom();
          }
        }
      }
      if (s.score > prevScoreRef.current) {
        soundManager.playSfx("collect");
        prevScoreRef.current = s.score;
      }
      if (s.isComplete && !completeFiredRef.current) {
        completeFiredRef.current = true;
        setFinalScore(s.score);
        if (!progressSavedRef.current) {
          saveLevelProgress(level, 1.0, true, s.score);
          progressSavedRef.current = true;
        }
        if (levelRef.current === 3) {
          soundManager.fadeMusic(2000); // slow fade during walk-off
          // walk-off + fade-to-black is detected below in the loop
        } else {
          soundManager.playSfx("complete");
          soundManager.fadeMusic(1000);
          setIsComplete(true);
        }
      }
      // Level 3: detect player walking off right edge → fade to black → show video
      if (s.isComplete && levelRef.current === 3 && !isEndingRef.current && !fadingToBlackRef.current) {
        const playerRightEdge = PLAYER_X + s.completionPlayerOffsetX + PLAYER_SIZE;
        if (playerRightEdge > CANVAS_WIDTH) {
          fadingToBlackRef.current = true;
          setFadeToBlack(true);
          setTimeout(() => {
            isEndingRef.current = true;
            setIsEndingCutscene(true);
          }, 1500);
        }
      }
      if (s.isStarted && !isStartedRef.current) {
        isStartedRef.current = true;
        setIsStarted(true);
      }
      if (s.isDead && !wasDeadRef.current) {
        soundManager.playSynthDeath();
        soundManager.fadeMusic(1400);
        deathProgressRef.current = Math.floor(s.progress * 100);
        deathScoreRef.current = s.score;
        setIsDead(true);
      }
      wasDeadRef.current = s.isDead;
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [level]);

  useEffect(() => {
    return () => { saveProgress(); soundManager.stopMusic(); };
  }, [saveProgress]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Escape") { e.preventDefault(); togglePause(); return; }
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        if (!jumpPressedRef.current) { jumpPressedRef.current = true; handleJump(); }
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") jumpPressedRef.current = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handleJump, togglePause]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    handleJump();
  }, [handleJump]);

  const handleContinue = useCallback(() => {
    soundManager.stopMusic();
    if (level < MAX_LEVELS) {
      navigate(`/game/${level + 1}`);
    } else {
      navigate("/levels");
    }
  }, [level, navigate]);

  const handleReplay = useCallback(() => {
    progressSavedRef.current = false;
    setIsComplete(false);
    soundManager.restartMusic();
    const newState = createInitialState(level);
    stateRef.current = newState;
    isPausedRef.current = false;
    setIsPaused(false);
  }, [level]);


  const isLevel2 = level === 2;
  const isLevel3 = level === 3;
  const pageBg = isLevel3 ? "#0d0d18" : isLevel2 ? "#141c10" : "#1a1610";
  const winBg = isLevel3 ? "rgba(13,13,24,0.94)" : isLevel2 ? "rgba(20,28,16,0.94)" : "rgba(26,22,16,0.94)";
  const winTitleColor = isLevel3 ? "#E8A090" : isLevel2 ? "#94A874" : "#E6D4A8";
  const winTitleGlow = isLevel3 ? "#8a2010" : isLevel2 ? "#3e5030" : "#8a6a20";
  const winEmoji = isLevel3 ? "🌋" : isLevel2 ? "🌲" : "🏖️";
  const accentBg = isLevel3 ? "#C94A1E" : isLevel2 ? "#6E8360" : "#DD8A3C";
  const accentBorder = isLevel3 ? "#7a1a08" : isLevel2 ? "#3e5030" : "#a05a1a";

  return (
    <div
      className="select-none"
      style={{ position: "fixed", inset: 0, background: pageBg, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ position: "relative", width: "min(100vw, calc(100vh * 16 / 9))", height: "min(100vh, calc(100vw * 9 / 16))", flexShrink: 0 }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", outline: "none", cursor: "pointer" }}
          onPointerDown={handlePointerDown}
          tabIndex={0}
          data-testid="game-canvas"
        />

        {/* Top-right button: home icon before game starts, pause icon once playing */}
        {!isPaused && !isDead && !isComplete && (
          isStarted
            ? <PauseBtn level={level} onClick={(e) => { e.stopPropagation(); soundManager.playSfx("btn"); togglePause(); }} />
            : <HomeSmallBtn level={level} onClick={(e) => { e.stopPropagation(); soundManager.playSfx("btn"); navigate("/"); }} />
        )}

        {/* Pause overlay */}
        {isPaused && !isComplete && (
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              zIndex: 25, gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: TITLE_F, fontSize: 28,
                color: winTitleColor,
                textShadow: `0 3px 0 ${winTitleGlow}`,
                letterSpacing: 3, marginBottom: 16,
              }}
            >
              {t.paused}
            </div>
            <div style={{ display: "flex", gap: 22, marginTop: 4 }}>
              <CircBtn color={accentBg} shadow={accentBorder} onClick={handleResume} label={t.resume}><PlayIcon /></CircBtn>
              <CircBtn color="#8A867D" shadow="#5a5650" onClick={handleRetry} label={t.retry}><RetryIcon /></CircBtn>
              <CircBtn color="#3a3630" shadow="#1a1610" onClick={handleGoHome} label={t.home}><HomeIcon /></CircBtn>
            </div>
            <button
              onClick={() => { soundManager.playSfx("btn"); setSettingsOpen(true); }}
              style={{
                marginTop: 20, display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.13)",
                borderRadius: 12, padding: "9px 22px", cursor: "pointer",
                fontFamily: BODY_F, fontWeight: "700", fontSize: 10,
                color: "rgba(230,212,168,0.6)", letterSpacing: 2, textTransform: "uppercase",
                transition: "filter 0.12s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.4)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = ""; }}
            >
              <GearIcon size={13} /> {t.settings}
            </button>
          </div>
        )}
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} accentColor={accentBg} />}

        {/* Black fade overlay — level 3 walk-off to video */}
        {fadeToBlack && !isEndingCutscene && (
          <>
            <style>{`@keyframes fadeInBlack { from { opacity: 0; } to { opacity: 1; } }`}</style>
            <div style={{ position: 'absolute', inset: 0, background: '#000', zIndex: 24, animation: 'fadeInBlack 1.5s ease-in forwards' }} />
          </>
        )}

        {/* Ending cutscene — level 3 only */}
        {isEndingCutscene && (
          <EndingCutscene onHome={() => { navigate("/"); }} />
        )}

        {/* Win screen overlay */}
        {isComplete && (
          <div
            style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: winBg, zIndex: 20, backdropFilter: "blur(2px)", gap: 0,
            }}
          >
            <div
              style={{
                fontFamily: TITLE_F, fontSize: 30,
                color: winTitleColor, textShadow: `0 3px 0 ${winTitleGlow}`,
                marginBottom: 4, letterSpacing: 2,
              }}
            >
              {t.levelComplete(level)}
            </div>
            <div
              style={{
                fontFamily: BODY_F, fontWeight: "700", fontSize: 13,
                color: isLevel2 ? "#94A874" : "#C8C1B7",
                marginBottom: 16, letterSpacing: 3, textTransform: "uppercase",
              }}
            >
              {winEmoji}&nbsp; {t.amazing} &nbsp;{winEmoji}
            </div>
            <div
              style={{
                fontFamily: TITLE_F, fontSize: 18, color: "#E6D4A8",
                marginBottom: 26,
                background: "rgba(0,0,0,0.3)", padding: "8px 28px",
                borderRadius: 10, boxShadow: "0 2px 0 rgba(0,0,0,0.4)",
              }}
            >
              ★ {finalScore}
            </div>

            <div style={{ display: "flex", gap: 22, marginTop: 4 }}>
              <CircBtn color="#8A867D" shadow="#5a5650" onClick={handleReplay} label={t.retry}><RetryIcon /></CircBtn>
              {level < MAX_LEVELS && (
                <CircBtn color={accentBg} shadow={accentBorder} onClick={handleContinue} label="NEXT"><NextIcon /></CircBtn>
              )}
              <CircBtn color="#3a3630" shadow="#1a1610" onClick={handleGoHome} label={t.home}><HomeIcon /></CircBtn>
            </div>
          </div>
        )}

        {/* Death overlay */}
        {isDead && !isComplete && (
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              zIndex: 20, gap: 10,
            }}
          >
            <div
              style={{
                fontFamily: TITLE_F, fontSize: 36,
                color: "#E6D4A8", textShadow: "0 4px 0 #6b2020",
                letterSpacing: 3, marginBottom: 6,
              }}
            >
              {t.youDied}
            </div>
            <div style={{ fontFamily: BODY_F, fontWeight: "700", fontSize: 13, color: "#C8C1B7", marginBottom: 2 }}>
              {t.completed(deathProgressRef.current)}
            </div>
            <div style={{ fontFamily: TITLE_F, fontSize: 14, color: accentBg, marginBottom: 22 }}>
              ◉ {deathScoreRef.current} {t.pebbles}
            </div>
            <div style={{ display: "flex", gap: 22, marginTop: 4 }}>
              <CircBtn color={accentBg} shadow={accentBorder} onClick={handleDeathRetry} label={t.retry}><RetryIcon /></CircBtn>
              <CircBtn color="#3a3630" shadow="#1a1610" onClick={handleGoHome} label={t.home}><HomeIcon /></CircBtn>
            </div>
          </div>
        )}

        {/* Hint text at bottom */}
        {!isDead && !isComplete && !isPaused && (
          <p
            style={{
              position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
              margin: 0, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", fontWeight: "600",
              color: isLevel3 ? "rgba(200,90,30,0.45)" : isLevel2 ? "rgba(148,168,116,0.45)" : "rgba(200,180,130,0.4)",
              fontFamily: BODY_F, pointerEvents: "none", whiteSpace: "nowrap",
              opacity: hintFaded ? 0 : 1, transition: "opacity 0.8s ease",
            }}
          >
            {t.hint}
          </p>
        )}

        <style>{`
          @keyframes loadingBar { from { width: 15%; } to { width: 85%; } }
          .vol-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.14); outline: none; cursor: pointer; }
          .vol-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #DD8A3C; box-shadow: 0 2px 6px rgba(0,0,0,0.5); cursor: pointer; }
        `}</style>

        {/* Loading overlay */}
        {!isLoaded && (
          <div
            style={{
              position: "absolute", inset: 0,
              background: pageBg,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              zIndex: 200, gap: 18,
            }}
          >
            <div style={{ fontFamily: TITLE_F, fontSize: 22, color: winTitleColor, letterSpacing: 3 }}>
              {t.loading}
            </div>
            <div style={{
              width: 160, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: "60%", background: accentBg, borderRadius: 4,
                animation: "loadingBar 1.2s ease-in-out infinite alternate",
              }} />
            </div>
            {/* loading bar styles now in shared style tag above */}
          </div>
        )}
      </div>
    </div>
  );
}
