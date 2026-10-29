import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  descHtml,
  escapeHtml,
  lineToHtml,
  linesToHtml,
  stripLinkTags,
  textLines,
} from '../src/utils/richText.js'

test('escapeHtml：只转义 & < >', () => {
  assert.equal(escapeHtml('<i>a & b</i>'), '&lt;i&gt;a &amp; b&lt;/i&gt;')
})

test('lineToHtml：颜色标签转 span，其余字符转义', () => {
  assert.equal(
    lineToHtml('暴击伤害提升<color=#99FFFFFF>56%</color>，持续10秒'),
    '暴击伤害提升<span style="color:#99FFFFFF">56%</span>，持续10秒',
  )
})

test('lineToHtml：斜体标签转 em', () => {
  assert.equal(lineToHtml('<i>注意</i>'), '<em>注意</em>')
})

test('lineToHtml：不在白名单里的标签被转义成文本', () => {
  assert.equal(lineToHtml('<b>x</b>'), '&lt;b&gt;x&lt;/b&gt;')
})

test('stripLinkTags：只保留跳转标记中间的文字', () => {
  assert.equal(stripLinkTags('{LINK#22321}旅行者{/LINK}的技能'), '旅行者的技能')
  assert.equal(stripLinkTags(''), '')
})

test('descHtml：按字面量 \\n 断行，每行一个 <p>', () => {
  const text = '第一行\\n第二行<color=#FF0000>红</color>'

  assert.equal(descHtml(text), '<p>第一行</p><p>第二行<span style="color:#FF0000">红</span></p>')
  assert.equal(descHtml(''), '')
  assert.equal(descHtml(null), '')
})

test('textLines：真实换行与字面量 \\n 都算断行，空行丢弃', () => {
  assert.deepEqual(textLines('一\n二\\n\n  三  \n'), ['一', '二', '三'])
  assert.deepEqual(textLines(''), [])
  assert.deepEqual(textLines(null), [])
})

test('linesToHtml：逐行转 HTML 片段', () => {
  assert.deepEqual(linesToHtml('一\\n<i>二</i>'), ['一', '<em>二</em>'])
})
