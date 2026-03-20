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
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { getExamPrintMonthlyStatistics } from '@/api/statisticsInfo'
import { Data, getDropDownConfig, getPatientTypeList } from '@/api/common'
import * as XLSX from 'xlsx'
defineOptions({
  name: 'InspectStatistics'
})

const query = reactive({
  patientType: [],
  examType: [],
  dateRange: ['2026-01-01', '2026-02-01'] as string[]
})

const patientTypeOptions = ref<string[]>([])

const examTypeOptions = ref<Data[]>([])

type InspectRow = {
  month: string
  totalExamCount: number
  examType: string
  examCount: number
  personCount: number
  printCount: number
  filmPrintCount: number
  compensateCount: number
}

const tableData = ref<InspectRow[]>([])

const tableSpanMethod = ({ column, rowIndex }: any) => {
  const prop = column?.property
  if (prop !== 'month' && prop !== 'totalExamCount') {
    return
  }
  const rows = tableData.value
  const current = rows[rowIndex]
  if (!current) return

  const month = current.month
  const prev = rows[rowIndex - 1]
  if (prev?.month === month) {
    return [0, 0]
  }

  let rowspan = 1
  for (let i = rowIndex + 1; i < rows.length; i += 1) {
    if (rows[i]?.month !== month) break
    rowspan += 1
  }
  return [rowspan, 1]
}

type ViewMode = 'chart' | 'table'
type ChartType = 'line' | 'bar'

const bottomState = reactive({
  mode: 'chart' as ViewMode,
  chartType: 'line' as ChartType,
  initialType: 'line' as ChartType,
  queried: false
})

const chartWrapRef = ref<HTMLElement | null>(null)
let chartRef: Nullable<echarts.ECharts> = null

const chartData = {
  categories: [] as string[],
  total: [] as number[],
  print: [] as number[],
  film: [] as number[],
  supplement: [] as number[]
}

const getChartOption = (): EChartsOption => {
  const isBar = bottomState.chartType === 'bar'
  const categories = bottomState.queried ? chartData.categories : []
  const total = bottomState.queried ? chartData.total : []
  const print = bottomState.queried ? chartData.print : []
  const film = bottomState.queried ? chartData.film : []
  const supplement = bottomState.queried ? chartData.supplement : []

  return {
    grid: {
      top: 38,
      left: 36,
      right: 24,
      bottom: 28,
      containLabel: true
    },
    legend: {
      top: 0,
      icon: 'roundRect',
      data: ['总检查数', '检查打印量', '胶片打印量', '补费量']
    },
    xAxis: {
      type: 'category',
      name: '月份',
      nameLocation: 'end',
      data: categories,
      boundaryGap: isBar
    },
    yAxis: {
      type: 'value',
      name: '使用量'
    },
    series: [
      { name: '总检查数', type: bottomState.chartType, data: total },
      { name: '检查打印量', type: bottomState.chartType, data: print },
      { name: '胶片打印量', type: bottomState.chartType, data: film },
      { name: '补费量', type: bottomState.chartType, data: supplement }
    ]
  }
}

const renderChart = () => {
  if (!chartWrapRef.value) {
    return
  }
  if (!chartRef) {
    chartRef = echarts.init(chartWrapRef.value)
  }
  chartRef.setOption(getChartOption(), true)
}

const resizeChart = () => {
  chartRef?.resize()
}

const getBottomTableRows = () => {
  if (!bottomState.queried) {
    return []
  }
  return chartData.categories.map((month, index) => ({
    month,
    totalExamCount: chartData.total[index],
    printCount: chartData.print[index],
    filmPrintCount: chartData.film[index],
    compensateCount: chartData.supplement[index]
  }))
}

const onSearch = async () => {
  const [startDate, endDate] = query.dateRange ?? []
  if (!startDate || !endDate) {
    ElMessage.warning('请选择日期范围')
    return
  }
  const result = await getExamPrintMonthlyStatistics({
    examType: query.examType,
    patientType: query.patientType,
    startDate: startDate ? startDate + ' 00:00:00' : '',
    endDate: endDate ? endDate + ' 23:59:59' : ''
  })

  const list = (result?.examPrintResult ?? [])
    .slice()
    .sort((a, b) => String(a.month ?? '').localeCompare(String(b.month ?? '')))

  chartData.categories = list.map((item) => String(item.month ?? ''))
  chartData.total = list.map((item) => Number(item.examTotal ?? 0))
  chartData.print = list.map((item) =>
    (item.examPrintDetail ?? []).reduce((sum, d) => sum + Number(d.examPrinted ?? 0), 0)
  )
  chartData.film = list.map((item) =>
    (item.examPrintDetail ?? []).reduce((sum, d) => sum + Number(d.filmPrinted ?? 0), 0)
  )
  chartData.supplement = list.map((item) =>
    (item.examPrintDetail ?? []).reduce((sum, d) => sum + Number(d.filmPaid ?? 0), 0)
  )

  const rows: InspectRow[] = []
  list.forEach((item) => {
    ;(item.examPrintDetail ?? []).forEach((d) => {
      rows.push({
        month: String(item.month ?? ''),
        totalExamCount: Number(item.examTotal ?? 0),
        examType: String(d.examType ?? ''),
        examCount: Number(d.examTypeTotal ?? 0),
        personCount: Number(d.examPatientTotal ?? 0),
        printCount: Number(d.examPrinted ?? 0),
        filmPrintCount: Number(d.filmPrinted ?? 0),
        compensateCount: Number(d.filmPaid ?? 0)
      })
    })
  })
  tableData.value = rows.sort(
    (a, b) => a.month.localeCompare(b.month) || a.examType.localeCompare(b.examType)
  )

  bottomState.queried = true
  bottomState.mode = 'chart'
  await nextTick(() => renderChart())
}

const onExport = () => {
  if (!tableData.value.length) return ElMessage.warning('暂无数据可导出')
  const header = [
    '月份',
    '总检查数',
    '检查类型',
    '检查数',
    '检查人数',
    '检查打印数',
    '胶片打印张数',
    '补费次数'
  ]
  const data = tableData.value.map((item) => [
    item.month,
    item.totalExamCount,
    item.examType,
    item.examCount,
    item.personCount,
    item.printCount,
    item.filmPrintCount,
    item.compensateCount
  ])

  const sheet = XLSX.utils.aoa_to_sheet([header, ...data])

  const merges: XLSX.Range[] = []
  const rows = tableData.value
  let startIndex = 0
  while (startIndex < rows.length) {
    const month = rows[startIndex]?.month
    let endIndex = startIndex
    while (endIndex + 1 < rows.length && rows[endIndex + 1]?.month === month) {
      endIndex += 1
    }
    if (endIndex > startIndex) {
      const startRow = startIndex + 1
      const endRow = endIndex + 1
      merges.push({ s: { r: startRow, c: 0 }, e: { r: endRow, c: 0 } })
      merges.push({ s: { r: startRow, c: 1 }, e: { r: endRow, c: 1 } })
    }
    startIndex = endIndex + 1
  }
  if (merges.length > 0) {
    sheet['!merges'] = merges
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1')

  XLSX.writeFile(workbook, `请求设备用量-${query.dateRange[0]}.xlsx`)
}

const onDataView = () => {
  bottomState.mode = 'table'
}

const onLine = () => {
  bottomState.mode = 'chart'
  bottomState.chartType = 'line'
  nextTick(() => renderChart())
}

const onBar = () => {
  bottomState.mode = 'chart'
  bottomState.chartType = 'bar'
  nextTick(() => renderChart())
}

const onRestore = () => {
  bottomState.mode = 'chart'
  bottomState.chartType = bottomState.initialType
  bottomState.queried = false
  nextTick(() => renderChart())
}

const downloadByUrl = (url: string, fileName: string) => {
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
}

const onSaveImage = () => {
  if (bottomState.mode === 'table') {
    const header = ['月份', '总检查数', '检查打印量', '胶片打印量', '补费量']
    const rows = getBottomTableRows().map((item) => [
      item.month,
      String(item.totalExamCount),
      String(item.printCount),
      String(item.filmPrintCount),
      String(item.compensateCount)
    ])
    const csv = [header, ...rows].map((line) => line.join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    downloadByUrl(url, '检查打印量数据.csv')
    URL.revokeObjectURL(url)
    return
  }
  if (!chartRef) {
    return
  }
  const url = chartRef.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  })
  downloadByUrl(url, 'inspect-statistics-chart.png')
}

const setBottomPanelRef = (el: Element | ComponentPublicInstance | null) => {
  chartWrapRef.value = el instanceof HTMLElement ? el : null
}

const bottomPanelRef = ref<HTMLElement | null>(null)

const setBottomContainerRef = (el: Element | ComponentPublicInstance | null) => {
  bottomPanelRef.value = el instanceof HTMLElement ? el : null
}

const onFullscreen = async () => {
  if (!bottomPanelRef.value) {
    return
  }
  if (document.fullscreenElement === bottomPanelRef.value) {
    await document.exitFullscreen()
  } else {
    await bottomPanelRef.value.requestFullscreen()
  }
  setTimeout(() => resizeChart(), 120)
}

const closeDataView = () => {
  bottomState.mode = 'chart'
  nextTick(() => renderChart())
}

const getOption = async () => {
  const { data, status } = await getDropDownConfig()
  if (status === 0) {
    examTypeOptions.value = data
  }
  const { data: data1, status: status1 } = await getPatientTypeList()
  if (status1 === 0) {
    patientTypeOptions.value = data1
  }
}

onMounted(() => {
  getOption()
  nextTick(() => {
    renderChart()
    window.addEventListener('resize', resizeChart)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartRef?.dispose()
  chartRef = null
})
</script>

<template>
  <div class="inspect-page">
    <ElCard shadow="never" class="section section--top card-table">
      <div class="section-head">
        <div class="section-title">检查打印量</div>
        <ElForm inline>
          <ElFormItem style="margin-right: 10px">
            <ElSelect
              v-model="query.patientType"
              placeholder="请选择患者类型"
              multiple
              collapse-tags
              clearable
              style="width: 190px"
            >
              <ElOption
                v-for="item in patientTypeOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem style="margin-right: 10px">
            <ElSelect
              v-model="query.examType"
              placeholder="请选择检查类型"
              collapse-tags
              multiple
              clearable
              style="width: 180px"
            >
              <ElOption
                v-for="item in examTypeOptions"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem style="margin-right: 10px">
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
          <ElFormItem style="margin-right: 10px">
            <ElButton type="primary" @click="onSearch" plain>查询</ElButton>
          </ElFormItem>
          <ElFormItem style="margin-right: 10px">
            <ElButton type="danger" @click="onExport" plain>导出Excel</ElButton>
          </ElFormItem>
        </ElForm>
      </div>

      <ElTable
        :data="tableData"
        empty-text="暂无数据"
        :span-method="tableSpanMethod"
        :header-cell-style="{
          backgroundColor: '#f5f7fa',
          color: '#999',
          fontWeight: 700,
          textAlign: 'center'
        }"
        border
      >
        <ElTableColumn prop="month" label="月份" min-width="120" align="center" />
        <ElTableColumn prop="totalExamCount" label="总检查数" min-width="120" align="center" />
        <ElTableColumn prop="examType" label="检查类型" min-width="120" align="center" />
        <ElTableColumn prop="examCount" label="检查数" min-width="120" align="center" />
        <ElTableColumn prop="personCount" label="检查人数" min-width="120" align="center" />
        <ElTableColumn prop="printCount" label="检查打印数" min-width="120" align="center" />
        <ElTableColumn prop="filmPrintCount" label="胶片打印张数" min-width="120" align="center" />
        <ElTableColumn prop="compensateCount" label="补费次数" min-width="120" align="center" />
      </ElTable>
    </ElCard>

    <ElCard
      shadow="never"
      class="section section--bottom card-table"
      :ref="(el) => setBottomContainerRef(el)"
    >
      <div class="chart-wrap">
        <div
          v-show="bottomState.mode === 'chart'"
          class="chart-canvas"
          :ref="(el) => setBottomPanelRef(el)"
        ></div>
        <div v-show="bottomState.mode === 'table'" class="table-view table-view--bottom">
          <ElTable
            :data="tableData"
            height="100%"
            size="small"
            border
            empty-text="暂无数据"
            :span-method="tableSpanMethod"
            :header-cell-style="{
              backgroundColor: '#f5f7fa',
              color: '#999',
              fontWeight: 700,
              textAlign: 'center'
            }"
          >
            <ElTableColumn prop="month" label="月份" min-width="120" align="center" />
            <ElTableColumn prop="totalExamCount" label="总检查数" min-width="120" align="center" />
            <ElTableColumn prop="printCount" label="检查打印量" min-width="120" align="center" />
            <ElTableColumn
              prop="filmPrintCount"
              label="胶片打印量"
              min-width="120"
              align="center"
            />
            <ElTableColumn prop="compensateCount" label="补费量" min-width="120" align="center" />
          </ElTable>
          <div class="table-actions">
            <ElButton type="danger" plain @click="closeDataView">关闭</ElButton>
            <ElButton type="primary" plain @click="onExport">导出</ElButton>
          </div>
        </div>
      </div>

      <div class="toolbox">
        <button
          class="tool-btn"
          :class="{ 'is-active': bottomState.mode === 'table' }"
          @click="onDataView"
        >
          <ElIcon :size="18"><DataAnalysis /></ElIcon>
          <span>数据视图</span>
        </button>
        <button
          class="tool-btn"
          :class="{ 'is-active': bottomState.mode === 'chart' && bottomState.chartType === 'line' }"
          @click="onLine"
        >
          <ElIcon :size="18"><TrendCharts /></ElIcon>
          <span>折线图</span>
        </button>
        <button
          class="tool-btn"
          :class="{ 'is-active': bottomState.mode === 'chart' && bottomState.chartType === 'bar' }"
          @click="onBar"
        >
          <ElIcon :size="18"><Histogram /></ElIcon>
          <span>柱状图</span>
        </button>
        <button class="tool-btn" @click="onRestore">
          <ElIcon :size="18"><Refresh /></ElIcon>
          <span>还原</span>
        </button>
        <button class="tool-btn" @click="onSaveImage">
          <ElIcon :size="18"><Download /></ElIcon>
          <span>保存为图片</span>
        </button>
        <button class="tool-btn" @click="onFullscreen">
          <ElIcon :size="18"><FullScreen /></ElIcon>
          <span>全屏显示</span>
        </button>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.inspect-page {
  display: flex;
  height: calc(100vh - 70px);
  min-height: 640px;
  flex-direction: column;
  gap: 8px;
}

.section {
  flex: 1;
}

.section :deep(.el-card__body) {
  height: 100%;
}

.section--top {
  min-height: 300px;
}

.section--top :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
}

.section-head {
  display: flex;
  min-height: 44px;
  margin-bottom: 8px;
  align-items: center;
  justify-content: space-between;
  margin-left: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.section-head :deep(.el-form-item) {
  margin-bottom: 0;
}

.section--bottom {
  min-height: 300px;
}

.section--bottom :deep(.el-card__body) {
  display: flex;
  height: 100%;
  padding: 0;
}

.chart-wrap {
  height: 100%;
  min-width: 0;
  padding: 8px;
  flex: 1;
}

.chart-canvas {
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
  border: none;
  transition: all var(--el-transition-duration) var(--el-transition-function-ease-in-out-bezier);
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.tool-btn span {
  max-height: 0;
  overflow: hidden;
  font-size: 11px;
  line-height: 14px;
  opacity: 0;
  transition: all var(--el-transition-duration) var(--el-transition-function-ease-in-out-bezier);
}

.tool-btn:hover {
  min-height: 42px;
  color: var(--el-color-primary);
}

.tool-btn.is-active {
  min-height: 42px;
  color: var(--el-color-primary);
}

.tool-btn:hover span {
  max-height: 28px;
  opacity: 1;
}

.tool-btn.is-active span {
  max-height: 28px;
  opacity: 1;
}

.table-view--bottom {
  height: calc(100% - 39px);
}

.table-actions {
  margin-top: 8px;
}

.section--bottom:fullscreen {
  background: var(--el-bg-color);
}
</style>
