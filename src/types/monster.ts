/** 怪物简要信息 */
export interface MonsterBrief {
  id?: number
  name?: string
  type?: string
  iconName?: string
}

/** 怪物基础信息 */
export interface MonsterBaseInfoResponse {
  id?: number
  title?: string
  name?: string
  specialName?: string[]
  description?: string[]
  hp?: number[]
  attack?: number[]
  defense?: number[]
  fireSubHurt?: number
  waterSubHurt?: number
  iceSubHurt?: number
  elecSubHurt?: number
  windSubHurt?: number
  rockSubHurt?: number
  grassSubHurt?: number
  physicalSubHurt?: number
  iconName?: string
}
