<template>
  <div class="page">
    <!-- 顶部查询 -->
    <el-card shadow="never" body-style="{padding:'12px 16px'}">
      <el-form :inline="true" :model="query" label-width="80px">
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
          <el-select v-model="query.org" placeholder="请选择" clearable style="width: 180px">
            <el-option label="全部" value="" />
            <el-option label="方正县人民医院" value="fz" />
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
        <el-table-column prop="source" label="来源" min-width="120" />
        <el-table-column prop="operator" label="操作者" min-width="120" />
        <el-table-column prop="ip" label="请求设备IP" min-width="140" />
        <el-table-column prop="patient" label="病人姓名" min-width="120" />
        <el-table-column prop="orgName" label="医院名称" min-width="200" />
        <el-table-column prop="time" label="操作时间" min-width="180" />
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
import { ref, reactive } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElCard,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption
} from 'element-plus'

type Row = {
  source: string
  operator: string
  ip: string
  patient: string
  orgName: string
  time: string
}

const query = reactive({
  operator: '',
  start: '',
  end: '',
  org: ''
})

const loading = ref(false)
const rows = ref<Row[]>([])
const total = ref(0)
const pageSize = ref(20)
const currentPage = ref(1)

function mockFetch() {
  loading.value = true
  setTimeout(() => {
    const list: Row[] = [
      {
        source: '报告打印',
        operator: 'admin',
        ip: '10.0.0.12',
        patient: '赵春香',
        orgName: '方正县人民医院',
        time: '2024-09-12 22:03:58'
      }
    ]
    rows.value = currentPage.value === 1 ? list : []
    total.value = list.length
    loading.value = false
  }, 300)
}

function handleSearch() {
  currentPage.value = 1
  mockFetch()
}
function onPageChange(p: number) {
  currentPage.value = p
  mockFetch()
}
function onSizeChange(s: number) {
  pageSize.value = s
  currentPage.value = 1
  mockFetch()
}

mockFetch()
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
</style>
