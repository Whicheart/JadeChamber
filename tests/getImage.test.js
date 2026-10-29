import { test } from 'node:test'
import assert from 'node:assert/strict'

import { avatarIcon, filter, quality } from '../src/utils/getImage.js'

test('avatarIcon：按文件名里的角色目录拼出图片地址', () => {
  assert.ok(
    avatarIcon('UI_AvatarIcon_Ayaka_Splash').endsWith(
      '/assets/img/avatar/Ayaka/UI_AvatarIcon_Ayaka_Splash.webp',
    ),
  )
  assert.ok(
    avatarIcon('UI_AvatarIcon_Qin_Constellation_2').endsWith(
      '/assets/img/avatar/Qin/UI_AvatarIcon_Qin_Constellation_2.webp',
    ),
  )
})

test('avatarIcon：目录名取前缀之后的第一个下划线段（安柏是 Ambor）', () => {
  assert.ok(avatarIcon('UI_AvatarIcon_Ambor_Splash').includes('/avatar/Ambor/'))
})

test('avatarIcon：空文件名返回空串，避免 <img> 拿到 undefined', () => {
  assert.equal(avatarIcon(''), '')
  assert.equal(avatarIcon(null), '')
})

test('filter：拼出筛选器图标地址', () => {
  assert.ok(filter('Weapon_Sword').endsWith('/assets/img/filter/UI_FilterIcon_Weapon_Sword.webp'))
  assert.ok(filter('Element_Pyro').endsWith('/filter/UI_FilterIcon_Element_Pyro.webp'))
})

test('quality：拼出品质底图地址（文件名就是接口里的 qualityType）', () => {
  assert.ok(quality('QUALITY_ORANGE').endsWith('/assets/img/quality/QUALITY_ORANGE.webp'))
  assert.ok(quality('QUALITY_ORANGE_SP').endsWith('/quality/QUALITY_ORANGE_SP.webp'))
})
