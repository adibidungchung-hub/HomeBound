import { useEffect, useRef, useState } from "react";

const TITLE_F = "'Lilita One', cursive";

type Phase = "video" | "white" | "text" | "button";

interface Props {
  onHome: () => void;
}

export default function EndingCutscene({ onHome }: Props) {
  const [phase, setPhase] = useState<Phase>("video");
  const [textOpacity, setTextOpacity] = useState(0);
  const [btnOpacity, setBtnOpacity] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {});

    const handleEnded = () => {
      setPhase("white");
      setTimeout(() => setPhase("text"), 600);
      setTimeout(() => setTextOpacity(1), 800);
      setTimeout(() => setPhase("button"), 2800);
      setTimeout(() => setBtnOpacity(1), 3000);
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, []);

  const showWhite = phase !== "video";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 25,
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src="/ending-scene.mp4"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: phase === "video" ? 1 : 0,
          transition: "opacity 0.6s ease-in-out",
        }}
        playsInline
        muted={false}
      />

      {/* White overlay → text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#ffffff",
          opacity: showWhite ? 1 : 0,
          transition: "opacity 0.6s ease-in-out",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: showWhite ? "auto" : "none",
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
