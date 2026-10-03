<script setup>
/* ================== 依赖引入 ================== */
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as getImgUrl from '@/utils/getImgUrl'
import request from '@/utils/request'

/* ================== 路由实例 ================== */
const route = useRoute()
const router = useRouter()

/* ================== 响应式状态 ================== */
const growAttrMap = {
  hpPct: '生命值',
  atkPct: '攻击力',
  defPct: '防御力',
  mastery: '元素精通',
  cdmg: '暴击伤害',
  cpct: '暴击率',
  dmg: '元素伤害加成',
  heal: '治疗加成',
  phy: '物理伤害加成',
  recharge: '元素充能效率',
}
const levelOrder = ['1', '20+', '40+', '50+', '60+', '70+', '80+', '90']
const config = ref({})
const baseInfo = ref([
  { name: '基础攻击力', value: [] },
  { name: '', value: [] },
])
const baseMaterials = ref({})
let currentLvl = ref(90)
let currentLvlIdx = ref(7)
let currentRankLvl = ref(1)
let currentRankLvlIdx = ref(0)

/* ================== 监听器 ================== */
watch(
  () => route.params.weaponName,
  async (weaponName) => {
    if (!weaponName) return // 防止返回页面时由KeepAlive导致的值为undefined时请求
    const data = await request.get('/weapon/search?name=' + weaponName)
    config.value = data[0]
    console.log('武器配置：', config.value)
    setBaseInfo()
    setBaseMaterials()
  },
  { immediate: true },
)

/* ================== 工具函数 ================== */
function routerBack() {
  router.back()
}
function setBaseInfo() {
  if (config.value) {
    // 确保为空
    baseInfo.value[0].value = [] // ATK
    baseInfo.value[1].value = [] // GROW
    // 赋值
    levelOrder.forEach((lvl) => {
      baseInfo.value[0].value.push(config.value.attr.atk[lvl])

      baseInfo.value[1].name = growAttrMap[config.value.attr.bonusKey]
      baseInfo.value[1].value.push(config.value.attr.bonusData[lvl])
    })
  }
}
function setBaseMaterials() {
  baseMaterials.value = config.value.materials
}
function changeCurrentLvl(operation) {
  const levels = [1, 20, 40, 50, 60, 70, 80, 90]

  if (operation === '加') {
    if (currentLvlIdx.value < 7) {
      currentLvlIdx.value++
      currentLvl.value = levels[currentLvlIdx.value]
    }
  } else {
    if (currentLvlIdx.value > 0) {
      currentLvlIdx.value--
      currentLvl.value = levels[currentLvlIdx.value]
    }
  }
}
function changeCurrentRankLvl(operation) {
  const levels = [1, 2, 3, 4, 5]

  if (operation === '加') {
    if (currentRankLvlIdx.value < 4) {
      currentRankLvlIdx.value++
      currentRankLvl.value = levels[currentRankLvlIdx.value]
    }
  } else {
    if (currentRankLvlIdx.value > 0) {
      currentRankLvlIdx.value--
      currentRankLvl.value = levels[currentRankLvlIdx.value]
    }
  }
}
function displayValue(item, idx) {
  const value = item.value[currentLvlIdx.value]
  if (idx < 1) {
    return Math.round(value)
  } else {
    return Math.round(value * 10) / 10
  }
}
function formattedDesc(affixData) {
  console.log('Rank_Level_Index:', currentRankLvlIdx.value)
  if (!affixData.text) return ''

  let text = affixData.text

  Object.keys(affixData.datas).forEach((key) => {
    const values = affixData.datas[key] // 拿取各精炼级数值，建组
    const currentVal = values[currentRankLvlIdx.value] // 取当前精炼等级对应的值
    // 全局替换
    text = text.replace(
      new RegExp(`\\$\\[${key}\\]`, 'g'),
      `<span style="color: gold; font-weight: bold;">${currentVal}</span>`,
    )
  })

  return text
}
</script>

<template>
  <div id="body">
    <button id="btn_routerBack" @click="routerBack">返回</button>
    <div id="main_container">
      <div id="weapon_img_container">
        <div
          class="weapon_img"
          id="weapon_img_icon"
          :style="{ backgroundImage: `url(${getImgUrl.weaponIcon(config.name)})` }"
        >
          <div class="stat">初始</div>
        </div>
        <div
          class="weapon_img"
          id="weapon_img_awaken"
          :style="{ backgroundImage: `url(${getImgUrl.weaponAwaken(config.name)})` }"
        >
          <div class="stat">突破</div>
        </div>
      </div>
      <div id="base_info_container">
        <div id="base_info_name">{{ config.name }}</div>
        <div id="base_info_desc">{{ config.desc }}</div>
        <div id="base_info_itemId">ID:{{ config.id }}</div>
        <div class="base_info" v-for="(item, index) in baseInfo" :key="index">
          <span>{{ item.name }}</span>
          {{ displayValue(item, index) }}
        </div>
        <div class="lvl_selecter_container base_info">
          <button class="lvl_selecter_btn" @click="changeCurrentLvl('减')">&lt;</button>
          {{ currentLvl }}
          <button class="lvl_selecter_btn" @click="changeCurrentLvl('加')">&gt;</button>
        </div>
        <div id="material_container">
          <div
            class="material_items"
            v-for="(name, type) in baseMaterials"
            :key="name"
            :style="{ backgroundImage: `url(${getImgUrl.material(name, type)})` }"
          ></div>
        </div>
      </div>
      <div id="skill_container">
        <div id="skill_name">
          {{ config.affixTitle }}
        </div>
        <div id="skill_effect">
          <div class="desc-line" v-html="formattedDesc(config.affixData)"></div>
        </div>
        <div class="lvl_selecter_container base_info">
          <button class="lvl_selecter_btn" @click="changeCurrentRankLvl('减')">&lt;</button>
          {{ currentRankLvl }}
          <button class="lvl_selecter_btn" @click="changeCurrentRankLvl('加')">&gt;</button>
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
#weapon_img_container {
  width: 70%;
  height: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border: solid 1px rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  gap: 100px;
  margin-top: 30px;
  padding: 20px;
  /* padding: 100px 20px 50px 20px; */
  padding-bottom: 50px;
}
.weapon_img {
  position: relative;
  width: 256px;
  height: 256px;
  background-size: contain;
  background-color: transparent;
  background-repeat: no-repeat;
  /* background-color: #fff; */
}
.stat {
  position: absolute;
  width: 256px;
  font-size: 15px;
  bottom: -30px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 5px;
}
#base_info_container {
  width: 70%;
  height: auto;
  border: solid 1px rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
#base_info_name {
  font-size: 28px;
  text-align: center;
  font-weight: bold;
}
#base_info_desc {
  font-size: 18px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  /* font-weight: bold; */
}
#base_info_itemId {
  font-size: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}
.base_info {
  width: 100%;
  border: solid 1px rgba(255, 255, 255, 0.1);
  /* background-color: rgba(255, 255, 255, 0.05); */
  border-radius: 15px;
  font-size: 22px;
  height: 70px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0px 30px 0px 30px;
}
.lvl_selecter_container {
  position: relative;
  padding: 0;
}
.lvl_selecter_container::before {
  position: absolute;
  width: 1px;
  height: 60px;
  content: '';
  background: rgba(255, 255, 255, 0.1);
  top: 5px;
  left: 70px;
}
.lvl_selecter_container::after {
  position: absolute;
  width: 1px;
  height: 60px;
  content: '';
  background: rgba(255, 255, 255, 0.1);
  top: 5px;
  right: 70px;
}
.lvl_selecter_btn {
  width: 70px;
  height: 70px;
  font-size: 30px;
  font-weight: bold;
  background: transparent;
  color: rgba(255, 255, 255, 0.2);
  border: 0;
  padding-bottom: 5px;
}
.lvl_selecter_btn:hover {
  color: rgba(255, 255, 255, 0.8);
}
#material_container {
  width: 100%;
  height: auto;
  box-sizing: border-box;
  border: solid 1px rgba(255, 255, 255, 0.1);
  /* background-color: rgba(255, 255, 255, 0.05); */
  border-radius: 15px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 150px;
  padding: 20px;
}
.material_items {
  height: 70px;
  width: 70px;
  border: solid 1px rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  background-size: auto 70px;
  background-position: center;
  background-repeat: no-repeat;
}
#skill_container {
  width: 70%;
  height: auto;
  border: solid 1px rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
#skill_name {
  font-size: 30px;
  text-align: center;
  font-weight: bold;
}
#skill_effect {
  font-size: 20px;
  text-align: center;
  /* font-weight: bold; */
  box-sizing: border-box;
  padding: 0 50px 0 50px;
}

@media (pointer: coarse) {
  #weapon_img_container,
  #base_info_container,
  #skill_container {
    width: 90%;
  }
}
</style>
