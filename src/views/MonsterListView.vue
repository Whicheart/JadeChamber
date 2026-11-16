<script setup>
// 怪物图鉴：实现全在 components/ListView.vue，差异在 config/listConfigs.js 的 monster
import ListView from '@/components/ListView.vue'
import { LIST_CONFIGS } from '@/config/listConfigs'
</script>

<template>
  <ListView :config="LIST_CONFIGS.monster" />
</template>
