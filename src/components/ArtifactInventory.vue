<script setup>
import { computed, onMounted, ref } from 'vue'

import initialRelics from '@/assets/testJson/artiTest.json'
import request from '@/utils/request'
import { propLabel, propText, slotOfRelic } from '@/utils/reliquaryProp'
import ArtifactEditor from '@/components/ArtifactEditor.vue'
import FilterPills from '@/components/FilterPills.vue'
import SetSelect from '@/components/SetSelect.vue'

// 选择模式：卡片可点，选中后 emit('select', relic)，并隐藏「新增圣遗物」
defineProps({
  selectable: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

// 背包顶部的部位筛选
const SLOT_OPTIONS = ['全部', '生之花', '死之羽', '时之沙', '空之杯', '理之冠']

const SLOT_FILTERS = SLOT_OPTIONS.map((slot) => ({ value: slot, label: slot }))

// 星级主题色
const RANK_COLOR = {
  5: 'rgb(255, 180, 65)',
  4: 'rgb(180, 150, 240)',
}

// 新增圣遗物会写进测试数据文件，所以列表要能整体替换
const relics = ref([...initialRelics])

const activeSlot = ref(SLOT_OPTIONS[0])
const activeSetId = ref(null)

// 套装下拉的内容来自接口，顺带给出 setId → 名称的映射
const setList = ref([])
const showEditor = ref(false)

const setNames = computed(() =>
  Object.fromEntries(setList.value.map((item) => [item.setId, item.name])),
)

async function loadSets() {
  try {
    const list = await request.get('/api/reliquary/list')
    setList.value = Array.isArray(list) ? list : []
  } catch (error) {
    // 取名失败不影响本地数据渲染，卡片上的套装名退化成 setId
    console.error('套装名称加载失败：', error)
  }
}

onMounted(loadSets)

// 测试数据按星级、等级从高到低排，同档位看上去更像游戏里的背包
const visibleRelics = computed(() => {
  const list = relics.value.filter(
    (relic) =>
      (activeSlot.value === SLOT_OPTIONS[0] || slotOfRelic(relic.relicId) === activeSlot.value) &&
      (activeSetId.value === null || relic.setId === activeSetId.value),
  )

  return [...list].sort((a, b) => b.rankLevel - a.rankLevel || b.level - a.level)
})

function rankColor(rankLevel) {
  return RANK_COLOR[rankLevel] ?? 'var(--clr-white-50)'
}

function setNameOf(relic) {
  return setNames.value[relic?.setId] ?? `套装 ${relic?.setId ?? ''}`
}

function slotOf(relic) {
  return slotOfRelic(relic?.relicId)
}

// 后端把新增后的全量数组返回过来，直接替换内存里的列表
function onCreated(list) {
  if (Array.isArray(list) && list.length) relics.value = list
}
</script>

<template>
  <section class="inventory">
    <!-- 筛选栏在滚动容器之外，固定贴在内容区顶部 -->
    <div class="filter-bar">
      <SetSelect v-model="activeSetId" :sets="setList" all-label="全部套装" />

      <div class="slot-bar">
        <FilterPills v-model="activeSlot" :options="SLOT_FILTERS" />
      </div>

      <button v-if="!selectable" type="button" class="add-btn" @click="showEditor = true">
        新增圣遗物
      </button>
    </div>

    <div class="relic-list" data-page-scroll>
      <div class="relic-grid">
        <article
          v-for="relic in visibleRelics"
          :key="relic.id"
          class="relic-card"
          :class="{ selectable }"
          :role="selectable ? 'button' : undefined"
          :tabindex="selectable ? 0 : undefined"
          @click="selectable && emit('select', relic)"
          @keydown.enter.prevent="selectable && emit('select', relic)"
          @keydown.space.prevent="selectable && emit('select', relic)"
        >
          <div class="relic-head">
            <span class="relic-icon" aria-hidden="true"></span>
            <div class="relic-title">
              <span class="relic-name">{{ setNameOf(relic) }}</span>
              <span class="relic-meta">Lv.{{ relic.level }} · {{ slotOf(relic) }}</span>
            </div>
            <span class="relic-rank" :style="{ color: rankColor(relic.rankLevel) }">
              {{ relic.rankLevel }}★
            </span>
          </div>

          <div class="relic-main">
            <span class="relic-main-name">{{ propLabel(relic.mainPropName) }}</span>
            <span class="relic-main-value" :style="{ color: rankColor(relic.rankLevel) }">
              {{ propText(relic.mainPropName, relic.mainPropValue) }}
            </span>
          </div>

          <ul class="relic-append">
            <li v-for="(prop, index) in relic.appendProp" :key="index">
              <span class="append-name">{{ propLabel(prop.propName) }}</span>
              <span class="append-value">{{ propText(prop.propName, prop.propValue) }}</span>
            </li>
          </ul>
        </article>
      </div>
    </div>

    <ArtifactEditor
      v-if="showEditor"
      :sets="setList"
      @close="showEditor = false"
      @created="onCreated"
    />
  </section>
</template>

<style scoped>
.inventory {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

/* 筛选栏不参与列表滚动，位置恒定 */
.filter-bar {
  display: flex;
  flex: none;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.slot-bar {
  display: flex;
  flex: 1;
  min-width: 0;
}

.add-btn {
  flex: none;
  height: 34px;
  padding: 0 18px;
  border: none;
  border-radius: 9999px;
  background-color: var(--clr-white-90);
  color: var(--clr-black);
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background-color 150ms;
}

.add-btn:hover {
  background-color: var(--clr-white);
}

/* 只有卡片列表滚动，滚动条隐藏，靠滚轮/触摸滑动 */
.relic-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
}

.relic-list::-webkit-scrollbar {
  display: none;
}

.relic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.relic-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--clr-white-10);
  border-radius: 16px;
  background-color: var(--clr-black-80);
}

/* 选择模式下整张卡就是按钮：可点、可聚焦，hover 有反馈 */
.relic-card.selectable {
  cursor: pointer;
  transition:
    border-color 150ms,
    background-color 150ms;
}

.relic-card.selectable:hover,
.relic-card.selectable:focus-visible {
  border-color: var(--clr-white-30);
  background-color: var(--clr-black-70);
  outline: none;
}

.relic-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 圣遗物图标素材尚未入库，先用 1:1 占位框 */
.relic-icon {
  flex: none;
  width: 56px;
  height: 56px;
  border: 1px dashed var(--clr-white-20);
  border-radius: 10px;
  background-color: var(--clr-white-10);
}

.relic-title {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.relic-name {
  font-size: 15px;
  letter-spacing: 1px;
  color: var(--clr-white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.relic-meta {
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--clr-white-50);
}

.relic-rank {
  flex: none;
  font-size: 13px;
  letter-spacing: 1px;
}

.relic-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--clr-white-10);
}

.relic-main-name {
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--clr-white-70);
}

.relic-main-value {
  font-size: 20px;
  letter-spacing: 1px;
  font-variant-numeric: tabular-nums;
}

.relic-append {
  display: flex;
  flex-direction: column;
  gap: 6px;
  list-style: none;
}

.relic-append li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  color: var(--clr-white-60);
}

.append-name {
  letter-spacing: 1px;
}

.append-value {
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .filter-bar {
    gap: 8px;
  }

  .slot-bar {
    flex: 1 1 100%;
  }

  .add-btn {
    height: 32px;
    font-size: 13px;
  }

  .relic-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .relic-card {
    padding: 12px;
  }

  .relic-icon {
    width: 44px;
    height: 44px;
  }

  .relic-main-value {
    font-size: 17px;
  }
}
</style>
