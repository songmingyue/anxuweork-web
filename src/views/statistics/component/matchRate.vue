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
  getDicomPeerDropDown,
  getMatchRateStatistics,
  MatchRateStatistics,
  type OptionList
} from '@/api/filmStatistics'
import * as XLSX from 'xlsx'

defineOptions({
  name: 'MatchRate'
})

type ViewMode = 'chart' | 'table'
type ChartType = 'line' | 'bar'

type MatchRateTableRow = {
  device: string
  filmTotal: number
  matchRate: number
  filmSize: string
  autoMatch: number
  matchFail: number
}

const formatNumber = (value: unknown) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value ?? '')
  return num.toLocaleString('en-US')
}

const formatRate = (value: unknown) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value ?? '')
  return String(Number(num.toFixed(3)))
}

const startTime = new Date(new Date().valueOf() - 90 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0]
const endTime = new Date().toISOString().split('T')[0]

const query = reactive({
  dicomPeers: [] as string[],
  matchRange: [startTime, endTime] as string[]
})

const state = reactive({
  mode: 'chart' as ViewMode,
  chartType: 'bar' as ChartType,
  initialType: 'bar' as ChartType,
  queried: false
})

const dicomPeerOptions = ref<OptionList[]>([])
const dicomPeerLoading = ref(false)

const dicomPeerTextMap = computed(() => {
  const map = new Map<string, string>()
  dicomPeerOptions.value.forEach((item) => {
    if (!item?.value) return
    map.set(item.value, item.text || item.value)
  })
  return map
})

const getPeerText = (peerKey: unknown) => {
  const key = String(peerKey ?? '')
  return dicomPeerTextMap.value.get(key) ?? key
}

const devices = ref<string[]>([])
const autoMatchCounts = ref<number[]>([])
const matchRates = ref<number[]>([])

const matchFailCounts = ref<number[]>([])

const rawTableRows = ref<MatchRateTableRow[]>([])
const tableRows = computed(() => {
  if (!state.queried) return []
  return rawTableRows.value
})

const tableSpanMethod = ({ column, rowIndex }: { column: any; rowIndex: number }) => {
  const prop = String(column?.property ?? '')
  if (prop !== 'device' && prop !== 'filmTotal' && prop !== 'matchRate') return [1, 1]

  const rows = tableRows.value
  const device = rows[rowIndex]?.device
  if (!device) return [1, 1]

  if (rowIndex > 0 && rows[rowIndex - 1]?.device === device) {
    return [0, 0]
  }

  let rowspan = 1
  for (let i = rowIndex + 1; i < rows.length; i++) {
    if (rows[i]?.device !== device) break
    rowspan++
  }

  return [rowspan, 1]
}

const chartRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const setChartRef = (el: Element | ComponentPublicInstance | null) => {
  chartRef.value = el instanceof HTMLElement ? el : null
}

const setPanelRef = (el: Element | ComponentPublicInstance | null) => {
  panelRef.value = el instanceof HTMLElement ? el : null
}

const ensurePeerOptions = async () => {
  if (dicomPeerOptions.value.length === 0) {
    dicomPeerLoading.value = true
    try {
      const res = await getDicomPeerDropDown()
      dicomPeerOptions.value = res?.dicomPeers ?? []
    } finally {
      dicomPeerLoading.value = false
    }
  }

  if (!query.dicomPeers?.length) {
    query.dicomPeers = dicomPeerOptions.value.map((item) => item.value)
  }
}

const getdicomPeers = async () => {
  query.dicomPeers = []
  await ensurePeerOptions()
  query.dicomPeers = dicomPeerOptions.value.map((item) => item.value)
  await onSearch()
}

const fetchMatchRate = async () => {
  await ensurePeerOptions()
  if (!query.matchRange?.length) {
    ElMessage.warning('请选择日期范围')
    return
  }
  const [startDate, endDate] = query.matchRange
  const dicomPeers = query.dicomPeers ?? []
  const request = await getMatchRateStatistics({
    startDate: startDate ? `${startDate} 00:00:00` : '',
    endDate: endDate ? `${endDate} 23:59:59` : '',
    printState: null,
    dicomPeers
  })

  const peers: MatchRateStatistics[] = request.matchRateStatistics || []
  const nextDevices: string[] = []
  const nextAutoMatch: number[] = [] // 自动匹配总数
  const matchRate: number[] = [] // 匹配率
  const totalCatch: number[] = [] // 失败总数

  const nextTableRows: MatchRateTableRow[] = []
  peers.forEach((peer) => {
    const items = peer.data ?? []
    nextDevices.push(peer.peerDes ?? '')
    const autoMatchTotal = items.reduce((sum, item) => sum + Number(item.autoMatch ?? 0), 0) // 自动匹配总数
    nextAutoMatch.push(autoMatchTotal) // 自动匹配总数list
    matchRate.push(peer.matchRate ?? 0)
    const matchFailTotal = items.reduce((sum, item) => sum + Number(item.manualMatch ?? 0), 0)
    totalCatch.push(matchFailTotal)

    if (!items.length) {
      nextTableRows.push({
        device: peer.peerDes ?? '',
        filmTotal: peer.totalCount ?? 0,
        matchRate: peer.matchRate ?? 0,
        filmSize: '',
        autoMatch: 0,
        matchFail: 0
      })
      return
    }

    items.forEach((item) => {
      nextTableRows.push({
        device: peer.peerDes ?? '',
        filmTotal: peer.totalCount ?? 0,
        matchRate: peer.matchRate ?? 0,
        filmSize: item.filmSize ?? '',
        autoMatch: Number(item.autoMatch ?? 0),
        matchFail: Number(item.manualMatch ?? 0)
      })
    })
  })

  devices.value = nextDevices
  autoMatchCounts.value = nextAutoMatch // 自动匹配总数
  matchRates.value = matchRate // 匹配率
  matchFailCounts.value = totalCatch // 失败总数（图表）
  rawTableRows.value = nextTableRows
}

const getOption = (): EChartsOption => {
  const hasData = state.queried
  const xData = hasData ? devices.value : []
  const barData = hasData ? autoMatchCounts.value : []
  const rateData = hasData ? matchRates.value : []
  const catchData = hasData ? matchFailCounts.value : []

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
        const axisValue = list[0]?.axisValue ?? list[0]?.name ?? ''
        const axisLabel = getPeerText(axisValue)
        const lines = list.map((p: any) => {
          if (p.seriesName === '匹配率') {
            return `${p.marker}${p.seriesName}: ${formatRate(p.value)}`
          }
          return `${p.marker}${p.seriesName}: ${formatNumber(p.value)}`
        })
        return [axisLabel, ...lines].join('<br/>')
      }
    },
    xAxis: {
      type: 'category',
      name: '设备',
      nameLocation: 'end',
      data: xData,
      axisLabel: {
        formatter: (value: string) => getPeerText(value)
      },
      boundaryGap: state.chartType === 'bar'
    },
    yAxis: [
      {
        type: 'value',
        name: '使用量'
      },
      // {
      //   type: 'value',
      //   name: '匹配失败'
      // },

      {
        type: 'value',
        name: '匹配率',
        min: 0,
        max: 1
      }
    ],
    series: [
      {
        name: '自动匹配',
        type: state.chartType,
        data: barData,
        yAxisIndex: 0
      },
      {
        name: '匹配失败',
        type: state.chartType,
        data: catchData,
        yAxisIndex: 0
      },
      {
        name: '匹配率',
        type: state.chartType,
        data: rateData,
        yAxisIndex: 1
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
  await fetchMatchRate()
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
  state.chartType = 'bar'
  // state.queried = false
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

  const startDate = String(query.matchRange?.[0] ?? '').trim()
  const fileName = `匹配率数据-${startDate || '导出'}.xlsx`

  const header = ['设备', '胶片总数', '匹配率', '胶片尺寸', '自动匹配', '匹配失败']
  const rows = tableRows.value

  const data: Array<(string | number)[]> = []
  const merges: XLSX.Range[] = []

  let startIndex = 0
  while (startIndex < rows.length) {
    const device = rows[startIndex]?.device
    let endIndex = startIndex
    while (endIndex + 1 < rows.length && rows[endIndex + 1]?.device === device) {
      endIndex += 1
    }

    for (let i = startIndex; i <= endIndex; i += 1) {
      const item = rows[i]
      if (!item) continue
      const isFirst = i === startIndex
      data.push([
        isFirst ? item.device : '',
        isFirst ? Number(item.filmTotal ?? 0) : '',
        isFirst ? Number(Number(item.matchRate ?? 0).toFixed(3)) : '',
        String(item.filmSize ?? ''),
        Number(item.autoMatch ?? 0),
        Number(item.matchFail ?? 0)
      ])
    }

    if (endIndex > startIndex) {
      // 第 0 行是表头，数据从第 1 行开始
      const startRow = startIndex + 1
      const endRow = endIndex + 1
      merges.push({ s: { r: startRow, c: 0 }, e: { r: endRow, c: 0 } })
      merges.push({ s: { r: startRow, c: 1 }, e: { r: endRow, c: 1 } })
      merges.push({ s: { r: startRow, c: 2 }, e: { r: endRow, c: 2 } })
    }

    startIndex = endIndex + 1
  }

  const sheet = XLSX.utils.aoa_to_sheet([header, ...data])
  if (merges.length > 0) sheet['!merges'] = merges

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
  downloadByUrl(url, 'match-rate-chart.png')
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
  onSearch()
  getdicomPeers()
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
      <div class="panel-title">匹配率</div>
      <ElForm inline size="small">
        <ElFormItem>
          <ElDatePicker
            v-model="query.matchRange"
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
          <ElTable
            :data="tableRows"
            :span-method="tableSpanMethod"
            height="100%"
            empty-text="暂无数据"
            border
          >
            <ElTableColumn prop="device" label="设备" min-width="120" align="center" />
            <ElTableColumn prop="filmTotal" label="胶片总数" min-width="120" align="center" />
            <ElTableColumn prop="matchRate" label="匹配率" min-width="120" align="center" />
            <ElTableColumn prop="filmSize" label="胶片尺寸" min-width="120" align="center" />
            <ElTableColumn prop="autoMatch" label="自动匹配" min-width="120" align="center" />
            <ElTableColumn prop="matchFail" label="匹配失败" min-width="120" align="center" />
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
