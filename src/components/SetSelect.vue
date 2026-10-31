<script setup>
// 套装下拉：背包的套装筛选与新增卡片的套装选择共用
const props = defineProps({
  modelValue: { type: [Number, String], default: null },
  // /api/reliquary/list 的结果：[{ setId, name, maxRankLevel }]
  sets: { type: Array, default: () => [] },
  // 传了就多一个「不限」选项，选中时 modelValue 为 null
  allLabel: { type: String, default: '' },
  ariaLabel: { type: String, default: '按套装筛选' },
})

const emit = defineEmits(['update:modelValue'])

function pick(event) {
  const raw = event.target.value

  if (raw === '') {
    emit('update:modelValue', null)
    return
  }

  const matched = props.sets.find((set) => String(set.setId) === raw)
  emit('update:modelValue', matched ? matched.setId : raw)
}
</script>

<template>
  <select
    class="set-select"
    :value="modelValue === null ? '' : String(modelValue)"
    :aria-label="ariaLabel"
    @change="pick"
  >
    <option v-if="allLabel" value="">{{ allLabel }}</option>
    <option v-for="set in sets" :key="set.setId" :value="String(set.setId)">
      {{ set.name }}（{{ set.maxRankLevel }}★）
    </option>
  </select>
</template>

<style scoped>
.set-select {
  flex: none;
  height: 34px;
  max-width: 220px;
  padding: 0 10px;
  border: 1px solid var(--clr-white-10);
  border-radius: 9999px;
  background-color: var(--clr-white-10);
  color: var(--clr-white-80);
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 1px;
  outline: none;
  cursor: pointer;
}

.set-select:focus {
  border-color: var(--clr-white-30);
}

/* 原生下拉的列表由系统绘制，只能就近给个深色底，避免白底闪一下 */
.set-select option {
  background-color: var(--clr-gray-20);
  color: var(--clr-white);
}

@media (max-width: 768px) {
  .set-select {
    max-width: none;
    width: 100%;
    height: 32px;
    font-size: 13px;
  }
}
</style>
