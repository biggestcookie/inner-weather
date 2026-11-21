<script setup lang="ts">
const route = useRoute();

// The emotion is the only part of a new entry that exists before logging.
const emotionId = computed(() => {
  const id = route.query.emotion;
  return typeof id === "string" ? getEmotionById(id)?.id ?? "" : "";
});

onMounted(() => {
  if (!emotionId.value) void navigateTo("/");
});
</script>

<template>
  <div>
    <RecordedEmotionEntry
      v-if="emotionId"
      :key="emotionId"
      :emotion-id="emotionId"
    />
  </div>
</template>
