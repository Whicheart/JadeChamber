<script setup>
defineProps({
  title: { type: String, default: '功能待开发' },
  description: { type: String, default: '' },
})
</script>

<template>
  <section class="under-construction">
    <span class="tag">待开发</span>
    <h1 class="title">{{ title }}</h1>
    <p v-if="description" class="desc">{{ description }}</p>
  </section>
</template>

<style scoped>
.under-construction {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 40vh;
  padding: 40px 20px;
  text-align: center;
}
.tag {
  padding: 2px 12px;
  border-radius: 999px;
  font-size: 13px;
  line-height: 22px;
  color: #666;
  background-color: #f0f0f0;
}
.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
.desc {
  margin: 0;
  max-width: 480px;
  font-size: 14px;
  line-height: 1.7;
  color: #888;
}
</style>
