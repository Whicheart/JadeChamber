<script setup>
import * as getImage from '@/utils/getImage'

// 筛选面板：按分组渲染按钮
// 有 iconName 的用筛选器图标（mask 着色），没有的当文字胶囊用
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

function buttonStyle(button) {
  const style = { '--active-color': button.color || 'var(--clr-white)' }
  if (!button.iconName) return style

  const url = `url("${getImage.filter(button.iconName)}")`
  style.maskImage = url
  style.WebkitMaskImage = url
  return style
}
</script>

<template>
  <div v-if="open" class="filter-panel">
    <section v-for="group in groups" :key="group.id" class="filter-group">
      <h3 class="filter-title">{{ group.title }}</h3>

      <div class="filter-buttons">
        <button
          v-for="button in group.buttons"
          :key="button.id"
          type="button"
          class="filter-btn"
          :class="{ active: button.active, 'text-btn': !button.iconName }"
          :style="buttonStyle(button)"
          @click="$emit('toggle', group.id, button.id)"
        >
          {{ button.iconName ? '' : button.label }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
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

@media (max-width: 768px) {
  .filter-panel {
    padding: 16px;
    gap: 14px;
  }

  .filter-btn {
    width: 40px;
    height: 40px;
  }

  .filter-btn.text-btn {
    min-width: 54px;
    padding: 0 10px;
    font-size: 14px;
  }
}
</style>
