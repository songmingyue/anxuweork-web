<script setup lang="ts">
import { getAreaNoDropdown, getDropDownConfig, getPatientTypeDropdown } from '@/api/common'
import {
  deleteFilm,
  DicomPeerOption,
  ExamInfo,
  FilmResultItem,
  GetAutoPrintConfig,
  getCloudViewConfig,
  getExamList,
  getImageByFilmBox,
  getMatFailedCount,
  getPrinterDropDown,
  getReportListByAccNum,
  printFilmMsd,
  setFilmboxPrinter,
  TExamResult,
  updateExamPrintRestrict,
  updateFilmPaidTag
} from '@/api/workstation'
import { HandMatchPlugin } from 'vue-computer'
import { useCommonStoreWithOut } from '@/store/modules/common'
import { useWorkStationStoreWithOut } from '@/store/modules/workStation'
import {
  hasFilmOptions,
  isPrintedOptions,
  reportExistsOptions,
  reportPrintedOptions,
  cloudFilmPaidOptions
} from './option'
import ManualMatchDialog from './components/ManualMatchDialog.vue'
import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElPagination,
  ElRow,
  ElCol,
  ElSelect,
  ElOption,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTabPane,
  ElPopover,
  ElDropdown,
  ElIcon,
  ElDropdownMenu,
  ElDropdownItem,
  ElMessage,
  ElMessageBox,
  ElDialog,
  ElEmpty
} from 'element-plus'
import { computed, nextTick, reactive, ref, watch, onMounted } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ImageBlobUrl } from '@/components/Permission/src/utils'
import { getDicomPeerDropDown } from '@/api/filmStatistics'

defineOptions({
  name: 'Workstation'
})

const showMore = ref(false)

const getDefaultDateRange = (): string[] => {
  const end = dayjs()
  const day = end.day() // 0(Sun) ~ 6(Sat)
  const diffToMonday = (day + 6) % 7
  const start = end.subtract(diffToMonday, 'day')
  return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
}

const query = reactive<ExamInfo>({
  medRecNo: '',
  patientID: '',
  accessionNumber: '',
  examType: [],
  patientType: [],
  areaNo: [],
  patientName: '',
  hasFilm: '',
  isPrinted: '',
  dicomPeerIDList: [],
  reportExists: '',
  reportPrinted: '',
  cloudFilmPaid: '',
  examStartDate: '',
  examEndDate: '',
  dateRange: getDefaultDateRange()
})
// dialog 组件相关
const dialogWidth = ref('70vw')
const handMatchFitMode = ref<'natural' | 'fitHeight'>('natural')
function setHandMatchMode(mode: 'natural' | 'fitHeight') {
  handMatchFitMode.value = mode
}
const printerDialogVisible = ref(false)
const selectedPrinterId = ref('')
const printerOptions = ref<DicomPeerOption[]>([])
const printerLoading = ref(false)

const manualMatchDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const manualMatchImageUrl = ref('')
const viewObjectUrls = ref<string[]>([])
const viewActiveIndex = ref(0)
const viewUrlList = ref<string[]>([])
const viewCurrentSrc = computed(() => viewUrlList.value[viewActiveIndex.value] || '')

const viewTitle = computed(() => `第 ${viewActiveIndex.value + 1} 张`)
const manualMatchObjectUrl = ref<string | null>(null)
const cleanupManualMatchObjectUrl = () => {
  if (manualMatchObjectUrl.value) {
    URL.revokeObjectURL(manualMatchObjectUrl.value)
    manualMatchObjectUrl.value = null
  }
  manualMatchImageUrl.value = ''
}
const cleanupViewObjectUrls = () => {
  viewObjectUrls.value.forEach((url) => URL.revokeObjectURL(url))
  viewObjectUrls.value = []
  viewUrlList.value = []
  viewActiveIndex.value = 0
}

const printOf = () => {
  window.print()
}

const deleteFilmBtn = () => {
  ElMessageBox.confirm('确认删除该胶片吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      if (activedRow.value) {
        await deleteFilm({ filmBoxID: activedRow.value?.filmResult[0].filmBoxID })
      }
    })
    .catch(() => {
      // 取消操作
    })
}

const activedRow = ref<TExamResult | null>(null)
const dialogType = ref('film')
const watchReport = async (row: TExamResult, type: 'film' | 'report') => {
  cleanupViewObjectUrls()
  dialogType.value = type
  viewDialogVisible.value = true
  activedRow.value = row
  if (type === 'film') {
    const url = ImageBlobUrl(await getImageByFilmBox(row.filmResult[0].filmBoxID))
    viewObjectUrls.value = [url]
    viewUrlList.value = [url]
  } else {
    const { reportImg } = await getReportListByAccNum({
      accessionNumber: row.accessionNumber
    })
    viewUrlList.value = reportImg
  }
}

const search = async () => {
  // tableLoading.value = true
  // try {
  //   const res = await getFilmBoxList(buildFilmBoxListQuery())
  //   if (res.desc) {
  //     ElMessage.warning(res.desc)
  //   }
  //   tableData.value = res.filmBoxResult || []
  //   total.value = res.pageInfo?.count ?? 0
  // } catch (error) {
  //   console.error('获取胶片列表失败', error)
  //   ElMessage.error('获取胶片列表失败')
  // } finally {
  //   tableLoading.value = false
  // }
}

const changeImgPicture = (type: 'last' | 'next') => {
  if (type === 'last') {
    viewActiveIndex.value = Math.max(viewActiveIndex.value - 1, 0)
  } else {
    viewActiveIndex.value = Math.min(viewActiveIndex.value + 1, viewUrlList.value.length - 1)
  }
  setTimeout(() => {
    console.log(viewCurrentSrc.value, '-=-=-=-=-=-=')
  }, 1000)
}

const openManualMatchDialog = async () => {
  const examRow = activedRow.value
  const selectedFilm = filmTableData.value.find((row) => isFilmSelected(row.filmBoxID))
  const film = selectedFilm || examRow?.filmResult?.[0]
  if (!film?.filmBoxID) {
    ElMessage.warning('暂无可手工匹配的胶片')
    return
  }

  try {
    cleanupManualMatchObjectUrl()
    const buffer = await getImageByFilmBox(film.filmBoxID)
    const url = ImageBlobUrl(buffer)
    manualMatchObjectUrl.value = url
    manualMatchImageUrl.value = url
    manualMatchDialogVisible.value = true
  } catch (error) {
    console.error('获取图片失败', error)
    ElMessage.error('获取图片失败')
  }
}

const manualMatchCount = ref(0)
const dateRangeShortcuts = [
  {
    text: '今天',
    value: () => {
      const today = dayjs().toDate()
      return [today, today]
    }
  },
  {
    text: '近两天',
    value: () => {
      const end = dayjs().toDate()
      const start = dayjs().subtract(1, 'day').toDate()
      return [start, end]
    }
  },
  {
    text: '近三天',
    value: () => {
      const end = dayjs().toDate()
      const start = dayjs().subtract(2, 'day').toDate()
      return [start, end]
    }
  },
  {
    text: '近一周',
    value: () => {
      const end = dayjs().toDate()
      const start = dayjs().subtract(6, 'day').toDate()
      return [start, end]
    }
  },
  {
    text: '近一个月',
    value: () => {
      const end = dayjs().toDate()
      const start = dayjs().subtract(1, 'month').toDate()
      return [start, end]
    }
  },
  {
    text: '近三个月',
    value: () => {
      const end = dayjs().toDate()
      const start = dayjs().subtract(3, 'month').toDate()
      return [start, end]
    }
  },
  {
    text: '近半年',
    value: () => {
      const end = dayjs().toDate()
      const start = dayjs().subtract(6, 'month').toDate()
      return [start, end]
    }
  },
  {
    text: '近一年',
    value: () => {
      const end = dayjs().toDate()
      const start = dayjs().subtract(1, 'year').toDate()
      return [start, end]
    }
  }
]

type ExamRow = {
  patientNo: string
  checkNo: string
  name: string
  sex: string
  age: string
  examType: string
  reportStatus: string
  examStatus: string
  examItem: string
  examTime: string
  visitType: string
  medicalNo: string
  applyDept: string
  filmFee: string
  idNo: string
}

const examTableLoading = ref(false)
const examTableData = ref<ExamRow[]>([])

const page = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const filmTab = ref<'list' | 'thumb'>('list')

const filmTableLoading = ref(false)
const filmTableData = ref<FilmResultItem[]>([])

const filmTableRef = ref<any>(null)
const selectedFilmBoxIds = ref<string[]>([])
const selectedFilmBoxIdSet = computed(() => new Set(selectedFilmBoxIds.value))
let syncingFilmSelectionToTable = false
let filmSelectionSeq = 0
let suppressFilmSelectionChange = false
let suppressFilmSelectionChangeSeq = 0

const isFilmPrinted = (row: FilmResultItem) => String(row.printState) === '2'
const isFilmSelected = (filmBoxID: string) => selectedFilmBoxIdSet.value.has(filmBoxID)

const unprintedFilmBoxIds = computed(() =>
  filmTableData.value.filter((row) => !isFilmPrinted(row)).map((row) => row.filmBoxID)
)

const isAllUnprintedSelected = computed(() => {
  const unprinted = unprintedFilmBoxIds.value
  if (unprinted.length === 0) return false
  if (selectedFilmBoxIds.value.length !== unprinted.length) return false
  const selectedSet = selectedFilmBoxIdSet.value
  return unprinted.every((id) => selectedSet.has(id))
})

const setSelectedFilmBoxIds = (ids: string[]) => {
  selectedFilmBoxIds.value = Array.from(new Set(ids)).filter(Boolean)
  filmSelectionSeq += 1
  return filmSelectionSeq
}

const scheduleSyncSelectedToFilmTable = (seq: number) => {
  if (filmTab.value !== 'list') return
  suppressFilmSelectionChange = true
  suppressFilmSelectionChangeSeq = seq
  void nextTick()
    .then(async () => {
      if (seq !== filmSelectionSeq) return
      await syncSelectedToFilmTable()
    })
    .finally(() => {
      if (suppressFilmSelectionChangeSeq === seq) {
        suppressFilmSelectionChange = false
      }
    })
}

const syncSelectedToFilmTable = async () => {
  if (!filmTableRef.value) return
  syncingFilmSelectionToTable = true
  try {
    filmTableRef.value.clearSelection()
    const selectedSet = selectedFilmBoxIdSet.value
    filmTableData.value.forEach((row) => {
      if (selectedSet.has(row.filmBoxID)) {
        filmTableRef.value.toggleRowSelection(row, true)
      }
    })
  } finally {
    syncingFilmSelectionToTable = false
  }
}

const onFilmTableSelectionChange = (selection: FilmResultItem[]) => {
  if (syncingFilmSelectionToTable || suppressFilmSelectionChange) return
  setSelectedFilmBoxIds((selection || []).map((row) => row.filmBoxID))
}

const onThumbSelectionChange = async (filmBoxID: string, checked: unknown) => {
  const isChecked = checked === true
  const next = new Set(selectedFilmBoxIds.value)
  if (isChecked) {
    next.add(filmBoxID)
  } else {
    next.delete(filmBoxID)
  }
  const seq = setSelectedFilmBoxIds(Array.from(next))
  scheduleSyncSelectedToFilmTable(seq)
}

const applyDefaultUnprintedSelection = () => {
  const seq = setSelectedFilmBoxIds(unprintedFilmBoxIds.value)
  scheduleSyncSelectedToFilmTable(seq)
}

const toggleSelectUnprinted = () => {
  const seq = isAllUnprintedSelected.value
    ? setSelectedFilmBoxIds([])
    : setSelectedFilmBoxIds(unprintedFilmBoxIds.value)
  scheduleSyncSelectedToFilmTable(seq)
}

const btnChoseText = computed(() => (isAllUnprintedSelected.value ? '取消已选中' : '选中未打印'))

watch(filmTab, (tab) => {
  if (tab === 'list') {
    // 切回列表时，Table 会先发一次空 selection-change；这里先屏蔽，再同步选中状态
    scheduleSyncSelectedToFilmTable(filmSelectionSeq)
  }
})

const getThumbnailSrc = (thumbnailString: string) => {
  const raw = (thumbnailString || '').trim().replace(/\s+/g, '')
  if (!raw) return ''
  if (raw.startsWith('data:image/') || raw.startsWith('blob:')) return raw
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw

  // 常见 base64 开头特征：JPEG(/9j)、PNG(iVBOR)、GIF(R0lGOD)、WebP(UklGR)
  const mime = raw.startsWith('/9j/')
    ? 'image/jpeg'
    : raw.startsWith('iVBOR')
      ? 'image/png'
      : raw.startsWith('R0lGOD')
        ? 'image/gif'
        : raw.startsWith('UklGR')
          ? 'image/webp'
          : 'image/jpeg'

  return `data:${mime};base64,${raw}`
}

const orderBy = reactive({
  columnName: 'ExamineDate',
  orderType: 1
})

const hasSearchCondition = () => {
  const { dateRange, examStartDate, examEndDate, ...rest } = query
  const hasDateRange = Array.isArray(dateRange)
    ? dateRange.some((d) => String(d || '').trim() !== '')
    : String(dateRange || '').trim() !== ''

  const hasOther = Object.values(rest).some((val) => {
    if (Array.isArray(val)) return val.length > 0
    if (typeof val === 'string') return val.trim() !== ''
    return val !== null && val !== undefined
  })

  return hasDateRange || hasOther
}

const onSearch = async () => {
  if (String(query.accessionNumber || '').trim()) {
    query.dateRange = []
  }

  if (!hasSearchCondition()) {
    ElMessage.warning('请输入筛选条件')
    return
  }

  examTableLoading.value = true
  try {
    const { dateRange, ...rest } = query
    const [examStartDate, examEndDate] = dateRange || []

    const params = {
      examInfo: {
        ...rest,
        examStartDate: examStartDate ? examStartDate + ' 00:00:00' : '',
        examEndDate: examEndDate ? examEndDate + ' 23:59:59' : '',
        hasFilm: query.hasFilm === '1' ? true : query.hasFilm === '2' ? false : '',
        isPrinted: query.isPrinted === '1' ? true : query.isPrinted === '2' ? false : '',
        reportExists: query.reportExists === '1' ? true : query.reportExists === '2' ? false : '',
        reportPrinted:
          query.reportPrinted === '1' ? true : query.reportPrinted === '2' ? false : '',
        cloudFilmPaid: query.cloudFilmPaid === '1' ? true : query.cloudFilmPaid === '2' ? false : ''
      },
      pageInfo: {
        pageIndex: page.pageNum,
        pageSize: page.pageSize
      },
      orderInfo: orderBy
    }
    const { examResult, pageInfo } = await getExamList(params)
    examTableData.value = (examResult || []) as any[]
    page.total = pageInfo?.count || 0
  } catch (error) {
    console.error('获取检查列表失败:', error)
  } finally {
    examTableLoading.value = false
  }
}

const onReset = () => {
  query.medRecNo = ''
  query.patientID = ''
  query.accessionNumber = ''
  query.examType = []
  query.patientType = []

  query.areaNo = []
  query.patientName = ''
  query.hasFilm = ''
  query.isPrinted = ''
  query.dicomPeerIDList = []
  query.reportExists = ''
  query.reportPrinted = ''
  query.cloudFilmPaid = ''
  query.examStartDate = ''
  query.examEndDate = ''
  query.dateRange = getDefaultDateRange()
}

const onExamPageChange = (val: number) => {
  page.pageNum = val
  onSearch()
}

const onExamSizeChange = (val: number) => {
  page.pageSize = val
  page.pageNum = 1
  onSearch()
}

const commonStore = useCommonStoreWithOut()
const workStationStore = useWorkStationStoreWithOut()
const isShowPayBtn = ref(false)
const isShowPrintBtn = ref(false)
const optionList = ref<any>([])
const getOptionList = async () => {
  await workStationStore.asyncSetTableList()
  const { status, allowViewPrintedFilmSwitch } = await getCloudViewConfig()
  if (status === 0) {
    isShowPayBtn.value = allowViewPrintedFilmSwitch
  }
  const { status: status1, data } = await GetAutoPrintConfig()
  if (status1 === 0) {
    isShowPrintBtn.value = data
  }
  Promise.all([
    getDropDownConfig(),
    getAreaNoDropdown(),
    getPatientTypeDropdown(),
    getDicomPeerDropDown()
  ])
    .then((responses) => {
      // responses 是一个数组，顺序与传入的 Promise 数组一致
      const [examTypeRes, areaNoRes, patientTypeRes, dicomPeerRes] = responses
      commonStore.setExamTypeDropdown(examTypeRes.data)
      commonStore.setAreaNoDropdown(areaNoRes.data)
      commonStore.setPatientTypeDropdown(patientTypeRes.data)
      optionList.value = dicomPeerRes.dicomPeers
    })
    .catch((error) => {
      // 如果任何一个请求失败，都会进入这里
      console.error('请求失败:', error)
      // 这里可以添加统一的错误处理逻辑
    })
}

const getCountNum = async () => {
  const { count, status } = await getMatFailedCount()
  if (status === 0) {
    manualMatchCount.value = count
  }
}
onMounted(() => {
  getOptionList()
  getCountNum()
})
const moreText = computed(() => (showMore.value ? '收起' : '更多'))
// 付费状态
const payStatus = (row: TExamResult) => {
  ElMessageBox.confirm(`确认状态修改为${row.cloudFilmPaid ? '未付费' : '已付费'}吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await updateFilmPaidTag({
        accessionNumberList: [row.accessionNumber],
        paidTag: !row.cloudFilmPaid
      })
    })
    .catch(() => {
      // 取消操作
    })
}
// 自动打印 限制打印
const examPrintRestrict = async (row: TExamResult) => {
  ElMessageBox.confirm(`确认${row.autoPrint ? '解除限制' : '限制打印'}吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await updateExamPrintRestrict({
        accessionNumber: row.accessionNumber,
        flag: !row.autoPrint
      })
      ElMessageBox.alert(`${row.autoPrint ? '已解除限制' : '已限制打印'}`, '提示', {
        confirmButtonText: '确定'
      })
    })
    .catch(() => {
      // 取消操作
    })
}

const getFilmResult = (row: any) => {
  if (!row) return
  const rows = row as TExamResult
  filmTableData.value = rows.filmResult || []
  applyDefaultUnprintedSelection()
}

const onManualMatch = async () => {
  manualMatchDialogVisible.value = true
  // 手工匹配下面的匹配表格
}
const printFilm = async () => {
  if (!selectedFilmBoxIds.value.length) return ElMessage.warning('请选择要打印的胶片！')
  const isIncludes = filmTableData.value.filter((item) =>
    selectedFilmBoxIds.value.includes(item.filmBoxID)
  )
  if (isIncludes.find((item) => String(item.printState) === '2')) {
    ElMessageBox.alert(
      '当前打印队列中含已打印的胶片，重复打印可能造成胶片浪费，是否继续？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    ).then(() => {
      printFilsApi()
    })
  } else {
    printFilsApi()
  }
}

const printFilsApi = async () => {
  const { printResult, status } = await printFilmMsd({
    filmBoxIDList: selectedFilmBoxIds.value
  })
  if (status !== 0) return
  filmTableData.value.map((item) => {
    const isPrinted = printResult.find((res) => res.filmBoxID === item.filmBoxID)
    if (isPrinted) {
      item.printState = String(isPrinted.result)
    }
  })
}

const openPrinterDialog = async () => {
  if (!selectedFilmBoxIds.value.length) return ElMessage.warning('请选择要修改目的打印机的胶片！')
  printerDialogVisible.value = true
  console.log('修改目的打印机')
  if (printerOptions.value.length > 0) {
    return
  }
  const { printer, status } = await getPrinterDropDown()
  if (status === 0) {
    printerOptions.value = printer
  }
}

// 修改打印机
const submitSetPrinter = async (andPrint: boolean) => {
  if (!selectedPrinterId.value) {
    ElMessage.warning('请选择目的打印机')
    return
  }
  const printer = printerOptions.value.find((p) => p.value === selectedPrinterId.value)
  await setFilmboxPrinter({
    printerName: printer?.text || '',
    printerID: printer?.value || '',
    filmBoxID: selectedFilmBoxIds.value
  })
  try {
    await ElMessageBox.confirm('是否确定修改目的打印机', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (andPrint) {
      await printFilmMsd({ filmBoxIDList: selectedFilmBoxIds.value })
    }
    ElMessage.success(andPrint ? '修改成功并已提交打印' : '修改成功')
    printerDialogVisible.value = false
    await search()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('修改目的打印机失败', error)
      ElMessage.error('修改目的打印机失败')
    }
  }
}
</script>

<template>
  <div class="ws-page">
    <ElCard shadow="never" class="ws-card">
      <ElForm :model="query" label-width="0" class="ws-form" size="small">
        <ElRow :gutter="10" class="ws-form__row">
          <ElCol :span="2" style="min-width: 100px">
            <ElFormItem>
              <ElInput v-model="query.accessionNumber" placeholder="检查号" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :span="2" style="min-width: 100px">
            <ElFormItem>
              <ElInput v-model="query.patientID" placeholder="患者编号" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :span="2" style="min-width: 100px">
            <ElFormItem>
              <ElInput v-model="query.patientName" placeholder="患者姓名" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :span="2" style="min-width: 100px">
            <ElFormItem>
              <ElInput v-model="query.medRecNo" placeholder="病历号" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :span="2" style="min-width: 100px">
            <ElFormItem>
              <ElSelect v-model="query.examType" placeholder="检查类型" clearable>
                <ElOption
                  v-for="o in commonStore.examTypeDropdown"
                  :key="o.text"
                  :label="o.text"
                  :value="o.text"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="2" style="min-width: 100px">
            <ElFormItem>
              <ElSelect v-model="query.patientType" placeholder="就诊类别" clearable>
                <ElOption
                  v-for="o in commonStore.patientTypeDropdown"
                  :key="o.text"
                  :label="o.text"
                  :value="o.text"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="2" style="min-width: 100px">
            <ElFormItem>
              <ElSelect v-model="query.areaNo" placeholder="申请科室" clearable>
                <ElOption
                  v-for="o in commonStore.areaNoDropdown"
                  :key="o.text"
                  :label="o.text"
                  :value="o.text"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="4" style="min-width: 200px">
            <ElFormItem>
              <ElDatePicker
                v-model="query.dateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :shortcuts="dateRangeShortcuts"
                unlink-panels
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="3" style="min-width: 150px">
            <ElFormItem>
              <div class="ws-form__actions">
                <el-popover placement="top-start" :width="200" trigger="click">
                  <template #reference>
                    <el-button class="m-2">{{ moreText }}</el-button>
                  </template>
                  <template #default>
                    <ElFormItem>
                      <el-select
                        v-model="query.hasFilm"
                        placeholder="胶片有无"
                        :teleported="false"
                        clearable
                        style="width: 100%"
                      >
                        <el-option
                          v-for="o in hasFilmOptions"
                          :key="o.label"
                          :label="o.label"
                          :value="o.value"
                        />
                      </el-select>
                    </ElFormItem>

                    <ElFormItem v-if="query.hasFilm === '0' || query.hasFilm === '1'">
                      <el-select
                        v-model="query.isPrinted"
                        placeholder="胶片是否打印"
                        :teleported="false"
                        clearable
                        style="width: 100%"
                      >
                        <el-option
                          v-for="o in isPrintedOptions"
                          :key="o.label"
                          :label="o.label"
                          :value="o.value"
                        />
                      </el-select>
                    </ElFormItem>
                    <ElFormItem v-if="query.hasFilm === '0' || query.hasFilm === '1'">
                      <el-select
                        v-model="query.dicomPeerIDList"
                        placeholder="请求设备"
                        :teleported="false"
                        multiple
                        clearable
                        style="width: 100%"
                      >
                        <el-option
                          v-for="o in optionList"
                          :key="o.text"
                          :label="o.text"
                          :value="o.value"
                        />
                      </el-select>
                    </ElFormItem>
                    <ElFormItem>
                      <el-select
                        v-model="query.reportExists"
                        placeholder="报告有无"
                        :teleported="false"
                        clearable
                        style="width: 100%"
                      >
                        <el-option
                          v-for="o in reportExistsOptions"
                          :key="o.label"
                          :label="o.label"
                          :value="o.value"
                        />
                      </el-select>
                    </ElFormItem>
                    <ElFormItem v-if="query.reportExists === '0' || query.reportExists === '1'">
                      <el-select
                        v-model="query.reportPrinted"
                        placeholder="报告是否打印"
                        :teleported="false"
                        clearable
                        style="width: 100%"
                      >
                        <el-option
                          v-for="o in reportPrintedOptions"
                          :key="o.label"
                          :label="o.label"
                          :value="o.value"
                        />
                      </el-select>
                    </ElFormItem>
                    <ElFormItem>
                      <el-select
                        v-model="query.cloudFilmPaid"
                        placeholder="是否付费"
                        :teleported="false"
                        clearable
                        style="width: 100%"
                      >
                        <el-option
                          v-for="o in cloudFilmPaidOptions"
                          :key="o.label"
                          :label="o.label"
                          :value="o.value"
                        />
                      </el-select>
                    </ElFormItem>
                  </template>
                </el-popover>
                <ElButton type="primary" @click="onSearch">查询</ElButton>
                <ElButton @click="onReset">重置</ElButton>
              </div>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </ElCard>

    <ElCard shadow="never" class="ws-card card-table">
      <div class="ws-sectionHead">
        <div class="ws-sectionHead__title">检查列表</div>
        <div class="ws-sectionHead__actions">
          <ElButton size="small" @click="onManualMatch" type="primary" plain>
            手工匹配({{ manualMatchCount }})
          </ElButton>
        </div>
      </div>
      <ElTable
        :data="examTableData"
        highlight-current-row
        :loading="examTableLoading"
        @current-change="getFilmResult"
        size="small"
        height="300"
        class="ws-table"
      >
        <ElTableColumn type="selection" width="42" />
        <ElTableColumn type="index" label="#" width="48" />
        <ElTableColumn
          v-for="item in workStationStore.tableList"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :min-width="item.width || 100"
          show-overflow-tooltip
          align="center"
        >
          <template
            #default="{ row }"
            v-if="['胶片', '报告', '报告状态', '胶片费用', '打印限制'].includes(item.label)"
          >
            <div v-if="item.label === '胶片'">
              <span>{{ row.filmResult?.length || 0 }}</span>
            </div>
            <div v-if="item.label === '报告'">
              <span>{{ row.reportExists ? '有' : '无' }}</span>
            </div>
            <div v-if="item.label === '报告状态'">
              <span>{{ row.reportPrinted ? '已打印' : '未打印' }}</span>
            </div>
            <div v-if="item.label === '胶片费用'">
              <span>{{ row.cloudFilmPaid ? '已付费' : '未付费' }}</span>
            </div>
            <div v-if="item.label === '打印限制'">
              <span>{{ row.autoPrint ? '已解除限制' : '已限制打印' }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <ElButton
              text
              size="small"
              :type="scope.row.autoPrint ? 'primary' : 'warning'"
              v-if="isShowPrintBtn"
              style="padding: 5px"
              @click="examPrintRestrict(scope.row)"
              >{{ scope.row.autoPrint ? '解除限制' : '限制打印' }}</ElButton
            >
            <ElButton
              text
              size="small"
              type="success"
              style=" width: 36px;padding: 5px; margin: 0"
              v-if="isShowPayBtn"
              @click="payStatus(scope.row)"
              >{{ scope.row.autoPrint ? '付费' : '未付费' }}</ElButton
            >

            <el-dropdown>
              <el-button
                size="small"
                type="primary"
                text
                class="el-dropdown-link"
                style="padding: 5px; margin: 0"
                :disabled="!scope.row.filmResult?.length && !scope.row.reportExists"
              >
                更多
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    ><ElButton
                      text
                      :disabled="!scope.row.filmResult?.length"
                      size="small"
                      type="primary"
                      plain
                      @click="watchReport(scope.row, 'film')"
                      >查看胶片</ElButton
                    ></el-dropdown-item
                  >
                  <el-dropdown-item
                    ><ElButton
                      text
                      size="small"
                      :disabled="!scope.row.reportExists"
                      type="primary"
                      plain
                      @click="watchReport(scope.row, 'report')"
                      >查看报告</ElButton
                    ></el-dropdown-item
                  >
                  <el-dropdown-item>
                    <ElButton
                      text
                      size="small"
                      type="primary"
                      plain
                      :disabled="!scope.row.reportPrinted"
                      >打印报告</ElButton
                    ></el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="ws-pagination">
        <div class="ws-pagination__left">共 {{ page.total }} 条</div>
        <ElPagination
          v-model:current-page="page.pageNum"
          v-model:page-size="page.pageSize"
          :total="page.total"
          size="small"
          :page-sizes="[10, 20, 50, 100]"
          layout="sizes, prev, pager, next, jumper"
          @current-change="onExamPageChange"
          @size-change="onExamSizeChange"
        />
      </div>
    </ElCard>

    <ElCard shadow="never" class="ws-card card-table">
      <div class="ws-filmHead">
        <div class="ws-filmHead__left">
          <span class="ws-filmHead__title">胶片</span>
          <ElTabs v-model="filmTab" class="ws-filmHead__tabs">
            <ElTabPane label="列表" name="list" />
            <ElTabPane label="缩略图" name="thumb" />
          </ElTabs>
        </div>
        <div class="ws-filmHead__actions">
          <ElButton size="small" @click="toggleSelectUnprinted">{{ btnChoseText }}</ElButton>
          <ElButton size="small" @click="printFilm" type="primary" plain>打印胶片</ElButton>
          <ElButton size="small" @click="openPrinterDialog">修改目的打印机</ElButton>
        </div>
      </div>

      <ElTable
        v-if="filmTab === 'list'"
        ref="filmTableRef"
        row-key="filmBoxID"
        :data="filmTableData"
        :loading="filmTableLoading"
        @selection-change="onFilmTableSelectionChange"
        size="small"
        :style="{ height: 'calc(50vh - 270px)' }"
        class="ws-table card-table"
      >
        <ElTableColumn type="selection" width="42" />
        <ElTableColumn type="index" label="#" width="48" />
        <ElTableColumn prop="taskNo" label="任务号" min-width="110" align="center" />
        <ElTableColumn prop="autoPrint" label="打印状态" min-width="110" align="center">
          <template #default="{ row }">
            <span>{{ row.printState === '2' ? '已打印' : '未打印' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="lastPrintTime" label="胶片打印时间" min-width="140" align="center" />
        <ElTableColumn prop="printer" label="目的打印机" min-width="120" align="center" />
        <ElTableColumn prop="callingAE" label="请求设备" min-width="110" align="center" />
        <ElTableColumn prop="requestTime" label="请求时间" min-width="140" align="center" />
        <ElTableColumn prop="filmSize" label="胶片尺寸" min-width="90" align="center" />
        <ElTableColumn prop="filmOrientation" label="出片方向" min-width="90" align="center" />
        <ElTableColumn prop="filmType" label="胶片类型" min-width="90" align="center" />
        <ElTableColumn
          prop="displayFormat"
          label="显示格式"
          min-width="90"
          align="center"
          show-overflow-tooltip
        />
      </ElTable>
      <div v-else class="ws-thumbWrap">
        <div v-if="filmTableData.length === 0" class="ws-thumbEmpty">
          <div class="ws-thumbEmpty__tip">暂无缩略图</div>
        </div>
        <div v-else class="ws-thumbGrid">
          <div
            v-for="item in filmTableData"
            :key="item.filmBoxID"
            class="ws-thumbItem"
            :class="{ 'is-selected': isFilmSelected(item.filmBoxID) }"
          >
            <img class="ws-thumbImg" :src="getThumbnailSrc(item.thumbnailString)" alt="" />
            <ElCheckbox
              class="ws-thumbCheck"
              :model-value="isFilmSelected(item.filmBoxID)"
              @change="onThumbSelectionChange(item.filmBoxID, $event)"
            />
          </div>
        </div>
      </div>
    </ElCard>
    <el-dialog
      v-model="viewDialogVisible"
      :width="dialogWidth"
      style="height: 100vh"
      class="el-dialog-computer"
      :close-on-click-modal="false"
      @closed="cleanupViewObjectUrls"
    >
      <template #header>
        <div class="viewer-header">
          <div class="viewer-title">{{ viewTitle }}</div>
          <div class="viewer-actions">
            <el-button size="small" @click="openManualMatchDialog()">手工匹配</el-button>
            <el-button size="small" @click="setHandMatchMode('fitHeight')">适应屏幕</el-button>
            <el-button size="small" @click="setHandMatchMode('natural')">原始大小</el-button>
            <el-button
              size="small"
              @click="
                () => {
                  dialogWidth = dialogWidth === '100vw' ? '70vw' : '100vw'
                }
              "
              >{{ dialogWidth === '100vw' ? '还原' : '最大化' }}</el-button
            >
            <el-button
              size="small"
              v-if="dialogType === 'report'"
              plain
              type="danger"
              @click="printOf"
              >打印</el-button
            >
            <el-button size="small" v-else type="danger" plain @click="deleteFilmBtn"
              >删除</el-button
            >
          </div>
        </div>
      </template>

      <div class="viewer-body">
        <div>
          <span @click="changeImgPicture('last')">上一张</span>
          <span @click="changeImgPicture('next')">下一张</span>
        </div>

        <div v-if="viewCurrentSrc" class="viewer-plugin">
          <HandMatchPlugin :src="viewCurrentSrc" :fit-mode="handMatchFitMode" />
        </div>
        <el-empty v-else description="暂无图片" />
      </div>
    </el-dialog>

    <ManualMatchDialog
      v-if="manualMatchDialogVisible"
      v-model="manualMatchDialogVisible"
      :image-url="manualMatchImageUrl"
      @closed="cleanupManualMatchObjectUrl"
      @success="search"
    />
    <!-- 修改目的打印机 -->
    <el-dialog v-model="printerDialogVisible" title="修改目的打印机" width="520">
      <el-form label-width="90px">
        <el-form-item label="目的打印机">
          <el-select
            v-model="selectedPrinterId"
            placeholder="请选择"
            filterable
            clearable
            :loading="printerLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in printerOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="printerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSetPrinter(false)">确定</el-button>
        <el-button type="primary" @click="submitSetPrinter(true)">修改并打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.ws-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 1230px;
  overflow-x: scroll;
}

.ws-card {
  width: 100%;
}

.ws-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.ws-form__row {
  align-items: center;
}

.ws-form__row--more {
  padding-top: 2px;
}

.ws-form__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0;
  width: 100%;
}

.ws-form__more {
  padding: 0 4px;
}

.ws-sectionHead {
  display: flex;
  padding: 0 15px;
  margin-bottom: 10px;
  align-items: center;
  justify-content: space-between;
}

.ws-sectionHead__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.ws-sectionHead__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ws-table :deep(.el-table__empty-text) {
  font-size: 12px;
}

.ws-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 10px;
}

.ws-pagination__left {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.ws-filmHead {
  display: flex;
  padding-right: 15px;
  padding-left: 15px;
  margin-bottom: 10px;
  align-items: center;
  justify-content: space-between;
}

.ws-filmHead__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ws-filmHead__title {
  font-size: 14px;
  font-weight: 700;
}

.ws-filmHead__tabs :deep(.el-tabs__header) {
  margin: 0;
}

.ws-filmHead__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ws-thumbEmpty {
  display: flex;
  height: 230px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 2px;
  align-items: center;
  justify-content: center;
}

.ws-thumbWrap {
  height: calc(50vh - 270px);
  overflow: auto;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 2px;
}

.ws-thumbGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  padding: 8px;
  box-sizing: border-box;
}

.ws-thumbItem {
  position: relative;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 2px;
}

.ws-thumbItem.is-selected {
  border-color: var(--el-color-primary);
}

.ws-thumbImg {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: contain;
}

.ws-thumbCheck {
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 2px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 2px;
}

.ws-thumbCheck :deep(.el-checkbox__label) {
  display: none;
}

.ws-thumbEmpty__tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.ws__divider {
  margin: 0;
}

.ws__todo {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ws__todoItem {
  display: flex;
  width: 100%;
  padding: 10px 12px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  align-items: center;
  justify-content: space-between;
}

.ws__todoItem:hover {
  border-color: var(--el-color-primary);
}

.ws__todoTitle {
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.viewer-body {
  height: calc(100vh - 90px);
  min-height: 520px;
}

.viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.viewer-plugin {
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
}
</style>
