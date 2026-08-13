export type MemeKind = "text" | "image" | "video";

export type Meme = {
  id: string;
  text: string;
  media?: string;
  kind: MemeKind;
  duration?: number;
};

export const MEMES: Record<string, Meme> = {
  max_heat: {
    id: "max_heat",
    text: "Я УЖЕ КРАСНЫЙ, КУЛЬТУРНО НЕ ПОЛУЧИТСЯ",
    media: "/videos/red_new.mp4",
    kind: "video",
    duration: 6000,
  },
  debuff: {
    id: "debuff",
    text: "",
    media: "/videos/go.mp4",
    kind: "video",
  },
  strong_effect: {
    id: "strong_effect",
    text: "СКОЛЬКО НАХУЙ?",
    media: "/videos/how_much.mp4",
    kind: "video",
  },
  mem: {
    id: "mem",
    text: "",
    media: "/videos/for_mem.mp4",
    kind: "video",
  },
};
