<script setup lang="ts">
const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const cancelButton = ref<HTMLButtonElement | null>(null);

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    await nextTick();
    cancelButton.value?.focus();
  }
);

function onKeydown(event: KeyboardEvent) {
  if (props.open && event.key === "Escape") {
    emit("cancel");
  }
}

onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="discard"
      role="dialog"
      aria-modal="true"
      aria-label="discard changes"
      @click.self="emit('cancel')"
    >
      <div class="discard__card">
        <button
          class="discard__close"
          type="button"
          aria-label="cancel"
          @click="emit('cancel')"
        >
          <UIcon name="i-lucide-x" />
        </button>

        <p class="discard__text">
          this will discard your changes; are you sure?
        </p>

        <div class="discard__actions">
          <button
            ref="cancelButton"
            class="discard__button"
            type="button"
            @click="emit('cancel')"
          >
            cancel
          </button>
          <button
            class="discard__button discard__button--primary"
            type="button"
            @click="emit('confirm')"
          >
            okay
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.discard {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(51, 65, 85, 0.18);
  backdrop-filter: blur(4px);
}

.discard__card {
  position: relative;
  width: min(22rem, 100%);
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 1.25rem;
  box-shadow: 0 16px 40px rgba(51, 65, 85, 0.16);
}

.discard__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  color: rgba(51, 65, 85, 0.5);
  cursor: pointer;
  background: none;
  border: 0;
  border-radius: 999px;
}

.discard__close:hover {
  color: rgba(51, 65, 85, 0.8);
  background: rgba(255, 255, 255, 0.8);
}

.discard__text {
  padding-right: 1.25rem;
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(51, 65, 85, 0.8);
}

.discard__actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
  margin-top: 1.25rem;
}

.discard__button {
  padding: 0.6rem 1.1rem;
  font: inherit;
  font-size: 0.9rem;
  color: rgba(51, 65, 85, 0.7);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 999px;
}

.discard__button:hover {
  background: rgba(255, 255, 255, 0.85);
}

.discard__button--primary {
  color: rgba(51, 65, 85, 0.88);
  background: rgba(255, 255, 255, 0.9);
}
</style>
