<script setup>
import { ref, onMounted, watch, computed, onActivated, onDeactivated } from 'vue'
import * as getImgUrl from '@/utils/getImgUrl'
import request from '@/utils/request'

const avatarList = ref([])
const avatarSearchName = ref('')
const starLvlList = ref([
  { id: 0, content: 4, active: false },
  { id: 1, content: 5, active: false },
])
const elementList = ref([
  { id: 0, content: 'pyro', active: false },
  { id: 1, content: 'hydro', active: false },
  { id: 2, content: 'anemo', active: false },
  { id: 3, content: 'electro', active: false },
  { id: 4, content: 'dendro', active: false },
  { id: 5, content: 'cryo', active: false },
  { id: 6, content: 'geo', active: false },
])
const weaponTypeList = ref([
  { id: 0, content: 'sword', active: false },
  { id: 1, content: 'claymore', active: false },
  { id: 2, content: 'polearm', active: false },
  { id: 3, content: 'catalyst', active: false },
  { id: 4, content: 'bow', active: false },
])

const filterStar = computed(() => starLvlList.value.filter((b) => b.active).map((b) => b.content))
const filterElem = computed(() => elementList.value.filter((b) => b.active).map((b) => b.content))
const filterWeapon = computed(() =>
  weaponTypeList.value.filter((b) => b.active).map((b) => b.content),
)

const showFilterList = ref(false)

let scrollTop = 0

onMounted(async () => {
  try {
    avatarList.value = await request.get('/avatar/simple_search')
  } catch (e) {
    console.error('请求失败', e)
  }
})

onDeactivated(() => {
  scrollTop = window.pageYOffset
})
onActivated(() => {
  window.scrollTo(0, scrollTop)
})

watch([avatarSearchName, filterElem, filterWeapon, filterStar], fetchAvatars, {
  immediate: true,
})

async function fetchAvatars() {
  const qs = new URLSearchParams()

  if (avatarSearchName.value) qs.append('name', avatarSearchName.value)

  filterElem.value.forEach((e) => qs.append('elem', e))
  filterWeapon.value.forEach((w) => qs.append('weapon', w))
  filterStar.value.forEach((s) => qs.append('star', s))

  avatarList.value = await request.get('/avatar/simple_search?' + qs.toString())
}

function toggle(list, index) {
  list[index].active = !list[index].active
}
</script>

<template>
  <div id="body">
    <div id="filter">
      <button id="filter-btn" @click="showFilterList = !showFilterList">Filter</button>
      <input class="filter-input" type="text" v-model="avatarSearchName" placeholder="Search..." />
    </div>
    <div id="filter-list" v-if="showFilterList">
      <div class="filter-list-item-box">
        <span class="filter-list-item-box-title">STAR</span>
        <div class="filter-list-item-container">
          <button
            class="filter-list-item"
            :class="{ active: starLvl.active }"
            v-for="(starLvl, i) in starLvlList"
            :key="starLvl.id"
            @click="toggle(starLvlList, i)"
            :style="{ backgroundImage: `url(${getImgUrl.starLv(starLvl.content)})` }"
          ></button>
        </div>
      </div>
      <div class="filter-list-item-box">
        <span class="filter-list-item-box-title">ELEMENT</span>
        <div class="filter-list-item-container">
          <button
            class="filter-list-item"
            :class="{ active: element.active }"
            v-for="(element, i) in elementList"
            :key="element.id"
            @click="toggle(elementList, i)"
            :style="{ backgroundImage: `url(${getImgUrl.element(element.content)})` }"
          ></button>
        </div>
      </div>
      <div class="filter-list-item-box">
        <span class="filter-list-item-box-title">WEAPON</span>
        <div class="filter-list-item-container">
          <button
            class="filter-list-item"
            :class="{ active: weaponType.active }"
            v-for="(weaponType, i) in weaponTypeList"
            :key="weaponType.id"
            @click="toggle(weaponTypeList, i)"
            :style="{ backgroundImage: `url(${getImgUrl.weaponType(weaponType.content)})` }"
          ></button>
        </div>
      </div>
    </div>
    <div id="cardBody">
      <button
        v-for="(avatar, index) in avatarList"
        :key="index"
        class="avatarCard"
        :style="{ backgroundImage: `url(${getImgUrl.avatarGacha(avatar.name)})` }"
        @click="$router.push(`/avatars/${avatar.name}`)"
        loading="lazy"
      >
        <div class="avatar-card-name">
          {{ avatar.name }}
        </div>
        <div class="avatar-card-elem-and-weap">
          <img id="element-icon" :src="getImgUrl.element(avatar.elem)" />
          <img id="weapon-icon" :src="getImgUrl.weaponType(avatar.weapon)" />
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
#filter-btn {
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
#filter-btn:hover {
  cursor: pointer;
  color: rgba(255, 255, 255, 1);
  transition: all 0.1s ease-in-out;
}
#filter-btn::after {
  position: absolute;
  content: '';
  top: 10%;
  right: 0px;
  width: 1px;
  height: 80%;
  background: rgba(255, 255, 255, 0.4);
  z-index: -1;
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
#filter-list {
  position: relative;
  height: 400px;
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
#filter-list::before {
  position: absolute;
  content: '';
  width: 95%;
  height: 1px;
  top: 34%;
  left: 2.5%;
  background: rgba(255, 255, 255, 0.1);
}
#filter-list::after {
  position: absolute;
  content: '';
  width: 95%;
  height: 1px;
  bottom: 34%;
  left: 2.5%;
  background: rgba(255, 255, 255, 0.1);
}
.filter-list-item-box {
  height: 33%;
  width: 100%;
  background: transparent;
  border-radius: 10px;
}
.filter-list-item-box-title {
  color: rgba(255, 255, 255, 0.5);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
}
.filter-list-item-container {
  height: 90%;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
}
.filter-list-item {
  width: 60px;
  height: 60px;
  background-size: 40px;
  background-position: center;
  background-repeat: no-repeat;
  mask: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5));
  background-color: transparent;
  border: solid 1px rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: transparent;
}
.filter-list-item:hover {
  cursor: pointer;
  mask: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7));
  background-color: rgba(255, 255, 255, 0.1);
  border: solid 1px rgba(255, 255, 255, 0.3);
  transition: all 0.1s ease-in-out;
}
.filter-list-item.active {
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
.avatarCard {
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
  background-size: cover;
  background-repeat: no-repeat;
  transition: all 0.2s ease-in-out;
}
.avatarCard:hover {
  transform: scale(1.01);
  border: solid 1px rgba(255, 255, 255, 0.7);
  box-shadow: 0px 0px 20px 5px rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease-in-out;
}
.avatarCard::after {
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
.avatar-card-name {
  width: 130px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  letter-spacing: 5px;
  z-index: 1;
  pointer-events: none;
}
.avatar-card-elem-and-weap {
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
.avatar-card-elem-and-weap::after {
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
#element-icon {
  width: 30px;
  height: 30px;
  margin-top: 7px;
}
#weapon-icon {
  width: 35px;
  height: 35px;
  margin-top: 8px;
}

@media (pointer: coarse) {
  #filter,
  #filter-list {
    width: 85%;
  }
  .avatarCard {
    width: 40%;
    background-position: center 25%;
  }
}
</style>
