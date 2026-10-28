/**
 * 游戏文本富文本处理
 *
 * 角色技能描述、武器精炼描述用的是同一套约定：
 * - 只认 <color=#RRGGBB(AA)>…</color> 与 <i>…</i> 两类标签，其余字符一律转义
 * - 换行是字面量 \n（反斜杠 + n），不是真正的换行符
 */

export function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const INLINE_TAG_RE = /<color=#([0-9A-Fa-f]{6,8})>|<\/color>|<i>|<\/i>/g

// 把一行文本里允许的标签转成 span/em，其余内容转义，返回可直接 v-html 的片段
export function lineToHtml(line) {
  let html = ''
  let last = 0
  let match = INLINE_TAG_RE.exec(line)

  while (match) {
    html += escapeHtml(line.slice(last, match.index))
    if (match[1]) html += `<span style="color:#${match[1]}">`
    else if (match[0] === '</color>') html += '</span>'
    else if (match[0] === '<i>') html += '<em>'
    else html += '</em>'
    last = INLINE_TAG_RE.lastIndex
    match = INLINE_TAG_RE.exec(line)
  }

  html += escapeHtml(line.slice(last))
  return html
}

// 按字面量 \n 断行，每行包一个 <p>；行内的颜色/斜体标签保留
export function descHtml(text) {
  if (!text) return ''

  return String(text)
    .split('\\n')
    .map((line) => `<p>${lineToHtml(line)}</p>`)
    .join('')
}
