<script setup>
import LogoTextSrc from '@/assets/img/logo_text.png'

/* 与 index.html 的 favicon 共用 public 下的同一份资源，避免重复维护 */
const LogoSrc = '/logo_pic.png'

const headBtnTexts = {
  角色图鉴: 'avatars',
  武器图鉴: 'weapons',
  公式大全: 'formulae',
}
</script>

<template>
  <div id="head">
    <div @click="$router.push('/')">
      <img id="head-logo" :src="LogoSrc" alt="head logo" />
      <img id="head-logo-text" :src="LogoTextSrc" alt="head logo text" />
    </div>
    <button
      v-for="(value, key) in headBtnTexts"
      :key="key"
      class="head-btn"
      @click="$router.push('/' + value)"
    >
      {{ key }}
    </button>
  </div>
  <router-view v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>

<style scoped>
* {
  font-family: '楷体';
}

/* Head 容器 */
#head {
  position: fixed;
  width: 100vw;
  height: 90px;
  min-width: 800px;
  top: 0;
  left: 0;
  background-color: rgb(20, 12, 0);
  background-image: url('@/assets/img/Untitled.png');
  background-size: 3%;
  display: flex;
  align-items: center;
  gap: 20px;
  padding-left: clamp(230px, 20vw, 350px);
  box-sizing: border-box;
}

/* Head 下边线 */
#head::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 10px;
  mask-image: url('@/assets/img/under_line.png');
  mask-repeat: repeat-x;
  mask-size: auto 100%;
  background: linear-gradient(
    to right,
    rgba(230, 220, 170, 0.1) -15%,
    rgba(230, 220, 170, 1) 20%,
    rgba(230, 220, 170, 1) 80%,
    rgba(230, 220, 170, 0.1) 115%
  );
}

#head::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0) 70%,
      rgba(0, 0, 0, 0.8) 100%
    ),
    linear-gradient(
      to left,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.5) 30%,
      rgba(0, 0, 0, 0.9) 50%,
      rgba(0, 0, 0, 1) 100%
    );
  z-index: -1;
  pointer-events: none;
}

/* Head Logo 图标 */
#head-logo {
  position: absolute;
  top: 5px;
  left: 20px;
  width: 80px;
  height: 80px;
}

/* Head Logo 文字 */
#head-logo-text {
  position: absolute;
  top: 25px;
  left: 100px;
  width: auto;
  height: 40px;
}

/* Head 按钮 */
.head-btn {
  width: auto;
  height: 40px;
  padding: 0 20px 0 20px;
  border: 0;
  border-radius: 10px;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
  letter-spacing: 1px;
  transition: 350ms;
}
.head-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 1);
  border: 0;
  cursor: pointer;
  transition: 200ms;
}
.head-btn:focus {
  background-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 1);
  border: 0;
  transition: 100ms;
}
#login-btn {
  position: absolute;
  right: 30px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
  border: solid 0.5px rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  transition: 100ms;
}
#login-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 1);
  border: solid 0.5px rgba(255, 255, 255, 0.4);
  transition: 100ms;
}
</style>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: black;
}
/* 隐藏整个页面的右侧滚动条，但保留滚动功能 */
html {
  overflow-y: scroll; /* 先强制出现滚动区域，防止跳动 */
  scrollbar-width: none; /* Firefox */
}
html::-webkit-scrollbar {
  width: 0 !important; /* Chrome/Edge/Safari */
}
</style>

<style>
@media (pointer: coarse) {
  body {
    zoom: 0.5;
    min-width: 0;
    min-height: 0;
  }
  #head {
    height: 90px;
  }
}
</style>
