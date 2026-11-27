<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="not-found">
    <h1 class="not-found__code">404</h1>
    <p class="not-found__text">页面不存在或已被移除。</p>
    <RouterLink class="not-found__link" to="/avatars">返回角色列表</RouterLink>
  </section>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $space-3;
  padding: $space-8 0;
  text-align: center;
}

.not-found__code {
  color: $color-accent;
  font-family: $font-family-base;
  font-size: $font-size-3xl;
}

.not-found__text {
  color: $color-text-secondary;
}

.not-found__link {
  padding: $space-2 $space-5;
  color: $color-bg-base;
  background-color: $color-accent;
  border-radius: $radius-full;

  &:hover {
    color: $color-bg-base;
    background-color: $color-accent-strong;
  }
}
</style>
