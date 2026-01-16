<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElButton, ElCard, ElEmpty, ElMessage, ElTable, ElTableColumn } from 'element-plus'
import {
  deleteScript,
  executeScript,
  getScriptDetail,
  getScriptList,
  type ScriptDetail,
  type ScriptListItem
} from '@/api/scriptManagement'

defineOptions({
  name: 'ScriptManagement'
})

const listLoading = ref(false)
const list = ref<ScriptListItem[]>([])
const currentRow = ref<ScriptListItem | null>(null)

const defaultDetail: ScriptDetail = {
  scriptId: '',
  programVersion: '',
  scriptVersion: '',
  canAutoExecute: false,
  description: '',
  content: ''
}
const detailLoading = ref(false)
const detail = ref<ScriptDetail>({ ...defaultDetail })

const canOperate = computed(() => Boolean(currentRow.value?.scriptId))

const loadList = async () => {
  listLoading.value = true
  try {
    const { list: data } = await getScriptList()
    list.value = data

    if (!data.length) {
      currentRow.value = null
      detail.value = { ...defaultDetail }
    }
  } finally {
    listLoading.value = false
  }
}

const loadDetail = async (row: ScriptListItem | null) => {
  currentRow.value = row
  if (!row?.scriptId) {
    detail.value = { ...defaultDetail }
    return
  }

  detailLoading.value = true
  try {
    const { detail: data } = await getScriptDetail({ scriptId: row.scriptId })
    detail.value = data ?? { ...defaultDetail, ...row }
  } finally {
    detailLoading.value = false
  }
}

const onExecute = async () => {
  if (!currentRow.value?.scriptId) {
    ElMessage.warning('请选择要执行的脚本')
    return
  }
  await executeScript({ scriptId: currentRow.value.scriptId })
  ElMessage.success('已触发执行（接口占位）')
}

const onDelete = async () => {
  if (!currentRow.value?.scriptId) {
    ElMessage.warning('请选择要删除的脚本')
    return
  }
  await deleteScript({ scriptId: currentRow.value.scriptId })
  ElMessage.success('已触发删除（接口占位）')
}

onMounted(() => {
  loadList()
})
</script>

<template>
  <div class="script-management">
    <div class="grid">
      <el-card shadow="never" class="list-card">
        <el-table
          :data="list"
          border
          height="560"
          class="table"
          :loading="listLoading"
          highlight-current-row
          row-key="scriptId"
          @current-change="loadDetail"
        >
          <el-table-column prop="scriptId" label="脚本id" min-width="140" />
          <el-table-column prop="programVersion" label="程序版本号" min-width="140" />
          <el-table-column prop="scriptVersion" label="脚本版本号" min-width="140" />

          <template #empty>
            <div class="table-empty"><el-empty description="暂无数据" /></div>
          </template>
        </el-table>

        <div class="list-actions">
          <el-button type="primary" :disabled="!canOperate" @click="onExecute">执行</el-button>
          <el-button :disabled="!canOperate" @click="onDelete">删除</el-button>
        </div>
      </el-card>

      <el-card shadow="never" class="detail-card" :body-style="{ padding: '0' }">
        <div class="detail-header">目标详情</div>
        <div class="detail-body" v-loading="detailLoading">
          <div class="detail-row">
            <div class="detail-label">脚本id</div>
            <div class="detail-value">{{ detail.scriptId }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">程序版本号</div>
            <div class="detail-value">{{ detail.programVersion }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">能否自动执行</div>
            <div class="detail-value">{{ detail.canAutoExecute ? '是' : '否' }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">脚本版本号</div>
            <div class="detail-value">{{ detail.scriptVersion }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">脚本描述</div>
            <div class="detail-value">{{ detail.description }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">脚本内容</div>
            <div class="detail-value pre">{{ detail.content }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.script-management {
  width: 100%;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 10px;
}

@media (width <= 1100px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.list-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.table-empty {
  padding: 16px 0;
}

.list-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
}

.detail-header {
  display: flex;
  height: 44px;
  padding: 0 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  align-items: center;
}

.detail-body {
  padding: 12px 16px;
}

.detail-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 12px;
  padding: 10px 0;
}

.detail-label {
  color: var(--el-text-color-regular);
}

.detail-value {
  min-height: 20px;
  color: var(--el-text-color-primary);
  word-break: break-all;
  white-space: pre-wrap;
}

.detail-value.pre {
  white-space: pre-wrap;
}
</style>
