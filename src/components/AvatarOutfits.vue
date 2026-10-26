<script setup>
import { computed, reactive } from 'vue'
import * as getImgUrl from '@/utils/getImgUrl'

const props = defineProps({
  outfits: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  // 角色立绘文件名（base-info.splashIconName），用来定位 assets/img/avatar/<角色>/ 目录
  splashIconName: {
    type: String,
    default: '',
  },
})

const data = computed(() => props.outfits || {})
const list = computed(() => data.value.outfits || [])

// ========== 装扮立绘 ==========
// 接口不给图片名，只能按目录约定拼：默认装扮 Splash，第 N 套装扮 Splash_N
const dirName = computed(
  () =>
    String(props.splashIconName || '')
      .replace('UI_AvatarIcon_', '')
      .split('_')[0],
)

// 少数角色把第二套装扮存成了 Splash_0，因此按候选顺序逐张回退
function splashCandidates(item) {
  const dir = dirName.value
  if (!dir) return []

  const base = `UI_AvatarIcon_${dir}_Splash`
  const order = item?.indexID == null ? 1 : Number(item.indexID) + 1
  const names = order > 1 ? [`${base}_${order}`, `${base}_0`] : [base]

  return names.map((name) => getImgUrl.avatarIcon(name))
}

// 每套装扮记一个失败次数，第 1 张加载不出来就换第 2 张，都失败则退回占位
const failedCount = reactive({})

function splashUrl(item) {
  const candidates = splashCandidates(item)
  return candidates[failedCount[item.id] ?? 0] || ''
}

function onSplashError(item) {
  failedCount[item.id] = (failedCount[item.id] ?? 0) + 1
}

// 品质：4 → 四星，5 → 五星，缺省不显示
const QUALITY_MAP = { 4: '四星', 5: '五星' }
const qualityText = (quality) => QUALITY_MAP[quality] || ''

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
  <div id="avatar-outfits">
    <section v-for="item in list" :key="item.id" class="panel">
      <img
        v-if="splashUrl(item)"
        class="splash"
        :src="splashUrl(item)"
        :alt="item.name + ' 装扮立绘'"
        loading="lazy"
        @error="onSplashError(item)"
      />
      <div v-else class="splash splash-placeholder">该时装无立绘</div>

      <div class="card-head">
        <h2 class="panel-title">{{ item.name }}</h2>
        <div v-if="qualityText(item.quality)" class="quality">
          {{ qualityText(item.quality) }}
        </div>
      </div>

      <div class="desc" v-html="descHtml(item.desc)"></div>
    </section>
  </div>
</template>

<style scoped>
#avatar-outfits {
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
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

/* 装扮立绘：透明底横版全幅，按 contain 显示、不裁切 */
.splash {
  display: block;
  width: 100%;
  max-height: 45vh;
  object-fit: contain;
  border-radius: 12px;
}

/* 少数装扮还没有专属立绘（如琴的第三套），先占位 */
.splash-placeholder {
  height: 260px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed var(--clr-white-20);
  background-color: var(--clr-white-10);
  color: var(--clr-white-50);
  font-size: 13px;
}

.panel-title {
  font-size: 20px;
  font-weight: normal;
  letter-spacing: 1px;
  text-align: center;
}

/* 星级：位于名称下方并居中，显式写 align-self，不依赖父级 align-items */
.quality {
  align-self: center;
  width: fit-content;
  margin-inline: auto;
  padding: 2px 10px;
  border-radius: 9999px;
  background-color: var(--clr-white-20);
  color: var(--clr-white-70);
  font-size: 13px;
}

.desc {
  font-size: 15px;
  line-height: 1.9;
  color: var(--clr-white-70);
  text-align: center;
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
</style>
