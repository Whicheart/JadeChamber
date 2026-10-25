<script setup>
import { ref, computed } from 'vue'
import * as getImgUrl from '@/utils/getImgUrl'
import * as format from '@/utils/format'

const props = defineProps({
  baseInfo: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

// ========== 通用取值 ==========
// befor / after 两版文本：after 有值就用 after，否则退回 befor
function pick(befor, after) {
  return after && after.length ? after : befor || ''
}

const info = computed(() => props.baseInfo || {})

// ========== A 块：基础信息 ==========
const splashUrl = computed(() => getImgUrl.avatarIcon(info.value.splashIconName))

const name = computed(() => info.value.name || '未知角色')
const title = computed(() => info.value.title || '')
const desc = computed(() => info.value.desc || '')

const qualityText = computed(() => info.value.qualityType || '')
// "五星" → 5，"四星" → 4
const starCount = computed(() => {
  const map = { 五星: 5, 四星: 4, 三星: 3 }
  return map[qualityText.value] || 0
})

const weaponText = computed(() => info.value.weaponType || '')
const WEAPON_ICON_MAP = {
  单手剑: 'Weapon_Sword',
  双手剑: 'Weapon_Claymore',
  长柄武器: 'Weapon_Polearm',
  弓: 'Weapon_Bow',
  法器: 'Weapon_Catalyst',
  枪: 'Weapon_Bow',
}
const weaponIcon = computed(() => {
  const key = WEAPON_ICON_MAP[weaponText.value]
  return key ? getImgUrl.filter(key) : ''
})

// 元素：after 优先
const elementText = computed(() => pick(info.value.element?.befor, info.value.element?.after))
const ELEMENT_ICON_MAP = [
  ['冰', 'Element_Cryo'],
  ['水', 'Element_Hydro'],
  ['火', 'Element_Pyro'],
  ['雷', 'Element_Electro'],
  ['风', 'Element_Anemo'],
  ['岩', 'Element_Geo'],
  ['草', 'Element_Dendro'],
]
const elementIcon = computed(() => {
  const hit = ELEMENT_ICON_MAP.find(([key]) => elementText.value.includes(key))
  return hit ? getImgUrl.filter(hit[1]) : ''
})

const releaseDate = computed(() => {
  const t = info.value.releaseTime
  if (!t) return '—'
  return String(t).split(' ')[0]
})

// 所属势力只显示数组最后一项
const affiliationText = computed(() => {
  const list = info.value.affiliation
  if (!Array.isArray(list)) return '—'
  const valid = list.filter(Boolean)
  return valid.length ? valid[valid.length - 1] : '—'
})

const birthdayText = computed(() => {
  const b = info.value.birth
  if (!b || b.month == null || b.day == null) return '—'
  return `${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`
})

const constellationText = computed(
  () => pick(info.value.constellation?.befor, info.value.constellation?.after) || '—',
)
const powerText = computed(() => pick(info.value.power?.befor, info.value.power?.after) || '—')

const cvList = computed(() => {
  const cv = info.value.cv || {}
  return [
    { label: '汉语', value: cv.cn },
    { label: '英语', value: cv.en },
    { label: '日语', value: cv.jp },
    { label: '韩语', value: cv.kr },
  ].map((item) => ({ ...item, value: item.value || '—' }))
})

// ========== B 块：三维属性 ==========
const level = ref(90)

const attrAt = (list, lv) => {
  if (!Array.isArray(list) || !list.length) return 0
  const idx = Math.min(Math.max(lv, 1), list.length) - 1
  return list[idx] ?? 0
}

const baseStats = computed(() => {
  const list = [
    { name: '生命值', value: attrAt(info.value.hp, level.value), format: 'I' },
    { name: '攻击力', value: attrAt(info.value.atk, level.value), format: 'I' },
    { name: '防御力', value: attrAt(info.value.def, level.value), format: 'I' },
  ]
  if (info.value.elementMastery != null) {
    list.push({ name: '元素精通', value: info.value.elementMastery, format: 'I' })
  }
  return list
})

const ascensionStat = computed(() => {
  const statName = info.value.ascensionStatName
  if (!statName || statName === '未知') return null
  const isMastery = statName === '元素精通'
  return {
    name: statName,
    value: attrAt(info.value.ascensionStatValue, level.value),
    format: isMastery ? 'I' : 'F1P',
  }
})

// ========== C 块：材料清单 ==========
const levelUpStages = computed(() => info.value.materials?.[0]?.levelUpMaterial || [])
const talentStages = computed(() => info.value.materials?.[0]?.talentUpMaterial || [])

// 角色等级
const charLevel = ref(90)
// 三个天赋等级
const talentLevels = ref({ normal: 10, skill: 10, burst: 10 })

// 突破前的等级上限；1 阶突破在 20 级触发，之后每阶的触发点是上一阶的 maxLevel
const BASE_LEVEL_CAP = 20

const promoteStages = computed(() => {
  const stages = levelUpStages.value
  let count = 0
  for (let i = 0; i < stages.length; i++) {
    const threshold = i === 0 ? BASE_LEVEL_CAP : (stages[i - 1].maxLevel ?? 0)
    if (threshold <= charLevel.value) count++
    else break
  }
  return stages.slice(0, count)
})

// 某个天赋等级需要的材料（第 1 级无消耗）
const talentStagesOf = (targetLevel) =>
  talentStages.value.filter((stage) => (stage.level ?? 0) <= targetLevel && (stage.level ?? 0) >= 2)

// 材料按「同类聚在一起」排序：同一材质家族（id 前 4 位相同）归为一组，
// 组与组之间按首次出现顺序固定，组内按 id 降序（高阶 → 低阶），拖动等级不会跳序
const materialFamily = (id) => String(id).slice(0, 4)

function mergeItems(groups) {
  const map = new Map()
  groups.forEach((items) => {
    ;(items || []).forEach((item) => {
      if (!item || item.id == null) return
      const old = map.get(item.id)
      if (old) old.count += item.count || 0
      else
        map.set(item.id, {
          id: item.id,
          name: item.name || String(item.id),
          count: item.count || 0,
        })
    })
  })

  const list = [...map.values()]
  const families = []
  list.forEach((item) => {
    const family = materialFamily(item.id)
    if (!families.includes(family)) families.push(family)
  })

  return families.flatMap((family) =>
    list.filter((item) => materialFamily(item.id) === family).sort((a, b) => b.id - a.id),
  )
}

const levelUpMaterials = computed(() => {
  const stages = promoteStages.value
  const items = mergeItems(stages.map((stage) => stage.costItems))
  const mora = stages.reduce((sum, stage) => sum + (stage.mora || 0), 0)
  return { items, mora }
})

const talentMaterials = computed(() => {
  const stages = [
    ...talentStagesOf(talentLevels.value.normal),
    ...talentStagesOf(talentLevels.value.skill),
    ...talentStagesOf(talentLevels.value.burst),
  ]
  const items = mergeItems(stages.map((stage) => stage.costItems))
  const mora = stages.reduce((sum, stage) => sum + (stage.mora || 0), 0)
  return { items, mora }
})

const totalMora = computed(() => levelUpMaterials.value.mora + talentMaterials.value.mora)
</script>

<template>
  <div id="avatar-base-info">
    <!-- ================= A 块：立绘 + 基础信息 ================= -->
    <section class="panel panel-a">
      <div class="splash-box">
        <img v-if="splashUrl" :src="splashUrl" :alt="name" class="splash" />
      </div>

      <div class="info-box">
        <div class="name-row">
          <h1>{{ name }}</h1>
          <span class="stars">
            <span v-for="i in 5" :key="i" :class="['star', { on: i <= starCount }]">★</span>
          </span>
        </div>
        <div v-if="title" class="title">{{ title }}</div>
        <p v-if="desc" class="desc">{{ desc }}</p>

        <ul class="attr-list">
          <li>
            <span class="label">武器类型</span>
            <span class="value">
              <img v-if="weaponIcon" :src="weaponIcon" class="mini-icon" alt="" />
              {{ weaponText || '—' }}
            </span>
          </li>
          <li>
            <span class="label">实装时间</span>
            <span class="value">{{ releaseDate }}</span>
          </li>
          <li>
            <span class="label">所属势力</span>
            <span class="value">{{ affiliationText }}</span>
          </li>
          <li>
            <span class="label">生日</span>
            <span class="value">{{ birthdayText }}</span>
          </li>
          <li>
            <span class="label">命之座</span>
            <span class="value">{{ constellationText }}</span>
          </li>
          <li>
            <span class="power">{{ powerText || '—' }}</span>
            <span class="value">
              <img v-if="elementIcon" :src="elementIcon" class="mini-icon" alt="" />
              {{ elementText || '—' }}
            </span>
          </li>
          <li v-for="cv in cvList" :key="cv.label">
            <span class="label">{{ cv.label }}CV</span>
            <span class="value">{{ cv.value }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- ================= B 块：三维属性 + 等级 ================= -->
    <section class="panel panel-b">
      <h2 class="panel-title">属性成长</h2>

      <div class="level-drag">
        <span class="level-badge">Lv.{{ level }}</span>
        <input v-model.number="level" class="slider" type="range" min="1" max="100" step="1" />
      </div>

      <div class="stat-grid">
        <div v-for="stat in baseStats" :key="stat.name" class="stat-card">
          <span class="stat-name">{{ stat.name }}</span>
          <span class="stat-value">{{ format.statValue(stat.format, stat.value) }}</span>
        </div>
        <div v-if="ascensionStat" class="stat-card">
          <span class="stat-name">突破属性 · {{ ascensionStat.name }}</span>
          <span class="stat-value">{{
            format.statValue(ascensionStat.format, ascensionStat.value)
          }}</span>
        </div>
      </div>
    </section>

    <!-- ================= C 块：等级滑块 + 材料清单 ================= -->
    <section class="panel panel-c">
      <h2 class="panel-title">养成材料</h2>

      <div class="material-layout">
        <div class="slider-group">
          <div class="slider-item">
            <span class="slider-label">角色等级</span>
            <input
              v-model.number="charLevel"
              class="slider"
              type="range"
              min="1"
              max="100"
              step="1"
            />
            <span class="slider-num">Lv.{{ charLevel }}</span>
          </div>
          <div class="slider-item">
            <span class="slider-label">普通攻击</span>
            <input
              v-model.number="talentLevels.normal"
              class="slider"
              type="range"
              min="1"
              max="10"
              step="1"
            />
            <span class="slider-num">Lv.{{ talentLevels.normal }}</span>
          </div>
          <div class="slider-item">
            <span class="slider-label">元素战技</span>
            <input
              v-model.number="talentLevels.skill"
              class="slider"
              type="range"
              min="1"
              max="10"
              step="1"
            />
            <span class="slider-num">Lv.{{ talentLevels.skill }}</span>
          </div>
          <div class="slider-item">
            <span class="slider-label">元素爆发</span>
            <input
              v-model.number="talentLevels.burst"
              class="slider"
              type="range"
              min="1"
              max="10"
              step="1"
            />
            <span class="slider-num">Lv.{{ talentLevels.burst }}</span>
          </div>
        </div>

        <div class="material-list">
          <div class="material-group">
            <h3>突破材料 · {{ promoteStages.length }} 阶</h3>
            <div v-if="levelUpMaterials.items.length" class="material-rows">
              <div v-for="item in levelUpMaterials.items" :key="item.id" class="material-row">
                <span>{{ item.name }}</span>
                <span class="count">×{{ item.count }}</span>
              </div>
              <div class="material-row mora">
                <span>摩拉</span>
                <span class="count">×{{ levelUpMaterials.mora }}</span>
              </div>
            </div>
            <div v-else class="empty">当前等级无需突破材料</div>
          </div>

          <div class="material-group">
            <h3>天赋材料</h3>
            <div v-if="talentMaterials.items.length" class="material-rows">
              <div v-for="item in talentMaterials.items" :key="item.id" class="material-row">
                <span>{{ item.name }}</span>
                <span class="count">×{{ item.count }}</span>
              </div>
              <div class="material-row mora">
                <span>摩拉</span>
                <span class="count">×{{ talentMaterials.mora }}</span>
              </div>
            </div>
            <div v-else class="empty">当前等级无需天赋材料</div>
          </div>

          <div class="material-total">
            <span>摩拉合计</span>
            <span>{{ totalMora }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
#avatar-base-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: var(--clr-white);
}

.panel {
  border: 1px solid var(--clr-white-10);
  border-radius: 16px;
  background-color: var(--clr-black-80);
  padding: 24px;
}

/* ========== A 块 ========== */
.panel-a {
  display: flex;
  gap: 32px;
  min-height: 560px;
}

.splash-box {
  width: 46%;
  height: 560px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  overflow: hidden;
}

.splash {
  height: 100%;
  width: auto;
  max-width: none;
  object-fit: contain;
}

.info-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: space-between;
}

.name-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.name-row h1 {
  font-size: 42px;
  letter-spacing: 2px;
}

.stars {
  display: inline-flex;
  gap: 2px;
}

.star {
  font-size: 20px;
  color: var(--clr-white-20);
}

.star.on {
  color: #ffcc33;
}

.title {
  font-size: 18px;
  color: var(--clr-white-60);
  letter-spacing: 1px;
}

.desc {
  font-size: 16px;
  line-height: 1.8;
  color: var(--clr-white-70);
}

.attr-list {
  list-style: none;
  display: grid;
  flex: 1;
  grid-template-columns: minmax(0, 1fr);
  align-content: space-between;
  gap: 8px;
}

.attr-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  border-radius: 8px;
  background-color: var(--clr-white-10);
}

.label {
  color: var(--clr-white-50);
  font-size: 14px;
}

.value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}

.mini-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.power {
  color: var(--clr-white-50);
  font-size: 14px;
}

/* ========== B 块 ========== */
.panel-title {
  font-size: 22px;
  font-weight: normal;
  letter-spacing: 2px;
  margin-bottom: 16px;
}

.level-drag {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.level-badge {
  min-width: 84px;
  text-align: center;
  font-size: 18px;
  padding: 6px 12px;
  border-radius: 9999px;
  background-color: var(--clr-white-20);
}

.slider {
  flex: 1;
  height: 4px;
  appearance: none;
  border-radius: 9999px;
  background: var(--clr-white-20);
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--clr-white);
  border: none;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background-color: var(--clr-white-10);
}

.stat-name {
  font-size: 14px;
  color: var(--clr-white-50);
}

.stat-value {
  font-size: 24px;
}

/* ========== C 块 ========== */
.material-layout {
  display: flex;
  gap: 32px;
}

.slider-group {
  width: 44%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.slider-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-label {
  width: 84px;
  font-size: 15px;
  color: var(--clr-white-70);
}

.slider-num {
  width: 62px;
  text-align: right;
  font-size: 15px;
}

.material-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.material-group h3 {
  font-size: 16px;
  font-weight: normal;
  color: var(--clr-white-70);
  margin-bottom: 8px;
}

.material-rows {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.material-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 14px;
  border-radius: 8px;
  background-color: var(--clr-white-10);
  font-size: 15px;
}

.material-row.mora {
  grid-column: 1 / -1;
  color: #ffcc33;
}

.count {
  color: var(--clr-white-70);
}

.material-total {
  display: flex;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 10px;
  background-color: var(--clr-white-20);
  font-size: 16px;
}

.empty {
  font-size: 14px;
  color: var(--clr-white-40);
  padding: 8px 14px;
}
</style>
