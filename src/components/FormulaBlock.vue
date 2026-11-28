<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = withDefaults(
  defineProps<{
    latex: string
    display?: boolean
    terms?: Record<string, string>
  }>(),
  {
    display: true,
    terms: () => ({}),
  },
)

const container = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const activeTip = ref<string | null>(null)
const tooltipStyle = ref<Record<string, string>>({})

const rendered = computed(() => {
  try {
    return katex.renderToString(props.latex, {
      displayMode: props.display,
      throwOnError: false,
      strict: false,
      trust: true,
    })
  } catch {
    return null
  }
})

const boundElements: HTMLElement[] = []
let currentTarget: HTMLElement | null = null
let hideTimer: ReturnType<typeof setTimeout> | undefined
let lastShownAt = 0

function clearHideTimer() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = undefined
  }
}

function hide() {
  clearHideTimer()
  activeTip.value = null
  currentTarget = null
}

function scheduleHide() {
  clearHideTimer()
  hideTimer = setTimeout(hide, 120)
}

function positionTooltip(target: HTMLElement) {
  const rect = target.getBoundingClientRect()
  const gap = 8
  const margin = 8
  const width = tooltipRef.value?.offsetWidth ?? 240
  const height = tooltipRef.value?.offsetHeight ?? 60
  const block = container.value?.getBoundingClientRect()

  // 优先放在参数上方；若仍会压到公式块，则整体抬到公式块之上；上方放不下时退到公式块下方。
  let top = rect.top - gap - height
  if (block) {
    if (top + height > block.top) {
      top = block.top - gap - height
    }
    if (top < margin) {
      top = block.bottom + gap
    }
  }
  top = Math.max(margin, Math.min(top, window.innerHeight - height - margin))

  let left = rect.left + rect.width / 2 - width / 2
  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin))

  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

function show(target: HTMLElement, term: string) {
  const description = props.terms[term]
  if (!description) return

  clearHideTimer()
  currentTarget = target
  lastShownAt = Date.now()
  activeTip.value = description
  void nextTick(() => {
    if (currentTarget === target) positionTooltip(target)
  })
}

function handleEnter(event: Event) {
  const target = event.currentTarget as HTMLElement | null
  const term = target?.dataset.term
  if (target && term) show(target, term)
}

function handleLeave() {
  scheduleHide()
}

function handleClick(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement | null
  const term = target?.dataset.term
  if (!target || !term) return

  event.stopPropagation()
  if (currentTarget === target && activeTip.value) {
    // 触摸设备点击前会先触发合成的 mouseenter，短时间内随之而来的 click
    // 应视为同一次操作，保持浮窗显示而不是立即关闭。
    if (Date.now() - lastShownAt < 400) return
    hide()
  } else {
    show(target, term)
  }
}

function handleDocumentClick() {
  hide()
}

function handleScroll() {
  hide()
}

function unbindTerms() {
  for (const element of boundElements) {
    element.removeEventListener('mouseenter', handleEnter)
    element.removeEventListener('mouseleave', handleLeave)
    element.removeEventListener('click', handleClick)
  }
  boundElements.length = 0
}

function bindTerms() {
  unbindTerms()

  const root = container.value
  if (!root) return

  for (const element of root.querySelectorAll<HTMLElement>('[data-term]')) {
    element.classList.add('formula-term')
    element.addEventListener('mouseenter', handleEnter)
    element.addEventListener('mouseleave', handleLeave)
    element.addEventListener('click', handleClick)
    boundElements.push(element)
  }
}

watch(rendered, () => {
  hide()
  void nextTick(bindTerms)
})

onMounted(() => {
  bindTerms()
  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('scroll', handleScroll, true)
})

onBeforeUnmount(() => {
  unbindTerms()
  clearHideTimer()
  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<template>
  <div ref="container" class="formula-block">
    <div v-if="rendered" class="formula-block__content" v-html="rendered" />
    <code v-else class="formula-block__fallback">{{ latex }}</code>
  </div>

  <Teleport to="body">
    <div
      v-if="activeTip"
      ref="tooltipRef"
      class="formula-tooltip"
      :style="tooltipStyle"
      @mouseenter="clearHideTimer"
      @mouseleave="scheduleHide"
    >
      {{ activeTip }}
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.formula-block {
  overflow-x: auto;
  padding: $space-4;
  color: $color-text-primary;
  background-color: $color-bg-raised;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  scrollbar-width: thin;
  scrollbar-color: rgba(211, 169, 92, 0.45) transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(211, 169, 92, 0.45);
    border-radius: $radius-full;
  }

  :deep(.katex) {
    color: $color-text-primary;
  }

  :deep(.formula-term) {
    position: relative;
    z-index: 1;
    color: $color-accent;
    text-decoration: underline dotted;
    text-underline-offset: 0.25em;
    cursor: pointer;

    &:hover {
      text-decoration-style: solid;
    }
  }
}

.formula-block__fallback {
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
}

.formula-tooltip {
  position: fixed;
  z-index: 1100;
  max-width: 300px;
  padding: $space-2 $space-3;
  color: $color-text-primary;
  font-size: $font-size-base;
  line-height: 1.5;
  background-color: $color-bg-raised;
  border: 1px solid $color-accent-soft;
  border-radius: $radius-md;
  box-shadow: $shadow-lg;
}
</style>
