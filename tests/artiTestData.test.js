import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { nextRelicInstanceId, slotOfRelic } from '../src/utils/reliquaryProp.js'

const relics = JSON.parse(
  readFileSync(new URL('../src/assets/testJson/artiTest.json', import.meta.url), 'utf8'),
)

test('测试数据字段：relicId 是真实圣遗物 id，id 是其四位顺序号实例', () => {
  assert.ok(Array.isArray(relics) && relics.length > 0)

  for (const relic of relics) {
    assert.equal(typeof relic.relicId, 'number')
    assert.equal(typeof relic.id, 'number')
    assert.ok(relic.id > relic.relicId * 10000, `id 未带 relicId 前缀：${relic.id}`)
    assert.ok(relic.id <= relic.relicId * 10000 + 9999, `顺序号越界：${relic.id}`)
    assert.equal(relic.id % 10000 >= 1, true)
  }
})

test('测试数据实例 id 全局唯一', () => {
  const ids = relics.map((relic) => relic.id)

  assert.equal(new Set(ids).size, ids.length)
})

test('测试数据的部位可以由 relicId 反推，且属于五个部位之一', () => {
  const slots = new Set(['生之花', '死之羽', '时之沙', '空之杯', '理之冠'])

  for (const relic of relics) {
    assert.ok(slots.has(slotOfRelic(relic.relicId)), `relicId ${relic.relicId} 部位非法`)
  }
})

test('测试数据的实例 id 与自增规则一致：同 relicId 从 1 连续编号', () => {
  const groups = new Map()

  for (const relic of relics) {
    const seq = relic.id - relic.relicId * 10000
    groups.set(relic.relicId, [...(groups.get(relic.relicId) ?? []), seq])
  }

  for (const [relicId, seqs] of groups) {
    const sorted = [...seqs].sort((a, b) => a - b)

    assert.deepEqual(
      sorted,
      sorted.map((_, index) => index + 1),
      `relicId ${relicId} 的顺序号不连续`,
    )

    // 用工具函数复算下一条，确认与文件里的最大值衔接
    const maxId = relicId * 10000 + sorted.at(-1)
    assert.equal(
      nextRelicInstanceId([{ relicId, id: maxId }], relicId),
      maxId + 1,
      `relicId ${relicId} 的下一条实例 id 不对`,
    )
  }
})
