<template>
  <div class="plugin-config">
    <!-- 上：服务（有分页） -->
    <el-card>
      <el-button type="primary" @click="onCreateService">新增服务</el-button>
    </el-card>
    <el-card shadow="never" class="mb8">
      <el-table
        :data="serviceList"
        v-loading="svcLoading"
        border
        highlight-current-row
        @row-click="onServiceRowClick"
        height="273"
        class="mt8"
      >
        <el-table-column prop="uid" label="服务UID" min-width="200" />
        <el-table-column prop="groupName" label="任务组名" min-width="200" />
        <el-table-column prop="status" label="运行状态" width="120" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="onEditService(row)">编辑</el-button>
            <el-button link type="danger" @click.stop="onDeleteService(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="serviceTotal"
          :page-size="serviceSize"
          :current-page="servicePage"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="onSvcPageChange"
          @size-change="onSvcSizeChange"
        />
      </div>
    </el-card>

    <!-- 下：任务（不分页） -->
    <el-card shadow="never">
      <div class="flex">
        <el-button type="primary" @click="onCreateTask">新增任务</el-button>
        <span style="margin-left: 12px; color: #909399" v-if="activeService">
          当前服务：{{ activeService.groupName }}（{{ activeService.uid }}）
        </span>
      </div>

      <el-table :data="taskList" v-loading="taskLoading" border class="mt8">
        <el-table-column prop="uid" label="任务UID" min-width="160" />
        <el-table-column prop="name" label="任务名称" min-width="200" />
        <el-table-column prop="interval" label="触发间隔" min-width="120" />
        <el-table-column prop="times" label="触发次数" min-width="120" />
        <el-table-column prop="byTime" label="是否根据时间触发" min-width="150" />
        <el-table-column prop="startTime" label="触发开始时间" min-width="140" />
        <el-table-column prop="endTime" label="触发结束时间" min-width="140" />
        <el-table-column prop="byDate" label="是否根据日期触发" min-width="150" />
        <el-table-column prop="startDate" label="触发开始日期" min-width="160" />
        <el-table-column prop="state" label="状态" width="100" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="ElMessage.info(row)">编辑</el-button>
            <el-button link type="danger" @click.stop="ElMessage.info('删除任务')">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 下表不分页：不渲染 el-pagination -->
    </el-card>

    <!-- 新增服务对话框 -->
    <ServiceConfigDialog
      v-model="showServiceDlg"
      :title="serviceDlgTitle"
      :model="editService || undefined"
      @save="onServiceSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElTable, ElTableColumn, ElCard, ElButton } from 'element-plus'
import ServiceConfigDialog from './components/ServiceConfigDialog.vue'

type ServiceItem = {
  uid: string
  groupName: string
  status: '运行中' | '已停止'
  dbServiceIP?: string
  dbName?: string
  dbPort?: string
  dbUser?: string
  dbPassword?: string
  dbType?: string
  uploadServiceUID?: string
  uploadMediumUID?: string
  userUID?: string
}
type TaskItem = {
  uid: string
  name: string
  interval?: string
  times?: number
  byTime?: string
  startTime?: string
  endTime?: string
  byDate?: string
  startDate?: string
  state?: string
}

// 查询与状态
const svcLoading = ref(false)
const taskLoading = ref(false)
const serviceList = ref<ServiceItem[]>([])
const serviceTotal = ref(0)
const servicePage = ref(1)
const serviceSize = ref(10)
const activeService = ref<ServiceItem | null>(null)
const taskList = ref<TaskItem[]>([])

// 服务对话框状态
const showServiceDlg = ref(false)
const serviceDlgTitle = ref('新增通用模板')
const editService = ref<Partial<ServiceItem> | null>(null)

// 模拟接口（请替换为真实请求）
async function apiFetchServices(p: { page: number; size: number }) {
  await new Promise((r) => setTimeout(r, 200))
  const all: ServiceItem[] = [
    { uid: 'svc-001', groupName: '任务组A', status: '运行中' },
    { uid: 'svc-002', groupName: '任务组B', status: '已停止' },
    { uid: 'svc-003', groupName: '任务组C', status: '运行中' }
  ]
  const start = (p.page - 1) * p.size
  return { total: all.length, records: all.slice(start, start + p.size) }
}

async function apiFetchTasks() {
  await new Promise((r) => setTimeout(r, 200))
  // 不分页，直接返回全量
  return [
    {
      uid: 'task-001',
      name: '同步检查单',
      interval: '5m',
      times: 0,
      byTime: '是',
      startTime: '08:00',
      endTime: '18:00',
      byDate: '否',
      startDate: '',
      state: '启用'
    }
  ] as TaskItem[]
}

// 上表：加载服务（有分页）
async function loadServices() {
  svcLoading.value = true
  try {
    const { total, records } = await apiFetchServices({
      page: servicePage.value,
      size: serviceSize.value
    })
    serviceTotal.value = total
    serviceList.value = records
    if (records.length) {
      onServiceRowClick(records[0])
    } else {
      activeService.value = null
      taskList.value = []
    }
  } finally {
    svcLoading.value = false
  }
}

// 下表：加载任务（不分页）
async function loadTasks() {
  if (!activeService.value) return
  taskLoading.value = true
  try {
    taskList.value = await apiFetchTasks()
  } finally {
    taskLoading.value = false
  }
}

// 事件
function onServiceRowClick(row: ServiceItem) {
  activeService.value = row
  loadTasks()
}
function onSvcPageChange(p: number) {
  servicePage.value = p
  loadServices()
}
function onSvcSizeChange(s: number) {
  serviceSize.value = s
  servicePage.value = 1
  loadServices()
}

function onCreateService() {
  serviceDlgTitle.value = '新增通用模板'
  editService.value = {}
  showServiceDlg.value = true
}

function onServiceSave(formData: any) {
  console.log('保存服务配置:', formData)
  // TODO: 调用API保存服务配置
  ElMessage.success('服务配置保存成功')
  loadServices()
}

function onEditService(row: ServiceItem) {
  serviceDlgTitle.value = '编辑服务'
  editService.value = { ...row }
  showServiceDlg.value = true
}

function onDeleteService(row: ServiceItem) {
  ElMessage.info(`删除服务: ${row.groupName}`)
  // TODO: 调用API删除服务
}

function onCreateTask() {
  if (!activeService.value) return ElMessage.warning('请先选择服务')
  ElMessage.info(`为服务 ${activeService.value.groupName} 新增任务`)
}

onMounted(loadServices)
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}

.mt8 {
  margin-top: 8px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.flex {
  display: flex;
  align-items: center;
}
</style>
