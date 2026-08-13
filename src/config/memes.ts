export type MemeKind = "text" | "image" | "video";

export type Meme = {
  id: string;
  title: string;
  text: string;
  media?: string;
  kind: MemeKind;
};

export const MEMES: Record<string, Meme> = {
  max_heat: {
    id: "max_heat",
    title: "ПЕРЕГРЕВ",
    text: "Я УЖЕ КРАСНЫЙ, КУЛЬТУРНО НЕ ПОЛУЧИТСЯ",
    kind: "text",
  },
};
