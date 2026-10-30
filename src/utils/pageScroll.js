const SCROLL_SELECTOR = '[data-page-scroll]'
const LINE_HEIGHT = 16

// 一次滚轮事件的位移换算成像素：行模式按行高、页模式按一屏
function normalizeDelta(event, scroller) {
  if (event.deltaMode === 1) return event.deltaY * LINE_HEIGHT
  if (event.deltaMode === 2) return event.deltaY * scroller.clientHeight
  return event.deltaY
}

// 事件链上已经有能滚的元素（页面滚动区本身、表格、故事区…）时交给浏览器处理
function hasScrollableAncestor(target, boundary) {
  let node = target instanceof Element ? target : target?.parentElement

  while (node && node !== boundary) {
    const { overflowY } = getComputedStyle(node)
    const scrollable = overflowY === 'auto' || overflowY === 'scroll'

    if (scrollable && node.scrollHeight > node.clientHeight + 1) return true

    node = node.parentElement
  }

  return false
}

/**
 * 把滚轮事件转发给当前页面的滚动容器。
 * 页面的滚动区只有 60vw 宽，鼠标落在两侧空白上时事件到不了它，这里补一条通路。
 * 返回是否真的滚动了（用来决定要不要 preventDefault）。
 */
export function forwardWheel(event, boundary) {
  if (!boundary || event.defaultPrevented || event.ctrlKey) return false
  if (hasScrollableAncestor(event.target, boundary)) return false

  const scroller = boundary.querySelector(SCROLL_SELECTOR)

  if (!scroller || scroller.scrollHeight <= scroller.clientHeight + 1) return false

  const delta = normalizeDelta(event, scroller)

  if (!delta) return false

  const before = scroller.scrollTop

  scroller.scrollTop = before + delta

  if (scroller.scrollTop === before) return false

  event.preventDefault()

  return true
}
