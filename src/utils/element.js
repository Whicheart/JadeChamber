/**
 * 元素类型的唯一映射表
 *
 * 同一件事在不同接口里有两种写法：
 * - 角色列表接口用资源后缀：Water / Fire / Wind / Electric / Grass / Ice / Rock
 *   （这套值同时也是 `/api/avatar/list?elements=` 的取值，筛选时不能改）
 * - 角色 base-info 用中文：冰 / 水 / 火 / 雷 / 风 / 岩 / 草
 *
 * 图标素材有三套同后缀的家族，按用途取：
 * - UI_Icon_Element_*  白色线稿，给筛选按钮当 mask 用
 * - UI_Icon_Common_*   彩色圆形，给详情页展示用
 * - UI_Icon_Player_*   彩色菱形神之眼，备用
 */
export const ELEMENT_TYPES = [
  { name: 'Fire', label: '火', color: 'rgb(251, 155, 6)' },
  { name: 'Water', label: '水', color: 'rgb(53, 197, 249)' },
  { name: 'Wind', label: '风', color: 'rgb(103, 253, 208)' },
  { name: 'Electric', label: '雷', color: 'rgb(219, 147, 255)' },
  { name: 'Grass', label: '草', color: 'rgb(8, 228, 92)' },
  { name: 'Ice', label: '冰', color: 'rgb(140, 242, 254)' },
  { name: 'Rock', label: '岩', color: 'rgb(251, 203, 105)' },
]

const byName = new Map(ELEMENT_TYPES.map((type) => [type.name, type]))
const byLabel = new Map(ELEMENT_TYPES.map((type) => [type.label, type]))

// 代码（Water）或中文（水）都能查到同一条
function findElement(value) {
  return byName.get(value) || byLabel.get(value) || null
}

// 筛选按钮激活时的主题色；未知值给白色
export function elementColor(value) {
  return findElement(value)?.color || 'var(--clr-white)'
}

// 筛选器图标（白线稿，靠 mask 着色）；未知值返回空串，由调用方决定占位
export function elementFilterIcon(value) {
  const type = findElement(value)

  return type ? `UI_Icon_Element_${type.name}` : ''
}

// 详情页展示用图标（彩色圆形）
export function elementCommonIcon(value) {
  const type = findElement(value)

  return type ? `UI_Icon_Common_${type.name}` : ''
}
