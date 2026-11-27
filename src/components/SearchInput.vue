<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
  }>(),
  {
    placeholder: '搜索角色名称',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  enter: []
}>()

function handleInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function clear() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="search-input">
    <span class="search-input__icon">⌕</span>
    <input
      class="search-input__field"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      autocomplete="off"
      @input="handleInput"
      @keydown.enter="emit('enter')"
    />
    <button v-if="modelValue" type="button" class="search-input__clear" @click="clear">×</button>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.search-input {
  display: flex;
  align-items: center;
  gap: $space-2;
  height: 40px;
  padding: 0 $space-4;
  background-color: $color-bg-raised;
  border: 1px solid $color-border;
  border-radius: $radius-full;
  transition:
    border-color $transition-fast,
    box-shadow $transition-fast;

  &:focus-within {
    border-color: $color-accent;
    box-shadow: $shadow-glow;
  }
}

.search-input__icon {
  color: $color-text-muted;
  font-size: $font-size-lg;
  line-height: 1;
}

.search-input__field {
  flex: 1;
  min-width: 0;
  height: 100%;
  color: $color-text-primary;
  font: inherit;
  font-size: $font-size-sm;
  background: transparent;
  border: none;
  outline: none;

  &::placeholder {
    color: $color-text-muted;
  }
}

.search-input__clear {
  color: $color-text-muted;
  font-size: $font-size-lg;
  line-height: 1;
  background: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    color: $color-text-primary;
  }
}
</style>
