import axios from 'axios'

export async function getConfig() {
  // 直接动态导入，不需要 glob
  const mod = await import('/src/assets/artifact/data.json')
  return mod.default
}

/* 拉业务数据：用配置里的 apiPrefix，保证不同角色调不同接口 */
export async function getTableData(apiPrefix) {
  const { data } = await axios.get(`${apiPrefix}/table`)
  return data.list
}
