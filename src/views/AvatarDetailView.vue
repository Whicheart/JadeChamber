<script setup>
import { reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'

import AvatarBaseInfo from '@/components/AvatarBaseInfo.vue'
import AvatarSkills from '@/components/AvatarSkills.vue'
import AvatarConstellations from '@/components/AvatarConstellations.vue'
import AvatarOutfits from '@/components/AvatarOutfits.vue'
import AvatarStories from '@/components/AvatarStories.vue'
import AvatarVoices from '@/components/AvatarVoices.vue'
import LoadState from '@/components/LoadState.vue'

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

const moduleKeys = Object.keys(apiMap)

const LOADING_TEXT = '正在加载角色数据...'
const FAILED_TEXT = '角色数据加载失败'

// 顶部 Tab
const navBtns = [
  { id: 1, text: '基础信息', module: 'baseInfo' },
  { id: 2, text: '天赋技能', module: 'skills' },
  { id: 3, text: '命座详情', module: 'constellations' },
  { id: 4, text: '角色时装', module: 'outfits' },
  { id: 5, text: '角色故事', module: 'stories' },
  { id: 6, text: '角色语音', module: 'voices' },
]

const avatarData = ref({
  baseInfo: {},
  skills: {},
  constellations: {},
  outfits: {},
  stories: {},
  voices: {},
})

// 每个接口单独记状态：loading / ok / error，互不牵连
const moduleState = reactive(Object.fromEntries(moduleKeys.map((key) => [key, 'loading'])))

const activeNavBtnId = ref(1)

// 拉单个模块；失败只把该模块标记成 error，其它 Tab 不受影响
async function loadModule(avatarId, key) {
  moduleState[key] = 'loading'

  try {
    avatarData.value[key] = (await request.get(`/api/avatar/${avatarId}/${apiMap[key]}`)) || {}
    moduleState[key] = 'ok'
  } catch (error) {
    console.error(`获取角色 ${apiMap[key]} 数据失败：`, error)
    avatarData.value[key] = {}
    moduleState[key] = 'error'
  }
}

// 六个模块同时发起、各自完成即显示
function loadAvatar(avatarId) {
  if (!avatarId) return

  moduleKeys.forEach((key) => loadModule(avatarId, key))
}

// 某个 Tab 的「重新加载」只重拉它自己那一个接口
function retryModule(key) {
  loadModule(route.params.avatarId, key)
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
      <!-- 每个 Tab 只关心自己那个接口：先到的先显示，失败的只影响本 Tab -->
      <template v-if="activeNavBtnId === 1">
        <AvatarBaseInfo v-if="moduleState.baseInfo === 'ok'" :base-info="avatarData.baseInfo" />
        <LoadState
          v-else
          :loading="moduleState.baseInfo === 'loading'"
          :failed="moduleState.baseInfo === 'error'"
          :loading-text="LOADING_TEXT"
          :failed-text="FAILED_TEXT"
          @retry="retryModule('baseInfo')"
        />
      </template>

      <template v-else-if="activeNavBtnId === 2">
        <AvatarSkills
          v-if="moduleState.skills === 'ok'"
          :skills="avatarData.skills"
          :weapon-type="avatarData.baseInfo.weaponType"
        />
        <LoadState
          v-else
          :loading="moduleState.skills === 'loading'"
          :failed="moduleState.skills === 'error'"
          :loading-text="LOADING_TEXT"
          :failed-text="FAILED_TEXT"
          @retry="retryModule('skills')"
        />
      </template>

      <template v-else-if="activeNavBtnId === 3">
        <AvatarConstellations
          v-if="moduleState.constellations === 'ok'"
          :constellations="avatarData.constellations"
        />
        <LoadState
          v-else
          :loading="moduleState.constellations === 'loading'"
          :failed="moduleState.constellations === 'error'"
          :loading-text="LOADING_TEXT"
          :failed-text="FAILED_TEXT"
          @retry="retryModule('constellations')"
        />
      </template>

      <template v-else-if="activeNavBtnId === 4">
        <AvatarOutfits
          v-if="moduleState.outfits === 'ok'"
          :outfits="avatarData.outfits"
          :splash-icon-name="avatarData.baseInfo.splashIconName"
        />
        <LoadState
          v-else
          :loading="moduleState.outfits === 'loading'"
          :failed="moduleState.outfits === 'error'"
          :loading-text="LOADING_TEXT"
          :failed-text="FAILED_TEXT"
          @retry="retryModule('outfits')"
        />
      </template>

      <template v-else-if="activeNavBtnId === 5">
        <AvatarStories v-if="moduleState.stories === 'ok'" :stories="avatarData.stories" />
        <LoadState
          v-else
          :loading="moduleState.stories === 'loading'"
          :failed="moduleState.stories === 'error'"
          :loading-text="LOADING_TEXT"
          :failed-text="FAILED_TEXT"
          @retry="retryModule('stories')"
        />
      </template>

      <template v-else>
        <AvatarVoices v-if="moduleState.voices === 'ok'" :voices="avatarData.voices" />
        <LoadState
          v-else
          :loading="moduleState.voices === 'loading'"
          :failed="moduleState.voices === 'error'"
          :loading-text="LOADING_TEXT"
          :failed-text="FAILED_TEXT"
          @retry="retryModule('voices')"
        />
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

/* 加载中 / 加载失败由 LoadState 负责渲染 */

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
