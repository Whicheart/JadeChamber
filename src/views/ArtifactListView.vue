<script setup>
import { ref, onMounted } from 'vue'
import { watch } from 'vue'
import axios from 'axios'

const artifactList = ref([])
const artifactSearchName = ref('')

onMounted(async () => {
  try {
    const res = await axios.get('/api/artifact/search')
    artifactList.value = res.data
    console.log('请求成功:', artifactList.value)
  } catch (e) {
    console.error('请求失败', e)
  }
})

function getArtifactImageUrl(setName) {
  // 拦截“祭x之人”这种格式
  if (/^祭.+之人$/.test(setName)) {
    return new URL(`../assets/artifact/imgs/${setName}/5.webp`, import.meta.url).href
  }
  return new URL(`../assets/artifact/imgs/${setName}/1.webp`, import.meta.url).href
}

/* 监听器 */
watch(artifactSearchName, fetchArtifacts, {
  immediate: true,
})

/* 方法 */
async function fetchArtifacts() {
  const qs = new URLSearchParams()

  if (artifactSearchName.value) qs.append('setName', artifactSearchName.value)

  const { data } = await axios.get('/api/artifact/search?' + qs.toString())
  artifactList.value = data
}
</script>

<template>
  <div id="body">
    <div id="filter">
      <input
        class="filter-input"
        type="text"
        v-model="artifactSearchName"
        placeholder="Search..."
      />
    </div>
    <div id="cardBody">
      <button
        v-for="(artifact, index) in artifactList"
        :key="index"
        class="artifactCard"
        :style="{ backgroundImage: `url(${getArtifactImageUrl(artifact.setName)})` }"
        @click="$router.push(`/artifacts/${artifact.setName}`)"
      >
        <div class="artifact-card-name">
          {{ artifact.setName }}
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
* {
  font-family: '微软雅黑';
}
input:focus {
  outline: none;
  border: none;
}
#body {
  width: 100vw;
  height: auto;
  min-width: 800px;
  min-height: 650px;
  margin-top: 70px;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
}
#filter {
  width: 95vw;
  height: 50px;
  display: flex;
  justify-content: center;
  border: solid 1px rgba(255, 255, 255, 0.4);
  border-radius: 25px;
  align-items: center;
  margin: 20px 0px 15px 0px;
}
.filter-input {
  width: 100%;
  height: 20px;
  background-color: transparent;
  color: white;
  font-size: 16px;
  font-weight: 700;
  padding: 10px;
  border: none;
  box-sizing: border-box;
  padding-left: 20px;
}
#cardBody {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}
.artifactCard {
  position: relative;
  width: 200px;
  height: 600px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  margin: 10px;
  display: flex;
  border: 0;
  cursor: pointer;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  color: white;
  gap: 10px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  transition: all 0.2s ease-in-out;
}
.artifactCard:hover {
  transform: scale(1.01);
  border: solid 1px rgba(255, 255, 255, 0.7);
  box-shadow: 0px 0px 20px 5px rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease-in-out;
}
.artifactCard::after {
  position: absolute;
  content: '';
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.5) 25%,
    transparent 50%
  );
  pointer-events: none;
}
.artifact-card-name {
  width: 130px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  letter-spacing: 5px;
  z-index: 1;
  pointer-events: none;
  margin-bottom: 50px;
}
.artifact-card-elem-and-weap {
  position: relative;
  height: 40px;
  width: 130px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  pointer-events: none;
  z-index: 1;
}
.artifact-card-elem-and-weap::after {
  position: absolute;
  top: 5px;
  content: '';
  width: 1px;
  height: 40px;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 1) 30%,
    rgba(255, 255, 255, 1) 70%,
    rgba(255, 255, 255, 0) 100%
  );
  display: flex;
}
@media (pointer: coarse) {
  #filter {
    width: 85%;
  }
  .artifactCard {
    width: 40%;
    background-position: center 25%;
  }
}
</style>
