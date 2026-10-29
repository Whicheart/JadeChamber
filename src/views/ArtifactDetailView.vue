<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'
import LoadState from '@/components/LoadState.vue'

const route = useRoute()

const artifactSet = ref({})
const loading = ref(true)
const failed = ref(false)

// 当前选中的部件，默认第一个
const selectedId = ref(null)

// 套装包含的部件；绝大多数是花/羽/沙/杯/冠 5 件，少数套装只有 1 件
const pieces = computed(() => artifactSet.value.contains || [])

const selectedPiece = computed(
  () => pieces.value.find((piece) => piece.id === selectedId.value) || null,
)

// 只裁掉一段故事首尾的空行，中间的空行是诗节分隔，必须保留
function trimBlankEdges(lines) {
  const result = lines.map((line) => String(line))

  while (result.length && !result[0].trim()) result.shift()
  while (result.length && !result[result.length - 1].trim()) result.pop()

  return result
}

const selectedStory = computed(() => trimBlankEdges(selectedPiece.value?.story || []))

// setAffixNum 与 setAffixDesc 一一对应：[2,4] 配两条描述，单件套是 [1] 配一条
const affixRows = computed(() => {
  const nums = artifactSet.value.setAffixNum || []
  const descs = artifactSet.value.setAffixDesc || []

  return nums.map((num, index) => ({ num: Number(num), desc: descs[index] || '' }))
})

async function loadArtifact(setId) {
  if (!setId) return

  loading.value = true
  failed.value = false

  try {
    artifactSet.value = (await request.get(`/api/reliquary/${setId}/base-info`)) || {}
    // 换套装后默认选中第一个部件
    selectedId.value = pieces.value[0]?.id ?? null
  } catch (error) {
    console.error('获取圣遗物套装数据失败：', error)
    artifactSet.value = {}
    selectedId.value = null
    failed.value = true
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.setId,
  (setId) => {
    loadArtifact(setId)
  },
  { immediate: true },
)
</script>

<template>
  <div id="artifact-detail">
    <LoadState
      v-if="failed"
      failed
      failed-text="圣遗物数据加载失败"
      @retry="loadArtifact(route.params.setId)"
    />

    <LoadState
      v-else-if="loading || !artifactSet.name"
      loading
      loading-text="正在加载圣遗物数据..."
    />

    <template v-else>
      <!-- ================= A 块：套装图标 + 名称/星级/套装效果 ================= -->
      <section class="panel panel-a">
        <!-- 圣遗物图标素材尚未入库，先用占位框；宽高严格 1:1 -->
        <div class="art-box">
          <span class="art-text">图标待补充</span>
        </div>

        <div class="info-box">
          <div class="name-row">
            <h1>{{ artifactSet.name }}</h1>
            <span class="stars">{{ '★'.repeat(artifactSet.maxRankLevel || 0) }}</span>
          </div>

          <div v-if="affixRows.length" class="affix-rows">
            <div v-for="row in affixRows" :key="row.num" class="affix-row">
              <span class="affix-badge">{{ row.num }} 件套</span>
              <p class="affix-text">{{ row.desc || '暂无描述' }}</p>
            </div>
          </div>
          <p v-else class="empty">该套装没有套装效果</p>
        </div>
      </section>

      <!-- ================= B 块：部件列表（左）+ 部件故事（右） ================= -->
      <section class="panel panel-b">
        <div class="piece-list">
          <button
            v-for="piece in pieces"
            :key="piece.id"
            type="button"
            class="piece-item"
            :class="{ active: piece.id === selectedId }"
            :aria-pressed="piece.id === selectedId"
            @click="selectedId = piece.id"
          >
            <!-- 部件图标素材尚未入库，同样用占位框 -->
            <span class="piece-item-icon">图标</span>

            <span class="piece-item-body">
              <span class="piece-item-name">{{ piece.name }}</span>
              <span class="piece-item-desc">{{ piece.desc || '暂无介绍' }}</span>
            </span>
          </button>

          <p v-if="!pieces.length" class="empty">该套装没有部件数据</p>
        </div>

        <div class="piece-story">
          <template v-if="selectedPiece">
            <h3 class="piece-story-title">{{ selectedPiece.name }}</h3>

            <div v-if="selectedStory.length" class="story-body">
              <p
                v-for="(line, index) in selectedStory"
                :key="index"
                :class="{ 'story-blank': !line.trim() }"
              >
                {{ line }}
              </p>
            </div>
            <p v-else class="empty">暂无部件故事</p>
          </template>
          <p v-else class="empty">暂无部件故事</p>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* 与角色/武器详情页同一套外壳，整页直接滚动 */
#artifact-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 60vw;
  /* App 的 main 有 50px 上内边距，这里补 10px 与列表页的筛选栏齐平 */
  height: calc(100% - 10px);
  min-height: 0;
  margin-top: 10px;
  padding-bottom: 80px;
  overflow-y: auto;
  scrollbar-width: none;
  color: var(--clr-white);
}

#artifact-detail::-webkit-scrollbar {
  display: none;
}

/* 面板：与角色板块同一套材质 */
.panel {
  flex: none;
}

/* ========== A 块 ========== */
.panel-a {
  display: flex;
  align-items: flex-start;
  gap: 32px;
}

/* 套装图标：宽高严格 1:1，宽度固定时高度自动等比 */
.art-box {
  flex: none;
  width: 320px;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--clr-white-20);
  border-radius: 16px;
  background-color: var(--clr-white-10);
}

.art-text {
  color: var(--clr-white-40);
  font-size: 14px;
  letter-spacing: 2px;
}

.info-box {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.name-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.name-row h1 {
  font-size: 42px;
  letter-spacing: 2px;
}

.stars {
  color: #ffcc33;
  font-size: 20px;
  letter-spacing: 2px;
}

/* 套装效果：A 块右侧的「徽章 + 文案」行 */
.affix-rows {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 4px;
}

.affix-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.affix-badge {
  flex: none;
  min-width: 76px;
  padding: 6px 12px;
  border-radius: 9999px;
  background-color: var(--clr-white-20);
  color: var(--clr-white-70);
  font-size: 13px;
  letter-spacing: 1px;
  text-align: center;
}

.affix-text {
  flex: 1;
  color: var(--clr-white-70);
  font-size: 16px;
  line-height: 1.9;
}

/* ========== B 块 ========== */
.panel-b {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

/* 左栏：五个部件纵向排列，每一项都是按钮 */
.piece-list {
  flex: none;
  width: 340px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.piece-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background-color: var(--clr-white-10);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: 200ms;
}

.piece-item:hover {
  background-color: var(--clr-white-20);
}

/* 选中态：边框提亮 + 底色加深，靠图标边框区分当前部件 */
.piece-item.active {
  border-color: var(--clr-white-40);
  background-color: var(--clr-white-20);
}

/* 部件图标占位框 */
.piece-item-icon {
  flex: none;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--clr-white-20);
  border-radius: 10px;
  background-color: var(--clr-white-10);
  color: var(--clr-white-40);
  font-size: 11px;
  letter-spacing: 1px;
}

.piece-item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.piece-item-name {
  color: var(--clr-white);
  font-size: 15px;
  letter-spacing: 1px;
}

/* 介绍全文展示，最长也只有 47 字，不会把按钮撑得太高 */
.piece-item-desc {
  color: var(--clr-white-50);
  font-size: 13px;
  line-height: 1.7;
}

/* 右栏：当前部件的故事，左侧列表切换时只换这里的内容 */
.piece-story {
  flex: 1;
  min-width: 0;
  min-height: 360px;
}

.piece-story-title {
  margin-bottom: 14px;
  color: var(--clr-white);
  font-size: 20px;
  font-weight: normal;
  letter-spacing: 2px;
}

.story-body {
  color: var(--clr-white-70);
  font-size: 16px;
  line-height: 2;
}

.story-body p {
  margin-bottom: 10px;
}

/* 原文的空行：留出一个整行高度，不加段间距 */
.story-body p.story-blank {
  height: 2em;
  margin-bottom: 0;
}

.story-body p:last-child {
  margin-bottom: 0;
}

.empty {
  color: var(--clr-white-40);
  font-size: 14px;
  padding: 8px 14px;
}

/* ========== 窄屏（移动设备）适配 ========== */
@media (max-width: 768px) {
  #artifact-detail {
    gap: 16px;
    width: calc(100% - 24px);
    height: calc(100% - 8px);
    margin-top: 8px;
    padding-bottom: 60px;
  }

  .panel {
    padding: 16px;
    border-radius: 14px;
  }

  /* 图标与信息并排会挤成一列，改成上下排 */
  .panel-a {
    flex-direction: column;
    gap: 16px;
  }

  /* 移动端占满整行，仍保持 1:1 */
  .art-box {
    width: 100%;
    border-radius: 12px;
  }

  .name-row h1 {
    font-size: 28px;
    letter-spacing: 1px;
  }

  .stars {
    font-size: 16px;
    letter-spacing: 1px;
  }

  .affix-row {
    flex-direction: column;
    gap: 10px;
  }

  .affix-text {
    font-size: 15px;
    line-height: 1.8;
  }

  /* 部件列表与故事区也改成上下排 */
  .panel-b {
    flex-direction: column;
    gap: 16px;
  }

  .piece-list {
    width: 100%;
  }

  .piece-story {
    min-height: 0;
  }

  .piece-story-title {
    margin-bottom: 12px;
    font-size: 17px;
    letter-spacing: 1px;
  }

  .story-body {
    font-size: 15px;
    line-height: 1.9;
  }
}
</style>
