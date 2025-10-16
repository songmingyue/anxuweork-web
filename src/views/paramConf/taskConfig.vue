<template>
  <div class="page">
    <el-card shadow="never" body-style="{padding:'10px 12px'}">
      <div class="toolbar">
        <el-button type="primary" @click="onCreate">新增服务</el-button>
      </div>

      <el-table
        :data="list"
        border
        highlight-current-row
        style="width: 100%"
        @sort-change="onSortChange"
      >
        <el-table-column prop="taskName" label="任务名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="taskType" label="任务类型" width="100">
          <template #default="{ row }">
            {{ TaskTypeLabels[row.taskType] }}
          </template>
        </el-table-column>
        <el-table-column prop="target" label="任务目的地" min-width="160">
          <template #default="{ row }">
            {{ TaskTargetLabels[row.taskTarget] }}
          </template>
        </el-table-column>
        <el-table-column prop="dataType" label="数据类型" width="100">
          <template #default="{ row }">
            {{ DataTypeLabels[row.dataType] }}
          </template>
        </el-table-column>

        <!-- 任务筛选条件：点击表头排序 -->
        <el-table-column
          prop="conditionDescription"
          label="任务筛选条件"
          min-width="280"
          sortable
          show-overflow-tooltip
        />

        <el-table-column label="运行状态" width="160" align="center">
          <template #default="{ row }">
            <span class="muted">{{ row.isEnable ? '启用' : '停用' }}</span>
            <el-switch v-model="row.isEnable" class="ml8" @change="toggleEnable(row)" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="onEditFilter(row)"
              >编辑条件</el-button
            >
            <el-button size="small" link type="primary" @click="onEdit(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑任务弹窗 -->
    <TaskConfigDialog
      v-model="showTaskDlg"
      :title="dlgTitle"
      :model="editTask || undefined"
      @save="onTaskSave"
    />

    <!-- 条件编辑器弹窗 -->
    <ConditionEditorDialog
      v-model="showConditionDlg"
      :title="`编辑条件 - ${editConditionTask?.taskName || ''}`"
      :model="conditionFormData"
      @save="onConditionSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  ElMessage,
  ElMessageBox,
  ElTable,
  ElTableColumn,
  ElCard,
  ElButton,
  ElSwitch
} from 'element-plus'
import {
  ConfigItem,
  getConfigs,
  TaskTargetLabels,
  TaskTypeLabels,
  DataTypeLabels,
  deleteConfig,
  updateStatus,
  getCondition
} from '@/api/authConf'
import TaskConfigDialog from './components/TaskConfigDialog.vue'
import ConditionEditorDialog from './components/ConditionEditorDialog.vue'

const list = ref<ConfigItem[]>([])

// 任务弹窗状态
const showTaskDlg = ref(false)
const dlgTitle = ref('新增任务')
const editTask = ref<Partial<ConfigItem> | null>(null)

// 条件编辑器弹窗状态
const showConditionDlg = ref(false)
const editConditionTask = ref<ConfigItem | null>(null)
const conditionFormData = ref<any>(null)

function onSortChange(payload: {
  column: any
  prop: string
  order: 'ascending' | 'descending' | null
}) {
  // 可在此上报或持久化排序状态
  console.log('sort-change', payload)
}

async function toggleEnable(row: ConfigItem) {
  const data = await updateStatus({ ...row })
  if (data.isSuccess) {
    ElMessage.success(`${row.taskName} 已${row.isEnable ? '启用' : '停用'}`)
    setTimeout(() => {
      getConfigList()
    }, 1000)
  } else {
    ElMessage.error(data.message || '操作失败')
  }
}

function onCreate() {
  dlgTitle.value = '新增任务'
  editTask.value = {
    taskName: '',
    taskType: undefined,
    taskTarget: undefined,
    dataType: undefined
  }
  showTaskDlg.value = true
}
async function onEditFilter(row: ConfigItem) {
  editConditionTask.value = row
  const { isSuccess, data } = await getCondition({
    id: row.id || ''
  })
  if (isSuccess && data.condition) {
    const condition: any = JSON.parse(data.condition)
    console.log('condition', condition)
    conditionFormData.value = {
      taskName: row.taskName,
      taskId: row.id,
      logic: condition.LT, // 默认 AND,可根据实际解析
      conditions: condition.CN.length
        ? condition.CN.map((item) => {
            const ctinput: any =
              item.CT === 'String'
                ? item.V
                : item.V.split('|').length > 1
                  ? item.V.split('|')
                  : item.V
            return {
              id: `condition_${Date.now()}`,
              field: item.F,
              operator: item.CTV,
              input: typeof ctinput !== 'string' ? ctinput[1] : ctinput,
              compareType: typeof ctinput !== 'string' ? ctinput[0] : '',
              value: typeof ctinput !== 'string' ? ctinput[1] : '',
              unit: typeof ctinput !== 'string' ? ctinput[2] : '',
              timeType: typeof ctinput !== 'string' ? 'now' : 'fixed',
              // value: item.V,
              // unit: item.U,
              dateValue: typeof ctinput !== 'string' ? ctinput[1] : ctinput
            }
          })
        : [
            {
              id: `condition_${Date.now()}`,
              field: '',
              operator: '',
              compareType: 'String',
              timeType: 'now',
              value: '10',
              unit: 's',
              dateValue: '',
              input: ''
            }
          ]
    }

    showConditionDlg.value = true
  } else {
    conditionFormData.value = {
      taskName: row.taskName,
      taskId: row.id,
      logic: 'And',
      conditions: [
        {
          id: `condition_${Date.now()}`,
          field: '',
          operator: '',
          compareType: 'String',
          timeType: 'now',
          value: '10',
          unit: 's',
          dateValue: '',
          input: ''
        }
      ]
    }
  }
  showConditionDlg.value = true
  // 解析现有的 conditionDescription 为表单数据
  // 这里需要根据你的实际数据格式进行解析
}

// 保存条件编辑
async function onConditionSave() {
  // 将条件转换为描述文本
  getConfigList()
  showConditionDlg.value = false
}

function onEdit(row: ConfigItem) {
  dlgTitle.value = '编辑任务'
  editTask.value = { ...row }
  showTaskDlg.value = true
}
function onDelete(row: ConfigItem) {
  ElMessageBox.confirm(`确定删除任务【${row.taskName}】吗？`, '提示', { type: 'warning' })
    .then(async () => {
      const data = await deleteConfig({
        id: row.id || ''
      })
      if (data.isSuccess) {
        getConfigList()
        ElMessage.success(data.message || '删除成功')
      } else {
        ElMessage.error(data.message || '删除失败')
      }
      // list.value = list.value.filter((x) => x.id !== row.id)
      // ElMessage.success('删除成功')
    })
    .catch(() => {})
}

const getConfigList = async () => {
  const { data } = await getConfigs()
  list.value = data
}

// 保存任务（新增或编辑）
async function onTaskSave() {
  await getConfigList()
}

onMounted(() => {
  getConfigList()
})
</script>

<style scoped>
.page {
  padding: 8px;
}

.toolbar {
  margin-bottom: 8px;
}

.muted {
  color: #909399;
}

.ml8 {
  margin-left: 8px;
}
</style>
