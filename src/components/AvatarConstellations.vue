<script setup>
import { computed, reactive } from 'vue'
import * as getImgUrl from '@/utils/getImgUrl'

const props = defineProps({
  constellations: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

const data = computed(() => props.constellations || {})
const list = computed(() => data.value.constellations || [])

// ========== 命座图标 ==========
// 接口直接给出资源文件名（如 UI_AvatarIcon_Ayaka_Constellation_1），
// 目录规则与角色头像一致，复用 avatarIcon() 即可拼出路径
const brokenIcons = reactive(new Set())

const rows = computed(() =>
  list.value.map((item) => {
    const iconName = item?.constellationIconName
    const missing = !iconName || brokenIcons.has(item.id)
    return { ...item, iconUrl: missing ? '' : getImgUrl.avatarIcon(iconName) }
  }),
)

// 素材缺失时（少量新角色还没出图）退回占位，避免出现破图
function onIconError(id) {
  brokenIcons.add(id)
}

// ========== 文本处理 ==========
function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// 只认 <color=#RRGGBB(AA)> </color> <i> </i> 四种标签，其余内容一律转义
const INLINE_TAG_RE = /<color=#([0-9A-Fa-f]{6,8})>|<\/color>|<i>|<\/i>/g

function lineToHtml(line) {
  let html = ''
  let last = 0
  let match = INLINE_TAG_RE.exec(line)

  while (match) {
    html += escapeHtml(line.slice(last, match.index))
    if (match[1]) html += `<span style="color:#${match[1]}">`
    else if (match[0] === '</color>') html += '</span>'
    else if (match[0] === '<i>') html += '<em>'
    else html += '</em>'
    last = INLINE_TAG_RE.lastIndex
    match = INLINE_TAG_RE.exec(line)
  }

  html += escapeHtml(line.slice(last))
  return html
}

// descExtra 有内容时只展示它，否则退回 desc
function mainDesc(item) {
  const extra = item?.descExtra
  return extra && String(extra).trim() ? extra : item?.desc
}

// 按字面量 \n 断行；LINK 外壳去掉、保留链接文字；保留颜色高亮与斜体
function descHtml(text) {
  if (!text) return ''
  return String(text)
    .split('\\n')
    .map((line) => `<p>${lineToHtml(line.replace(/\{LINK#[^}]*\}|\{\/LINK\}/g, ''))}</p>`)
    .join('')
}
</script>

<template>
  <div id="avatar-constellations">
    <section v-for="item in rows" :key="item.id" class="panel">
      <div class="card-head">
        <img
          v-if="item.iconUrl"
          class="icon"
          :src="item.iconUrl"
          :alt="item.name + ' 命座图标'"
          loading="lazy"
          @error="onIconError(item.id)"
        />
        <div v-else class="icon icon-placeholder">图标</div>
        <h2 class="panel-title">{{ item.name }}</h2>
      </div>

      <div class="desc" v-html="descHtml(mainDesc(item))"></div>
    </section>
  </div>
</template>

<style scoped>
#avatar-constellations {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  color: var(--clr-white);
}

.panel {
  border: 1px solid var(--clr-white-10);
  border-radius: 16px;
  background-color: var(--clr-black-80);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

/* 命座图标：细线稿 + 透明底，按 contain 保持原始比例 */
.icon {
  width: 72px;
  height: 72px;
  flex: none;
  object-fit: contain;
}

/* 少数新角色还没有命座图标素材，退回虚线占位 */
.icon-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed var(--clr-white-20);
  border-radius: 12px;
  background-color: var(--clr-white-10);
  color: var(--clr-white-50);
  font-size: 13px;
}

.panel-title {
  font-size: 20px;
  font-weight: normal;
  letter-spacing: 1px;
}

.desc {
  font-size: 15px;
  line-height: 1.9;
  color: var(--clr-white-70);
}

.desc:empty {
  display: none;
}

.desc :deep(p) {
  margin: 0;
}

.desc :deep(p + p) {
  margin-top: 6px;
}

.desc :deep(em) {
  font-style: italic;
  color: var(--clr-white-50);
}

/* ========== 窄屏（移动设备）适配：两列在手机上会挤成竖排文字，改成单列 ========== */
@media (max-width: 768px) {
  #avatar-constellations {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .panel {
    gap: 10px;
    padding: 16px;
    border-radius: 14px;
  }

  .panel-title {
    font-size: 18px;
  }

  .desc {
    font-size: 14px;
    line-height: 1.8;
  }

  .icon {
    width: 56px;
    height: 56px;
  }
}
</style>
