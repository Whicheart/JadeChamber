/**
 * 图片地址解析
 *
 * 后端现在给的所有图片字段都是「完整的资源文件名」（不含扩展名），而
 * src/assets/img/ 已经按资源类型分目录存放，目录名可以直接从文件名推出来：
 *
 *   UI_AvatarIcon_Ayaka        → UI_AvatarIcon/…   （取前两段）
 *   UI_Gacha_AvatarImg_Ayaka   → UI_Gacha/…
 *   UI_EquipIcon_Bow_Alkonost  → UI_EquipIcon/…
 *   UI_ItemIcon_104161         → UI_ItemIcon/…
 *   UI_RelicIcon_15048_4       → UI_RelicIcon/…
 *   UI_Talent_S_Ayaka_01       → UI_Talent/…
 *   UI_Costume_AyakaCostumeFruhling → UI_Costume/…
 *   UI_Icon_Element_Fire       → UI_Icon/…
 *   UI_TeyvatNumIcon_5         → UI_TeyvatNumIcon/…
 *
 * 例外只有两个没有两段前缀的家族：技能图标 `Skill_A_01` 放 Skill/，
 * 品质底图 `QUALITY_ORANGE` 放 UI_QualityBg/。
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
