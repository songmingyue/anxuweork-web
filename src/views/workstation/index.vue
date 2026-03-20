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
import { ArrowDown, ArrowLeftBold, ArrowRightBold } from '@element-plus/icons-vue'
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
const printingReport = ref(false)
const reportPrintObjectUrls = ref<string[]>([])

const cleanupReportPrintObjectUrls = () => {
  reportPrintObjectUrls.value.forEach((url) => URL.revokeObjectURL(url))
  reportPrintObjectUrls.value = []
}

const getAuthToken = () => {
  try {
    const userMsg = JSON.parse(localStorage.getItem('userMsg') || '{}')
    return String(userMsg?.token || '')
  } catch {
    return ''
  }
}

const getReportUrlBase = () => {
  const envBase = String(import.meta.env.VITE_API_BASE_PATH || '').trim()
  return envBase || window.location.origin
}

const resolveReportUrl = (input: string) => {
  const raw = String(input || '').trim()
  if (!raw) return ''
  if (raw.startsWith('data:image/') || raw.startsWith('blob:')) return raw
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('//')) return `${window.location.protocol}${raw}`
  try {
    return new URL(raw, getReportUrlBase()).toString()
  } catch {
    return raw
  }
}

const fetchReportImgAsObjectUrl = async (url: string) => {
  const token = getAuthToken()
  const headers: Record<string, string> = {}
  if (token) headers.authorization = token

  const res = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include'
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const contentType = String(res.headers.get('content-type') || '').toLowerCase()
  if (!contentType.startsWith('image/') && !contentType.includes('octet-stream')) {
    throw new Error(`Unexpected content-type: ${contentType || 'unknown'}`)
  }

  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  reportPrintObjectUrls.value.push(objectUrl)
  return objectUrl
}

const toPrintableReportImgSrc = async (src: string) => {
  const normalized = String(src || '')
  if (!normalized) return ''
  if (normalized.startsWith('data:image/') || normalized.startsWith('blob:')) return normalized

  const url = resolveReportUrl(normalized)
  try {
    return await fetchReportImgAsObjectUrl(url)
  } catch {
    return url
  }
}

const getReportImgSrc = (img: string) => {
  const raw = (img || '').trim().replace(/\s+/g, '')
  if (!raw) return ''
  if (raw.startsWith('data:image/') || raw.startsWith('blob:')) return raw
  if (/^https?:\/\//i.test(raw) || raw.startsWith('//')) return resolveReportUrl(raw)

  const isJpegBase64 = raw.startsWith('/9j/')
  const isPngBase64 = raw.startsWith('iVBOR')
  const isGifBase64 = raw.startsWith('R0lGOD')
  const isWebpBase64 = raw.startsWith('UklGR')
  const isBmpBase64 = raw.startsWith('Qk0')

  // TIFF 常见 base64 头：SUkq(小端), TU0A(大端)
  const isTiffBase64 = raw.startsWith('SUkq') || raw.startsWith('TU0A')

  if (isJpegBase64 || isPngBase64 || isGifBase64 || isWebpBase64 || isBmpBase64 || isTiffBase64) {
    const mime = isJpegBase64
      ? 'image/jpeg'
      : isPngBase64
        ? 'image/png'
        : isGifBase64
          ? 'image/gif'
          : isWebpBase64
            ? 'image/webp'
            : isBmpBase64
              ? 'image/bmp'
              : 'image/tiff'
    return `data:${mime};base64,${raw}`
  }

  if (raw.startsWith('/') || raw.startsWith('./') || raw.startsWith('../'))
    return resolveReportUrl(raw)

  // 兼容接口返回相对路径（不带 / 开头）的情况：不要误判成 base64
  if (raw.includes('?') || raw.includes('#') || raw.includes('.')) return resolveReportUrl(raw)
  if (raw.includes('/')) {
    const base64Like = /^[A-Za-z0-9+/=]+$/.test(raw)
    if (!base64Like || raw.length <= 200) return resolveReportUrl(raw)
  }
  return `data:image/jpeg;base64,${raw}`
}

const escapeHtmlAttr = (text: string) =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const buildReportPrintHtml = (imageSrcList: string[], title: string) => {
  const pages = imageSrcList
    .map(
      (src) =>
        `<div class="page"><img class="img" src="${escapeHtmlAttr(src)}" alt="" loading="eager" /></div>`
    )
    .join('')

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtmlAttr(title)}</title>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      @page { margin: 0; }
      .page {
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        page-break-after: always;
        break-after: page;
      }
      .page:last-child { page-break-after: auto; break-after: auto; }
      .img {
        display: block;
        width: auto;
        height: auto;
        max-width: 100%;
        max-height: 95vh;
        object-fit: contain;
      }
    </style>
  </head>
  <body>${pages}</body>
</html>`
}

const createHiddenPrintIframe = () => {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.left = '-100000px'
  iframe.style.top = '0'
  // 保持一个实际尺寸，避免浏览器因为 0x0/hidden 而不加载后续图片
  iframe.style.width = '210mm'
  iframe.style.height = '297mm'
  iframe.style.border = '0'
  iframe.style.opacity = '0'
  iframe.style.pointerEvents = 'none'
  return iframe
}

const waitForIframeImages = async (iframe: HTMLIFrameElement, timeoutMs = 60_000) => {
  const doc = iframe.contentDocument
  if (!doc) return
  const images = Array.from(doc.images || []) as HTMLImageElement[]
  if (!images.length) return

  const waitOne = (img: HTMLImageElement) =>
    new Promise<void>((resolve) => {
      if (img.complete) return resolve()
      const done = () => resolve()
      img.addEventListener('load', done, { once: true })
      img.addEventListener('error', done, { once: true })
    })

  await Promise.race([
    Promise.all(images.map(waitOne)),
    new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs))
  ])

  const decodeTasks = images
    .filter((img) => img.complete && img.naturalWidth > 0 && typeof img.decode === 'function')
    .map((img) => img.decode().catch(() => undefined))

  if (decodeTasks.length) {
    await Promise.race([
      Promise.all(decodeTasks).then(() => undefined),
      new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs))
    ])
  }
}

const printReportByIframe = async (imageSrcList: string[], title: string) => {
  const iframe = createHiddenPrintIframe()
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) {
    iframe.remove()
    throw new Error('打印组件初始化失败')
  }

  doc.open()
  doc.write(buildReportPrintHtml(imageSrcList, title))
  doc.close()

  await waitForIframeImages(iframe)
  await new Promise<void>((resolve) => window.setTimeout(resolve, 50))

  await new Promise<void>((resolve) => {
    let cleaned = false
    const cleanup = () => {
      if (cleaned) return
      cleaned = true
      try {
        iframe.remove()
      } catch {
        // ignore
      }
      resolve()
    }

    const onAfterPrint = () => {
      window.removeEventListener('afterprint', onAfterPrint)
      cleanup()
    }

    // 部分浏览器 afterprint 只会在父窗口触发
    window.addEventListener('afterprint', onAfterPrint)
    win.onafterprint = onAfterPrint

    // 兜底：避免 afterprint 不触发导致 iframe 残留
    window.setTimeout(() => {
      window.removeEventListener('afterprint', onAfterPrint)
      cleanup()
    }, 5 * 60_000)

    try {
      win.focus()
      win.print()
    } catch {
      window.removeEventListener('afterprint', onAfterPrint)
      cleanup()
    }
  })
}

const printReport = async (row: TExamResult) => {
  if (printingReport.value) return
  const accessionNumber = String(row?.accessionNumber || '').trim()
  if (!accessionNumber) {
    ElMessage.warning('检查号为空')
    return
  }

  printingReport.value = true
  try {
    const { reportImg, status } = await getReportListByAccNum({
      accessionNumber
    })

    if (status !== 0) {
      ElMessage.error('获取报告失败')
      printingReport.value = false
      return
    }

    const srcList = (reportImg || []).map(getReportImgSrc).filter(Boolean)
    if (!srcList.length) {
      ElMessage.warning('暂无报告')
      printingReport.value = false
      return
    }

    await ElMessageBox.confirm(
      `当前选择 1 个检查，共计 ${srcList.length} 个报告，是否确认全部打印？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    cleanupReportPrintObjectUrls()
    const printable = (await Promise.all(srcList.map((s) => toPrintableReportImgSrc(s)))).filter(
      Boolean
    )

    // 使用隐藏 iframe 打印（不新开页面）
    await printReportByIframe(printable, `报告-${accessionNumber}`)
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('打印报告失败', error)
      ElMessage.error('打印报告失败')
    }
  } finally {
    printingReport.value = false
    cleanupReportPrintObjectUrls()
  }
}

const deleteFilmBtn = () => {
  ElMessageBox.confirm('确认删除该胶片吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      if (activedRow.value) {
        await deleteFilm({
          filmBoxID: activedRow.value?.filmResult[viewActiveIndex.value].filmBoxID
        })
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
    const filmList = row?.filmResult || []
    if (!filmList.length) {
      ElMessage.warning('暂无胶片')
      return
    }

    const results = await Promise.allSettled(
      filmList.map(async (film) => {
        const filmBoxID = String(film?.filmBoxID || '').trim()
        if (!filmBoxID) return ''
        const buffer = await getImageByFilmBox(filmBoxID)
        return ImageBlobUrl(buffer)
      })
    )

    const urls = results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
      .map((r) => r.value)
      .filter(Boolean)

    const failedCount = results.filter((r) => r.status === 'rejected').length
    if (failedCount > 0) {
      ElMessage.warning(`部分胶片获取失败（${failedCount}/${filmList.length}）`)
    }

    if (!urls.length) {
      ElMessage.error('获取胶片失败')
      return
    }

    viewObjectUrls.value = urls
    viewUrlList.value = urls
  } else {
    const { reportImg } = await getReportListByAccNum({
      accessionNumber: row.accessionNumber
    })
    viewUrlList.value = (reportImg || []).map(getReportImgSrc).filter(Boolean)
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
      const { status } = await updateFilmPaidTag({
        accessionNumberList: [row.accessionNumber],
        paidTag: !row.cloudFilmPaid
      })
      if (status === 0) {
        await onSearch()
      } else {
        ElMessage.error('状态修改失败')
      }
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
      const { status } = await updateExamPrintRestrict({
        accessionNumber: row.accessionNumber,
        flag: !row.autoPrint
      })
      if (status === 0) {
        await onSearch()
      } else {
        ElMessage.error('状态修改失败')
      }
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
              <ElSelect
                v-model="query.examType"
                placeholder="检查类型"
                collapse-tags
                multiple
                clearable
              >
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
              <ElSelect
                v-model="query.patientType"
                collapse-tags
                placeholder="就诊类别"
                multiple
                clearable
              >
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
              <ElSelect v-model="query.areaNo" multiple placeholder="申请科室" clearable>
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
              style="width: 36px; padding: 5px; margin: 0"
              v-if="isShowPayBtn"
              @click="payStatus(scope.row)"
              >{{ scope.row.cloudFilmPaid ? '未付费' : '付费' }}</ElButton
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
                      :disabled="!scope.row.reportExists"
                      @click="printReport(scope.row)"
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
        <div v-if="viewUrlList.length > 1" class="viewer-nav">
          <div class="viewer-nav__item">
            <el-button
              class="viewer-nav__circle"
              circle
              :icon="ArrowLeftBold"
              :disabled="viewActiveIndex === 0"
              @click="changeImgPicture('last')"
            />
            <div class="viewer-nav__label">上一张</div>
          </div>
          <div class="viewer-nav__item">
            <el-button
              class="viewer-nav__circle"
              circle
              :icon="ArrowRightBold"
              :disabled="viewActiveIndex >= viewUrlList.length - 1"
              @click="changeImgPicture('next')"
            />
            <div class="viewer-nav__label">下一张</div>
          </div>
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
  position: relative;
  height: calc(100vh - 90px);
  min-height: 520px;
}

.viewer-nav {
  position: absolute;
  top: 78px;
  right: 24px;
  z-index: 10;
  display: -webkit-box;
  display: flex;
  display: flex;
  padding: 10px 14px;

  /* background: var(--el-mask-color); */
  pointer-events: none;
  background: #00000059;
  border-radius: 8px;
  transform: translateY(-50%);
  transform: translateY(-50%);
  -webkit-box-align: center;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  flex-direction: column;
  flex-direction: column;
  align-items: center;
  align-items: center;
  gap: 14px;
}

.viewer-nav__item {
  display: flex;
  pointer-events: auto;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.viewer-nav__circle {
  width: 26px;
  height: 26px;
  padding: 0;
  color: var(--el-color-white);
  background: transparent;
  border-color: var(--el-color-white);
  border-width: 2px;
  border-radius: 13px !important;
}

.viewer-nav__circle:hover,
.viewer-nav__circle:focus,
.viewer-nav__circle:active {
  color: var(--el-color-white);
  background: transparent;
  border-color: var(--el-color-white);
}

.viewer-nav__circle :deep(.el-icon) {
  font-size: 18px;
}

.viewer-nav__circle.is-disabled {
  opacity: 0.45;
}

.viewer-nav__circle.is-disabled:hover,
.viewer-nav__circle.is-disabled:focus,
.viewer-nav__circle.is-disabled:active {
  color: var(--el-color-white);
  background: transparent;
  border-color: var(--el-color-white);
}

.viewer-nav__label {
  font-size: 12px;
  line-height: 1;
  color: var(--el-color-white);
  user-select: none;
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
