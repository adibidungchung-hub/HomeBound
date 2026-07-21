import { useState, useEffect } from "react";

export type Lang = "en" | "vi";
const LANG_KEY = "gd_lang";

function stored(): Lang {
  try { return (localStorage.getItem(LANG_KEY) as Lang) || "en"; } catch { return "en"; }
}

let _lang: Lang = stored();
const _listeners = new Set<() => void>();

export function getLang(): Lang { return _lang; }

export function setLang(lang: Lang) {
  _lang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
  _listeners.forEach(fn => fn());
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setL] = useState(getLang);
  useEffect(() => {
    const unsub = () => setL(getLang());
    _listeners.add(unsub);
    return () => { _listeners.delete(unsub); };
  }, []);
  return [lang, setLang];
}

export const T = {
  en: {
    tagline: "✦ A Journey Back to the Mountain ✦",
    play: "PLAY",
    settings: "SETTINGS",
    audio: "AUDIO",
    music: "🎵  Music",
    sfx: "🔊  Effects",
    language: "🌐  Language",
    langEn: "English",
    langVi: "Tiếng Việt",
    done: "DONE",
    selectLevel: "SELECT LEVEL",
    chooseMap: "Choose your map",
    best: "BEST",
    playBtn: "PLAY",
    continueBtn: "CONTINUE",
    playAgainBtn: "PLAY AGAIN",
    completeMap: (n: number) => `COMPLETE MAP ${n}`,
    endlessMode: "ENDLESS MODE",
    endlessSub: "All maps cleared · beat your best distance",
    pebbles: "pebbles",
    paused: "PAUSED",
    resume: "RESUME",
    retry: "RETRY",
    home: "HOME",
    youDied: "YOU DIED",
    completed: (pct: number) => `${pct}% completed`,
    levelComplete: (n: number) => `LEVEL ${n} COMPLETE!`,
    amazing: "Amazing!",
    endless: "∞ ENDLESS",
    newBest: "🏆 NEW BEST DISTANCE!",
    hint: "Space / Click / Tap to Jump \u00a0·\u00a0 ESC to Pause",
    loading: "Loading…",
  },
  vi: {
    tagline: "✦ Hành Trình Trở Về Núi ✦",
    play: "CHƠI",
    settings: "CÀI ĐẶT",
    audio: "ÂM THANH",
    music: "🎵  Nhạc",
    sfx: "🔊  Hiệu ứng",
    language: "🌐  Ngôn ngữ",
    langEn: "English",
    langVi: "Tiếng Việt",
    done: "XONG",
    selectLevel: "CHỌN BẢN ĐỒ",
    chooseMap: "Chọn màn chơi",
    best: "TỐT NHẤT",
    playBtn: "CHƠI",
    continueBtn: "TIẾP TỤC",
    playAgainBtn: "CHƠI LẠI",
    completeMap: (n: number) => `HOÀN THÀNH BẢN ${n}`,
    endlessMode: "CHẾ ĐỘ VÔ TẬN",
    endlessSub: "Đã xóa tất cả · phá kỷ lục khoảng cách",
    pebbles: "sỏi",
    paused: "TẠM DỪNG",
    resume: "TIẾP TỤC",
    retry: "THỬ LẠI",
    home: "TRANG CHỦ",
    youDied: "BẠN ĐÃ CHẾT",
    completed: (pct: number) => `Hoàn thành ${pct}%`,
    levelComplete: (n: number) => `BẢN ${n} HOÀN THÀNH!`,
    amazing: "Tuyệt vời!",
    endless: "∞ VÔ TẬN",
    newBest: "🏆 KỶ LỤC MỚI!",
    hint: "Cách / Nhấn / Chạm để Nhảy \u00a0·\u00a0 ESC để Dừng",
    loading: "Đang tải…",
  },
} as const;
