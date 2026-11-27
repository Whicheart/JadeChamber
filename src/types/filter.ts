/** 筛选按钮配置 */
export interface FilterButtonConfig {
  /** 中文名称 */
  label: string
  /** 筛选值：元素/武器为接口枚举，星级为 4/5 字符串 */
  value: string
  /** 默认态图标 URL */
  icon?: string
  /** 激活态图标 URL */
  activeIcon?: string
}

/** 一个筛选组，key 对应接口参数名 */
export interface FilterGroup {
  key: string
  name: string
  buttons: FilterButtonConfig[]
}

/** 筛选选中值：组 key -> 选中值数组 */
export type FilterSelection = Record<string, string[]>

/** 通用列表卡片数据 */
export interface ListCardItem {
  name: string
  /** 桌面端图片 */
  image?: string
  /** 移动端图片 */
  mobileImage?: string
  /** 图片宽高比，默认 3/4 */
  ratio?: number
  /** 图片填充方式，默认 cover */
  fit?: 'cover' | 'contain'
  /** object-position，默认 center top */
  position?: string
}
