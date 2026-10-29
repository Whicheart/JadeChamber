<script setup>
// 列表 / 详情页统一的加载中、加载失败、空数据提示
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  failed: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: '正在加载...',
  },
  failedText: {
    type: String,
    default: '数据加载失败',
  },
  emptyText: {
    type: String,
    default: '暂无数据',
  },
})

defineEmits(['retry'])
</script>

<template>
  <section class="status-panel">
    <template v-if="failed">
      <p class="status-text">{{ failedText }}</p>
      <button type="button" class="retry-btn" @click="$emit('retry')">重新加载</button>
    </template>

    <p v-else-if="loading" class="status-text">{{ loadingText }}</p>

    <p v-else class="status-text">{{ emptyText }}</p>
  </section>
</template>

<style scoped>
.status-panel {
  flex: none;
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

@media (max-width: 768px) {
  .status-panel {
    min-height: 200px;
  }

  .status-text {
    font-size: 15px;
  }
}
</style>
