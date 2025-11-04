<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElCard, ElForm, ElFormItem, ElInput, ElButton, ElTable, ElTableColumn } from 'element-plus'

type Row = {
  orgName: string
  orgId: string
  priority: number
  serviceUrl: string
  status: boolean
}

const query = reactive({
  orgId: '',
  serviceUrl: ''
})

const loading = ref(false)
const rows = ref<Row[]>([
  {
    orgName: 'eWordArchive',
    orgId: 'eWordArchive',
    priority: 0,
    serviceUrl: '',
    status: false
  }
])

function handleSearch() {
  loading.value = true
  // TODO: 调用接口，使用 query.orgId / query.serviceUrl
  setTimeout(() => (loading.value = false), 300)
}
function handleCreate() {
  // TODO: 新增
}
function handleViewStatus() {
  // TODO: 查看状态
}
function handleEdit(row: Row) {
  console.log(row, 'row')
  // TODO: 编辑
}
function handleDelete(row: Row) {
  console.log(row, 'row')
  // TODO: 删除
}
</script>

<template>
  <div class="page">
    <el-card shadow="never" body-style="{padding:'12px 16px'}">
      <el-form :inline="true" :model="query" label-width="100px">
        <el-form-item label="医疗机构标识">
          <el-input v-model="query.orgId" placeholder="请输入" clearable style="width: 260px" />
        </el-form-item>
        <el-form-item label="服务地址">
          <el-input
            v-model="query.serviceUrl"
            placeholder="请输入"
            clearable
            style="width: 360px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleCreate">新增</el-button>
          <el-button type="primary" plain @click="handleSearch">搜索</el-button>
          <el-button plain @click="handleViewStatus">查看状态</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt8" shadow="never">
      <el-table :data="rows" v-loading="loading" border style="width: 100%">
        <el-table-column type="selection" width="48" />
        <el-table-column prop="orgName" label="医疗机构名称" min-width="180" />
        <el-table-column prop="orgId" label="医疗机构标识" min-width="180" />
        <el-table-column prop="priority" label="优先级" width="90" />
        <el-table-column prop="serviceUrl" label="服务地址" min-width="280" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <span :style="{ color: row.status ? '#67C23A' : '#F56C6C' }">{{
              row.status ? '✔' : '✘'
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">修改</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.mt8 {
  margin-top: 8px;
}
</style>
