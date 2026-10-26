<script setup>
import { computed, reactive, watch } from 'vue'
import * as getImgUrl from '@/utils/getImgUrl'
import { hasImage } from '@/utils/hasImage'

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

// 少数角色的立绘编号与装扮序号是错开的：第一套非默认时装没有独立立绘（固定占位），
// 立绘从第二套非默认时装开始，且文件名序号等于装扮序号（普通角色要 +1）
const FIRST_SKIN_WITHOUT_ART = new Set(['Qin', 'Mona', 'Rosaria', 'Ambor']) // 琴、莫娜、罗莎莉亚、安柏

function splashCandidates(item) {
  const dir = dirName.value
  if (!dir) return []

  const base = `UI_AvatarIcon_${dir}_Splash`
  const index = item?.indexID == null ? 0 : Number(item.indexID)

  // 默认装扮：立绘就是角色本体那张
  if (!index) return [getImgUrl.avatarIcon(base)]

  // 错位角色：第一套非默认时装固定无立绘，之后立绘序号与装扮序号对齐
  if (FIRST_SKIN_WITHOUT_ART.has(dir)) {
    return index === 1 ? [] : [getImgUrl.avatarIcon(`${base}_${index}`)]
  }

  // 普通角色：第 N 套装扮用 Splash_(N+1)，个别角色第二套存成了 Splash_0
  return [`${base}_${index + 1}`, `${base}_0`].map((name) => getImgUrl.avatarIcon(name))
}

// 每套立绘的探测结果：loading 探测中 / ok 有图 / missing 无图
const artState = reactive({})

function artOf(item) {
  return artState[item.id] || { status: 'loading', url: '' }
}

// 缺图时 vite 会拿 SPA 回退页冒充资源（200 + text/html），hasImage 只认真正的图片响应，
// 否则 <img> 会把整页 HTML 当图解码失败，露出一张破图 + alt 文本
// 按候选顺序逐张探测，第一张真实存在的图片胜出；全都没有就落到占位框
async function resolveArt(item) {
  for (const url of splashCandidates(item)) {
    if (await hasImage(url)) {
      artState[item.id] = { status: 'ok', url }
      return
    }
  }
  artState[item.id] = { status: 'missing', url: '' }
}

watch(
  list,
  (items) => {
    items.forEach((item) => resolveArt(item))
  },
  { immediate: true },
)

// 兜底：探测通过但浏览器仍加载失败时，直接退回占位框
function onSplashError(item) {
  artState[item.id] = { status: 'missing', url: '' }
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
        v-if="artOf(item).status === 'ok'"
        class="splash"
        :src="artOf(item).url"
        :alt="item.name + ' 装扮立绘'"
        loading="lazy"
        @error="onSplashError(item)"
      />
      <div v-else class="splash splash-placeholder">
        {{ artOf(item).status === 'missing' ? '该时装无立绘' : '' }}
      </div>

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
  font-size: 16px;
  letter-spacing: 1px;
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
