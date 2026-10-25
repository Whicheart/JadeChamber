<script setup>
import { computed } from 'vue'

const props = defineProps({
  stories: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

const data = computed(() => props.stories || {})
const list = computed(() => data.value.stories || [])

// 开启条件写在标题右侧，多条用顿号连接
function tipsText(tips) {
  return Array.isArray(tips) ? tips.filter(Boolean).join(' / ') : ''
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
  <div id="avatar-stories">
    <section v-for="(item, index) in list" :key="index" class="panel">
      <div class="card-head">
        <h2 class="panel-title">{{ item.title }}</h2>
        <span v-if="tipsText(item.tips)" class="tips">{{ tipsText(item.tips) }}</span>
      </div>

      <div class="desc" v-html="descHtml(item.text)"></div>
    </section>
  </div>
</template>

<style scoped>
#avatar-stories {
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
  align-items: baseline;
  gap: 12px;
}

.panel-title {
  font-size: 20px;
  font-weight: normal;
  letter-spacing: 1px;
}

.tips {
  color: var(--clr-white-50);
  font-size: 13px;
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
</style>
