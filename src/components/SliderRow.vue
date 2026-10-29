<script setup>
import { computed } from 'vue'

// 等级 / 精炼滑块
// 两种版式：无 label 时左侧是数值胶囊（角色等级、武器等级），有 label 时是「标签 + 滑块 + 数值」（天赋）
const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    default: 1,
  },
  max: {
    type: Number,
    required: true,
  },
  step: {
    type: Number,
    default: 1,
  },
  label: {
    type: String,
    default: '',
  },
  prefix: {
    type: String,
    default: 'Lv.',
  },
  suffix: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const valueText = computed(() => `${props.prefix}${props.modelValue}${props.suffix}`)

function onInput(event) {
  emit('update:modelValue', Number(event.target.value))
}
</script>

<template>
  <div v-if="label" class="slider-item">
    <span class="slider-label">{{ label }}</span>
    <input
      class="slider"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      @input="onInput"
    />
    <span class="slider-num">{{ valueText }}</span>
  </div>

  <div v-else class="level-drag">
    <span class="level-badge">{{ valueText }}</span>
    <input
      class="slider"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
.level-drag {
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-badge {
  min-width: 84px;
  text-align: center;
  font-size: 18px;
  padding: 6px 12px;
  border-radius: 9999px;
  background-color: var(--clr-white-20);
}

.slider-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-label {
  width: 84px;
  font-size: 15px;
  color: var(--clr-white-70);
}

.slider-num {
  width: 62px;
  text-align: right;
  font-size: 15px;
}

.slider {
  flex: 1;
  height: 4px;
  appearance: none;
  border-radius: 9999px;
  background: var(--clr-white-20);
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--clr-white);
  border: none;
}

@media (max-width: 768px) {
  .level-drag {
    gap: 10px;
  }

  .level-badge {
    min-width: 64px;
    padding: 4px 10px;
    font-size: 16px;
  }

  .slider-label {
    width: 64px;
    font-size: 14px;
  }

  .slider-num {
    width: 54px;
    font-size: 14px;
  }
}
</style>
