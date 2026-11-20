/**
 * 图片地址解析
 *
 * 通过图片名的二级前缀解析出图片所在的目录，返回图片的地址。
 *
 * 例外：
 * 技能图标位于 Skill/，
 * 品质底图位于 UI_QualityBg/。
 */
const DIR_BY_HEAD = {
  Skill: 'Skill',
  QUALITY: 'UI_QualityBg',
}

export function asset(iconName) {
  if (!iconName) return ''

  const name = String(iconName)
  const head = name.split('_')[0]
  const dir = DIR_BY_HEAD[head] ?? name.split('_').slice(0, 2).join('_')

  return new URL(`../assets/img/${dir}/${name}.webp`, import.meta.url).href
}

/**
 * 杂项 UI 素材地址
 *
 * 强制只指向 img/UI/。
 */
export function uiAsset(iconName) {
  if (!iconName) return ''

  const name = String(iconName)

  return new URL(`../assets/img/UI/${name}.webp`, import.meta.url).href
}

/**
 * 材料图标地址
 *
 * 优先用后端给的 iconName；部分道具（如「坚忍」系列天赋书）的 iconName 仍为 null，
 * 而这些素材的文件名恰好就是 `UI_ItemIcon_<道具 id>`，所以按 id 兜底。
 */
export function materialIcon(item) {
  const iconName = String(item?.iconName || '')
  if (iconName) return asset(iconName)

  const id = item?.id
  return id ? asset(`UI_ItemIcon_${id}`) : ''
}
