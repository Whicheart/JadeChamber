<script setup>
import { computed, onMounted, ref } from 'vue'

import ArtifactInventory from '@/components/ArtifactInventory.vue'
import PotentialChart from '@/components/PotentialChart.vue'
import {
  appendTiersOf,
  clampSimulateTimes,
  createAccumulator,
  DEFAULT_SIMULATE_TIMES,
  MAX_SIMULATE_TIMES,
  maxMainValue,
  MIN_SIMULATE_TIMES,
  rankRuleOf,
  scoreOf,
  SIMULATE_CHUNK_SIZE,
  simulateBatch,
} from '@/utils/potential'
import { propLabel, propText, slotOfRelic } from '@/utils/reliquaryProp'
import request from '@/utils/request'

// 选中的圣遗物；为空时只显示入口按钮
const relic = ref(null)
// 是否正在背包里挑圣遗物
const picking = ref(false)

const setList = ref([])
const rankLevels = ref([])
const times = ref(DEFAULT_SIMULATE_TIMES)
const running = ref(false)
const progress = ref(0)
const error = ref('')
const result = ref(null)

const slotText = computed(() => (relic.value ? slotOfRelic(relic.value.relicId) : ''))
const setName = computed(() => {
  if (!relic.value) return ''

  return setList.value.find((item) => item.setId === relic.value.setId)?.name ?? ''
})

// 当前这件圣遗物已经有的分数，用来和模拟结果对照
const baseScore = computed(() => (relic.value ? scoreOf(relic.value.appendProp) : 0))

// 五次升级只加副词条，主词条直接按满级值算，所以这里单独列出来
const rankRule = computed(() => rankRuleOf(rankLevels.value, relic.value?.rankLevel ?? 5))
const mainMax = computed(() =>
  rankRule.value && relic.value ? maxMainValue(rankRule.value, relic.value.mainPropName) : 0,
)

// 众数那一次模拟的副词条终值，需要词条名才能显示
const modeRows = computed(() => {
  const mode = result.value?.mode

  if (!mode || !result.value?.propNames) return []

  return result.value.propNames.map((propName, index) => ({
    propName,
    value: mode.values?.[index] ?? 0,
  }))
})

async function loadReference() {
  try {
    const [list, propRank] = await Promise.all([
      request.get('/api/reliquary/list'),
      request.get('/api/reliquary/prop-rank'),
    ])

    setList.value = list ?? []
    rankLevels.value = propRank?.rankLevels ?? []
  } catch (loadError) {
    console.error('潜力计算的基础数据加载失败：', loadError)
    error.value = '升级规则加载失败，请刷新页面重试'
  }
}

function onSelect(selected) {
  relic.value = selected
  picking.value = false
  result.value = null
  error.value = ''
}

function reset() {
  relic.value = null
  result.value = null
  error.value = ''
}

async function startSimulation() {
  error.value = ''
  result.value = null

  if (!relic.value) {
    error.value = '请先选择圣遗物'
    return
  }

  const count = clampSimulateTimes(times.value)
  times.value = count

  const rule = rankRuleOf(rankLevels.value, relic.value.rankLevel)

  if (!rule) {
    error.value = `没有 ${relic.value.rankLevel} 星的升级规则`
    return
  }

  if (!relic.value.appendProp?.length) {
    error.value = '这件圣遗物没有副词条，无法模拟'
    return
  }

  const tiers = appendTiersOf(rule)

  running.value = true
  progress.value = 0

  try {
    // 让出一帧，先把「计算中」画出来再跑循环
    await new Promise((resolve) => setTimeout(resolve, 0))

    const startedAt = performance.now()
    const accumulator = createAccumulator()
    const appendProps = relic.value.appendProp
    let done = 0

    // 分片跑：每批固定次数，批与批之间让出主线程，100 万次也不会把页面卡死
    while (done < count) {
      const step = Math.min(SIMULATE_CHUNK_SIZE, count - done)

      simulateBatch(step, appendProps, tiers, accumulator)
      done += step
      progress.value = done / count

      if (done < count) await new Promise((resolve) => setTimeout(resolve, 0))
    }

    const summary = accumulator.finish()
    const elapsed = performance.now() - startedAt

    result.value = {
      times: summary.times,
      average: summary.average,
      best: summary.best,
      worst: summary.worst,
      elapsed,
      points: summary.points,
      mode: summary.mode,
      propNames: appendProps.map((prop) => prop.propName),
    }
  } finally {
    running.value = false
    progress.value = 0
  }
}

onMounted(loadReference)
</script>

<template>
  <section class="potential">
    <header class="potential-head">
      <h2 class="potential-title">潜力计算</h2>
      <p class="potential-desc">
        按当前副词条随机强化五次，再取「暴击率 ×2 + 暴击伤害」的平均分作为潜力分数。
      </p>
    </header>

    <!-- 默认状态：只有一枚入口按钮 -->
    <div v-if="!relic && !picking" class="empty">
      <p class="empty-hint">请先选择圣遗物</p>
      <button type="button" class="primary-btn" @click="picking = true">选择圣遗物</button>
    </div>

    <!-- 选择圣遗物：复用背包组件 -->
    <div v-else-if="picking" class="picker">
      <div class="picker-head">
        <span class="picker-tip">请选择一件圣遗物</span>
        <button type="button" class="ghost-btn" @click="picking = false">取消</button>
      </div>
      <ArtifactInventory selectable @select="onSelect" />
    </div>

    <div v-else class="calc">
      <!-- A 块：左 = 圣遗物现状，右 = 模拟设置与结果 -->
      <div class="block block-a">
        <section class="panel panel-relic">
          <h3 class="panel-title">所选圣遗物</h3>

          <div class="relic-head">
            <span class="relic-name">{{ setName || slotText }}</span>
            <span class="relic-meta">
              {{ slotText }} · {{ relic.rankLevel }}★ · Lv.{{ relic.level }}
            </span>
          </div>

          <div class="main-row">
            <span class="main-label">满级主词条</span>
            <span class="main-name">{{ propLabel(relic.mainPropName) }}</span>
            <span class="main-value">{{ propText(relic.mainPropName, mainMax) }}</span>
          </div>

          <ul class="append-list">
            <li v-for="(prop, index) in relic.appendProp" :key="index">
              <span class="append-name">{{ propLabel(prop.propName) }}</span>
              <span class="append-value">{{ propText(prop.propName, prop.propValue) }}</span>
            </li>
          </ul>

          <div class="relic-foot">
            <span>当前分数</span>
            <span class="foot-value">{{ baseScore.toFixed(2) }}</span>
            <button type="button" class="ghost-btn small" @click="reset">重选</button>
          </div>
        </section>

        <section class="panel panel-control">
          <h3 class="panel-title">模拟设置</h3>

          <label class="times-field">
            <span class="times-label">模拟次数</span>
            <input
              v-model.number="times"
              class="times-input"
              type="number"
              :min="MIN_SIMULATE_TIMES"
              :max="MAX_SIMULATE_TIMES"
              step="1"
              @blur="times = clampSimulateTimes(times)"
            />
            <span class="times-unit">次</span>
          </label>

          <p class="times-hint">可输入 {{ MIN_SIMULATE_TIMES }} ~ {{ MAX_SIMULATE_TIMES }} 次</p>

          <button type="button" class="primary-btn" :disabled="running" @click="startSimulation">
            {{ running ? `计算中… ${Math.round(progress * 100)}%` : '开始模拟' }}
          </button>

          <div
            v-if="running"
            class="progress"
            role="progressbar"
            :aria-valuenow="Math.round(progress * 100)"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="progress-bar" :style="{ width: `${Math.round(progress * 100)}%` }"></div>
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <div v-if="result" class="result-brief">
            <div class="score-row">
              <span class="score-value">{{ result.average.toFixed(2) }}</span>
              <span class="score-unit">分</span>
            </div>
            <p class="score-label">潜力分数（{{ result.times }} 次模拟的平均分）</p>

            <ul class="result-meta">
              <li>
                <span>最高 / 最低</span>
                <span>{{ result.best.toFixed(2) }} / {{ result.worst.toFixed(2) }}</span>
              </li>
              <li>
                <span>分数档位</span>
                <span>{{ result.points.length }}</span>
              </li>
              <li>
                <span>耗时</span>
                <span>{{ result.elapsed.toFixed(0) }} ms</span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <!-- B 块：左 = 出现次数最多的那次结果，右 = 分数分布曲线 -->
      <div v-if="result" class="block block-b">
        <section class="panel panel-mode">
          <h3 class="panel-title">最常见结果</h3>

          <div class="mode-score">
            <span class="mode-value">{{ result.mode?.score?.toFixed(2) ?? '—' }}</span>
            <span class="mode-unit">分</span>
          </div>
          <p class="mode-hint">
            出现 {{ result.mode?.count ?? 0 }} 次 / 共 {{ result.times }} 次模拟
          </p>

          <ul class="append-list">
            <li v-for="row in modeRows" :key="row.propName">
              <span class="append-name">{{ propLabel(row.propName) }}</span>
              <span class="append-value">{{ propText(row.propName, row.value) }}</span>
            </li>
          </ul>
        </section>

        <section class="panel panel-chart">
          <h3 class="panel-title">分数分布</h3>
          <p class="chart-hint">横轴为分数，纵轴为该分数出现的次数</p>
          <PotentialChart :points="result.points" :height="300" />
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.potential {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.potential-head {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 8px;
}

.potential-title {
  font-size: 22px;
  font-weight: normal;
  letter-spacing: 2px;
  color: var(--clr-white);
}

.potential-desc {
  font-size: 14px;
  line-height: 1.8;
  color: var(--clr-white-50);
}

/* 未选择圣遗物时的占位区 */
.empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 280px;
  border: 1px dashed var(--clr-white-20);
  border-radius: 16px;
  background-color: var(--clr-white-10);
}

.empty-hint {
  font-size: 15px;
  letter-spacing: 1px;
  color: var(--clr-white-50);
}

.picker {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.picker-head {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.picker-tip {
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--clr-white-50);
}

.calc {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 20px;
}

/* A / B 两块都是左右并排，窄屏才换成上下 */
.block {
  display: flex;
  flex: none;
  gap: 16px;
  align-items: stretch;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 18px 20px;
  border: 1px solid var(--clr-white-10);
  border-radius: 16px;
  background-color: var(--clr-black-80);
}

.panel-relic,
.panel-mode {
  flex: 0 0 42%;
}

.panel-control,
.panel-chart {
  flex: 1;
}

.panel-title {
  font-size: 16px;
  font-weight: normal;
  letter-spacing: 1px;
  color: var(--clr-white-70);
}

.relic-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px;
}

.relic-name {
  font-size: 17px;
  letter-spacing: 1px;
  color: var(--clr-white);
}

.relic-meta {
  font-size: 13px;
  color: var(--clr-white-50);
}

.main-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--clr-white-10);
}

.main-label {
  font-size: 13px;
  color: var(--clr-white-50);
}

.main-name {
  font-size: 14px;
  color: var(--clr-white-70);
}

.main-value {
  font-size: 18px;
  font-variant-numeric: tabular-nums;
  color: var(--clr-white);
}

.append-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  list-style: none;
}

.append-list li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: var(--clr-white-60);
}

.append-value {
  font-variant-numeric: tabular-nums;
  color: var(--clr-white-80);
}

.relic-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--clr-white-10);
  font-size: 13px;
  color: var(--clr-white-50);
}

.foot-value {
  font-variant-numeric: tabular-nums;
  color: var(--clr-white-80);
}

.ghost-btn {
  height: 32px;
  padding: 0 16px;
  border: 1px solid var(--clr-white-10);
  border-radius: 9999px;
  background-color: var(--clr-white-10);
  color: var(--clr-white-70);
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition:
    background-color 150ms,
    color 150ms;
}

.ghost-btn:hover {
  background-color: var(--clr-white-20);
  color: var(--clr-white);
}

.ghost-btn.small {
  height: 26px;
  padding: 0 12px;
  margin-left: auto;
  font-size: 12px;
}

.times-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.times-label {
  font-size: 14px;
  color: var(--clr-white-70);
}

.times-input {
  width: 120px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--clr-white-10);
  border-radius: 10px;
  background-color: var(--clr-white-10);
  color: var(--clr-white);
  font-family: inherit;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  outline: none;
}

.times-input:focus {
  border-color: var(--clr-white-30);
}

.times-unit {
  font-size: 14px;
  color: var(--clr-white-50);
}

.times-hint,
.chart-hint {
  font-size: 12px;
  color: var(--clr-white-40);
}

.primary-btn {
  height: 36px;
  padding: 0 22px;
  border: none;
  border-radius: 9999px;
  background-color: var(--clr-white-90);
  color: var(--clr-black);
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background-color 150ms;
}

.primary-btn:hover:not(:disabled) {
  background-color: var(--clr-white);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.progress {
  height: 4px;
  border-radius: 9999px;
  background-color: var(--clr-white-10);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 9999px;
  background-color: var(--clr-white-70);
  transition: width 120ms linear;
}

.error {
  font-size: 13px;
  color: rgb(255, 150, 150);
}

.result-brief {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--clr-white-10);
}

.score-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.score-value {
  font-size: 32px;
  font-variant-numeric: tabular-nums;
  color: rgb(255, 180, 65);
}

.score-unit {
  font-size: 15px;
  color: var(--clr-white-50);
}

.score-label {
  font-size: 12px;
  color: var(--clr-white-50);
}

.result-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--clr-white-10);
  list-style: none;
}

.result-meta li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: var(--clr-white-60);
}

.result-meta li span:last-child {
  font-variant-numeric: tabular-nums;
  color: var(--clr-white-80);
}

.mode-score {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.mode-value {
  font-size: 32px;
  font-variant-numeric: tabular-nums;
  color: rgb(255, 180, 65);
}

.mode-unit {
  font-size: 15px;
  color: var(--clr-white-50);
}

.mode-hint {
  font-size: 12px;
  color: var(--clr-white-50);
}

@media (max-width: 768px) {
  .potential-title {
    font-size: 18px;
  }

  .empty {
    min-height: 200px;
  }

  .block {
    flex-direction: column;
  }

  .panel-relic,
  .panel-mode {
    flex: none;
  }

  .times-input {
    width: 92px;
  }

  .score-value,
  .mode-value {
    font-size: 26px;
  }
}
</style>
