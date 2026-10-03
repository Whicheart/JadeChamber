// 角色立绘与抽卡图
export function avatarGacha(name) {
  return new URL(`../assets/avatar/${name}/imgs/gacha.webp`, import.meta.url).href
}
export function avatarSplash(name) {
  return new URL(`../assets/avatar/${name}/imgs/splash.webp`, import.meta.url).href
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

export function starLv(starLvl) {
  return new URL(`../assets/starLv/${starLvl}.webp`, import.meta.url).href
}
export function element(element) {
  return new URL(`../assets/element/${element}.png`, import.meta.url).href
}
export function weaponType(weapon) {
  return new URL(`../assets/weaponType/${weapon}.png`, import.meta.url).href
}

export function material(name, type) {
  return new URL(`../assets/material/${type}/1${name}.webp`, import.meta.url).href
}
