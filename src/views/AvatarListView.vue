<script setup>
import { ref, computed, watch } from 'vue'
import FilterBar from '@/components/FilterBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import LoadState from '@/components/LoadState.vue'
import MediaCard from '@/components/MediaCard.vue'
import { ELEMENT_TYPES, elementFilterIcon } from '@/utils/element'
import { asset } from '@/utils/getImage'
import request from '@/utils/request'
import { useScrollMemory } from '@/utils/useScrollMemory'
import { WEAPON_TYPES } from '@/utils/weapon'

// 品质底图：接口的 qualityType 与 UI_QualityBg 下的文件名一一对应，未知品质退到灰底
const QUALITY_BACKGROUNDS = new Set([
  'QUALITY_BLUE',
  'QUALITY_GRAY',
  'QUALITY_GREEN',
  'QUALITY_ORANGE',
  'QUALITY_ORANGE_SP',
  'QUALITY_PURPLE',
])

const qualityArt = (avatar) => {
  const quality = String(avatar?.qualityType || '')

  return asset(QUALITY_BACKGROUNDS.has(quality) ? quality : 'QUALITY_GRAY')
}

// 星级筛选没有线稿图标，用提瓦特数字素材（UI_TeyvatNumIcon_*），四星紫、五星金
const STAR_COLORS = {
  QUALITY_PURPLE: 'rgb(180, 150, 240)',
  QUALITY_ORANGE: 'rgb(255, 180, 65)',
}

// 筛选条件配置表（星级、元素、武器三组，通过 active 标记是否选中）
// color 是按钮激活时的主题色，图标素材是单色 mask，靠它换色
const filter = ref([
  {
    id: 1,
    title: '星级',
    buttons: ['QUALITY_PURPLE', 'QUALITY_ORANGE'].map((quality, index) => ({
      id: 11 + index,
      content: quality,
      iconName: `UI_TeyvatNumIcon_${index + 4}`,
      label: `${index + 4}★`,
      color: STAR_COLORS[quality],
      active: false,
    })),
  },
  {
    id: 2,
    title: '元素类型',
    // content 就是 /api/avatar/list?elements= 接受的取值（Water / Fire / …）
    buttons: ELEMENT_TYPES.map((type, index) => ({
      id: 21 + index,
      content: type.name,
      iconName: elementFilterIcon(type.name),
      label: type.label,
      color: type.color,
      active: false,
    })),
  },
  {
    id: 3,
    title: '武器类型',
    buttons: WEAPON_TYPES.map((type, index) => ({
      id: 31 + index,
      content: type.code,
      iconName: type.iconName,
      label: type.label,
      color: 'var(--clr-white)',
      active: false,
    })),
  },
])

// 列表区的滚动位置：KeepAlive 切走时 Vue 会把 DOM 移进隐藏容器，回来时靠它还原
const { scrollRef, onScroll } = useScrollMemory()

const showFilterList = ref(false) // 控制筛选面板的展开/收起
const avatarSearchName = ref('') // 搜索框输入的名字
const avatarList = ref([]) // 最终渲染的角色列表数据
const loading = ref(true)
const failed = ref(false)

// 根据分组 ID 提取当前激活的按钮值（如 ['PYRO', 'HYDRO']）
function getActiveFilter(groupId) {
  const group = filter.value.find((g) => g.id === groupId)
  if (!group) return []
  return group.buttons.filter((b) => b.active).map((b) => b.content)
}

const filterStar = computed(() => getActiveFilter(1))
const filterElem = computed(() => getActiveFilter(2))
const filterWeapon = computed(() => getActiveFilter(3))

// 筛选面板的按钮事件：同一组内可多选
function toggleFilter(groupId, buttonId) {
  const group = filter.value.find((g) => g.id === groupId)
  const button = group?.buttons.find((b) => b.id === buttonId)
  if (button) button.active = !button.active
}

// 请求后端接口获取角色列表
async function fetchAvatars() {
  const qs = new URLSearchParams()

  if (avatarSearchName.value) qs.append('name', avatarSearchName.value)
  filterElem.value.forEach((e) => qs.append('elements', e))
  filterWeapon.value.forEach((w) => qs.append('weaponTypes', w))
  filterStar.value.forEach((s) => qs.append('qualityTypes', s))

  // 避免空参数时 URL 尾部多出一个 "?"，直接请求基础路径
  const qsStr = qs.toString()

  loading.value = true
  failed.value = false

  try {
    avatarList.value = await request.get('/api/avatar/list' + (qsStr ? '?' + qsStr : ''))
  } catch (error) {
    console.error('获取角色列表失败：', error)
    avatarList.value = []
    failed.value = true
  } finally {
    loading.value = false
  }
}

// 监听搜索框输入，做 300ms 防抖处理
let searchTimer = null
watch(avatarSearchName, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(fetchAvatars, 300)
})

// 筛选条件一旦勾选/取消就立刻重新请求；immediate 保证首次进入即拉全量
watch([filterElem, filterWeapon, filterStar], fetchAvatars, { immediate: true })
</script>

<template>
  <div id="avatar-list-view">
    <FilterBar v-model="avatarSearchName" v-model:open="showFilterList" placeholder="搜索角色..." />

    <!-- 可折叠的筛选条件面板（星级/元素/武器） -->
    <FilterPanel :open="showFilterList" :groups="filter" @toggle="toggleFilter" />

    <!-- 角色卡片列表 -->
    <div ref="scrollRef" class="list-area" data-page-scroll @scroll.passive="onScroll">
      <LoadState v-if="failed" failed failed-text="角色列表加载失败" @retry="fetchAvatars" />

      <LoadState v-else-if="loading" loading loading-text="正在加载角色数据..." />

      <LoadState v-else-if="!avatarList.length" empty-text="没有找到匹配的角色" />

      <div v-else class="media-grid">
        <MediaCard
          v-for="avatar in avatarList"
          :key="avatar.id"
          :image="asset(avatar.GachaIconName)"
          :mobile-image="asset(avatar.iconName)"
          :quality="qualityArt(avatar)"
          :name="avatar.name"
          ratio="1 / 2.5"
          @click="$router.push(`/avatar/${avatar.id}`)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
#avatar-list-view {
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

/* ========== 窄屏（移动设备）适配：60vw 的固定栏宽在手机上只剩两百多像素 ========== */
@media (max-width: 768px) {
  #avatar-list-view {
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
