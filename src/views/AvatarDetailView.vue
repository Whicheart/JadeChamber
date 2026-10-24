<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'
import AvatarBaseInfo from '@/components/AvatarBaseInfo.vue'
import AvatarSkills from '@/components/AvatarSkills.vue'
import AvatarConstellations from '@/components/AvatarConstellations.vue'
import AvatarOutfits from '@/components/AvatarOutfits.vue'
import AvatarStories from '@/components/AvatarStories.vue'
import AvatarVoices from '@/components/AvatarVoices.vue'

const route = useRoute()
// const router = useRouter()

const avatarData = ref({
  baseInfo: {},
  skills: {},
  constellations: {},
  outfits: {},
  stories: {},
  voices: {},
})
const apiMap = {
  baseInfo: 'base-info',
  skills: 'skills',
  constellations: 'constellations',
  outfits: 'outfits',
  stories: 'stories',
  voices: 'voices',
}

const navBtns = ref([
  { id: 1, text: '基础信息' },
  { id: 2, text: '天赋技能' },
  { id: 3, text: '命座详情' },
  { id: 4, text: '角色时装' },
  { id: 5, text: '角色故事' },
  { id: 6, text: '角色语音' },
])
const activeNavBtnId = ref(1)

watch(
  () => route.params.avatarId,
  async (avatarId) => {
    console.log('路由参数变化：', route.params.avatarId)
    if (!avatarId) return

    try {
      const keys = Object.keys(apiMap)

      const results = await Promise.all(
        keys.map((key) => request.get(`/api/avatar/${avatarId}/${apiMap[key]}`)),
      )

      keys.forEach((key, index) => {
        avatarData.value[key] = results[index]
      })

      console.log('全部数据加载完毕！', avatarData.value)
    } catch (error) {
      console.error('获取角色数据失败：', error)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div id="navbar">
    <button
      class="nav-btn"
      v-for="btn in navBtns"
      :key="btn.id"
      :class="{ active: activeNavBtnId === btn.id }"
      @click="activeNavBtnId = btn.id"
    >
      {{ btn.text }}
    </button>
  </div>

  <div id="content-area">
    <template v-if="avatarData.baseInfo.name">
      <AvatarBaseInfo v-if="activeNavBtnId === 1" :base-info="avatarData.baseInfo" />
      <AvatarSkills v-if="activeNavBtnId === 2" :skills="avatarData.skills" />
      <AvatarConstellations v-if="activeNavBtnId === 3" :constellations="avatarData.constellations" />
      <AvatarOutfits v-if="activeNavBtnId === 4" :outfits="avatarData.outfits" />
      <AvatarStories v-if="activeNavBtnId === 5" :stories="avatarData.stories" />
      <AvatarVoices v-if="activeNavBtnId === 6" :voices="avatarData.voices" />
    </template>
    <div v-else class="loading">
      正在加载角色数据...
    </div>
  </div>
</template>

<style scoped>
* {
  /* 颜色 */
  --clr-border: var(--clr-white-30);
  --clr-background: var(--clr-black-90);
  --clr-color: var(--clr-white);

  /* 尺寸 */
  --wid-filter-open-btn: 50px;
  --wid-filter-input: 50vw;
  --wid-avatar-card: 160px;
  --wid-max: calc(var(--wid-filter-open-btn) + var(--wid-filter-input));

  /* 位置 */
  --pos-filter-top: 60px;
  --pos-filter-list-top: calc(var(--pos-filter-top) + 60px);

  /* 渐隐 */
  --num-avatar-list-box-gradient-stops: 20px;
}

#navbar {
  position: fixed;
  top: 60px;
  width: calc(60vw + 6px);
  height: 56px;
  border-radius: 9999px;
  background-color: var(--clr-black);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.nav-btn {
  width: 10vw;
  height: 50px;
  font-size: 20px;
  letter-spacing: 0.5em;
  background-color: var(--clr-black);
  color: var(--clr-white-50);
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: 150ms;
}
.nav-btn:hover {
  background-color: var(--clr-white-10);
  transition: 150ms;
}
.nav-btn.active {
  color: var(--clr-color);
  background-color: var(--clr-white-20);
  transition: 150ms;
}

#content-area {
  width: 60vw;
  top: 0px;
  position: absolute;
  height: 100vh; 
  overflow-y: auto; 
  scrollbar-width: none;
  padding-top: 140px;
  padding-bottom: 100px;
}
#content-area::-webkit-scrollbar {
  display: none;
}
</style>
