<script setup>
import { ref, computed, watch } from 'vue'
import FilterBar from '@/components/FilterBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import LoadState from '@/components/LoadState.vue'
import * as getImage from '@/utils/getImage'
import request from '@/utils/request'
import { WEAPON_TYPES } from '@/utils/weapon'

// 元素与品质对应的主题色，筛选按钮激活时用它做高亮
const elementColor = {
  GEO: 'rgb(251, 203, 105)',
  DENDRO: 'rgb(8, 228, 92)',
  ELECTRO: 'rgb(219, 147, 255)',
  PYRO: 'rgb(251, 155, 6)',
  HYDRO: 'rgb(53, 197, 249)',
  CRYO: 'rgb(140, 242, 254)',
  ANEMO: 'rgb(103, 253, 208)',
  QUALITY_PURPLE: 'rgb(180, 150, 240)',
  QUALITY_ORANGE: 'rgb(255, 180, 65)',
}

// 筛选条件配置表（星级、元素、武器三组，通过 active 标记是否选中）
// color 是按钮激活时的主题色，图标素材是单色 mask，靠它换色
const filter = ref([
  {
    id: 1,
    title: '星级',
    buttons: [
      {
        id: 11,
        content: 'QUALITY_PURPLE',
        iconName: 'Quality_Purple',
        color: elementColor.QUALITY_PURPLE,
        active: false,
      },
      {
        id: 12,
        content: 'QUALITY_ORANGE',
        iconName: 'Quality_Orange',
        color: elementColor.QUALITY_ORANGE,
        active: false,
      },
    ],
  },
  {
    id: 2,
    title: '元素类型',
    buttons: [
      {
        id: 21,
        content: 'PYRO',
        iconName: 'Element_Pyro',
        color: elementColor.PYRO,
        active: false,
      },
      {
        id: 22,
        content: 'HYDRO',
        iconName: 'Element_Hydro',
        color: elementColor.HYDRO,
        active: false,
      },
      {
        id: 23,
        content: 'ANEMO',
        iconName: 'Element_Anemo',
        color: elementColor.ANEMO,
        active: false,
      },
      {
        id: 24,
        content: 'ELECTRO',
        iconName: 'Element_Electro',
        color: elementColor.ELECTRO,
        active: false,
      },
      {
        id: 25,
        content: 'DENDRO',
        iconName: 'Element_Dendro',
        color: elementColor.DENDRO,
        active: false,
      },
      {
        id: 26,
        content: 'CRYO',
        iconName: 'Element_Cryo',
        color: elementColor.CRYO,
        active: false,
      },
      { id: 27, content: 'GEO', iconName: 'Element_Geo', color: elementColor.GEO, active: false },
    ],
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
    <div class="list-area">
      <LoadState v-if="failed" failed failed-text="角色列表加载失败" @retry="fetchAvatars" />

      <LoadState v-else-if="loading" loading loading-text="正在加载角色数据..." />

      <LoadState v-else-if="!avatarList.length" empty-text="没有找到匹配的角色" />

      <div v-else class="avatar-grid">
        <button
          v-for="avatar in avatarList"
          :key="avatar.id"
          type="button"
          class="avatar-card"
          :aria-label="avatar.name"
          @click="$router.push(`/avatar/${avatar.id}`)"
        >
          <img
            class="avatar-art"
            :src="getImage.avatarIcon(avatar.GachaIconName)"
            :alt="avatar.name"
            loading="lazy"
            decoding="async"
          />
        </button>
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

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

.avatar-card {
  width: 100%;
  height: 400px;
  padding: 0;
  border: 1px solid var(--clr-white-10);
  border-radius: 16px;
  background-color: var(--clr-black-80);
  cursor: pointer;
  overflow: hidden;
  transition: 200ms;
}

/* 立绘用原生 img + 懒加载：CSS 背景图不受 loading="lazy" 约束，会首屏全量下载 */
.avatar-art {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
  transform: scale(1.05);
  transition: transform 200ms;
}

.avatar-card:hover {
  border-color: var(--clr-white-30);
}

.avatar-card:hover .avatar-art {
  transform: scale(1);
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

  /* 一行三张卡片左右，卡片高度等比压到 260px */
  .avatar-grid {
    grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
    gap: 10px;
  }

  .avatar-card {
    height: 260px;
    border-radius: 12px;
  }
}
</style>
