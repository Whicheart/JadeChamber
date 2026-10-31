import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  isPercentProp,
  nextRelicInstanceId,
  propLabel,
  propOptionLabel,
  propText,
  slotOfRelic,
} from '../src/utils/reliquaryProp.js'

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

test('下拉里的词条名：只有攻生防的百分比带 % 后缀', () => {
  assert.equal(propOptionLabel('FIGHT_PROP_HP_PERCENT'), '生命值%')
  assert.equal(propOptionLabel('FIGHT_PROP_ATTACK_PERCENT'), '攻击力%')
  assert.equal(propOptionLabel('FIGHT_PROP_DEFENSE_PERCENT'), '防御力%')

  // 固定值词条本身不重复，不加后缀
  assert.equal(propOptionLabel('FIGHT_PROP_HP'), '生命值')
  assert.equal(propOptionLabel('FIGHT_PROP_ATTACK'), '攻击力')
  assert.equal(propOptionLabel('FIGHT_PROP_DEFENSE'), '防御力')

  // 名字里本来就带「率/伤害」等字的百分比词条也不加，避免出现「暴击率%」
  assert.equal(propOptionLabel('FIGHT_PROP_CRITICAL'), '暴击率')
  assert.equal(propOptionLabel('FIGHT_PROP_CRITICAL_HURT'), '暴击伤害')
  assert.equal(propOptionLabel('FIGHT_PROP_CHARGE_EFFICIENCY'), '元素充能效率')
  assert.equal(propOptionLabel('FIGHT_PROP_FIRE_ADD_HURT'), '火元素伤害加成')
  assert.equal(propOptionLabel('FIGHT_PROP_ELEMENT_MASTERY'), '元素精通')
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

test('展示值：百分比 ×100 保留一位小数，固定值取整', () => {
  assert.equal(propText('FIGHT_PROP_HP', 4780), '4780')
  assert.equal(propText('FIGHT_PROP_ATTACK_PERCENT', 0.466), '46.6%')
  assert.equal(propText('FIGHT_PROP_CRITICAL', 0.035), '3.5%')
  assert.equal(propText('FIGHT_PROP_CHARGE_EFFICIENCY', 0.518), '51.8%')
  assert.equal(propText('FIGHT_PROP_ELEMENT_MASTERY', 28), '28')
})

test('展示值：非法数值退化成占位符', () => {
  assert.equal(propText('FIGHT_PROP_HP', null), '—')
  assert.equal(propText('FIGHT_PROP_HP', undefined), '—')
  assert.equal(propText('FIGHT_PROP_HP', 'abc'), '—')
})

test('部位由 id 左起第四位决定', () => {
  assert.equal(slotOfRelic(48442), '生之花')
  assert.equal(slotOfRelic(48422), '死之羽')
  assert.equal(slotOfRelic(48452), '时之沙')
  assert.equal(slotOfRelic(48412), '空之杯')
  assert.equal(slotOfRelic(48432), '理之冠')
  assert.equal(slotOfRelic(99999), '')
  assert.equal(slotOfRelic(undefined), '')
})

test('实例 id：relicId × 10000 + 四位顺序号', () => {
  // 没有旧记录时从 0001 起
  assert.equal(nextRelicInstanceId([], 59130), 591300001)

  // 已有 591300013 时新增得到 591300014
  assert.equal(nextRelicInstanceId([{ relicId: 59130, id: 591300013 }], 59130), 591300014)

  // 只比较同一个 relicId 的记录
  assert.equal(nextRelicInstanceId([{ relicId: 48442, id: 484420099 }], 59130), 591300001)

  // 顺序号用满 9999 后不再自增
  assert.equal(nextRelicInstanceId([{ relicId: 59130, id: 591309999 }], 59130), null)

  // relicId 非法时不产生 id
  assert.equal(nextRelicInstanceId([], undefined), null)
})
