import type { FilterButtonConfig } from '../types'

/** 图标对：默认态与激活态 URL */
export interface IconPair {
  default?: string
  active?: string
}

const iconModules = import.meta.glob('../assets/icon/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const iconUrlMap = (() => {
  const map = new Map<string, string>()

  for (const [path, url] of Object.entries(iconModules)) {
    const fileName = path.split('/').pop()
    if (!fileName) continue
    map.set(fileName.replace(/\.webp$/, ''), url)
  }

  return map
})()

/** 筛选按钮背景图 */
export const filterButtonBackground: IconPair = {
  default: iconUrlMap.get('UI_BtnBg_Filter'),
  active: iconUrlMap.get('UI_BtnBg_Active_Filter'),
}

const elementKeys = ['Fire', 'Water', 'Wind', 'Electric', 'Grass', 'Ice', 'Rock'] as const
const weaponOrder = ['Sword', 'Claymore', 'Pole', 'Bow', 'Catalyst'] as const

const elementLabels: Record<(typeof elementKeys)[number], string> = {
  Fire: '火',
  Water: '水',
  Wind: '风',
  Electric: '雷',
  Grass: '草',
  Ice: '冰',
  Rock: '岩',
}

const weaponLabels: Record<(typeof weaponOrder)[number], string> = {
  Sword: '单手剑',
  Claymore: '双手剑',
  Pole: '长柄武器',
  Bow: '弓',
  Catalyst: '法器',
}

const weaponKeyByType: Record<string, (typeof weaponOrder)[number]> = {
  WEAPON_SWORD_ONE_HAND: 'Sword',
  WEAPON_CLAYMORE: 'Claymore',
  WEAPON_POLE: 'Pole',
  WEAPON_BOW: 'Bow',
  WEAPON_CATALYST: 'Catalyst',
}

function iconPair(group: 'Element' | 'Weapon' | 'Quality', key: string): IconPair {
  return {
    default: iconUrlMap.get(`UI_BtnIcon_${group}_${key}`),
    active: iconUrlMap.get(`UI_BtnIcon_Active_${group}_${key}`),
  }
}

/** 元素筛选按钮（key 与接口 element 枚举一致）。 */
export const elementOptions: FilterButtonConfig[] = elementKeys.map((key) => {
  const pair = iconPair('Element', key)
  return { label: elementLabels[key], value: key, icon: pair.default, activeIcon: pair.active }
})

/** 武器筛选按钮（value 为接口 weaponType 枚举）。 */
export const weaponOptions: FilterButtonConfig[] = weaponOrder.map((key) => {
  const pair = iconPair('Weapon', key)
  return {
    label: weaponLabels[key],
    value: Object.keys(weaponKeyByType).find((type) => weaponKeyByType[type] === key) ?? key,
    icon: pair.default,
    activeIcon: pair.active,
  }
})

/** 星级筛选按钮：仅 4 星与 5 星（当前数据只有这两档）。 */
export const qualityOptions: FilterButtonConfig[] = [4, 5].map((star) => {
  const pair = iconPair('Quality', String(star))
  return { label: `${star} 星`, value: String(star), icon: pair.default, activeIcon: pair.active }
})
