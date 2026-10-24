<script setup>
import * as getImgUrl from '@/utils/getImgUrl'

// 接收父组件传过来的 baseInfo 对象
const props = defineProps({
  stories: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})
</script>

<template>
  <div class="test">
    {{ stories }}
  </div>
</template>

<style scoped></style>
