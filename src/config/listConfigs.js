import { ELEMENT_TYPES, elementFilterIcon } from '@/utils/element'
import { WEAPON_TYPES, weaponLabel } from '@/utils/weapon'

// 星级主题色：筛选按钮激活时的描边与发光色
const STAR_COLORS = {
  5: 'rgb(255, 180, 65)',
  4: 'rgb(180, 150, 240)',
  3: 'rgb(120, 170, 235)',
  2: 'rgb(110, 200, 155)',
  1: 'rgb(170, 170, 170)',
}

// 角色品质底图：只能取 UI_QualityBg 里真实存在的 6 档，未知品质退到灰底
const QUALITY_BACKGROUNDS = new Set([
  'QUALITY_BLUE',
  'QUALITY_GRAY',
  'QUALITY_GREEN',
  'QUALITY_ORANGE',
  'QUALITY_ORANGE_SP',
  'QUALITY_PURPLE',
])

// 武器星级 → 品质底图（卡片底色）
const QUALITY_BY_RANK = {
  5: 'QUALITY_ORANGE',
  4: 'QUALITY_PURPLE',
  3: 'QUALITY_BLUE',
  2: 'QUALITY_GREEN',
  1: 'QUALITY_GRAY',
}

// 一份列表配置 = 该列表自己的文字 + 数据来源 + 筛选组 + 卡片字段 + 跳转
// name 只用来生成文案，不留在配置里；宽度、防抖、搜索参数名都归组件
function defineList({ name, emptyName = name, noImage = '', ...config }) {
  return {
    text: {
      search: `搜索${emptyName}...`,
      loading: `正在加载${name}数据...`,
      failed: `${name}列表加载失败`,
      empty: `没有找到匹配的${emptyName}`,
      noImage,
    },
    ...config,
  }
}

// 角色与武器的数据形状一致（主键 id + 桌面图 + 方形图 + 品质 + 名称），只有图标字段名不同
function mediaFields({ image, quality = 'qualityType', extra = {} }) {
  return {
    key: 'id',
    image,
    mobileImage: 'iconName',
    quality,
    name: 'name',
    ...extra,
  }
}

// 一个筛选按钮：只有内容，勾选状态由组件自己维护
function button(id, label, color, iconName = '') {
  return { id, label, color, iconName }
}

// 角色的星级筛选：只有四星紫、五星金两档，图标借用提瓦特数字
function qualityStarGroup() {
  return {
    id: 'star',
    title: '星级',
    param: 'qualityTypes',
    multiple: true,
    buttons: [
      button('QUALITY_PURPLE', '4★', STAR_COLORS[4], 'UI_TeyvatNumIcon_4'),
      button('QUALITY_ORANGE', '5★', STAR_COLORS[5], 'UI_TeyvatNumIcon_5'),
    ],
  }
}

// 按星级数字生成的筛选组：默认带数字图标，icon: false 时只有文字
function rankStarGroup(ranks, { icon = true } = {}) {
  return {
    id: 'star',
    title: '星级',
    param: 'ranks',
    multiple: true,
    buttons: ranks.map((rank) =>
      button(rank, `${rank}★`, STAR_COLORS[rank], icon ? `UI_TeyvatNumIcon_${rank}` : ''),
    ),
  }
}

function elementGroup() {
  return {
    id: 'element',
    title: '元素类型',
    param: 'elements',
    multiple: true,
    buttons: ELEMENT_TYPES.map((type) =>
      button(type.name, type.label, type.color, elementFilterIcon(type.name)),
    ),
  }
}

function weaponTypeGroup() {
  return {
    id: 'weapon-type',
    title: '武器类型',
    param: 'weaponTypes',
    multiple: true,
    buttons: WEAPON_TYPES.map((type) =>
      button(type.code, type.label, 'var(--clr-white)', type.iconName),
    ),
  }
}

// 怪物图鉴分类：接口只给代码，中文名与展示顺序在这里维护
const MONSTER_TYPES = [
  { code: 'CODEX_SUBTYPE_ELEMENTAL', label: '元素生物' },
  { code: 'CODEX_SUBTYPE_HILICHURL', label: '丘丘部族' },
  { code: 'CODEX_SUBTYPE_ABYSS', label: '深渊' },
  { code: 'CODEX_SUBTYPE_FATUI', label: '愚人众' },
  { code: 'CODEX_SUBTYPE_AUTOMATRON', label: '自律机关' },
  { code: 'CODEX_SUBTYPE_HUMAN', label: '人类势力' },
  { code: 'CODEX_SUBTYPE_BEAST', label: '异种魔兽' },
  { code: 'CODEX_SUBTYPE_BOSS', label: '值得铭记的强敌' },
]

const MONSTER_TYPE_LABELS = Object.fromEntries(MONSTER_TYPES.map((type) => [type.code, type.label]))

// 怪物的分类筛选：接口参数名是 types（复数），多值为 OR
function monsterTypeGroup() {
  return {
    id: 'type',
    title: '怪物类型',
    param: 'types',
    multiple: true,
    buttons: MONSTER_TYPES.map((type) => button(type.code, type.label, 'var(--clr-white)')),
  }
}

/**
 * 列表页的差异全部收敛在这里，ListView 只负责按配置请求与渲染。
 *
 * 这里只写「随列表实体变化的东西」，越权项一律不收：
 * - 不写宽度、防抖、滚动行为等页面/组件机制
 * - 不写勾选状态，按钮只描述内容
 * - 卡片只允许 ratio / fit，都是 MediaCard 已有的 prop
 *
 * 字段说明：
 * - endpoint：列表接口地址
 * - text：这个列表的全部文案（搜索框、加载中、失败、空数据、卡片缺图）
 * - groups[].param：勾选值拼进查询串时的参数名；buttons[].id 就是参数值
 * - fields：把接口里的一条数据映射成卡片字段，值可以是字段名，也可以是取值的函数
 * - card：卡片固定样式（宽高比、图片填充方式），省略时用组件默认值
 * - to：点卡片跳转到哪一页，接收整条数据
 */
export const LIST_CONFIGS = {
  avatar: defineList({
    endpoint: '/api/avatar/list',
    name: '角色',
    groups: () => [qualityStarGroup(), elementGroup(), weaponTypeGroup()],
    fields: mediaFields({
      image: 'GachaIconName',
      quality: (avatar) =>
        QUALITY_BACKGROUNDS.has(avatar?.qualityType) ? avatar.qualityType : 'QUALITY_GRAY',
    }),
    to: (avatar) => `/avatar/${avatar.id}`,
  }),

  weapon: defineList({
    endpoint: '/api/weapon/list',
    name: '武器',
    noImage: '立绘待补充',
    groups: () => [rankStarGroup([5, 4, 3, 2, 1]), weaponTypeGroup()],
    fields: mediaFields({
      image: 'GachaCardName',
      quality: (weapon) => QUALITY_BY_RANK[weapon.rank] ?? 'QUALITY_GRAY',
      extra: {
        label: (weapon) => `${weapon.name} ${weapon.rank}★ ${weaponLabel(weapon.weaponType)}`,
      },
    }),
    card: { fit: 'contain', ratio: '1 / 2' },
    to: (weapon) => `/weapon/${weapon.id}`,
  }),

  artifact: defineList({
    endpoint: '/api/reliquary/list',
    name: '圣遗物',
    emptyName: '圣遗物套装',
    noImage: '图标待补充',
    groups: () => [rankStarGroup([5, 4, 3], { icon: false })],
    fields: {
      key: 'setId',
      image: 'setIconName',
      name: 'name',
      label: (set) => `${set.name} ${set.maxRankLevel}★`,
    },
    card: { ratio: '1 / 1' },
    to: (set) => `/artifact/${set.setId}`,
  }),

  monster: defineList({
    endpoint: '/api/monster/list',
    name: '怪物',
    noImage: '图标待补充',
    groups: () => [monsterTypeGroup()],
    fields: {
      key: 'id',
      image: 'iconName',
      name: 'name',
      label: (monster) => `${monster.name} ${MONSTER_TYPE_LABELS[monster.type] ?? ''}`.trim(),
    },
    card: { ratio: '1 / 1', fit: 'contain' },
    to: (monster) => `/monster/${monster.id}`,
  }),
}
