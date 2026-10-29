export function avatarIcon(fileName) {
  if (!fileName) return ''

  // 1. 去掉前缀
  let cleanName = fileName.replace('UI_AvatarIcon_', '')

  // 2. 用下划线切割取第 0 项
  let avatarName = cleanName.split('_')[0]

  return new URL(`../assets/img/avatar/${avatarName}/${fileName}.webp`, import.meta.url).href
}

// 武器图片
export function weaponGacha(name) {
  return new URL(`../assets/weapon/${name}/gacha.webp`, import.meta.url).href
}
export function weaponIcon(name) {
  return new URL(`../assets/weapon/${name}/icon.webp`, import.meta.url).href
}
export function weaponAwaken(name) {
  return new URL(`../assets/weapon/${name}/awaken.webp`, import.meta.url).href
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
