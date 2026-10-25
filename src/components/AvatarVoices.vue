<script setup>
import { computed } from 'vue'

const props = defineProps({
  voices: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

const data = computed(() => props.voices || {})
const dailies = computed(() => data.value.dailies || [])
const battles = computed(() => data.value.battles || [])

// 台词里的换行可能是真实换行，也可能是字面量 \n，统一拆成多行
function textLines(text) {
  return String(text || '')
    .split(/\r?\n|\\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '')
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

// 每行先剥掉 LINK 外壳再还原颜色高亮与斜体
function textHtml(text) {
  return textLines(text).map((line) => lineToHtml(line.replace(/\{LINK#[^}]*\}|\{\/LINK\}/g, '')))
}
</script>

<template>
  <div id="avatar-voices">
    <section v-if="dailies.length" class="panel">
      <h2 class="panel-title">日常语音</h2>

      <div class="voice-grid">
        <div v-for="(item, index) in dailies" :key="`d-${index}`" class="voice-item">
          <div class="voice-title">{{ item.title }}</div>
          <div class="voice-text">
            <p v-for="(line, i) in textHtml(item.text)" :key="i" v-html="line"></p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="battles.length" class="panel">
      <h2 class="panel-title">战斗语音</h2>

      <div class="voice-grid">
        <div v-for="(item, index) in battles" :key="`b-${index}`" class="voice-item">
          <div class="voice-title">{{ item.title }}</div>
          <div class="voice-text">
            <p v-for="(line, i) in textHtml(item.text)" :key="i" v-html="line"></p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
#avatar-voices {
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
  gap: 16px;
}

.panel-title {
  font-size: 22px;
  font-weight: normal;
  letter-spacing: 2px;
}

.voice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.voice-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 12px;
  background-color: var(--clr-white-10);
}

.voice-title {
  font-size: 15px;
  color: var(--clr-white-50);
}

.voice-text {
  font-size: 16px;
  line-height: 1.7;
}

.voice-text p {
  margin: 0;
}

.voice-text p + p {
  margin-top: 4px;
}

.voice-text :deep(em) {
  font-style: italic;
  color: var(--clr-white-50);
}
</style>
