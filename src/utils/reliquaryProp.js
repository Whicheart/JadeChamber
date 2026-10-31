// 用相对路径而不是 @ 别名：utils 之间互相引用，保持能被 node --test 直接加载
import { statValue } from './format.js'

// 圣遗物词条枚举 → 中文名
// 接口里只给 FIGHT_PROP_*，显示层统一查这张表；固定值与百分比同名，单位靠 isPercentProp 区分
export const PROP_LABELS = {
  FIGHT_PROP_HP: '生命值',
  FIGHT_PROP_HP_PERCENT: '生命值',
  FIGHT_PROP_ATTACK: '攻击力',
  FIGHT_PROP_ATTACK_PERCENT: '攻击力',
  FIGHT_PROP_DEFENSE: '防御力',
  FIGHT_PROP_DEFENSE_PERCENT: '防御力',
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

// 未知枚举原样返回，避免界面上出现空白
export function propLabel(propType) {
  return PROP_LABELS[propType] ?? propType
}

// 下拉选项里的显示名：攻/生/防 的百分比词条与固定值词条同名，
// 只有在下拉这种并排列表里靠 % 后缀才分得清哪个是百分比
const PERCENT_VARIANT_PROPS = new Set([
  'FIGHT_PROP_HP_PERCENT',
  'FIGHT_PROP_ATTACK_PERCENT',
  'FIGHT_PROP_DEFENSE_PERCENT',
])

export function propOptionLabel(propType) {
  return PERCENT_VARIANT_PROPS.has(propType) ? `${propLabel(propType)}%` : propLabel(propType)
}

// 接口里的百分比类词条是小数原始值（0.466 = 46.6%），固定值就是整数：只能按词条名判断单位
const PERCENT_PROPS = new Set([
  'FIGHT_PROP_CRITICAL',
  'FIGHT_PROP_CRITICAL_HURT',
  'FIGHT_PROP_CHARGE_EFFICIENCY',
  'FIGHT_PROP_HEAL_ADD',
])

export function isPercentProp(propType) {
  const type = String(propType ?? '')

  return (
    type.endsWith('_PERCENT') ||
    type.endsWith('_ADD_HURT') ||
    type.endsWith('_SUB_HURT') ||
    PERCENT_PROPS.has(type)
  )
}

// 卡片上直接展示用：百分比 ×100 保留一位小数，固定值取整
export function propText(propType, value) {
  // null 会被 Number 转成 0，必须单独挡掉，否则缺值显示成 0
  if (value === null || value === undefined || value === '') return '—'

  const num = Number(value)

  if (!Number.isFinite(num)) return '—'

  return statValue(isPercentProp(propType) ? 'F1P' : 'I', num)
}

// 圣遗物 id 左起第四位决定部位：4 花、2 羽、5 沙、1 杯、3 冠
const SLOT_BY_DIGIT = {
  4: '生之花',
  2: '死之羽',
  5: '时之沙',
  1: '空之杯',
  3: '理之冠',
}

export function slotOfRelic(relicId) {
  return SLOT_BY_DIGIT[String(relicId)[3]] ?? ''
}

// 同一件圣遗物（relicId）可以有多条实例记录：
// 实例 id = relicId × 10000 + 四位顺序号，如 relicId 59130 → 591300001 … 591309999
const INSTANCE_SEQ_LIMIT = 9999

export function nextRelicInstanceId(list, relicId) {
  const base = Number(relicId) * 10000

  if (!Number.isFinite(base)) return null

  const max = (list || []).reduce((acc, item) => {
    if (Number(item?.relicId) !== Number(relicId)) return acc

    const id = Number(item?.id)

    return Number.isFinite(id) && id > acc ? id : acc
  }, base)

  // 四位顺序号用满就不再自增，交给调用方报错
  return max + 1 > base + INSTANCE_SEQ_LIMIT ? null : max + 1
}
