<script setup lang="ts">
import { computed } from 'vue'

import { getWeaponList } from '../api/weapon'
import FilterPanel from '../components/FilterPanel.vue'
import FilterToggleButton from '../components/FilterToggleButton.vue'
import SearchInput from '../components/SearchInput.vue'
import { useResourceList } from '../composables/useResourceList'
import ListLayout from '../layouts/ListLayout.vue'
import type { FilterGroup, ListCardItem, WeaponBrief, WeaponListParams } from '../types'
import { weaponOptions, weaponRankOptions } from '../utils/filterIcons'
import { getWeaponCardImage, getWeaponIcon } from '../utils/weaponImage'

const filterGroups: FilterGroup[] = [
  { key: 'weaponTypes', name: '武器类型', buttons: weaponOptions },
  { key: 'ranks', name: '星级', buttons: weaponRankOptions },
]

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
} = useResourceList<WeaponBrief, WeaponListParams>({
  fetch: getWeaponList,
  buildParams: ({ name, selection: selected }) => ({
    name: name.trim() || undefined,
    weaponTypes: selected.weaponTypes?.length ? selected.weaponTypes : undefined,
    ranks: selected.ranks?.length ? selected.ranks.map(Number) : undefined,
  }),
  initialSelection: { weaponTypes: [], ranks: [] },
  errorMessage: '加载武器列表失败',
})

const cardItems = computed<ListCardItem[]>(() =>
  items.value.map((weapon) => ({
    name: weapon.name ?? '未知武器',
    image: getWeaponCardImage(weapon.gachaCardName),
    mobileImage: getWeaponIcon(weapon.iconName),
    ratio: 0.5,
    fit: 'cover',
    position: 'center center',
  })),
)
</script>

<template>
  <ListLayout title="武器" :items="cardItems" :loading="loading" :error="error" @retry="retry">
    <template #toolbar>
      <SearchInput
        v-model="searchText"
        class="weapon-list__search"
        placeholder="搜索武器名称"
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

.weapon-list__search {
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
