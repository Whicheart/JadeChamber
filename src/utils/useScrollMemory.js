import { nextTick, onActivated, ref } from 'vue'

/**
 * 滚动位置记忆的纯逻辑部分，不牵扯组件生命周期，便于单独测试。
 */
export function createScrollMemory() {
  const scrollRef = ref(null)
  let top = 0

  function remember(event) {
    const el = event.currentTarget

    // 元素被 KeepAlive 移出文档时，浏览器会把 scrollTop 归零并补发一次 scroll，
    // 这个 0 不是用户的位置，不能覆盖已记住的值
    if (el.isConnected === false) return

    top = el.scrollTop
  }

  function restore() {
    if (scrollRef.value) scrollRef.value.scrollTop = top
  }

  return { scrollRef, remember, restore, position: () => top }
}

/**
 * 记住滚动容器的位置。
 *
 * App 用 <KeepAlive> 缓存页面，切走时 Vue 会把组件 DOM 移进一个游离的容器：
 * 元素一旦离开文档，scrollTop 就被浏览器重置，回来时列表自然就跳回顶部了。
 * 这里在滚动过程中实时记下位置，重新激活后再写回去。
 */
export function useScrollMemory() {
  const memory = createScrollMemory()

  onActivated(() => {
    // 激活时 DOM 刚被移回文档，等这一轮 patch 走完再写位置
    nextTick(memory.restore)
  })

  return { scrollRef: memory.scrollRef, onScroll: memory.remember }
}
