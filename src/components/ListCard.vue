<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    image?: string
    mobileImage?: string
    background?: string
    ratio?: number
    fit?: 'cover' | 'contain'
    position?: string
  }>(),
  {
    ratio: 1 / 2.2,
    fit: 'cover',
    position: 'center center',
  },
)

const desktopBroken = ref(false)
const mobileBroken = ref(false)

const desktopSource = computed(() => {
  if (desktopBroken.value) return undefined
  return props.image ?? props.mobileImage
})

const mobileSource = computed(() => {
  if (mobileBroken.value) return undefined
  return props.mobileImage ?? props.image
})

const mediaStyle = computed(() => ({
  '--card-ratio': String(props.ratio),
  backgroundImage: props.background ? `url("${props.background}")` : undefined,
}))
</script>

<template>
  <article class="list-card">
    <div class="list-card__media" :style="mediaStyle">
      <img
        v-if="desktopSource"
        class="list-card__image list-card__image--desktop"
        :src="desktopSource"
        alt=""
        :style="{ objectFit: fit, objectPosition: position }"
        loading="lazy"
        @error="desktopBroken = true"
      />
      <span v-if="!desktopSource" class="list-card__placeholder list-card__placeholder--desktop">
        {{ name }}
      </span>
      <img
        v-if="mobileSource"
        class="list-card__image list-card__image--mobile"
        :src="mobileSource"
        alt=""
        :style="{ objectFit: fit, objectPosition: position }"
        loading="lazy"
        @error="mobileBroken = true"
      />
      <span v-if="!mobileSource" class="list-card__placeholder list-card__placeholder--mobile">
        {{ name }}
      </span>
    </div>
    <p class="list-card__name">{{ name }}</p>
  </article>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.list-card {
  overflow: hidden;
  background-color: $color-bg-raised;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  transition:
    transform $transition-base,
    border-color $transition-base,
    box-shadow $transition-base;

  &:hover {
    border-color: $color-accent;
    box-shadow: $shadow-glow;
    transform: translateY(-2px);
  }
}

.list-card__media {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background-image: linear-gradient(160deg, rgba(211, 169, 92, 0.12), transparent 55%);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

@include media-up('md') {
  .list-card__media {
    aspect-ratio: var(--card-ratio, 1 / 2.2);
  }
}

.list-card__image {
  width: 100%;
  height: 100%;
}

.list-card__image--desktop {
  display: none;
}

.list-card__image--mobile {
  display: block;
}

.list-card__placeholder {
  display: none;
  color: $color-text-muted;
  font-size: $font-size-3xl;
}

.list-card__placeholder--mobile {
  display: block;
}

@include media-up('md') {
  .list-card__image--desktop {
    display: block;
  }

  .list-card__image--mobile {
    display: none;
  }

  .list-card__placeholder--mobile {
    display: none;
  }

  .list-card__placeholder--desktop {
    display: block;
  }
}

.list-card__name {
  padding: $space-2 $space-3;
  font-size: $font-size-sm;
  @include truncate;
}
</style>
