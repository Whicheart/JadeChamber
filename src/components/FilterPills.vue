<script setup>
// 胶囊按钮组：背包的部位筛选与新增卡片的部位选择共用同一套外观
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  // [{ value, label, disabled? }]
  options: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

function pick(option) {
  if (option.disabled) return

  emit('update:modelValue', option.value)
}
</script>

<template>
  <div class="pills">
    <button
      v-for="option in props.options"
      :key="option.value"
      type="button"
      class="pill"
      :class="{ active: props.modelValue === option.value }"
      :disabled="option.disabled"
      :aria-pressed="props.modelValue === option.value"
      @click="pick(option)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.pill {
  height: 34px;
  padding: 0 16px;
  border: none;
  border-radius: 9999px;
  background-color: var(--clr-white-10);
  color: var(--clr-white-60);
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
  transition:
    background-color 150ms,
    color 150ms;
}

.pill:hover:not(:disabled) {
  background-color: var(--clr-white-20);
  color: var(--clr-white-80);
}

.pill.active {
  background-color: var(--clr-white-20);
  color: var(--clr-white);
}

.pill:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .pill {
    height: 32px;
    padding: 0 13px;
    font-size: 13px;
  }
}
</style>
