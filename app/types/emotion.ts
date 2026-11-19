/**
 * An emotion as it exists in the vocabulary — one word on the map.
 * In-app copy may say "feeling" or "kept feeling"; code stays plain:
 * `Emotion`, `RecordedEmotion`.
 */
export interface Emotion {
  /** Stable identifier used by deep links and recorded emotions. */
  id: string;
  /** The word shown on the map and in the explorer. */
  word: string;
  /** Core feeling this word belongs to (one of the six families). */
  family: string;
  /** CSS color of the family; sibling words vary only in lightness. */
  hue: string;
  /** Short, plain-language definition for the explorer. */
  definition: string;
  /** "It might show up as" — everyday situations. */
  examples: string[];
  /**
   * The word this one belongs under — the previous ring of the feelings wheel.
   * Omitted for the simple core words the map starts with.
   */
  parentId?: string;
}
