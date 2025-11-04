<template>
  <div class="page">
    <!-- 顶部查询（按截图布局） -->
    <el-card shadow="never" body-style="{padding:'12px 16px'}" ref="searchCard">
      <el-form :inline="true" :model="query" label-width="80px">
        <!-- 第一行：检查号、模态码、检查类型、检查类型（操作类型）及操作员 -->
        <el-form-item label="检查号">
          <el-input
            v-model="query.accessionNumber"
            placeholder="请输入"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="错误级别">
          <el-select v-model="query.failLevel" placeholder="请选择" clearable style="width: 160px">
            <el-option
              v-for="m in failLevelOptions"
              :key="m.value"
              :label="m.label"
              :value="m.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="检查类型">
          <el-input v-model="query.serviceSectID" clearable placeholder="请输入检查类型" />
        </el-form-item>

        <el-form-item label="插件名称">
          <el-select v-model="query.pluginName" placeholder="请选择" clearable style="width: 160px">
            <el-option v-for="o in pluginList" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>

        <!-- 第二行：任务类型、检查日期、按钮 -->
        <el-form-item label="任务类型">
          <el-select v-model="query.taskType" placeholder="请选择" clearable style="width: 160px">
            <el-option
              v-for="t in taskTypeOptions"
              :key="t.value"
              :label="t.label"
              :value="t.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="检查日期">
          <el-date-picker
            v-model="query.examStartTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="开始时间"
            style="width: 160px"
          />
          <span class="sep">至</span>
          <el-date-picker
            v-model="query.examEndTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="结束时间"
            style="width: 160px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="mt8" shadow="never">
      <el-table
        :data="rows"
        v-loading="loading"
        border
        style="width: 100%"
        :max-height="tableMaxHeight"
      >
        <el-table-column prop="accessionNumber" label="检查号" min-width="110" sortable />
        <el-table-column prop="examDate" label="检查时间" min-width="160" sortable />
        <el-table-column prop="serviceSectID" label="检查类型" min-width="120" sortable />
        <el-table-column label="失败原因" min-width="150">
          <template #default="{ row }">
            <el-tag type="info" size="small" class="clickable" @click="openDetail('reason', row)">
              {{ row.failReason ? `${row.failReason.slice(0, 8)}...` : '—' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="任务详情" min-width="120">
          <template #default="{ row }">
            <el-tag type="success" size="small" class="clickable" @click="openDetail('task', row)">
              {{ row.taskContent ? `${row.taskContent.slice(0, 10)}...` : '—' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="异常信息" min-width="160">
          <template #default="{ row }">
            <el-tag
              type="warning"
              size="small"
              class="clickable"
              @click="openDetail('abnormal', row)"
            >
              {{ row.exceptionContent ? `${row.exceptionContent.slice(0, 15)}...` : '—' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="taskType" label="任务类型" min-width="120" show-overflow-tooltip />
        <el-table-column prop="pluginName" label="插件名称" min-width="140" />
        <el-table-column label="失败级别" min-width="100">
          <template #default="{ row }">
            <el-tag type="danger" size="small">{{ row.failLevel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" sortable />
        <el-table-column prop="lastUpdateTime" label="最后更新时间" min-width="160" sortable />
      </el-table>

      <div class="pager" ref="pagerWrap">
        <div class="total">共 {{ total }} 条</div>
        <el-pagination
          background
          layout="prev, pager, next, sizes"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" width="640" :close-on-click-modal="false">
      <template #header>
        <div style="font-size: 16px; font-weight: 600; text-align: center">详细信息</div>
      </template>
      <div v-html="detailText" style="height: 200px; overflow-y: auto"></div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  FailTaskOnce,
  getFailTaskList,
  getFailTaskPluginName,
  InputFailTask
} from '@/api/logConfig'
import {
  ElTable,
  ElTableColumn,
  ElForm,
  ElFormItem,
  ElCard,
  ElDatePicker,
  ElPagination,
  ElButton,
  ElInput,
  ElSelect,
  ElOption,
  ElDialog,
  ElTag
} from 'element-plus'
type AnyRow = Record<string, any>

const query = reactive({
  examStartTime: '',
  examEndTime: '',
  accessionNumber: '',
  failLevel: '',
  taskType: [],
  serviceSectID: '',
  pluginName: ''
})

const pluginList = ref<{ label: string; value: string }[]>([])
const taskTypeOptions = [
  '检查上传',
  '胶片上传',
  '影像上传',
  '报告上传',
  '检查采集',
  '补漏采集',
  '胶片采集',
  '影像采集',
  '报告采集'
].map((t) => ({ label: t, value: t }))

const failLevelOptions = [
  { label: 'INFO', value: '0' },
  { label: 'ERROR', value: '1' }
]

const loading = ref(false)
const rows = ref<FailTaskOnce[]>([])
const total = ref(0)
const pageSize = ref(20)
const currentPage = ref(1)

// 表格内部滚动，确保筛选和分页始终可见
const tableMaxHeight = ref<string | number>('480px')
const searchCard = ref<HTMLElement | null>(null)
const pagerWrap = ref<HTMLElement | null>(null)

function computeTableMaxHeight() {
  const topH = searchCard.value?.offsetHeight ?? 0
  const pagerH = pagerWrap.value?.offsetHeight ?? 0
  const extra = 120 // 预留边距/卡片间距
  const vh = window.innerHeight
  const h = Math.max(240, vh - topH - pagerH - extra)
  tableMaxHeight.value = `${h}px`
}

const detailVisible = ref(false)
const detailText = ref('')

async function fetch() {
  loading.value = true
  try {
    const payload: InputFailTask = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      ...query
    }
    const { resultValue, pageBaseJson } = await getFailTaskList(payload)
    rows.value = resultValue || []
    total.value = pageBaseJson?.totalRecords || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetch()
}
function handleReset() {
  query.accessionNumber = ''
  query.failLevel = ''
  query.taskType = []
  query.serviceSectID = ''
  query.pluginName = ''
  query.examStartTime = ''
  query.examEndTime = ''
  currentPage.value = 1
  fetch()
}
function onPageChange(p: number) {
  currentPage.value = p
  fetch()
}
function onSizeChange(s: number) {
  pageSize.value = s
  currentPage.value = 1
  fetch()
}

const getOptionList = async () => {
  const { resultValue } = await getFailTaskPluginName()
  pluginList.value = (resultValue || []).map((name) => ({
    label: name,
    value: name
  }))
}

onMounted(() => {
  getOptionList()
  fetch()
  // 初次渲染后计算表格可视高度，并在窗口尺寸变化时更新
  setTimeout(() => computeTableMaxHeight(), 0)
  window.addEventListener('resize', computeTableMaxHeight)
})

// 可根据路由卸载时清理事件（如果页面为缓存路由，可保留）
// onBeforeUnmount(() => {
//   window.removeEventListener('resize', computeTableMaxHeight)
// })

function openDetail(type: 'reason' | 'task' | 'abnormal', row: AnyRow) {
  let text = ''
  if (type === 'reason') {
    text = row.failReason || '—'
  } else if (type === 'task') {
    text = text = row.taskContent || '—'
  } else if (type === 'abnormal') {
    text = row.exceptionContent || '—'
  }
  // 附带常见标识信息
  const prefix = row.accessionNumber ? `AccessionNumber: ${row.accessionNumber}\n` : ''
  detailText.value = `${prefix}${text}`.trim() || '—'
  detailVisible.value = true
}
</script>

<style scoped>
.mt8 {
  margin-top: 8px;
}

.sep {
  margin: 0 8px;
  color: #909399;
}

.pager {
  display: flex;
  margin-top: 8px;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.total {
  color: #909399;
}

.clickable {
  cursor: pointer;
}
</style>
