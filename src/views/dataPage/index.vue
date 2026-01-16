<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { formatToDate } from '@/utils/dateUtil'
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
  getDriverInfo,
  getMatFailedCountMsd,
  getPrintFailedCountMsd,
  getServiceStateMsd,
  ServiceEmum,
  startServiceMsd,
  stopServiceMsd
} from '@/api/dataPage'

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

const tableData = ref<any[]>([])
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
onMounted(() => {
  getService()
  driverInfo()
  getPrintFailedCount()
  getMatFailedCount()
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
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="query.matchStatus" placeholder="匹配状态" clearable>
                <el-option label="全部" value="" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="query.printStatus" placeholder="打印状态" clearable>
                <el-option label="全部" value="" />
              </el-select>
            </el-form-item>

            <div class="form-actions">
              <el-button type="primary">查询</el-button>
              <el-button>重置</el-button>
            </div>
          </div>
        </el-form>
      </el-card>
    </div>

    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <div class="table-toolbar-right">
          <el-button size="small" :disabled="true">解除限制</el-button>
          <el-button size="small" :disabled="true">手工匹配</el-button>
          <el-button size="small" :disabled="true">重置匹配</el-button>
          <el-button size="small" :disabled="true">修改打印机</el-button>
          <el-button size="small" :disabled="true">查看</el-button>
          <el-button size="small" :disabled="true">打印</el-button>
          <el-button size="small" :disabled="true">删除</el-button>
        </div>
      </div>

      <el-table :data="tableData" class="data-table" border height="520">
        <el-table-column type="selection" width="40" />
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="taskNo" label="任务号" min-width="130" />
        <el-table-column prop="printStatus" label="打印状态" min-width="110" />
        <el-table-column prop="matchStatus" label="匹配状态" min-width="110" />
        <el-table-column prop="checkNo" label="检查号" min-width="120" />
        <el-table-column prop="patientNo" label="患者编号" min-width="120" />
        <el-table-column prop="device" label="请求设备" min-width="110" />
        <el-table-column prop="requestTime" label="请求时间" min-width="140" />
        <el-table-column prop="checkType" label="检查类型" min-width="110" />
        <el-table-column prop="targetPrinter" label="目的打印机" min-width="120" />
        <el-table-column prop="filmSize" label="胶片尺寸" min-width="110" />
        <el-table-column prop="filmType" label="胶片类型" min-width="110" />
        <el-table-column prop="displayMode" label="显示格式" min-width="110" />
        <el-table-column prop="outputDirection" label="出片方向" min-width="110" />
        <el-table-column prop="limitPrint" label="限制打印" min-width="110" />

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
