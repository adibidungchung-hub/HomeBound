import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import bgFullUrl from "@assets/bg_full_1784570017251.png";
import { soundManager } from "../game/sound";
import { useLang, T } from "../lib/lang";
import { GearButton, SettingsModal } from "../components/SettingsModal";

const TITLE = "'Lilita One', cursive";
const BODY = "'Nunito', sans-serif";

export default function Home() {
  const [, navigate] = useLocation();
  const [transitioning, setTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lang] = useLang();
  const t = T[lang];

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    soundManager.loadSfx("btn", "/sfx-btn.mp3", 4, 1.3);
    soundManager.loadMusic("/music-home.mp3");
    soundManager.playMusic();
    return () => cancelAnimationFrame(id);
  }, []);

  const handlePlay = () => {
    soundManager.playSfx("btn");
    setTransitioning(true);
    soundManager.stopMusic();
    setTimeout(() => navigate("/levels"), 420);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ position: "relative", background: "#0a0f1a" }}
    >
      <style>{`
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.035); }
        }
        @keyframes btnSweep {
          0%   { left: -60%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { left: 160%; opacity: 0; }
        }
      `}</style>

      {/* Background image */}
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: `url(${bgFullUrl})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: transitioning ? "center 0%" : "center 100%",
          transition: "background-position 0.6s cubic-bezier(0.4,0,0.2,1)",
        }}
      />

      {/* Dark vignette overlay */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "rgba(6,8,16,0.52)" }} />

      {/* Main content */}
      <div
        style={{
          position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px",
          opacity: mounted && !transitioning ? 1 : 0,
          transform: transitioning ? "translateY(-14px) scale(0.97)" : "translateY(0) scale(1)",
          transition: mounted ? "opacity 0.32s ease, transform 0.32s ease" : "none",
          display: "flex", flexDirection: "column", alignItems: "center",
          marginTop: "-120px",
        }}
      >
        {/* Logo */}
        <img
          src="/homebound-logo.png"
          alt="Homebound"
          style={{
            width: "min(1456px, 90vw)",
            maxHeight: "min(80vh, 640px)",
            objectFit: "contain",
            imageRendering: "auto",
            filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.65))",
            animation: "logoPulse 2.8s ease-in-out infinite",
            display: "block",
            marginBottom: 8,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontFamily: BODY, fontWeight: "600", fontSize: 12,
            color: "#94A874", letterSpacing: 4, textTransform: "uppercase", marginBottom: 20,
          }}
        >
          {t.tagline}
        </div>

        {/* Play button */}
        <button
          onClick={handlePlay}
          style={{
            padding: "15px 70px",
            background: "#6E8360", border: "none", borderRadius: 14,
            color: "#fff", fontFamily: TITLE, fontSize: 22,
            cursor: "pointer", letterSpacing: 2,
            boxShadow: "0 5px 0 #3e5030", textShadow: "0 1px 3px rgba(0,0,0,0.35)",
            transition: "transform 0.1s, box-shadow 0.1s, background 0.15s",
            position: "relative", overflow: "hidden",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#7a9470"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#6E8360"; }}
          onMouseDown={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.transform = "translateY(3px)";
            b.style.boxShadow = "0 2px 0 #3e5030";
          }}
          onMouseUp={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.transform = "translateY(0)";
            b.style.boxShadow = "0 5px 0 #3e5030";
          }}
        >
          {t.play}
          <span
            style={{
              position: "absolute", top: 0, bottom: 0, width: "40%",
              background: "linear-gradient(to right, transparent, rgba(255,255,255,0.38), transparent)",
              transform: "skewX(-18deg)",
              animation: "btnSweep 3.8s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
        </button>
      </div>

      {/* Settings button — bottom right */}
      <GearButton
        mounted={mounted && !transitioning}
        onClick={() => { soundManager.playSfx("btn"); setSettingsOpen(true); }}
      />

      {/* Settings modal */}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} accentColor="#94A874" />}
    </div>
  );
}
