<script setup>
/* ================== 依赖引入 ================== */
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as getImgUrl from '@/utils/getImgUrl'
import request from '@/utils/request'

/* ================== 组件选项 ================== */
defineOptions({ Math })

/* ================== 路由实例 ================== */
const route = useRoute()
const router = useRouter()

/* ================== 响应式状态 ================== */
const highlightColorMap = {
  岩: '#FBCB69',
  草: '#08E45C',
  雷: '#DB93FF',
  火: '#FB9B06',
  水: '#35C5F9',
  冰: '#8CF2FE',
  风: '#67FDD0',
  物理: 'white',

  蒸发: '#FB9B06',
  融化: '#FB9B06',
  超载: '#F28D9F',
  超导: '#DB93FF',
  感电: '#DB93FF',
  冻结: '#8CF2FE',
  碎冰: 'white',
  扩散: '#67FDD0',
  结晶: '#FBCB69',
  燃烧: '#FB9B06',
  绽放: '#08E45C',
  超绽放: '#DB93FF',
  烈绽放: '#FB9B06',
  原激化: '#08E45C',
  蔓激化: '#08E45C',
  超激化: '#DB93FF',
  月感电: 'linear-gradient(to bottom, #DB93FF 0%, white 100%)',
  月绽放: 'linear-gradient(to bottom, #08E45C 0%, white 100%)',
  月结晶: 'linear-gradient(to bottom, #FBCB69 0%, white 100%)',
}
const highlightSpecialTextRules = [
  {
    regex: /(岩|草|雷|火|水|冰|风)元素(范围|单体|持续)?(伤害|护盾|反应|精通|加成|附着)?/g,
    replacer: (match, element) =>
      `<span style="color:${highlightColorMap[element]};font-weight:bold">${match}</span>`,
  },
  {
    regex:
      /(蒸发|融化|超载|超导|感电|冻结|碎冰|扩散|结晶|燃烧|绽放|超绽放|烈绽放|原激化|蔓激化|超激化|月感电|月绽放|月结晶)(?:反应)?/g,
    replacer: (match, reaction) =>
      `<span 
      style="
      background: ${highlightColorMap[reaction]};
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-weight: bold">${match}
      </span>`,
  },
]
const levelOrder = ['1', '20+', '40+', '50+', '60+', '70+', '80+', '90+', '100']
const config = ref({})
const base3DInfo = ref([
  { name: '基础生命值', value: [] },
  { name: '基础攻击力', value: [] },
  { name: '基础防御力', value: [] },
  { name: '', value: [] },
])
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
const baseMaterials = ref({})
let currentLvl = ref(90)
let currentLvlIdx = ref(7)
const pageSelecterItem = ref([
  { text: '基础信息', active: true },
  { text: '天赋技能', active: false },
  { text: '命之座', active: false },
])
const currentSkillLevel = ref([
  { skillType: 'a', skillLevel: 10 },
  { skillType: 'e', skillLevel: 10 },
  { skillType: 'q', skillLevel: 10 },
])

/* ================== 监听器 ================== */
watch(
  () => route.params.avatarName,
  async (avatarName) => {
    if (!avatarName) return // 防止返回页面时由KeepAlive导致的值为undefined时请求
    const data = await request.get('/avatar/search?name=' + avatarName)
    config.value = data[0]
    console.log('角色配置：', config.value)
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
    base3DInfo.value[0].value = [] // HP
    base3DInfo.value[1].value = [] // ATK
    base3DInfo.value[2].value = [] // DEF
    base3DInfo.value[3].value = [] // GROW
    // 赋值
    levelOrder.forEach((lvl) => {
      const ary = config.value.attr.details[lvl]
      base3DInfo.value[0].value.push(ary[0])
      base3DInfo.value[1].value.push(ary[1])
      base3DInfo.value[2].value.push(ary[2])
      base3DInfo.value[3].value.push(ary[3])
      base3DInfo.value[3].name = growAttrMap[config.value.growAttr.key]
    })
  }
}
function setBaseMaterials() {
  baseMaterials.value = config.value.materials
}
function changeCurrentLvl(operation) {
  const levels = [1, 20, 40, 50, 60, 70, 80, 90, 100]

  if (operation === '加') {
    if (currentLvlIdx.value < 8) {
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
function displayValue(item, idx) {
  const value = item.value[currentLvlIdx.value]
  if (idx < 3) {
    return Math.round(value)
  } else {
    return Math.round(value * 10) / 10
  }
}
function activePage(item) {
  pageSelecterItem.value.forEach((i) => {
    i.active = false
  })
  item.active = !item.active
}
function highlightSpecialText(rawText) {
  return highlightSpecialTextRules.reduce(
    (text, rule) => text.replace(rule.regex, rule.replacer),
    rawText.replace(/<[^>]+>/g, ''),
  )
}
function changeSkillLevel(skill, operation) {
  // 找
  const targetSkill = currentSkillLevel.value.find((item) => item.skillType === skill)
  if (!targetSkill) {
    console.log('Can not find the skill!')
    return
  }

  // 改
  if (operation === '加') {
    targetSkill.skillLevel++
    if (targetSkill.skillLevel >= 15) targetSkill.skillLevel = 15
  } else if (operation === '减') {
    targetSkill.skillLevel--
    if (targetSkill.skillLevel <= 1) targetSkill.skillLevel = 1
  } else console.log('Something Wrong, please check operation')
}
</script>

<template>
  <div id="body">
    <button id="btn_routerBack" @click="routerBack">返回</button>
    <div id="main_container" v-if="config.name === route.params.avatarName">
      <div id="splash_and_name">
        <div
          id="splash_container"
          :style="{ backgroundImage: `url(${getImgUrl.avatarSplash(config.name)})` }"
        >
          <h1 id="avatar_name">{{ config.name }}</h1>
        </div>
      </div>
      <div id="basic_info_and_material">
        {{ config.desc }}
        <div id="basic_info_and_material_box">
          <div id="basic_info_container">
            <div class="basic_info_box" v-for="(item, idx) in base3DInfo" :key="idx">
              <span>{{ item.name }}</span>
              {{
                idx === 3
                  ? item.name === '元素精通'
                    ? displayValue(item, idx)
                    : displayValue(item, idx) + '%'
                  : displayValue(item, idx)
              }}
            </div>
          </div>
          <div id="material_and_lvlSelect">
            <div id="material_items_container">
              <div
                class="material_items"
                v-for="(name, type) in baseMaterials"
                :key="name"
                :style="{ backgroundImage: `url(${getImgUrl.material(name, type)})` }"
              ></div>
            </div>
            <div id="lvlSelectContainer">
              {{ currentLvl }}
              <button class="lvlSelectBtn" id="lvlSelectBtn_left" @click="changeCurrentLvl('减')">
                &lt;
              </button>
              <button class="lvlSelectBtn" id="lvlSelectBtn_right" @click="changeCurrentLvl('加')">
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
      <div id="pageSelecter">
        <button
          class="pageSelecter_item"
          v-for="(item, idx) in pageSelecterItem"
          :key="idx"
          :class="{ active: item.active }"
          @click="activePage(item)"
        >
          {{ item.text }}
        </button>
      </div>
      <div class="gengduoxinxi_container" v-if="pageSelecterItem[0].active">
        角色信息
        <div class="container">
          ID
          <span>{{ config.id }}</span>
        </div>
        <div class="container">
          称号
          <span>{{ config.title }}</span>
        </div>
        <div class="container">
          命之座
          <span>{{ config.astro }}</span>
        </div>
        <div class="container">
          生日
          <span>{{ config.birth }}</span>
        </div>
        <div class="container">
          所属
          <span>{{ config.allegiance }}</span>
        </div>
        <div class="container">
          汉语CV
          <span>{{ config.cncv }}</span>
        </div>
        <div class="container">
          日语CV
          <span>{{ config.jpcv }}</span>
        </div>
      </div>
      <div class="gengduoxinxi_container" v-if="pageSelecterItem[1].active">
        <div class="talent_container container" v-for="(item, key) in config.talent" :key="key">
          <div class="talent_tittle">{{ item.name }}</div>
          <div class="talent_content" v-for="(descItem, index) in item.desc" :key="index">
            <div class="desc-line" v-html="highlightSpecialText(descItem)"></div>
          </div>

          <!-- 等级选择 -->
          <div class="container talent_lvl_selecter">
            <button class="talent_lvl_selecter_btn" @click="changeSkillLevel(key, '减')">
              &lt;
            </button>
            {{ currentSkillLevel.find((s) => s.skillType === key).skillLevel }}
            <button class="talent_lvl_selecter_btn" @click="changeSkillLevel(key, '加')">
              &gt;
            </button>
          </div>

          <div class="container talent_tables" v-for="(item, index) in item.tables" :key="index">
            {{ item.name }}
            <span>{{
              item.isSame
                ? item.values[0]
                : item.values[currentSkillLevel.find((s) => s.skillType === key).skillLevel - 1]
            }}</span>
          </div>
        </div>
        <div class="passive container" v-for="(item, index) in config.passive" :key="index">
          <div class="talent_tittle">{{ item.name }}</div>
          <div class="talent_content" v-for="(descItem, index) in item.desc" :key="index">
            <div class="desc-line" v-html="highlightSpecialText(descItem)"></div>
          </div>
        </div>
      </div>
      <div class="gengduoxinxi_container" v-if="pageSelecterItem[2].active">
        <div class="cons container" v-for="(item, index) in config.cons" :key="index">
          <div class="talent_tittle">{{ item.name }}</div>
          <div class="talent_content" v-for="(descItem, index) in item.desc" :key="index">
            <div class="desc-line" v-html="highlightSpecialText(descItem)"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else id="wrongPage">
      <span id="wrongInfo">无信息或产生错误，请在控制台中查看输出信息</span>
    </div>
  </div>
</template>

<style scoped>
* {
  font-family: '微软雅黑';
}
.container {
  border: solid 1px rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  height: 70px;
  font-size: 20px;
  display: flex;
  flex-direction: row;
  line-height: 65px;
  box-sizing: border-box;
  padding: 0px 20px 0px 20px;
  justify-content: space-between;
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
#wrongInfo {
  font-size: 30px;
}
#wrongPage {
  min-height: 650px;
  display: flex;
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
}
#splash_and_name {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
#splash_container {
  position: relative;
  width: 95%;
  height: 70vh;
  padding: 0;
  margin: 0;
  background-size: auto 100%;
  background-repeat: no-repeat;
  background-position: center;
  pointer-events: none;
}
#splash_container::before {
  position: absolute;
  content: '';
  top: 0px;
  width: 100%;
  height: 7%;
  background: linear-gradient(to bottom, black 0%, transparent 100%);
}
#splash_container::after {
  position: absolute;
  content: '';
  bottom: 0px;
  width: 100%;
  height: 7%;
  background: linear-gradient(to top, black 0%, transparent 100%);
}
#avatar_name {
  --stroke: 2px;
  --stroke-color: #000;
  --x0: var(--stroke);
  --xn: calc(-1 * var(--stroke));
  position: absolute;
  bottom: 20%;
  left: 65%;
  font-size: 40px;
  font-weight: bold;
  text-shadow:
    var(--x0) var(--x0) 0 var(--stroke-color),
    var(--xn) var(--xn) 0 var(--stroke-color),
    var(--x0) var(--xn) 0 var(--stroke-color),
    var(--xn) var(--x0) 0 var(--stroke-color);
  padding: 10px;
  padding-left: 20px;
  background-color: rgba(0, 0, 0, 0.5);
}
#avatar_name::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 10px;
  background-color: rgba(255, 255, 255, 0.9);
}
#basic_info_and_material {
  width: 70%;
  background-color: rgba(255, 255, 255, 0.05);
  border: solid 1px rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px 0px 20px 0px;
  box-sizing: border-box;
  font-size: 25px;
  text-align: center;
  margin-top: 30px;
  margin-bottom: 30px;
}
#basic_info_and_material_box {
  display: flex;
  margin: 0;
  padding: 0;
}
#basic_info_container {
  width: 45.5%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px 1.5% 0px 3%;
}
.basic_info_box {
  height: 70px;
  border: solid 1px rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 30px 0px 30px;
  font-size: 22px;
}
#material_and_lvlSelect {
  width: 45.5%;
  display: flex;
  flex-direction: column;
}
#material_items_container {
  height: 250px;
  width: 100%;
  border: solid 1px rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  text-align: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
  margin: 20px 3% 0px 1.5%;
  justify-content: center;
  align-items: center;
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
#lvlSelectContainer {
  position: relative;
  height: 70px;
  width: 100%;
  border-radius: 15px;
  border: solid 1px rgba(255, 255, 255, 0.1);
  margin: 23px 3% 0px 1.5%;
  display: flex;
  align-items: center;
  justify-content: center;
}
#lvlSelectContainer::before {
  position: absolute;
  width: 1px;
  height: 60px;
  content: '';
  background: rgba(255, 255, 255, 0.1);
  top: 5px;
  left: 70px;
}
#lvlSelectContainer::after {
  position: absolute;
  width: 1px;
  height: 60px;
  content: '';
  background: rgba(255, 255, 255, 0.1);
  top: 5px;
  right: 70px;
}
.lvlSelectBtn {
  position: absolute;
  width: 70px;
  height: 70px;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.2);
  border: 0;
  font-size: 30px;
  font-weight: bold;
  box-sizing: border-box;
  padding-bottom: 5px;
}
.lvlSelectBtn:hover {
  color: rgba(255, 255, 255, 0.8);
}
#lvlSelectBtn_left {
  left: 0;
}
#lvlSelectBtn_right {
  right: 0;
}
#pageSelecter {
  height: 40px;
  width: 70%;
  background-color: rgba(255, 255, 255, 0.05);
  border: solid 1px rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  margin-bottom: 30px;
}
.pageSelecter_item {
  font-size: 20px;
  width: calc(100% / 3);
  height: 100%;
  border-radius: 20px;
  border: 0;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.3);
  transition: 0.15s;
}
.pageSelecter_item.active {
  color: rgba(255, 255, 255, 1);
  font-size: 22px;
  font-weight: bolder;
  background-color: rgba(255, 255, 255, 0.1);
  transition: 0.15s;
}
.gengduoxinxi_container {
  width: 70%;
  background-color: rgba(255, 255, 255, 0.05);
  border: solid 1px rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-sizing: border-box;
  padding: 20px;
  font-size: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.talent_container {
  height: auto;
  display: flex;
  flex-direction: column;
  padding: 20px;
  padding-bottom: 0px;
}
.talent_tittle {
  width: 100%;
  font-size: 30px;
  font-weight: bolder;
  margin-bottom: 20px;
  text-align: center;
}
.talent_content {
  margin-bottom: 30px;
  line-height: 35px;
}
.talent_tables {
  margin-bottom: 20px;
}
.passive {
  height: auto;
  display: flex;
  flex-direction: column;
  padding: 20px;
  padding-bottom: 0px;
}
.cons {
  height: auto;
  display: flex;
  flex-direction: column;
  padding: 20px;
  padding-bottom: 0px;
}
.talent_lvl_selecter {
  position: relative;
  margin-bottom: 20px;
  padding: 0;
  color: rgba(255, 255, 255, 1);
}
.talent_lvl_selecter::before {
  position: absolute;
  height: 60px;
  width: 1px;
  top: 5px;
  left: 70px;
  content: '';
  background: rgba(255, 255, 255, 0.1);
}
.talent_lvl_selecter::after {
  position: absolute;
  height: 60px;
  width: 1px;
  top: 5px;
  right: 70px;
  content: '';
  background: rgba(255, 255, 255, 0.1);
}
.talent_lvl_selecter_btn {
  font-size: 20px;
  height: 100%;
  width: 70px;
  background-color: transparent;
  border: 0;
  color: rgba(255, 255, 255, 0.4);
  box-sizing: border-box;
  padding-bottom: 5px;
}

@media (pointer: coarse) {
  #basic_info_and_material,
  .gengduoxinxi_container,
  #pageSelecter {
    width: 90%;
  }
}
</style>
