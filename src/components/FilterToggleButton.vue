<script setup lang="ts">
withDefaults(
  defineProps<{
    expanded?: boolean
  }>(),
  {
    expanded: false,
  },
)

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    type="button"
    class="filter-toggle"
    :class="{ 'filter-toggle--expanded': expanded }"
    @click="emit('toggle')"
  >
    <span class="filter-toggle__icon" />
  </button>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.filter-toggle {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  color: $color-accent;
  background-color: $color-bg-raised;
  border: 1px solid $color-border;
  border-radius: 50%;
  cursor: pointer;
  transition:
    color $transition-fast,
    border-color $transition-fast,
    box-shadow $transition-fast;

  &:hover {
    color: $color-accent-strong;
    border-color: $color-accent;
    box-shadow: $shadow-glow;
  }

  &:active {
    transform: scale(0.96);
  }
}

.filter-toggle__icon {
  width: 18px;
  height: 18px;
  background-color: currentcolor;
  -webkit-mask: url('../assets/icon/UI_BtnIcon_Filter_expand.svg') center / contain no-repeat;
  mask: url('../assets/icon/UI_BtnIcon_Filter_expand.svg') center / contain no-repeat;
}

.filter-toggle--expanded .filter-toggle__icon {
  -webkit-mask-image: url('../assets/icon/UI_BtnIcon_Filter_collapse.svg');
  mask-image: url('../assets/icon/UI_BtnIcon_Filter_collapse.svg');
}
</style>
