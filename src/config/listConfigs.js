import { weaponLabel } from '@/utils/weapon'

// 品质底图
const QUALITY_BACKGROUNDS = new Set([
  'QUALITY_BLUE',
  'QUALITY_GRAY',
  'QUALITY_GREEN',
  'QUALITY_ORANGE',
  'QUALITY_ORANGE_SP',
  'QUALITY_PURPLE',
])

// 星级 → 品质底图
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

// ================ 分类配置数组 ================
// 星级类型分类
const QUALITY_TYPES = [
  {
    code: 'QUALITY_ORANGE',
    rankCode: '5',
    icon: 'UI_BtnIcon_Quality_5',
    activeIcon: 'UI_QualityIcon_TeyvatNum_5',
    label: '5★',
  },
  {
    code: 'QUALITY_PURPLE',
    rankCode: '4',
    icon: 'UI_BtnIcon_Quality_4',
    activeIcon: 'UI_QualityIcon_TeyvatNum_4',
    label: '4★',
  },
  {
    code: 'QUALITY_BLUE',
    rankCode: '3',
    icon: 'UI_BtnIcon_Quality_3',
    activeIcon: 'UI_QualityIcon_TeyvatNum_3',
    label: '3★',
  },
  {
    code: 'QUALITY_GREEN',
    rankCode: '2',
    icon: 'UI_BtnIcon_Quality_2',
    activeIcon: 'UI_QualityIcon_TeyvatNum_2',
    label: '2★',
  },
  {
    code: 'QUALITY_GRAY',
    rankCode: '1',
    icon: 'UI_BtnIcon_Quality_1',
    activeIcon: 'UI_QualityIcon_TeyvatNum_1',
    label: '1★',
  },
]

// 元素类型分类
const ELEMENT_TYPES = [
  {
    code: 'Fire',
    icon: 'UI_BtnIcon_Element_Fire',
    activeIcon: 'UI_BtnIcon_Active_Element_Fire',
    label: '火',
  },
  {
    code: 'Water',
    icon: 'UI_BtnIcon_Element_Water',
    activeIcon: 'UI_BtnIcon_Active_Element_Water',
    label: '水',
  },
  {
    code: 'Ice',
    icon: 'UI_BtnIcon_Element_Ice',
    activeIcon: 'UI_BtnIcon_Active_Element_Ice',
    label: '冰',
  },
  {
    code: 'Electric',
    icon: 'UI_BtnIcon_Element_Electric',
    activeIcon: 'UI_BtnIcon_Active_Element_Electric',
    label: '雷',
  },
  {
    code: 'Wind',
    icon: 'UI_BtnIcon_Element_Wind',
    activeIcon: 'UI_BtnIcon_Active_Element_Wind',
    label: '风',
  },
  {
    code: 'Rock',
    icon: 'UI_BtnIcon_Element_Rock',
    activeIcon: 'UI_BtnIcon_Active_Element_Rock',
    label: '岩',
  },
  {
    code: 'Grass',
    icon: 'UI_BtnIcon_Element_Grass',
    activeIcon: 'UI_BtnIcon_Active_Element_Grass',
    label: '草',
  },
]

// 武器类型分类
const WEAPON_TYPES = [
  {
    code: 'WEAPON_SWORD_ONE_HAND',
    icon: 'UI_BtnIcon_Weapon_Sword',
    activeIcon: 'UI_BtnIcon_Active_Weapon_Sword',
    label: '单手剑',
  },
  {
    code: 'WEAPON_CLAYMORE',
    icon: 'UI_BtnIcon_Weapon_Claymore',
    activeIcon: 'UI_BtnIcon_Active_Weapon_Claymore',
    label: '双手剑',
  },
  {
    code: 'WEAPON_POLE',
    icon: 'UI_BtnIcon_Weapon_Pole',
    activeIcon: 'UI_BtnIcon_Active_Weapon_Pole',
    label: '长柄武器',
  },
  {
    code: 'WEAPON_CATALYST',
    icon: 'UI_BtnIcon_Weapon_Catalyst',
    activeIcon: 'UI_BtnIcon_Active_Weapon_Catalyst',
    label: '法器',
  },
  {
    code: 'WEAPON_BOW',
    icon: 'UI_BtnIcon_Weapon_Bow',
    activeIcon: 'UI_BtnIcon_Active_Weapon_Bow',
    label: '弓',
  },
]

// 怪物类型分类
const MONSTER_TYPES = [
  {
    code: 'CODEX_SUBTYPE_ELEMENTAL',
    icon: 'UI_BtnIcon_Monster_Elemental',
    activeIcon: 'UI_BtnIcon_Active_Monster_Elemental',
    label: '元素生物',
  },
  {
    code: 'CODEX_SUBTYPE_HILICHURL',
    icon: 'UI_BtnIcon_Monster_Hilichurl',
    activeIcon: 'UI_BtnIcon_Active_Monster_Hilichurl',
    label: '丘丘部族',
  },
  {
    code: 'CODEX_SUBTYPE_ABYSS',
    icon: 'UI_BtnIcon_Monster_Abyss',
    activeIcon: 'UI_BtnIcon_Active_Monster_Abyss',
    label: '深渊',
  },
  {
    code: 'CODEX_SUBTYPE_FATUI',
    icon: 'UI_BtnIcon_Monster_Fatui',
    activeIcon: 'UI_BtnIcon_Active_Monster_Fatui',
    label: '愚人众',
  },
  {
    code: 'CODEX_SUBTYPE_AUTOMATRON',
    icon: 'UI_BtnIcon_Monster_Automatron',
    activeIcon: 'UI_BtnIcon_Active_Monster_Automatron',
    label: '自律机关',
  },
  {
    code: 'CODEX_SUBTYPE_HUMAN',
    icon: 'UI_BtnIcon_Monster_Human',
    activeIcon: 'UI_BtnIcon_Active_Monster_Human',
    label: '人类势力',
  },
  {
    code: 'CODEX_SUBTYPE_BEAST',
    icon: 'UI_BtnIcon_Monster_Beast',
    activeIcon: 'UI_BtnIcon_Active_Monster_Beast',
    label: '异种魔兽',
  },
  {
    code: 'CODEX_SUBTYPE_BOSS',
    icon: 'UI_BtnIcon_Monster_Boss',
    activeIcon: 'UI_BtnIcon_Active_Monster_Boss',
    label: '值得铭记的强敌',
  },
]

// ================ 筛选组 ================
// 筛选按钮
function button(id, label, iconName, activeIconName) {
  return { id, label, iconName, activeIconName }
}

/**
 * 星级类型筛选组
 *
 * mode：可写 code 或 rankCode，默认 code。使用 code 时，按钮 id 是 QUALITY_*，使用 rankCode 时，按钮 id 是 1~5。
 *
 * count：可写 1~5，默认 5。取前 count 个星级类型。
 */
function qualityStarGroup(mode = 'code', count = 5) {
  return {
    id: 'star',
    title: '星级',
    param: 'qualityTypes',
    multiple: true,
    buttons: QUALITY_TYPES.slice(0, count).map((type) =>
      button(mode === 'code' ? type.code : type.rankCode, type.label, type.icon, type.activeIcon),
    ),
  }
}

// 元素类型筛选组
function elementGroup() {
  return {
    id: 'element',
    title: '元素类型',
    param: 'elements',
    multiple: true,
    buttons: ELEMENT_TYPES.map((type) => button(type.code, type.label, type.icon, type.activeIcon)),
  }
}

// 武器类型筛选组
function weaponTypeGroup() {
  return {
    id: 'weapon-type',
    title: '武器类型',
    param: 'weaponTypes',
    multiple: true,
    buttons: WEAPON_TYPES.map((type) => button(type.code, type.label, type.icon, type.activeIcon)),
  }
}

// 怪物类型筛选组
function monsterTypeGroup() {
  return {
    id: 'type',
    title: '怪物类型',
    param: 'types',
    multiple: true,
    buttons: MONSTER_TYPES.map((type) => button(type.code, type.label, type.icon, type.activeIcon)),
  }
}

const MONSTER_TYPE_LABELS = Object.fromEntries(MONSTER_TYPES.map((type) => [type.code, type.label]))

/**
 * 列表页的差异全部收敛在这里，ListView 只负责按配置请求与渲染。
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
    groups: () => [qualityStarGroup('code', 2), elementGroup(), weaponTypeGroup()],
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
    groups: () => [qualityStarGroup('rankCode'), weaponTypeGroup()],
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
    groups: () => [qualityStarGroup('rankCode', 3)],
    fields: {
      key: 'setId',
      image: 'setIconName',
      quality: (set) => QUALITY_BY_RANK[set.maxRankLevel] ?? 'QUALITY_GRAY',
      name: 'name',
      label: (set) => `${set.name} ${set.maxRankLevel}★`,
    },
    card: { ratio: '1 / 1' },
    to: (set) => `/artifact/${set.setId}`,
  }),

  monster: defineList({
    endpoint: '/api/monster/list',
    name: '敌对生物',
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
