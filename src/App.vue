<script setup>
import { forwardWheel } from '@/utils/pageScroll'

// const sidebarIsOpen = ref(false)

// 页面的滚动区只有 60vw 宽，鼠标落在两侧空白上时 wheel 事件到不了它，这里补一条通路
function onWheel(event) {
  forwardWheel(event, event.currentTarget)
}
</script>

<template>
  <main @wheel="onWheel">
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
