<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const drawerOpen = ref(false)

const navItems = [
  { label: '角色', to: '/avatars' },
  { label: '武器', to: '/weapons' },
  { label: '圣遗物', to: '/reliquaries' },
  { label: '敌对生物', to: '/monsters' },
]

watch(
  () => route.fullPath,
  () => {
    drawerOpen.value = false
  },
)

function closeDrawer() {
  drawerOpen.value = false
}
</script>

<template>
  <div class="main-layout">
    <header class="main-layout__topbar">
      <button type="button" class="main-layout__menu" @click="drawerOpen = !drawerOpen">☰</button>
      <span class="main-layout__brand">JadeChamber</span>
    </header>

    <aside id="main-sidebar" class="main-layout__sidebar" :class="{ 'is-open': drawerOpen }">
      <div class="main-layout__brand main-layout__brand--sidebar">JadeChamber</div>
      <nav class="main-layout__nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="main-layout__link"
          active-class="is-active"
          @click="closeDrawer"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <div v-if="drawerOpen" class="main-layout__overlay" @click="closeDrawer" />

    <main class="main-layout__content">
      <RouterView />
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.main-layout {
  min-height: 100vh;
}

.main-layout__topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: $space-3;
  height: 56px;
  padding: 0 $space-4;
  background-color: $color-bg-overlay;
  border-bottom: 1px solid $color-border;
  backdrop-filter: blur(8px);
}

.main-layout__menu {
  width: 40px;
  height: 40px;
  color: $color-text-primary;
  font-size: $font-size-lg;
  background: transparent;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  cursor: pointer;
}

.main-layout__brand {
  color: $color-accent;
  font-family: $font-family-base;
  font-size: $font-size-lg;
  letter-spacing: 0.08em;
}

.main-layout__brand--sidebar {
  display: none;
  padding: $space-5 $space-4;
}

.main-layout__sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 900;
  width: 240px;
  padding-top: 56px;
  background-color: $color-bg-raised;
  border-right: 1px solid $color-border;
  transform: translateX(-100%);
  transition: transform $transition-base;

  &.is-open {
    transform: translateX(0);
  }
}

.main-layout__nav {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  padding: $space-2;
}

.main-layout__link {
  padding: $space-3 $space-4;
  color: $color-text-secondary;
  border-radius: $radius-md;

  &:hover {
    color: $color-text-primary;
    background-color: $color-accent-soft;
  }

  &.is-active {
    color: $color-accent;
    background-color: $color-accent-soft;
  }
}

.main-layout__overlay {
  position: fixed;
  inset: 0;
  z-index: 800;
  background-color: rgba(0, 0, 0, 0.55);
}

.main-layout__content {
  padding: $space-4;
}

@include media-up('lg') {
  .main-layout__topbar {
    display: none;
  }

  .main-layout__sidebar {
    padding-top: 0;
    transform: none;
  }

  .main-layout__brand--sidebar {
    display: block;
  }

  .main-layout__content {
    margin-left: 240px;
    padding: $space-6;
  }

  .main-layout__overlay {
    display: none;
  }
}
</style>
