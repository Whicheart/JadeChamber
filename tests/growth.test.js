import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  FIRST_PROMOTE_LEVEL,
  mergeMaterials,
  moraTotal,
  promoteThreshold,
  reachedStages,
  valueAt,
} from '../src/utils/growth.js'

// 与真实武器接口同构的六阶突破数据
const stages = [
  { maxLevel: 40, mora: 10000, costItems: [{ id: 114001, name: '材料A', count: 3 }] },
  {
    maxLevel: 50,
    mora: 20000,
    costItems: [
      { id: 114001, name: '材料A', count: 3 },
      { id: 114002, name: '材料B', count: 2 },
    ],
  },
  { maxLevel: 60, mora: 30000, costItems: [{ id: 114002, name: '材料B', count: 4 }] },
  { maxLevel: 70, mora: 45000, costItems: [] },
  { maxLevel: 80, mora: 55000, costItems: [] },
  { maxLevel: 90, mora: 65000, costItems: [] },
]

test('FIRST_PROMOTE_LEVEL 是 20 级', () => {
  assert.equal(FIRST_PROMOTE_LEVEL, 20)
})

test('valueAt：下标 = 等级 - 1，越界钳到两端', () => {
  const atk = [47.54, 52.1, 58.3]

  assert.equal(valueAt(atk, 1), 47.54)
  assert.equal(valueAt(atk, 3), 58.3)
  assert.equal(valueAt(atk, 0), 47.54)
  assert.equal(valueAt(atk, 99), 58.3)
  assert.equal(valueAt(atk, 2.7), 52.1)
})

test('valueAt：空数组或非法等级走 fallback', () => {
  assert.equal(valueAt([], 5), 0)
  assert.equal(valueAt(null, 5, null), null)
  assert.equal(valueAt(undefined, 1, '—'), '—')
})

test('promoteThreshold：首阶 20 级，之后是上一阶的 maxLevel', () => {
  assert.equal(promoteThreshold(stages, 0), 20)
  assert.equal(promoteThreshold(stages, 1), 40)
  assert.equal(promoteThreshold(stages, 5), 80)
})

test('reachedStages：门槛 <= 等级即计入', () => {
  assert.equal(reachedStages(stages, 1).length, 0)
  assert.equal(reachedStages(stages, 19).length, 0)
  assert.equal(reachedStages(stages, 20).length, 1)
  assert.equal(reachedStages(stages, 39).length, 1)
  // 40 级可以完成第 2 阶突破，所以门槛 40 的那一阶在 40 级就计入
  assert.equal(reachedStages(stages, 40).length, 2)
  assert.equal(reachedStages(stages, 41).length, 2)
  assert.equal(reachedStages(stages, 90).length, 6)
  assert.equal(reachedStages(stages, 100).length, 6)
})

test('mergeMaterials：按 id 累加数量，且默认同家族相邻、组内 id 降序', () => {
  const merged = mergeMaterials(reachedStages(stages, 60))

  assert.deepEqual(merged, [
    { id: 114002, name: '材料B', count: 6 },
    { id: 114001, name: '材料A', count: 6 },
  ])
})

test('mergeMaterials：不传任何参数即按 id 前 4 位分族，组内高阶在前', () => {
  const mixed = [
    {
      costItems: [
        { id: 114001, name: '同族低阶', count: 1 },
        { id: 134001, name: '另一族', count: 1 },
        { id: 114003, name: '同族高阶', count: 1 },
      ],
    },
  ]

  assert.deepEqual(
    mergeMaterials(mixed).map((item) => item.id),
    [114003, 114001, 134001],
  )
})

test('mergeMaterials：前 4 位相同的多个材料族各自连续、族内降序', () => {
  const sharedPrefix = [
    {
      costItems: [
        { id: 112125, name: '磨损的执凭', count: 15 },
        { id: 112140, name: '失色的焰剑', count: 23 },
        { id: 112127, name: '霜镌的执凭', count: 27 },
        { id: 112142, name: '宝饰的焰剑', count: 41 },
      ],
    },
  ]

  assert.deepEqual(
    mergeMaterials(sharedPrefix).map((item) => item.id),
    [112142, 112140, 112127, 112125],
  )
})

test('moraTotal：各阶摩拉求和，缺字段按 0', () => {
  assert.equal(moraTotal(stages), 225000)
  assert.equal(moraTotal([{ mora: 10000 }, {}, null]), 10000)
  assert.equal(moraTotal([]), 0)
})
