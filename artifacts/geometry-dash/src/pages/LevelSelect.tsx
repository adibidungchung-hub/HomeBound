import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getLevelProgress, getAvailablePebbles } from "../lib/progress";
import bgFullUrl from "@assets/bg_full_1784570017251.png";
import { soundManager } from "../game/sound";
import { useLang, T } from "../lib/lang";
import { GearButton, SettingsModal } from "../components/SettingsModal";

const TITLE = "'Lilita One', cursive";
const BODY = "'Nunito', sans-serif";
const ENDLESS_BEST_KEY_LS = "gd_endless_best_m";
function getEndlessBestLocal(): number {
  try { return parseInt(localStorage.getItem(ENDLESS_BEST_KEY_LS) || "0", 10) || 0; } catch { return 0; }
}

function BeachScene() {
  return (
    <svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
      <defs>
        <linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0800" />
          <stop offset="50%" stopColor="#8b3500" />
          <stop offset="100%" stopColor="#cc6010" />
        </linearGradient>
        <radialGradient id="bsun" cx="70%" cy="40%" r="15%">
          <stop offset="0%" stopColor="#ffcc44" stopOpacity="1" />
          <stop offset="100%" stopColor="#ff8800" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <rect width="320" height="150" fill="url(#bsky)" />
      <circle cx="224" cy="55" r="22" fill="#f4a030" opacity="0.95" />
      <circle cx="224" cy="55" r="32" fill="url(#bsun)" />
      <path d="M0,95 Q40,88 80,95 Q120,102 160,95 Q200,88 240,95 Q280,102 320,95 L320,150 L0,150 Z" fill="#2a5070" />
      <path d="M0,104 Q50,98 100,104 Q150,110 200,104 Q250,98 320,104 L320,150 L0,150 Z" fill="#2060808c" />
      <path d="M0,116 Q80,110 160,116 Q240,122 320,116 L320,150 L0,150 Z" fill="#C8A870" />
      <path d="M0,124 Q80,120 160,124 Q240,128 320,124 L320,150 L0,150 Z" fill="#b89858" />
      <rect x="46" y="72" width="5" height="44" rx="2" fill="#3a2010" />
      <ellipse cx="48" cy="70" rx="22" ry="9" fill="#2a5018" transform="rotate(-15 48 70)" />
      <ellipse cx="48" cy="70" rx="20" ry="8" fill="#3a6820" transform="rotate(20 48 70)" />
      <ellipse cx="48" cy="68" rx="18" ry="7" fill="#2a5018" transform="rotate(-35 48 68)" />
      <rect x="268" y="78" width="4" height="38" rx="2" fill="#3a2010" />
      <ellipse cx="270" cy="77" rx="18" ry="7" fill="#2a5018" transform="rotate(-20 270 77)" />
      <ellipse cx="270" cy="77" rx="16" ry="6" fill="#3a6820" transform="rotate(12 270 77)" />
      <polygon points="120,114 126,102 132,114" fill="#1a1008" opacity="0.6" />
      <polygon points="140,114 148,98 156,114" fill="#1a1008" opacity="0.6" />
      <rect x="165" y="104" width="18" height="10" rx="2" fill="#1a1008" opacity="0.5" />
    </svg>
  );
}

function ForestScene() {
  return (
    <svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
      <defs>
        <linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#060f08" />
          <stop offset="100%" stopColor="#142014" />
        </linearGradient>
      </defs>
      <rect width="320" height="150" fill="url(#fsky)" />
      <circle cx="260" cy="28" r="14" fill="#e8d890" opacity="0.85" />
      <circle cx="266" cy="23" r="12" fill="#142014" />
      <path d="M0,100 L50,55 L100,80 L150,40 L200,70 L250,50 L300,72 L320,58 L320,150 L0,150 Z" fill="#1a2e14" opacity="0.7" />
      <polygon points="10,120 30,72 50,120" fill="#1e3a12" />
      <polygon points="5,120 28,65 51,120" fill="#2a4e1a" />
      <polygon points="45,120 68,68 91,120" fill="#1e3a12" />
      <polygon points="42,120 66,62 90,120" fill="#2a4e1a" />
      <polygon points="135,120 160,60 185,120" fill="#1e3a12" />
      <polygon points="130,120 157,54 184,120" fill="#2a4e1a" />
      <polygon points="220,120 244,66 268,120" fill="#1e3a12" />
      <polygon points="265,120 290,58 315,120" fill="#2a4e1a" />
      <path d="M0,122 Q80,116 160,122 Q240,128 320,122 L320,150 L0,150 Z" fill="#1e3a14" />
      <path d="M0,132 Q80,128 160,132 Q240,136 320,132 L320,150 L0,150 Z" fill="#253e18" />
      <circle cx="95" cy="45" r="2" fill="#ffe080" opacity="0.7" />
      <circle cx="180" cy="30" r="1.5" fill="#ffe080" opacity="0.55" />
      <circle cx="230" cy="48" r="2" fill="#ffe080" opacity="0.6" />
      <circle cx="312" cy="38" r="1.5" fill="#ffe080" opacity="0.5" />
      <polygon points="100,120 107,106 114,120" fill="#0a1208" opacity="0.7" />
      <rect x="160" y="110" width="16" height="12" rx="2" fill="#0a1208" opacity="0.6" />

      {/* Pine tree silhouette row — blue tint, 30% opacity */}
      <g opacity="0.30">
        <polygon points="0,150 12,118 24,150" fill="#3a6ebb" />
        <polygon points="8,150 12,108 16,150" fill="#2a5aaa" />
        <polygon points="18,150 32,122 46,150" fill="#3a6ebb" />
        <polygon points="26,150 32,112 38,150" fill="#2a5aaa" />
        <polygon points="40,150 50,130 60,150" fill="#3a6ebb" />
        <polygon points="44,150 50,120 56,150" fill="#2a5aaa" />
        <polygon points="55,150 68,116 81,150" fill="#3a6ebb" />
        <polygon points="62,150 68,106 74,150" fill="#2a5aaa" />
        <polygon points="76,150 85,128 94,150" fill="#3a6ebb" />
        <polygon points="80,150 85,118 90,150" fill="#2a5aaa" />
        <polygon points="90,150 102,120 114,150" fill="#3a6ebb" />
        <polygon points="96,150 102,110 108,150" fill="#2a5aaa" />
        <polygon points="108,150 118,132 128,150" fill="#3a6ebb" />
        <polygon points="112,150 118,122 124,150" fill="#2a5aaa" />
        <polygon points="124,150 137,114 150,150" fill="#3a6ebb" />
        <polygon points="131,150 137,104 143,150" fill="#2a5aaa" />
        <polygon points="146,150 156,126 166,150" fill="#3a6ebb" />
        <polygon points="150,150 156,116 162,150" fill="#2a5aaa" />
        <polygon points="162,150 175,118 188,150" fill="#3a6ebb" />
        <polygon points="169,150 175,108 181,150" fill="#2a5aaa" />
        <polygon points="184,150 194,130 204,150" fill="#3a6ebb" />
        <polygon points="188,150 194,120 200,150" fill="#2a5aaa" />
        <polygon points="200,150 212,122 224,150" fill="#3a6ebb" />
        <polygon points="206,150 212,112 218,150" fill="#2a5aaa" />
        <polygon points="220,150 232,116 244,150" fill="#3a6ebb" />
        <polygon points="226,150 232,106 238,150" fill="#2a5aaa" />
        <polygon points="240,150 250,128 260,150" fill="#3a6ebb" />
        <polygon points="244,150 250,118 256,150" fill="#2a5aaa" />
        <polygon points="256,150 270,120 284,150" fill="#3a6ebb" />
        <polygon points="263,150 270,110 277,150" fill="#2a5aaa" />
        <polygon points="280,150 292,114 304,150" fill="#3a6ebb" />
        <polygon points="286,150 292,104 298,150" fill="#2a5aaa" />
        <polygon points="300,150 312,122 324,150" fill="#3a6ebb" />
        <polygon points="306,150 312,112 318,150" fill="#2a5aaa" />
      </g>
    </svg>
  );
}

function MountainScene() {
  return (
    <svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
      <defs>
        <linearGradient id="volcsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#05050f" />
          <stop offset="60%" stopColor="#0a0a1a" />
          <stop offset="100%" stopColor="#1a0808" />
        </linearGradient>
        <radialGradient id="lavaglow" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="#cc2200" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#cc2200" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="150" fill="url(#volcsky)" />
      <rect width="320" height="150" fill="url(#lavaglow)" />
      <circle cx="22" cy="16" r="1" fill="white" opacity="0.65" />
      <circle cx="58" cy="10" r="0.8" fill="white" opacity="0.5" />
      <circle cx="95" cy="22" r="1" fill="white" opacity="0.45" />
      <circle cx="148" cy="8" r="0.8" fill="white" opacity="0.6" />
      <circle cx="198" cy="16" r="1" fill="white" opacity="0.5" />
      <circle cx="252" cy="11" r="0.8" fill="white" opacity="0.45" />
      <circle cx="298" cy="20" r="1" fill="white" opacity="0.6" />
      <path d="M0,92 L28,55 L56,72 L88,36 L122,60 L158,40 L192,60 L224,44 L256,64 L280,48 L312,66 L320,58 L320,150 L0,150 Z" fill="#100606" />
      <path d="M0,118 L18,92 L46,105 L76,82 L108,100 L142,84 L172,102 L204,88 L238,108 L268,90 L300,110 L320,96 L320,150 L0,150 Z" fill="#180a0a" />
      <ellipse cx="68" cy="36" rx="30" ry="10" fill="rgba(70,35,75,0.4)" />
      <ellipse cx="90" cy="30" rx="22" ry="8" fill="rgba(80,40,85,0.35)" />
      <ellipse cx="228" cy="30" rx="28" ry="10" fill="rgba(70,35,75,0.35)" />
      <ellipse cx="252" cy="24" rx="20" ry="7" fill="rgba(80,40,85,0.3)" />
      <path d="M0,126 Q80,120 160,126 Q240,132 320,126 L320,150 L0,150 Z" fill="#1c0808" />
      <path d="M0,136 Q80,132 160,136 Q240,140 320,136 L320,150 L0,150 Z" fill="#240c0c" />
      <path d="M82,140 Q96,135 118,138 Q126,143 116,146 Q96,148 82,143 Z" fill="#cc3300" opacity="0.85" />
      <path d="M192,138 Q210,133 238,137 Q246,142 236,146 Q210,149 192,143 Z" fill="#cc2200" opacity="0.75" />
      <ellipse cx="152" cy="123" rx="16" ry="12" fill="#1a0c0c" opacity="0.95" />
      <ellipse cx="174" cy="126" rx="13" ry="10" fill="#221010" opacity="0.85" />
      <rect x="0" y="138" width="320" height="12" fill="rgba(180,30,0,0.12)" />
    </svg>
  );
}

const LEVELS = [
  { id: 1, name: "MAP 1", subtitle: "Beach & Sunset", accent: "#DD8A3C", accentDark: "#a05a1a", Scene: BeachScene },
  { id: 2, name: "MAP 2", subtitle: "Forest & Night", accent: "#6E8360", accentDark: "#3e5030", Scene: ForestScene },
  { id: 3, name: "MAP 3", subtitle: "Volcanic Sky", accent: "#C94A1E", accentDark: "#7a1a08", Scene: MountainScene },
];

export default function LevelSelect() {
  const [, navigate] = useLocation();
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [endlessBest] = useState(() => getEndlessBestLocal());
  const [lang] = useLang();
  const t = T[lang];

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    soundManager.loadSfx("btn", "/sfx-btn.mp3", 4, 1.3);
    soundManager.loadMusic("/music-home.mp3");
    soundManager.playMusic();
    return () => cancelAnimationFrame(id);
  }, []);

  const handleBack = () => {
    soundManager.playSfx("btn");
    setLeaving(true);
    setTimeout(() => navigate("/"), 380);
  };

  const handleLevelSelect = (lvId: number, idx: number) => {
    soundManager.playSfx("btn");
    const urls = ["/music-level1.mp3", "/music-level2.mp3", "/music-level3.mp3"];
    soundManager.fadeMusic(350);
    setTimeout(() => {
      soundManager.loadMusic(urls[idx]);
      soundManager.playMusic();
      navigate(`/game/${lvId}`);
    }, 300);
  };

  const handleEndlessSelect = () => {
    soundManager.playSfx("btn");
    soundManager.fadeMusic(350);
    setTimeout(() => {
      setLeaving(true);
      setTimeout(() => navigate("/endless"), 50);
    }, 300);
  };

  const totalPebbles = getAvailablePebbles();

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ position: "relative" }}
    >
      <style>{`
        @keyframes cardFlyIn {
          from { transform: translateY(40px) scale(0.92); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes cardFlyOut {
          from { transform: translateY(0) scale(1); opacity: 1; }
          to   { transform: translateY(-35px) scale(0.9); opacity: 0; }
        }
        @keyframes titleFlyIn {
          from { transform: translateY(-24px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes titleFlyOut {
          from { transform: translateY(0); opacity: 1; }
          to   { transform: translateY(-20px); opacity: 0; }
        }
      `}</style>

      {/* Background image — top-aligned on level select */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `url(${bgFullUrl})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: leaving ? "center 100%" : "center 0%",
          transition: "background-position 0.42s cubic-bezier(0.4,0,0.2,1)",
        }}
      />

      {/* Dark overlay */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "rgba(6,8,16,0.60)" }} />

      {/* Back button — filled circle top-left */}
      <button
        onClick={handleBack}
        style={{
          position: "fixed", top: 20, left: 20, zIndex: 50,
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(28,18,8,0.90)",
          border: "1.5px solid rgba(148,168,116,0.5)",
          boxShadow: "0 3px 0 rgba(0,0,0,0.5)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.13s ease, filter 0.13s ease",
          opacity: mounted && !leaving ? 1 : 0,
        }}
        onMouseEnter={e => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.filter = "brightness(1.3)";
          b.style.transform = "translateY(-2px) scale(1.1)";
        }}
        onMouseLeave={e => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.filter = "brightness(1)";
          b.style.transform = "";
        }}
        onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(2px) scale(0.94)"; }}
        onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(148,168,116,0.95)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5"/>
          <path d="m12 5-7 7 7 7"/>
        </svg>
      </button>

      {/* Total pebbles counter — top right (clickable → skin shop) */}
      <button
        onClick={() => { soundManager.playSfx("btn"); setLeaving(true); setTimeout(() => navigate("/skins"), 350); }}
        style={{
          position: "fixed", top: 20, right: 20, zIndex: 50,
          background: "rgba(28,18,8,0.88)",
          border: "1.5px solid rgba(221,138,60,0.45)",
          borderRadius: 22,
          padding: "8px 16px",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 3px 0 rgba(0,0,0,0.45)",
          opacity: mounted && !leaving ? 1 : 0,
          transition: "opacity 0.35s ease, filter 0.15s, transform 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.18)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = ""; (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
      >
        <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="12" fill="#DD8A3C" opacity="0.9"/>
          <circle cx="10" cy="10" r="4" fill="rgba(255,230,150,0.55)"/>
        </svg>
        <span style={{ fontFamily: TITLE, fontSize: 15, color: "#E6D4A8", letterSpacing: 1 }}>
          {totalPebbles}
        </span>
        <span style={{ fontFamily: BODY, fontWeight: "600", fontSize: 9, color: "rgba(230,212,168,0.5)", letterSpacing: 2, textTransform: "uppercase" }}>
          {t.pebbles}
        </span>
      </button>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", padding: "0 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            fontFamily: TITLE, fontSize: 30, color: "#E6D4A8",
            textShadow: "0 3px 0 rgba(0,0,0,0.5)", letterSpacing: 2,
            marginBottom: 4, textAlign: "center",
            animation: leaving
              ? "titleFlyOut 0.32s ease forwards"
              : mounted ? "titleFlyIn 0.4s ease backwards" : "none",
          }}
        >
          {t.selectLevel}
        </div>
        <div
          style={{
            fontFamily: BODY, fontWeight: "600", fontSize: 10,
            color: "#94A874", letterSpacing: 5, textTransform: "uppercase",
            marginBottom: 40,
            animation: leaving
              ? "titleFlyOut 0.32s ease forwards"
              : mounted ? "titleFlyIn 0.4s 0.05s ease backwards" : "none",
          }}
        >
          {t.chooseMap}
        </div>

        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
          {LEVELS.map((lv, idx) => {
            const prog = getLevelProgress(lv.id);
            const unlocked = idx === 0 || getLevelProgress(LEVELS[idx - 1].id).completed;
            return (
              <div
                key={lv.id}
                onClick={() => { if (unlocked) handleLevelSelect(lv.id, idx); }}
                style={{
                  width: 280,
                  borderRadius: 16,
                  overflow: "hidden",
                  cursor: unlocked ? "pointer" : "not-allowed",
                  boxShadow: unlocked
                    ? `0 8px 0 rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.4)`
                    : "0 6px 0 rgba(0,0,0,0.4)",
                  border: `2px solid ${unlocked ? lv.accent + "55" : "rgba(80,80,60,0.2)"}`,
                  filter: unlocked ? "none" : "grayscale(0.7) brightness(0.6)",
                  background: "#1a1a14",
                  animation: leaving
                    ? `cardFlyOut 0.32s ${idx * 0.06}s ease forwards`
                    : mounted ? `cardFlyIn 0.42s ${idx * 0.1 + 0.05}s ease backwards` : "none",
                }}
                onMouseEnter={e => { if (unlocked) (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
              >
                {/* Scene preview */}
                <div style={{ position: "relative" }}>
                  <lv.Scene />
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
                    padding: "16px 16px 8px",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                  }}>
                    <div>
                      <div style={{ fontFamily: TITLE, fontSize: 20, color: lv.accent, textShadow: `0 2px 0 ${lv.accentDark}`, letterSpacing: 1 }}>
                        {lv.name}
                      </div>
                      <div style={{ fontFamily: BODY, fontWeight: "600", fontSize: 9, color: "rgba(230,212,168,0.55)", letterSpacing: 2, textTransform: "uppercase" }}>
                        {lv.subtitle}
                      </div>
                    </div>
                  </div>
                  {!unlocked && (
                    <div style={{
                      position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                    }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C8C1B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <span style={{ fontFamily: BODY, fontWeight: "700", fontSize: 10, color: "#C8C1B7", letterSpacing: 2 }}>
                        {t.completeMap(idx)}
                      </span>
                    </div>
                  )}
                </div>

                {unlocked && (
                  <div style={{
                    padding: "12px 16px",
                    background: "#111108",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div>
                      <div style={{ fontFamily: BODY, fontWeight: "700", fontSize: 10, color: "rgba(230,212,168,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>
                        {t.best}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 80, height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${prog.best}%`,
                            background: prog.completed ? "#94A874" : lv.accent,
                            borderRadius: 3, transition: "width 0.5s ease",
                          }} />
                        </div>
                        <span style={{ fontFamily: BODY, fontWeight: "700", fontSize: 10, color: prog.completed ? "#94A874" : lv.accent }}>
                          {prog.completed ? "✓" : prog.best > 0 ? `${prog.best}%` : "—"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleLevelSelect(lv.id, idx); }}
                      style={{
                        padding: "9px 22px",
                        background: lv.accent,
                        border: "none",
                        borderRadius: 10,
                        fontFamily: TITLE,
                        fontSize: 14,
                        color: "#fff",
                        cursor: "pointer",
                        letterSpacing: 1,
                        boxShadow: `0 3px 0 ${lv.accentDark}`,
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      }}
                      onMouseDown={e => {
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.transform = "translateY(2px)";
                        b.style.boxShadow = `0 1px 0 ${lv.accentDark}`;
                      }}
                      onMouseUp={e => {
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.transform = "translateY(0)";
                        b.style.boxShadow = `0 3px 0 ${lv.accentDark}`;
                      }}
                    >
                      {prog.completed ? t.playAgainBtn : prog.best > 0 ? t.continueBtn : t.playBtn}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Endless mode — always visible, locked until all 3 maps complete */}
        {(() => {
          const allDone = LEVELS.every(lv => getLevelProgress(lv.id).completed);
          return (
            <div
              style={{
                marginTop: 20, width: "100%",
                display: "flex", justifyContent: "center",
                animation: leaving ? "titleFlyOut 0.32s ease forwards" : mounted ? "titleFlyIn 0.45s 0.35s ease backwards" : "none",
              }}
            >
              <button
                onClick={allDone ? handleEndlessSelect : undefined}
                style={{
                  width: "50%", maxWidth: 400, padding: "10px 20px",
                  background: allDone
                    ? "linear-gradient(135deg, rgba(70,45,130,0.92) 0%, rgba(40,25,90,0.92) 100%)"
                    : "rgba(40,40,50,0.85)",
                  border: allDone ? "1.5px solid rgba(170,110,255,0.45)" : "1.5px solid rgba(100,100,120,0.3)",
                  borderRadius: 14, cursor: allDone ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  boxShadow: "0 4px 0 rgba(0,0,0,0.5)",
                  transition: "filter 0.15s, transform 0.15s",
                  opacity: allDone ? 1 : 0.6,
                }}
                onMouseEnter={e => { if (allDone) { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.18)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = ""; (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
                onMouseDown={e => { if (allDone) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(1px)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
              >
                <span style={{ fontFamily: TITLE, fontSize: 18, color: allDone ? "#C8A0FF" : "#888", letterSpacing: 1, lineHeight: 1 }}>∞</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                  <span style={{ fontFamily: TITLE, fontSize: 13, color: allDone ? "#C8A0FF" : "#888", letterSpacing: 2 }}>{t.endlessMode}</span>
                  {allDone ? (
                    endlessBest > 0 && (
                      <span style={{ fontFamily: BODY, fontWeight: "700", fontSize: 9, color: "rgba(200,170,255,0.75)", letterSpacing: 1 }}>
                        ⬡ Best: {endlessBest.toLocaleString()} m
                      </span>
                    )
                  ) : (
                    <span style={{ fontFamily: BODY, fontWeight: "700", fontSize: 9, color: "rgba(160,160,180,0.75)", letterSpacing: 1 }}>
                      🔒 Complete all 3 maps to unlock
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })()}
      </div>

      {/* Settings gear button — bottom right */}
      <GearButton
        mounted={mounted && !leaving}
        onClick={() => { soundManager.playSfx("btn"); setSettingsOpen(true); }}
      />

      {/* Settings modal */}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} accentColor="#94A874" />}
    </div>
  );
}
