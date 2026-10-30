<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import request from '@/utils/request'
import { statValue } from '@/utils/format'
import LoadState from '@/components/LoadState.vue'

const props = defineProps({
  // 当前圣遗物套装的星级，决定展示哪一档词条数值
  rankLevel: { type: Number, default: 5 },
})

const RANK_OPTIONS = [1, 2, 3, 4, 5]

const rankLevels = ref([])
const loading = ref(true)
const failed = ref(false)

// 导航栏当前选中的星级，默认跟随套装星级，用户可以自己切
const activeRank = ref(props.rankLevel || 5)

// 换套装时回到该套装自己的星级
watch(
  () => props.rankLevel,
  (value) => {
    activeRank.value = value || 5
  },
)

// propType → 中文名；生命值/攻击力/防御力 的固定值与百分比同名，用空格 + % 区分
const PROP_LABELS = {
  FIGHT_PROP_HP: '生命值',
  FIGHT_PROP_HP_PERCENT: '生命值 %',
  FIGHT_PROP_ATTACK: '攻击力',
  FIGHT_PROP_ATTACK_PERCENT: '攻击力 %',
  FIGHT_PROP_DEFENSE: '防御力',
  FIGHT_PROP_DEFENSE_PERCENT: '防御力 %',
  FIGHT_PROP_CRITICAL: '暴击率',
  FIGHT_PROP_CRITICAL_HURT: '暴击伤害',
  FIGHT_PROP_CHARGE_EFFICIENCY: '元素充能效率',
  FIGHT_PROP_HEAL_ADD: '治疗加成',
  FIGHT_PROP_ELEMENT_MASTERY: '元素精通',
  FIGHT_PROP_FIRE_ADD_HURT: '火元素伤害加成',
  FIGHT_PROP_ELEC_ADD_HURT: '雷元素伤害加成',
  FIGHT_PROP_WATER_ADD_HURT: '水元素伤害加成',
  FIGHT_PROP_WIND_ADD_HURT: '风元素伤害加成',
  FIGHT_PROP_ROCK_ADD_HURT: '岩元素伤害加成',
  FIGHT_PROP_GRASS_ADD_HURT: '草元素伤害加成',
  FIGHT_PROP_ICE_ADD_HURT: '冰元素伤害加成',
  FIGHT_PROP_PHYSICAL_ADD_HURT: '物理伤害加成',
  FIGHT_PROP_FIRE_SUB_HURT: '火元素抗性',
}

// 接口里没有单位信息，只能按词条名判断：百分比类的值要 ×100 显示
function isPercentProp(propType) {
  return (
    propType.endsWith('_PERCENT') ||
    propType.endsWith('_ADD_HURT') ||
    propType.endsWith('_SUB_HURT') ||
    propType === 'FIGHT_PROP_CRITICAL' ||
    propType === 'FIGHT_PROP_CRITICAL_HURT' ||
    propType === 'FIGHT_PROP_CHARGE_EFFICIENCY' ||
    propType === 'FIGHT_PROP_HEAL_ADD'
  )
}

// 主属性是游戏内一位小数的显示口径，副属性按两位小数，否则 1.17% 会被四舍五入成 1.2%
function formatValue(propType, value, digits) {
  const format = isPercentProp(propType) ? (digits === 2 ? 'F2P' : 'F1P') : 'I'

  return statValue(format, Number(value) || 0)
}

// 接口里真实存在的星级才可点，缺档的按钮置灰
const availableRanks = computed(() => new Set(rankLevels.value.map((rank) => rank.rankLevel)))

const currentRank = computed(
  () =>
    rankLevels.value.find((rank) => rank.rankLevel === activeRank.value) ||
    rankLevels.value[rankLevels.value.length - 1] ||
    null,
)

function toRows(list) {
  return (list || []).map((prop) => ({
    propType: prop.propType,
    label: PROP_LABELS[prop.propType] || prop.propType,
    values: prop.values || [],
  }))
}

const mainRows = computed(() => toRows(currentRank.value?.mainProps))

const appendRows = computed(() => toRows(currentRank.value?.appendProps))

// 列数直接取第一条词条的档位个数：1 星是 16 档（Lv.0–15），2–5 星是 21 档（Lv.0–20）
const mainLevels = computed(() => mainRows.value[0]?.values.length || 0)

const appendLevels = computed(() => appendRows.value[0]?.values.length || 0)

const rootRef = ref(null)

/* ========== 行列十字定位 ==========
 * 桌面端鼠标悬停即高亮，移动端没有 hover，改成点一下高亮、再点一下取消。
 * focus.row / focus.col 为 -1 表示这一侧不参与高亮（只亮行或只亮列）。
 */
const canHover = window.matchMedia('(hover: hover)').matches

const focus = reactive({ table: null, row: -1, col: -1 })

function setFocus(table, row, col) {
  if (focus.table === table && focus.row === row && focus.col === col) return

  focus.table = table
  focus.row = row
  focus.col = col
}

function clearFocus() {
  setFocus(null, -1, -1)
}

// 触屏设备点击时也会补发一次 mouseover，不能让悬停逻辑把它抵消掉
function onCellOver(table, row, col) {
  if (canHover) setFocus(table, row, col)
}

function onRowOver(table, row) {
  if (canHover) setFocus(table, row, -1)
}

function onColOver(table, col) {
  if (canHover) setFocus(table, -1, col)
}

function onTableLeave() {
  if (canHover) clearFocus()
}

function toggleFocus(table, row, col) {
  if (focus.table === table && focus.row === row && focus.col === col) clearFocus()
  else setFocus(table, row, col)
}

function cellClass(table, row, col) {
  const active = focus.table === table

  return {
    'hl-row': active && focus.row === row,
    'hl-col': active && focus.col === col,
  }
}

function rowHeadClass(table, row) {
  return { 'hl-row': focus.table === table && focus.row === row }
}

function colHeadClass(table, col) {
  return { 'hl-col': focus.table === table && focus.col === col }
}

// 切换星级后列数与档位都变了，把两张表滚回左上角
async function selectRank(level) {
  if (level === activeRank.value || !availableRanks.value.has(level)) return

  activeRank.value = level
  // 行下标在换星级后含义变了，旧的高亮直接清掉
  clearFocus()

  await nextTick()

  rootRef.value?.querySelectorAll('.table-wrap').forEach((el) => {
    el.scrollTop = 0
    el.scrollLeft = 0
  })
}

async function loadRank() {
  loading.value = true
  failed.value = false

  try {
    const data = await request.get('/api/reliquary/prop-rank')
    rankLevels.value = data?.rankLevels || []
  } catch (error) {
    console.error('获取圣遗物词条数值失败：', error)
    rankLevels.value = []
    failed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadRank)
</script>

<template>
  <div ref="rootRef" class="prop-rank">
    <LoadState v-if="failed" failed failed-text="词条数值加载失败" @retry="loadRank" />

    <LoadState v-else-if="loading" loading loading-text="正在加载词条数值..." />

    <template v-else-if="currentRank">
      <div class="rank-head">
        <h2 class="rank-title">词条数值</h2>

        <!-- 星级导航：默认选中套装星级，可手动切 1~5 星 -->
        <nav class="rank-nav" aria-label="选择星级">
          <button
            v-for="level in RANK_OPTIONS"
            :key="level"
            type="button"
            class="rank-nav-btn"
            :class="{ active: level === activeRank }"
            :aria-pressed="level === activeRank"
            :disabled="!availableRanks.has(level)"
            @click="selectRank(level)"
          >
            {{ level }}★
          </button>
        </nav>
      </div>

      <!-- 主属性：一行一个词条，一列一个等级 -->
      <h3 class="table-title">主属性</h3>
      <div class="table-wrap" @mouseleave="onTableLeave">
        <table class="prop-table">
          <thead>
            <tr>
              <th class="corner" scope="col">属性</th>
              <th
                v-for="level in mainLevels"
                :key="level"
                scope="col"
                :class="colHeadClass('main', level - 1)"
                @mouseover="onColOver('main', level - 1)"
                @click="toggleFocus('main', -1, level - 1)"
              >
                Lv.{{ level - 1 }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in mainRows" :key="row.propType">
              <th
                scope="row"
                :class="rowHeadClass('main', rowIndex)"
                @mouseover="onRowOver('main', rowIndex)"
                @click="toggleFocus('main', rowIndex, -1)"
              >
                {{ row.label }}
              </th>
              <td
                v-for="(value, colIndex) in row.values"
                :key="colIndex"
                :class="cellClass('main', rowIndex, colIndex)"
                @mouseover="onCellOver('main', rowIndex, colIndex)"
                @click="toggleFocus('main', rowIndex, colIndex)"
              >
                {{ formatValue(row.propType, value, 1) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 副属性：每次强化随机命中其中一档 -->
      <h3 class="table-title">副属性</h3>
      <p class="table-note">副词条每次强化随机命中其中一档</p>
      <div class="table-wrap" @mouseleave="onTableLeave">
        <table class="prop-table">
          <thead>
            <tr>
              <th class="corner" scope="col">属性</th>
              <th
                v-for="level in appendLevels"
                :key="level"
                scope="col"
                :class="colHeadClass('append', level - 1)"
                @mouseover="onColOver('append', level - 1)"
                @click="toggleFocus('append', -1, level - 1)"
              >
                第 {{ level }} 档
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in appendRows" :key="row.propType">
              <th
                scope="row"
                :class="rowHeadClass('append', rowIndex)"
                @mouseover="onRowOver('append', rowIndex)"
                @click="toggleFocus('append', rowIndex, -1)"
              >
                {{ row.label }}
              </th>
              <td
                v-for="(value, colIndex) in row.values"
                :key="colIndex"
                :class="cellClass('append', rowIndex, colIndex)"
                @mouseover="onCellOver('append', rowIndex, colIndex)"
                @click="toggleFocus('append', rowIndex, colIndex)"
              >
                {{ formatValue(row.propType, value, 2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <p v-else class="empty">暂无词条数据</p>
  </div>
</template>

<style scoped>
.prop-rank {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.rank-title {
  color: var(--clr-white);
  font-size: 20px;
  font-weight: normal;
  letter-spacing: 2px;
}

/* 星级导航：与详情页页签同一套胶囊按钮 */
.rank-nav {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--clr-white-10);
  border-radius: 9999px;
  background-color: var(--clr-white-10);
}

.rank-nav-btn {
  min-width: 52px;
  height: 30px;
  border: none;
  border-radius: 9999px;
  background-color: transparent;
  color: var(--clr-white-50);
  font-size: 13px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: 200ms;
}

.rank-nav-btn:hover:not(:disabled) {
  background-color: var(--clr-white-10);
  color: var(--clr-white-80);
}

.rank-nav-btn.active {
  background-color: var(--clr-white-20);
  color: var(--clr-white);
}

.rank-nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.table-title {
  margin-top: 6px;
  color: var(--clr-white-80);
  font-size: 15px;
  font-weight: normal;
  letter-spacing: 1px;
}

.table-note {
  margin-top: -6px;
  color: var(--clr-white-40);
  font-size: 13px;
}

/* 表格容器：横竖都能滚，表头和首列吸附 */
.table-wrap {
  overflow: auto;
  /* 限定高度，否则表头的 sticky 失效——21 列数值离开表头就没法读 */
  max-height: 420px;
  border: 1px solid var(--clr-white-10);
  border-radius: 12px;
  background-color: var(--clr-black-10);
  scrollbar-width: thin;
  scrollbar-color: var(--clr-white-20) transparent;
}

.table-wrap::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-wrap::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background-color: var(--clr-white-20);
}

.prop-table {
  /* 21 列不允许被压扁，超出容器就走横向滚动 */
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  white-space: nowrap;
}

.prop-table th,
.prop-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--clr-white-10);
}

.prop-table tbody tr:last-child th,
.prop-table tbody tr:last-child td {
  border-bottom: none;
}

/* 表头吸顶 */
.prop-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: var(--clr-black-90);
  color: var(--clr-white-50);
  font-weight: normal;
  text-align: right;
}

/* 词条名吸附在左侧 */
.prop-table tbody th {
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 132px;
  background-color: var(--clr-black-90);
  color: var(--clr-white-80);
  font-weight: normal;
  text-align: left;
}

/* 左上角同时吸顶吸左 */
.prop-table thead th.corner {
  left: 0;
  z-index: 3;
  text-align: left;
}

.prop-table td {
  color: var(--clr-white-70);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/*
 * 行列十字高亮：悬停（桌面）/ 点击（移动端）后把同一行与同一列一起点亮，
 * 21 列的数值离开行列参照很难读，靠这一层做快速定位。
 */
.prop-table td.hl-row,
.prop-table td.hl-col {
  background-color: var(--clr-white-10);
  color: var(--clr-white);
}

/* 十字交叉的那一格再亮一档 */
.prop-table td.hl-row.hl-col {
  background-color: var(--clr-white-20);
}

/* 行标题与列头跟着亮；th 有 sticky 的实心底色，用背景图再叠一层提亮 */
.prop-table thead th.hl-col,
.prop-table tbody th.hl-row {
  color: var(--clr-white);
  background-image: linear-gradient(var(--clr-white-20), var(--clr-white-20));
}

.empty {
  padding: 8px 14px;
  color: var(--clr-white-40);
  font-size: 14px;
}

/* ========== 窄屏（移动设备）适配 ========== */
@media (max-width: 768px) {
  .rank-head {
    gap: 10px;
  }

  .rank-title {
    font-size: 17px;
    letter-spacing: 1px;
  }

  .rank-nav {
    gap: 2px;
    padding: 3px;
  }

  .rank-nav-btn {
    min-width: 44px;
    height: 26px;
    font-size: 12px;
    letter-spacing: 0;
  }

  .table-title {
    font-size: 14px;
  }

  .table-note {
    font-size: 12px;
  }

  .table-wrap {
    max-height: 320px;
  }

  .prop-table {
    font-size: 12px;
  }

  .prop-table th,
  .prop-table td {
    padding: 6px 8px;
  }

  .prop-table tbody th {
    min-width: 104px;
  }
}
</style>
