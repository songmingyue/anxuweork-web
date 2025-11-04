<template>
  <div class="page">
    <!-- 顶部查询 -->
    <el-card shadow="never" body-style="{padding:'12px 16px'}">
      <el-form :inline="true" :model="query" label-width="80px">
        <el-form-item label="操作者">
          <el-input v-model="query.oprerator" placeholder="请输入" clearable style="width: 220px" />
        </el-form-item>

        <el-form-item label="操作日期">
          <el-date-picker
            v-model="query.start"
            type="date"
            placeholder="开始日期"
            style="width: 160px"
          />
          <span class="sep">至</span>
          <el-date-picker
            v-model="query.end"
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
        <el-table-column prop="sourceType" label="来源" min-width="120" sortable />
        <el-table-column prop="oprerator" label="操作者" min-width="120" sortable />
        <el-table-column prop="requestIP" label="请求设备IP" min-width="140" sortable />
        <el-table-column prop="patientName" label="病人姓名" min-width="120" sortable />
        <el-table-column prop="organizationName" label="医院名称" min-width="200" sortable />
        <el-table-column prop="operateTime" label="操作时间" min-width="180" sortable />
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
  ElInput,
  ElButton,
  ElDatePicker,
  ElPagination
} from 'element-plus'
import { DataPrintLog, getprintlog } from '@/api/logConfig'

const query = reactive({
  oprerator: '',
  start: '',
  end: '',
  organizationID: ''
})

const loading = ref(false)
const rows = ref<DataPrintLog[]>([])
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
  const request = {
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    operateTime: `${query.start},${query.end}`,
    oprerator: query.oprerator,
    organizationID: query.organizationID
  }
  const { data, pageBase } = await getprintlog(request)
  rows.value = data
  total.value = pageBase?.totalRecords || 0
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
