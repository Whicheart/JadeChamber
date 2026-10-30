<script setup>
import { ref, computed, onMounted } from 'vue'
import FilterBar from '@/components/FilterBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import LoadState from '@/components/LoadState.vue'
import request from '@/utils/request'
import { WEAPON_TYPES, weaponLabel } from '@/utils/weapon'

// 星级主题色，筛选按钮激活时用它做高亮
const STAR_COLOR = {
  5: 'rgb(255, 180, 65)',
  4: 'rgb(180, 150, 240)',
  3: 'rgb(120, 170, 235)',
  2: 'rgb(110, 200, 155)',
  1: 'rgb(170, 170, 170)',
}

// 武器类型：接口给的是 WEAPON_XXX 代码，图标复用筛选器素材
const WEAPON_TYPE_OPTIONS = WEAPON_TYPES.map((type) => ({
  content: type.code,
  iconName: type.iconName,
  label: type.label,
}))

// 筛选条件配置表（星级、武器类型两组，通过 active 标记是否选中）
// 装备品质只有 4 星/5 星的图标素材，星级这一组统一用文字按钮，避免几种表示混在一行
const filter = ref([
  {
    id: 1,
    title: '星级',
    buttons: [5, 4, 3, 2, 1].map((star) => ({
      id: 10 + star,
      content: star,
      label: `${star}★`,
      color: STAR_COLOR[star],
      active: false,
    })),
  },
  {
    id: 2,
    title: '武器类型',
    buttons: WEAPON_TYPE_OPTIONS.map((type, index) => ({
      id: 20 + index,
      ...type,
      color: 'var(--clr-white)',
      active: false,
    })),
  },
])

const showFilterList = ref(false) // 控制筛选面板的展开/收起
const weaponSearchName = ref('') // 搜索框输入的名字
const weaponList = ref([]) // 接口返回的全量武器
const loading = ref(true)
const failed = ref(false)

// 根据分组 ID 提取当前激活的按钮值（如 ['WEAPON_BOW', 5]）
function getActiveFilter(groupId) {
  const group = filter.value.find((g) => g.id === groupId)
  if (!group) return []
  return group.buttons.filter((b) => b.active).map((b) => b.content)
}

const activeStars = computed(() => getActiveFilter(1))
const activeTypes = computed(() => getActiveFilter(2))

function toggleFilter(groupId, buttonId) {
  const group = filter.value.find((g) => g.id === groupId)
  const button = group?.buttons.find((b) => b.id === buttonId)
  if (button) button.active = !button.active
}

// /weapon/list 只支持按 name 模糊查询，星级与武器类型都被后端忽略，
// 故一次拉全量，三个条件全部在前端过滤（搜索也因此无需防抖）
const filteredList = computed(() => {
  const keyword = weaponSearchName.value.trim()

  return weaponList.value.filter((weapon) => {
    if (keyword && !weapon.name?.includes(keyword)) return false
    if (activeStars.value.length && !activeStars.value.includes(weapon.rank)) return false
    if (activeTypes.value.length && !activeTypes.value.includes(weapon.weaponType)) return false
    return true
  })
})

// 请求后端接口获取武器列表
async function fetchWeapons() {
  loading.value = true
  failed.value = false

  try {
    weaponList.value = (await request.get('/api/weapon/list')) || []
  } catch (error) {
    console.error('获取武器列表失败：', error)
    weaponList.value = []
    failed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchWeapons)
</script>

<template>
  <div id="weapon-list-view">
    <!-- 顶部筛选栏：与角色板块同一套材质 -->
    <FilterBar v-model="weaponSearchName" v-model:open="showFilterList" placeholder="搜索武器..." />

    <!-- 可折叠的筛选条件面板（星级/武器类型） -->
    <FilterPanel :open="showFilterList" :groups="filter" @toggle="toggleFilter" />

    <!-- 武器卡片列表 -->
    <div class="list-area" data-page-scroll>
      <LoadState v-if="failed" failed failed-text="武器列表加载失败" @retry="fetchWeapons" />

      <LoadState v-else-if="loading" loading loading-text="正在加载武器数据..." />

      <LoadState v-else-if="!filteredList.length" empty-text="没有找到匹配的武器" />

      <div v-else class="weapon-grid">
        <button
          v-for="weapon in filteredList"
          :key="weapon.id"
          type="button"
          class="weapon-card"
          :aria-label="weapon.name"
          @click="$router.push(`/weapon/${weapon.id}`)"
        >
          <!-- 武器立绘素材尚未入库，统一用占位框，等素材补齐后换成 <img> -->
          <span class="weapon-art">
            <span class="weapon-art-text">立绘待补充</span>
          </span>

          <span class="weapon-info">
            <span class="weapon-name">{{ weapon.name }}</span>
            <span class="weapon-meta">
              <span class="weapon-stars" :style="{ color: STAR_COLOR[weapon.rank] || '' }">
                {{ '★'.repeat(weapon.rank || 0) }}
              </span>
              <span class="weapon-type">{{ weaponLabel(weapon.weaponType) }}</span>
            </span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
#weapon-list-view {
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

.weapon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.weapon-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 300px;
  padding: 12px;
  border: 1px solid var(--clr-white-10);
  border-radius: 16px;
  background-color: var(--clr-black-80);
  cursor: pointer;
  overflow: hidden;
  transition: 200ms;
}

.weapon-card:hover {
  border-color: var(--clr-white-30);
  background-color: var(--clr-black-90);
}

/* 立绘占位框：与角色板块的 icon-placeholder 同一套虚线框 */
.weapon-art {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--clr-white-20);
  border-radius: 12px;
  background-color: var(--clr-white-10);
}

.weapon-art-text {
  color: var(--clr-white-40);
  font-size: 13px;
  letter-spacing: 1px;
}

.weapon-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 4px 2px;
  text-align: left;
}

.weapon-name {
  color: var(--clr-white);
  font-size: 16px;
  letter-spacing: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weapon-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--clr-white-50);
  font-size: 13px;
}

.weapon-stars {
  letter-spacing: 1px;
}

/* ========== 窄屏（移动设备）适配 ========== */
@media (max-width: 768px) {
  #weapon-list-view {
    width: calc(100% - 24px);
    height: calc(100% - 8px);
    gap: 12px;
    margin-top: 8px;
  }

  .list-area {
    padding-bottom: 60px;
  }

  /* 一行两张卡片，卡片等比压到 220px */
  .weapon-grid {
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
    gap: 10px;
  }

  .weapon-card {
    height: 220px;
    gap: 8px;
    padding: 8px;
    border-radius: 12px;
  }

  .weapon-art {
    border-radius: 10px;
  }

  .weapon-art-text {
    font-size: 11px;
  }

  .weapon-name {
    font-size: 14px;
    letter-spacing: 0;
  }

  .weapon-meta {
    font-size: 12px;
  }
}
</style>
