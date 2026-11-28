import { buildImageUrl } from './imageUrl'

/** 抽卡立绘 URL（gachaIconName），用于桌面端卡片。 */
export function getGachaImage(gachaIconName?: string): string | undefined {
  return buildImageUrl('UI_Gacha', gachaIconName)
}

/** 头像 URL（iconName），用于移动端卡片。 */
export function getAvatarIcon(iconName?: string): string | undefined {
  return buildImageUrl('UI_AvatarIcon', iconName)
}
