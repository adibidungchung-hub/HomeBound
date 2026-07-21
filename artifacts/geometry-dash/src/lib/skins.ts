export interface SkinDef {
  id: string;
  name: string;
  color: string;
  glowColor: string;
  image: string;
  price: number;
}

export const SKINS: SkinDef[] = [
  { id: "default",  name: "Rocky",   color: "#AAAAAA", glowColor: "rgba(170,170,170,0.55)", image: "/skin-rocky.png",   price: 0   },
  { id: "coral",    name: "Blaze",   color: "#FF3333", glowColor: "rgba(255,51,51,0.65)",   image: "/skin-blaze.png",   price: 30  },
  { id: "forest",   name: "Mossy",   color: "#44EE44", glowColor: "rgba(68,238,68,0.65)",   image: "/skin-mossy.png",   price: 45  },
  { id: "lava",     name: "Cookie",  color: "#CC8844", glowColor: "rgba(204,136,68,0.60)",  image: "/skin-cookie.png",  price: 65  },
  { id: "gold",     name: "Goldie",  color: "#FFD700", glowColor: "rgba(255,215,0,0.65)",   image: "/skin-goldie.png",  price: 95  },
  { id: "arctic",   name: "Glacier", color: "#00DDCC", glowColor: "rgba(0,221,204,0.65)",   image: "/skin-glacier.png", price: 140 },
  { id: "violet",   name: "Plum",    color: "#BB44FF", glowColor: "rgba(187,68,255,0.65)",  image: "/skin-plum.png",    price: 200 },
  { id: "obsidian", name: "Cobalt",  color: "#4466FF", glowColor: "rgba(68,102,255,0.65)",  image: "/skin-cobalt.png",  price: 300 },
];

export interface SkinSave {
  equipped: string;
  owned: string[];
}

const SKIN_KEY = "gd_skins_v1";

export function getSkinSave(): SkinSave {
  try {
    const raw = localStorage.getItem(SKIN_KEY);
    if (raw) return JSON.parse(raw) as SkinSave;
  } catch {}
  return { equipped: "default", owned: ["default"] };
}

export function saveSkinSave(data: SkinSave): void {
  try {
    localStorage.setItem(SKIN_KEY, JSON.stringify(data));
  } catch {}
}

export function getEquippedSkin(): SkinDef {
  const { equipped } = getSkinSave();
  return SKINS.find(s => s.id === equipped) ?? SKINS[0];
}
