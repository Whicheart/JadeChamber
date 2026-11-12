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
