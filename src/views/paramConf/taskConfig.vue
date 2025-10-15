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
        <el-table-column prop="name" label="任务名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="taskType" label="任务类型" width="100" />
        <el-table-column prop="target" label="任务目的地" min-width="160" />
        <el-table-column prop="dataType" label="数据类型" width="100" />

        <!-- 任务筛选条件：点击表头排序 -->
        <el-table-column
          prop="filterCond"
          label="任务筛选条件"
          min-width="280"
          sortable
          show-overflow-tooltip
        />

        <el-table-column label="运行状态" width="160" align="center">
          <template #default="{ row }">
            <span class="muted">{{ row.enabled ? '启用' : '停用' }}</span>
            <el-switch v-model="row.enabled" class="ml8" @change="toggleEnable(row)" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="onEditFilter(row)"
              >编辑条件</el-button
            >
            <el-button size="small" type="primary" text @click="onEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" text @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox, ElTable, ElTableColumn, ElCard, ElButton } from 'element-plus'

type TaskRow = {
  id: string
  name: string
  taskType: '上传' | '推送' | '下载' | '转化'
  target: string
  dataType: '影像' | '报告' | '胶片' | '检查' | 'PDF'
  filterCond: string
  enabled: boolean
}

const list = ref<TaskRow[]>([
  {
    id: '1',
    name: '上传云胶片影像',
    taskType: '上传',
    target: '云胶片',
    dataType: '影像',
    filterCond: 'CT, 今日',
    enabled: true
  },
  {
    id: '2',
    name: '推送集成平台影像',
    taskType: '推送',
    target: '集成市平台',
    dataType: '影像',
    filterCond: '全部',
    enabled: false
  },
  {
    id: '3',
    name: '推送集成平台检查',
    taskType: '推送',
    target: '集成市平台',
    dataType: '检查',
    filterCond: '门诊, 本周',
    enabled: false
  },
  {
    id: '4',
    name: '下载本地报告',
    taskType: '下载',
    target: '本地存储',
    dataType: '报告',
    filterCond: '报告状态=已审核',
    enabled: true
  },
  {
    id: '5',
    name: '上传云胶片报告',
    taskType: '上传',
    target: '云胶片',
    dataType: '报告',
    filterCond: '近3日',
    enabled: true
  }
])

function onSortChange(payload: {
  column: any
  prop: string
  order: 'ascending' | 'descending' | null
}) {
  // 可在此上报或持久化排序状态
  console.log('sort-change', payload)
}

function toggleEnable(row: TaskRow) {
  // TODO: 调用接口保存启用/停用
  ElMessage.success(`${row.name} 已${row.enabled ? '启用' : '停用'}`)
}

function onCreate() {
  ElMessage.info('点击了新增服务（在此弹窗或跳转配置页）')
}
function onEditFilter(row: TaskRow) {
  ElMessage.info(`编辑筛选条件：${row.name}`)
}
function onEdit(row: TaskRow) {
  ElMessage.info(`编辑：${row.name}`)
}
function onDelete(row: TaskRow) {
  ElMessageBox.confirm(`确定删除任务【${row.name}】吗？`, '提示', { type: 'warning' })
    .then(() => {
      list.value = list.value.filter((x) => x.id !== row.id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
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
