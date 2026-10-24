<script setup>
// const sidebarIsOpen = ref(false)
</script>

<template>
  <main>
    <router-view v-slot="{ Component }">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </router-view>
  </main>
</template>

<style scoped>
main {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 50px;
  overflow: hidden;
  background-color: var(--clr-black);
  color: var(--clr-white);
}
main::before {
  content: '';
  position: absolute;
  inset: -30px;
  z-index: -1;
  background-image: url('@/assets/img/background-zibai-default.png');
  background-position: center 0px;
  background-repeat: no-repeat;
  filter: blur(10px) brightness(0.4);
}
</style>
