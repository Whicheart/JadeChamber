<script setup>
import { ref, computed, onMounted } from 'vue'
import * as getImgUrl from '@/utils/getImgUrl'
import request from '@/utils/request'

// 星级主题色，筛选按钮激活时用它做高亮
const STAR_COLOR = {
  5: 'rgb(255, 180, 65)',
  4: 'rgb(180, 150, 240)',
  3: 'rgb(120, 170, 235)',
  2: 'rgb(110, 200, 155)',
  1: 'rgb(170, 170, 170)',
}

// 武器类型：接口给的是 WEAPON_XXX 代码，图标复用筛选器素材
const WEAPON_TYPES = [
  { content: 'WEAPON_SWORD_ONE_HAND', iconName: 'Weapon_Sword', label: '单手剑' },
  { content: 'WEAPON_CLAYMORE', iconName: 'Weapon_Claymore', label: '双手剑' },
  { content: 'WEAPON_POLE', iconName: 'Weapon_Polearm', label: '长柄武器' },
  { content: 'WEAPON_CATALYST', iconName: 'Weapon_Catalyst', label: '法器' },
  { content: 'WEAPON_BOW', iconName: 'Weapon_Bow', label: '弓' },
]

const WEAPON_TYPE_LABEL = Object.fromEntries(WEAPON_TYPES.map((type) => [type.content, type.label]))

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
    buttons: WEAPON_TYPES.map((type, index) => ({
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

function typeLabel(code) {
  return WEAPON_TYPE_LABEL[code] || code || '—'
}

// 有图标的按钮用 CSS Mask 把单色图标当模板；文字按钮只传主题色
function filterBtnStyle(btn) {
  const style = { '--active-color': btn.color || 'var(--clr-white)' }

  if (btn.iconName) {
    const url = `url(${getImgUrl.filter(btn.iconName)})`
    style.maskImage = url
    style.WebkitMaskImage = url
  }

  return style
}

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
        v-model="weaponSearchName"
        class="filter-input"
        type="text"
        placeholder="搜索武器..."
      />
    </div>

    <!-- 可折叠的筛选条件面板（星级/武器类型） -->
    <section v-if="showFilterList" class="filter-panel">
      <div v-for="list in filter" :key="list.id" class="filter-group">
        <h3 class="filter-title">{{ list.title }}</h3>
        <div class="filter-buttons">
          <button
            v-for="btn in list.buttons"
            :key="btn.id"
            type="button"
            class="filter-btn"
            :class="{ active: btn.active, 'text-btn': !btn.iconName }"
            :aria-pressed="btn.active"
            :aria-label="btn.label || btn.iconName"
            :style="filterBtnStyle(btn)"
            @click="btn.active = !btn.active"
          >
            <template v-if="!btn.iconName">{{ btn.label }}</template>
          </button>
        </div>
      </div>
    </section>

    <!-- 武器卡片列表 -->
    <div class="list-area">
      <section v-if="failed" class="status-panel">
        <p class="status-text">武器列表加载失败</p>
        <button type="button" class="retry-btn" @click="fetchWeapons">重新加载</button>
      </section>

      <section v-else-if="loading" class="status-panel">
        <p class="status-text">正在加载武器数据...</p>
      </section>

      <section v-else-if="!filteredList.length" class="status-panel">
        <p class="status-text">没有找到匹配的武器</p>
      </section>

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
              <span class="weapon-type">{{ typeLabel(weapon.weaponType) }}</span>
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

/* 星级用文字按钮：比 mask 图标窄，需要额外的内边距与文字样式 */
.filter-btn.text-btn {
  width: auto;
  min-width: 62px;
  padding: 0 14px;
  background-color: var(--clr-white-10);
  color: var(--clr-white-60);
  font-family: inherit;
  font-size: 15px;
  letter-spacing: 1px;
}

.filter-btn.text-btn:hover {
  background-color: var(--clr-white-20);
  color: var(--clr-white);
}

.filter-btn.active {
  background-color: var(--active-color);
  box-shadow:
    0 0 6px var(--active-color),
    0 0 16px var(--active-color);
}

.filter-btn.text-btn.active {
  color: var(--clr-black);
  font-weight: bold;
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

/* ========== 窄屏（移动设备）适配 ========== */
@media (max-width: 768px) {
  #weapon-list-view {
    width: calc(100% - 24px);
    height: calc(100% - 8px);
    gap: 12px;
    margin-top: 8px;
  }

  .filter-bar {
    gap: 4px;
    padding: 5px;
    border-radius: 14px;
  }

  .filter-toggle {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background-size: 60%;
  }

  .filter-input {
    height: 40px;
    padding: 0 12px;
    font-size: 15px;
  }

  .filter-panel {
    gap: 14px;
    padding: 16px;
    border-radius: 14px;
  }

  .filter-title {
    margin-bottom: 8px;
    font-size: 14px;
    letter-spacing: 1px;
  }

  .filter-buttons {
    gap: 8px;
  }

  .filter-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .filter-btn.text-btn {
    min-width: 52px;
    padding: 0 10px;
    font-size: 14px;
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

  .status-panel {
    min-height: 200px;
  }

  .status-text {
    font-size: 15px;
  }
}
</style>
