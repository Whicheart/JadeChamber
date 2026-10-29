<script setup>
import { computed } from 'vue'
import { descHtml } from '@/utils/richText'

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

/* ========== 窄屏（移动设备）适配 ========== */
@media (max-width: 768px) {
  #avatar-stories {
    gap: 12px;
  }

  .panel {
    gap: 10px;
    padding: 14px;
    border-radius: 14px;
  }

  .panel-title {
    font-size: 17px;
  }

  /* 标题与提示语在窄屏下改为上下排布 */
  .card-head {
    flex-direction: column;
    gap: 4px;
  }

  .desc {
    font-size: 14px;
    line-height: 1.8;
  }
}
</style>
