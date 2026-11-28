<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { getMonsterList } from '../api/monster'
import FilterPanel from '../components/FilterPanel.vue'
import FilterToggleButton from '../components/FilterToggleButton.vue'
import SearchInput from '../components/SearchInput.vue'
import ListLayout from '../layouts/ListLayout.vue'
import type { FilterGroup, FilterSelection, ListCardItem, MonsterBrief } from '../types'
import { monsterTypeOptions } from '../utils/filterIcons'
import { getMonsterIcon } from '../utils/monsterImage'

const SEARCH_DEBOUNCE_MS = 300

const searchText = ref('')
const filtersOpen = ref(false)
const selection = reactive<FilterSelection>({
  types: [],
})
const monsters = ref<MonsterBrief[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const filterGroups: FilterGroup[] = [{ key: 'types', name: '类型', buttons: monsterTypeOptions }]

const cardItems = computed<ListCardItem[]>(() =>
  monsters.value.map((monster) => ({
    name: monster.name ?? '未知怪物',
    image: getMonsterIcon(monster.iconName),
    mobileImage: getMonsterIcon(monster.iconName),
    ratio: 1,
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
    const types = selection.types ?? []

    const result = await getMonsterList({
      name: searchText.value.trim() || undefined,
      types: types.length > 0 ? types : undefined,
    })

    if (currentId !== requestId) return
    monsters.value = result
  } catch (err) {
    if (currentId !== requestId) return
    monsters.value = []
    error.value = err instanceof Error ? err.message : '加载怪物列表失败'
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
