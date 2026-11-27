<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { getAvatarList } from '../api/avatar'
import FilterPanel from '../components/FilterPanel.vue'
import FilterToggleButton from '../components/FilterToggleButton.vue'
import SearchInput from '../components/SearchInput.vue'
import ListLayout from '../layouts/ListLayout.vue'
import type { AvatarBrief, FilterGroup, FilterSelection, ListCardItem } from '../types'
import { getAvatarIcon, getGachaImage } from '../utils/avatarImage'
import { elementOptions, qualityOptions, weaponOptions } from '../utils/filterIcons'

const SEARCH_DEBOUNCE_MS = 300

const searchText = ref('')
const filtersOpen = ref(false)
const selection = reactive<FilterSelection>({
  elements: [],
  weaponTypes: [],
  qualityTypes: [],
})
const avatars = ref<AvatarBrief[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const filterGroups: FilterGroup[] = [
  { key: 'elements', name: '元素', buttons: elementOptions },
  { key: 'weaponTypes', name: '武器', buttons: weaponOptions },
  { key: 'qualityTypes', name: '星级', buttons: qualityOptions },
]

const cardItems = computed<ListCardItem[]>(() =>
  avatars.value.map((avatar) => ({
    name: avatar.name ?? '未知角色',
    image: getGachaImage(avatar.gachaIconName),
    mobileImage: getAvatarIcon(avatar.iconName),
    fit: 'cover',
    position: 'center 25%',
  })),
)

let requestId = 0
let searchTimer: ReturnType<typeof setTimeout> | undefined

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

async function load() {
  const currentId = ++requestId
  loading.value = true
  error.value = null

  try {
    const elements = selection.elements ?? []
    const weaponTypes = selection.weaponTypes ?? []
    const qualityTypes = selection.qualityTypes ?? []

    const result = await getAvatarList({
      name: searchText.value.trim() || undefined,
      elements: elements.length > 0 ? elements : undefined,
      weaponTypes: weaponTypes.length > 0 ? weaponTypes : undefined,
      qualityTypes: toQualityTypes(qualityTypes),
    })

    if (currentId !== requestId) return
    avatars.value = result
  } catch (err) {
    if (currentId !== requestId) return
    avatars.value = []
    error.value = err instanceof Error ? err.message : '加载角色列表失败'
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
