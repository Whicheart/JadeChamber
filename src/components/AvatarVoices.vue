<script setup>
import { computed } from 'vue'
import { linesToHtml } from '@/utils/richText'

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
</script>

<template>
  <div id="avatar-voices">
    <section v-if="dailies.length" class="panel">
      <h2 class="panel-title">日常语音</h2>

      <div class="voice-grid">
        <div v-for="(item, index) in dailies" :key="`d-${index}`" class="voice-item">
          <div class="voice-title">{{ item.title }}</div>
          <div class="voice-text">
            <p v-for="(line, i) in linesToHtml(item.text)" :key="i" v-html="line"></p>
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
            <p v-for="(line, i) in linesToHtml(item.text)" :key="i" v-html="line"></p>
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

/* ========== 窄屏（移动设备）适配：台词两列在手机上会频繁折行，改成单列 ========== */
@media (max-width: 768px) {
  #avatar-voices {
    gap: 12px;
  }

  .panel {
    gap: 12px;
    padding: 14px;
    border-radius: 14px;
  }

  .panel-title {
    font-size: 18px;
    letter-spacing: 1px;
  }

  .voice-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }

  .voice-item {
    padding: 12px;
  }

  .voice-title {
    font-size: 14px;
  }

  .voice-text {
    font-size: 15px;
    line-height: 1.7;
  }
}
</style>
