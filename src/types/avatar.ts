import type { Material } from './common'

/** 角色简要信息 */
export interface AvatarBrief {
  id?: number
  sortId?: number
  name?: string
  qualityType?: string
  element?: string
  weaponType?: string
  iconName?: string
  gachaIconName?: string
}

/**
 * 角色列表查询参数。
 * 依据 GET /api/avatar/list：name 为包含匹配；elements、weaponTypes、qualityTypes
 * 为组内 OR、组间 AND，数组以逗号分隔字符串传递。
 */
export interface AvatarListParams {
  name?: string
  elements?: string[]
  weaponTypes?: string[]
  qualityTypes?: string[]
}

/** 生日 */
export interface Birth {
  month?: number
  day?: number
}

/** 配音演员 */
export interface Cv {
  cn?: string
  en?: string
  jp?: string
  kr?: string
}

/** 元素（字段名 befor 为后端原样拼写） */
export interface Element {
  iconName?: string
  befor?: string
  after?: string
}

/** 神之眼 */
export interface Vision {
  iconName?: string
  befor?: string
  after?: string
}

/** 命之座条目 */
export interface Constellation {
  id?: number
  name?: string
  desc?: string
  descExtra?: string
  iconName?: string
}

/** 角色基础信息 */
export interface AvatarBaseInfoResponse {
  id?: number
  title?: string
  name?: string
  desc?: string
  birth?: Birth
  constellation?: Constellation
  country?: string
  affiliation?: string[]
  qualityType?: string
  vision?: Vision
  element?: Element
  weaponType?: string
  tags?: string[]
  arkheType?: string
  hp?: number[]
  atk?: number[]
  def?: number[]
  elementMastery?: number
  ascensionStatName?: string
  ascensionStatValue?: number[]
  materials?: Material[]
  gachaImageName?: string
  releaseTime?: string
  cv?: Cv
}

/** 战斗天赋等级数据 */
export interface CombatSkillData {
  level?: number
  paramDescList?: string[]
  paramList?: number[]
}

/** 战斗天赋 */
export interface CombatSkill {
  id?: number
  name?: string
  desc?: string
  extraDesc?: string
  descExtra?: string
  loreDesc?: string
  iconName?: string
  combatSkillDataList?: CombatSkillData[]
}

/** 固有天赋 */
export interface PassiveSkill {
  id?: number
  name?: string
  desc?: string
  extraDesc?: string
  descExtra?: string
  loreDesc?: string
  iconName?: string
}

/** 特殊天赋 */
export interface SpecialProudSkill {
  id?: number
  name?: string
  desc?: string
  extraDesc?: string
  descExtra?: string
  loreDesc?: string
  iconName?: string
  combatSkillDataList?: CombatSkillData[]
}

/** 角色天赋 */
export interface AvatarSkillResponse {
  id?: number
  combatSkills?: CombatSkill[]
  passiveSkills?: PassiveSkill[]
  specialProudSkills?: SpecialProudSkill[]
}

/** 角色命之座 */
export interface AvatarConstellationResponse {
  id?: number
  constellations?: Constellation[]
}

/** 角色衣装 */
export interface Outfit {
  id?: number
  name?: string
  desc?: string
  quality?: number
  indexID?: number
  isDefault?: boolean
  imageName?: string
  avatarCardName?: string
  costumeCardName?: string
}

/** 角色衣装响应 */
export interface AvatarOutfitResponse {
  id?: number
  outfits?: Outfit[]
}

/** 角色故事条目 */
export interface Story {
  tips?: string[]
  title?: string
  text?: string
}

/** 角色故事响应 */
export interface AvatarStoryResponse {
  id?: number
  stories?: Story[]
}

/** 日常语音条目 */
export interface Daily {
  tips?: string[]
  title?: string
  text?: string
}

/** 战斗语音条目 */
export interface Battle {
  tips?: string[]
  title?: string
  text?: string
}

/** 角色语音响应 */
export interface AvatarVoiceResponse {
  id?: number
  dailies?: Daily[]
  battles?: Battle[]
}
