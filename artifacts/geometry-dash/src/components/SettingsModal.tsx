import { useState } from "react";
import { soundManager } from "../game/sound";
import { useLang, setLang, T } from "../lib/lang";
import type { Lang } from "../lib/lang";

const TITLE_F = "'Lilita One', cursive";
const BODY_F = "'Nunito', sans-serif";

export function GearIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

interface GearButtonProps {
  mounted?: boolean;
  accentColor?: string;
  accentBorder?: string;
  onClick: () => void;
  position?: React.CSSProperties;
}

export function GearButton({
  mounted = true,
  accentColor = "rgba(148,168,116,0.80)",
  accentBorder = "rgba(148,168,116,0.4)",
  onClick,
  position,
}: GearButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 50,
        width: 44, height: 44, borderRadius: "50%",
        background: "rgba(14,20,12,0.88)",
        border: `1.5px solid ${accentBorder}`,
        color: accentColor,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 3px 12px rgba(0,0,0,0.45)",
        transition: "transform 0.18s ease, filter 0.15s, opacity 0.3s ease",
        opacity: mounted ? 1 : 0,
        ...position,
      }}
      onMouseEnter={e => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.transform = "rotate(45deg) scale(1.12)";
        b.style.filter = "brightness(1.3)";
      }}
      onMouseLeave={e => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.transform = "rotate(0deg) scale(1)";
        b.style.filter = "brightness(1)";
      }}
    >
      <GearIcon />
    </button>
  );
}

interface SettingsModalProps {
  onClose: () => void;
  accentColor?: string;
}

export function SettingsModal({ onClose, accentColor = "#94A874" }: SettingsModalProps) {
  const [lang] = useLang();
  const t = T[lang];
  const [musicVol, setMusicVolState] = useState(soundManager.musicVol);
  const [sfxVol, setSfxVolState] = useState(soundManager.sfxVol);

  const handleMusicVol = (v: number) => { setMusicVolState(v); soundManager.setMusicVol(v); };
  const handleSfxVol = (v: number) => { setSfxVolState(v); soundManager.setSfxVol(v); };
  const handleClose = () => { soundManager.playSfx("btn"); onClose(); };
  const handleLang = (l: Lang) => { soundManager.playSfx("btn"); setLang(l); };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.70)", backdropFilter: "blur(7px)",
      }}
    >
      <style>{`
        @keyframes settingsIn { from { opacity:0; transform:scale(0.91) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .gs-slider { -webkit-appearance:none; appearance:none; width:100%; height:5px; border-radius:3px; background:rgba(255,255,255,0.10); outline:none; cursor:pointer; }
        .gs-slider::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; border-radius:50%; background:${accentColor}; box-shadow:0 2px 8px rgba(0,0,0,0.55); cursor:pointer; transition:background 0.15s,transform 0.1s; }
        .gs-slider::-webkit-slider-thumb:hover { filter:brightness(1.2); transform:scale(1.18); }
        .gs-slider::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:${accentColor}; border:none; cursor:pointer; }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "rgba(8,14,8,0.98)",
          border: `1.5px solid ${accentColor}33`,
          borderRadius: 22,
          padding: "30px 34px 26px",
          width: "min(330px, 90vw)",
          boxShadow: "0 28px 80px rgba(0,0,0,0.80)",
          animation: "settingsIn 0.22s ease",
        }}
      >
        {/* Title */}
        <div style={{ fontFamily: TITLE_F, fontSize: 17, color: accentColor, letterSpacing: 3, textAlign: "center", marginBottom: 28 }}>
          {t.settings}
        </div>

        {/* Audio section label */}
        <div style={{ fontFamily: BODY_F, fontWeight: "800", fontSize: 9, color: `${accentColor}80`, letterSpacing: 4, textTransform: "uppercase", marginBottom: 18 }}>
          {t.audio}
        </div>

        {/* Music volume */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: BODY_F, fontWeight: "700", fontSize: 11, color: accentColor, letterSpacing: 2, textTransform: "uppercase" }}>{t.music}</span>
            <span style={{ fontFamily: TITLE_F, fontSize: 13, color: `${accentColor}bb`, minWidth: 36, textAlign: "right" }}>{Math.round(musicVol * 100)}%</span>
          </div>
          <input type="range" className="gs-slider" min={0} max={1} step={0.01} value={musicVol} onChange={e => handleMusicVol(parseFloat(e.target.value))} />
        </div>

        {/* SFX volume */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: BODY_F, fontWeight: "700", fontSize: 11, color: accentColor, letterSpacing: 2, textTransform: "uppercase" }}>{t.sfx}</span>
            <span style={{ fontFamily: TITLE_F, fontSize: 13, color: `${accentColor}bb`, minWidth: 36, textAlign: "right" }}>{Math.round(sfxVol * 100)}%</span>
          </div>
          <input type="range" className="gs-slider" min={0} max={1} step={0.01} value={sfxVol} onChange={e => handleSfxVol(parseFloat(e.target.value))} />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: `${accentColor}22`, marginBottom: 22 }} />

        {/* Language section label */}
        <div style={{ fontFamily: BODY_F, fontWeight: "800", fontSize: 9, color: `${accentColor}80`, letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>
          {t.language}
        </div>

        {/* Language picker */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {(["en", "vi"] as Lang[]).map(l => {
            const active = lang === l;
            const label = l === "en" ? "🇺🇸  English" : "🇻🇳  Tiếng Việt";
            return (
              <button
                key={l}
                onClick={() => handleLang(l)}
                style={{
                  flex: 1, padding: "9px 0",
                  background: active ? accentColor : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${active ? accentColor : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 10, cursor: "pointer",
                  fontFamily: BODY_F, fontWeight: "700", fontSize: 11,
                  color: active ? "#fff" : "rgba(255,255,255,0.45)",
                  letterSpacing: 0.5,
                  boxShadow: active ? `0 3px 0 ${accentColor}66` : "none",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: `${accentColor}22`, marginBottom: 22 }} />

        {/* Done button */}
        <button
          onClick={handleClose}
          style={{
            width: "100%", padding: "12px 0",
            background: accentColor, border: "none", borderRadius: 12,
            color: "#fff", fontFamily: TITLE_F, fontSize: 14,
            cursor: "pointer", letterSpacing: 2,
            boxShadow: `0 4px 0 ${accentColor}88`,
            transition: "filter 0.12s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.15)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)"; }}
        >
          {t.done}
        </button>
      </div>
    </div>
  );
}
