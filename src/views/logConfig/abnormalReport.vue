<template>
  <div class="page">
    <!-- 顶部查询 -->
    <el-card shadow="never" body-style="{padding:'12px 16px'}" class="padding-none">
      <el-form :inline="true" :model="query" label-width="80px">
        <el-form-item label="检查号">
          <el-input
            v-model="query.accessionNumber"
            placeholder="请输入"
            clearable
            style="width: 220px"
          />
        </el-form-item>

        <el-form-item label="操作日期">
          <el-date-picker
            v-model="query.date"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">检索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="mt8" shadow="never">
      <el-table :data="rows" v-loading="loading" style="width: 100%" height="calc(100vh - 220px)">
        <el-table-column prop="accessionNumber" label="检查号" min-width="120" sortable />
        <el-table-column prop="examDate" label="检查时间" min-width="120" sortable />
        <el-table-column prop="typeCode" label="类型" min-width="140" sortable />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElDatePicker,
  ElPagination
} from 'element-plus'
import { getUploadFailList, UploadFailList, UploadFailOnce } from '@/api/logConfig'

const query = reactive({
  accessionNumber: '',
  date: [] as string[]
})

const loading = ref(false)
const rows = ref<UploadFailOnce[]>([])
const total = ref(0)
const pageSize = ref(20)
const currentPage = ref(1)
async function fetch() {
  const request: UploadFailList = {
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    examTimeRange: `${query.date[0]} 00:00:00,${query.date[1]} 23:59:59`,
    accessionNumber: query.accessionNumber
  }
  const { resultValue, pageBaseJson } = await getUploadFailList(request)
  rows.value = resultValue || []
  total.value = pageBaseJson?.totalRecords || 0
}

const handleReset = () => {
  query.accessionNumber = ''
  query.date = []
  currentPage.value = 1
  fetch()
}

function handleSearch() {
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

onMounted(() => {
  fetch()
})
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
</style>
