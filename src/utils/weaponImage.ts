import { buildImageUrl } from './imageUrl'

/** 武器抽卡卡图 URL（gachaCardName），用于桌面端卡片。 */
export function getWeaponCardImage(gachaCardName?: string): string | undefined {
  return buildImageUrl('UI_Gacha', gachaCardName)
}

/** 武器图标 URL（iconName），用于移动端卡片。 */
export function getWeaponIcon(iconName?: string): string | undefined {
  return buildImageUrl('UI_EquipIcon', iconName)
}
