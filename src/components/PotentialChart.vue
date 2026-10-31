<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

// 按需注册，避免把整个 echarts 打进包里
echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps({
  // 已按分数升序的分布数据：[{ score, count }]
  points: { type: Array, default: () => [] },
  height: { type: Number, default: 280 },
})

const chartRef = ref(null)

let chart = null
let observer = null

const AXIS_COLOR = 'rgba(255, 255, 255, 0.5)'
const LINE_COLOR = 'rgb(255, 180, 65)'

function buildOption() {
  const data = props.points.map((point) => [Number(point.score), Number(point.count)])
  // 点太多时只画线，不画点
  const showSymbol = data.length <= 60

  return {
    animationDuration: 300,
    grid: { top: 28, right: 20, bottom: 44, left: 56 },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(20, 20, 24, 0.92)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: (params) => {
        const [score, count] = params.value ?? []

        return `分数 ${score}<br/>出现 ${count} 次`
      },
    },
    xAxis: {
      type: 'value',
      name: '分数',
      nameGap: 16,
      nameTextStyle: { color: AXIS_COLOR, fontSize: 12 },
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.18)' } },
      axisTick: { show: false },
      axisLabel: { color: AXIS_COLOR, fontSize: 11 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '次数',
      nameGap: 12,
      minInterval: 1,
      nameTextStyle: { color: AXIS_COLOR, fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: AXIS_COLOR, fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.06)' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol,
        lineStyle: { width: 2, color: LINE_COLOR },
        itemStyle: { color: LINE_COLOR },
        areaStyle: { color: 'rgba(255, 180, 65, 0.12)' },
        data,
      },
    ],
  }
}

function render() {
  if (!chart) return

  chart.setOption(buildOption(), true)
}

onMounted(() => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)
  render()

  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(chartRef.value)
})

watch(() => props.points, render, { deep: true })

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div class="potential-chart">
    <div ref="chartRef" class="chart" :style="{ height: `${height}px` }"></div>

    <p v-if="!points.length" class="chart-empty">暂无模拟数据</p>
  </div>
</template>

<style scoped>
.potential-chart {
  position: relative;
  width: 100%;
}

.chart {
  width: 100%;
}

.chart-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--clr-white-40);
  pointer-events: none;
}
</style>
