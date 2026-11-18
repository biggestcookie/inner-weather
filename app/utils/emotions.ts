import emotionsData from "~/assets/data/emotions.json";
import type { Emotion } from "~/types/emotion";

/** The full vocabulary, in file order. Edit `app/assets/data/emotions.json`. */
export const emotions: Emotion[] = emotionsData;

/** Look up one vocabulary entry by its stable id. */
export function getEmotionById(id: string): Emotion | undefined {
  return emotions.find((emotion) => emotion.id === id);
}
