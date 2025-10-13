<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElPagination } from 'element-plus'
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElRow,
  ElCol,
  ElSelect,
  ElCard,
  ElOption,
  ElSwitch
} from 'element-plus'
import { CloudStorageConfig, getOrg, getStorage, storageDelete, storageEdit } from '@/api/paramConf'
import AddStorageMedium from './components/AddStorageMedium.vue'
interface OrgOption {
  label: string
  value: string
}
const searchType = ref('')
const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const dialogFormData = ref<Partial<CloudStorageConfig>>({})
const tableData = ref<CloudStorageConfig[]>()

const orgOptions = ref<OrgOption[]>([])
// 分页相关变量
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

function handleSizeChange(val: number) {
  pageSize.value = val
  getStorageList()
}
function handleCurrentChange(val: number) {
  currentPage.value = val
  getStorageList()
}

const onAdd = () => {
  dialogIsEdit.value = false
  dialogFormData.value = {}
  dialogVisible.value = true
}

function onSearch() {
  currentPage.value = 1
  getStorageList()
}

function onEdit(row: CloudStorageConfig) {
  dialogIsEdit.value = true
  dialogFormData.value = { ...row }
  dialogVisible.value = true
}

async function onDelete(row: CloudStorageConfig) {
  const { isSuccess, message } = await storageDelete(row)
  if (isSuccess) {
    getStorageList()
    ElMessage.success(message || '删除成功')
  } else {
    ElMessage.error(message || '删除失败')
  }
  // 删除逻辑
}

const getStorageList = async () => {
  const { data, pageBase } = await getStorage({
    organizationID: searchType.value,
    currentPage: currentPage.value,
    pageSize: pageSize.value
  })
  tableData.value = data || []
  // 假设后端返回 { total, list }
  total.value = pageBase?.totalRecords || 0
}

const getOrgList = async () => {
  const res = await getOrg()
  const list = Array.isArray(res?.data) ? res.data : []
  orgOptions.value = list.map((o: any) => ({ label: o.organizationName, value: o.organizationID }))
}
// 运行状态

const editSwitch = async (row: CloudStorageConfig) => {
  const { isSuccess, message } = await storageEdit(row)
  if (isSuccess) {
    ElMessage.success(message || '操作成功')
  } else {
    // revert on failure
    ElMessage.error(message || '操作失败')
  }
}

onMounted(() => {
  getStorageList()
  getOrgList()
})

async function onConfirmStorage() {
  dialogVisible.value = false
  getStorageList()
}
</script>
<template>
  <div>
    <el-card shadow="never" class="mb2">
      <el-row :gutter="4">
        <el-col :span="4">
          <el-select v-model="searchType" placeholder="检查机构" clearable>
            <el-option
              v-for="opt in orgOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" @click="onSearch">查 询</el-button>
          <el-button type="success" @click="onAdd">新建存储媒介</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column
          fixed="left"
          prop="mediaUID"
          sortable
          label="媒质UID"
          min-width="290"
          show-overflow-tooltip
        />
        <el-table-column
          prop="name"
          sortable
          label="媒质名称"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="type"
          sortable
          label="路径类型"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="path"
          min-width="120"
          sortable
          label="路径/地址"
          show-overflow-tooltip
        />
        <el-table-column
          prop="accessID"
          min-width="120"
          sortable
          label="子目录"
          show-overflow-tooltip
        />
        <el-table-column
          prop="organizationName"
          min-width="120"
          sortable
          label="机构名称"
          show-overflow-tooltip
        />
        <el-table-column
          prop="description"
          min-width="120"
          sortable
          label="描述"
          show-overflow-tooltip
        />
        <el-table-column prop="ifEnable" label="运行状态" width="150">
          <template #default="{ row }">
            <el-switch
              v-model="row.ifEnable"
              active-value="true"
              inactive-value="false"
              size="small"
              @change="editSwitch(row)"
              active-text="启用"
              inactive-text="停用"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="onEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="mt-4 mb-4"
      />
    </el-card>
  </div>
  <AddStorageMedium
    v-if="dialogVisible"
    v-model:visible="dialogVisible"
    :isEdit="dialogIsEdit"
    :formData="dialogFormData"
    :orgOptions="orgOptions"
    @confirm="onConfirmStorage"
  />
</template>
