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
  getDicomPeerDropDown,
  getDicomPeerStatistics,
  getPrinterDropDown,
  getPrinterStatistics,
  type DicomPeerStatistics,
  type OptionList
} from '@/api/filmStatistics'

defineOptions({
  name: 'DeviceUsage'
})

type ViewMode = 'chart' | 'table'
type ChartType = 'line' | 'bar'

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

const sesonDay = new Date().valueOf() - 93 * 24 * 60 * 60 * 1000

const query = reactive({
  acceptDevice: '1',
  dicomPeers: [] as string[],
  deviceRange: [
    new Date(sesonDay).toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  ] as string[]
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
const filmSizes = ref<string[]>([])
const series = ref<Array<{ name: string; data: number[] }>>([])

const metricLabel = computed(() => (query.acceptDevice === '1' ? '请求量' : '打印量'))

const tableRows = computed(() => {
  if (!state.queried) return []
  return devices.value.map((deviceKey, deviceIndex) => {
    const row: Record<string, any> = {
      requestDevice: getPeerText(deviceKey)
    }

    let total = 0
    filmSizes.value.forEach((size, sizeIndex) => {
      const val = Number(series.value[sizeIndex]?.data?.[deviceIndex] ?? 0)
      row[size] = val
      total += val
    })

    row.requestTotal = total
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

const getdicomPeers = async (value?: string) => {
  const acceptDevice = value ?? query.acceptDevice
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

    query.dicomPeers = dicomPeerOptions.value.map((item) => item.value)
    await onSearch()
  } finally {
    dicomPeerLoading.value = false
  }
}

const fetchDeviceStatistics = async () => {
  const [startDate, endDate] = query.deviceRange
  const dicomPeers = query.dicomPeers ?? []
  const metricKey = 'printCount'

  let res: DicomPeerStatistics[] = []
  if (query.acceptDevice === '3') {
    const request = await getPrinterStatistics({
      startDate: startDate ? startDate + ' 00:00:00' : '',
      endDate: endDate ? endDate + ' 23:59:59' : '',
      printState: null,
      dicomPeers
    })
    res = request.dicomPeerStatistics || []
  } else {
    const request = await getDicomPeerStatistics({
      startDate: startDate ? startDate + ' 00:00:00' : '',
      endDate: endDate ? endDate + ' 23:59:59' : '',
      printState: null,
      dicomPeers
    })
    res = request.dicomPeerStatistics || []
  }

  const peers = res || []
  devices.value = peers.map((p) => p.peerDes)

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
        return Number(bySize.get(size)?.[metricKey] ?? 0)
      })
    }
  })
}

const getOption = (): EChartsOption => {
  const hasData = state.queried
  const chartSeries = hasData ? series.value : []

  return {
    grid: {
      top: 60,
      left: 26,
      right: 46,
      bottom: 0,
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
        const lines = list.map((p: any) => `${p.marker}${p.seriesName}: ${formatNumber(p.value)}`)
        return [axisLabel, ...lines].join('<br/>')
      }
    },
    xAxis: {
      type: 'category',
      name: '设备',
      nameLocation: 'end',
      data: query.dicomPeers,
      axisLabel: {
        formatter: (value: string) => getPeerText(value)
      },
      boundaryGap: state.chartType === 'bar'
    },
    yAxis: {
      type: 'value',
      name: metricLabel.value
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
  await fetchDeviceStatistics()
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
  const header = ['请求设备', ...filmSizes.value, '请求总量']
  const rows = tableRows.value.map((item) => {
    const values = filmSizes.value.map((size) => String((item as any)[size] ?? 0))
    return [
      String((item as any).requestDevice ?? ''),
      ...values,
      String((item as any).requestTotal ?? 0)
    ]
  })

  const csv = [header, ...rows].map((line) => line.join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  downloadByUrl(url, '设备用量数据.csv')
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
  downloadByUrl(url, 'device-usage-chart.png')
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
  getdicomPeers(query.acceptDevice)
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
  <ElCard shadow="never" class="stats-panel card-table" :ref="(el) => setPanelRef(el)">
    <div class="panel-head">
      <div class="panel-title">设备用量</div>
      <ElForm inline size="small">
        <ElFormItem style="margin-right: 10px">
          <ElSelect
            v-model="query.acceptDevice"
            placeholder="请选择设备接收室"
            style="width: 120px"
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
          <ElTable :data="tableRows" height="100%" empty-text="暂无数据">
            <ElTableColumn prop="requestDevice" label="请求设备" min-width="120" align="center" />
            <ElTableColumn label="请求量" align="center">
              <ElTableColumn
                v-for="size in filmSizes"
                :key="size"
                :prop="size"
                :label="size"
                min-width="120"
                align="center"
              />
            </ElTableColumn>
            <ElTableColumn prop="requestTotal" align="center" label="请求总量" min-width="120" />
          </ElTable>
          <div class="table-actions">
            <ElButton plain type="primary" @click="exportCsv">导出</ElButton>
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
  padding: 0 12px;
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
