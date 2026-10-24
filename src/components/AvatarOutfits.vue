<script setup>
import * as getImgUrl from '@/utils/getImgUrl'

// 接收父组件传过来的 baseInfo 对象
const props = defineProps({
  outfits: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})
</script>

<template>
  <div class="test">
    {{ outfits }}
  </div>
</template>

<style scoped></style>
