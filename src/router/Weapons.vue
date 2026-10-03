<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import * as getImgUrl from '@/utils/getImgUrl'
import request from '@/utils/request'

/* 响应式数据 */
const weaponList = ref([])
const weaponSearchName = ref('')
const starLvlList = ref([
  { id: 0, content: '4', active: false },
  { id: 1, content: '5', active: false },
])
const weaponTypeList = ref([
  { id: 0, content: 'sword', active: false },
  { id: 1, content: 'claymore', active: false },
  { id: 2, content: 'polearm', active: false },
  { id: 3, content: 'catalyst', active: false },
  { id: 4, content: 'bow', active: false },
])

const filter_star = computed(() => starLvlList.value.filter((b) => b.active).map((b) => b.content))
const filter_weapon = computed(() =>
  weaponTypeList.value.filter((b) => b.active).map((b) => b.content),
)

const showFilterList = ref(false)

/* 生命周期 */
onMounted(async () => {
  try {
    weaponList.value = await request.get('/weapon/simple_search')
  } catch (e) {
    console.error('请求失败', e)
  }
})

/* 监听器 */
watch([weaponSearchName, filter_weapon, filter_star], fetchWeapons, {
  immediate: true,
})

/* 方法 */
async function fetchWeapons() {
  const qs = new URLSearchParams()

  if (weaponSearchName.value) qs.append('name', weaponSearchName.value)

  filter_weapon.value.forEach((w) => qs.append('type', w))
  filter_star.value.forEach((s) => qs.append('star', s))

  const data = await request.get('/weapon/simple_search?' + qs.toString())

  console.log('查询参数', qs.toString())

  weaponList.value = data
}

function toggle(list, index) {
  list[index].active = !list[index].active
}
</script>

<template>
  <div id="body">
    <div id="filter">
      <button id="filter_btn" @click="showFilterList = !showFilterList">Filter</button>
      <input class="filter_input" type="text" v-model="weaponSearchName" placeholder="Search..." />
    </div>
    <div id="filter_list" v-if="showFilterList">
      <div class="filter_list_item_box">
        <span class="filter_list_item_box_title">STAR</span>
        <div class="filter_list_item_container">
          <button
            class="filter_list_item"
            :class="{ active: starLvl.active }"
            v-for="(starLvl, i) in starLvlList"
            :key="starLvl.id"
            @click="toggle(starLvlList, i)"
            :style="{ backgroundImage: `url(${getImgUrl.starLv(starLvl.content)})` }"
          ></button>
        </div>
      </div>
      <div class="filter_list_item_box">
        <span class="filter_list_item_box_title">TYPE</span>
        <div class="filter_list_item_container">
          <button
            class="filter_list_item"
            :class="{ active: weaponType.active }"
            v-for="(weaponType, i) in weaponTypeList"
            :key="weaponType.id"
            @click="toggle(weaponTypeList, i)"
            :style="{ backgroundImage: `url(${getImgUrl.weaponType(weaponType.content)})` }"
          >
            <!-- {{ weaponType.content }} -->
          </button>
        </div>
      </div>
    </div>
    <div id="cardBody">
      <button
        v-for="(weapon, index) in weaponList"
        :key="index"
        class="weaponCard"
        :style="{ backgroundImage: `url(${getImgUrl.weaponGacha(weapon.name)})` }"
        @click="$router.push(`/weapons/${weapon.name}`)"
        loading="lazy"
      >
        <div class="weaponCard_Name">
          {{ weapon.name }}
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
  /* justify-content: center; */
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
#filter_btn {
  position: relative;
  height: 50px;
  width: 150px;
  padding: 0;
  font-size: 20px;
  background-color: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.1s ease-in-out;
  padding-left: 8px;
}
#filter_btn:hover {
  cursor: pointer;
  color: rgba(255, 255, 255, 1);
  transition: all 0.1s ease-in-out;
}
#filter_btn::after {
  position: absolute;
  content: '';
  top: 10%;
  right: 0px;
  width: 1px;
  height: 80%;
  background: rgba(255, 255, 255, 0.4);
  z-index: -1;
}
.filter_input {
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
#filter_list {
  position: relative;
  height: 270px;
  width: 95vw;
  border: solid 1px rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  margin-bottom: 10px;
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
#filter_list::before {
  position: absolute;
  content: '';
  width: 95%;
  height: 1px;
  top: 50%;
  left: 2.5%;
  background: rgba(255, 255, 255, 0.1);
}
.filter_list_item_box {
  height: 50%;
  width: 100%;
  background: transparent;
  border-radius: 10px;
}
.filter_list_item_box_title {
  color: rgba(255, 255, 255, 0.5);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
}
.filter_list_item_container {
  height: 90%;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
}
.filter_list_item {
  width: 60px;
  height: 60px;
  background-size: 40px;
  background-position: center;
  background-repeat: no-repeat;
  mask: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5));
  background-color: transparent;
  border: solid 1px rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  /* color: rgba(255, 255, 255, 0.7); */
  color: transparent;
}
.filter_list_item:hover {
  cursor: pointer;
  mask: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7));
  background-color: rgba(255, 255, 255, 0.1);
  border: solid 1px rgba(255, 255, 255, 0.3);
  transition: all 0.1s ease-in-out;
}
.filter_list_item.active {
  cursor: pointer;
  mask: none;
  background-color: rgba(255, 255, 255, 0.1);
  border: solid 1px rgba(255, 255, 255, 0.3);
  transition: all 0.1s ease-in-out;
}
#cardBody {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}
.weaponCard {
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
  /* background-size: cover; */
  background-repeat: no-repeat;
  background-size: contain;
  transition: all 0.2s ease-in-out;
}
.weaponCard:hover {
  transform: scale(1.01);
  border: solid 1px rgba(255, 255, 255, 0.7);
  box-shadow: 0px 0px 20px 5px rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease-in-out;
}
.weaponCard::after {
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
.weaponCard_Name {
  width: 130px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  letter-spacing: 5px;
  z-index: 1;
  pointer-events: none;
  margin-bottom: 100px;
}
.weaponCard_type {
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
  /* background-color: rgba(255, 255, 255, 0.3); */
}
#weaponIco {
  width: 50px;
  height: 50px;
  margin-top: 8px;
}
@media (pointer: coarse) {
  #filter,
  #filter_list {
    width: 85%;
  }
  .weaponCard {
    width: 40%;
    background-position: center 25%;
  }
}
</style>
