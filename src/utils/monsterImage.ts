import { buildImageUrl } from './imageUrl'

/** 怪物图标 URL（iconName）。 */
export function getMonsterIcon(iconName?: string): string | undefined {
  return buildImageUrl('UI_MonsterIcon', iconName)
}
