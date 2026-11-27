import { ApiError, http } from './index'
import type { ApiResult, AvatarBrief, AvatarListParams } from '../types'

const AVATAR_LIST_PATH = '/avatar/list'

/** 将查询参数转换为接口实际接收的字符串形式（数组以逗号分隔）。 */
function toQueryParams(params: AvatarListParams): Record<string, string> {
  const query: Record<string, string> = {}

  if (params.name) query.name = params.name
  if (params.elements?.length) query.elements = params.elements.join(',')
  if (params.weaponTypes?.length) query.weaponTypes = params.weaponTypes.join(',')
  if (params.qualityTypes?.length) query.qualityTypes = params.qualityTypes.join(',')

  return query
}

/**
 * 获取角色列表。
 * 依据 GET /avatar/list：name 包含匹配；elements、weaponTypes、qualityTypes
 * 为组内 OR、组间 AND；接口不分页，一次返回全部。
 */
export async function getAvatarList(params: AvatarListParams = {}): Promise<AvatarBrief[]> {
  const { data } = await http.get<ApiResult<AvatarBrief[]>>(AVATAR_LIST_PATH, {
    params: toQueryParams(params),
  })

  if (data.code !== 200) {
    throw new ApiError(data.msg ?? '获取角色列表失败', {
      status: data.code,
      method: 'GET',
      url: AVATAR_LIST_PATH,
    })
  }

  return data.data ?? []
}
