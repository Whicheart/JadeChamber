// 判断资源是否真的存在。
// dev server 对不存在的静态文件会回退到 index.html，返回 200 + text/html，
// 直接用 <img> 只会得到破图 + alt，所以先 HEAD 探测 content-type 再决定要不要渲染。
const cache = new Map()

export async function hasImage(url) {
  if (!url) return false
  if (cache.has(url)) return cache.get(url)

  let ok = false

  try {
    const res = await fetch(url, { method: 'HEAD' })
    ok = res.ok && String(res.headers.get('content-type') || '').startsWith('image/')
  } catch {
    ok = false
  }

  // 只缓存成功结果：素材是后续补进来的，失败要允许重试
  if (ok) cache.set(url, true)

  return ok
}

// 按候选顺序取第一张真实存在的图（并发探测，命中顺序仍按数组顺序）
export async function resolveFirstImage(urls) {
  const list = (urls || []).filter(Boolean)
  if (!list.length) return { status: 'missing', url: '' }

  const results = await Promise.all(list.map((url) => hasImage(url)))
  const index = results.findIndex(Boolean)

  return index < 0 ? { status: 'missing', url: '' } : { status: 'ok', url: list[index] }
}
