/**
 * 格式化原神数值
 * @param {string} format - 格式类型（'F1', 'F2', 'I', 'P', 'F1P', 'F2P'）
 * @param {number|string} value - 原数值
 * @returns {string} 格式化后的字符串
 */
export function statValue(format, value) {
  if (value === null || value === undefined || value === '') {
    return format.includes('P') ? '0%' : '0'
  }

  const num = Number(value)

  if (format.includes('P')) {
    const decimals = format.includes('F2') ? 2 : 1
    return (num * 100).toFixed(decimals) + '%'
  }
  if (format.includes('I')) {
    return Math.round(num).toString()
  }
  if (format.includes('F')) {
    const decimals = format.includes('F2') ? 2 : 1
    return num.toFixed(decimals)
  }

  return num.toString()
}