<script setup>
// import { ref, onMounted, onUnmounted } from 'vue'
import { onMounted } from 'vue'
// import axios from 'axios'
import confetti from 'canvas-confetti'

function startRisingEffect() {
  const interval = setInterval(() => {
    confetti({
      particleCount: 1,
      origin: { x: Math.random(), y: 1 }, // 从底部随机位置
      startVelocity: 5,
      gravity: -1, // 负重力向上飘
      spread: 60,
      colors: ['#FFD700', '#E6DCAA', '#FFE4B5'],
      shapes: ['circle'],
      decay: 0.9,
      flat: true,
      scalar: 0.5,
    })
  }, 500)

  // 返回 interval ID，方便外部手动停止
  return interval
}

onMounted(async () => {
  startRisingEffect()
})
</script>

<template>
  <div id="body">
    <div id="hello">
      <!-- Welcome to <img src="../assets/head_logoText.png" alt="LogoText" id="hello_pic" />！ -->
    </div>
    <div id="functionCardList">
      <button
        class="functionCard"
        id="avatarFunctionCard"
        :style="{ '--avatarBg': `url(${currentAvatarBgUrl})` }"
        @click="$router.push('/avatars')"
      >
        <!-- <p>角色图鉴</p> -->
      </button>
      <button
        class="functionCard"
        id="weaponFunctionCard"
        :style="{ '--weaponBg': `url(${currentWeaponBgUrl})` }"
        @click="$router.push('/weapons')"
      >
        <!-- <p>武器图鉴</p> -->
      </button>
      <button
        class="functionCard"
        id="artifactFunctionCard"
        :style="{ '--artifactBg': `url(${currentArtifactBgUrl})` }"
        @click="$router.push('/artifacts')"
      >
        <!-- <p>ARTIFACTS</p> -->
      </button>
      <button
        class="functionCard"
        id="bannerFunctionCard"
        :style="{ '--bannerBg': `url(${currentBannerBgUrl})` }"
        @click="$router.push('/banners')"
      >
        <!-- <p>BANNERS</p> -->
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ==========================================
   1. 全局重置与字体
   ========================================== */
* {
  font-family: '楷体';
}

@keyframes float {
  0% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    transform: translateY(0px) scale(1);
  }
}

/* ==========================================
   2. 页面主容器布局
   ========================================== */
#body {
  position: relative;
  width: 100vw;
  height: calc(100vh - 70px);
  min-width: 800px;
  min-height: 650px;
  margin-top: 70px;
  display: flex;
  flex-direction: column;
  font-size: 50px;
  color: white;
  align-items: center;
  justify-content: center;
}

#body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('@/assets/img/hpbg.png');
  /* background-size: auto 100%; */
  /* background-size: 100% auto; */
  background-position: 50% 20%;
  background-repeat: no-repeat;
  filter: blur(10px);
  z-index: -1;
}

#body::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.8) 0%,
    /* 顶部黑色 */ rgba(0, 0, 0, 0) 30%,
    /* 中间透明 */ rgba(0, 0, 0, 0) 70%,
    /* 中间透明 */ rgba(0, 0, 0, 0.8) 100% /* 底部黑色 */
  );
  z-index: -1;
  pointer-events: none;
}

/* ==========================================
   3. 标题区域
   ========================================== */
#hello {
  position: absolute;
  top: 40px;
  font-size: max(4vh, 26px);
}

#hello_pic {
  height: max(5vh, 32px);
  vertical-align: middle;
  margin: 0px 5px 4px 0px;
}

/* ==========================================
   4. 功能卡片列表容器
   ========================================== */
#functionCardList {
  width: 80%;
  height: 60%;
  /* border-radius: 20px; */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}

/* ==========================================
   5. 功能卡片基础样式（含伪元素层级）
   ========================================== */
.functionCard {
  --height: max(60vh, 390px);
  position: relative;
  height: var(--height);
  width: calc(var(--height) / 3);
  border: none;
  background-color: transparent;
  /* color: white; */
  font-size: calc(var(--height) / 15);
  /* font-weight: 700; */
  /* letter-spacing: 40px; */
  /* writing-mode: vertical-rl; */
  /* text-orientation: upright; */
  cursor: pointer;
  animation: float 5s ease-in-out infinite;
  transition: 300ms;
}

.functionCard::before {
  content: '';
  position: absolute;
  top: -4%;
  left: -10%;
  width: 120%;
  height: 108%;
  background-image: url('@/assets/img/cardborder.png');
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
}

.functionCard::after {
  content: '';
  position: absolute;
  bottom: -70px;
  left: 0;
  width: 100%;
  height: 50px;
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0;
  /* filter: blur(10px); */
  filter: none;
  transition: 300ms;
}

/* ==========================================
   6. 各卡片特定背景绑定（通过 CSS 变量注入）
   ========================================== */
#avatarFunctionCard::before {
  background-image: url('@/assets/img/AvatarLib.png');
}

#weaponFunctionCard::before {
  background-image: url('@/assets/img/WeaponLib.png');
}

#artifactFunctionCard::before {
  background-image: url('@/assets/img/ArtifactLib.png');
}

#bannerFunctionCard::before {
  /* background-image: url('@/assets/img/ArtifactLib.png'); */
}

#avatarFunctionCard::after {
  /* content: '角色图鉴'; */
  background-image: url('@/assets/img/JueSeTuJian.png');
}

#weaponFunctionCard::after {
  background-image: url('@/assets/img/WuQiTuJian.png');
}

#artifactFunctionCard::after {
  background-image: url('@/assets/img/ShengYiWuJi.png');
}

#bannerFunctionCard::after {
  background-image: url('@/assets/img/DiFangTuJian.png');
}

/* ==========================================
   7. 交互状态（悬停效果）
   ========================================== */
.functionCard:hover {
  scale: 1.05;
  animation-play-state: paused;
  transition: 300ms;
}

.functionCard:hover::after {
  opacity: 1;
  /* color: aqua; */
  /* filter: none; */
  filter: drop-shadow(0 0 2px rgb(255, 149, 0)) drop-shadow(0 0 5px rgb(255, 205, 134));
  transition: 500ms;
}

/* .functionCard:hover::before {
  filter: blur(1px);
} */

/* ==========================================
   8. 文字层级控制
   ========================================== */
p {
  position: relative;
  z-index: 1;
}

@media (pointer: coarse) {
  #body {
    width: 100vw;
    height: auto;
    margin-top: 70px;
  }
  #functionCardList {
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: auto;
    gap: 30px;
    margin-top: 15vh;
    margin-bottom: 20vh;
  }
  .functionCard {
    width: 80%;
    height: 20%;
    aspect-ratio: 2 / 1;
    writing-mode: horizontal-tb;
  }

  #avatarFunctionCard::before,
  #bannerFunctionCard::before {
    background-size: 200% auto;
    background-position: center 15%;
  }

  #weaponFunctionCard::before {
    background-size: 30% auto;
    background-position: center 15%;
  }
}
</style>
