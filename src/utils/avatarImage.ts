/**
 * 角色图片 URL：图片位于 public/images 下，按资源名拼接运行时路径。
 * 资源命名规则来自后端 iconName / gachaIconName 字段。
 */

const BASE_URL = import.meta.env.BASE_URL

function buildImageUrl(directory: string, fileName?: string): string | undefined {
  if (!fileName) return undefined

  return `${BASE_URL}images/${directory}/${fileName}.webp`
}

/** 抽卡立绘 URL（gachaIconName），用于桌面端卡片。 */
export function getGachaImage(gachaIconName?: string): string | undefined {
  return buildImageUrl('UI_Gacha', gachaIconName)
}

/** 头像 URL（iconName），用于移动端卡片。 */
export function getAvatarIcon(iconName?: string): string | undefined {
  return buildImageUrl('UI_AvatarIcon', iconName)
}
