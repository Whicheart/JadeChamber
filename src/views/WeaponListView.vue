<script setup>
import { ref, computed, onMounted } from 'vue'
import FilterBar from '@/components/FilterBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import LoadState from '@/components/LoadState.vue'
import MediaCard from '@/components/MediaCard.vue'
import * as getImage from '@/utils/getImage'
import request from '@/utils/request'
import { useScrollMemory } from '@/utils/useScrollMemory'
import { WEAPON_TYPES, weaponLabel } from '@/utils/weapon'

// 星级主题色，筛选按钮激活时用它做高亮
const STAR_COLOR = {
  5: 'rgb(255, 180, 65)',
  4: 'rgb(180, 150, 240)',
  3: 'rgb(120, 170, 235)',
  2: 'rgb(110, 200, 155)',
  1: 'rgb(170, 170, 170)',
}

// 星级 → 品质底图：与角色卡共用 src/assets/img/quality 那 6 张图
const QUALITY_BY_RANK = {
  5: 'QUALITY_ORANGE',
  4: 'QUALITY_PURPLE',
  3: 'QUALITY_BLUE',
  2: 'QUALITY_GREEN',
  1: 'QUALITY_GRAY',
}

const qualityArt = (weapon) => getImage.quality(QUALITY_BY_RANK[weapon?.rank] ?? 'QUALITY_GRAY')

// 桌面端用抽卡立绘，移动端用无后缀的武器图标（UI_EquipIcon_…_Gacha → UI_EquipIcon_…），
// 后者是 256 × 256 的方形线稿，正好配移动端 1 : 1 的卡面
const gachaArt = (weapon) =>
  weapon.GachaIconName ? getImage.weaponGacha(weapon.GachaIconName) : ''

const iconArt = (weapon) =>
  weapon.GachaIconName
    ? getImage.weaponIcon(String(weapon.GachaIconName).replace(/_Gacha$/, ''))
    : ''

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

// 列表区的滚动位置：KeepAlive 切走时 Vue 会把 DOM 移进隐藏容器，回来时靠它还原
const { scrollRef, onScroll } = useScrollMemory()

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
    <div ref="scrollRef" class="list-area" data-page-scroll @scroll.passive="onScroll">
      <LoadState v-if="failed" failed failed-text="武器列表加载失败" @retry="fetchWeapons" />

      <LoadState v-else-if="loading" loading loading-text="正在加载武器数据..." />

      <LoadState v-else-if="!filteredList.length" empty-text="没有找到匹配的武器" />

      <div v-else class="media-grid">
        <MediaCard
          v-for="weapon in filteredList"
          :key="weapon.id"
          :image="gachaArt(weapon)"
          :mobile-image="iconArt(weapon)"
          :quality="qualityArt(weapon)"
          :name="weapon.name"
          :label="`${weapon.name}（${weapon.rank}★ ${weaponLabel(weapon.weaponType)}）`"
          placeholder="立绘待补充"
          ratio="1 / 2.5"
          fit="contain"
          @click="$router.push(`/weapon/${weapon.id}`)"
        />
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
}
</style>
