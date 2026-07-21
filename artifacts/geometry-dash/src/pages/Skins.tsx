import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getAvailablePebbles, spendPebbles } from "../lib/progress";
import { SKINS, getSkinSave, saveSkinSave } from "../lib/skins";
import { soundManager } from "../game/sound";

const TITLE = "'Lilita One', cursive";
const BODY = "'Nunito', sans-serif";

function SkinPreview({ image, size = 52 }: { image: string; size?: number }) {
  return (
    <img
      src={image}
      alt="skin preview"
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}

export default function Skins() {
  const [, navigate] = useLocation();
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [skinData, setSkinData] = useState(getSkinSave);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    soundManager.loadSfx("btn", "/sfx-btn.mp3", 4, 1.3);
    const id = requestAnimationFrame(() => setMounted(true));
    setBalance(getAvailablePebbles());
    return () => cancelAnimationFrame(id);
  }, []);

  const handleBack = () => {
    soundManager.playSfx("btn");
    setLeaving(true);
    setTimeout(() => navigate("/levels"), 350);
  };

  const handleBuy = (skin: (typeof SKINS)[0]) => {
    if (balance < skin.price) return;
    soundManager.playSfx("btn");
    spendPebbles(skin.price);
    const newData = { equipped: skin.id, owned: [...skinData.owned, skin.id] };
    setSkinData(newData);
    saveSkinSave(newData);
    setBalance(prev => prev - skin.price);
  };

  const handleEquip = (skin: (typeof SKINS)[0]) => {
    soundManager.playSfx("btn");
    const newData = { ...skinData, equipped: skin.id };
    setSkinData(newData);
    saveSkinSave(newData);
  };

  const owned = new Set(skinData.owned);

  return (
    <div
      className="min-h-screen w-full select-none"
      style={{ background: "#0a0f1a", position: "relative", overflowY: "auto" }}
    >
      <style>{`
        @keyframes skinCardIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .sk-btn {
          border: none; border-radius: 10px; padding: 8px 0; width: 100%;
          font-family: 'Lilita One', cursive; font-size: 12px; letter-spacing: 1.5px;
          cursor: pointer; transition: filter 0.12s, transform 0.1s; text-align: center;
        }
        .sk-btn:hover  { filter: brightness(1.18); transform: translateY(-1px); }
        .sk-btn:active { transform: translateY(1px); }
        .sk-btn:disabled { cursor: not-allowed; opacity: 0.45; transform: none !important; filter: none !important; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 15%, rgba(50,35,100,0.55) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div
        style={{
          position: "relative", zIndex: 1,
          maxWidth: 700, margin: "0 auto",
          padding: "24px 20px 48px",
          opacity: mounted && !leaving ? 1 : 0,
          transform: leaving ? "translateY(-10px) scale(0.98)" : "translateY(0)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        {/* Back */}
        <button
          onClick={handleBack}
          style={{
            background: "rgba(28,18,8,0.82)", border: "1.5px solid rgba(148,168,116,0.35)",
            borderRadius: 22, padding: "8px 18px",
            display: "flex", alignItems: "center", gap: 8,
            cursor: "pointer", marginBottom: 28,
            boxShadow: "0 3px 0 rgba(0,0,0,0.4)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(148,168,116,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="m12 5-7 7 7 7"/>
          </svg>
          <span style={{ fontFamily: BODY, fontWeight: "700", fontSize: 11, color: "rgba(148,168,116,0.9)", letterSpacing: 2, textTransform: "uppercase" }}>
            Back
          </span>
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: TITLE, fontSize: 28, color: "#E6D4A8", textShadow: "0 3px 0 rgba(0,0,0,0.55)", letterSpacing: 3, marginBottom: 6 }}>
            SKIN SHOP
          </div>
          <div style={{ fontFamily: BODY, fontWeight: "600", fontSize: 10, color: "#94A874", letterSpacing: 4, textTransform: "uppercase", marginBottom: 18 }}>
            Spend your pebbles
          </div>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(28,18,8,0.9)", border: "1.5px solid rgba(221,138,60,0.5)",
              borderRadius: 22, padding: "9px 20px",
              boxShadow: "0 3px 0 rgba(0,0,0,0.5)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" fill="#DD8A3C" opacity="0.9"/>
              <circle cx="10" cy="10" r="4" fill="rgba(255,230,150,0.55)"/>
            </svg>
            <span style={{ fontFamily: TITLE, fontSize: 17, color: "#E6D4A8", letterSpacing: 1 }}>{balance}</span>
            <span style={{ fontFamily: BODY, fontWeight: "600", fontSize: 9, color: "rgba(230,212,168,0.5)", letterSpacing: 2, textTransform: "uppercase" }}>
              pebbles available
            </span>
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
            gap: 16,
          }}
        >
          {SKINS.map((skin, idx) => {
            const isOwned = owned.has(skin.id);
            const isEquipped = skinData.equipped === skin.id;
            const canAfford = balance >= skin.price;

            return (
              <div
                key={skin.id}
                style={{
                  background: isEquipped
                    ? "rgba(110,131,96,0.20)"
                    : "rgba(28,18,8,0.85)",
                  border: `1.5px solid ${isEquipped ? "rgba(148,168,116,0.65)" : "rgba(221,138,60,0.22)"}`,
                  borderRadius: 16, padding: "16px 12px 14px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  boxShadow: isEquipped
                    ? "0 0 20px rgba(148,168,116,0.18), 0 4px 0 rgba(0,0,0,0.4)"
                    : "0 4px 0 rgba(0,0,0,0.4)",
                  animation: mounted ? `skinCardIn 0.36s ${idx * 0.045}s ease backwards` : "none",
                  transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                }}
              >
                <SkinPreview image={skin.image} size={52} />

                <div style={{ fontFamily: TITLE, fontSize: 14, color: isEquipped ? "#94A874" : "#E6D4A8", letterSpacing: 1, textAlign: "center" }}>
                  {skin.name}
                </div>

                {isEquipped && (
                  <div
                    style={{
                      fontFamily: BODY, fontWeight: "800", fontSize: 8,
                      color: "#94A874", letterSpacing: 3, textTransform: "uppercase",
                      background: "rgba(148,168,116,0.18)", padding: "3px 10px", borderRadius: 8,
                    }}
                  >
                    ✓ EQUIPPED
                  </div>
                )}

                {skin.price === 0 && !isEquipped && (
                  <button className="sk-btn" onClick={() => handleEquip(skin)}
                    style={{ background: "#6E8360", color: "#fff", boxShadow: "0 3px 0 #3e5030" }}>
                    EQUIP
                  </button>
                )}

                {skin.price > 0 && !isOwned && (
                  <button
                    className="sk-btn"
                    onClick={() => handleBuy(skin)}
                    disabled={!canAfford}
                    style={{
                      background: canAfford ? "#DD8A3C" : "rgba(120,90,50,0.45)",
                      color: canAfford ? "#fff" : "rgba(200,170,110,0.5)",
                      boxShadow: canAfford ? "0 3px 0 #8a4a10" : "none",
                    }}
                  >
                    ◉ {skin.price}
                  </button>
                )}

                {skin.price > 0 && isOwned && !isEquipped && (
                  <button className="sk-btn" onClick={() => handleEquip(skin)}
                    style={{ background: "#4a6840", color: "#d4e8c0", boxShadow: "0 3px 0 #2a4020" }}>
                    EQUIP
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
