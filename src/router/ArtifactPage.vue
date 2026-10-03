<script setup>
/* ================== 依赖引入 ================== */
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getConfig } from '@/api/getArtifactJson.js'
import axios from 'axios'

/* ================== 路由实例 ================== */
const route = useRoute()
const router = useRouter()

/* ================== 响应式状态 ================== */
const config = ref({})

/* ================== 监听器 ================== */
watch(
  () => route.params.artifactName,
  async (name) => {
    if (!name) return

    try {
      const a = await getConfig()
      // const { data } = await axios.get(`http://localhost:8080/artifact/search?setName=${name}`)
      const { data } = await axios.get(`/api/artifact/search?setName=${name}`)
      const id = data[0]?.setId
      if (!id) {
        throw new Error('后端未返回 setId')
      }
      config.value = a[id] || null
      if (!config.value) {
        console.warn(`本地配置中找不到 setId: ${id}`)
      } else {
        console.log(config.value)
      }
    } catch (e) {
      console.error(e)
      config.value = null
    }
  },
  { immediate: true },
)

/* ================== 工具函数 ================== */
function routerBack() {
  router.back()
}

function getArtifactIconUrl(item, idx) {
  console.log(item, idx)
  return new URL(`../assets/artifact/imgs/${item}/${idx}.webp`, import.meta.url).href
}
</script>

<template>
  <div id="body">
    <button id="btn_routerBack" @click="routerBack">返回</button>
    <div id="main_container">
      <div id="artifact_img_container">
        <div
          class="artifact_img_items"
          v-for="(item, index) in config.idxs"
          :key="index"
          :style="{ backgroundImage: `url(${getArtifactIconUrl(config.name, index)})` }"
        ></div>
      </div>
      <div id="artifact_effect_container">
        <div v-for="(item, key) in config.skills" :key="key">{{ key }}件套：{{ item }}</div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  font-family: '微软雅黑';
}
#body {
  position: relative;
  width: 100vw;
  height: auto;
  min-width: 800px;
  min-height: 650px;
  margin-top: 70px;
  display: flex;
  flex-direction: column;
  font-size: 50px;
  color: white;
  align-items: center;
}
#btn_routerBack {
  position: fixed;
  top: 100px;
  left: 30px;
  height: 60px;
  width: 60px;
  border: solid 1px rgba(255, 255, 255, 0.4);
  border-radius: 15px;
  background-color: transparent;
  font-size: 18px;
  color: white;
  transition: 0.15s;
  z-index: 100;
}
#btn_routerBack:hover {
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.1);
  font-size: 20px;
  font-weight: bold;
  transition: 0.15s;
}
#main_container {
  position: relative;
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 200px;
  gap: 30px;
}
#artifact_img_container {
  width: 70%;
  height: auto;
  border: solid 1px rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  box-sizing: border-box;
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 20px;
  gap: 30px;
}
.artifact_img_items {
  width: 100px;
  height: 100px;
  border: solid 1px rgba(255, 255, 255, 0.1);
  border-radius: 15px;
}
#artifact_effect_container {
  width: 70%;
  height: auto;
  border: solid 1px rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  box-sizing: border-box;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 30px;
  gap: 30px;
  font-size: 20px;
}
.artifact_img_items{
  background-position: center;
  background-size: 90px auto;
  background-repeat: no-repeat;
}
@media (pointer: coarse) {
  #artifact_img_container,
  #artifact_effect_container{
    width: 90%;
  }
}
</style>
