import { test } from 'node:test'
import assert from 'node:assert/strict'

import { createScrollMemory } from '../src/utils/useScrollMemory.js'

// 假的滚动容器：只需要 scrollTop 与 isConnected 两个属性
function makeArea() {
  return { scrollTop: 0, isConnected: true }
}

test('滚动的过程中记下位置，重新激活后写回去', () => {
  const memory = createScrollMemory()
  const area = makeArea()

  memory.scrollRef.value = area
  area.scrollTop = 520
  memory.remember({ currentTarget: area })

  area.scrollTop = 0 // 模拟 DOM 被移出文档后浏览器把位置归零
  memory.restore()

  assert.equal(area.scrollTop, 520)
})

test('元素已脱离文档时补发的 scroll(0) 不覆盖已记住的位置', () => {
  const memory = createScrollMemory()
  const area = makeArea()

  memory.scrollRef.value = area
  area.scrollTop = 520
  memory.remember({ currentTarget: area })

  area.isConnected = false
  area.scrollTop = 0
  memory.remember({ currentTarget: area })

  assert.equal(memory.position(), 520)
})

test('用户自己滚回顶部时，0 是真实位置，要记住', () => {
  const memory = createScrollMemory()
  const area = makeArea()

  memory.scrollRef.value = area
  area.scrollTop = 520
  memory.remember({ currentTarget: area })
  area.scrollTop = 0
  memory.remember({ currentTarget: area })

  assert.equal(memory.position(), 0)

  area.scrollTop = 300
  memory.restore()
  assert.equal(area.scrollTop, 0)
})

test('容器还没渲染出来时 restore 不报错', () => {
  const memory = createScrollMemory()

  assert.doesNotThrow(() => memory.restore())
  assert.equal(memory.position(), 0)
})
