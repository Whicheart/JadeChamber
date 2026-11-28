import { ApiError, http } from './index'
import type { ApiResult, RelicSetBrief, ReliquaryListParams } from '../types'

const RELIQUARY_LIST_PATH = '/reliquary/list'

/** 将查询参数转换为接口实际接收的字符串形式（数组以逗号分隔）。 */
function toQueryParams(params: ReliquaryListParams): Record<string, string> {
  const query: Record<string, string> = {}

  if (params.name) query.name = params.name
  if (params.ranks?.length) query.ranks = params.ranks.join(',')

  return query
}

/**
 * 获取圣遗物套装列表。
 * 依据 GET /reliquary/list：name 为包含匹配；ranks 为组内 OR；
 * 接口不分页，一次返回全部。
 */
export async function getReliquaryList(params: ReliquaryListParams = {}): Promise<RelicSetBrief[]> {
  const { data } = await http.get<ApiResult<RelicSetBrief[]>>(RELIQUARY_LIST_PATH, {
    params: toQueryParams(params),
  })

  if (data.code !== 200) {
    throw new ApiError(data.msg ?? '获取圣遗物列表失败', {
      status: data.code,
      method: 'GET',
      url: RELIQUARY_LIST_PATH,
    })
  }

  return data.data ?? []
}
