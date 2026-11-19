import emotionsData from "~/assets/data/emotions.json";
import type { Emotion } from "~/types/emotion";

/** The full vocabulary, in file order. Edit `app/assets/data/emotions.json`. */
export const emotions: Emotion[] = emotionsData;

/** Look up one vocabulary entry by its stable id. */
export function getEmotionById(id: string): Emotion | undefined {
  return emotions.find((emotion) => emotion.id === id);
}

/** The simple words the map starts with — the wheel's core. */
export function getCoreEmotions(): Emotion[] {
  return emotions.filter((emotion) => !emotion.parentId);
}

/** The next ring of the wheel — a word's direct children. */
export function getChildEmotions(id: string): Emotion[] {
  return emotions.filter((emotion) => emotion.parentId === id);
}

/**
 * The wheel's links to a word — its parent and its children — so an edge word
 * still shows the connection it belongs to.
 */
export function getRelatedEmotions(id: string): Emotion[] {
  const emotion = getEmotionById(id);
  if (!emotion) return [];

  const parent = emotion.parentId
    ? getEmotionById(emotion.parentId)
    : undefined;

  return [...(parent ? [parent] : []), ...getChildEmotions(id)];
}

/**
 * The words on the map for a selection: the core, the selected word's family
 * (its ancestors and siblings), and the next ring (its children).
 */
export function getVisibleEmotions(selectedId: string | null): Emotion[] {
  if (!selectedId) return getCoreEmotions();

  const selected = getEmotionById(selectedId);
  if (!selected) return getCoreEmotions();

  const ids = new Set(getCoreEmotions().map((emotion) => emotion.id));
  ids.add(selected.id);

  let { parentId } = selected;
  while (parentId) {
    ids.add(parentId);
    parentId = getEmotionById(parentId)?.parentId;
  }

  if (selected.parentId) {
    for (const sibling of getChildEmotions(selected.parentId)) {
      ids.add(sibling.id);
    }
  }

  for (const child of getChildEmotions(selected.id)) {
    ids.add(child.id);
  }

  return emotions.filter((emotion) => ids.has(emotion.id));
}
