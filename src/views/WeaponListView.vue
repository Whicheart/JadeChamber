<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { getWeaponList } from '../api/weapon'
import FilterPanel from '../components/FilterPanel.vue'
import FilterToggleButton from '../components/FilterToggleButton.vue'
import SearchInput from '../components/SearchInput.vue'
import ListLayout from '../layouts/ListLayout.vue'
import type { FilterGroup, FilterSelection, ListCardItem, WeaponBrief } from '../types'
import { weaponOptions, weaponRankOptions } from '../utils/filterIcons'
import { getWeaponCardImage, getWeaponIcon } from '../utils/weaponImage'

const SEARCH_DEBOUNCE_MS = 300

const searchText = ref('')
const filtersOpen = ref(false)
const selection = reactive<FilterSelection>({
  weaponTypes: [],
  ranks: [],
})
const weapons = ref<WeaponBrief[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const filterGroups: FilterGroup[] = [
  { key: 'weaponTypes', name: '武器类型', buttons: weaponOptions },
  { key: 'ranks', name: '星级', buttons: weaponRankOptions },
]

const cardItems = computed<ListCardItem[]>(() =>
  weapons.value.map((weapon) => ({
    name: weapon.name ?? '未知武器',
    image: getWeaponCardImage(weapon.gachaCardName),
    mobileImage: getWeaponIcon(weapon.iconName),
    ratio: 0.5,
    fit: 'cover',
    position: 'center center',
  })),
)

let requestId = 0
let searchTimer: ReturnType<typeof setTimeout> | undefined

async function load() {
  const currentId = ++requestId
  loading.value = true
  error.value = null

  try {
    const weaponTypes = selection.weaponTypes ?? []
    const ranks = selection.ranks ?? []

    const result = await getWeaponList({
      name: searchText.value.trim() || undefined,
      weaponTypes: weaponTypes.length > 0 ? weaponTypes : undefined,
      ranks: ranks.length > 0 ? ranks.map(Number) : undefined,
    })

    if (currentId !== requestId) return
    weapons.value = result
  } catch (err) {
    if (currentId !== requestId) return
    weapons.value = []
    error.value = err instanceof Error ? err.message : '加载武器列表失败'
  } finally {
    if (currentId === requestId) loading.value = false
  }
}

function retry() {
  void load()
}

function handleSearchEnter() {
  if (searchTimer) clearTimeout(searchTimer)
  void load()
}

function handleSelectionUpdate(value: FilterSelection) {
  Object.assign(selection, value)
}

watch(searchText, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => void load(), SEARCH_DEBOUNCE_MS)
})

watch(selection, () => void load(), { deep: true })

onMounted(() => void load())

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
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
