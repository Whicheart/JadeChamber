import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  appendTiersOf,
  clampSimulateTimes,
  createAccumulator,
  MAX_SIMULATE_TIMES,
  maxMainValue,
  MIN_SIMULATE_TIMES,
  rankRuleOf,
  scoreOf,
  SIMULATE_CHUNK_SIZE,
  simulateBatch,
  simulateDistribution,
  simulateOnce,
  UPGRADE_TIMES,
} from '../src/utils/potential.js'

const APPEND = [
  { propName: 'FIGHT_PROP_CRITICAL', propValue: 0.05 },
  { propName: 'FIGHT_PROP_CRITICAL_HURT', propValue: 0.1 },
]

const TIERS = {
  FIGHT_PROP_CRITICAL: [0.0272, 0.0311, 0.035, 0.0389],
  FIGHT_PROP_CRITICAL_HURT: [0.0544, 0.0622, 0.0699, 0.0777],
}

const fixed = (value) => () => value

// 固定种子的伪随机，保证「一次跑完」与「分片跑完」可以逐字段对比
const seedRandom = (seed) => {
  let state = seed

  return () => {
    state = (state * 1103515245 + 12345) % 2147483648

    return state / 2147483648
  }
}

test('分数口径：暴击率 ×2 + 暴击伤害，按百分数算', () => {
  assert.equal(scoreOf(APPEND), 20)
  // 10% 暴击率 + 20% 暴击伤害 = 40 分
  assert.equal(
    scoreOf([
      { propName: 'FIGHT_PROP_CRITICAL', propValue: 0.1 },
      { propName: 'FIGHT_PROP_CRITICAL_HURT', propValue: 0.2 },
    ]),
    40,
  )
  // 缺哪条就当 0
  assert.equal(scoreOf([{ propName: 'FIGHT_PROP_CRITICAL', propValue: 0.05 }]), 10)
  assert.equal(scoreOf([]), 0)
  assert.equal(scoreOf(undefined), 0)
})

test('一次模拟固定五次升级，每次都加在主词条之外的副词条上', () => {
  // random 恒为 0：每次都抽第一条副词条的第 0 档
  const { values, score } = simulateOnce(APPEND, TIERS, fixed(0))

  assert.equal(UPGRADE_TIMES, 5)
  assert.ok(Math.abs(values[0] - (0.05 + 5 * 0.0272)) < 1e-12)
  assert.ok(Math.abs(values[1] - 0.1) < 1e-12)
  assert.ok(Math.abs(score - (values[0] * 100 * 2 + values[1] * 100)) < 1e-9)
})

test('random 恒为 0.9 时抽到第二条副词条，档位也落在靠后的位置', () => {
  const { values } = simulateOnce(APPEND, TIERS, fixed(0.9))

  // floor(0.9 * 2) = 1 → 第二条；floor(0.9 * 4) = 3 → 第 3 档
  assert.ok(Math.abs(values[1] - (0.1 + 5 * 0.0777)) < 1e-12)
  assert.ok(Math.abs(values[0] - 0.05) < 1e-12)
})

test('没有副词条时不产生分数，也不会崩', () => {
  assert.deepEqual(simulateOnce([], TIERS, fixed(0)), { values: [], score: 0 })
})

test('多次模拟取平均分，并给出最高 / 最低分与分布', () => {
  const result = simulateDistribution(3, APPEND, TIERS, fixed(0))

  assert.equal(result.times, 3)
  assert.equal(result.best, result.worst)
  assert.ok(Math.abs(result.average - result.best) < 1e-9)
  // 每次都抽同一档，所以只有一个分数档位
  assert.equal(result.points.length, 1)
  assert.equal(result.points[0].count, 3)
  assert.equal(result.mode.count, 3)

  // 次数为 0 时不做任何事
  assert.deepEqual(simulateDistribution(0, APPEND, TIERS, fixed(0)), {
    times: 0,
    average: 0,
    best: 0,
    worst: 0,
    points: [],
    mode: null,
  })
})

test('模拟次数钳制到 1 ~ 1000000', () => {
  assert.equal(clampSimulateTimes(0), MIN_SIMULATE_TIMES)
  assert.equal(clampSimulateTimes(-20), MIN_SIMULATE_TIMES)
  assert.equal(clampSimulateTimes(''), MIN_SIMULATE_TIMES)
  assert.equal(clampSimulateTimes('abc'), MIN_SIMULATE_TIMES)
  assert.equal(clampSimulateTimes(1), 1)
  assert.equal(clampSimulateTimes(500), 500)
  assert.equal(clampSimulateTimes(2.6), 3)
  assert.equal(clampSimulateTimes(10000), 10000)
  assert.equal(clampSimulateTimes(MAX_SIMULATE_TIMES), MAX_SIMULATE_TIMES)
  assert.equal(clampSimulateTimes(MAX_SIMULATE_TIMES + 1), MAX_SIMULATE_TIMES)
  assert.equal(clampSimulateTimes(MAX_SIMULATE_TIMES * 10), MAX_SIMULATE_TIMES)
})

test('从 prop-rank 取星级规则与档位、满级主词条', () => {
  const rankLevels = [
    {
      rankLevel: 4,
      mainProps: [{ propType: 'FIGHT_PROP_HP', values: [430, 500] }],
      appendProps: [{ propType: 'FIGHT_PROP_CRITICAL', values: [0.0233, 0.0266, 0.0299] }],
    },
    {
      rankLevel: 5,
      mainProps: [{ propType: 'FIGHT_PROP_HP', values: [717, 1000, 4780] }],
      appendProps: [
        { propType: 'FIGHT_PROP_CRITICAL', values: [0.0272, 0.0311, 0.035, 0.0389] },
        { propType: 'FIGHT_PROP_ATTACK', values: [] },
      ],
    },
  ]

  const five = rankRuleOf(rankLevels, 5)
  assert.equal(five.rankLevel, 5)
  assert.equal(rankRuleOf(rankLevels, 3), null)

  const tiers = appendTiersOf(five)
  assert.deepEqual(tiers.FIGHT_PROP_CRITICAL, [0.0272, 0.0311, 0.035, 0.0389])
  // 空档位被丢掉，避免抽到 0 却仍占一次升级
  assert.equal(tiers.FIGHT_PROP_ATTACK, undefined)

  assert.equal(maxMainValue(five, 'FIGHT_PROP_HP'), 4780)
  assert.equal(maxMainValue(five, 'FIGHT_PROP_ATK_PERCENT'), 0)
})

test('累加器按分数聚合：x 轴分数升序、y 轴次数，最多的一档就是众数', () => {
  const accumulator = createAccumulator()

  for (const score of [10, 20, 20, 30, 50]) accumulator.add([score], score)

  const { points, mode, times, average, best, worst } = accumulator.finish()

  assert.deepEqual(
    points.map((point) => [point.score, point.count]),
    [
      [10, 1],
      [20, 2],
      [30, 1],
      [50, 1],
    ],
  )
  assert.equal(mode.score, 20)
  assert.equal(mode.count, 2)
  // 众数带着那一次的副词条终值，供「最常见结果」展示
  assert.deepEqual(mode.values, [20])
  assert.equal(times, 5)
  assert.equal(average, 26)
  assert.equal(best, 50)
  assert.equal(worst, 10)
})

test('浮点误差按两位小数归并，避免同一分数被拆成好几档', () => {
  const accumulator = createAccumulator()

  for (const score of [28.811, 28.8110001, 28.81]) accumulator.add([score], score)

  const { points } = accumulator.finish()

  assert.equal(points.length, 1)
  assert.equal(points[0].score, 28.81)
  assert.equal(points[0].count, 3)
})

test('分片累加与一次跑完的结果逐字段一致', () => {
  const oneShot = simulateDistribution(1000, APPEND, TIERS, seedRandom(7))

  const accumulator = createAccumulator()
  const random = seedRandom(7)
  let done = 0

  while (done < 1000) {
    const step = Math.min(SIMULATE_CHUNK_SIZE, 1000 - done)

    simulateBatch(step, APPEND, TIERS, accumulator, random)
    done += step
  }

  assert.deepEqual(accumulator.finish(), oneShot)
})

test('累加器不保留逐次样本，内存只跟分数档位数有关', () => {
  const accumulator = createAccumulator()
  const random = seedRandom(11)

  simulateBatch(20000, APPEND, TIERS, accumulator, random)

  const result = accumulator.finish()

  assert.equal(result.times, 20000)
  // 只有累加器与统计结果，没有任何 samples 数组
  assert.deepEqual(Object.keys(result).sort(), [
    'average',
    'best',
    'mode',
    'points',
    'times',
    'worst',
  ])
  assert.ok(result.points.length <= 20000)
  assert.equal(
    result.points.reduce((total, point) => total + point.count, 0),
    20000,
  )
})
