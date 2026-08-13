export type MemeKind = "text" | "image" | "video";

export type Meme = {
  id: string;
  text: string;
  media?: string;
  kind: MemeKind;
  duration?: number;
};

const V = `${import.meta.env.BASE_URL}videos/`;

export const MEMES: Record<string, Meme> = {
  max_heat: {
    id: "max_heat",
    text: "Я УЖЕ КРАСНЫЙ, КУЛЬТУРНО НЕ ПОЛУЧИТСЯ",
    media: `${V}red.mp4`,
    kind: "video",
    duration: 6000,
  },
  debuff: {
    id: "debuff",
    text: "",
    media: `${V}go.mp4`,
    kind: "video",
  },
  strong_effect: {
    id: "strong_effect",
    text: "СКОЛЬКО НАХУЙ?",
    media: `${V}how_much.mp4`,
    kind: "video",
  },
  mem: {
    id: "mem",
    text: "",
    media: `${V}for_mem.mp4`,
    kind: "video",
  },
};
