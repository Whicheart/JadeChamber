<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'
import * as format from '@/utils/format'
import { descHtml } from '@/utils/richText'
import {
  mergeMaterials,
  moraTotal,
  reachedStages as stagesReachedBy,
  valueAt,
} from '@/utils/growth'
import LoadState from '@/components/LoadState.vue'
import SliderRow from '@/components/SliderRow.vue'

const route = useRoute()

// 元素精通这类副属性是整数，其余（攻击力/暴击率/元素充能效率…）都是百分比
const FLAT_SUBSTATS = new Set(['元素精通'])

const weapon = ref({})
const loading = ref(true)
const failed = ref(false)

const level = ref(90) // A 块属性成长滑块（接口按 100 级给数据）
const targetLevel = ref(90) // C 块突破材料计算滑块
const refine = ref(1)

// 突破阶数就是等级上限，最后一阶的 maxLevel 即满级（多数 90，低星武器 70）
const maxLevel = computed(() => {
  const stages = weapon.value.materials || []
  if (!stages.length) return 90
  return Number(stages[stages.length - 1].maxLevel) || 90
})

// affixDesc 的条数就是精炼档数：0 条没有被动，1 条没有精炼，5 条是常规五星
const refineCount = computed(() => (weapon.value.affixDesc || []).length)

// 概要行的被动档位描述：0 条没被动，1 条是固定效果，5 条才是可精炼
const refineText = computed(() => {
  if (!refineCount.value) return '无被动效果'
  if (refineCount.value === 1) return '无精炼'
  return `精炼 ${refineCount.value} 档`
})

// 数组下标 = 等级 - 1（接口给的是 100 级长度）
function atkText(targetLevelValue) {
  const value = valueAt(weapon.value.atk, targetLevelValue, null)
  return value === null ? '—' : format.statValue('I', value)
}

function subStatText(targetLevelValue) {
  if (!weapon.value.subStatName) return '—'

  const value = valueAt(weapon.value.subStatValue, targetLevelValue, null)
  if (value === null) return '—'

  return FLAT_SUBSTATS.has(weapon.value.subStatName)
    ? format.statValue('I', value)
    : format.statValue('P', value)
}

const affixHtml = computed(() => descHtml(weapon.value.affixDesc?.[refine.value - 1] || ''))

// 目标等级下已经跨过的突破阶（与角色页同一套口径：门槛 <= 目标等级即计入）
const reachedStages = computed(() =>
  stagesReachedBy(weapon.value.materials || [], targetLevel.value),
)

// 同 id 的材料跨阶合并数量，排序保持首次出现的顺序（突破素材 → 精英素材 → 普通素材）
const materialSummary = computed(() => mergeMaterials(reachedStages.value))

const totalMora = computed(() => moraTotal(reachedStages.value))

// 只裁掉一段故事首尾的空行，中间的空行是诗节分隔，必须保留
function trimBlankEdges(lines) {
  const result = lines.map((line) => String(line))

  while (result.length && !result[0].trim()) result.shift()
  while (result.length && !result[result.length - 1].trim()) result.pop()

  return result
}

// stories 是「若干段故事 × 每段若干行」的二维数组：每一段单独成块，全部渲染
const storyBlocks = computed(() =>
  (weapon.value.stories || [])
    .map((lines) => trimBlankEdges(lines || []))
    .filter((lines) => lines.length),
)

async function loadWeapon(weaponId) {
  if (!weaponId) return

  loading.value = true
  failed.value = false

  try {
    weapon.value = (await request.get(`/api/weapon/${weaponId}/base-info`)) || {}
    level.value = maxLevel.value
    targetLevel.value = maxLevel.value
    refine.value = 1
  } catch (error) {
    console.error('获取武器数据失败：', error)
    weapon.value = {}
    failed.value = true
  } finally {
    loading.value = false
  }
}

// 换武器时把所有滑块重置成默认值
watch(
  () => route.params.weaponId,
  (weaponId) => {
    loadWeapon(weaponId)
  },
  { immediate: true },
)
</script>

<template>
  <div id="weapon-detail">
    <LoadState
      v-if="failed"
      failed
      failed-text="武器数据加载失败"
      @retry="loadWeapon(route.params.weaponId)"
    />

    <LoadState v-else-if="loading || !weapon.name" loading loading-text="正在加载武器数据..." />

    <template v-else>
      <!-- ================= A 块：立绘 + 名称/星级/描述/属性成长 ================= -->
      <section class="panel panel-a">
        <!-- 武器立绘素材尚未入库，先用占位框 -->
        <div class="art-box">
          <span class="art-text">立绘待补充</span>
        </div>

        <div class="info-box">
          <div class="name-row">
            <h1>{{ weapon.name }}</h1>
            <span class="stars">{{ '★'.repeat(weapon.rankLevel || 0) }}</span>
          </div>

          <p class="meta-line">
            {{ weapon.weaponType || '—' }} · {{ refineText }} · 满级 Lv.{{ maxLevel }}
          </p>

          <p v-if="weapon.desc" class="desc">{{ weapon.desc }}</p>

          <div class="growth">
            <h2 class="growth-title">属性成长</h2>

            <SliderRow v-model="level" :max="100" />

            <div class="stat-grid">
              <div class="stat-card">
                <span class="stat-name">基础攻击力</span>
                <span class="stat-value">{{ atkText(level) }}</span>
              </div>
              <div v-if="weapon.subStatName" class="stat-card">
                <span class="stat-name">{{ weapon.subStatName }}</span>
                <span class="stat-value">{{ subStatText(level) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= B 块：精炼效果 ================= -->
      <section class="panel">
        <h2 class="panel-title">精炼效果</h2>

        <p v-if="weapon.affixName" class="affix-name">{{ weapon.affixName }}</p>

        <SliderRow
          v-if="refineCount > 1"
          v-model="refine"
          :max="refineCount"
          prefix="精炼 "
          suffix=" 阶"
        />

        <div v-if="refineCount" class="affix-desc" v-html="affixHtml"></div>
        <p v-else class="empty">该武器没有精炼效果</p>
      </section>

      <!-- ================= C 块：突破材料计算 ================= -->
      <section class="panel">
        <div class="panel-head">
          <h2 class="panel-title">突破材料计算</h2>

          <SliderRow v-model="targetLevel" :max="maxLevel" prefix="目标 Lv." />
        </div>

        <p class="calc-note">
          已计入 {{ reachedStages.length }} / {{ weapon.materials?.length || 0 }} 阶突破
          <span v-if="targetLevel > maxLevel">· 该武器满级为 Lv.{{ maxLevel }}</span>
        </p>

        <div v-if="materialSummary.length || totalMora" class="material-rows">
          <div v-for="item in materialSummary" :key="item.id" class="material-row">
            <span>{{ item.name }}</span>
            <span class="count">×{{ item.count }}</span>
          </div>
          <div class="material-row mora">
            <span>摩拉</span>
            <span class="count">×{{ totalMora }}</span>
          </div>
        </div>
        <p v-else class="empty">当前目标等级无需突破材料</p>
      </section>

      <!-- ================= D 块：武器故事 ================= -->
      <section class="panel">
        <h2 class="panel-title">武器故事</h2>

        <div v-if="storyBlocks.length" class="story-body">
          <section v-for="(block, blockIndex) in storyBlocks" :key="blockIndex" class="story-block">
            <p v-for="(line, index) in block" :key="index" :class="{ 'story-blank': !line.trim() }">
              {{ line }}
            </p>
          </section>
        </div>
        <p v-else class="empty">暂无武器故事</p>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* 与角色详情页同一套外壳，去掉页签后整页直接滚动 */
#weapon-detail {
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

#weapon-detail::-webkit-scrollbar {
  display: none;
}

/* 面板：与角色板块同一套材质 */
.panel {
  flex: none;
}

.panel-title {
  margin-bottom: 16px;
  font-size: 22px;
  font-weight: normal;
  letter-spacing: 2px;
}

/* 标题在左、滑块在右的一行头部（突破材料计算用） */
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 16px;
}

.panel-head .panel-title {
  margin-bottom: 0;
}

/* ========== A 块 ========== */
.panel-a {
  display: flex;
  gap: 32px;
}

.art-box {
  flex: none;
  width: 320px;
  min-height: 420px;
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

.meta-line {
  color: var(--clr-white-50);
  font-size: 15px;
  letter-spacing: 1px;
}

.desc {
  color: var(--clr-white-70);
  font-size: 16px;
  line-height: 1.9;
}

/* 属性成长：滑块 + 两个属性卡 */
.growth {
  margin-top: auto;
  padding: 16px;
  border-radius: 12px;
  background-color: var(--clr-white-10);
}

.growth-title {
  margin-bottom: 14px;
  color: var(--clr-white-70);
  font-size: 16px;
  font-weight: normal;
  letter-spacing: 2px;
}

/* 滑块本体在 SliderRow 里，这里只留面板内的间距 */
.growth .level-drag {
  margin-bottom: 14px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 10px;
  background-color: var(--clr-white-10);
}

.stat-name {
  color: var(--clr-white-50);
  font-size: 14px;
}

.stat-value {
  font-size: 24px;
}

/* ========== B 块：精炼效果 ========== */
.affix-name {
  margin-bottom: 14px;
  color: var(--clr-white-70);
  font-size: 17px;
  letter-spacing: 1px;
}

/* v-html 插入的节点拿不到 scoped 属性，必须用 :deep() 才被这条规则命中 */
.affix-desc {
  color: var(--clr-white-70);
  font-size: 16px;
  line-height: 2;
}

.affix-desc :deep(p) {
  margin-bottom: 6px;
}

.affix-desc :deep(p:last-child) {
  margin-bottom: 0;
}

/* ========== C 块：突破材料计算 ========== */
.calc-note {
  margin-bottom: 14px;
  color: var(--clr-white-50);
  font-size: 14px;
  letter-spacing: 1px;
}

.material-rows {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.material-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 14px;
  border-radius: 8px;
  background-color: var(--clr-white-10);
  font-size: 15px;
}

.material-row.mora {
  grid-column: 1 / -1;
  color: #ffcc33;
}

.count {
  color: var(--clr-white-70);
}

/* ========== D 块：武器故事 ========== */
.story-body {
  color: var(--clr-white-70);
  font-size: 16px;
  line-height: 2;
}

/* 多段故事之间：两端淡出的细线 + 中央菱形，靠留白和装饰符分界 */
.story-block + .story-block {
  position: relative;
  margin-top: 32px;
  padding-top: 32px;
}

.story-block + .story-block::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--clr-white-30) 15%,
    var(--clr-white-30) 85%,
    transparent
  );
}

.story-block + .story-block::after {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  width: 9px;
  height: 9px;
  transform: translateX(-50%) rotate(45deg);
  /* background-color: var(--clr-white-50); */
}

.story-block::after {
  background-color: rgb(125, 125, 125);
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
  #weapon-detail {
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

  .panel-title {
    margin-bottom: 12px;
    font-size: 18px;
    letter-spacing: 1px;
  }

  .panel-head {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 12px;
  }

  .panel-head .panel-title {
    margin-bottom: 0;
  }

  /* 立绘与信息并排会挤成一列，改成上下排 */
  .panel-a {
    flex-direction: column;
    gap: 16px;
  }

  .art-box {
    width: 100%;
    min-height: 200px;
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

  .desc {
    font-size: 15px;
  }

  .growth {
    padding: 12px;
  }

  .stat-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
  }

  .stat-value {
    font-size: 20px;
  }

  .affix-desc,
  .story-body {
    font-size: 15px;
    line-height: 1.9;
  }

  /* 窄屏竖屏空间紧，分界线的上下留白相应收小 */
  .story-block + .story-block {
    margin-top: 24px;
    padding-top: 24px;
  }

  /* 材料两列在手机上会截断名字，改成单列 */
  .material-rows {
    grid-template-columns: minmax(0, 1fr);
  }

  .material-row {
    font-size: 14px;
  }
}
</style>
