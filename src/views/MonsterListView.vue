<script setup lang="ts">
import { computed } from 'vue'

import { getMonsterList } from '../api/monster'
import FilterPanel from '../components/FilterPanel.vue'
import FilterToggleButton from '../components/FilterToggleButton.vue'
import SearchInput from '../components/SearchInput.vue'
import { useResourceList } from '../composables/useResourceList'
import ListLayout from '../layouts/ListLayout.vue'
import type { FilterGroup, ListCardItem, MonsterBrief, MonsterListParams } from '../types'
import { monsterTypeOptions } from '../utils/filterIcons'
import { getMonsterIcon } from '../utils/monsterImage'

const filterGroups: FilterGroup[] = [{ key: 'types', name: '类型', buttons: monsterTypeOptions }]

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
} = useResourceList<MonsterBrief, MonsterListParams>({
  fetch: getMonsterList,
  buildParams: ({ name, selection: selected }) => ({
    name: name.trim() || undefined,
    types: selected.types?.length ? selected.types : undefined,
  }),
  initialSelection: { types: [] },
  errorMessage: '加载怪物列表失败',
})

const cardItems = computed<ListCardItem[]>(() =>
  items.value.map((monster) => ({
    name: monster.name ?? '未知怪物',
    image: getMonsterIcon(monster.iconName),
    mobileImage: getMonsterIcon(monster.iconName),
    ratio: 1,
    fit: 'cover',
    position: 'center center',
  })),
)
</script>

<template>
  <ListLayout title="敌对生物" :items="cardItems" :loading="loading" :error="error" @retry="retry">
    <template #toolbar>
      <SearchInput
        v-model="searchText"
        class="monster-list__search"
        placeholder="搜索怪物名称"
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

.monster-list__search {
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
