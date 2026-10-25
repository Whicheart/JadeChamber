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
</script>

<template>
  <div id="avatar-voices">
    <section v-if="dailies.length" class="panel">
      <h2 class="panel-title">日常语音</h2>

      <div class="voice-grid">
        <div v-for="(item, index) in dailies" :key="`d-${index}`" class="voice-item">
          <div class="voice-title">{{ item.title }}</div>
          <div class="voice-text">
            <p v-for="(line, i) in textLines(item.text)" :key="i">{{ line }}</p>
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
            <p v-for="(line, i) in textLines(item.text)" :key="i">{{ line }}</p>
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
</style>
