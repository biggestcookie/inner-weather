<script setup lang="ts">
import type { RecordedEmotion } from "~/types/recordedEmotion";

const route = useRoute();

const record = shallowRef<RecordedEmotion | null>(null);
const loaded = ref(false);

watch(
  () => route.params.id,
  async (id) => {
    loaded.value = false;
    record.value = (await getRecordedEmotion(String(id))) ?? null;
    loaded.value = true;
  },
  { immediate: true }
);
</script>

<template>
  <div class="entry-page">
    <RecordedEmotionEntry
      v-if="record"
      :key="record.id"
      :emotion-id="record.emotionId"
      :record="record"
    />

    <section v-else-if="loaded" class="missing">
      <p class="missing__text">this one has drifted away.</p>
      <NuxtLink to="/logbook" class="missing__link">go back</NuxtLink>
    </section>
  </div>
</template>

<style scoped>
.entry-page {
  min-height: 100dvh;
  background: #faf7f2;
}

.missing {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem 1.5rem 6rem;
  text-align: center;
  background: radial-gradient(
      at 25% 20%,
      rgba(196, 181, 253, 0.35),
      transparent 55%
    ),
    radial-gradient(at 75% 85%, rgba(147, 197, 253, 0.3), transparent 60%),
    #faf7f2;
}

.missing__text {
  font-size: 0.95rem;
  color: rgba(51, 65, 85, 0.55);
}

.missing__link {
  font-size: 0.85rem;
  color: rgba(51, 65, 85, 0.65);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
