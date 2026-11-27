/** 圣遗物套装简要信息 */
export interface RelicSetBrief {
  setId?: number
  name?: string
  maxRankLevel?: number
  setIconName?: string
}

/** 套装内单件圣遗物 */
export interface Contains {
  id?: number
  name?: string
  desc?: string
  iconName?: string
  story?: string[]
}

/** 圣遗物套装基础信息 */
export interface ReliquaryBaseInfoResponse {
  setId?: number
  name?: string
  setAffixNum?: number[]
  setAffixDesc?: string[]
  maxRankLevel?: number
  setIconName?: string
  contains?: Contains[]
}

/** 主词条 */
export interface MainProp {
  propType?: string
  values?: number[]
}

/** 副词条 */
export interface AppendProp {
  propType?: string
  values?: number[]
}

/** 强化等级对应的词条数据 */
export interface RankLevel {
  rankLevel?: number
  mainProps?: MainProp[]
  appendProps?: AppendProp[]
}

/** 圣遗物词条档位响应 */
export interface ReliquaryPropRankResponse {
  rankLevels?: RankLevel[]
}
