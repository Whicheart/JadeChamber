<script setup>
// 顶部筛选栏：展开/收起按钮 + 搜索输入框，两个列表页共用
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  open: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '搜索...',
  },
})

defineEmits(['update:modelValue', 'update:open'])
</script>

<template>
  <div class="filter-bar">
    <button
      type="button"
      class="filter-toggle"
      :class="{ open }"
      :aria-label="open ? '收起筛选条件' : '展开筛选条件'"
      :aria-expanded="open"
      @click="$emit('update:open', !open)"
    ></button>

    <input
      class="filter-input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<style scoped>
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
</style>
