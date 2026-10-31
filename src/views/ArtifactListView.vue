<script setup>
import { ref, computed, onMounted } from 'vue'
import FilterBar from '@/components/FilterBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import LoadState from '@/components/LoadState.vue'
import request from '@/utils/request'
import { useScrollMemory } from '@/utils/useScrollMemory'

// 星级主题色，筛选按钮激活时用它做高亮
const STAR_COLOR = {
  5: 'rgb(255, 180, 65)',
  4: 'rgb(180, 150, 240)',
  3: 'rgb(120, 170, 235)',
  2: 'rgb(110, 200, 155)',
  1: 'rgb(170, 170, 170)',
}

// 套装最高星级：接口当前只有 3 / 4 / 5 三档，多列没有对应数据的档位会变成死按钮
const RANK_OPTIONS = [5, 4, 3]

// 筛选条件配置表（只有星级一组，通过 active 标记是否选中）
// 装备品质只有 4 星/5 星的图标素材，这里统一用文字按钮
const filter = ref([
  {
    id: 1,
    title: '星级',
    buttons: RANK_OPTIONS.map((rank) => ({
      id: 10 + rank,
      content: rank,
      label: `${rank}★`,
      color: STAR_COLOR[rank],
      active: false,
    })),
  },
])

// 列表区的滚动位置：KeepAlive 切走时 Vue 会把 DOM 移进隐藏容器，回来时靠它还原
const { scrollRef, onScroll } = useScrollMemory()

const showFilterList = ref(false) // 控制筛选面板的展开/收起
const artifactSearchName = ref('') // 搜索框输入的套装名
const artifactList = ref([]) // 接口返回的全量套装
const loading = ref(true)
const failed = ref(false)

// 根据分组 ID 提取当前激活的按钮值（如 [5, 4]）
function getActiveFilter(groupId) {
  const group = filter.value.find((g) => g.id === groupId)
  if (!group) return []
  return group.buttons.filter((b) => b.active).map((b) => b.content)
}

const activeRanks = computed(() => getActiveFilter(1))

function toggleFilter(groupId, buttonId) {
  const group = filter.value.find((g) => g.id === groupId)
  const button = group?.buttons.find((b) => b.id === buttonId)
  if (button) button.active = !button.active
}

// /reliquary/list 只有 65 条且没有查询参数，一次拉全量后在前端过滤（搜索因此无需防抖）
const filteredList = computed(() => {
  const keyword = artifactSearchName.value.trim()

  return artifactList.value.filter((set) => {
    if (keyword && !set.name?.includes(keyword)) return false
    if (activeRanks.value.length && !activeRanks.value.includes(set.maxRankLevel)) return false
    return true
  })
})

// 请求后端接口获取圣遗物套装列表
async function fetchArtifacts() {
  loading.value = true
  failed.value = false

  try {
    artifactList.value = (await request.get('/api/reliquary/list')) || []
  } catch (error) {
    console.error('获取圣遗物列表失败：', error)
    artifactList.value = []
    failed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchArtifacts)
</script>

<template>
  <div id="artifact-list-view">
    <!-- 顶部筛选栏：与角色/武器板块同一套材质 -->
    <FilterBar
      v-model="artifactSearchName"
      v-model:open="showFilterList"
      placeholder="搜索圣遗物套装..."
    />

    <!-- 可折叠的筛选条件面板（星级） -->
    <FilterPanel :open="showFilterList" :groups="filter" @toggle="toggleFilter" />

    <!-- 套装卡片列表 -->
    <div ref="scrollRef" class="list-area" data-page-scroll @scroll.passive="onScroll">
      <LoadState v-if="failed" failed failed-text="圣遗物列表加载失败" @retry="fetchArtifacts" />

      <LoadState v-else-if="loading" loading loading-text="正在加载圣遗物数据..." />

      <LoadState v-else-if="!filteredList.length" empty-text="没有找到匹配的圣遗物套装" />

      <div v-else class="artifact-grid">
        <button
          v-for="set in filteredList"
          :key="set.setId"
          type="button"
          class="artifact-card"
          :aria-label="set.name"
          @click="$router.push(`/artifact/${set.setId}`)"
        >
          <!-- 圣遗物图标素材尚未入库，统一用占位框，等素材补齐后换成 <img> -->
          <span class="artifact-art">
            <span class="artifact-art-text">图标待补充</span>
          </span>

          <span class="artifact-info">
            <span class="artifact-name">{{ set.name }}</span>
            <span class="artifact-meta">
              <span class="artifact-stars" :style="{ color: STAR_COLOR[set.maxRankLevel] || '' }">
                {{ '★'.repeat(set.maxRankLevel || 0) }}
              </span>
            </span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
#artifact-list-view {
  display: flex;
  flex-direction: column;
  width: 60vw;
  /* App 的 main 有 50px 上内边距，这里补 10px 让筛选栏与顶部留白对齐 */
  height: calc(100% - 10px);
  min-height: 0;
  gap: 16px;
  margin-top: 10px;
  color: var(--clr-white);
}

/* 列表区：只负责滚动与底部留白 */
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

.artifact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.artifact-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 260px;
  padding: 12px;
  border: 1px solid var(--clr-white-10);
  border-radius: 16px;
  background-color: var(--clr-black-80);
  cursor: pointer;
  overflow: hidden;
  transition: 200ms;
}

.artifact-card:hover {
  border-color: var(--clr-white-30);
  background-color: var(--clr-black-90);
}

/* 图标占位框：与角色/武器板块的 icon-placeholder 同一套虚线框 */
.artifact-art {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--clr-white-20);
  border-radius: 12px;
  background-color: var(--clr-white-10);
}

.artifact-art-text {
  color: var(--clr-white-40);
  font-size: 13px;
  letter-spacing: 1px;
}

.artifact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 4px 2px;
  text-align: left;
}

.artifact-name {
  color: var(--clr-white);
  font-size: 16px;
  letter-spacing: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artifact-meta {
  display: flex;
  align-items: center;
  color: var(--clr-white-50);
  font-size: 13px;
}

.artifact-stars {
  letter-spacing: 1px;
}

/* ========== 窄屏（移动设备）适配 ========== */
@media (max-width: 768px) {
  #artifact-list-view {
    width: calc(100% - 24px);
    height: calc(100% - 8px);
    gap: 12px;
    margin-top: 8px;
  }

  .list-area {
    padding-bottom: 60px;
  }

  /* 一行两张卡片，卡片等比压到 200px */
  .artifact-grid {
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
    gap: 10px;
  }

  .artifact-card {
    height: 200px;
    gap: 8px;
    padding: 8px;
    border-radius: 12px;
  }

  .artifact-art {
    border-radius: 10px;
  }

  .artifact-art-text {
    font-size: 11px;
  }

  .artifact-name {
    font-size: 14px;
    letter-spacing: 0;
  }

  .artifact-meta {
    font-size: 12px;
  }
}
</style>
