import { test } from 'node:test'
import assert from 'node:assert/strict'

import { isPercentProp, propLabel } from '../src/utils/reliquaryProp.js'

test('词条中文名不带百分号：固定值与百分比同名', () => {
  assert.equal(propLabel('FIGHT_PROP_HP'), '生命值')
  assert.equal(propLabel('FIGHT_PROP_HP_PERCENT'), '生命值')
  assert.equal(propLabel('FIGHT_PROP_ATTACK_PERCENT'), '攻击力')
  assert.equal(propLabel('FIGHT_PROP_DEFENSE_PERCENT'), '防御力')
  assert.equal(propLabel('FIGHT_PROP_CRITICAL'), '暴击率')
  assert.equal(propLabel('FIGHT_PROP_ICE_ADD_HURT'), '冰元素伤害加成')
})

test('未知词条枚举原样返回，不出现空白', () => {
  assert.equal(propLabel('FIGHT_PROP_UNKNOWN'), 'FIGHT_PROP_UNKNOWN')
  assert.equal(propLabel(undefined), undefined)
})

test('百分比词条判定：后缀与白名单', () => {
  assert.equal(isPercentProp('FIGHT_PROP_HP_PERCENT'), true)
  assert.equal(isPercentProp('FIGHT_PROP_PHYSICAL_ADD_HURT'), true)
  assert.equal(isPercentProp('FIGHT_PROP_FIRE_SUB_HURT'), true)
  assert.equal(isPercentProp('FIGHT_PROP_CRITICAL'), true)
  assert.equal(isPercentProp('FIGHT_PROP_CRITICAL_HURT'), true)
  assert.equal(isPercentProp('FIGHT_PROP_CHARGE_EFFICIENCY'), true)
  assert.equal(isPercentProp('FIGHT_PROP_HEAL_ADD'), true)

  assert.equal(isPercentProp('FIGHT_PROP_HP'), false)
  assert.equal(isPercentProp('FIGHT_PROP_ATTACK'), false)
  assert.equal(isPercentProp('FIGHT_PROP_DEFENSE'), false)
  assert.equal(isPercentProp('FIGHT_PROP_ELEMENT_MASTERY'), false)
})
