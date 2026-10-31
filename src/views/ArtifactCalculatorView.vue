<script setup>
import { computed, ref } from 'vue'

import ArtifactInventory from '@/components/ArtifactInventory.vue'
import ArtifactPotential from '@/components/ArtifactPotential.vue'

// 侧边栏的功能入口，暂时只做选中态，后续各自接入具体页面
const NAV_ITEMS = [
  { id: 'overview', label: '综合' },
  { id: 'inventory', label: '背包' },
  { id: 'potential', label: '潜力计算' },
  { id: 'damage', label: '伤害计算' },
]

// 窄屏进来先收起侧边栏，把宽度让给内容
const collapsed = ref(window.matchMedia('(max-width: 768px)').matches)
const activeId = ref(NAV_ITEMS[0].id)

const activeLabel = computed(
  () => NAV_ITEMS.find((item) => item.id === activeId.value)?.label ?? '',
)

function toggleSidebar() {
  collapsed.value = !collapsed.value
}

function selectItem(id) {
  activeId.value = id
}
</script>

<template>
  <div id="artifact-calculator" :class="{ 'sidebar-open': !collapsed }">
    <!-- 侧边栏脱离文档流，展开时浮在内容之上，不挤占内容区宽度 -->
    <aside class="sidebar" :class="{ 'is-collapsed': collapsed }">
      <nav class="nav-list">
        <button
          v-for="item in NAV_ITEMS"
          :key="item.id"
          type="button"
          class="nav-btn"
          :class="{ active: item.id === activeId }"
          :aria-current="item.id === activeId ? 'true' : undefined"
          @click="selectItem(item.id)"
        >
          <span class="nav-icon" aria-hidden="true"></span>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- 展开/收起按钮独立在侧边栏之外，随侧栏开合在左右两侧之间移动 -->
    <button
      type="button"
      class="sidebar-toggle"
      :aria-expanded="!collapsed"
      :aria-label="collapsed ? '展开侧边栏' : '收起侧边栏'"
      @click="toggleSidebar"
    ></button>

    <!-- 内容区铺满整页，左侧留出展开按钮的位置 -->
    <section class="content">
      <ArtifactInventory v-if="activeId === 'inventory'" />

      <ArtifactPotential v-else-if="activeId === 'potential'" />

      <div v-else class="placeholder">
        <h2 class="placeholder-title">{{ activeLabel }}</h2>
        <p class="placeholder-text">该功能尚未实现，敬请期待。</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
#artifact-calculator {
  --sidebar-width: 200px;
  position: fixed;
  inset: 0;
}

/* 抽屉式侧边栏：absolute + 100vh，收起时整体挪出视口 */
.sidebar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  width: var(--sidebar-width);
  height: 100vh;
  padding: 60px 8px 16px;
  border-right: 1px solid var(--clr-white-10);
  /* 不透明纯色，避免背景图透上来把侧栏上的文字压暗 */
  background-color: var(--clr-gray-10);
  overflow-y: auto;
  transition:
    transform 200ms ease,
    border-color 200ms ease;
}

.sidebar.is-collapsed {
  transform: translateX(-100%);
  border-right-color: transparent;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 8px;
  border: none;
  border-radius: 10px;
  background-color: var(--clr-transparent);
  color: var(--clr-white-50);
  font-family: inherit;
  font-size: 15px;
  letter-spacing: 1px;
  cursor: pointer;
  transition:
    background-color 150ms,
    color 150ms;
}

.nav-btn:hover {
  background-color: var(--clr-white-10);
  color: var(--clr-white-80);
}

.nav-btn.active {
  background-color: var(--clr-white-20);
  color: var(--clr-white);
}

/* 图标区固定 1:1，暂时是占位框，素材到位后换成 <img> */
.nav-icon {
  flex: none;
  width: 28px;
  height: 28px;
  border: 1px dashed var(--clr-white-20);
  border-radius: 8px;
  background-color: var(--clr-white-10);
}

.nav-label {
  flex: 1;
  min-width: 0;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-toggle {
  position: absolute;
  top: 60px;
  left: 10px;
  z-index: 3;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  /* 不透明纯色，和侧边栏一致，避免背景图从按钮里透出来 */
  background-color: var(--clr-gray-20);
  background-image: url('@/assets/img/icon-sidebar-default.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 22px;
  cursor: pointer;
  transition:
    left 200ms ease,
    background-color 150ms;
}

/* 侧栏展开时按钮跟着挪到侧栏右缘外侧 */
#artifact-calculator.sidebar-open .sidebar-toggle {
  left: calc(var(--sidebar-width) + 10px);
}

.sidebar-toggle:hover {
  background-color: var(--clr-gray-30);
}

/* 内容区自己不再滚动，滚动的职责交给内层组件（筛选栏因此天然固定） */
.content {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 60px 24px 60px 72px;
  overflow: hidden;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: auto;
  text-align: center;
}

.placeholder-title {
  font-size: 22px;
  font-weight: normal;
  letter-spacing: 2px;
  color: var(--clr-white);
}

.placeholder-text {
  font-size: 15px;
  letter-spacing: 1px;
  color: var(--clr-white-50);
}

@media (max-width: 768px) {
  #artifact-calculator {
    --sidebar-width: 168px;
  }

  .sidebar {
    padding-top: 56px;
  }

  .sidebar-toggle {
    top: 56px;
    width: 40px;
    height: 40px;
    background-size: 20px;
  }

  .nav-btn {
    height: 40px;
    font-size: 14px;
  }

  .nav-icon {
    width: 26px;
    height: 26px;
  }

  .content {
    padding: 56px 16px 40px 62px;
  }
}
</style>
