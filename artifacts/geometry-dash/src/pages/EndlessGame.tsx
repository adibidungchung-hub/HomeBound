import { useEffect, useRef, useCallback, useState } from "react";
import { useLocation } from "wouter";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../game/constants";
import { createInitialState, jump, update } from "../game/engine";
import { render } from "../game/renderer";
import type { GameState } from "../game/types";
import type { BackgroundImages } from "../game/renderer";
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

const TITLE_F = "'Lilita One', cursive";
const BODY_F = "'Nunito', sans-serif";
const ENDLESS_BEST_KEY = "gd_endless_best_m";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });
}

function removeWhiteBg(img: HTMLImageElement): CanvasImageSource {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width || 1;
  c.height = img.naturalHeight || img.height || 1;
  const cx = c.getContext("2d")!;
  cx.drawImage(img, 0, 0);
  const d = cx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) {
    if (d.data[i] > 230 && d.data[i + 1] > 230 && d.data[i + 2] > 230) d.data[i + 3] = 0;
  }
  cx.putImageData(d, 0, 0);
  return c;
}

function removeBlackBg(img: HTMLImageElement): CanvasImageSource {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width || 1;
  c.height = img.naturalHeight || img.height || 1;
  const cx = c.getContext("2d")!;
  cx.drawImage(img, 0, 0);
  const d = cx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) {
    if (d.data[i] < 30 && d.data[i + 1] < 30 && d.data[i + 2] < 30) d.data[i + 3] = 0;
  }
  cx.putImageData(d, 0, 0);
  return c;
}

function processPalmTree(img: HTMLImageElement): CanvasImageSource {
  return removeWhiteBg(img);
}

function getEndlessBest(): number {
  try { return parseInt(localStorage.getItem(ENDLESS_BEST_KEY) || "0", 10) || 0; } catch { return 0; }
}
function saveEndlessBest(dist: number): void {
  try {
    const cur = getEndlessBest();
    if (dist > cur) localStorage.setItem(ENDLESS_BEST_KEY, String(dist));
  } catch {}
}

function PlayIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polygon points="3,1 13,7 3,13" fill="currentColor"/></svg>;
}
function RetryIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>;
}
function HomeIcon() {
  return <svg width="16" height="16" viewBox="0 0 18 16" fill="none"><path d="M9 1L1 8h2.5v6h4v-4h3v4h4V8H17L9 1z" fill="currentColor"/></svg>;
}

function CircBtn({ color, shadow, onClick, label, children }: {
  color: string; shadow: string; onClick: () => void; label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <button
        ref={ref}
        onClick={() => { soundManager.playSfx("btn"); onClick(); }}
        onMouseDown={() => { if (ref.current) { ref.current.style.transform = "translateY(3px) scale(0.94)"; ref.current.style.boxShadow = `0 1px 0 ${shadow}`; } }}
        onMouseUp={() => { if (ref.current) { ref.current.style.transform = ""; ref.current.style.boxShadow = `0 4px 0 ${shadow}`; } }}
        style={{
          width: 56, height: 56, borderRadius: "50%",
          background: color, border: "none",
          color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 0 ${shadow}`, transition: "transform 0.1s, box-shadow 0.1s",
        }}
      >{children}</button>
      <span style={{ fontFamily: BODY_F, fontWeight: "700", fontSize: 9, color: "rgba(230,212,168,0.55)", letterSpacing: 2, textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

export default function EndlessGame() {
  const [, navigate] = useLocation();
  const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const _initState = createInitialState(1);
  _initState.isEndless = true;
  const stateRef = useRef<GameState>(_initState);
  const animRef = useRef<number>(0);
  const jumpPressedRef = useRef(false);
  const isPausedRef = useRef(false);
  const isStartedRef = useRef(false);
  const prevScoreRef = useRef(0);
  const prevDistRef = useRef(0);
  const wasDeadRef = useRef(false);
  const landedMeteorsRef = useRef<Set<number>>(new Set());
  const displayLevelRef = useRef(1);
  const prevDisplayLevelRef = useRef(1);
  const bgFadeToLevelRef = useRef(0);
  const bgFadeStartRef = useRef(0);

  const [isPaused, setIsPaused] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [bestDistance, setBestDistance] = useState(getEndlessBest);
  const [hintFaded, setHintFaded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lang] = useLang();
  const t = T[lang];

  const skinColorRef = useRef(getEquippedSkin().color);

  const imagesRef = useRef<BackgroundImages>({
    sky: null, sun: null, sea: null, seaFrames: [],
    trees: null, trees1: null, cloud: null, floor: null,
    player: null, shell1: null, shell2: null, palmTree: null,
    collectibleImg: null, mushroom: null,
    sky2: null, floor2: null, tree2: null, cloud2: null,
    rockLow: null, rockTall: null, meteorImg: null, craterImg: null, bgVolcanic: null,
    bg3Sky: null, bg3Mountains: null, bg3Hills: null, bg3Clouds: null,
  });

  useEffect(() => {
    const t = setTimeout(() => setHintFaded(true), 3000);
    return () => clearTimeout(t);
  }, []);

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
      ...seaFrameUrls.map(loadImage),
    ]).then(([sky, sun, sea, trees, trees1, cloud, floor, playerRaw, shell1Raw, shell2Raw, palmTreeRaw, collectibleRaw, sky2, floor2, tree2Raw, cloud2Raw, mushroomRaw, rockLowRaw, rockTallRaw, meteorRaw, bgVolcanicRaw, craterRaw, bg3SkyRaw, bg3MountainsRaw, bg3HillsRaw, bg3CloudsRaw, ...seaFrames]) => {
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
      };
      soundManager.loadSfx("jump", "/sfx-jump.mp3");
      soundManager.loadSfx("collect", "/sfx-collect.mp3", 4, 1.5);
      soundManager.loadSfx("btn", "/sfx-btn.mp3", 4, 1.3);
      setIsLoaded(true);
      soundManager.playMusic();
    });
  }, []);

  const togglePause = useCallback(() => {
    if (!isStartedRef.current) return;
    const paused = !isPausedRef.current;
    isPausedRef.current = paused;
    stateRef.current.isPaused = paused;
    setIsPaused(paused);
    soundManager.playSfx("btn");
  }, []);

  const handleJump = useCallback(() => {
    const state = stateRef.current;
    if (state.isDead || isPausedRef.current) return;
    soundManager.playSfx("jump");
    if (!state.isStarted) {
      state.isStarted = true;
      isStartedRef.current = true;
      setIsStarted(true);
      isPausedRef.current = false;
      setIsPaused(false);
      jump(state);
    } else {
      jump(state);
    }
  }, []);

  useEffect(() => {
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
      update(stateRef.current);
      const s = stateRef.current;
      const newDisplayLevel = (Math.floor(s.worldOffset / 3500) % 3) + 1;
      if (newDisplayLevel !== prevDisplayLevelRef.current && s.isStarted) {
        prevDisplayLevelRef.current = newDisplayLevel;
        bgFadeToLevelRef.current = newDisplayLevel;
        bgFadeStartRef.current = performance.now();
      }

      // Canvas-level bg crossfade — keeps gameplay fully opaque
      const BG_FADE_MS = 700;
      let bgFadeAlpha = 0;
      let bgFadeToLevel: number | undefined;
      if (bgFadeToLevelRef.current) {
        const elapsed = performance.now() - bgFadeStartRef.current;
        bgFadeAlpha = Math.min(elapsed / BG_FADE_MS, 1);
        bgFadeToLevel = bgFadeToLevelRef.current;
        if (bgFadeAlpha >= 1) {
          displayLevelRef.current = bgFadeToLevelRef.current;
          bgFadeToLevelRef.current = 0;
          bgFadeAlpha = 0;
          bgFadeToLevel = undefined;
        }
      }
      render(ctx, s, imagesRef.current, 1, skinColorRef.current, displayLevelRef.current, bgFadeToLevel, bgFadeAlpha || undefined);
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
        setScore(s.score);
      }
      const dist = Math.floor(s.worldOffset / 50);
      if (dist !== prevDistRef.current) {
        prevDistRef.current = dist;
        setDistance(dist);
      }
      if (s.isStarted && !isStartedRef.current) {
        isStartedRef.current = true;
        setIsStarted(true);
      }
      if (s.isDead && !wasDeadRef.current) {
        soundManager.playSynthDeath();
        soundManager.fadeMusic(1400);
        const finalDist = Math.floor(s.worldOffset / 50);
        setScore(s.score);
        setDistance(finalDist);
        saveEndlessBest(finalDist);
        setBestDistance(getEndlessBest());
        setIsDead(true);
      }
      wasDeadRef.current = s.isDead;
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    return () => { soundManager.stopMusic(); };
  }, []);

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
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  }, [handleJump, togglePause]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => { e.preventDefault(); handleJump(); }, [handleJump]);

  const handleRetry = useCallback(() => {
    const s = createInitialState(1);
    s.isEndless = true;
    stateRef.current = s;
    isPausedRef.current = false;
    isStartedRef.current = false;
    wasDeadRef.current = false;
    prevScoreRef.current = 0;
    prevDistRef.current = 0;
    setIsDead(false);
    setIsPaused(false);
    setIsStarted(false);
    setScore(0);
    setDistance(0);
    soundManager.restartMusic();
  }, []);

  const handleResume = useCallback(() => {
    isPausedRef.current = false;
    stateRef.current.isPaused = false;
    setIsPaused(false);
  }, []);

  const handleGoHome = useCallback(() => {
    soundManager.stopMusic();
    navigate("/levels");
  }, [navigate]);

  return (
    <div
      className="select-none"
      style={{ position: "fixed", inset: 0, background: "#0d0d18", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <style>{`
        @keyframes loadingBar { from { width: 15%; } to { width: 85%; } }
        .ev-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.12); outline: none; cursor: pointer; }
        .ev-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #DD8A3C; box-shadow: 0 2px 6px rgba(0,0,0,0.5); cursor: pointer; }
      `}</style>

      <div style={{ position: "relative", width: "min(100vw, calc(100vh * 16 / 9))", height: "min(100vh, calc(100vw * 9 / 16))", flexShrink: 0 }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", outline: "none", cursor: "pointer" }}
          onPointerDown={handlePointerDown}
          tabIndex={0}
        />


        {/* Distance score bar at top — replaces progress bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 32,
          background: "rgba(0,0,0,0.62)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 14px", pointerEvents: "none", zIndex: 5,
        }}>
          <span style={{ fontFamily: BODY_F, fontWeight: "800", fontSize: 9, color: "rgba(180,120,255,0.75)", letterSpacing: 3, textTransform: "uppercase" }}>
            ∞ ENDLESS
          </span>
          <span style={{ fontFamily: TITLE_F, fontSize: 14, color: "rgba(221,138,60,0.92)", letterSpacing: 1 }}>
            ⬡ {distance.toLocaleString()} m
          </span>
          {bestDistance > 0 ? (
            <span style={{ fontFamily: BODY_F, fontWeight: "700", fontSize: 9, color: "rgba(200,180,130,0.42)", letterSpacing: 2, textTransform: "uppercase" }}>
              BEST {bestDistance.toLocaleString()}
            </span>
          ) : (
            <span style={{ width: 60 }} />
          )}
        </div>

        {/* Pause / home button — top right */}
        {!isPaused && !isDead && (
          isStarted
            ? <button
                onClick={(e) => { e.stopPropagation(); soundManager.playSfx("btn"); togglePause(); }}
                style={{
                  position: "absolute", top: 40, right: 12,
                  width: 57, height: 57, borderRadius: "50%",
                  background: "rgba(28,18,8,0.82)", border: "1.5px solid rgba(221,138,60,0.4)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 5, zIndex: 10, boxShadow: "0 3px 0 #8a3a08",
                }}
              >
                <span style={{ width: 4, height: 18, background: "rgba(255,200,100,0.9)", borderRadius: 2, display: "block" }} />
                <span style={{ width: 4, height: 18, background: "rgba(255,200,100,0.9)", borderRadius: 2, display: "block" }} />
              </button>
            : <button
                onClick={(e) => { e.stopPropagation(); soundManager.playSfx("btn"); navigate("/levels"); }}
                style={{
                  position: "absolute", top: 40, right: 12,
                  width: 57, height: 57, borderRadius: "50%",
                  background: "rgba(28,18,8,0.82)", border: "1.5px solid rgba(221,138,60,0.4)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 10, boxShadow: "0 3px 0 #8a3a08",
                }}
              >
                <svg width="27" height="24" viewBox="0 0 18 16" fill="none">
                  <path d="M9 1L1 8h2.5v6h4v-4h3v4h4V8H17L9 1z" fill="rgba(255,200,100,0.9)" />
                </svg>
              </button>
        )}

        {/* Pause overlay */}
        {isPaused && !isDead && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 25, gap: 12 }}>
            <div style={{ fontFamily: TITLE_F, fontSize: 28, color: "#E6D4A8", textShadow: "0 3px 0 #8a6a20", letterSpacing: 3, marginBottom: 16 }}>
              {t.paused}
            </div>
            <div style={{ display: "flex", gap: 22, marginTop: 4 }}>
              <CircBtn color="#DD8A3C" shadow="#8a4a10" onClick={handleResume} label={t.resume}><PlayIcon /></CircBtn>
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
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} accentColor="#DD8A3C" />}

        {/* Death overlay */}
        {isDead && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, gap: 8 }}>
            <div style={{ fontFamily: TITLE_F, fontSize: 36, color: "#E6D4A8", textShadow: "0 4px 0 #6b2020", letterSpacing: 3, marginBottom: 4 }}>
              {t.youDied}
            </div>
            <div style={{ fontFamily: TITLE_F, fontSize: 22, color: "#DD8A3C", marginBottom: 2 }}>
              ⬡ {distance.toLocaleString()} m
            </div>
            <div style={{ fontFamily: BODY_F, fontWeight: "600", fontSize: 10, color: "rgba(200,180,130,0.55)", letterSpacing: 2, marginBottom: 2 }}>
              ◉ {score} {t.pebbles}
            </div>
            {distance >= bestDistance && distance > 0 && (
              <div style={{ fontFamily: BODY_F, fontWeight: "700", fontSize: 11, color: "#94A874", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
                {t.newBest}
              </div>
            )}
            {distance < bestDistance && (
              <div style={{ fontFamily: BODY_F, fontWeight: "700", fontSize: 10, color: "rgba(200,180,130,0.45)", letterSpacing: 2, marginBottom: 8 }}>
                {t.best} ⬡ {bestDistance.toLocaleString()} m
              </div>
            )}
            <div style={{ display: "flex", gap: 22, marginTop: 12 }}>
              <CircBtn color="#DD8A3C" shadow="#8a4a10" onClick={handleRetry} label={t.retry}><RetryIcon /></CircBtn>
              <CircBtn color="#3a3630" shadow="#1a1610" onClick={handleGoHome} label={t.home}><HomeIcon /></CircBtn>
            </div>
          </div>
        )}

        {/* Hint */}
        {!isDead && !isPaused && (
          <p style={{
            position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
            margin: 0, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", fontWeight: "600",
            color: "rgba(200,180,130,0.4)", fontFamily: BODY_F, pointerEvents: "none", whiteSpace: "nowrap",
            opacity: hintFaded ? 0 : 1, transition: "opacity 0.8s ease",
          }}>
            {t.hint}
          </p>
        )}

        {/* Loading overlay */}
        {!isLoaded && (
          <div style={{ position: "absolute", inset: 0, background: "#0d0d18", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 200, gap: 18 }}>
            <div style={{ fontFamily: TITLE_F, fontSize: 22, color: "#E6D4A8", letterSpacing: 3 }}>{t.loading}</div>
            <div style={{ width: 160, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "60%", background: "#DD8A3C", borderRadius: 4, animation: "loadingBar 1.2s ease-in-out infinite alternate" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
