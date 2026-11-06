<script setup>
import { computed, reactive } from 'vue'
import { asset } from '@/utils/getImage'
import { descHtml } from '@/utils/richText'

const props = defineProps({
  outfits: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  // 角色本体立绘文件名（base-info.gachaImageName），默认装扮没有专属立绘时用它
  gachaImageName: {
    type: String,
    default: '',
  },
})

const data = computed(() => props.outfits || {})
const list = computed(() => data.value.outfits || [])

// ========== 装扮立绘 ==========
// 皮肤装扮自带 imageName（UI_Costume_*），整套素材里只有 4★ 皮肤有；
// 默认装扮（indexID 为 null）没有 imageName，用角色本体立绘兜底
const brokenArts = reactive(new Set())

function artUrl(item) {
  const imageName = String(item?.imageName || '')
  if (imageName) return brokenArts.has(imageName) ? '' : asset(imageName)

  if (item?.indexID == null) return asset(props.gachaImageName)

  return ''
}

// 兜底：字段有值但浏览器加载失败时退回占位框
function onSplashError(item) {
  const imageName = String(item?.imageName || '')
  if (imageName) brokenArts.add(imageName)
}

// 品质：4 → 四星，5 → 五星，缺省不显示
const QUALITY_MAP = { 4: '四星', 5: '五星' }
const qualityText = (quality) => QUALITY_MAP[quality] || ''
</script>

<template>
  <div id="avatar-outfits">
    <section v-for="item in list" :key="item.id" class="panel">
      <img
        v-if="artUrl(item)"
        class="splash"
        :src="artUrl(item)"
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

/* ========== 窄屏（移动设备）适配 ========== */
@media (max-width: 768px) {
  #avatar-outfits {
    gap: 12px;
  }

  .panel {
    gap: 10px;
    padding: 14px;
    border-radius: 14px;
  }

  /* 竖屏下 45vh 会把整套立绘压得很小，收到 32vh 更耐看 */
  .splash {
    max-height: 32vh;
  }

  .splash-placeholder {
    height: 200px;
    font-size: 15px;
  }

  .panel-title {
    font-size: 17px;
  }

  .desc {
    font-size: 14px;
    line-height: 1.8;
  }
}
</style>
