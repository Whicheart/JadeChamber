import { buildImageUrl } from './imageUrl'

/** 圣遗物套装图标 URL（setIconName）。 */
export function getRelicSetIcon(setIconName?: string): string | undefined {
  return buildImageUrl('UI_RelicIcon', setIconName)
}
