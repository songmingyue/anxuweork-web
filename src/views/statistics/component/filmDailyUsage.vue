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
  ElMessage,
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
  type FilDayData,
  type OptionList
} from '@/api/filmStatistics'
import * as XLSX from 'xlsx'

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

const now = new Date().toISOString().split('T')[0]
const lastWork = new Date(new Date().valueOf() - 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0]

const query = reactive({
  examType: [] as string[],
  dateRange: [lastWork, now] as string[]
})

const state = reactive({
  mode: 'chart' as ViewMode,
  chartType: 'bar' as ChartType,
  initialType: 'bar' as ChartType,
  queried: false
})

const categories = ref<string[]>([])
type SeriesItem = { key: string; name: string; data: number[] }
const series = ref<SeriesItem[]>([])

const tableRows = computed(() => {
  if (!state.queried) return []
  return categories.value.map((date, dateIndex) => {
    const row: Record<string, any> = { date }
    let total = 0
    series.value.forEach((s) => {
      const val = Number(s.data?.[dateIndex] ?? 0)
      row[s.key] = val
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

const fetchDailyUsage = async () => {
  if (!query.dateRange?.length) return ElMessage.warning('请选择日期范围')
  if (!query.dateRange || query.dateRange.length !== 2) {
    ElMessage.warning('请选择正确的日期范围')
    return
  }
  const [startDate, endDate] = query.dateRange
  const request = await getExamTypePrintStatistic({
    startDate: startDate + ' 00:00:00',
    endDate: endDate + ' 23:59:59',
    examType: query.examType
  })

  const days: FilDayData[] = request.data ?? []
  if (!days.length) {
    categories.value = []
    series.value = []
    return
  }

  categories.value = days.map((d) => String(d.date ?? ''))

  const typeKeys: string[] = []
  const typeSet = new Set<string>()
  days.forEach((d) => {
    ;(d.details ?? []).forEach((item) => {
      const key = String(item?.examType ?? '')
      if (key && !typeSet.has(key)) {
        typeSet.add(key)
        typeKeys.push(key)
      }
    })
  })

  const labelMap = new Map(
    (examTypeOptions.value ?? []).map((o) => [String(o.value ?? ''), String(o.text ?? '')] as const)
  )
  const dayTypeMaps = days.map(
    (d) => new Map((d.details ?? []).map((item) => [String(item.examType ?? ''), item] as const))
  )

  series.value = typeKeys.map((key) => ({
    key,
    name: labelMap.get(key) || key,
    data: dayTypeMaps.map((map) => Number(map.get(key)?.printCount ?? 0))
  }))
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
  await ensureExamTypeOptions()
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

const exportExcel = () => {
  if (!tableRows.value.length) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  const startDate = String(query.dateRange?.[0] ?? '').trim()
  const endDate = String(query.dateRange?.[1] ?? '').trim()
  const fileName = `胶片日用量数据-${startDate || '开始'}-${endDate || '结束'}.xlsx`

  const typeCount = series.value.length

  // 没有“使用量”子列时，退化为普通表头
  if (typeCount === 0) {
    const header = ['日期', '使用总量']
    const rows = tableRows.value.map((item) => [
      String((item as any).date ?? ''),
      Number((item as any).usageTotal ?? 0)
    ])

    const sheet = XLSX.utils.aoa_to_sheet([header, ...rows])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1')
    XLSX.writeFile(workbook, fileName)
    return
  }

  // 生成两行表头，模拟 ElTable 的分组表头：
  // 第 1 行：日期 | 使用量(合并) | 使用总量
  // 第 2 行：     | 各检查类型列  |
  const headerRow1 = [
    '日期',
    '使用量',
    ...Array.from({ length: typeCount - 1 }, () => ''),
    '使用总量'
  ]
  const headerRow2 = ['', ...series.value.map((s) => s.name), '']

  const rows = tableRows.value.map((item) => {
    const values = series.value.map((s) => Number((item as any)[s.key] ?? 0))
    return [String((item as any).date ?? ''), ...values, Number((item as any).usageTotal ?? 0)]
  })

  const sheet = XLSX.utils.aoa_to_sheet([headerRow1, headerRow2, ...rows])
  const merges: XLSX.Range[] = [
    // “日期” 纵向合并两行
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    // “使用量” 横向合并检查类型列
    { s: { r: 0, c: 1 }, e: { r: 0, c: typeCount } },
    // “使用总量” 纵向合并两行
    { s: { r: 0, c: typeCount + 1 }, e: { r: 1, c: typeCount + 1 } }
  ]
  sheet['!merges'] = merges

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1')
  XLSX.writeFile(workbook, fileName)
}

const onSave = () => {
  if (state.mode === 'table') {
    exportExcel()
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
  onSearch()
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
      <ElForm inline size="small">
        <ElFormItem>
          <ElSelect
            v-model="query.examType"
            placeholder="请选择"
            multiple
            style="width: 180px"
            clearable
            filterable
            :loading="examTypeLoading"
          >
            <ElOption
              v-for="item in examTypeOptions"
              :key="item.text"
              :label="item.text"
              :value="item.text"
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
            <ElTableColumn prop="date" label="日期" align="center" min-width="120" />
            <ElTableColumn label="使用量" align="center">
              <ElTableColumn
                v-for="item in series"
                :key="item.key"
                :prop="item.key"
                :label="item.name"
                min-width="120"
                align="center"
              />
            </ElTableColumn>
            <ElTableColumn prop="usageTotal" label="使用总量" min-width="120" align="center" />
          </ElTable>
          <div class="table-actions">
            <ElButton plain type="primary" @click="exportExcel">导出</ElButton>
            <ElButton type="danger" plain @click="closeTableView">关闭</ElButton>
          </div>
        </div>
      </div>

      <div class="toolbox" v-if="state.mode !== 'table'">
        <div class="tool-btn" @click="onDataView">
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
