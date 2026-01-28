<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import {
  ElButton,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElSelect,
  ElTable,
  ElDialog,
  ElTableColumn,
  ElMessage,
  ElPagination
} from 'element-plus'
import CoMedicalImageViewerLeft from '@/components/coMedicalImageViewerLeft/index.vue'

import { useCommonStoreWithOut } from '@/store/modules/common'
import {
  getDicomPeerDropDown,
  getFilmBoxInMatch,
  getImageByFilmBox,
  getExamByAccNumOrPatientID,
  doManualMatch,
  type DicomPeerOption,
  type ExamStudyItem,
  type FilmBoxInMatchItem,
  type GetFilmBoxInMatchQuery
} from '@/api/dataPage'

interface Props {
  modelValue: boolean
  taskNo?: number | string
  accessionNumber?: string
  imageUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  taskNo: '',
  accessionNumber: '',
  imageUrl: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'closed'): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

const commonStore = useCommonStoreWithOut()
const matchStateOptions = computed(() => commonStore.matchState || [])

const loadingDevice = ref(false)
const deviceOptions = ref<DicomPeerOption[]>([])

const filter = reactive({
  dateRange: [] as string[],
  matchState: '',
  device: '',
  taskNo: '' as string,
  accessionNumber: '' as string
})

const tableLoading = ref(false)
const filmList = ref<FilmBoxInMatchItem[]>([])
const pageInfo = reactive({
  pageIndex: 1,
  pageSize: 10,
  count: 0
})

const filmTableRef = ref<InstanceType<typeof ElTable> | null>(null)
const currentFilmBoxID = ref('')
const currentImageUrl = ref('')
const currentImageObjectUrl = ref<string | null>(null)

const examTableRef = ref<InstanceType<typeof ElTable> | null>(null)
const examLoading = ref(false)
const examFilter = reactive({
  accessionNumber: '',
  patientID: ''
})
const examList = ref<ExamStudyItem[]>([])
const currentStudyID = ref('')

const cleanupImageObjectUrl = () => {
  if (currentImageObjectUrl.value) {
    URL.revokeObjectURL(currentImageObjectUrl.value)
    currentImageObjectUrl.value = null
  }
}

const normalizeImageUrl = (imgData: any): string => {
  const imgBlob = new Blob([imgData], { type: 'image/png' })
  return URL.createObjectURL(imgBlob)
}

const loadImageByFilmBoxID = async (filmBoxID: string) => {
  if (!filmBoxID) return
  try {
    cleanupImageObjectUrl()
    const res = await getImageByFilmBox(filmBoxID)
    const url = normalizeImageUrl(res)
    currentImageObjectUrl.value = url
    currentImageUrl.value = url
  } catch (error) {
    console.error('获取图片失败', error)
    ElMessage.error('获取图片失败')
  }
}

const setCurrentFilmRow = async (row: FilmBoxInMatchItem | null) => {
  const nextId = row?.filmBoxID || ''
  if (nextId && nextId === currentFilmBoxID.value) return

  currentFilmBoxID.value = nextId
  if (!row) return
  await loadImageByFilmBoxID(nextId)
}

const loadDeviceOptions = async () => {
  if (loadingDevice.value) return
  loadingDevice.value = true
  try {
    const res = await getDicomPeerDropDown()
    deviceOptions.value = res.dicomPeers || []
  } catch (error) {
    console.error('获取请求设备下拉失败', error)
    deviceOptions.value = []
  } finally {
    loadingDevice.value = false
  }
}

watch(
  () => props.modelValue,
  async (val) => {
    if (!val) {
      cleanupImageObjectUrl()
      currentFilmBoxID.value = ''
      currentImageUrl.value = ''
      examFilter.accessionNumber = ''
      examFilter.patientID = ''
      examList.value = []
      currentStudyID.value = ''
      return
    }
    filter.taskNo = props.taskNo == null ? '' : String(props.taskNo)
    filter.accessionNumber = props.accessionNumber == null ? '' : String(props.accessionNumber)
    examFilter.accessionNumber = props.accessionNumber == null ? '' : String(props.accessionNumber)
    currentImageUrl.value = props.imageUrl || ''
    if (deviceOptions.value.length === 0) {
      await loadDeviceOptions()
    }
    pageInfo.pageIndex = 1
    await handleQuery()
  },
  { immediate: true }
)

const handleQuery = async () => {
  if (tableLoading.value) return
  tableLoading.value = true
  try {
    const payload: GetFilmBoxInMatchQuery = {
      manualMatch: {
        matchState: filter.matchState || '',
        taskNo: filter.taskNo ?? '',
        dicomPeerId: filter.device || '',
        accessionNumber: filter.accessionNumber || '',
        startDate: filter.dateRange && filter.dateRange[0] ? filter.dateRange[0] + ' 00:00:00' : '',
        endDate: filter.dateRange && filter.dateRange[1] ? filter.dateRange[1] + ' 23:59:59' : ''
      },
      pageInfo: {
        pageIndex: pageInfo.pageIndex,
        pageSize: pageInfo.pageSize
      }
    }

    const res = await getFilmBoxInMatch(payload)
    if (res.status !== 0) {
      ElMessage.error(res.desc || '查询失败')
      filmList.value = []
      pageInfo.count = 0
      return
    }

    filmList.value = res.film || []
    pageInfo.count = res.pageInfo?.count ?? 0

    await nextTick()
    if (filmList.value.length > 0) {
      const first = filmList.value[0]
      filmTableRef.value?.setCurrentRow(first)
      await setCurrentFilmRow(first)
    } else {
      currentFilmBoxID.value = ''
      cleanupImageObjectUrl()
      currentImageUrl.value = props.imageUrl || ''
    }
  } catch (error) {
    console.error('查询手工匹配列表失败', error)
    ElMessage.error('查询失败')
    filmList.value = []
    pageInfo.count = 0
  } finally {
    tableLoading.value = false
  }
}

const handleSearch = async () => {
  // 顶部胶片列表查询
  pageInfo.pageIndex = 1
  await handleQuery()
}

const handleExamSearch = async () => {
  if (examLoading.value) return
  if (!examFilter.accessionNumber && !examFilter.patientID) {
    ElMessage.warning('请输入检查号或患者编号')
    return
  }
  examLoading.value = true
  try {
    const res = await getExamByAccNumOrPatientID({
      accessionNumber: examFilter.accessionNumber,
      patientID: examFilter.patientID
    })
    if (res.status !== 0) {
      ElMessage.error(res.desc || '查询失败')
      examList.value = []
      currentStudyID.value = ''
      return
    }
    examList.value = res.study || []

    await nextTick()
    if (examList.value.length > 0) {
      const first = examList.value[0]
      currentStudyID.value = first.studyID
      examTableRef.value?.setCurrentRow(first)
    } else {
      currentStudyID.value = ''
    }
  } catch (error) {
    console.error('查询检查信息失败', error)
    ElMessage.error('查询失败')
    examList.value = []
    currentStudyID.value = ''
  } finally {
    examLoading.value = false
  }
}

const handlePageChange = async (page: number) => {
  pageInfo.pageIndex = page
  await handleQuery()
}

const handlePageSizeChange = async (size: number) => {
  pageInfo.pageSize = size
  pageInfo.pageIndex = 1
  await handleQuery()
}

const handleFilmRowClick = async (row: FilmBoxInMatchItem) => {
  await setCurrentFilmRow(row)
}

const handleExamRowClick = async (row: ExamStudyItem) => {
  currentStudyID.value = row.studyID
  await nextTick()
  examTableRef.value?.setCurrentRow(row)
}

const handleMatch = async () => {
  const filmBoxID = currentFilmBoxID.value
  const exam = examList.value.find((s) => s.studyID === currentStudyID.value)

  if (!filmBoxID) {
    ElMessage.warning('请先选择一条胶片')
    return
  }
  if (!exam?.accessionNumber) {
    ElMessage.warning('请先选择一条检查')
    return
  }

  try {
    const res = await doManualMatch({
      accessionNumber: exam.accessionNumber,
      filmBoxID
    })
    if (res.status === 0) {
      ElMessage.success('匹配成功')
      // await handleQuery()
      emit('success')
    } else {
      ElMessage.error(res.desc || '匹配失败')
    }
  } catch (error) {
    console.error('手工匹配失败', error)
    ElMessage.error('匹配失败')
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="手工匹配"
    width="92vw"
    top="4vh"
    class="manual-match-dialog"
    :close-on-click-modal="false"
    @closed="emit('closed')"
  >
    <div class="mm-body">
      <div class="mm-left">
        <CoMedicalImageViewerLeft :image-url="currentImageUrl" />
      </div>

      <div class="mm-right">
        <el-form label-width="0px" :inline="true" class="form-computer-inline">
          <el-form-item>
            <el-date-picker
              v-model="filter.dateRange"
              style="width: 320px"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-form-item class="mm-item">
            <el-select
              v-model="filter.matchState"
              placeholder="匹配状态"
              style="width: 150px"
              clearable
            >
              <el-option
                v-for="item in matchStateOptions"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item class="mm-item">
            <el-select
              v-model="filter.device"
              placeholder="请求设备"
              style="width: 150px"
              clearable
              filterable
              :loading="loadingDevice"
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="item in deviceOptions"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item class="mm-item mm-item--task">
            <el-input v-model="filter.taskNo" style="width: 150px" clearable placeholder="任务号" />
          </el-form-item>

          <el-form-item class="mm-item">
            <el-input
              style="width: 150px"
              v-model="filter.accessionNumber"
              clearable
              placeholder="检查号"
            />
          </el-form-item>
          <el-form-item
            ><el-button type="primary" @click="handleSearch">查询</el-button></el-form-item
          >
        </el-form>

        <el-table
          ref="filmTableRef"
          class="mm-film-table"
          :data="filmList"
          border
          height="240"
          v-loading="tableLoading"
          row-key="filmBoxID"
          highlight-current-row
          :current-row-key="currentFilmBoxID"
          @row-click="handleFilmRowClick"
        >
          <el-table-column type="index" label="#" width="60" />
          <el-table-column prop="taskNo" label="任务号" min-width="90" />
          <el-table-column prop="requestTime" label="请求时间" min-width="120" />
          <el-table-column prop="filmSize" label="规格大小" min-width="120" />
          <el-table-column prop="peerDes" label="设备描述" min-width="120" />
          <el-table-column prop="callingAE" label="请求设备" min-width="120" />
          <el-table-column prop="accessionNumber" label="检查号" min-width="120" />
        </el-table>

        <el-pagination
          class="mm-pagination"
          background
          :disabled="tableLoading"
          v-model:current-page="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          size="small"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageInfo.count"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />

        <div class="mm-bottom">
          <el-form label-width="70px">
            <div class="mm-filter-row mm-filter-row--compact">
              <el-form-item label="检查号" class="mm-item">
                <el-input v-model="examFilter.accessionNumber" clearable placeholder="请输入" />
              </el-form-item>
              <el-form-item label="患者编号" class="mm-item">
                <el-input v-model="examFilter.patientID" clearable placeholder="请输入" />
              </el-form-item>
              <div class="mm-filter-actions">
                <el-button type="primary" :loading="examLoading" @click="handleExamSearch"
                  >查询</el-button
                >
                <el-button type="success" @click="handleMatch">匹配</el-button>
              </div>
            </div>
          </el-form>

          <el-table
            ref="examTableRef"
            class="mm-exam-table"
            :data="examList"
            border
            height="240"
            v-loading="examLoading"
            row-key="studyID"
            highlight-current-row
            :current-row-key="currentStudyID"
            @row-click="handleExamRowClick"
          >
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="accessionNumber" label="检查号" min-width="120" />
            <el-table-column prop="patientID" label="患者编号" min-width="120" />
            <el-table-column prop="patientName" label="姓名" min-width="100" />
            <el-table-column prop="patientSex" label="性别" min-width="80" />
            <el-table-column prop="age" label="年龄" min-width="80" />
            <el-table-column prop="examineType" label="检查类型" min-width="120" />
            <el-table-column prop="examineDate" label="检查时间" min-width="160" />
            <el-table-column prop="examinePart" label="检查部位" min-width="120" />
            <el-table-column prop="patientType" label="就诊类别" min-width="120" />
          </el-table>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.mm-body {
  display: flex;
  gap: 12px;
  height: 80vh;
  min-height: 640px;
}

.mm-left {
  position: relative;
  z-index: 99;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  flex: 0 0 56%;
}

.mm-right {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 10px;
}

.mm-pagination {
  display: flex;
  margin-top: 6px;
  justify-content: flex-end;
}

.mm-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
  align-items: center;
}

.mm-item--date {
  flex: 2 1 0;
  min-width: 0;
}

.mm-item--task {
  flex: 1 1 0;
  min-width: 0;
}

.mm-filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;
  flex: 0 0 auto;
  margin-left: auto;
}

.mm-bottom {
  display: flex;
  margin-top: 6px;
  flex-direction: column;
  gap: 10px;
}

/* 只展示 MedicalImageViewer 左侧（隐藏右侧占位面板） */
.manual-match-dialog :deep(.miv-right) {
  display: none;
}

.manual-match-dialog :deep(.miv-left) {
  width: 100%;
}

.manual-match-dialog :deep(.mm-film-table .el-table__body tr.current-row > td) {
  background-color: var(--el-color-primary-light-9);
}

.manual-match-dialog :deep(.mm-film-table .el-table__body tr.current-row:hover > td) {
  background-color: var(--el-color-primary-light-8);
}

.manual-match-dialog :deep(.mm-exam-table .el-table__body tr.current-row > td) {
  background-color: var(--el-color-success-light-9);
}

.manual-match-dialog :deep(.mm-exam-table .el-table__body tr.current-row:hover > td) {
  background-color: var(--el-color-success-light-8);
}
</style>
