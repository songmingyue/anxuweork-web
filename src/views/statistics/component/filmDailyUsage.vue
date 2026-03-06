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
  ElOption,
  ElSelect,
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
import {
  getExamTypeDropdown,
  getExamTypePrintStatistic,
  type DicomPeerStatistics,
  type OptionList
} from '@/api/filmStatistics'

defineOptions({
  name: 'FilmDailyUsage'
})

type ViewMode = 'chart' | 'table'
type ChartType = 'line' | 'bar'

const formatNumber = (value: unknown) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value ?? '')
  return num.toLocaleString('en-US')
}

const examTypeOptions = ref<OptionList[]>([])
const examTypeLoading = ref(false)

const query = reactive({
  examType: '' as string,
  dateRange: ['2026-02-21', '2026-02-28'] as string[]
})

const state = reactive({
  mode: 'chart' as ViewMode,
  chartType: 'bar' as ChartType,
  initialType: 'bar' as ChartType,
  queried: false
})

const categories = ref<string[]>([])
const usage = ref<number[]>([])

const tableRows = computed(() => {
  if (!state.queried) return []
  return categories.value.map((date, index) => ({
    date,
    usage: usage.value[index] ?? 0
  }))
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

const ensureExamTypeOptions = async () => {
  if (examTypeOptions.value.length) return
  examTypeLoading.value = true
  try {
    const res = await getExamTypeDropdown()
    examTypeOptions.value = res?.data ?? []
  } finally {
    examTypeLoading.value = false
  }
}

const isDateLike = (value: string) => /^\d{4}-\d{2}-\d{2}/.test(value)

const fetchDailyUsage = async () => {
  const [startDate, endDate] = query.dateRange
  const request = await getExamTypePrintStatistic({
    startDate,
    endDate,
    printState: null,
    dicomPeers: [],
    examType: query.examType || null
  })

  const peers: DicomPeerStatistics[] = request.dicomPeerStatistics || []
  if (!peers.length) {
    categories.value = []
    usage.value = []
    return
  }

  // 兼容两类返回结构：
  // A) peerDes=日期，data=胶片尺寸明细(累计为当天使用量)
  // B) peerDes=检查类型，data.filmSize=日期(直接取 printCount)
  const peerDesLooksLikeDate = peers.every((p) => isDateLike(String(p.peerDes ?? '')))
  if (peerDesLooksLikeDate) {
    categories.value = peers.map((p) => String(p.peerDes ?? ''))
    usage.value = peers.map((p) => {
      return (p.data ?? []).reduce((sum, item) => sum + Number(item.printCount ?? 0), 0)
    })
    return
  }

  if (
    peers.length === 1 &&
    (peers[0].data ?? []).every((d) => isDateLike(String(d.filmSize ?? '')))
  ) {
    categories.value = (peers[0].data ?? []).map((d) => String(d.filmSize ?? ''))
    usage.value = (peers[0].data ?? []).map((d) => Number(d.printCount ?? 0))
    return
  }

  categories.value = peers.map((p) => String(p.peerDes ?? ''))
  usage.value = peers.map((p) =>
    (p.data ?? []).reduce((sum, item) => sum + Number(item.printCount ?? 0), 0)
  )
}

const getOption = (): EChartsOption => {
  const hasData = state.queried
  const xData = hasData ? categories.value : []
  const yData = hasData ? usage.value : []

  return {
    grid: {
      top: 30,
      left: 36,
      right: 36,
      bottom: 28,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: state.chartType === 'bar' ? 'shadow' : 'line' },
      formatter: (params: any) => {
        const list = Array.isArray(params) ? params : [params]
        const axisLabel = list[0]?.axisValueLabel ?? list[0]?.name ?? ''
        const lines = list.map((p: any) => `${p.marker}${p.seriesName}: ${formatNumber(p.value)}`)
        return [axisLabel, ...lines].join('<br/>')
      }
    },
    xAxis: {
      type: 'category',
      name: '日期',
      nameLocation: 'end',
      data: xData,
      boundaryGap: state.chartType === 'bar'
    },
    yAxis: {
      type: 'value',
      name: '使用量'
    },
    series: [
      {
        name: '使用量',
        type: state.chartType,
        data: yData
      }
    ]
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
  await fetchDailyUsage()
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
  const header = ['日期', '使用量']
  const rows = tableRows.value.map((item) => [
    String((item as any).date ?? ''),
    String((item as any).usage ?? 0)
  ])
  const csv = [header, ...rows].map((line) => line.join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  downloadByUrl(url, '胶片日用量数据.csv')
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
  downloadByUrl(url, 'film-daily-usage-chart.png')
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
  ensureExamTypeOptions()
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
      <div class="panel-title">胶片日用量 /<span class="panel-sub"> 检查类型</span></div>
      <ElForm inline>
        <ElFormItem>
          <ElSelect
            v-model="query.examType"
            placeholder="请选择"
            style="width: 180px"
            clearable
            filterable
            :loading="examTypeLoading"
          >
            <ElOption
              v-for="item in examTypeOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElDatePicker
            v-model="query.dateRange"
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
            <ElTableColumn prop="date" label="日期" min-width="120" />
            <ElTableColumn prop="usage" label="使用量" min-width="120" />
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
