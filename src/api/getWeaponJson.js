import axios from 'axios'

const modules = import.meta.glob('/src/assets/weapon/*/data.json')

export async function getConfig(name) {
  const path = `/src/assets/weapon/${name}/data.json`
  const loader = modules[path]
  if (!loader) throw new Error(`找不到武器配置: ${name}`)
  const mod = await loader()
  return mod.default
}

/* 拉业务数据：用配置里的 apiPrefix，保证不同角色调不同接口 */
export async function getTableData(apiPrefix) {
  const { data } = await axios.get(`${apiPrefix}/table`)
  return data.list
}
