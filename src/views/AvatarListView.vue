<script setup>
// ==========================================
// 1. 依赖引入
// ==========================================
import { ref, computed, watch } from 'vue'
import * as getImgUrl from '@/utils/getImgUrl'
import request from '@/utils/request'

// ==========================================
// 2. 常量与静态配置
// ==========================================
// 元素与品质对应的主题色映射表
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

// ==========================================
// 3. 响应式状态 (Refs)
// ==========================================
// 筛选条件配置表（包含星级、元素、武器三组，通过 active 标记是否选中）
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

const showFilterList = ref(false)    // 控制筛选面板的展开/收起
const avatarSearchName = ref('')     // 搜索框输入的名字
const avatarList = ref([])           // 最终渲染的角色列表数据

// ==========================================
// 4. 计算属性 (Computed)
// ==========================================
// 辅助函数：根据分组 ID 提取当前激活的按钮值（返回如 ['PYRO', 'HYDRO']）
function getActiveFilter(groupId) {
  const group = filter.value.find((g) => g.id === groupId)
  if (!group) return []
  return group.buttons.filter((b) => b.active).map((b) => b.content)
}

// 实时获取三大类筛选条件的选中值
const filterStar = computed(() => getActiveFilter(1))    // 星级
const filterElem = computed(() => getActiveFilter(2))    // 元素
const filterWeapon = computed(() => getActiveFilter(3))  // 武器

// ==========================================
// 5. 核心方法 (Methods)
// ==========================================
// 请求后端接口获取角色列表
async function fetchAvatars() {
  const qs = new URLSearchParams()

  // 拼装请求参数
  if (avatarSearchName.value) qs.append('name', avatarSearchName.value)
  filterElem.value.forEach((e) => qs.append('elements', e))
  filterWeapon.value.forEach((w) => qs.append('weaponTypes', w))
  filterStar.value.forEach((s) => qs.append('qualityTypes', s))

  // 避免空参数时 URL 尾部多出一个 "?"，直接请求基础路径
  const qsStr = qs.toString()
  avatarList.value = await request.get('/api/avatar/list' + (qsStr ? '?' + qsStr : ''))
}

// ==========================================
// 6. 侦听器 (Watchers)
// ==========================================
// 监听搜索框输入，做 300ms 防抖处理
let searchTimer = null
watch(avatarSearchName, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchAvatars()
  }, 300)
})

// 监听筛选条件变化，一旦勾选/取消，立刻触发请求
// immediate: true 保证组件首次加载时立刻拉取全量列表
watch([filterElem, filterWeapon, filterStar], fetchAvatars, { immediate: true })
</script>

<template>
  <!-- ==========================================
       1. 顶部搜索与筛选控制栏
  =========================================== -->
  <div id="filter">
    <!-- 筛选面板展开/收起开关 -->
    <button
      id="filter-open-btn"
      :class="{ open: showFilterList }"
      @click="showFilterList = !showFilterList"
    ></button>
    <!-- 角色名字模糊搜索框 -->
    <input
      id="filter-input"
      v-model="avatarSearchName"
      type="text"
      placeholder="搜索角色..."
    />
  </div>

  <!-- ==========================================
       2. 可折叠的筛选条件面板（星级/元素/武器）
  =========================================== -->
  <div id="filter-item-box" v-if="showFilterList">
    <div
      class="filter-type"
      v-for="list in filter"
      :key="list.id"
    >
      <h3>{{ list.title }}</h3>
      <div class="filter-buttons">
        <!-- 
          筛选按钮使用 CSS Mask (遮罩) 技术。
          这样可以通过改变背景色，让原本单色的图标变成任意指定的颜色。
          --active-color 变量用于将激活状态的颜色动态传递给 CSS。
        -->
        <button
          v-for="btn in list.buttons"
          :key="btn.id"
          class="filter-btn"
          :class="{ active: btn.active }"
          :style="{
            maskImage: `url(${getImgUrl.filter(btn.iconName)})`,
            WebkitMaskImage: `url(${getImgUrl.filter(btn.iconName)})`,
            '--active-color': elementColor[btn.content] || 'var(--clr-white)',
          }"
          @click="btn.active = !btn.active"
        ></button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       3. 角色卡片列表展示区
  =========================================== -->
  <div id="avatar-list-box">
    <!-- 角色卡片，点击跳转到对应详情页 -->
    <button
      v-for="(avatar, index) in avatarList"
      :key="index"
      class="avatar-card"
      :style="{ backgroundImage: `url(${getImgUrl.avatarIcon(avatar.GachaIconName)})` }"
      @click="$router.push(`/avatar/${avatar.id}`)"
    >
      {{ avatar.name }}
    </button>
  </div>
</template>

<style scoped>
* {
  /* 颜色 */
  --clr-border: var(--clr-white-30);
  --clr-background: var(--clr-black-90);
  --clr-color: var(--clr-white);

  /* 尺寸 */
  --wid-filter-open-btn: 50px;
  --wid-filter-input: 50vw;
  --wid-avatar-card: 160px;
  --wid-max: calc(var(--wid-filter-open-btn) + var(--wid-filter-input));

  /* 位置 */
  --pos-filter-top: 60px;
  --pos-filter-list-top: calc(var(--pos-filter-top) + 60px);

  /* 渐隐 */
  --num-avatar-list-box-gradient-stops: 20px;
}

#filter {
  position: fixed;
  top: var(--pos-filter-top);
  z-index: 100;
  display: flex;
  align-items: center;
  height: 60px;
}

#filter-open-btn {
  position: relative;
  width: var(--wid-filter-open-btn);
  height: 40px;
  background-image: url('@/assets/img/icon-filter-expand.svg');
  background-size: 60%;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--clr-background);
  border: 1px solid var(--clr-border);
  border-right: none;
  border-radius: 20px 0px 0px 20px;
  cursor: pointer;
  transition: 150ms;
}

#filter-open-btn.open {
  background-image: url('@/assets/img/icon-filter-collapse.svg');
  transition: 150ms;
}

#filter-open-btn::after {
  position: absolute;
  top: 10%;
  right: 0px;
  content: '';
  width: 1px;
  height: 80%;
  background-color: var(--clr-border);
}

#filter-input {
  width: var(--wid-filter-input);
  height: 40px;
  padding: 5px 10px;
  background-color: var(--clr-background);
  border: 1px solid var(--clr-border);
  border-left: none;
  border-radius: 0px 20px 20px 0px;
  color: var(--clr-color);
}

#filter-input:focus {
  outline: none;
}

#filter-item-box {
  position: fixed;
  top: var(--pos-filter-list-top);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: var(--wid-max);
  padding: 10px 20px 20px;
  background-color: var(--clr-background);
  border: 1px solid var(--clr-border);
  border-radius: 20px;
}

.filter-type {
  position: relative;
  letter-spacing: 0.2em;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.filter-btn {
  width: 40px;
  height: 40px;
  background-color: var(--clr-white-60);
  mask-size: 90%;
  mask-position: center;
  mask-repeat: no-repeat;
  -webkit-mask-size: 90%;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  border: 1px solid var(--clr-border);
  border-radius: 8px;
  cursor: pointer;
  transition: 150ms;
}

.filter-btn.active {
  background-color: var(--active-color);
  box-shadow:
    0 0 6px var(--active-color),
    0 0 16px var(--active-color);
  transition: 150ms;
}

#avatar-list-box {
  width: 100vw;
  height: 80vh;
  padding: 0px calc(calc(100vw - var(--wid-max)) / 2);
  padding-top: 20px;
  padding-bottom: 20px;
  overflow-y: auto;
  scrollbar-width: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--wid-avatar-card), 1fr));
  gap: 20px;
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    #000 var(--num-avatar-list-box-gradient-stops),
    #000 calc(100% - var(--num-avatar-list-box-gradient-stops)),
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0,
    #000 var(--num-avatar-list-box-gradient-stops),
    #000 calc(100% - var(--num-avatar-list-box-gradient-stops)),
    transparent 100%
  );
}

.avatar-card {
  width: var(--wid-avatar-card);
  height: 400px;
  background-color: transparent;
  background-image: none;
  background-size: 105% auto;
  background-position: center 20%;
  background-repeat: no-repeat;
  color: var(--clr-color);
  border: none;
  transition: 200ms;
}

.avatar-card:hover {
  background-size: 100% auto;
  transition: 200ms;
}
</style>