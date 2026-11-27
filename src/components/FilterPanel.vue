<script setup lang="ts">
import type { FilterButtonConfig, FilterGroup, FilterSelection } from '../types'
import { filterButtonBackground } from '../utils/filterIcons'

const props = defineProps<{
  groups: FilterGroup[]
  modelValue: FilterSelection
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FilterSelection]
}>()

function isActive(key: string, value: string): boolean {
  return (props.modelValue[key] ?? []).includes(value)
}

function toggle(key: string, value: string) {
  const current = props.modelValue[key] ?? []
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]

  emit('update:modelValue', { ...props.modelValue, [key]: next })
}

function optionBackground(active: boolean): Record<string, string> {
  const background = active
    ? (filterButtonBackground.active ?? filterButtonBackground.default)
    : filterButtonBackground.default

  return background ? { backgroundImage: `url("${background}")` } : {}
}

function optionIcon(button: FilterButtonConfig, active: boolean): string | undefined {
  return active ? (button.activeIcon ?? button.icon) : button.icon
}
</script>

<template>
  <section class="filter-panel">
    <div class="filter-panel__body">
      <div v-for="group in groups" :key="group.key" class="filter-group">
        <span class="filter-group__name">{{ group.name }}</span>
        <div class="filter-group__buttons">
          <button
            v-for="button in group.buttons"
            :key="button.value"
            type="button"
            class="filter-option"
            :class="{ 'filter-option--active': isActive(group.key, button.value) }"
            :style="optionBackground(isActive(group.key, button.value))"
            @click="toggle(group.key, button.value)"
          >
            <img
              v-if="optionIcon(button, isActive(group.key, button.value))"
              class="filter-option__icon"
              :src="optionIcon(button, isActive(group.key, button.value))"
              alt=""
            />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.filter-panel {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-4;
  background-color: $color-bg-raised;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  box-shadow: $shadow-lg;
}

.filter-panel__body {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.filter-group__name {
  color: $color-text-muted;
  font-size: $font-size-xs;
}

.filter-group__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}

.filter-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  border: none;
  cursor: pointer;
  transition:
    transform $transition-fast,
    filter $transition-fast;

  &:hover {
    filter: brightness(1.12);
    transform: scale(1.06);
  }

  &:active {
    transform: scale(0.96);
  }
}

.filter-option__icon {
  width: 55%;
  height: 55%;
  object-fit: contain;
  pointer-events: none;
}
</style>
