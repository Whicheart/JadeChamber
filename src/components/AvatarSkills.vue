<script setup>
import { computed, reactive } from 'vue'
import * as format from '@/utils/format'
import { asset } from '@/utils/getImage'
import { descHtml } from '@/utils/richText'
import SliderRow from '@/components/SliderRow.vue'

const props = defineProps({
  skills: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

const data = computed(() => props.skills || {})

// ========== 技能分类 ==========
// 归属看 iconName：主动技能是 Skill_A / Skill_S / Skill_E + 角色名，
// 少数旧数据仍带 Talent_* 后缀，两套都认
const SKILL_TYPES = [
  { patterns: ['Skill_A', 'Talent_NormalAttack'], label: '普通攻击' },
  { patterns: ['Skill_S', 'Talent_ElementSkill'], label: '元素战技' },
  { patterns: ['Skill_E', 'Talent_ElementBurst'], label: '元素爆发' },
]

function typeOrder(skill) {
  const icon = String(skill?.iconName || '')
  const index = SKILL_TYPES.findIndex((item) =>
    item.patterns.some((pattern) => icon.includes(pattern)),
  )
  return index < 0 ? SKILL_TYPES.length : index
}

// 主动技能：按 普攻 → 战技 → 爆发 排序，同组保持接口原顺序
const combatSkills = computed(() =>
  [...(data.value.combatSkills || [])].sort((a, b) => typeOrder(a) - typeOrder(b)),
)

// ========== 技能图标 ==========
// 接口直接给出资源文件名（Skill_A_01 / UI_Talent_S_Ayaka_05），交给 asset() 解析。
// 只有 iconName 为空（个别角色「暂缺」）或加载失败时才落占位框。
const brokenIcons = reactive(new Set())

function onIconError(iconName) {
  if (iconName) brokenIcons.add(iconName)
}

function iconUrl(iconName) {
  const name = String(iconName || '')

  return name && !brokenIcons.has(name) ? asset(name) : ''
}

// ========== 技能等级 ==========
// 每个技能单独记一个等级，默认 10
const levels = reactive({})

function levelOf(skill) {
  return levels[skill?.id] ?? 10
}

function setLevel(skill, value) {
  levels[skill.id] = Number(value) || 1
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

// descExtra 有内容时只展示它，否则退回 desc
function mainDesc(item) {
  const extra = item?.descExtra
  return extra && String(extra).trim() ? extra : item?.desc
}

// ========== 数值行 ==========
// 形如 "一段伤害|{param1:F1P}"，或 "2枚光幕攻击伤害|({param6:F1P}攻击力+{param7:F1P}元素精通)*2"。
// 只把 {paramN:FMT} 换成数值，模板里其余字符（+ * / 单位文字）原样保留，不参与任何运算
function paramRows(skillData) {
  const descList = skillData?.paramDescList || []
  const params = skillData?.paramList || []

  return descList.map((entry) => {
    const [label, template = ''] = String(entry).split('|')

    const value = template.replace(/\{param(\d+):([^}]+)\}/g, (_, index, fmt) =>
      format.statValue(fmt, Number(params[Number(index) - 1]) || 0),
    )

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
        <img
          v-if="iconUrl(skill.iconName)"
          class="skill-icon"
          :src="iconUrl(skill.iconName)"
          :alt="skill.name + ' 图标'"
          loading="lazy"
          @error="onIconError(skill.iconName)"
        />
        <div v-else class="skill-icon icon-placeholder">图标</div>
        <div class="panel-head-text">
          <h2 class="panel-title">{{ skill.name }}</h2>
        </div>
      </div>

      <div class="skill-desc" v-html="descHtml(mainDesc(skill))"></div>

      <SliderRow
        v-if="maxLevel(skill) > 1"
        :model-value="levelOf(skill)"
        :max="maxLevel(skill)"
        @update:model-value="setLevel(skill, $event)"
      />

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
          <img
            v-if="iconUrl(passive.iconName)"
            class="skill-icon"
            :src="iconUrl(passive.iconName)"
            :alt="passive.name + ' 天赋图标'"
            loading="lazy"
            @error="onIconError(passive.iconName)"
          />
          <div v-else class="skill-icon icon-placeholder">图标</div>
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

/* 天赋图标：透明底细线稿，按 contain 保持原始比例 */
.skill-icon {
  width: 72px;
  height: 72px;
  flex: none;
  object-fit: contain;
}

/* 主动技能图标素材尚未到位，先占位 */
.icon-placeholder {
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

/* ========== 等级滑块（本体在 SliderRow） ========== */
.level-drag {
  margin-top: 4px;
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

/* ========== 窄屏（移动设备）适配 ========== */
@media (max-width: 768px) {
  #avatar-skills {
    gap: 12px;
  }

  .panel {
    gap: 10px;
    padding: 14px;
    border-radius: 14px;
  }

  .panel-title {
    font-size: 18px;
    letter-spacing: 1px;
  }

  .panel-head {
    gap: 12px;
  }

  .skill-icon {
    width: 56px;
    height: 56px;
  }

  .skill-desc,
  .passive-desc {
    font-size: 14px;
    line-height: 1.8;
  }

  .attr-list li {
    gap: 12px;
    padding: 7px 12px;
  }

  .label {
    font-size: 13px;
  }

  /* 参数模板可能很长（如「(121.0%攻击力+241.9%元素精通)*2」），允许折行而不是溢出 */
  .value {
    min-width: 0;
    font-size: 14px;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .passive-list {
    gap: 12px;
  }

  .passive-item {
    gap: 12px;
    padding: 12px 14px;
  }

  .passive-name {
    font-size: 17px;
  }
}
</style>
