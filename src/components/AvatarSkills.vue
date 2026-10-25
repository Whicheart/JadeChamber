<script setup>
import { computed, reactive } from 'vue'
import * as format from '@/utils/format'

const props = defineProps({
  skills: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

const data = computed(() => props.skills || {})

// ========== 技能分类 ==========
// icon 前缀决定归属：Skill_A 普攻、Skill_S 战技、Skill_E 爆发
const SKILL_TYPES = [
  { prefix: 'Skill_A', label: '普通攻击' },
  { prefix: 'Skill_S', label: '元素战技' },
  { prefix: 'Skill_E', label: '元素爆发' },
]

function typeOrder(skill) {
  const icon = String(skill?.icon || '')
  const index = SKILL_TYPES.findIndex((item) => icon.startsWith(item.prefix))
  return index < 0 ? SKILL_TYPES.length : index
}

// 主动技能：按 普攻 → 战技 → 爆发 排序，同组保持接口原顺序
const combatSkills = computed(() =>
  [...(data.value.combatSkills || [])].sort((a, b) => typeOrder(a) - typeOrder(b)),
)

// ========== 技能等级 ==========
// 每个技能单独记一个等级，默认 10
const levels = reactive({})

function levelOf(skill) {
  return levels[skill?.id] ?? 10
}

function setLevel(skill, event) {
  levels[skill.id] = Number(event.target.value) || 1
}

function maxLevel(skill) {
  return (skill?.combatSkillDataList || []).length || 1
}

// 当前等级的数值行（找不到对应等级就退回最后一级）
function currentData(skill) {
  const list = skill?.combatSkillDataList || []
  if (!list.length) return null
  return list.find((item) => item.level === levelOf(skill)) || list[list.length - 1]
}

// ========== 文本处理 ==========
// 库里的换行是字面量 \n（反斜杠 + n）
function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// 只认 <color=#RRGGBB(AA)> </color> <i> </i> 四种标签，其余内容一律转义
const INLINE_TAG_RE = /<color=#([0-9A-Fa-f]{6,8})>|<\/color>|<i>|<\/i>/g

function lineToHtml(line) {
  let html = ''
  let last = 0
  let match = INLINE_TAG_RE.exec(line)

  while (match) {
    html += escapeHtml(line.slice(last, match.index))
    if (match[1]) html += `<span style="color:#${match[1]}">`
    else if (match[0] === '</color>') html += '</span>'
    else if (match[0] === '<i>') html += '<em>'
    else html += '</em>'
    last = INLINE_TAG_RE.lastIndex
    match = INLINE_TAG_RE.exec(line)
  }

  html += escapeHtml(line.slice(last))
  return html
}

// descExtra 有内容时只展示它，否则退回 desc
function mainDesc(item) {
  const extra = item?.descExtra
  return extra && String(extra).trim() ? extra : item?.desc
}

// 按字面量 \n 断行；LINK 外壳去掉、保留链接文字；保留颜色高亮与斜体
function descHtml(text) {
  if (!text) return ''
  return String(text)
    .split('\\n')
    .map((line) => `<p>${lineToHtml(line.replace(/\{LINK#[^}]*\}|\{\/LINK\}/g, ''))}</p>`)
    .join('')
}

// ========== 数值行 ==========
// 形如 "一段伤害|{param1:F1P}"，或 "重击伤害|{param8:F1P}*3"
function paramRows(skillData) {
  const descList = skillData?.paramDescList || []
  const params = skillData?.paramList || []

  return descList.map((entry) => {
    const [label, template = ''] = String(entry).split('|')

    // 模板里的 *N 表示该数值要乘 N 次
    const multMatch = template.match(/\*(\d+)/)
    const mult = multMatch ? Number(multMatch[1]) : 1

    const value = template
      .replace(/\{param(\d+):([^}]+)\}/g, (_, index, fmt) => {
        const raw = Number(params[Number(index) - 1]) || 0
        return format.statValue(fmt, raw * mult)
      })
      .replace(/\*\d+/g, '')
      .trim()

    return { label: label.trim(), value }
  })
}

// ========== 固有天赋 ==========
// 普通被动在前，特殊固有天赋（specialProudSkills）追加在后，同块展示
const passiveSkills = computed(() => [
  ...(data.value.passiveSkills || []),
  ...(data.value.specialProudSkills || []),
])
</script>

<template>
  <div id="avatar-skills">
    <!-- ================= 主动技能（每个技能一块） ================= -->
    <section v-for="skill in combatSkills" :key="skill.id" class="panel">
      <div class="panel-head">
        <div class="skill-icon">图标</div>
        <div class="panel-head-text">
          <h2 class="panel-title">{{ skill.name }}</h2>
        </div>
      </div>

      <div class="skill-desc" v-html="descHtml(mainDesc(skill))"></div>

      <div v-if="maxLevel(skill) > 1" class="level-drag">
        <span class="level-badge">Lv.{{ levelOf(skill) }}</span>
        <input
          class="slider"
          type="range"
          min="1"
          :max="maxLevel(skill)"
          step="1"
          :value="levelOf(skill)"
          @input="setLevel(skill, $event)"
        />
      </div>

      <ul v-if="paramRows(currentData(skill)).length" class="attr-list">
        <li v-for="row in paramRows(currentData(skill))" :key="row.label">
          <span class="label">{{ row.label }}</span>
          <span class="value">{{ row.value }}</span>
        </li>
      </ul>
    </section>

    <!-- ================= 固有天赋 ================= -->
    <section v-if="passiveSkills.length" class="panel">
      <h2 class="panel-title">固有天赋</h2>

      <div class="passive-list">
        <div
          v-for="(passive, index) in passiveSkills"
          :key="`${passive.id}-${index}`"
          class="passive-item"
        >
          <div class="skill-icon">图标</div>
          <div class="passive-content">
            <div class="passive-name">{{ passive.name }}</div>
            <div class="passive-desc" v-html="descHtml(mainDesc(passive))"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
#avatar-skills {
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: var(--clr-white);
}

.panel {
  border: 1px solid var(--clr-white-10);
  border-radius: 16px;
  background-color: var(--clr-black-80);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-title {
  font-size: 22px;
  font-weight: normal;
  letter-spacing: 2px;
}

/* ========== 技能头部 ========== */
.panel-head {
  display: flex;
  align-items: center;
  gap: 16px;
}

.panel-head-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 图标素材未到位，先占位 */
.skill-icon {
  width: 72px;
  height: 72px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed var(--clr-white-20);
  border-radius: 12px;
  background-color: var(--clr-white-10);
  color: var(--clr-white-50);
  font-size: 13px;
}

.skill-desc {
  font-size: 15px;
  line-height: 1.9;
  color: var(--clr-white-70);
}

.skill-desc:empty,
.passive-desc:empty {
  display: none;
}

/* 描述内的段落与斜体（v-html 生成） */
.skill-desc :deep(p),
.passive-desc :deep(p) {
  margin: 0;
}

.skill-desc :deep(p + p),
.passive-desc :deep(p + p) {
  margin-top: 6px;
}

.skill-desc :deep(em),
.passive-desc :deep(em) {
  font-style: italic;
  color: var(--clr-white-50);
}

/* ========== 等级滑块 ========== */
.level-drag {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
}

.level-badge {
  min-width: 84px;
  text-align: center;
  font-size: 18px;
  padding: 6px 12px;
  border-radius: 9999px;
  background-color: var(--clr-white-20);
}

.slider {
  flex: 1;
  height: 4px;
  appearance: none;
  border-radius: 9999px;
  background: var(--clr-white-20);
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--clr-white);
  border: none;
}

/* ========== 数值行 ========== */
.attr-list {
  list-style: none;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
}

.attr-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  border-radius: 8px;
  background-color: var(--clr-white-10);
}

.label {
  color: var(--clr-white-50);
  font-size: 14px;
}

.value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}

/* ========== 固有天赋 ========== */
.passive-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.passive-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 12px;
  background-color: var(--clr-white-10);
}

.passive-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.passive-name {
  font-size: 20px;
  letter-spacing: 1px;
}

.passive-desc {
  font-size: 15px;
  line-height: 1.9;
  color: var(--clr-white-70);
}
</style>
