import type { Material } from './common'

/** 武器简要信息 */
export interface WeaponBrief {
  id?: number
  sortId?: number
  name?: string
  rank?: number
  weaponType?: string
  iconName?: string
  gachaCardName?: string
}

/** 武器基础信息 */
export interface WeaponBaseInfoResponse {
  id?: number
  name?: string
  desc?: string
  weaponType?: string
  rankLevel?: number
  icon?: string
  awakenIcon?: string
  atk?: number[]
  subStatName?: string
  subStatValue?: number[]
  affixName?: string
  affixDesc?: string[]
  materials?: Material[]
  stories?: string[][]
}

/** 武器列表查询参数。 */
export interface WeaponListParams {
  name?: string
  weaponTypes?: string[]
  ranks?: number[]
}
