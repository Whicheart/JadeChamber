<script setup lang="ts">
import { computed } from 'vue'

import { getAvatarList } from '../api/avatar'
import FilterPanel from '../components/FilterPanel.vue'
import FilterToggleButton from '../components/FilterToggleButton.vue'
import SearchInput from '../components/SearchInput.vue'
import { useResourceList } from '../composables/useResourceList'
import ListLayout from '../layouts/ListLayout.vue'
import type { AvatarBrief, AvatarListParams, FilterGroup, ListCardItem } from '../types'
import { getAvatarIcon, getGachaImage } from '../utils/avatarImage'
import { elementOptions, qualityOptions, weaponOptions } from '../utils/filterIcons'

const filterGroups: FilterGroup[] = [
  { key: 'elements', name: '元素', buttons: elementOptions },
  { key: 'weaponTypes', name: '武器', buttons: weaponOptions },
  { key: 'qualityTypes', name: '星级', buttons: qualityOptions },
]

/** 星级筛选值（4/5）映射为接口的 qualityType 枚举，5 星同时包含联动五星。 */
function toQualityTypes(values: string[]): string[] | undefined {
  if (values.length === 0) return undefined

  const types = new Set<string>()
  for (const value of values) {
    if (value === '5') {
      types.add('QUALITY_ORANGE')
      types.add('QUALITY_ORANGE_SP')
    } else if (value === '4') {
      types.add('QUALITY_PURPLE')
    }
  }

  return [...types]
}

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
} = useResourceList<AvatarBrief, AvatarListParams>({
  fetch: getAvatarList,
  buildParams: ({ name, selection: selected }) => ({
    name: name.trim() || undefined,
    elements: selected.elements?.length ? selected.elements : undefined,
    weaponTypes: selected.weaponTypes?.length ? selected.weaponTypes : undefined,
    qualityTypes: toQualityTypes(selected.qualityTypes ?? []),
  }),
  initialSelection: { elements: [], weaponTypes: [], qualityTypes: [] },
  errorMessage: '加载角色列表失败',
})

const cardItems = computed<ListCardItem[]>(() =>
  items.value.map((avatar) => ({
    name: avatar.name ?? '未知角色',
    image: getGachaImage(avatar.gachaIconName),
    mobileImage: getAvatarIcon(avatar.iconName),
    fit: 'cover',
    position: 'center 25%',
  })),
)
</script>

<template>
  <ListLayout title="角色" :items="cardItems" :loading="loading" :error="error" @retry="retry">
    <template #toolbar>
      <SearchInput
        v-model="searchText"
        class="avatar-list__search"
        placeholder="搜索角色名称"
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

.avatar-list__search {
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
