import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  ELEMENT_TYPES,
  elementColor,
  elementCommonIcon,
  elementFilterIcon,
} from '../src/utils/element.js'

test('ELEMENT_TYPES：7 种元素，代码与标签都不重复', () => {
  assert.equal(ELEMENT_TYPES.length, 7)
  assert.equal(new Set(ELEMENT_TYPES.map((type) => type.name)).size, 7)
  assert.equal(new Set(ELEMENT_TYPES.map((type) => type.label)).size, 7)
})

test('elementFilterIcon：代码与中文都能解析到白线稿图标', () => {
  assert.equal(elementFilterIcon('Water'), 'UI_Icon_Element_Water')
  assert.equal(elementFilterIcon('水'), 'UI_Icon_Element_Water')
  assert.equal(elementFilterIcon('Electric'), 'UI_Icon_Element_Electric')
  assert.equal(elementFilterIcon('雷'), 'UI_Icon_Element_Electric')
  assert.equal(elementFilterIcon('Ice'), 'UI_Icon_Element_Ice')
})

test('elementCommonIcon：详情页用彩色圆形图标', () => {
  assert.equal(elementCommonIcon('Fire'), 'UI_Icon_Common_Fire')
  assert.equal(elementCommonIcon('火'), 'UI_Icon_Common_Fire')
})

test('elementColor：未知值与空值回落白色', () => {
  assert.equal(elementColor('Wind'), 'rgb(103, 253, 208)')
  assert.equal(elementColor('PYRO'), 'var(--clr-white)')
  assert.equal(elementColor(''), 'var(--clr-white)')
  assert.equal(elementColor(undefined), 'var(--clr-white)')
})

test('未知元素返回空串，由调用方决定占位', () => {
  assert.equal(elementFilterIcon('PYRO'), '')
  assert.equal(elementCommonIcon('unknown'), '')
})
