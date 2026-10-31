<script setup>
import { computed, reactive, ref, watch } from 'vue'

import request from '@/utils/request'
import { isPercentProp, propLabel, propOptionLabel, slotOfRelic } from '@/utils/reliquaryProp'
import FilterPills from '@/components/FilterPills.vue'
import SetSelect from '@/components/SetSelect.vue'
import SliderRow from '@/components/SliderRow.vue'

const props = defineProps({
  // 后端 /api/reliquary/list 的结果：[{ setId, name, maxRankLevel }]
  sets: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'created'])

const SLOT_OPTIONS = ['生之花', '死之羽', '时之沙', '空之杯', '理之冠']

// 主词条只能取部位对应的池子：花固定生命值、羽固定攻击力
const MAIN_PROPS_BY_SLOT = {
  生之花: ['FIGHT_PROP_HP'],
  死之羽: ['FIGHT_PROP_ATTACK'],
  时之沙: [
    'FIGHT_PROP_HP_PERCENT',
    'FIGHT_PROP_ATTACK_PERCENT',
    'FIGHT_PROP_DEFENSE_PERCENT',
    'FIGHT_PROP_ELEMENT_MASTERY',
    'FIGHT_PROP_CHARGE_EFFICIENCY',
  ],
  空之杯: [
    'FIGHT_PROP_HP_PERCENT',
    'FIGHT_PROP_ATTACK_PERCENT',
    'FIGHT_PROP_DEFENSE_PERCENT',
    'FIGHT_PROP_ELEMENT_MASTERY',
    'FIGHT_PROP_FIRE_ADD_HURT',
    'FIGHT_PROP_ELEC_ADD_HURT',
    'FIGHT_PROP_WATER_ADD_HURT',
    'FIGHT_PROP_WIND_ADD_HURT',
    'FIGHT_PROP_ROCK_ADD_HURT',
    'FIGHT_PROP_GRASS_ADD_HURT',
    'FIGHT_PROP_ICE_ADD_HURT',
    'FIGHT_PROP_PHYSICAL_ADD_HURT',
  ],
  理之冠: [
    'FIGHT_PROP_HP_PERCENT',
    'FIGHT_PROP_ATTACK_PERCENT',
    'FIGHT_PROP_DEFENSE_PERCENT',
    'FIGHT_PROP_ELEMENT_MASTERY',
    'FIGHT_PROP_CRITICAL',
    'FIGHT_PROP_CRITICAL_HURT',
    'FIGHT_PROP_HEAL_ADD',
  ],
}

// 副词条池固定 10 种，不含元素伤害加成与治疗加成
const APPEND_PROPS = [
  'FIGHT_PROP_HP',
  'FIGHT_PROP_ATTACK',
  'FIGHT_PROP_DEFENSE',
  'FIGHT_PROP_HP_PERCENT',
  'FIGHT_PROP_ATTACK_PERCENT',
  'FIGHT_PROP_DEFENSE_PERCENT',
  'FIGHT_PROP_ELEMENT_MASTERY',
  'FIGHT_PROP_CHARGE_EFFICIENCY',
  'FIGHT_PROP_CRITICAL',
  'FIGHT_PROP_CRITICAL_HURT',
]

const form = reactive({
  setId: props.sets[0]?.setId ?? null,
  slot: SLOT_OPTIONS[0],
  level: 20,
  mainPropName: '',
  mainValue: '',
  append: [0, 1, 2, 3].map(() => ({ propName: '', value: '' })),
})

// 套装各部位的真实圣遗物 id：由接口的 contains[].id 反推，新增条目的 id 直接取这里
const pieces = ref({})
const loadingPieces = ref(false)
const submitError = ref('')
const submitting = ref(false)

const currentSet = computed(() => props.sets.find((set) => set.setId === form.setId) ?? null)
const rankLevel = computed(() => currentSet.value?.maxRankLevel ?? 5)
const maxLevel = computed(() => (rankLevel.value === 5 ? 20 : rankLevel.value === 4 ? 16 : 12))

const mainOptions = computed(() => MAIN_PROPS_BY_SLOT[form.slot] ?? [])
const currentPieceId = computed(() => pieces.value[form.slot] ?? null)
const availableSlots = computed(() => SLOT_OPTIONS.filter((slot) => pieces.value[slot]))

// 套装里没有的部位直接置灰（单件套只开一个部位）
const slotOptions = computed(() =>
  SLOT_OPTIONS.map((slot) => ({ value: slot, label: slot, disabled: !pieces.value[slot] })),
)

watch(
  () => form.setId,
  (setId) => loadPieces(setId),
  { immediate: true },
)

// 套装列表是异步来的：编辑器先于数据打开时，等拿到列表再补上默认套装
watch(
  () => props.sets,
  (sets) => {
    if (!form.setId && sets.length) form.setId = sets[0].setId
  },
)

// 换部位后主词条池跟着变：只有一个选项的部位自动选中
watch(
  [() => form.slot, mainOptions],
  () => {
    form.mainPropName = mainOptions.value.length === 1 ? mainOptions.value[0] : ''
  },
  { immediate: true },
)

watch(maxLevel, (limit) => {
  if (form.level > limit) form.level = limit
})

async function loadPieces(setId) {
  if (!setId) return

  loadingPieces.value = true

  try {
    const data = await request.get(`/api/reliquary/${setId}/base-info`)
    pieces.value = Object.fromEntries(
      (data?.contains || []).map((item) => [slotOfRelic(item.id), item.id]),
    )

    if (!pieces.value[form.slot]) form.slot = availableSlots.value[0] ?? form.slot
  } catch (error) {
    console.error('部件信息加载失败：', error)
    pieces.value = {}
  } finally {
    loadingPieces.value = false
  }
}

// 输入框填的是「界面上的数」：百分比词条填 46.6，固定值填 4780
function toStoredValue(propName, input) {
  const text = String(input ?? '').trim()

  if (!text) return NaN

  const num = Number(text)

  if (!Number.isFinite(num)) return NaN

  return isPercentProp(propName) ? num / 100 : Math.round(num)
}

function valueHint(propName) {
  return isPercentProp(propName) ? '如 46.6' : '如 4780'
}

async function submit() {
  submitError.value = ''

  if (!form.setId) {
    submitError.value = '请选择套装'
    return
  }

  if (!currentPieceId.value) {
    submitError.value = '该套装没有这个部位，换一个部位试试'
    return
  }

  if (!form.mainPropName) {
    submitError.value = '请选择主词条'
    return
  }

  const mainPropValue = toStoredValue(form.mainPropName, form.mainValue)

  if (!Number.isFinite(mainPropValue) || mainPropValue <= 0) {
    submitError.value = '主词条数值要填正数'
    return
  }

  const appendProp = []
  const used = new Set([form.mainPropName])

  for (const [index, row] of form.append.entries()) {
    if (!row.propName) {
      submitError.value = `第 ${index + 1} 条副词条还没选类型`
      return
    }

    if (used.has(row.propName)) {
      submitError.value = `副词条「${propLabel(row.propName)}」重复了`
      return
    }

    used.add(row.propName)

    const propValue = toStoredValue(row.propName, row.value)

    if (!Number.isFinite(propValue) || propValue <= 0) {
      submitError.value = `第 ${index + 1} 条副词条数值要填正数`
      return
    }

    appendProp.push({ propName: row.propName, propValue })
  }

  // 实例 id（id）由 dev server 按同 relicId 的最大值 +1 分配，这里只提交 relicId
  const relic = {
    relicId: currentPieceId.value,
    setId: form.setId,
    rankLevel: rankLevel.value,
    level: form.level,
    mainPropName: form.mainPropName,
    mainPropValue,
    appendProp,
  }

  submitting.value = true

  try {
    const response = await fetch('/__artifacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(relic),
    })
    const payload = await response.json()

    if (payload.code !== 200) {
      submitError.value = payload.msg || '保存失败'
      return
    }

    emit('created', payload.data)
    emit('close')
  } catch (error) {
    submitError.value = `保存失败：${error?.message ?? error}`
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="editor-mask" @click.self="emit('close')">
    <section class="editor-card" role="dialog" aria-modal="true" aria-label="新增圣遗物">
      <header class="editor-head">
        <h2 class="editor-title">新增圣遗物</h2>
        <button type="button" class="close-btn" aria-label="关闭" @click="emit('close')">×</button>
      </header>

      <div class="editor-body">
        <div class="field">
          <span class="field-label">套装</span>
          <SetSelect v-model="form.setId" :sets="sets" aria-label="选择套装" />
        </div>

        <div class="field">
          <span class="field-label">部位</span>
          <FilterPills v-model="form.slot" :options="slotOptions" />
        </div>

        <div class="field">
          <span class="field-label">星级</span>
          <span class="hint">{{ rankLevel }}★ · 最高 Lv.{{ maxLevel }}</span>
        </div>

        <SliderRow v-model="form.level" :min="0" :max="maxLevel" label="等级" />

        <div class="field">
          <span class="field-label">主词条</span>
          <select v-model="form.mainPropName" class="control grow">
            <option v-if="mainOptions.length > 1" value="" disabled>请选择</option>
            <option v-for="prop in mainOptions" :key="prop" :value="prop">
              {{ propOptionLabel(prop) }}
            </option>
          </select>
          <input
            v-model="form.mainValue"
            class="control value-input"
            type="number"
            min="0"
            step="any"
            :placeholder="valueHint(form.mainPropName)"
          />
          <span class="unit">{{ isPercentProp(form.mainPropName) ? '%' : '' }}</span>
        </div>

        <div class="append-block">
          <span class="field-label">副词条</span>
          <div v-for="(row, index) in form.append" :key="index" class="append-row">
            <span class="append-index">{{ index + 1 }}</span>
            <select v-model="row.propName" class="control grow">
              <option value="" disabled>请选择</option>
              <option v-for="prop in APPEND_PROPS" :key="prop" :value="prop">
                {{ propOptionLabel(prop) }}
              </option>
            </select>
            <input
              v-model="row.value"
              class="control value-input"
              type="number"
              min="0"
              step="any"
              :placeholder="valueHint(row.propName)"
            />
            <span class="unit">{{ isPercentProp(row.propName) ? '%' : '' }}</span>
          </div>
        </div>

        <p class="hint">
          百分比词条按界面数值填写（46.6 表示 46.6%），保存时会换算成 0.466 这样的原始值。
        </p>
        <p v-if="loadingPieces" class="hint">正在读取该套装的部件…</p>
        <p v-if="submitError" class="error">{{ submitError }}</p>
      </div>

      <footer class="editor-foot">
        <button type="button" class="ghost-btn" @click="emit('close')">取消</button>
        <button type="button" class="primary-btn" :disabled="submitting" @click="submit">
          {{ submitting ? '保存中…' : '保存' }}
        </button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
/* 遮罩 + 卡片都脱离文档流，卡片用不透明纯色，避免背后卡片列表透上来 */
.editor-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: rgba(0, 0, 0, 0.6);
}

.editor-card {
  display: flex;
  flex-direction: column;
  width: min(560px, 100%);
  max-height: 88vh;
  border: 1px solid var(--clr-white-10);
  border-radius: 16px;
  background-color: var(--clr-gray-10);
  overflow: hidden;
}

.editor-head {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--clr-white-10);
}

.editor-title {
  font-size: 18px;
  font-weight: normal;
  letter-spacing: 2px;
  color: var(--clr-white);
}

.close-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background-color: var(--clr-white-10);
  color: var(--clr-white-70);
  font-family: inherit;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.close-btn:hover {
  background-color: var(--clr-white-20);
  color: var(--clr-white);
}

.editor-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px;
  overflow-y: auto;
}

.field {
  display: flex;
  align-items: center;
  gap: 10px;
}

.field-label {
  flex: none;
  min-width: 54px;
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--clr-white-60);
}

.control {
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--clr-white-10);
  border-radius: 10px;
  background-color: var(--clr-white-10);
  color: var(--clr-white);
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.control:focus {
  border-color: var(--clr-white-30);
}

.control option {
  background-color: var(--clr-gray-20);
  color: var(--clr-white);
}

.grow {
  flex: 1;
  min-width: 0;
}

.value-input {
  width: 104px;
  font-variant-numeric: tabular-nums;
}

.unit {
  width: 14px;
  color: var(--clr-white-50);
  font-size: 14px;
}

/* 复用的套装下拉 / 部位胶囊在表单行里占满剩余宽度 */
.field .set-select {
  flex: 1;
  max-width: none;
}

.field .pills {
  flex: 1;
  min-width: 0;
}

.append-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
}

.append-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.append-index {
  width: 16px;
  color: var(--clr-white-40);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--clr-white-40);
  letter-spacing: 0.5px;
}

.error {
  margin: 0;
  font-size: 13px;
  color: rgb(255, 138, 128);
}

.editor-foot {
  display: flex;
  flex: none;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--clr-white-10);
}

.ghost-btn,
.primary-btn {
  height: 36px;
  padding: 0 18px;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
}

.ghost-btn {
  background-color: var(--clr-white-10);
  color: var(--clr-white-70);
}

.ghost-btn:hover {
  background-color: var(--clr-white-20);
  color: var(--clr-white);
}

.primary-btn {
  background-color: var(--clr-white-90);
  color: var(--clr-black);
}

.primary-btn:hover:not(:disabled) {
  background-color: var(--clr-white);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .editor-mask {
    padding: 12px;
  }

  .value-input {
    width: 84px;
  }

  .field-label {
    min-width: 44px;
    font-size: 13px;
  }
}
</style>
