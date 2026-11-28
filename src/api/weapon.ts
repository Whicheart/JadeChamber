import { ApiError, http } from './index'
import type { ApiResult, WeaponBrief, WeaponListParams } from '../types'

const WEAPON_LIST_PATH = '/weapon/list'

/** 将查询参数转换为接口实际接收的字符串形式（数组以逗号分隔）。 */
function toQueryParams(params: WeaponListParams): Record<string, string> {
  const query: Record<string, string> = {}

  if (params.name) query.name = params.name
  if (params.weaponTypes?.length) query.weaponTypes = params.weaponTypes.join(',')
  if (params.ranks?.length) query.ranks = params.ranks.join(',')

  return query
}

/**
 * 获取武器列表。
 * 依据 GET /weapon/list：name 为包含匹配；weaponTypes、ranks
 * 为组内 OR、组间 AND；接口不分页，一次返回全部。
 */
export async function getWeaponList(params: WeaponListParams = {}): Promise<WeaponBrief[]> {
  const { data } = await http.get<ApiResult<WeaponBrief[]>>(WEAPON_LIST_PATH, {
    params: toQueryParams(params),
  })

  if (data.code !== 200) {
    throw new ApiError(data.msg ?? '获取武器列表失败', {
      status: data.code,
      method: 'GET',
      url: WEAPON_LIST_PATH,
    })
  }

  return data.data ?? []
}
