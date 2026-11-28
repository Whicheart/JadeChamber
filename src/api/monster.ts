import { ApiError, http } from './index'
import type { ApiResult, MonsterBrief, MonsterListParams } from '../types'

const MONSTER_LIST_PATH = '/monster/list'

/** 将查询参数转换为接口实际接收的字符串形式（数组以逗号分隔）。 */
function toQueryParams(params: MonsterListParams): Record<string, string> {
  const query: Record<string, string> = {}

  if (params.name) query.name = params.name
  if (params.types?.length) query.types = params.types.join(',')

  return query
}

/**
 * 获取怪物列表。
 * 依据 GET /monster/list：name 为包含匹配；types 为组内 OR；
 * 接口不分页，一次返回全部。
 */
export async function getMonsterList(params: MonsterListParams = {}): Promise<MonsterBrief[]> {
  const { data } = await http.get<ApiResult<MonsterBrief[]>>(MONSTER_LIST_PATH, {
    params: toQueryParams(params),
  })

  if (data.code !== 200) {
    throw new ApiError(data.msg ?? '获取怪物列表失败', {
      status: data.code,
      method: 'GET',
      url: MONSTER_LIST_PATH,
    })
  }

  return data.data ?? []
}
