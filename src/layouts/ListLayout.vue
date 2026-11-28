<script setup lang="ts">
import type { ListCardItem } from '../types'
import ListCard from '../components/ListCard.vue'

withDefaults(
  defineProps<{
    title: string
    items: ListCardItem[]
    loading?: boolean
    error?: string | null
  }>(),
  {
    loading: false,
    error: null,
  },
)

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <section class="list-layout">
    <header class="list-layout__header">
      <h1 class="list-layout__title">{{ title }}</h1>
    </header>

    <div class="list-layout__toolbar-wrap">
      <div class="list-layout__toolbar">
        <slot name="toolbar" />
      </div>

      <div class="list-layout__filters">
        <slot name="filters" />
      </div>
    </div>

    <p v-if="loading" class="list-layout__state">加载中…</p>

    <div v-else-if="error" class="list-layout__state list-layout__state--error">
      <p>{{ error }}</p>
      <button type="button" class="list-layout__retry" @click="emit('retry')">重试</button>
    </div>

    <p v-else-if="items.length === 0" class="list-layout__state">
      <slot name="empty">没有符合条件的内容</slot>
    </p>

    <div v-else class="list-layout__grid">
      <slot
        v-for="(item, index) in items"
        :key="`${item.name}-${index}`"
        name="card"
        :item="item"
        :index="index"
      >
        <ListCard v-bind="item" />
      </slot>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.list-layout {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.list-layout__header {
  display: flex;
  align-items: baseline;
  gap: $space-3;
}

.list-layout__title {
  color: $color-text-primary;
  font-family: $font-family-base;
  font-size: $font-size-2xl;
}

.list-layout__toolbar-wrap {
  position: relative;
}

.list-layout__toolbar {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.list-layout__filters {
  position: absolute;
  top: calc(100% + #{$space-2});
  left: 0;
  z-index: 20;
  width: 100%;
}

.list-layout__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: $space-3;
}

@include media-up('sm') {
  .list-layout__grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@include media-up('md') {
  .list-layout__grid {
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: $space-4;
  }
}

.list-layout__state {
  padding: $space-6 0;
  color: $color-text-secondary;
  text-align: center;
}

.list-layout__state--error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;
  color: $color-danger;
}

.list-layout__retry {
  padding: $space-2 $space-4;
  color: $color-bg-base;
  background-color: $color-accent;
  border: none;
  border-radius: $radius-full;
  cursor: pointer;
}
</style>
