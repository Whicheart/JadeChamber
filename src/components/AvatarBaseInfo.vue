<script setup>
import { ref, computed } from 'vue'
import { elementCommonIcon } from '@/utils/element'
import * as format from '@/utils/format'
import { asset, materialIcon } from '@/utils/getImage'
import { mergeMaterials, moraTotal, reachedStages, valueAt } from '@/utils/growth'
import { weaponFilterIcon, weaponLabel } from '@/utils/weapon'
import SliderRow from '@/components/SliderRow.vue'

// 摩拉没有对应的 costItem，固定用 202 号图标（UI_ItemIcon_202 就是那枚金币）
const MORA_ICON = 'UI_ItemIcon_202'

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
const splashUrl = computed(() => asset(info.value.gachaImageName))

const name = computed(() => info.value.name || '未知角色')
const title = computed(() => info.value.title || '')
const desc = computed(() => info.value.desc || '')

const qualityText = computed(() => info.value.qualityType || '')

// 品质：接口现在给 QUALITY_* 代码，旧数据是「五星」这类中文，两种都认
const STAR_BY_QUALITY = {
  QUALITY_ORANGE_SP: 5,
  QUALITY_ORANGE: 5,
  QUALITY_PURPLE: 4,
  QUALITY_BLUE: 3,
  QUALITY_GREEN: 2,
  QUALITY_GRAY: 1,
  五星: 5,
  四星: 4,
  三星: 3,
  二星: 2,
  一星: 1,
}
const starCount = computed(() => STAR_BY_QUALITY[qualityText.value] || 0)

// 接口给的是 WEAPON_SWORD_ONE_HAND 这类代码，展示时换成中文
const weaponCode = computed(() => info.value.weaponType || '')
const weaponText = computed(() => weaponLabel(weaponCode.value))
const weaponIcon = computed(() => {
  const iconName = weaponFilterIcon(weaponText.value)
  return iconName ? asset(iconName) : ''
})

// 元素：after 优先；接口给的是中文（冰/水/火/雷/风/岩/草），详情页用彩色圆形图标
const elementText = computed(() => pick(info.value.element?.befor, info.value.element?.after))
const elementIcon = computed(() => {
  // 接口直接给了地区风格的图标名（Common / Liyue / Fatui / Player / Ranger），优先用它
  const iconName = info.value.element?.iconName || elementCommonIcon(elementText.value)
  return iconName ? asset(iconName) : ''
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
// 神之眼：接口字段名是 vision（befor / after 两版）
const visionText = computed(() => pick(info.value.vision?.befor, info.value.vision?.after) || '—')
// 神之眼吊坠图标：接口给 UI_Img_Pendant_*（蒙德/璃月/至冬/始基力各不相同）
const visionIcon = computed(() => {
  const iconName = info.value.vision?.iconName
  return iconName ? asset(iconName) : ''
})

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

const baseStats = computed(() => {
  const list = [
    { name: '生命值', value: valueAt(info.value.hp, level.value), format: 'I' },
    { name: '攻击力', value: valueAt(info.value.atk, level.value), format: 'I' },
    { name: '防御力', value: valueAt(info.value.def, level.value), format: 'I' },
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
    value: valueAt(info.value.ascensionStatValue, level.value),
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

// 突破阶段：1 阶在 20 级触发，之后每阶的触发点是上一阶的 maxLevel
const promoteStages = computed(() => reachedStages(levelUpStages.value, charLevel.value))

// 某个天赋等级需要的材料（第 1 级无消耗）
const talentStagesOf = (targetLevel) =>
  talentStages.value.filter((stage) => (stage.level ?? 0) <= targetLevel && (stage.level ?? 0) >= 2)

const levelUpMaterials = computed(() => {
  const stages = promoteStages.value
  return {
    items: mergeMaterials(stages),
    mora: moraTotal(stages),
  }
})

const talentMaterials = computed(() => {
  const stages = [
    ...talentStagesOf(talentLevels.value.normal),
    ...talentStagesOf(talentLevels.value.skill),
    ...talentStagesOf(talentLevels.value.burst),
  ]
  return {
    items: mergeMaterials(stages),
    mora: moraTotal(stages),
  }
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
          <!-- 元素吊坠：神之眼图标作背景图，元素图标放在里面 -->
          <span
            v-if="visionIcon || elementIcon"
            class="element-pendant"
            :style="visionIcon ? { backgroundImage: `url('${visionIcon}')` } : undefined"
            :title="[visionText, elementText].filter(Boolean).join(' · ')"
          >
            <img v-if="elementIcon" class="element-icon" :src="elementIcon" :alt="elementText" />
          </span>
          <h1>{{ name }}</h1>
          <span class="stars">
            <span v-for="i in 5" :key="i" :class="['star', { on: i <= starCount }]">★</span>
          </span>
        </div>
        <!-- 武器类型图标 -->
        <div v-if="weaponIcon" class="icon-row">
          <span class="icon-chip" :title="weaponText">
            <img class="type-icon" :src="weaponIcon" :alt="weaponText" />
          </span>
        </div>

        <div v-if="title" class="title">{{ title }}</div>
        <p v-if="desc" class="desc">{{ desc }}</p>

        <ul class="attr-list">
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

      <SliderRow v-model="level" :max="100" />

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
        <!-- 角色等级滑块紧挨着突破材料，一眼能看出滑的是哪一组 -->
        <div class="material-group">
          <SliderRow v-model="charLevel" :max="100" label="角色等级" />
          <h3>突破材料 · {{ promoteStages.length }} 阶</h3>
          <div v-if="levelUpMaterials.items.length" class="material-rows">
            <div
              v-for="item in levelUpMaterials.items"
              :key="item.id"
              class="material-row"
              :title="item.name"
            >
              <img
                v-if="materialIcon(item)"
                class="material-icon"
                :src="materialIcon(item)"
                :alt="item.name"
                loading="lazy"
              />
              <span class="count">{{ item.count }}</span>
            </div>
            <div class="material-row mora" title="摩拉">
              <img class="material-icon" :src="asset(MORA_ICON)" alt="摩拉" loading="lazy" />
              <span class="count">{{ levelUpMaterials.mora }}</span>
            </div>
          </div>
          <div v-else class="empty">当前等级无需突破材料</div>
        </div>

        <!-- 技能等级滑块紧挨着天赋材料 -->
        <div class="material-group">
          <div class="talent-sliders">
            <SliderRow v-model="talentLevels.normal" :max="10" label="普通攻击" />
            <SliderRow v-model="talentLevels.skill" :max="10" label="元素战技" />
            <SliderRow v-model="talentLevels.burst" :max="10" label="元素爆发" />
          </div>
          <h3>天赋材料</h3>
          <div v-if="talentMaterials.items.length" class="material-rows">
            <div
              v-for="item in talentMaterials.items"
              :key="item.id"
              class="material-row"
              :title="item.name"
            >
              <img
                v-if="materialIcon(item)"
                class="material-icon"
                :src="materialIcon(item)"
                :alt="item.name"
                loading="lazy"
              />
              <span class="count">{{ item.count }}</span>
            </div>
            <div class="material-row mora" title="摩拉">
              <img class="material-icon" :src="asset(MORA_ICON)" alt="摩拉" loading="lazy" />
              <span class="count">{{ talentMaterials.mora }}</span>
            </div>
          </div>
          <div v-else class="empty">当前等级无需天赋材料</div>
        </div>

        <div class="material-total">
          <span>摩拉合计</span>
          <span>{{ totalMora }}</span>
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

/* ========== A 块 ========== */
.panel-a {
  display: flex;
  gap: 32px;
  min-height: 560px;
}

.splash-box {
  width: 50%;
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
  align-items: center;
  gap: 16px;
}

/* 元素吊坠：神之眼图标作背景图，元素图标作为子元素居中放在里面 */
.element-pendant {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 150%;
}

/* 元素图标：居中放在神之眼背景图里 */
.element-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

/* 武器类型图标 */
.icon-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-chip {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: var(--clr-white-10);
}

.type-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
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

/* ========== B 块 ========== */
.panel-title {
  font-size: 22px;
  font-weight: normal;
  letter-spacing: 2px;
  margin-bottom: 16px;
}

/* 滑块本体在 SliderRow 里，这里只留 B 块下方的间距 */
.level-drag {
  margin-bottom: 20px;
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
/* 上下两大组：角色等级 + 突破材料、技能等级 + 天赋材料 */
.material-layout {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.material-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.talent-sliders {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.material-group h3 {
  font-size: 16px;
  font-weight: normal;
  color: var(--clr-white-70);
}

.material-rows {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 材料格：1:1 方块，数量压在右下角（名字走 title 提示） */
.material-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 10px;
  background-color: var(--clr-white-10);
}

.material-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.material-row.mora {
  color: #ffcc33;
}

/* 摩拉数量跟图标同色，和普通材料区分开 */
.material-row.mora .count {
  color: #ffcc33;
}

.count {
  position: absolute;
  right: 4px;
  bottom: 3px;
  max-width: calc(100% - 8px);
  overflow: hidden;
  font-size: 12px;
  line-height: 1;
  color: var(--clr-white);
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
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

/* ========== 窄屏（移动设备）适配 ========== */
@media (max-width: 768px) {
  #avatar-base-info {
    gap: 12px;
  }

  .panel {
    padding: 14px;
    border-radius: 14px;
  }

  /* A 块：立绘与角色资料从左右并排改为上下排布 */
  .panel-a {
    flex-direction: column;
    gap: 16px;
    min-height: 0;
  }

  .splash-box {
    width: 100%;
    height: 300px;
  }

  .name-row {
    flex-wrap: wrap;
    gap: 8px;
  }

  .name-row h1 {
    font-size: 28px;
  }

  .star {
    font-size: 16px;
  }

  .title {
    font-size: 15px;
  }

  .desc {
    font-size: 14px;
    line-height: 1.7;
  }

  .panel-title {
    margin-bottom: 12px;
    font-size: 18px;
    letter-spacing: 1px;
  }

  .level-drag {
    margin-bottom: 14px;
  }

  .stat-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-value {
    font-size: 20px;
  }

  /* C 块：两组「滑块 + 材料」纵向排列 */
  .material-layout {
    gap: 20px;
  }

  .material-group,
  .talent-sliders {
    gap: 10px;
  }

  /* 元素吊坠与武器类型图标在手机上略缩一号 */
  .element-pendant {
    width: 32px;
    height: 32px;
  }

  .icon-chip {
    width: 34px;
    height: 34px;
  }

  .type-icon {
    width: 24px;
    height: 24px;
  }

  .element-icon {
    width: 19px;
    height: 19px;
  }

  .material-rows {
    gap: 6px;
  }

  .material-row {
    width: 56px;
  }

  .count {
    font-size: 11px;
  }

  .material-total {
    padding: 10px 12px;
    font-size: 15px;
  }
}
</style>
