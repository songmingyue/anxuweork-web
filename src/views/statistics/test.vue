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
  DicomPeerStatistics,
  getDicomPeerDropDown,
  getDicomPeerStatistics,
  getPrinterDropDown,
  getPrinterStatistics,
  type OptionList
} from '@/api/filmStatistics'

defineOptions({
  name: 'StatisticsInfo'
})

type PanelId = 'device' | 'match' | 'filmSize' | 'examType'
type ChartType = 'line' | 'bar'
type ViewMode = 'chart' | 'table'

interface PanelState {
  mode: ViewMode
  chartType: ChartType
  initialType: ChartType
  queried: boolean
}

interface TableColumnItem {
  prop: string
  label: string
  children?: TableColumnItem[]
}

const formatNumber = (value: unknown) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value ?? '')
  return num.toLocaleString('en-US')
}

const acceptDeviceOptions = [
  { label: '请求设备接收量', value: '1' },
  { label: '请求设备打印量', value: '2' },
  { label: '打印设备', value: '3' }
]

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

const examTypeOptions = [
  { label: 'CT', value: 'CT' },
  { label: 'MR', value: 'MR' },
  { label: 'DR', value: 'DR' },
  { label: 'US', value: 'US' }
]

const query = reactive({
  acceptDevice: '1',
  requestDevice: '',
  dicomPeers: [],
  deviceRange: ['2025-11-28', '2026-02-28'] as string[],
  matchRange: ['2025-11-28', '2026-02-28'] as string[],
  filmSizeRange: ['2025-11-28', '2026-02-28'] as string[],
  examType: '',
  examTypeRange: ['2026-02-21', '2026-02-28'] as string[]
})

const getdicomPeers = async (value?: string) => {
  const acceptDevice = value ?? query.acceptDevice
  // 切换类型时清空已选设备
  query.dicomPeers = []
  if (!acceptDevice) {
    dicomPeerOptions.value = []
    return
  }

  dicomPeerLoading.value = true
  try {
    if (acceptDevice === '3') {
      const res = await getPrinterDropDown()
      dicomPeerOptions.value = res?.printer ?? []
    } else if (acceptDevice === '1' || acceptDevice === '2') {
      const res = await getDicomPeerDropDown()
      dicomPeerOptions.value = res?.dicomPeers ?? []
    } else {
      dicomPeerOptions.value = []
    }
    query.dicomPeers = dicomPeerOptions.value.map((item) => item.value) as any
    onSearchPanel('device')
    // await onSearchPanel
  } finally {
    dicomPeerLoading.value = false
  }
}

const fetchDeviceStatistics = async () => {
  const [startDate, endDate] = query.deviceRange
  const dicomPeers = (query.dicomPeers as string[]) ?? []

  // 约定：1=接收量(用 totalCount)，2=打印量(用 printCount)，3=打印设备(用 printCount)
  const metricKey = query.acceptDevice === '1' ? 'totalCount' : 'printCount'
  let res: DicomPeerStatistics[] = []
  if (query.acceptDevice === '3') {
    const request = await getPrinterStatistics({
      startDate,
      endDate,
      printState: null,
      dicomPeers
    })
    res = request.dicomPeerStatistics || []
  } else {
    const request = await getDicomPeerStatistics({
      startDate,
      endDate,
      printState: null,
      dicomPeers
    })
    res = request.dicomPeerStatistics || []
  }

  const devices = res.map((p) => p.peerDes)

  const filmSizes: string[] = []
  const filmSizeSet = new Set<string>()
  res.forEach((peer) => {
    ;(peer.data ?? []).forEach((item) => {
      const size = item.filmSize
      if (size && !filmSizeSet.has(size)) {
        filmSizeSet.add(size)
        filmSizes.push(size)
      }
    })
  })

  chartData.device.filmSizes = filmSizes
  chartData.device.devices = devices
  chartData.device.series = filmSizes.map((size) => {
    return {
      name: size,
      data: res.map((peer) => {
        const bySize = new Map((peer.data ?? []).map((item) => [item.filmSize, item] as const))
        return Number(bySize.get(size)?.[metricKey] ?? 0)
      })
    }
  })
  chartData.device.peerTotals = res.map((peer) => ({
    peerDes: peer.peerDes,
    printCount: (peer.data ?? []).reduce((sum, item) => sum + Number(item.printCount ?? 0), 0),
    totalCount: (peer.data ?? []).reduce((sum, item) => sum + Number(item.totalCount ?? 0), 0)
  }))
}

const panelStates = reactive<Record<PanelId, PanelState>>({
  device: { mode: 'chart', chartType: 'line', initialType: 'line', queried: false },
  match: { mode: 'chart', chartType: 'line', initialType: 'line', queried: false },
  filmSize: { mode: 'chart', chartType: 'line', initialType: 'line', queried: false },
  examType: { mode: 'chart', chartType: 'line', initialType: 'line', queried: false }
})

const chartData = {
  device: {
    devices: [] as string[],
    filmSizes: [] as string[],
    series: [] as Array<{ name: string; data: number[] }>,
    peerTotals: [] as Array<{ peerDes: string; printCount: number; totalCount: number }>
  },
  match: {
    categories: ['设备A', '设备B', '设备C'],
    autoMatch: [50, 40, 30],
    ratio: [95, 89, 82]
  },
  filmSize: {
    categories: ['8x10', '10x12', '11x14', '14x17'],
    usage: [25, 36, 18, 45]
  },
  examType: {
    categories: ['CT', 'MR', 'DR', 'US'],
    usage: [40, 28, 46, 20]
  }
}

const chartRefs: Record<PanelId, HTMLElement | null> = {
  device: null,
  match: null,
  filmSize: null,
  examType: null
}

const panelRefs: Record<PanelId, HTMLElement | null> = {
  device: null,
  match: null,
  filmSize: null,
  examType: null
}

const chartInstances = new Map<PanelId, echarts.ECharts>()

const deviceTableRows = computed(() => {
  if (!panelStates.device.queried) {
    return []
  }
  return chartData.device.peerTotals.map((item) => ({
    requestDevice: getPeerText(item.peerDes),
    requestCount: item.printCount,
    totalCount: item.totalCount
  }))
})

const getTableColumns = (panelId: PanelId): TableColumnItem[] => {
  if (panelId === 'device') {
    return [
      { prop: 'requestDevice', label: '请求设备' },
      {
        prop: 'requestCount',
        label: '请求量',
        children: [
          {
            prop: 'printCount',
            label: '14INX17IN'
          },
          {
            prop: 'printCount',
            label: '8INX10IN'
          }
        ]
      },
      { prop: 'totalCount', label: '请求总量' }
    ]
  }
  if (panelId === 'match') {
    return [
      { prop: 'device', label: '设备' },
      { prop: 'autoMatch', label: '自动匹配' },
      { prop: 'ratio', label: '匹配率(%)' }
    ]
  }
  if (panelId === 'filmSize') {
    return [
      { prop: 'size', label: '胶片尺寸' },
      { prop: 'usage', label: '使用量' }
    ]
  }
  return [
    { prop: 'examType', label: '检查类型' },
    { prop: 'usage', label: '使用量' }
  ]
}

const getTableRows = (panelId: PanelId) => {
  if (!panelStates[panelId].queried) {
    return []
  }
  if (panelId === 'device') {
    return deviceTableRows.value
  }
  if (panelId === 'match') {
    return chartData.match.categories.map((name, index) => ({
      device: name,
      autoMatch: chartData.match.autoMatch[index],
      ratio: chartData.match.ratio[index]
    }))
  }
  if (panelId === 'filmSize') {
    return chartData.filmSize.categories.map((name, index) => ({
      size: name,
      usage: chartData.filmSize.usage[index]
    }))
  }
  return chartData.examType.categories.map((name, index) => ({
    examType: name,
    usage: chartData.examType.usage[index]
  }))
}

const setChartRef = (panelId: PanelId, el: Element | ComponentPublicInstance | null) => {
  chartRefs[panelId] = el instanceof HTMLElement ? el : null
}

const setPanelRef = (panelId: PanelId, el: Element | ComponentPublicInstance | null) => {
  panelRefs[panelId] = el instanceof HTMLElement ? el : null
}

const baseGrid = {
  top: 30,
  left: 36,
  right: 36,
  bottom: 28,
  containLabel: true
}

const getOption = (panelId: PanelId): EChartsOption => {
  if (panelId === 'device') {
    const data = panelStates.device.queried
      ? chartData.device
      : { devices: [], filmSizes: [], series: [] as Array<{ name: string; data: number[] }> }
    return {
      grid: baseGrid,
      legend: { top: 0, icon: 'roundRect' },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const list = Array.isArray(params) ? params : [params]
          const axisValue = list[0]?.axisValue ?? list[0]?.name ?? ''
          const axisLabel = getPeerText(axisValue)
          const lines = list.map((p: any) => {
            return `${p.marker}${p.seriesName}: ${formatNumber(p.value)}`
          })
          return [axisLabel, ...lines].join('<br/>')
        }
      },
      xAxis: {
        type: 'category',
        name: '设备',
        nameLocation: 'end',
        data: data.devices,
        axisLabel: {
          formatter: (value: string) => getPeerText(value)
        },
        boundaryGap: panelStates.device.chartType === 'bar'
      },
      yAxis: {
        type: 'value',
        name: query.acceptDevice === '1' ? '接收量' : '打印量'
      },
      series: data.series.map((s) => ({
        name: s.name,
        type: panelStates.device.chartType,
        data: s.data
      }))
    }
  }

  if (panelId === 'match') {
    const data = panelStates.match.queried
      ? chartData.match
      : { categories: [], autoMatch: [], ratio: [] }
    return {
      grid: baseGrid,
      legend: { top: 0, icon: 'roundRect' },
      xAxis: {
        type: 'category',
        name: '设备',
        nameLocation: 'end',
        data: data.categories,
        boundaryGap: panelStates.match.chartType === 'bar'
      },
      yAxis: [
        {
          type: 'value',
          name: '使用量'
        },
        {
          type: 'value',
          name: '匹配率',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ],
      series: [
        {
          name: '自动匹配',
          type: panelStates.match.chartType,
          data: data.autoMatch,
          yAxisIndex: 0
        },
        {
          name: '匹配率',
          type: panelStates.match.chartType,
          data: data.ratio,
          yAxisIndex: 1
        }
      ]
    }
  }

  if (panelId === 'filmSize') {
    const data = panelStates.filmSize.queried ? chartData.filmSize : { categories: [], usage: [] }
    return {
      grid: baseGrid,
      xAxis: {
        type: 'category',
        name: '月份',
        nameLocation: 'end',
        data: data.categories,
        boundaryGap: panelStates.filmSize.chartType === 'bar'
      },
      yAxis: {
        type: 'value',
        name: '使用量'
      },
      series: [
        {
          name: '使用量',
          type: panelStates.filmSize.chartType,
          data: data.usage
        }
      ]
    }
  }

  const data = panelStates.examType.queried ? chartData.examType : { categories: [], usage: [] }
  return {
    grid: baseGrid,
    xAxis: {
      type: 'category',
      name: '日期',
      nameLocation: 'end',
      data: data.categories,
      boundaryGap: panelStates.examType.chartType === 'bar'
    },
    yAxis: {
      type: 'value',
      name: '使用量'
    },
    series: [
      {
        name: '使用量',
        type: panelStates.examType.chartType,
        data: data.usage
      }
    ]
  }
}

const renderChart = (panelId: PanelId) => {
  const el = chartRefs[panelId]
  if (!el) {
    return
  }
  let chart = chartInstances.get(panelId)
  if (!chart) {
    chart = echarts.init(el)
    chartInstances.set(panelId, chart)
  }
  chart.setOption(getOption(panelId), true)
}

const renderAll = () => {
  ;(['device', 'match', 'filmSize', 'examType'] as PanelId[]).forEach((panelId) => {
    renderChart(panelId)
  })
}

const onResize = () => {
  chartInstances.forEach((chart) => chart.resize())
}

const onSearchPanel = async (panelId: PanelId) => {
  panelStates[panelId].queried = true
  panelStates[panelId].mode = 'chart'
  if (panelId === 'device') {
    await fetchDeviceStatistics()
  }
  await nextTick(() => renderChart(panelId))
}

const onDataView = (panelId: PanelId) => {
  panelStates[panelId].mode = 'table'
}

const closeTableView = (panelId: PanelId) => {
  panelStates[panelId].mode = 'chart'
  nextTick(() => renderChart(panelId))
}

const onLine = (panelId: PanelId) => {
  panelStates[panelId].mode = 'chart'
  panelStates[panelId].chartType = 'line'
  nextTick(() => renderChart(panelId))
}

const onBar = (panelId: PanelId) => {
  panelStates[panelId].mode = 'chart'
  panelStates[panelId].chartType = 'bar'
  nextTick(() => renderChart(panelId))
}

const onRestore = (panelId: PanelId) => {
  panelStates[panelId].mode = 'chart'
  panelStates[panelId].chartType = panelStates[panelId].initialType
  panelStates[panelId].queried = false
  nextTick(() => renderChart(panelId))
}

const downloadByUrl = (url: string, fileName: string) => {
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
}

const onSaveImage = (panelId: PanelId) => {
  if (panelStates[panelId].mode === 'table' && panelId === 'device') {
    exportDeviceCsv()
    return
  }
  const chart = chartInstances.get(panelId)
  if (!chart) {
    return
  }
  const url = chart.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  })
  downloadByUrl(url, `${panelId}-chart.png`)
}

const onFullscreen = async (panelId: PanelId) => {
  const el = panelRefs[panelId]
  if (!el) {
    return
  }
  if (document.fullscreenElement === el) {
    await document.exitFullscreen()
  } else {
    await el.requestFullscreen()
  }
  setTimeout(() => onResize(), 100)
}

const exportDeviceCsv = () => {
  const header = ['请求设备', '请求量', '请求总量']
  const rows = deviceTableRows.value.map((item) => [
    item.requestDevice,
    String(item.requestCount),
    String(item.totalCount)
  ])
  const csv = [header, ...rows].map((line) => line.join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  downloadByUrl(url, '设备用量数据.csv')
  URL.revokeObjectURL(url)
}

const getOptionsList = async () => {
  await getdicomPeers(query.acceptDevice)
}

onMounted(() => {
  getOptionsList()
  nextTick(() => {
    renderAll()
    window.addEventListener('resize', onResize)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chartInstances.forEach((chart) => chart.dispose())
  chartInstances.clear()
})
</script>

<template>
  <div class="stats-page">
    <div class="stats-grid">
      <ElCard shadow="never" class="stats-panel" :ref="(el) => setPanelRef('device', el)">
        <div class="panel-head">
          <div class="panel-title">设备用量</div>
          <ElForm inline size="small">
            <ElFormItem style="margin-right: 10px">
              <ElSelect
                v-model="query.acceptDevice"
                placeholder="请选择设备接收室"
                style="width: 150px"
                @change="getdicomPeers"
              >
                <ElOption
                  v-for="item in acceptDeviceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem style="margin-right: 10px">
              <ElSelect
                v-model="query.dicomPeers"
                placeholder="请选择设备列表"
                style="width: 150px"
                multiple
                collapse-tags
                collapse-tags-tooltip
                :loading="dicomPeerLoading"
              >
                <ElOption
                  v-for="item in dicomPeerOptions"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem style="margin-right: 10px">
              <ElDatePicker
                v-model="query.deviceRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                unlink-panels
                style="width: 220px"
              />
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" @click="onSearchPanel('device')">查询</ElButton>
            </ElFormItem>
          </ElForm>
        </div>

        <div class="panel-body">
          <div class="panel-main">
            <div
              v-show="panelStates.device.mode === 'chart'"
              class="chart-area"
              :ref="(el) => setChartRef('device', el)"
            ></div>
            <div v-show="panelStates.device.mode === 'table'" class="table-view">
              <ElTable :data="getTableRows('device')" height="100%" empty-text="暂无数据" border>
                <ElTableColumn
                  v-for="item in getTableColumns('device')"
                  :key="item.prop"
                  :prop="item.prop"
                  :label="item.label"
                  min-width="120"
                >
                  <ElTableColumn v-if="item.label === '请求量'" :label="item.label" />
                </ElTableColumn>
              </ElTable>
              <div class="table-actions">
                <ElButton plain type="primary" @click="exportDeviceCsv">导出</ElButton>
                <ElButton type="danger" plain @click="closeTableView('device')">关闭</ElButton>
              </div>
            </div>
          </div>

          <div class="toolbox">
            <div
              class="tool-btn"
              :class="{ 'is-active': panelStates.device.mode === 'table' }"
              @click="onDataView('device')"
            >
              <ElIcon :size="18"><DataAnalysis /></ElIcon>
              <span>数据视图</span>
            </div>
            <div
              class="tool-btn"
              :class="{
                'is-active':
                  panelStates.device.chartType === 'line' && panelStates.device.mode === 'chart'
              }"
              @click="onLine('device')"
            >
              <ElIcon :size="18"><TrendCharts /></ElIcon>
              <span>折线图</span>
            </div>
            <div
              class="tool-btn"
              :class="{
                'is-active':
                  panelStates.device.chartType === 'bar' && panelStates.device.mode === 'chart'
              }"
              @click="onBar('device')"
            >
              <ElIcon :size="18"><Histogram /></ElIcon>
              <span>柱状图</span>
            </div>
            <div class="tool-btn" @click="onRestore('device')">
              <ElIcon :size="18"><Refresh /></ElIcon>
              <span>还原</span>
            </div>
            <div class="tool-btn" @click="onSaveImage('device')">
              <ElIcon :size="18"><Download /></ElIcon>
              <span>保存为图片</span>
            </div>
            <div class="tool-btn" @click="onFullscreen('device')">
              <ElIcon :size="18"><FullScreen /></ElIcon>
              <span>全屏显示</span>
            </div>
          </div>
        </div>
      </ElCard>

      <ElCard shadow="never" class="stats-panel" :ref="(el) => setPanelRef('match', el)">
        <div class="panel-head">
          <div class="panel-title">匹配率</div>
          <ElForm inline>
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
              <ElButton type="primary" @click="onSearchPanel('match')">查询</ElButton>
            </ElFormItem>
          </ElForm>
        </div>

        <div class="panel-body">
          <div class="panel-main">
            <div
              v-show="panelStates.match.mode === 'chart'"
              class="chart-area"
              :ref="(el) => setChartRef('match', el)"
            ></div>
            <div v-show="panelStates.match.mode === 'table'" class="table-view">
              <ElTable :data="getTableRows('match')" height="100%" empty-text="暂无数据" border>
                <ElTableColumn
                  v-for="item in getTableColumns('match')"
                  :key="item.prop"
                  :prop="item.prop"
                  :label="item.label"
                  min-width="120"
                />
              </ElTable>
              <div class="table-actions">
                <ElButton type="danger" plain @click="closeTableView('match')">关闭</ElButton>
              </div>
            </div>
          </div>
          <div class="toolbox">
            <div class="tool-btn" @click="onDataView('match')">
              <ElIcon :size="18"><DataAnalysis /></ElIcon>
              <span>数据视图</span>
            </div>
            <div
              class="tool-btn"
              :class="{ 'is-active': panelStates.match.chartType === 'line' }"
              @click="onLine('match')"
            >
              <ElIcon :size="18"><TrendCharts /></ElIcon>
              <span>折线图</span>
            </div>
            <div
              class="tool-btn"
              :class="{ 'is-active': panelStates.match.chartType === 'bar' }"
              @click="onBar('match')"
            >
              <ElIcon :size="18"><Histogram /></ElIcon>
              <span>柱状图</span>
            </div>
            <div class="tool-btn" @click="onRestore('match')">
              <ElIcon :size="18"><Refresh /></ElIcon>
              <span>还原</span>
            </div>
            <div class="tool-btn" @click="onSaveImage('match')">
              <ElIcon :size="18"><Download /></ElIcon>
              <span>保存为图片</span>
            </div>
            <div class="tool-btn" @click="onFullscreen('match')">
              <ElIcon :size="18"><FullScreen /></ElIcon>
              <span>全屏显示</span>
            </div>
          </div>
        </div>
      </ElCard>

      <ElCard shadow="never" class="stats-panel" :ref="(el) => setPanelRef('filmSize', el)">
        <div class="panel-head">
          <div class="panel-title">胶片日用量 /<span class="panel-sub"> 胶片尺寸</span></div>
          <ElForm inline>
            <ElFormItem>
              <ElDatePicker
                v-model="query.filmSizeRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                unlink-panels
                style="width: 220px"
              />
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" @click="onSearchPanel('filmSize')">查询</ElButton>
            </ElFormItem>
          </ElForm>
        </div>

        <div class="panel-body">
          <div class="panel-main">
            <div
              v-show="panelStates.filmSize.mode === 'chart'"
              class="chart-area"
              :ref="(el) => setChartRef('filmSize', el)"
            ></div>
            <div v-show="panelStates.filmSize.mode === 'table'" class="table-view">
              <ElTable :data="getTableRows('filmSize')" height="100%" empty-text="暂无数据" border>
                <ElTableColumn
                  v-for="item in getTableColumns('filmSize')"
                  :key="item.prop"
                  :prop="item.prop"
                  :label="item.label"
                  min-width="120"
                />
              </ElTable>
              <div class="table-actions">
                <ElButton type="danger" plain @click="closeTableView('filmSize')">关闭</ElButton>
              </div>
            </div>
          </div>
          <div class="toolbox">
            <div class="tool-btn" @click="onDataView('filmSize')">
              <ElIcon :size="18"><DataAnalysis /></ElIcon>
              <span>数据视图</span>
            </div>
            <div
              class="tool-btn"
              :class="{ 'is-active': panelStates.filmSize.chartType === 'line' }"
              @click="onLine('filmSize')"
            >
              <ElIcon :size="18"><TrendCharts /></ElIcon>
              <span>折线图</span>
            </div>
            <div
              class="tool-btn"
              :class="{ 'is-active': panelStates.filmSize.chartType === 'bar' }"
              @click="onBar('filmSize')"
            >
              <ElIcon :size="18"><Histogram /></ElIcon>
              <span>柱状图</span>
            </div>
            <div class="tool-btn" @click="onRestore('filmSize')">
              <ElIcon :size="18"><Refresh /></ElIcon>
              <span>还原</span>
            </div>
            <div class="tool-btn" @click="onSaveImage('filmSize')">
              <ElIcon :size="18"><Download /></ElIcon>
              <span>保存为图片</span>
            </div>
            <div class="tool-btn" @click="onFullscreen('filmSize')">
              <ElIcon :size="18"><FullScreen /></ElIcon>
              <span>全屏显示</span>
            </div>
          </div>
        </div>
      </ElCard>

      <ElCard shadow="never" class="stats-panel" :ref="(el) => setPanelRef('examType', el)">
        <div class="panel-head">
          <div class="panel-title">胶片日用量 /<span class="panel-sub"> 检查类型</span></div>
          <ElForm inline>
            <ElFormItem>
              <ElSelect
                v-model="query.examType"
                placeholder="请选择"
                style="width: 180px"
                clearable
              >
                <ElOption
                  v-for="item in examTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem>
              <ElDatePicker
                v-model="query.examTypeRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                unlink-panels
                style="width: 220px"
              />
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" @click="onSearchPanel('examType')">查询</ElButton>
            </ElFormItem>
          </ElForm>
        </div>

        <div class="panel-body">
          <div class="panel-main">
            <div
              v-show="panelStates.examType.mode === 'chart'"
              class="chart-area"
              :ref="(el) => setChartRef('examType', el)"
            ></div>
            <div v-show="panelStates.examType.mode === 'table'" class="table-view">
              <ElTable :data="getTableRows('examType')" height="100%" empty-text="暂无数据" border>
                <ElTableColumn
                  v-for="item in getTableColumns('examType')"
                  :key="item.prop"
                  :prop="item.prop"
                  :label="item.label"
                  min-width="120"
                />
              </ElTable>
              <div class="table-actions">
                <ElButton type="danger" plain @click="closeTableView('examType')">关闭</ElButton>
              </div>
            </div>
          </div>
          <div class="toolbox">
            <div class="tool-btn" @click="onDataView('examType')">
              <ElIcon :size="18"><DataAnalysis /></ElIcon>
              <span>数据视图</span>
            </div>
            <div
              class="tool-btn"
              :class="{ 'is-active': panelStates.examType.chartType === 'line' }"
              @click="onLine('examType')"
            >
              <ElIcon :size="18"><TrendCharts /></ElIcon>
              <span>折线图</span>
            </div>
            <div
              class="tool-btn"
              :class="{ 'is-active': panelStates.examType.chartType === 'bar' }"
              @click="onBar('examType')"
            >
              <ElIcon :size="18"><Histogram /></ElIcon>
              <span>柱状图</span>
            </div>
            <div class="tool-btn" @click="onRestore('examType')">
              <ElIcon :size="18"><Refresh /></ElIcon>
              <span>还原</span>
            </div>
            <div class="tool-btn" @click="onSaveImage('examType')">
              <ElIcon :size="18"><Download /></ElIcon>
              <span>保存为图片</span>
            </div>
            <div class="tool-btn" @click="onFullscreen('examType')">
              <ElIcon :size="18"><FullScreen /></ElIcon>
              <span>全屏显示</span>
            </div>
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.stats-page {
  width: 100%;
  min-width: 1200px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

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

  /* overflow: hidden; */
  transition: all var(--el-transition-duration) var(--el-transition-function-ease-in-out-bezier);

  /* color: #333; */
}

.tool-btn:hover,
.tool-btn.is-active {
  color: var(--el-color-primary);

  /* min-height: 42px; */
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

@media (width <= 1400px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
