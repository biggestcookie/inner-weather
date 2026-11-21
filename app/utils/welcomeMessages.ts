/**
 * The daily welcome line. Shown at random when the map opens on a day with no
 * kept feeling yet. Copy stays neutral and invitational — no pressure, no
 * streaks (docs/product-vision.md — The vocabulary of keeping).
 */
export const welcomeMessages = [
  "Welcome. Ready to start your day.",
  "Let's check in with yourself.",
  "What's on your mind today?",
  "How are you feeling today?",
  "A quiet moment to notice how you feel.",
  "Whenever you're ready, let's begin.",
  "How does today feel so far?",
  "Let's see what's here today.",
  "A moment to check in with yourself.",
  "Where are you today?",
  "How is the day sitting with you?",
  "What feeling is closest right now?",
  "Ready when you are.",
  "Take a moment to settle in.",
  "Let's start with what you notice.",
  "What's been on your mind lately?",
  "How's your inner weather?",
  "A moment for whatever is present.",
  "Start wherever you like.",
  "What's taking up space today?",
  "Let's tune in for a moment.",
  "What's here to be noticed?",
  "Let's see how you're doing.",
  "What feeling is asking for attention?",
  "Take your time with this.",
  "Let's make room for whatever's here.",
  "What's present for you right now?",
  "A moment to listen inward.",
  "What's been with you today?",
  "Let's settle into the moment.",
  "How is it going today?",
  "What would you like to name today?",
  "A gentle moment to check in.",
  "Let's begin with what's here.",
  "What's the tone of today?",
  "How are you, right now?",
  "What's present for you today?",
  "Notice what comes up first.",
  "What's sitting with you?",
  "What's on the inside today?",
  "What feeling is here with you?",
  "How does today feel to you?",
  "What's been lingering?",
  "Let's make a small moment for you.",
  "Let's check in at your own pace.",
  "What would today's feeling be called?",
  "What's your day been like so far?",
  "What's moving through you?",
  "Let's pause and notice.",
  "How's your day going so far?",
  "What's been on your mind?",
  "A moment to be with yourself.",
  "What's calling for your attention?",
  "How does today land?",
  "What feeling would you like to explore?",
  "Notice what feels closest right now.",
  "What's the shape of today?",
  "How are you feeling in this moment?",
  "Let's make space for what's here.",
  "A moment to simply check in.",
  "What's the mood of today?",
  "Let's explore what's here.",
  "How is your day unfolding?",
  "Ready to check in with yourself.",
] as const;

/** One welcome line, picked fresh each time the screen opens. */
export function pickWelcomeMessage(): string {
  return (
    welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)] ??
    welcomeMessages[0]
  );
}
