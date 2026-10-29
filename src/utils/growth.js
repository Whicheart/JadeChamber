/**
 * 等级 / 突破 / 材料相关的通用换算
 *
 * 角色与武器的数据结构一致：
 * - 数值数组按等级 1..N 排列，下标 = 等级 - 1
 * - 突破阶段从 20 级开始，之后每一阶的门槛是上一阶的 maxLevel
 */

// 第一阶突破的触发等级（数据表里 stage[0].maxLevel 是 40，前面 20 级的缺口由它补上）
export const FIRST_PROMOTE_LEVEL = 20

// 按等级取数组里的值；等级超出数组长度时钳到两端
export function valueAt(list, level, fallback = 0) {
  if (!Array.isArray(list) || !list.length) return fallback

  const index = Math.min(Math.max(Math.floor(Number(level) || 1), 1), list.length) - 1
  return list[index] ?? fallback
}

// 第 index 阶突破的触发等级
export function promoteThreshold(stages, index) {
  return index === 0 ? FIRST_PROMOTE_LEVEL : Number(stages?.[index - 1]?.maxLevel ?? 0)
}

// 当前等级已经越过的突破阶段
export function reachedStages(stages, level) {
  const list = stages || []
  const reached = []

  for (let index = 0; index < list.length; index++) {
    if (promoteThreshold(list, index) > level) break
    reached.push(list[index])
  }

  return reached
}

// 同一材料家族（id 前 4 位）排在一起，组内按 id 降序（高阶 → 低阶），拖等级时不会跳序
const materialFamily = (id) => String(id).slice(0, 4)

// 把若干突破阶段的 costItems 按 id 累加
// 排序固定为「同家族相邻、组内高阶在前」，不提供关闭开关：
// 角色与武器的材料清单共用这一口径，跨阶拖动等级时材料行不会跳序
export function mergeMaterials(stages) {
  const merged = new Map()

  ;(stages || []).forEach((stage) => {
    ;(stage?.costItems || []).forEach((item) => {
      if (!item || item.id == null) return

      const entry = merged.get(item.id) || {
        id: item.id,
        name: item.name || String(item.id),
        count: 0,
      }
      entry.count += item.count || 0
      merged.set(item.id, entry)
    })
  })

  const list = [...merged.values()]
  const families = []
  list.forEach((item) => {
    const family = materialFamily(item.id)
    if (!families.includes(family)) families.push(family)
  })

  return families.flatMap((family) =>
    list.filter((item) => materialFamily(item.id) === family).sort((a, b) => b.id - a.id),
  )
}

// 若干阶段的摩拉合计
export function moraTotal(stages) {
  return (stages || []).reduce((sum, stage) => sum + (stage?.mora || 0), 0)
}
