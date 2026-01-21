<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { formatToDate } from '@/utils/dateUtil'
import { useCommonStoreWithOut, type ArrList } from '@/store/modules/common'
import type { TableInstance } from 'element-plus'
import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElProgress,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElEmpty,
  ElMessageBox,
  ElMessage
} from 'element-plus'
import {
  DriverSpace,
  FilmBoxListQuery,
  FilmBoxResultItem,
  DicomPeerOption,
  getDriverInfo,
  getDicomPeerDropDown,
  getFilmBoxList,
  getMatFailedCountMsd,
  getPrintFailedCountMsd,
  getServiceStateMsd,
  updateExamPrintRestrict,
  type ExamPrintRestrict,
  ServiceEmum,
  startServiceMsd,
  stopServiceMsd
} from '@/api/dataPage'

const commonStore = useCommonStoreWithOut()
const printStateOptions = computed<ArrList[]>(() => commonStore.printState || [])
const matchStateOptions = computed<ArrList[]>(() => {
  return [...printStateOptions.value, { text: '手工匹配', value: '3' }]
})

const failNumber = reactive({
  matchFailCount: 0,
  printFailCount: 0
})
const driverInfoRef = reactive<DriverSpace>({
  remainSpace: 0,
  totalSpace: 0
})
const usagePercent = computed(() => {
  if (driverInfoRef.totalSpace === 0) {
    return 0
  } else {
    return Math.floor(
      ((driverInfoRef.totalSpace - driverInfoRef.remainSpace) / driverInfoRef.totalSpace) * 100
    )
  }
})

const today = formatToDate()

const query = reactive({
  checkNo: '',
  patientNo: '',
  dateRange: [today, today] as string[],
  device: '',
  matchStatus: '',
  printStatus: ''
})

const tableData = ref<FilmBoxResultItem[]>([])
const tableLoading = ref(false)
const dicomPeerOptions = ref<DicomPeerOption[]>([])
const tableRef = ref<TableInstance>()
const selectedRows = ref<FilmBoxResultItem[]>([])
const hasSelection = computed(() => selectedRows.value.length > 0)
const singleSelectedRow = computed(() => selectedRows.value[0])
const canToggleRestrict = computed(() => selectedRows.value.length === 1)
const restrictActionText = computed(() =>
  singleSelectedRow.value?.autoPrint ? '限制打印' : '解除限制'
)
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const services = ref<ServiceEmum>(ServiceEmum.Stopping)
const changeService = (status: ServiceEmum) => {
  try {
    ElMessageBox.confirm(
      `确定${status === ServiceEmum.Running ? '启动' : '停止'}服务吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      if (status === ServiceEmum.Running) {
        await startServiceMsd()
        ElMessage.success('服务启动成功')
      } else if (status === ServiceEmum.Stopping) {
        await stopServiceMsd()
        ElMessage.success('服务停止成功')
      }
      services.value = status
    })
  } catch (error) {
    console.error(`服务${status === ServiceEmum.Running ? '启动' : '停止'}失败`, error)
  }
}

const getService = async () => {
  const { desc, serviceStatus } = await getServiceStateMsd()
  if (desc) {
    ElMessage.warning(desc)
  }
  services.value = serviceStatus || ServiceEmum.Stopping
}

const driverInfo = async () => {
  const { driverSpace } = await getDriverInfo()
  Object.assign(driverInfoRef, driverSpace)
}

const getPrintFailedCount = async () => {
  const { count } = await getPrintFailedCountMsd()
  failNumber.printFailCount = count
}
const getMatFailedCount = async () => {
  // TODO 获取匹配失败数量接口
  const { count } = await getMatFailedCountMsd()
  failNumber.matchFailCount = count
}

const loadDicomPeerOptions = async () => {
  try {
    const res = await getDicomPeerDropDown()
    dicomPeerOptions.value = res.dicomPeers || []
  } catch (error) {
    console.error('获取请求设备下拉失败', error)
    dicomPeerOptions.value = []
  }
}

const toRangeDateTime = (dateRange: string[]) => {
  const start = dateRange?.[0]
  const end = dateRange?.[1]
  return {
    requestStartDate: start ? `${start} 00:00:00` : '',
    requestEndDate: end ? `${end} 23:59:59` : ''
  }
}

const buildFilmBoxListQuery = (): FilmBoxListQuery => {
  const { requestStartDate, requestEndDate } = toRangeDateTime(query.dateRange)
  return {
    orderInfo: {
      columnName: 'RequestTime',
      orderType: 1
    },
    filmBox: {
      requestStartDate,
      requestEndDate,
      accessionNumber: query.checkNo,
      patientID: query.patientNo,
      dicomPeerId: query.device ? [query.device] : [],
      matchState: query.matchStatus,
      printState: query.printStatus
    },
    pageInfo: {
      pageIndex: currentPage.value,
      pageSize: pageSize.value,
      count: 0
    }
  }
}

const search = async () => {
  tableLoading.value = true
  try {
    const res = await getFilmBoxList(buildFilmBoxListQuery())
    if (res.desc) {
      ElMessage.warning(res.desc)
    }
    tableData.value = res.filmBoxResult || []
    total.value = res.pageInfo?.count ?? 0
  } catch (error) {
    console.error('获取胶片列表失败', error)
    ElMessage.error('获取胶片列表失败')
  } finally {
    tableLoading.value = false
  }
}

const reset = () => {
  query.checkNo = ''
  query.patientNo = ''
  query.dateRange = [today, today]
  query.device = ''
  query.matchStatus = ''
  query.printStatus = ''
  currentPage.value = 1
  search()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  search()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  search()
}

const handleSelectionChange = (rows: FilmBoxResultItem[]) => {
  selectedRows.value = rows
}

const handleRowClick = (row: FilmBoxResultItem) => {
  const table = tableRef.value
  if (!table) return
  const isSelected = selectedRows.value.some((r) => r.filmBoxID === row.filmBoxID)
  table.clearSelection()
  if (!isSelected) {
    table.toggleRowSelection(row, true)
  }
}

const togglePrintRestrict = async () => {
  if (!canToggleRestrict.value || !singleSelectedRow.value) return

  try {
    await ElMessageBox.confirm('是否确定更新限制状态?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const flag = restrictActionText.value === '限制打印'
    const payload: ExamPrintRestrict = {
      accessionNumber: singleSelectedRow.value.accessionNumber,
      flag
    }

    await updateExamPrintRestrict(payload)
    ElMessage.success('更新成功')
    await search()
  } catch (error) {
    // 取消确认框时不提示错误
    if (error !== 'cancel' && error !== 'close') {
      console.error('更新限制状态失败', error)
      ElMessage.error('更新限制状态失败')
    }
  }
}
onMounted(() => {
  getService()
  driverInfo()
  getPrintFailedCount()
  getMatFailedCount()
  loadDicomPeerOptions()
  search()
})
</script>

<template>
  <div class="data-page">
    <div class="top-grid">
      <el-card shadow="never" class="status-card">
        <div class="status-content">
          <div class="progress-wrap">
            <el-progress type="circle" :percentage="usagePercent" :width="120" :stroke-width="8" />
          </div>
          <div class="status-info">
            <div class="status-row">
              <div class="stat">
                <div class="stat-label">总容量：</div>
                <div class="stat-value">{{ driverInfoRef.totalSpace }}G</div>
              </div>
              <div class="stat">
                <div class="stat-label">可用空间：</div>
                <div class="stat-value">{{ driverInfoRef.remainSpace }}G</div>
              </div>
            </div>
            <div class="status-row">
              <div class="stat">
                <div class="stat-label">匹配失败：</div>
                <div class="stat-value stat-value--primary">{{ failNumber.matchFailCount }}</div>
              </div>
              <div class="stat">
                <div class="stat-label">打印失败：</div>
                <div class="stat-value stat-value--primary">{{ failNumber.printFailCount }}</div>
              </div>
            </div>

            <div class="status-actions">
              <el-button
                :disabled="services === ServiceEmum.Running"
                @click="changeService(ServiceEmum.Running)"
                >服务启动</el-button
              >
              <el-button
                :disabled="services === ServiceEmum.Stopping"
                @click="changeService(ServiceEmum.Stopping)"
                type="primary"
                >服务关闭</el-button
              >
            </div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="search-card">
        <el-form class="search-form" :model="query" label-width="0">
          <div class="form-grid">
            <el-form-item>
              <el-input v-model="query.checkNo" placeholder="检查号" clearable />
            </el-form-item>
            <el-form-item>
              <el-input v-model="query.patientNo" placeholder="患者编号" clearable />
            </el-form-item>
            <el-form-item class="date-range">
              <el-date-picker
                v-model="query.dateRange"
                type="daterange"
                range-separator="至"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item>
              <el-select v-model="query.device" placeholder="请求设备" clearable>
                <el-option label="全部" value="" />
                <el-option
                  v-for="item in dicomPeerOptions"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="query.matchStatus" placeholder="匹配状态" clearable>
                <el-option label="全部" value="" />
                <el-option
                  v-for="item in matchStateOptions"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="query.printStatus" placeholder="打印状态" clearable>
                <el-option label="全部" value="" />
                <el-option
                  v-for="item in printStateOptions"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <div class="form-actions">
              <el-button type="primary" @click="search">查询</el-button>
              <el-button @click="reset">重置</el-button>
            </div>
          </div>
        </el-form>
      </el-card>
    </div>

    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <div class="table-toolbar-right">
          <el-button size="small" :disabled="!canToggleRestrict" @click="togglePrintRestrict">
            {{ restrictActionText }}
          </el-button>
          <el-button size="small" :disabled="!hasSelection">手工匹配</el-button>
          <el-button size="small" :disabled="!hasSelection">重置匹配</el-button>
          <el-button size="small" :disabled="!hasSelection">修改打印机</el-button>
          <el-button size="small" :disabled="!hasSelection">查看</el-button>
          <el-button size="small" :disabled="!hasSelection">打印</el-button>
          <el-button size="small" :disabled="!hasSelection">删除</el-button>
        </div>
      </div>

      <el-table
        ref="tableRef"
        v-loading="tableLoading"
        :data="tableData"
        class="data-table"
        border
        height="520"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="40" fixed="left" />
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="taskNo" label="任务号" min-width="130" />
        <el-table-column prop="printState" label="打印状态" min-width="110" />
        <el-table-column prop="matchState" label="匹配状态" min-width="110" />
        <el-table-column prop="accessionNumber" label="检查号" min-width="120" />
        <el-table-column prop="patientID" label="患者编号" min-width="120" />
        <el-table-column prop="callingAE" label="请求设备" min-width="110" />
        <el-table-column prop="requestTime" label="请求时间" min-width="140" />
        <el-table-column prop="examineType" label="检查类型" min-width="110" />
        <el-table-column prop="printer" label="目的打印机" min-width="120" />
        <el-table-column prop="filmSize" label="胶片尺寸" min-width="110" />
        <el-table-column prop="mediumType" label="胶片类型" min-width="110" />
        <el-table-column prop="displayFormat" label="显示格式" min-width="110" />
        <el-table-column prop="filmOrientation" label="出片方向" min-width="110" />
        <el-table-column prop="filmOrientation" label="胶片费用" min-width="110" />

        <el-table-column prop="autoPrint" label="限制打印" min-width="110">
          <template #default="scope">
            <template v-if="scope.row.autoPrint">未限制</template>
            <template v-else>限制打印</template>
          </template>
        </el-table-column>

        <template #empty>
          <div class="table-empty">
            <el-empty description="暂无数据" />
          </div>
        </template>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.data-page {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.top-grid {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 10px;
}

@media (width <= 1100px) {
  .top-grid {
    grid-template-columns: 1fr;
  }
}

.status-card :deep(.el-card__body),
.search-card :deep(.el-card__body),
.table-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.progress-wrap {
  flex: none;
}

.status-info {
  flex: 1;
  min-width: 0;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.status-row + .status-row {
  margin-top: 10px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.stat-label {
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.stat-value {
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.stat-value--primary {
  color: var(--el-color-primary);
}

.status-actions {
  display: flex;
  margin-top: 12px;
  align-items: center;
  gap: 16px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr auto;
  gap: 12px 14px;
  align-items: center;
}

@media (width <= 1100px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .date-range,
  .form-actions {
    grid-column: auto;
  }
}

.date-range {
  grid-column: 3 / 5;
}

.date-range :deep(.el-date-editor) {
  width: 100%;
}

.form-actions {
  grid-column: 4 / 5;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.table-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.table-toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.data-table {
  width: 100%;
}

.table-empty {
  padding: 60px 0;
}

.pagination-wrap {
  display: flex;
  margin-top: 10px;
  justify-content: flex-end;
}
</style>
