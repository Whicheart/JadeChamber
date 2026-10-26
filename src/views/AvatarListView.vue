<script setup>
import { ref, computed, watch } from 'vue'
import * as getImgUrl from '@/utils/getImgUrl'
import request from '@/utils/request'

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
const filter = ref([
  {
    id: 1,
    title: '星级',
    buttons: [
      { id: 11, content: 'QUALITY_PURPLE', iconName: 'Quality_Purple', active: false },
      { id: 12, content: 'QUALITY_ORANGE', iconName: 'Quality_Orange', active: false },
    ],
  },
  {
    id: 2,
    title: '元素类型',
    buttons: [
      { id: 21, content: 'PYRO', iconName: 'Element_Pyro', active: false },
      { id: 22, content: 'HYDRO', iconName: 'Element_Hydro', active: false },
      { id: 23, content: 'ANEMO', iconName: 'Element_Anemo', active: false },
      { id: 24, content: 'ELECTRO', iconName: 'Element_Electro', active: false },
      { id: 25, content: 'DENDRO', iconName: 'Element_Dendro', active: false },
      { id: 26, content: 'CRYO', iconName: 'Element_Cryo', active: false },
      { id: 27, content: 'GEO', iconName: 'Element_Geo', active: false },
    ],
  },
  {
    id: 3,
    title: '武器类型',
    buttons: [
      { id: 31, content: 'WEAPON_SWORD_ONE_HAND', iconName: 'Weapon_Sword', active: false },
      { id: 32, content: 'WEAPON_CLAYMORE', iconName: 'Weapon_Claymore', active: false },
      { id: 33, content: 'WEAPON_POLE', iconName: 'Weapon_Polearm', active: false },
      { id: 34, content: 'WEAPON_CATALYST', iconName: 'Weapon_Catalyst', active: false },
      { id: 35, content: 'WEAPON_BOW', iconName: 'Weapon_Bow', active: false },
    ],
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
    <!-- 顶部筛选栏：与角色详情页的面板同一套材质 -->
    <div class="filter-bar">
      <button
        type="button"
        class="filter-toggle"
        :class="{ open: showFilterList }"
        :aria-label="showFilterList ? '收起筛选条件' : '展开筛选条件'"
        :aria-expanded="showFilterList"
        @click="showFilterList = !showFilterList"
      ></button>

      <input
        v-model="avatarSearchName"
        class="filter-input"
        type="text"
        placeholder="搜索角色..."
      />
    </div>

    <!-- 可折叠的筛选条件面板（星级/元素/武器） -->
    <section v-if="showFilterList" class="filter-panel">
      <div v-for="list in filter" :key="list.id" class="filter-group">
        <h3 class="filter-title">{{ list.title }}</h3>
        <div class="filter-buttons">
          <!--
            用 CSS Mask 把单色图标当模板，改背景色即可换色；
            --active-color 把该元素/品质的主题色传给 CSS 做高亮。
          -->
          <button
            v-for="btn in list.buttons"
            :key="btn.id"
            type="button"
            class="filter-btn"
            :class="{ active: btn.active }"
            :aria-pressed="btn.active"
            :aria-label="btn.iconName"
            :style="{
              maskImage: `url(${getImgUrl.filter(btn.iconName)})`,
              WebkitMaskImage: `url(${getImgUrl.filter(btn.iconName)})`,
              '--active-color': elementColor[btn.content] || 'var(--clr-white)',
            }"
            @click="btn.active = !btn.active"
          ></button>
        </div>
      </div>
    </section>

    <!-- 角色卡片列表 -->
    <div class="list-area">
      <section v-if="failed" class="status-panel">
        <p class="status-text">角色列表加载失败</p>
        <button type="button" class="retry-btn" @click="fetchAvatars">重新加载</button>
      </section>

      <section v-else-if="loading" class="status-panel">
        <p class="status-text">正在加载角色数据...</p>
      </section>

      <section v-else-if="!avatarList.length" class="status-panel">
        <p class="status-text">没有找到匹配的角色</p>
      </section>

      <div v-else class="avatar-grid">
        <button
          v-for="avatar in avatarList"
          :key="avatar.id"
          type="button"
          class="avatar-card"
          :style="{ backgroundImage: `url(${getImgUrl.avatarIcon(avatar.GachaIconName)})` }"
          :aria-label="avatar.name"
          @click="$router.push(`/avatar/${avatar.id}`)"
        ></button>
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

/* 筛选栏：black-80 底 + white-10 细边 + 16px 圆角 */
.filter-bar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border: 1px solid var(--clr-white-10);
  border-radius: 16px;
  background-color: var(--clr-black-80);
}

.filter-toggle {
  flex: none;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background-color: var(--clr-white-10);
  background-image: url('@/assets/img/icon-filter-expand.svg');
  background-size: 55%;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  transition: 150ms;
}

.filter-toggle:hover {
  background-color: var(--clr-white-20);
}

.filter-toggle.open {
  background-image: url('@/assets/img/icon-filter-collapse.svg');
  background-color: var(--clr-white-20);
}

.filter-input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 12px;
  background-color: var(--clr-transparent);
  color: var(--clr-white);
  font-family: inherit;
  font-size: 16px;
  letter-spacing: 1px;
  transition: 150ms;
}

.filter-input::placeholder {
  color: var(--clr-white-50);
}

.filter-input:focus {
  outline: none;
  background-color: var(--clr-white-10);
}

/* 筛选面板 */
.filter-panel {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 24px;
  border: 1px solid var(--clr-white-10);
  border-radius: 16px;
  background-color: var(--clr-black-80);
}

.filter-title {
  margin-bottom: 10px;
  color: var(--clr-white-70);
  font-size: 15px;
  font-weight: normal;
  letter-spacing: 2px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn {
  width: 44px;
  height: 44px;
  border: 1px solid var(--clr-white-10);
  border-radius: 12px;
  background-color: var(--clr-white-60);
  mask-size: 80%;
  mask-position: center;
  mask-repeat: no-repeat;
  -webkit-mask-size: 80%;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  cursor: pointer;
  transition: 150ms;
}

.filter-btn.active {
  background-color: var(--active-color);
  box-shadow:
    0 0 6px var(--active-color),
    0 0 16px var(--active-color);
}

/* 列表区：面板自带内边距，这里只负责滚动与底部留白 */
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
  background-size: 105% auto;
  background-position: center 20%;
  background-repeat: no-repeat;
  cursor: pointer;
  overflow: hidden;
  transition: 200ms;
}

.avatar-card:hover {
  border-color: var(--clr-white-30);
  background-size: 100% auto;
}

/* 加载中 / 加载失败 / 空结果 */
.status-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-height: 280px;
  border: 1px dashed var(--clr-white-20);
  border-radius: 16px;
  background-color: var(--clr-white-10);
}

.status-text {
  color: var(--clr-white-50);
  font-size: 16px;
  letter-spacing: 1px;
}

.retry-btn {
  padding: 8px 22px;
  border: 1px solid var(--clr-white-20);
  border-radius: 9999px;
  background-color: var(--clr-white-10);
  color: var(--clr-white-70);
  font-family: inherit;
  font-size: 15px;
  cursor: pointer;
  transition: 150ms;
}

.retry-btn:hover {
  background-color: var(--clr-white-20);
  color: var(--clr-white);
}
</style>
