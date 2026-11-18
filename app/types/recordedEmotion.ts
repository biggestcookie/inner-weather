/**
 * A recorded emotion — one moment of feeling, saved in the logbook.
 * In-app copy may say "kept feeling"; code stays plain:
 * `RecordedEmotion`.
 */
export interface RecordedEmotion {
  /** Stable identifier of this recording. */
  id: string;
  /** Id of the vocabulary entry (`Emotion["id"]`). */
  emotionId: string;
  /** When the moment happened — user-editable (backfilling). ISO timestamp. */
  occurredAt: string;
  /** Optional freeform note. */
  note?: string;
  /** When the recording was saved. ISO timestamp. */
  createdAt: string;
}
