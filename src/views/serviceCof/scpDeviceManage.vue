<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElTable,
  ElTableColumn,
  ElSwitch
} from 'element-plus'

type Row = {
  deviceOrgId: string // 设备机构标识
  host: string // 设备主机地址
  port: number | string // 设备端口
  aeTitle: string // 设备AE
  callerAe: string // 呼叫方AE
  isDefault: boolean // 是否默认
}

const query = reactive({
  orgId: '' // 医疗机构标识
})

const loading = ref(false)
const rows = ref<Row[]>([
  // 示例数据，可删除
  // { deviceOrgId: 'ORG001', host: '10.0.0.5', port: 104, aeTitle: 'IMCIS_SCP', callerAe: 'CALLER_AE', isDefault: true }
])

function handleSearch() {
  loading.value = true
  // TODO: 调用接口，使用 query.orgId 作为查询条件
  setTimeout(() => (loading.value = false), 300)
}
function handleCreate() {
  // TODO: 新增
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
      <el-form :inline="true" :model="query" label-width="110px">
        <el-form-item label="医疗机构标识">
          <el-input v-model="query.orgId" placeholder="请输入" clearable style="width: 260px" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleCreate">新增</el-button>
          <el-button type="primary" plain @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt8" shadow="never">
      <el-table :data="rows" v-loading="loading" border style="width: 100%">
        <el-table-column prop="deviceOrgId" label="设备机构标识" min-width="180" />
        <el-table-column prop="host" label="设备主机地址" min-width="180" />
        <el-table-column prop="port" label="设备端口" width="120" />
        <el-table-column prop="aeTitle" label="设备AE" min-width="140" />
        <el-table-column prop="callerAe" label="呼叫方AE" min-width="140" />
        <el-table-column label="是否默认" width="120">
          <template #default="{ row }">
            <!-- 只读展示，如需可编辑切换可去掉 disabled -->
            <el-switch :model-value="row.isDefault" disabled />
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
.page {
  padding: 8px;
}

.mt8 {
  margin-top: 8px;
}
</style>
