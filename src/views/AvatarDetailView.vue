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

// 接口模块映射表：键名与 avatarData 的字段一一对应
const apiMap = {
  baseInfo: 'base-info',
  skills: 'skills',
  constellations: 'constellations',
  outfits: 'outfits',
  stories: 'stories',
  voices: 'voices',
}

// 顶部 Tab
const navBtns = [
  { id: 1, text: '基础信息' },
  { id: 2, text: '天赋技能' },
  { id: 3, text: '命座详情' },
  { id: 4, text: '角色时装' },
  { id: 5, text: '角色故事' },
  { id: 6, text: '角色语音' },
]

const avatarData = ref({
  baseInfo: {},
  skills: {},
  constellations: {},
  outfits: {},
  stories: {},
  voices: {},
})

const activeNavBtnId = ref(1)
const loading = ref(true)
const failed = ref(false)

// 六个模块并发拉取，任一失败整页进入失败态（重试按钮会重新调用本函数）
async function loadAvatar(avatarId) {
  if (!avatarId) return

  loading.value = true
  failed.value = false

  try {
    const keys = Object.keys(apiMap)
    const results = await Promise.all(
      keys.map((key) => request.get(`/api/avatar/${avatarId}/${apiMap[key]}`)),
    )

    keys.forEach((key, index) => {
      avatarData.value[key] = results[index]
    })
  } catch (error) {
    console.error('获取角色数据失败：', error)
    failed.value = true
  } finally {
    loading.value = false
  }
}

// 换角色时回到第一个 Tab，避免停在上一个角色看过的页签
watch(
  () => route.params.avatarId,
  (avatarId) => {
    activeNavBtnId.value = 1
    loadAvatar(avatarId)
  },
  { immediate: true },
)
</script>

<template>
  <div id="avatar-detail">
    <nav class="nav-bar">
      <button
        v-for="btn in navBtns"
        :key="btn.id"
        type="button"
        class="nav-btn"
        :class="{ active: activeNavBtnId === btn.id }"
        @click="activeNavBtnId = btn.id"
      >
        {{ btn.text }}
      </button>
    </nav>

    <div class="content-area">
      <section v-if="failed" class="status-panel">
        <p class="status-text">角色数据加载失败</p>
        <button type="button" class="retry-btn" @click="loadAvatar(route.params.avatarId)">
          重新加载
        </button>
      </section>

      <section v-else-if="loading || !avatarData.baseInfo.name" class="status-panel">
        <p class="status-text">正在加载角色数据...</p>
      </section>

      <!-- 数据加载完毕才渲染子组件，防止空指针报错 -->
      <template v-else>
        <AvatarBaseInfo v-if="activeNavBtnId === 1" :base-info="avatarData.baseInfo" />
        <AvatarSkills
          v-if="activeNavBtnId === 2"
          :skills="avatarData.skills"
          :weapon-type="avatarData.baseInfo.weaponType"
        />
        <AvatarConstellations
          v-if="activeNavBtnId === 3"
          :constellations="avatarData.constellations"
        />
        <AvatarOutfits
          v-if="activeNavBtnId === 4"
          :outfits="avatarData.outfits"
          :splash-icon-name="avatarData.baseInfo.splashIconName"
        />
        <AvatarStories v-if="activeNavBtnId === 5" :stories="avatarData.stories" />
        <AvatarVoices v-if="activeNavBtnId === 6" :voices="avatarData.voices" />
      </template>
    </div>
  </div>
</template>

<style scoped>
/* 与角色页各面板同一套材质：black-80 底 + white-10 细边 + 16px 圆角 */
#avatar-detail {
  display: flex;
  flex-direction: column;
  width: 60vw;
  /* App 的 main 有 50px 上内边距，这里补 10px 与列表页的筛选栏齐平 */
  height: calc(100% - 10px);
  min-height: 0;
  gap: 16px;
  margin-top: 10px;
  color: var(--clr-white);
}

/* 顶部 Tab */
.nav-bar {
  flex: none;
  display: flex;
  gap: 6px;
  padding: 6px;
  border: 1px solid var(--clr-white-10);
  border-radius: 16px;
  background-color: var(--clr-black-80);
}

.nav-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 12px;
  background-color: var(--clr-transparent);
  color: var(--clr-white-50);
  font-family: inherit;
  font-size: 17px;
  letter-spacing: 2px;
  cursor: pointer;
  transition:
    background-color 150ms,
    color 150ms;
}

.nav-btn:hover {
  background-color: var(--clr-white-10);
  color: var(--clr-white-80);
}

.nav-btn.active {
  background-color: var(--clr-white-20);
  color: var(--clr-white);
}

/* 内容区：面板自带内边距，这里只负责滚动与底部留白 */
.content-area {
  flex: 1;
  min-height: 0;
  padding-bottom: 80px;
  overflow-y: auto;
  scrollbar-width: none;
}

.content-area::-webkit-scrollbar {
  display: none;
}

/* 加载中 / 加载失败 */
.status-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-height: 280px;
  border: 1px dashed var(--clr-white-20);
  border-radius: 16px;
  background-color: var(--clr-white-10);
}

.status-text {
  color: var(--clr-white-50);
  font-size: 16px;
  letter-spacing: 1px;
}

.retry-btn {
  padding: 8px 22px;
  border: 1px solid var(--clr-white-20);
  border-radius: 9999px;
  background-color: var(--clr-white-10);
  color: var(--clr-white-70);
  font-family: inherit;
  font-size: 15px;
  cursor: pointer;
  transition:
    background-color 150ms,
    color 150ms;
}

.retry-btn:hover {
  background-color: var(--clr-white-20);
  color: var(--clr-white);
}

/* ========== 窄屏（移动设备）适配 ========== */
@media (max-width: 768px) {
  #avatar-detail {
    width: calc(100% - 24px);
    height: calc(100% - 8px);
    gap: 12px;
    margin-top: 8px;
  }

  .nav-bar {
    gap: 4px;
    padding: 4px;
    border-radius: 14px;
  }

  /* 六个页签在手机上必须挤在一行，缩字号、去掉字距 */
  .nav-btn {
    height: 40px;
    padding: 0 2px;
    border-radius: 10px;
    font-size: 13px;
    letter-spacing: 0;
    white-space: nowrap;
  }

  .content-area {
    padding-bottom: 60px;
  }

  .status-panel {
    min-height: 200px;
  }

  .status-text {
    font-size: 15px;
  }
}

/* 手机竖屏放不下六个四字页签，改成两行三列，字号不必再压 */
@media (max-width: 480px) {
  .nav-bar {
    flex-wrap: wrap;
  }

  .nav-btn {
    flex: 1 0 calc(33.333% - 4px);
    height: 38px;
    padding: 0;
    font-size: 14px;
  }
}
</style>
