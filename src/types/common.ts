/**
 * 通用响应与共享实体类型，依据后端 OpenAPI JSON 定义。
 * OpenAPI 未声明 required 字段，因此所有字段均按可选处理。
 */

/** 后端统一响应包装：code / msg / data */
export interface ApiResult<T> {
  code?: number
  msg?: string
  data?: T
}

/** 材料消耗项 */
export interface CostItem {
  id?: number
  name?: string
  count?: number
  iconName?: string
}

/** 材料（角色、武器共用） */
export interface Material {
  promoteLevel?: number
  maxLevel?: number
  mora?: number
  costItems?: CostItem[]
}
