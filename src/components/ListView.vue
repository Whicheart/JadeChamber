<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import FilterBar from '@/components/FilterBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import LoadState from '@/components/LoadState.vue'
import MediaCard from '@/components/MediaCard.vue'
import { asset } from '@/utils/getImage'
import request from '@/utils/request'
import { useScrollMemory } from '@/utils/useScrollMemory'

/**
 * 列表页的通用实现：所有与具体实体无关的机制都在这里
 *
 * 全部来自 src/config/listConfigs.js
 */
const props = defineProps({
  config: { type: Object, required: true },
})

const SEARCH_PARAM = 'name'
const DEBOUNCE_MS = 400

const router = useRouter()

// 列表滚动还原
const { scrollRef, onScroll } = useScrollMemory()

// 配置里的按钮是纯声明，勾选状态由这里补——每个页面实例各一份
function createGroups() {
  return props.config.groups().map((group) => ({
    ...group,
    buttons: group.buttons.map((button) => ({ ...button, active: false })),
  }))
}

const keyword = ref('') // 搜索框输入
const searchOpen = ref(false) // 筛选面板展开/收起
const groups = ref(createGroups()) // 筛选组
const items = ref([]) // 接口返回的数据
const loading = ref(true)
const failed = ref(false)

// 某组当前筛选的值
function activeValues(group) {
  return group.buttons.filter((button) => button.active).map((button) => button.id)
}

// 组内是否为多选由配置声明；单选时先清掉同组其它按钮
function toggle(groupId, buttonId) {
  const group = groups.value.find((item) => item.id === groupId)
  const button = group?.buttons.find((item) => item.id === buttonId)
  if (!group || !button) return

  const next = !button.active
  if (next && !group.multiple) group.buttons.forEach((item) => (item.active = false))
  button.active = next
}

// 搜索词与各组筛选值拼成查询参数
function buildQuery() {
  const qs = new URLSearchParams()

  if (keyword.value) qs.append(SEARCH_PARAM, keyword.value)

  for (const group of groups.value) {
    if (!group.param) continue
    for (const value of activeValues(group)) qs.append(group.param, value)
  }

  return qs.toString()
}

// 请求序号，避免旧结果覆盖
let requestId = 0

async function load() {
  const currentId = ++requestId
  loading.value = true
  failed.value = false

  try {
    const qs = buildQuery()
    const url = qs ? `${props.config.endpoint}?${qs}` : props.config.endpoint
    const list = (await request.get(url)) || []
    if (currentId !== requestId) return
    items.value = list
  } catch (error) {
    if (currentId !== requestId) return
    console.error(`${props.config.text.failed}：`, error)
    items.value = []
    failed.value = true
  } finally {
    if (currentId === requestId) loading.value = false
  }
}

// 卡片字段：配置里写字段名就直接取，写函数就用函数的返回值
function read(item, field) {
  if (typeof field === 'function') return field(item)

  return field ? (item?.[field] ?? '') : ''
}

const toUrl = (iconName) => (iconName ? asset(iconName) : '')

// 接口数据 -> 卡片
const cards = computed(() =>
  items.value.map((item) => {
    const { fields, card = {} } = props.config

    return {
      key: read(item, fields.key),
      imageUrl: toUrl(read(item, fields.image)),
      mobileImageUrl: toUrl(read(item, fields.mobileImage)),
      qualityUrl: toUrl(read(item, fields.quality)),
      name: read(item, fields.name),
      label: read(item, fields.label),
      placeholder: props.config.text.noImage,
      ratio: card.ratio ?? '1 / 2.5',
      fit: card.fit ?? 'cover',
      to: props.config.to(item),
    }
  }),
)

// 搜索防抖
let timer = null

function scheduleLoad() {
  clearTimeout(timer)
  timer = setTimeout(load, DEBOUNCE_MS)
}

watch(keyword, scheduleLoad)

// 筛选
watch(
  () => groups.value.map((group) => group.buttons.map((button) => button.active).join('')),
  load,
  { immediate: true },
)

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="list-view">
    <div class="filter-dock">
      <FilterBar v-model="keyword" v-model:open="searchOpen" :placeholder="config.text.search" />

      <FilterPanel :open="searchOpen" :groups="groups" @toggle="toggle" />
    </div>

    <div ref="scrollRef" class="list-area" data-page-scroll @scroll.passive="onScroll">
      <LoadState v-if="failed" failed :failed-text="config.text.failed" @retry="load" />

      <LoadState v-else-if="loading" loading :loading-text="config.text.loading" />

      <LoadState v-else-if="!cards.length" :empty-text="config.text.empty" />

      <div v-else class="media-grid">
        <MediaCard
          v-for="card in cards"
          :key="card.key"
          :image="card.imageUrl"
          :mobile-image="card.mobileImageUrl"
          :quality="card.qualityUrl"
          :name="card.name"
          :label="card.label"
          :placeholder="card.placeholder"
          :ratio="card.ratio"
          :fit="card.fit"
          @click="router.push(card.to)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-view {
  display: flex;
  flex-direction: column;
  /* 视口越窄，两侧留白越小，宽度由 80vw 逐步长到 calc(100% - 24px)：
     1440px 及更宽 → 留白 10vw（宽度 80vw）；
     768px → 留白 12px（宽度 calc(100% - 24px)）；
     两者之间按直线插值。 */
  --side-gap: clamp(12px, calc(19.64vw - 138.9px), 10vw);
  width: calc(100% - 2 * var(--side-gap));
  height: calc(100% - 10px);
  min-height: 0;
  gap: 16px;
  margin-top: 10px;
  color: var(--clr-white);
}

/* 筛选面板定位 */
.filter-dock {
  position: relative;
  flex: none;
}

/* 面板脱流 */
.filter-dock :deep(.filter-panel) {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  left: 0;
  z-index: 5;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* 列表区 */
.list-area {
  flex: 1;
  min-height: 0;
  padding-bottom: 80px;
  overflow-y: auto;
  scrollbar-width: none;
}

.list-area::-webkit-scrollbar {
  display: none;
}

/* ========== 窄屏适配 ========== */
@media (max-width: 768px) {
  .list-view {
    /* 宽度由 --side-gap 接管 */
    height: calc(100% - 8px);
    gap: 12px;
    margin-top: 8px;
  }

  .list-area {
    padding-bottom: 60px;
  }
}
</style>
