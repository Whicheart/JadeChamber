import { test } from 'node:test'
import assert from 'node:assert/strict'

import { WEAPON_TYPES, weaponFilterIcon, weaponLabel } from '../src/utils/weapon.js'

test('WEAPON_TYPES 覆盖后端全部 5 种武器代码', () => {
  assert.deepEqual(
    WEAPON_TYPES.map((type) => type.code),
    ['WEAPON_SWORD_ONE_HAND', 'WEAPON_CLAYMORE', 'WEAPON_POLE', 'WEAPON_CATALYST', 'WEAPON_BOW'],
  )
})

test('weaponLabel：代码转中文名，缺值给占位符', () => {
  assert.equal(weaponLabel('WEAPON_SWORD_ONE_HAND'), '单手剑')
  assert.equal(weaponLabel('WEAPON_POLE'), '长柄武器')
  assert.equal(weaponLabel('WEAPON_BOW'), '弓')
  assert.equal(weaponLabel(''), '—')
  assert.equal(weaponLabel(undefined), '—')
  assert.equal(weaponLabel('WEAPON_UNKNOWN'), 'WEAPON_UNKNOWN')
})

test('weaponFilterIcon：代码与中文名都能取到同一个图标名', () => {
  assert.equal(weaponFilterIcon('WEAPON_BOW'), 'Weapon_Bow')
  assert.equal(weaponFilterIcon('弓'), 'Weapon_Bow')
  assert.equal(weaponFilterIcon('双手剑'), 'Weapon_Claymore')
  assert.equal(weaponFilterIcon('WEAPON_POLE'), 'Weapon_Polearm')
})

test('weaponFilterIcon：未知输入返回空串，交给调用方占位', () => {
  assert.equal(weaponFilterIcon(''), '')
  assert.equal(weaponFilterIcon(null), '')
  assert.equal(weaponFilterIcon('枪'), '')
})
