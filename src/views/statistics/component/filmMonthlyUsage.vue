<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { ComponentPublicInstance } from 'vue'
import echarts from '@/plugins/echarts'
import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElIcon,
  ElTable,
  ElTableColumn
} from 'element-plus'
import {
  DataAnalysis,
  Download,
  FullScreen,
  Histogram,
  Refresh,
  TrendCharts
} from '@element-plus/icons-vue'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { getFilmMonthlyStatistics, type DicomPeerStatistics } from '@/api/filmStatistics'

defineOptions({
  name: 'FilmMonthlyUsage'
})

type ViewMode = 'chart' | 'table'
type ChartType = 'line' | 'bar'

const formatNumber = (value: unknown) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value ?? '')
  return num.toLocaleString('en-US')
}

const query = reactive({
  monthRange: ['2025-12-05', '2026-03-05'] as string[]
})

const state = reactive({
  mode: 'chart' as ViewMode,
  chartType: 'bar' as ChartType,
  initialType: 'bar' as ChartType,
  queried: false
})

const categories = ref<string[]>([])
const filmSizes = ref<string[]>([])
const series = ref<Array<{ name: string; data: number[] }>>([])

const tableRows = computed(() => {
  if (!state.queried) return []
  return categories.value.map((month, monthIndex) => {
    const row: Record<string, any> = { month }
    let total = 0
    filmSizes.value.forEach((size, sizeIndex) => {
      const val = Number(series.value[sizeIndex]?.data?.[monthIndex] ?? 0)
      row[size] = val
      total += val
    })
    row.usageTotal = total
    return row
  })
})

const chartRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const setChartRef = (el: Element | ComponentPublicInstance | null) => {
  chartRef.value = el instanceof HTMLElement ? el : null
}

const setPanelRef = (el: Element | ComponentPublicInstance | null) => {
  panelRef.value = el instanceof HTMLElement ? el : null
}

const fetchMonthlyUsage = async () => {
  const [startDate, endDate] = query.monthRange
  const request = await getFilmMonthlyStatistics({
    startDate,
    endDate,
    printState: null,
    dicomPeers: []
  })

  const peers: DicomPeerStatistics[] = request.dicomPeerStatistics || []
  categories.value = peers.map((p) => p.peerDes)

  const sizes: string[] = []
  const sizeSet = new Set<string>()
  peers.forEach((peer) => {
    ;(peer.data ?? []).forEach((item) => {
      const size = item.filmSize
      if (size && !sizeSet.has(size)) {
        sizeSet.add(size)
        sizes.push(size)
      }
    })
  })
  filmSizes.value = sizes

  series.value = sizes.map((size) => {
    return {
      name: size,
      data: peers.map((peer) => {
        const bySize = new Map((peer.data ?? []).map((item) => [item.filmSize, item] as const))
        return Number(bySize.get(size)?.printCount ?? 0)
      })
    }
  })
}

const getOption = (): EChartsOption => {
  const hasData = state.queried
  const xData = hasData ? categories.value : []
  const chartSeries = hasData ? series.value : []

  return {
    grid: {
      top: 30,
      left: 36,
      right: 36,
      bottom: 28,
      containLabel: true
    },
    legend: { top: 0, icon: 'roundRect' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const list = Array.isArray(params) ? params : [params]
        const axisLabel = list[0]?.axisValueLabel ?? list[0]?.name ?? ''
        const lines = list.map((p: any) => `${p.marker}${p.seriesName}: ${formatNumber(p.value)}`)
        return [axisLabel, ...lines].join('<br/>')
      }
    },
    xAxis: {
      type: 'category',
      name: '月份',
      nameLocation: 'end',
      data: xData,
      boundaryGap: state.chartType === 'bar'
    },
    yAxis: {
      type: 'value',
      name: '使用量'
    },
    series: chartSeries.map((s) => ({
      name: s.name,
      type: state.chartType,
      data: s.data
    }))
  }
}

const renderChart = () => {
  if (!chartRef.value) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  chartInstance.setOption(getOption(), true)
}

const onResize = () => {
  chartInstance?.resize()
}

const onSearch = async () => {
  state.queried = true
  state.mode = 'chart'
  await fetchMonthlyUsage()
  await nextTick(() => renderChart())
}

const onDataView = () => {
  state.mode = 'table'
}

const closeTableView = () => {
  state.mode = 'chart'
  nextTick(() => renderChart())
}

const onLine = () => {
  state.mode = 'chart'
  state.chartType = 'line'
  nextTick(() => renderChart())
}

const onBar = () => {
  state.mode = 'chart'
  state.chartType = 'bar'
  nextTick(() => renderChart())
}

const onRestore = () => {
  state.mode = 'chart'
  state.chartType = state.initialType
  state.queried = false
  nextTick(() => renderChart())
}

const downloadByUrl = (url: string, fileName: string) => {
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
}

const exportCsv = () => {
  const header = ['月份', ...filmSizes.value, '使用总量']
  const rows = tableRows.value.map((item) => {
    const values = filmSizes.value.map((size) => String((item as any)[size] ?? 0))
    return [String((item as any).month ?? ''), ...values, String((item as any).usageTotal ?? 0)]
  })

  const csv = [header, ...rows].map((line) => line.join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  downloadByUrl(url, '胶片月用量数据.csv')
  URL.revokeObjectURL(url)
}

const onSave = () => {
  if (state.mode === 'table') {
    exportCsv()
    return
  }
  if (!chartInstance) return
  const url = chartInstance.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  })
  downloadByUrl(url, 'film-monthly-usage-chart.png')
}

const onFullscreen = async () => {
  if (!panelRef.value) return
  if (document.fullscreenElement === panelRef.value) {
    await document.exitFullscreen()
  } else {
    await panelRef.value.requestFullscreen()
  }
  setTimeout(() => onResize(), 120)
}

onMounted(() => {
  nextTick(() => {
    renderChart()
    window.addEventListener('resize', onResize)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<template>
  <ElCard shadow="never" class="stats-panel" :ref="(el) => setPanelRef(el)">
    <div class="panel-head">
      <div class="panel-title">胶片月用量 /<span class="panel-sub"> 胶片尺寸</span></div>
      <ElForm inline>
        <ElFormItem>
          <ElDatePicker
            v-model="query.monthRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            unlink-panels
            style="width: 220px"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="onSearch">查询</ElButton>
        </ElFormItem>
      </ElForm>
    </div>

    <div class="panel-body">
      <div class="panel-main">
        <div
          v-show="state.mode === 'chart'"
          class="chart-area"
          :ref="(el) => setChartRef(el)"
        ></div>
        <div v-show="state.mode === 'table'" class="table-view">
          <ElTable :data="tableRows" height="100%" empty-text="暂无数据" border>
            <ElTableColumn prop="month" label="月份" min-width="120" />
            <ElTableColumn label="使用量">
              <ElTableColumn
                v-for="size in filmSizes"
                :key="size"
                :prop="size"
                :label="size"
                min-width="120"
              />
            </ElTableColumn>
            <ElTableColumn prop="usageTotal" label="使用总量" min-width="120" />
          </ElTable>
          <div class="table-actions">
            <ElButton plain type="primary" @click="exportCsv">导出</ElButton>
            <ElButton type="danger" plain @click="closeTableView">关闭</ElButton>
          </div>
        </div>
      </div>

      <div class="toolbox">
        <div class="tool-btn" :class="{ 'is-active': state.mode === 'table' }" @click="onDataView">
          <ElIcon :size="18"><DataAnalysis /></ElIcon>
          <span>数据视图</span>
        </div>
        <div
          class="tool-btn"
          :class="{ 'is-active': state.mode === 'chart' && state.chartType === 'line' }"
          @click="onLine"
        >
          <ElIcon :size="18"><TrendCharts /></ElIcon>
          <span>折线图</span>
        </div>
        <div
          class="tool-btn"
          :class="{ 'is-active': state.mode === 'chart' && state.chartType === 'bar' }"
          @click="onBar"
        >
          <ElIcon :size="18"><Histogram /></ElIcon>
          <span>柱状图</span>
        </div>
        <div class="tool-btn" @click="onRestore">
          <ElIcon :size="18"><Refresh /></ElIcon>
          <span>还原</span>
        </div>
        <div class="tool-btn" @click="onSave">
          <ElIcon :size="18"><Download /></ElIcon>
          <span>下载</span>
        </div>
        <div class="tool-btn" @click="onFullscreen">
          <ElIcon :size="18"><FullScreen /></ElIcon>
          <span>全屏</span>
        </div>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.stats-panel {
  min-height: 360px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
}

.panel-title {
  font-size: 16px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.panel-sub {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.panel-head :deep(.el-form-item) {
  margin-bottom: 0;
}

.panel-body {
  display: flex;
  height: 300px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.panel-main {
  flex: 1;
  min-width: 0;
}

.chart-area {
  width: 100%;
  height: 100%;
}

.toolbox {
  display: flex;
  width: 54px;
  border-left: 1px solid var(--el-border-color-lighter);
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.tool-btn {
  display: flex;
  width: 100%;
  min-height: 28px;
  padding: 2px;
  color: #333;
  cursor: pointer;
  background: transparent;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.tool-btn span {
  max-height: 0;
  font-size: 11px;
  line-height: 14px;
  white-space: nowrap;
  opacity: 0;
  transition: all var(--el-transition-duration) var(--el-transition-function-ease-in-out-bezier);
}

.tool-btn:hover,
.tool-btn.is-active {
  color: var(--el-color-primary);

  span {
    max-height: 14px;
    opacity: 1;
  }
}

.table-view {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.table-view :deep(.el-table) {
  flex: 1;
}

.table-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
}

.stats-panel:fullscreen {
  background: var(--el-bg-color);
}
</style>
