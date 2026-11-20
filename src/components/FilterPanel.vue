<script setup>
import { uiAsset } from '@/utils/getImage'

// 筛选面板：按分组渲染按钮
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  groups: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['toggle'])
</script>

<template>
  <Transition name="filter-panel">
    <div v-if="open" class="filter-panel">
      <section v-for="group in groups" :key="group.id" class="filter-group">
        <h3 class="filter-title">{{ group.title }}</h3>

        <div class="filter-buttons">
          <button
            v-for="button in group.buttons"
            :key="button.id"
            type="button"
            class="filter-btn"
            :class="{ active: button.active }"
            :aria-label="button.label"
            :aria-pressed="button.active"
            :title="button.label"
            @click="$emit('toggle', group.id, button.id)"
          >
            <img
              class="filter-icon"
              :src="uiAsset(button.active ? button.activeIconName : button.iconName)"
              :alt="button.label"
              draggable="false"
            />
          </button>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.filter-panel {
  position: relative;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 64px 30px 64px;
}

.filter-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border: 0 solid transparent;
  border-image-source: url('@/assets/img/UI/UI_TheatreMechanicus_EntryPage_Img3.webp');
  border-image-slice: 50% 64 50% 160 fill;
  border-image-width: 50% 40px 50% 60px;
}

/* 展开 / 收起：淡入淡出 */
.filter-panel-enter-active,
.filter-panel-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.filter-panel-enter-from,
.filter-panel-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 用户关闭动效时直接显示 */
@media (prefers-reduced-motion: reduce) {
  .filter-panel-enter-active,
  .filter-panel-leave-active {
    transition: none;
  }
}

.filter-title {
  margin-bottom: 10px;
  color: #333333;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  padding: 0;
  border: none;
  background-color: transparent;
  background-image: url('@/assets/img/UI/UI_BtnBg_Filter.webp');
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  cursor: pointer;
  transition: 150ms;
}

.filter-btn.active {
  background-image: url('@/assets/img/UI/UI_BtnBg_Filter_Selected.webp');
  transform: scale(1.15);
}

.filter-btn:active {
  transform: scale(0.96);
}

.filter-btn:focus-visible {
  outline: 2px solid var(--clr-white-60);
  outline-offset: 2px;
}

.filter-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  pointer-events: none;
}

@media (max-width: 768px) {
  .filter-panel {
    padding: 20px 64px 30px 64px;
    gap: 14px;
  }

  .filter-btn {
    width: 45px;
    height: 45px;
  }

  .filter-icon {
    width: 28px;
    height: 28px;
  }
}
</style>
