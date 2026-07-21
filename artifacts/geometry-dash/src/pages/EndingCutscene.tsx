import { useEffect, useState } from "react";

const TITLE_F = "'Lilita One', cursive";
const BODY_F = "'Nunito', sans-serif";

type Phase = "walking" | "hugging" | "flash" | "text" | "button";

interface Props {
  onHome: () => void;
}

export default function EndingCutscene({ onHome }: Props) {
  const [phase, setPhase] = useState<Phase>("walking");
  const [textOpacity, setTextOpacity] = useState(0);
  const [btnOpacity, setBtnOpacity] = useState(0);

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase("hugging"), 3000),
      setTimeout(() => setPhase("flash"), 4600),
      setTimeout(() => setPhase("text"), 5700),
      setTimeout(() => setTextOpacity(1), 5900),
      setTimeout(() => setPhase("button"), 7800),
      setTimeout(() => setBtnOpacity(1), 8000),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const isFlash = phase === "flash" || phase === "text" || phase === "button";

  const dadLeft = phase === "walking" ? "108%" : "21%";
  const momLeft = phase === "walking" ? "124%" : "28%";

  const dadTransition =
    phase === "hugging"
      ? "left 1.1s cubic-bezier(0.4,0,0.2,1)"
      : "left 2.9s cubic-bezier(0.25,0.46,0.45,0.94)";
  const momTransition =
    phase === "hugging"
      ? "left 1.1s cubic-bezier(0.4,0,0.2,1) 0.1s"
      : "left 2.9s cubic-bezier(0.25,0.46,0.45,0.94) 0.25s";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 25,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {!isFlash && (
        <>
          <img
            src="/parent-dad.png"
            alt=""
            style={{
              position: "absolute",
              left: dadLeft,
              top: "59%",
              width: "14%",
              transition: dadTransition,
              mixBlendMode: "screen",
              imageRendering: "pixelated",
            }}
          />
          <img
            src="/parent-mom.png"
            alt=""
            style={{
              position: "absolute",
              left: momLeft,
              top: "59%",
              width: "14%",
              transition: momTransition,
              mixBlendMode: "screen",
              imageRendering: "pixelated",
            }}
          />
        </>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #FFF8E8 0%, #FFE8C8 100%)",
          opacity: isFlash ? 1 : 0,
          transition:
            phase === "flash"
              ? "opacity 0.75s ease-in"
              : "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: isFlash ? "auto" : "none",
          gap: 0,
        }}
      >
        <div
          style={{
            opacity: textOpacity,
            transition: "opacity 2s ease-in",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          <div
            style={{
              fontFamily: TITLE_F,
              fontSize: "clamp(15px, 3.2vw, 34px)",
              color: "#3A2008",
              letterSpacing: "0.06em",
              textAlign: "center",
              padding: "0 20px",
              lineHeight: 1.5,
              textShadow: "0 2px 12px rgba(180,100,20,0.18)",
            }}
          >
            you found your way back home
          </div>

          <div
            style={{
              marginTop: 10,
              width: "clamp(40px, 8vw, 80px)",
              height: 2,
              background:
                "linear-gradient(90deg, transparent, rgba(180,100,20,0.3), transparent)",
              borderRadius: 1,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 36,
            opacity: btnOpacity,
            transition: "opacity 0.9s ease-in",
            pointerEvents: btnOpacity > 0.5 ? "auto" : "none",
          }}
        >
          <button
            onClick={onHome}
            style={{
              fontFamily: TITLE_F,
              fontSize: "clamp(11px, 1.8vw, 17px)",
              color: "#FFF8E8",
              background: "linear-gradient(180deg, #D9924A 0%, #B86A20 100%)",
              border: "none",
              borderRadius: 14,
              padding: "10px 42px",
              cursor: "pointer",
              boxShadow: "0 5px 0 #7A420A, 0 8px 18px rgba(120,60,10,0.25)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 7px 0 #7A420A, 0 12px 22px rgba(120,60,10,0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 5px 0 #7A420A, 0 8px 18px rgba(120,60,10,0.25)";
            }}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
