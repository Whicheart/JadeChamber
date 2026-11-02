export function avatarIcon(fileName) {
  if (!fileName) return ''

  // 1. 去掉前缀
  let cleanName = fileName.replace('UI_AvatarIcon_', '')

  // 2. 用下划线切割取第 0 项
  let avatarName = cleanName.split('_')[0]

  return new URL(`../assets/img/avatar/${avatarName}/${fileName}.webp`, import.meta.url).href
}

// 武器图片：接口给的是完整文件名，如 UI_EquipIcon_Bow_Alkonost_Gacha
// 目录取文件名里的英文名（Bow_Alkonost_Gacha → Alkonost），与角色图同一套「从文件名反推目录」的思路
function weaponDir(fileName) {
  if (!fileName) return ''

  return String(fileName).replace('UI_EquipIcon_', '').split('_')[1] ?? ''
}

function weaponUrl(fileName) {
  if (!fileName) return ''

  return new URL(`../assets/img/weapon/${weaponDir(fileName)}/${fileName}.webp`, import.meta.url)
    .href
}

export function weaponGacha(fileName) {
  return weaponUrl(fileName)
}

export function weaponIcon(fileName) {
  return weaponUrl(fileName)
}

export function weaponAwaken(fileName) {
  return weaponUrl(fileName)
}

// 过滤器
export function filter(name) {
  return new URL(`../assets/img/filter/UI_FilterIcon_${name}.webp`, import.meta.url).href
}

// 品质底图（角色卡 / 武器卡上半部分当背景用）
export function quality(name) {
  return new URL(`../assets/img/quality/${name}.webp`, import.meta.url).href
}

export function material(name, type) {
  return new URL(`../assets/material/${type}/1${name}.webp`, import.meta.url).href
}
