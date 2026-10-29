/**
 * 武器类型的唯一映射表
 *
 * 同一件事在不同接口里有两种写法：
 * - 武器列表接口用代码：WEAPON_SWORD_ONE_HAND
 * - 角色 base-info 用中文：单手剑
 * 图标统一取筛选器素材（UI_FilterIcon_Weapon_*.webp）。
 */
export const WEAPON_TYPES = [
  { code: 'WEAPON_SWORD_ONE_HAND', iconName: 'Weapon_Sword', label: '单手剑' },
  { code: 'WEAPON_CLAYMORE', iconName: 'Weapon_Claymore', label: '双手剑' },
  { code: 'WEAPON_POLE', iconName: 'Weapon_Polearm', label: '长柄武器' },
  { code: 'WEAPON_CATALYST', iconName: 'Weapon_Catalyst', label: '法器' },
  { code: 'WEAPON_BOW', iconName: 'Weapon_Bow', label: '弓' },
]

const byCode = new Map(WEAPON_TYPES.map((type) => [type.code, type]))
const byLabel = new Map(WEAPON_TYPES.map((type) => [type.label, type]))

// 代码 → 中文名；未知代码原样返回，缺值给一个占位符
export function weaponLabel(code) {
  return byCode.get(code)?.label || code || '—'
}

// 代码或中文名 → 筛选器图标名；未知返回空串，由调用方决定占位
export function weaponFilterIcon(name) {
  return (byCode.get(name) || byLabel.get(name))?.iconName || ''
}
