<script setup>
import { computed, ref } from 'vue'

/**
 * 图鉴列表的通用卡片（角色、武器、圣遗物共用）
 *
 * 桌面端：整张卡就是图片（立绘 / 图标），比例由 ratio 决定。
 * 移动端：米白底 + 品质底图 + 方形图，右下角圆角，底部一行名字条。
 * 两端的图源由调用方通过 image / mobileImage 传入，用 <picture> 的 media 条件切换，
 * 未命中的 <source> 不会发起请求。
 */
const props = defineProps({
  // 桌面端图源（立绘 / 图标）
  image: { type: String, default: '' },
  // 移动端图源（方形图标），为空时退回 image
  mobileImage: { type: String, default: '' },
  // 品质底图，只在移动端显示
  quality: { type: String, default: '' },
  // 卡片名字（同时作为图片的 alt）
  name: { type: String, default: '' },
  // 无障碍名称，缺省用 name
  label: { type: String, default: '' },
  // 没有图片时的占位文案
  placeholder: { type: String, default: '' },
  // 桌面端卡片的宽高比：竖版立绘 1 / 2.5，方形图标 1 / 1
  ratio: { type: String, default: '1 / 2.5' },
  // 图片填充方式：cover = 铺满裁切，contain = 完整展示不裁切
  fit: { type: String, default: 'cover' },
})

const emit = defineEmits(['click'])

// 素材缺失时 Vite dev 会返回 200 + text/html，<img> 解不出来只会显示破图，
// 这里接住 error 事件切到占位框
const broken = ref(false)

const art = computed(() => (broken.value ? '' : props.image))
const mobileArt = computed(() => (broken.value ? '' : props.mobileImage || props.image))
</script>

<template>
  <button
    type="button"
    class="media-card"
    :class="`is-${fit}`"
    :style="{ '--card-ratio': ratio }"
    :aria-label="label || name"
    @click="emit('click')"
  >
    <span class="media-figure">
      <img
        v-if="quality"
        class="media-quality"
        :src="quality"
        alt=""
        loading="lazy"
        decoding="async"
      />

      <picture v-if="art" class="media-picture">
        <source v-if="mobileArt" media="(max-width: 768px)" :srcset="mobileArt" />
        <img
          class="media-art"
          :src="art"
          :alt="name"
          loading="lazy"
          decoding="async"
          @error="broken = true"
        />
      </picture>

      <span v-else class="media-placeholder">{{ placeholder || name }}</span>
    </span>

    <span class="media-name">{{ name }}</span>
  </button>
</template>

<style scoped>
/* 桌面端：整张卡就是图片，宽高比由调用方通过 ratio 传入（1 : 2.5 竖卡 / 1 : 1 方卡） */
.media-card {
  width: 100%;
  aspect-ratio: var(--card-ratio, 1 / 2.5);
  padding: 0;
  border: 1px solid var(--clr-white-10);
  border-radius: 16px;
  background-color: var(--clr-black-80);
  cursor: pointer;
  overflow: hidden;
  transition: 200ms;
}

.media-card:hover {
  border-color: var(--clr-white-30);
}

/* 卡面：上半部分「品质底图 + 立绘」，下半部分名字条，只有移动端启用。
   position: relative 是给桌面的占位框（absolute inset: 0）定位用的 */
.media-figure {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
}

/* 品质底图只在移动端出现，桌面卡面就是立绘本身 */
.media-quality {
  display: none;
}

/* picture 只是给 <source> 挂媒体条件的壳，尺寸与裁切交给内部的 img */
.media-picture {
  display: block;
  width: 100%;
  height: 100%;
}

/* 立绘用原生 img + 懒加载：CSS 背景图不受 loading="lazy" 约束，会首屏全量下载 */
.media-art {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
  transform: scale(1.05);
  transition: transform 200ms;
}

.media-card:hover .media-art {
  transform: scale(1);
}

/* 立绘必须完整展示的卡片（武器）：不放大、不裁切，整张图落在卡内。
   武器 Gacha 是 512 × 1024（1 : 2），比 1 : 2.5 的卡面更宽，
   用 cover 会左右各裁掉一截，长枪这类斜放素材会被切掉枪尖与枪尾 */
.media-card.is-contain .media-art {
  object-fit: contain;
  object-position: center;
  transform: none;
}

/* 名字条只在移动端出现（桌面是完整立绘，卡片里没有它的位置） */
.media-name {
  display: none;
}

/* 没有素材时的占位框：与角色板块的 icon-placeholder 同一套虚线框 */
.media-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--clr-white-20);
  border-radius: 12px;
  background-color: var(--clr-white-10);
  color: var(--clr-white-40);
  font-size: 13px;
  letter-spacing: 1px;
}

/* ========== 窄屏（移动设备）：米白卡面 + 方形图标 + 名字条 ========== */
@media (max-width: 768px) {
  /* aspect-ratio 必须清掉，否则卡片高度仍是宽度的两倍，
     方形图只占上半部分，下半部分留白看起来像「名字条和图片一样高」 */
  .media-card {
    display: flex;
    flex-direction: column;
    aspect-ratio: auto;
    height: auto;
    border-color: transparent;
    border-radius: 12px;
    background-color: #f6f0e5;
  }

  /* 上半部分：品质底图垫底、方形图标压在上面，两层圆角由容器裁切 */
  .media-figure {
    position: relative;
    flex: none;
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-bottom-right-radius: 20px;
  }

  .media-quality {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .media-picture {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .media-art {
    object-fit: contain;
    object-position: center bottom;
    transform: none;
  }

  .media-placeholder {
    border: none;
    border-radius: 0;
    background-color: rgba(246, 240, 229, 0.72);
    color: #8a8177;
    font-size: 12px;
  }

  /* 名字条：米白底配深色字，过长时省略号截断；只占一行高度，不参与拉伸 */
  .media-name {
    display: block;
    flex: none;
    padding: 6px 6px 8px;
    overflow: hidden;
    font-size: 13px;
    letter-spacing: 0.5px;
    color: #2b2b2b;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
