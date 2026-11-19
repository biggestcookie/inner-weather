<script setup lang="ts">
// The map: the drift is the resting state and starts with the wheel's simple
// words. Selecting a word pulls it just outside the cloud and reveals the next
// ring around it, while the cloud itself barely moves (docs/product-vision.md,
// docs/roadmap.md — "the web"). Words are plain DOM buttons in an absolute
// "world"; d3-force drifts the visible set, anime.js pans the camera. Layout is
// mobile-first (docs/technical-notes.md): the emotion card is an overlay on
// small screens and a right side pane from `lg`.
import { animate } from "animejs";
import {
  forceCollide,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
} from "d3-force";
import type { Emotion } from "~/types/emotion";

interface MapNode extends SimulationNodeDatum {
  emotion: Emotion;
  /** The word's spot in the cloud (simple words only). */
  home?: { x: number; y: number };
}

interface WebLine {
  key: string;
  from: MapNode;
  to: MapNode;
  /** 1 for the current web, fading for the ones before it. */
  opacity: number;
}

const route = useRoute();
const router = useRouter();

const canvas = ref<HTMLElement | null>(null);
const peek = ref<HTMLElement | null>(null);
const { width: canvasWidth, height: canvasHeight } = useElementSize(canvas);
const { height: peekHeight } = useElementSize(peek);
const reducedMotion = usePreferredReducedMotion();

const nodes = ref<MapNode[]>(emotions.map((emotion) => ({ emotion })));

// Camera offset in pixels; anime.js animates it so the selected word rests at
// the center of the visible map.
const camera = reactive({ x: 0, y: 0 });
// Where the selected word is heading — the camera centers this, not the
// in-flight position, so the word lands centered.
const anchorTarget = ref<{ x: number; y: number } | null>(null);

let simulation: Simulation<MapNode, undefined> | undefined;

const selectedId = computed<string | null>(() => {
  const id = route.query.emotion;
  return typeof id === "string" ? getEmotionById(id)?.id ?? null : null;
});

const selectedEmotion = computed<Emotion | null>(() =>
  selectedId.value ? getEmotionById(selectedId.value) ?? null : null
);

// The next ring of the wheel — the selected word's related words.
const relatedIds = computed<string[]>(() =>
  selectedEmotion.value
    ? getRelatedEmotions(selectedEmotion.value.id).map((related) => related.id)
    : []
);

const visibleNodes = computed<MapNode[]>(() => {
  const ids = new Set(
    getVisibleEmotions(selectedId.value).map((emotion) => emotion.id)
  );
  return nodes.value.filter((node) => ids.has(node.emotion.id));
});

// The words visited on the way here — their webs stay, fainter each step back.
const webTrail = ref<string[]>([]);

const webLines = computed<WebLine[]>(() => {
  const visible = new Set(visibleNodes.value.map((node) => node.emotion.id));
  const byId = new Map(nodes.value.map((node) => [node.emotion.id, node]));
  const lines = new Map<string, WebLine>();
  const last = webTrail.value.length - 1;

  webTrail.value.forEach((id, index) => {
    const node = byId.get(id);
    if (!node || !visible.has(id)) return;

    const opacity =
      index === last ? 1 : Math.max(0.18, 0.55 - (last - index) * 0.18);

    for (const related of getRelatedEmotions(id)) {
      const other = byId.get(related.id);
      if (!other || !visible.has(related.id)) continue;

      const key = [id, related.id].sort().join("--");
      const existing = lines.get(key);
      if (!existing || opacity > existing.opacity) {
        lines.set(key, { key, from: node, to: other, opacity });
      }
    }
  });

  return [...lines.values()];
});

const anchorNode = computed<MapNode | undefined>(() =>
  selectedId.value
    ? nodes.value.find((node) => node.emotion.id === selectedId.value)
    : undefined
);

/** A faint line from one word to another (world coordinates). */
function lineStyle(line: WebLine) {
  const dx = (line.to.x ?? 0) - (line.from.x ?? 0);
  const dy = (line.to.y ?? 0) - (line.from.y ?? 0);

  return {
    transform:
      `translate(${line.from.x ?? 0}px, ${line.from.y ?? 0}px) ` +
      `rotate(${(Math.atan2(dy, dx) * 180) / Math.PI}deg)`,
    width: `${Math.hypot(dx, dy)}px`,
    opacity: line.opacity,
  };
}

/** Rough half-width of a word, for collision circles. */
function radiusOf(node: MapNode): number {
  return 14 + node.emotion.word.length * 4.5;
}

/** Keep the drift inside the map, so no word wanders out of reach. */
function keepInView() {
  const maxX = Math.max(120, canvasWidth.value / 2 - 80);
  const maxY = Math.max(120, canvasHeight.value / 2 - 80);

  for (const node of nodes.value) {
    if (node.x !== undefined && Math.abs(node.x) > maxX) {
      node.x = Math.sign(node.x) * maxX;
      node.vx = 0;
    }
    if (node.y !== undefined && Math.abs(node.y) > maxY) {
      node.y = Math.sign(node.y) * maxY;
      node.vy = 0;
    }
  }
}

/** Mirrors the `lg` breakpoint (docs/technical-notes.md — Responsive layout). */
function isDesktop(): boolean {
  return window.matchMedia("(min-width: 64rem)").matches;
}

/** How much of the map the peek and the pill leave uncovered. */
function visibleHeight(rect: DOMRect): number {
  if (isDesktop()) return rect.height;
  const blocked = 88 + peekHeight.value;
  return Math.max(160, rect.height - blocked);
}

function panCamera(x: number, y: number) {
  if (reducedMotion.value === "reduce") {
    camera.x = x;
    camera.y = y;
    return;
  }

  animate(camera, { x, y, duration: 900, ease: "outQuad" });
}

/** Rest the selected word at the center of what the user can actually see. */
function centerOnSelected() {
  const node = anchorNode.value;
  const rect = canvas.value?.getBoundingClientRect();
  if (!node || !rect) return;

  const target = anchorTarget.value ?? {
    x: node.x ?? 0,
    y: node.y ?? 0,
  };
  const targetY = visibleHeight(rect) / 2;
  panCamera(-target.x, targetY - rect.height / 2 - target.y);
}

function moveTo(node: MapNode, x: number, y: number, delay = 0) {
  node.vx = 0;
  node.vy = 0;

  if (reducedMotion.value === "reduce") {
    node.x = x;
    node.y = y;
    return;
  }

  animate(node, { x, y, duration: 700, delay, ease: "outQuad" });
}

/** Push a point clear of other words, leaving a margin of empty space. */
function clearPoint(
  point: { x: number; y: number },
  radius: number,
  others: Array<{ x?: number; y?: number; r: number }>,
  margin: number
) {
  for (let pass = 0; pass < 8; pass++) {
    for (const other of others) {
      const dx = point.x - (other.x ?? 0);
      const dy = point.y - (other.y ?? 0);
      const distance = Math.hypot(dx, dy);
      const min = radius + other.r + margin;
      if (distance >= min || distance < 0.01) continue;

      const push = (min - distance) / distance;
      point.x += dx * push;
      point.y += dy * push;
    }
  }
}

/**
 * Select a word: a simple word slips out of the cloud to the nearest point
 * just outside it; a word already in the web stays where it is. Its related
 * words (the next ring) appear around it, and the cloud only shuffles a little.
 */
function applySelection(id: string, previousId: string | null) {
  const anchor = nodes.value.find((node) => node.emotion.id === id);
  if (!anchor) return;

  simulation?.stop();
  simulation?.nodes(visibleNodes.value);

  const previous =
    previousId && previousId !== id
      ? nodes.value.find((node) => node.emotion.id === previousId)
      : undefined;

  // The core word that was out slips back into the cloud.
  const returningHome = previous?.home ? { ...previous.home } : undefined;
  if (previous?.home) {
    moveTo(previous, previous.home.x, previous.home.y);
    previous.home = undefined;
  }

  // The cloud is the simple words; everything else lives in the web around it.
  const cloud = visibleNodes.value.filter(
    (node) => !node.emotion.parentId && node !== anchor
  );
  const from = { x: anchor.x ?? 0, y: anchor.y ?? 0 };
  const wasVisible = getVisibleEmotions(previousId).some(
    (emotion) => emotion.id === id
  );

  // The cloud fills the gap a little — no swapping places. Its nudged spots
  // are what the anchor is placed against.
  const maxNudge = 12;
  const spots = cloud.map((node, index) => {
    const spot =
      node === previous && returningHome
        ? returningHome
        : { x: node.x ?? 0, y: node.y ?? 0 };

    if (node === previous || anchor.emotion.parentId) return spot;

    let nx = (from.x - spot.x) * 0.12;
    let ny = (from.y - spot.y) * 0.12;
    const nudge = Math.hypot(nx, ny);
    if (nudge > maxNudge) {
      nx *= maxNudge / nudge;
      ny *= maxNudge / nudge;
    }

    const target = { x: spot.x + nx, y: spot.y + ny };
    moveTo(node, target.x, target.y, index * 8);
    return target;
  });

  const center = spots.reduce(
    (acc, spot) => ({
      x: acc.x + spot.x / spots.length,
      y: acc.y + spot.y / spots.length,
    }),
    { x: 0, y: 0 }
  );

  let dx = from.x - center.x;
  let dy = from.y - center.y;
  if (!wasVisible || Math.hypot(dx, dy) < 1) {
    dx = 1;
    dy = 0;
  }
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  const reach = Math.max(
    ...spots.map((spot) => (spot.x - center.x) * ux + (spot.y - center.y) * uy),
    0
  );

  // Just far enough to be out of the cloud — never further than needed.
  const distance = Math.hypot(from.x - center.x, from.y - center.y);
  const outside = {
    x: center.x + ux * Math.max(distance, reach + 40),
    y: center.y + uy * Math.max(distance, reach + 40),
  };
  clearPoint(
    outside,
    radiusOf(anchor),
    cloud.map((node, index) => ({
      x: spots[index]?.x ?? 0,
      y: spots[index]?.y ?? 0,
      r: radiusOf(node),
    })),
    28
  );

  const out = { x: from.x, y: from.y };

  if (!wasVisible) {
    out.x = outside.x;
    out.y = outside.y;
    anchor.x = out.x;
    anchor.y = out.y;
  } else if (!anchor.emotion.parentId) {
    out.x = outside.x;
    out.y = outside.y;
    anchor.home = from;
    moveTo(anchor, out.x, out.y);
  }

  anchorTarget.value = { x: out.x, y: out.y };

  // The next ring appears around the word, facing away from the cloud.
  const before = new Set(
    getVisibleEmotions(previousId).map((emotion) => emotion.id)
  );
  const newcomers = visibleNodes.value.filter(
    (node) => !before.has(node.emotion.id) && node !== anchor
  );
  // Lay the next ring along an outward arc, spaced by the words' own widths.
  const gap = 14;
  const widths = newcomers.map((node) => node.emotion.word.length * 8.4 + 26);
  const total =
    widths.reduce((sum, width) => sum + width, 0) +
    gap * Math.max(newcomers.length - 1, 0);
  const base = Math.atan2(uy, ux);
  const spread = Math.PI * 1.3;
  const ring = Math.max(100, total / spread);

  let cursor = -total / 2;
  newcomers.forEach((node, index) => {
    const width = widths[index] ?? 0;
    const center = cursor + width / 2;
    cursor += width + gap;

    const angle = base + center / ring;
    node.x = out.x + Math.cos(angle) * ring;
    node.y = out.y + Math.sin(angle) * ring;
    node.vx = 0;
    node.vy = 0;
  });

  // Never let the new ring sit on top of another word. The previous anchor is
  // only skipped while it is on its way back into the cloud.
  const others = visibleNodes.value.filter(
    (node) => node !== anchor && !(node === previous && returningHome)
  );
  const otherSpots = others.map((other) => ({
    x: other.x,
    y: other.y,
    r: radiusOf(other),
  }));
  for (const node of newcomers) {
    const point = { x: node.x ?? 0, y: node.y ?? 0 };
    clearPoint(point, radiusOf(node) * 0.8, otherSpots, 6);
    node.x = point.x;
    node.y = point.y;
  }
}

/** Deselect: hide the web, let the word drift home, and resume the cloud. */
function releaseWeb() {
  for (const node of nodes.value) {
    node.home = undefined;
    node.vx = 0;
    node.vy = 0;
  }

  simulation?.nodes(visibleNodes.value);
  anchorTarget.value = null;
  panCamera(0, 0);
  simulation?.alpha(Math.max(simulation.alpha(), 0.25)).restart();
}

function select(id: string) {
  router.replace({ query: { emotion: id } });
}

function handleWordClick(id: string) {
  if (id === selectedId.value) {
    deselect();
    return;
  }

  // Related or not: the tapped word becomes the next anchor.
  select(id);
}

/** Empty space, the card's close button, or the anchor: back to drift. */
function deselect() {
  if (selectedId.value) {
    router.replace({ query: {} });
  }
}

watch(selectedId, (id, previousId) => {
  if (!id) {
    webTrail.value = [];
    releaseWeb();
    return;
  }

  const seen = webTrail.value.indexOf(id);
  webTrail.value =
    seen >= 0
      ? webTrail.value.slice(0, seen + 1)
      : [...webTrail.value, id].slice(-6);

  applySelection(id, previousId ?? null);
});

// Recenter whenever the visible map changes shape (peek or window).
watch(
  [selectedEmotion, peekHeight, canvasWidth, canvasHeight],
  () => {
    if (selectedEmotion.value) centerOnSelected();
  },
  { flush: "post" }
);

onMounted(() => {
  // The simple words start in a loose cloud; the physics settles them.
  for (const node of nodes.value) {
    if (node.emotion.parentId) continue;
    node.x = (Math.random() - 0.5) * 240;
    node.y = (Math.random() - 0.5) * 240;
  }

  simulation = forceSimulation(visibleNodes.value)
    .force("charge", forceManyBody<MapNode>().strength(-40))
    .force("collide", forceCollide<MapNode>().radius(radiusOf).strength(0.9))
    .force("x", forceX<MapNode>(0).strength(0.02))
    .force("y", forceY<MapNode>(0).strength(0.02))
    .velocityDecay(0.55)
    .alphaTarget(reducedMotion.value === "reduce" ? 0 : 0.04)
    .on("tick", keepInView)
    .restart();

  if (selectedId.value) {
    webTrail.value = [selectedId.value];
    applySelection(selectedId.value, null);
    nextTick(centerOnSelected);
  }
});

onBeforeUnmount(() => simulation?.stop());
</script>

<template>
  <div
    class="map relative flex min-h-dvh flex-col lg:h-dvh lg:flex-row lg:overflow-hidden"
  >
    <div
      ref="canvas"
      class="map__canvas flex flex-1 overflow-hidden"
      @click="deselect"
    >
      <div
        class="map__world"
        :style="{
          transform: `translate(${camera.x}px, ${camera.y}px)`,
        }"
      >
        <!-- The web: the current links, and the ones walked in on. -->
        <span
          v-for="line in webLines"
          :key="line.key"
          class="map__web-line"
          :style="lineStyle(line)"
          aria-hidden="true"
        />

        <button
          v-for="node in visibleNodes"
          :key="node.emotion.id"
          class="map__word"
          :class="{
            'map__word--anchor': node.emotion.id === selectedId,
            'map__word--dim':
              selectedId !== null &&
              node.emotion.id !== selectedId &&
              !relatedIds.includes(node.emotion.id),
          }"
          :style="{
            color: node.emotion.hue,
            transform: `translate(${node.x ?? 0}px, ${
              node.y ?? 0
            }px) translate(-50%, -50%)`,
          }"
          @click.stop="handleWordClick(node.emotion.id)"
        >
          {{ node.emotion.word }}
        </button>
      </div>
    </div>

    <!-- Mobile: the peek overlays the map just above the pill. -->
    <aside v-if="selectedEmotion" ref="peek" class="map__peek lg:hidden">
      <EmotionCard
        :emotion="selectedEmotion"
        @select="select"
        @close="deselect"
      />
    </aside>

    <!-- Desktop: a right side pane, always visible. -->
    <aside
      class="map__pane hidden lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:overflow-y-auto xl:w-96"
    >
      <EmotionCard
        :emotion="selectedEmotion"
        @select="select"
        @close="deselect"
      />
    </aside>
  </div>
</template>

<style scoped>
.map {
  background: radial-gradient(
      at 18% 22%,
      rgba(147, 197, 253, 0.55),
      transparent 55%
    ),
    radial-gradient(at 82% 18%, rgba(196, 181, 253, 0.5), transparent 55%),
    radial-gradient(at 50% 90%, rgba(253, 186, 116, 0.45), transparent 60%),
    #faf7f2;
}

.map__canvas {
  position: relative;
}

.map__world {
  position: absolute;
  inset: 0;
}

.map__web-line {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 0;
  height: 1px;
  margin-top: -0.5px;
  background: rgba(51, 65, 85, 0.16);
  transform-origin: 0 50%;
  pointer-events: none;
}

.map__word {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  padding: 0.35rem 0.75rem;
  font: inherit;
  font-size: 1.05rem;
  letter-spacing: 0.02em;
  white-space: nowrap;
  background: none;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  will-change: transform;
  transition: background-color 0.3s ease, box-shadow 0.3s ease,
    opacity 0.4s ease;
}

.map__word:hover {
  background: rgba(255, 255, 255, 0.35);
}

.map__word--anchor {
  z-index: 2;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 6px 18px rgba(51, 65, 85, 0.12);
}

/* Unrelated words step back while a web is open — still there, still tappable. */
.map__word--dim {
  opacity: 0.35;
}

.map__peek {
  position: absolute;
  right: 0.75rem;
  bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
  left: 0.75rem;
  z-index: 10;
}

.map__pane {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.25);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}
</style>
