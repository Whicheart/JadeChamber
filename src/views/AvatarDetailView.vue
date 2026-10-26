<script setup>
// ==========================================
// 1. 依赖引入
// ==========================================
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'

// 导入各个子模块组件
import AvatarBaseInfo from '@/components/AvatarBaseInfo.vue'
import AvatarSkills from '@/components/AvatarSkills.vue'
import AvatarConstellations from '@/components/AvatarConstellations.vue'
import AvatarOutfits from '@/components/AvatarOutfits.vue'
import AvatarStories from '@/components/AvatarStories.vue'
import AvatarVoices from '@/components/AvatarVoices.vue'

// ==========================================
// 2. 路由与静态配置
// ==========================================
const route = useRoute()

// 接口模块映射表
const apiMap = {
  baseInfo: 'base-info',
  skills: 'skills',
  constellations: 'constellations',
  outfits: 'outfits',
  stories: 'stories',
  voices: 'voices',
}

// ==========================================
// 3. 响应式数据状态
// ==========================================
// 集中管理当前页面的所有角色数据
const avatarData = ref({
  baseInfo: {},
  skills: {},
  constellations: {},
  outfits: {},
  stories: {},
  voices: {},
})

// 导航栏配置
const navBtns = ref([
  { id: 1, text: '基础信息' },
  { id: 2, text: '天赋技能' },
  { id: 3, text: '命座详情' },
  { id: 4, text: '角色时装' },
  { id: 5, text: '角色故事' },
  { id: 6, text: '角色语音' },
])

// 当前选中的导航 Tab
const activeNavBtnId = ref(1)

// ==========================================
// 4. 侦听器与业务逻辑
// ==========================================
// 监听路由参数变化，并发拉取所有模块数据
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
  <!-- 顶部导航栏 -->
  <div id="navbar">
    <button
      v-for="btn in navBtns"
      :key="btn.id"
      class="nav-btn"
      :class="{ active: activeNavBtnId === btn.id }"
      @click="activeNavBtnId = btn.id"
    >
      {{ btn.text }}
    </button>
  </div>

  <!-- 主内容区 -->
  <div id="content-area">
    <!-- 数据加载完毕才渲染子组件，防止空指针报错 -->
    <template v-if="avatarData.baseInfo.name">
      <AvatarBaseInfo v-if="activeNavBtnId === 1" :base-info="avatarData.baseInfo" />
      <AvatarSkills
        v-if="activeNavBtnId === 2"
        :skills="avatarData.skills"
        :weapon-type="avatarData.baseInfo.weaponType"
      />
      <AvatarConstellations v-if="activeNavBtnId === 3" :constellations="avatarData.constellations" />
      <AvatarOutfits
        v-if="activeNavBtnId === 4"
        :outfits="avatarData.outfits"
        :splash-icon-name="avatarData.baseInfo.splashIconName"
      />
      <AvatarStories v-if="activeNavBtnId === 5" :stories="avatarData.stories" />
      <AvatarVoices v-if="activeNavBtnId === 6" :voices="avatarData.voices" />
    </template>
    <div v-else class="loading">
      正在加载角色数据...
    </div>
  </div>
</template>

<style scoped>
/* 全局变量定义 */
* {
  --clr-border: var(--clr-white-30);
  --clr-background: var(--clr-black-90);
  --clr-color: var(--clr-white);

  --wid-filter-open-btn: 50px;
  --wid-filter-input: 50vw;
  --wid-avatar-card: 160px;
  --wid-max: calc(var(--wid-filter-open-btn) + var(--wid-filter-input));

  --pos-filter-top: 60px;
  --pos-filter-list-top: calc(var(--pos-filter-top) + 60px);

  --num-avatar-list-box-gradient-stops: 20px;
}

/* 顶部导航栏 */
#navbar {
  position: fixed;
  top: 60px;
  z-index: 999;
  width: calc(60vw + 6px);
  height: 56px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--clr-black-90);
  border: 1px solid var(--clr-white-10);
  border-radius: 9999px;
}

.nav-btn {
  width: 10vw;
  height: 50px;
  background-color: var(--clr-transparent);
  color: var(--clr-white-50);
  border: none;
  border-radius: 9999px;
  font-size: 20px;
  letter-spacing: 0.5em;
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

/* 主内容滚动区 */
#content-area {
  position: absolute;
  top: 0;
  width: 60vw;
  height: 100vh; 
  padding-top: 140px;
  padding-bottom: 100px;
  overflow-y: auto; 
  scrollbar-width: none; /* 隐藏 Firefox 滚动条 */
}

#content-area::-webkit-scrollbar {
  display: none; /* 隐藏 Webkit 滚动条 */
}
</style>
