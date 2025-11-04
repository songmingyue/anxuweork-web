<template>
  <div class="page">
    <!-- 顶部查询（按截图） -->
    <el-card shadow="never" body-style="{padding:'12px 16px'}">
      <el-form :inline="true" :model="query" label-width="80px">
        <el-form-item label="操作类型">
          <el-input
            v-model="query.operationType"
            placeholder="请输入"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="操作环节">
          <el-input
            v-model="query.operationLink"
            placeholder="请输入"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="操作内容">
          <el-input
            v-model="query.operationContent"
            placeholder="请输入"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">清空</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="mt8" shadow="never">
      <el-table :data="rows" v-loading="loading" border style="width: 100%">
        <el-table-column prop="operationType" label="操作类型" min-width="120" sortable />
        <el-table-column prop="operationLink" label="操作环节" min-width="180" sortable />
        <el-table-column label="操作内容" min-width="160">
          <template #default="{ row }">
            <el-tag
              type="success"
              size="small"
              class="clickable"
              @click="openDetail(row.operationContent)"
            >
              {{ row.operationContent }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationIP" label="操作用户IP地址" min-width="150" />
        <el-table-column label="操作用户UID" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag size="small" class="clickable" @click="openDetail(row.operationUserUID)">{{
              row.operationUserUID
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationAccount" label="操作用户账户" min-width="140" />
        <el-table-column prop="createTime" label="创建时间" min-width="160" sortable />
        <el-table-column prop="lastUpdateTime" label="最后更新时间" min-width="160" sortable />
      </el-table>

      <div class="pager">
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
        <div style=" font-size: 16px; font-weight: 600;text-align: center">详细信息</div>
      </template>
      <div style=" line-height: 1.8; color: #303133;white-space: pre-wrap">{{ detailText }}</div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getSensitiveLogList, type InputSensitiveLog, type SensitiveLogOnce } from '@/api/logConfig'
import {
  ElTable,
  ElTag,
  ElInput,
  ElCard,
  ElTableColumn,
  ElForm,
  ElFormItem,
  ElButton,
  ElPagination,
  ElDialog
} from 'element-plus'
const query = reactive({
  operationType: '',
  operationLink: '',
  operationContent: ''
})

const loading = ref(false)
const rows = ref<SensitiveLogOnce[]>([])
const total = ref(0)
const pageSize = ref(20)
const currentPage = ref(1)

const detailVisible = ref(false)
const detailText = ref('')

async function fetch() {
  loading.value = true
  try {
    const payload: InputSensitiveLog = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      ...query
    }
    const { resultValue, pageBaseJson } = await getSensitiveLogList(payload)
    rows.value = (resultValue as unknown as SensitiveLogOnce[]) || []
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
  query.operationType = ''
  query.operationLink = ''
  query.operationContent = ''
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

function openDetail(text: string) {
  detailText.value = text || '—'
  detailVisible.value = true
}

onMounted(() => fetch())
</script>

<style scoped>
.page {
  padding: 8px;
}

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
