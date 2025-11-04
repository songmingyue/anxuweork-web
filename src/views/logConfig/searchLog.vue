<template>
  <div class="page">
    <!-- 顶部查询 -->
    <el-card shadow="never" body-style="{padding:'12px 16px'}">
      <el-form :inline="true" :model="query" label-width="80px">
        <el-form-item label="操作日期">
          <el-date-picker
            v-model="query.date[0]"
            type="date"
            placeholder="开始日期"
            style="width: 160px"
          />
          <span class="sep">至</span>
          <el-date-picker
            v-model="query.date[1]"
            type="date"
            placeholder="结束日期"
            style="width: 160px"
          />
        </el-form-item>

        <el-form-item label="机构">
          <el-select
            v-model="query.organizationID"
            placeholder="请选择"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="opt in orgOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">检索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="mt8" shadow="never">
      <el-table :data="rows" v-loading="loading" border style="width: 100%">
        <el-table-column prop="organizationName" label="机构名称" min-width="120" sortable />
        <el-table-column
          prop="requestURL"
          label="请求地址"
          min-width="120"
          sortable
          show-overflow-tooltip
        />
        <el-table-column prop="createTime" label="操作时间" min-width="140" sortable />
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
  ElSelect,
  ElOption,
  ElButton,
  ElDatePicker,
  ElPagination
} from 'element-plus'
import { getOperateList, InputOperateList, TypeGain } from '@/api/logConfig'

type Row = Partial<{
  typeName: string
  operateRecordUID: string
  createTime: string
  organizationName: string
}>

const query = reactive({
  date: [] as string[],
  organizationID: ''
})

const loading = ref(false)
const rows = ref<Row[]>([])
const total = ref(0)
const pageSize = ref(20)
const currentPage = ref(1)
const orgOptions = ref<{ label: string; value: string }[]>([])

function loadOrgOptions() {
  try {
    const raw = localStorage.getItem('org')
    const list = raw ? JSON.parse(raw) : []
    if (Array.isArray(list.value)) {
      orgOptions.value = list.value
    } else {
      orgOptions.value = []
    }
  } catch (_) {
    orgOptions.value = []
  }
}

async function fetch() {
  loading.value = true
  try {
    const request: InputOperateList = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      organizationID: query.organizationID,
      date: query.date.join(','),
      // 此接口暂复用 InputGainList 结构，类型可置空
      type: TypeGain.Null
    }
    const { data, pageBase } = await getOperateList(request)
    rows.value = data as any
    total.value = pageBase?.totalRecords || 0
  } finally {
    loading.value = false
  }
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
  loadOrgOptions()
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
