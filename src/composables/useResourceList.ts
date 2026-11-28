import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { Ref } from 'vue'

import type { FilterSelection } from '../types'

interface UseResourceListOptions<T, P> {
  /** 调用 api/ 中的列表接口 */
  fetch: (params: P) => Promise<T[]>
  /** 把搜索词与筛选值转换为接口参数 */
  buildParams: (input: { name: string; selection: FilterSelection }) => P
  /** 初始筛选值，同时决定 selection 的键 */
  initialSelection: FilterSelection
  /** 请求失败且异常没有 message 时的提示文案 */
  errorMessage: string
  /** 搜索防抖时长，默认 300ms */
  debounceMs?: number
}

export interface UseResourceListReturn<T> {
  searchText: Ref<string>
  filtersOpen: Ref<boolean>
  selection: FilterSelection
  items: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  retry: () => void
  handleSearchEnter: () => void
  handleSelectionUpdate: (value: FilterSelection) => void
}

export function useResourceList<T, P>(
  options: UseResourceListOptions<T, P>,
): UseResourceListReturn<T> {
  const { fetch, buildParams, initialSelection, errorMessage, debounceMs = 300 } = options

  const searchText = ref('')
  const filtersOpen = ref(false)
  const selection = reactive<FilterSelection>({ ...initialSelection })
  const items = ref([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref<string | null>(null)

  let requestId = 0
  let searchTimer: ReturnType<typeof setTimeout> | undefined

  async function load() {
    const currentId = ++requestId
    loading.value = true
    error.value = null

    try {
      const result = await fetch(buildParams({ name: searchText.value, selection }))

      if (currentId !== requestId) return
      items.value = result
    } catch (err) {
      if (currentId !== requestId) return
      items.value = []
      error.value = err instanceof Error ? err.message : errorMessage
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
    searchTimer = setTimeout(() => void load(), debounceMs)
  })

  watch(selection, () => void load(), { deep: true })

  onMounted(() => void load())

  onBeforeUnmount(() => {
    if (searchTimer) clearTimeout(searchTimer)
  })

  return {
    searchText,
    filtersOpen,
    selection,
    items,
    loading,
    error,
    retry,
    handleSearchEnter,
    handleSelectionUpdate,
  }
}
