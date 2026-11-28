/**
 * public/images 静态资源 URL 拼接。
 * 图片位于 public/images/<目录>/<资源名>.webp，与 Vite base 保持一致。
 */

const BASE_URL = import.meta.env.BASE_URL

function normalizeBase(base: string): string {
  return base.endsWith('/') ? base : `${base}/`
}

/** 按目录与资源名拼接图片 URL；资源名缺失时返回 undefined。 */
export function buildImageUrl(directory: string, fileName?: string): string | undefined {
  if (!fileName) return undefined

  return `${normalizeBase(BASE_URL)}images/${directory}/${fileName}.webp`
}
