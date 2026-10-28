<script setup>
// import { ref } from 'vue'

const navList = [
  {
    id: 1,
    title: '数据库',
    buttons: [
      { id: 11, content: '角色', path: '/avatars' },
      { id: 12, content: '武器', path: '/weapons' },
      { id: 14, content: '敌对单位', path: '/' },
      { id: 16, content: '深境螺旋', path: '/' },
      { id: 17, content: '幽境危战', path: '/' },
      { id: 18, content: '幻想真境剧诗', path: '/' },
    ],
  },
  {
    id: 2,
    title: '实用功能',
    buttons: [
      { id: 21, content: '圣遗物', path: '/' },
      { id: 22, content: '公式大全', path: '/formulae' },
    ],
  },
]
</script>

<template>
  <div class="main-list-container" v-for="list in navList" :key="list.id">
    <h2>{{ list.title }}</h2>
    <div class="main-btn-container">
      <button
        class="main-btn"
        v-for="btn in list.buttons"
        :key="btn.id"
        @click="$router.push(btn.path)"
      >
        {{ btn.content }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.main-list-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}
.main-btn-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.main-btn {
  width: 200px;
  height: 40px;
  border: 0;
  border-radius: 10px;
  font-size: 16px;
  transition: 150ms;
  cursor: pointer;
}
</style>
