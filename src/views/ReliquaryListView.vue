<script setup lang="ts">
import { computed } from 'vue'

import { getReliquaryList } from '../api/reliquary'
import FilterPanel from '../components/FilterPanel.vue'
import FilterToggleButton from '../components/FilterToggleButton.vue'
import SearchInput from '../components/SearchInput.vue'
import { useResourceList } from '../composables/useResourceList'
import ListLayout from '../layouts/ListLayout.vue'
import type { FilterGroup, ListCardItem, RelicSetBrief, ReliquaryListParams } from '../types'
import { relicRankOptions } from '../utils/filterIcons'
import { getRelicSetIcon } from '../utils/reliquaryImage'

const filterGroups: FilterGroup[] = [{ key: 'ranks', name: '星级', buttons: relicRankOptions }]

const {
  searchText,
  filtersOpen,
  selection,
  items,
  loading,
  error,
  retry,
  handleSearchEnter,
  handleSelectionUpdate,
} = useResourceList<RelicSetBrief, ReliquaryListParams>({
  fetch: getReliquaryList,
  buildParams: ({ name, selection: selected }) => ({
    name: name.trim() || undefined,
    ranks: selected.ranks?.length ? selected.ranks.map(Number) : undefined,
  }),
  initialSelection: { ranks: [] },
  errorMessage: '加载圣遗物列表失败',
})

const cardItems = computed<ListCardItem[]>(() =>
  items.value.map((relic) => ({
    name: relic.name ?? '未知圣遗物',
    image: getRelicSetIcon(relic.setIconName),
    mobileImage: getRelicSetIcon(relic.setIconName),
    ratio: 1,
    fit: 'cover',
    position: 'center center',
  })),
)
</script>

<template>
  <ListLayout title="圣遗物" :items="cardItems" :loading="loading" :error="error" @retry="retry">
    <template #toolbar>
      <SearchInput
        v-model="searchText"
        class="reliquary-list__search"
        placeholder="搜索圣遗物套装名称"
        @enter="handleSearchEnter"
      />
      <FilterToggleButton :expanded="filtersOpen" @toggle="filtersOpen = !filtersOpen" />
    </template>
    <template #filters>
      <Transition name="filter-panel">
        <FilterPanel
          v-if="filtersOpen"
          :model-value="selection"
          :groups="filterGroups"
          @update:model-value="handleSelectionUpdate"
        />
      </Transition>
    </template>
  </ListLayout>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.reliquary-list__search {
  flex: 1;
  min-width: 0;
}

.filter-panel-enter-active,
.filter-panel-leave-active {
  transition:
    opacity $transition-base,
    transform $transition-base;
}

.filter-panel-enter-from,
.filter-panel-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
