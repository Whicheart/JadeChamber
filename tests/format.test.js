import { test } from 'node:test'
import assert from 'node:assert/strict'

import { statValue } from '../src/utils/format.js'

test('百分比：小数按 F1/F2 决定位数并乘以 100', () => {
  assert.equal(statValue('P', 0.1234), '12.3%')
  assert.equal(statValue('F1P', 0.1234), '12.3%')
  assert.equal(statValue('F2P', 0.12345), '12.35%')
  assert.equal(statValue('P', 0.096), '9.6%')
})

test('整数：四舍五入到整数', () => {
  assert.equal(statValue('I', 541.83), '542')
  assert.equal(statValue('I', 47.54), '48')
  assert.equal(statValue('I', 0), '0')
})

test('小数：F1/F2 保留位数但不乘 100', () => {
  assert.equal(statValue('F1', 1.25), '1.3')
  assert.equal(statValue('F2', 1.256), '1.26')
})

test('未知格式：原样转字符串', () => {
  assert.equal(statValue('', 12), '12')
  assert.equal(statValue('X', 0.5), '0.5')
})

test('空值：百分比给 0%，其余给 0', () => {
  assert.equal(statValue('P', null), '0%')
  assert.equal(statValue('F1P', undefined), '0%')
  assert.equal(statValue('I', null), '0')
  assert.equal(statValue('F1', ''), '0')
})
