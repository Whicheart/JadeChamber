<script setup>
// 筛选栏：展开/收起按钮 + 搜索输入框
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
  position: relative;
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 15px;
}

.filter-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border: 0 solid transparent;
  border-image-source: url('@/assets/img/UI/UI_TheatreMechanicus_EntryPage_Img4.webp');
  border-image-slice: 60 fill;
  border-image-width: 45px;
}

.filter-toggle {
  flex: none;
  width: 44px;
  height: 44px;
  margin-left: 5px;
  border: none;
  background-color: transparent;
  background-image: url('@/assets/img/UI/UI_Btn_Filter_expand.svg');
  background-size: 55%;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  transition: 150ms;
}

.filter-toggle.open {
  background-image: url('@/assets/img/UI/UI_Btn_Filter_collapse.svg');
}

.filter-input {
  flex: 1;
  min-width: 0;
  height: 44px;
  border: none;
  background-color: transparent;
  color: #333333;
  font-family: inherit;
  font-size: 16px;
  letter-spacing: 1px;
}

.filter-input::placeholder {
  color: #606060;
}

.filter-input:focus {
  outline: none;
}
</style>
