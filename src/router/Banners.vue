<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'

const bannerList = ref([])

function safeParse(str) {
  if (!str || typeof str !== 'string') return []

  try {
    const cleaned = str.replace(/\\"/g, '"').replace(/}(\s*{)/g, '$1')

    return JSON.parse(cleaned)
  } catch (e) {
    console.warn('解析失败:', str, e)
    return []
  }
}

onMounted(async () => {
  try {
    // const res = await axios.get('http://localhost:8080/banner/all')
    const res = await axios.get('/api/banner/all')
    bannerList.value = res.data.map((item) => ({
      ...item,
      firstHalf: safeParse(item.firstHalf),
      secondHalf: safeParse(item.secondHalf),
    }))
  } catch (e) {
    console.error('请求失败', e)
  }
  console.log(bannerList.value)
})

function geAvatarGachaUrl(name) {
  return new URL(`../assets/character/${name}/imgs/gacha.webp`, import.meta.url).href
}
</script>

<template>
  <div id="body">
    <div v-for="b in bannerList" :key="b.version" class="banner_card">
      <div class="version">{{ b.version }}</div>
      <div class="content">
        <div class="half">
          <div class="half_title">上半</div>
          <button
            class="avatar_card"
            v-for="c in b.firstHalf"
            :key="c.name"
            @click="$router.push(`/characters/${c.name}`)"
            :style="{ backgroundImage: `url(${geAvatarGachaUrl(c.name)})` }"
          >
          </button>
        </div>
        <div class="half">
          <div class="half_title">下半</div>
          <button
            class="avatar_card"
            v-for="c in b.secondHalf"
            :key="c.name"
            @click="$router.push(`/characters/${c.name}`)"
            :style="{ backgroundImage: `url(${geAvatarGachaUrl(c.name)})` }"
          >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  font-family: '微软雅黑';
}
#body {
  width: 100vw;
  height: auto;
  min-width: 800px;
  min-height: 650px;
  margin-top: 70px;
  background-color: transparent;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}
.banner_card {
  width: 50vw;
  min-width: 700px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
  padding-top: 20px;
  padding-bottom: 20px;
  color: white;
}
.version {
  font-size: 30px;
  font-weight: bold;
  text-shadow:
    0px 0px 15px white,
    0px 0px 30px white,
    0px 0px 60px white;
}
.content {
  width: 85%;
  display: flex;
  flex-direction: row;
}
.half {
  position: relative;
  width: 50%;
  height: auto;
  min-width: 345px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-top: 55px;
  gap: 30px;
}
.half::before {
  position: absolute;
  width: 80%;
  height: 1px;
  content: '';
  top: 30px;
  background: linear-gradient(
    to left,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.8) 30%,
    rgba(255, 255, 255, 0.8) 70%,
    rgba(255, 255, 255, 0) 100%
  );
}
.half_title {
  position: absolute;
  font-size: 25px;
  top: 10px;
  background-color: black;
  padding: 0px 10px 0px 10px;
}
.avatar_card {
  width: 150px;
  height: 250px;
  border-radius: 15px;
  background-position: center 30%;
  background-size: 150px auto;
  background-repeat: no-repeat;
  border: solid 1px rgba(255, 255, 255, 0.5);
  background-color: transparent;
}
@media (pointer: coarse) {
  .half{
    gap: 10px;
  }
  .banner_card{
    width: 100%;
  }
}
</style>
