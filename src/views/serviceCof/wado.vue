<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElTable,
  ElTableColumn,
  ElDialog,
  ElInputNumber,
  ElMessage,
  ElRow,
  ElCol,
  ElPagination
} from 'element-plus'
import type { FormRules } from 'element-plus'
import {
  CreateAddress,
  GetServiceAddressInfoList,
  GetServiceInfo,
  ServiceAddress,
  addOrEditServiceAddress,
  deleteServiceAddress
} from '@/api/sysConfig'

const query = reactive<Partial<GetServiceInfo>>({
  retrieveAETitle: '',
  serviceAddress: ''
})
const page = reactive({
  currentPage: 1,
  pageSize: 10
})
const total = ref(0)

const loading = ref(false)
const rows = ref<ServiceAddress[]>([])

// 新增/编辑弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingIndex = ref<number | null>(null)
const formRef = ref()
const form = reactive<CreateAddress>({
  retrieveAETitle: '',
  serviceAddress: '',
  weight: 0
})

// 校验规则
const validatePriority = (_: any, val: any, cb: (err?: Error) => void) => {
  const n = Number(val)
  if (!Number.isInteger(n) || n < 0) return cb(new Error('请输入非负整数'))
  cb()
}
const formRules: FormRules = {
  retrieveAETitle: [{ required: true, message: '请输入医疗机构标识', trigger: 'blur' }],
  serviceAddress: [
    { required: true, message: '请输入服务地址', trigger: 'blur' },
    {
      validator: (_: any, v: string, cb: (err?: Error) => void) => {
        if (!v) return cb()
        const ok = /^(https?:)\/\//i.test(v)
        return ok ? cb() : cb(new Error('请输入以 http:// 或 https:// 开头的地址'))
      },
      trigger: 'blur'
    }
  ],
  weight: [{ required: true, validator: validatePriority, trigger: 'change' }]
}

function handleSearch() {
  page.currentPage = 1
  getList()
}
function handleCreate() {
  isEdit.value = false
  editingIndex.value = null
  Object.assign(form, { retrieveAETitle: '', serviceAddress: '', weight: 0 })
  dialogVisible.value = true
}
function handleViewStatus() {
  // TODO: 查看状态
}
function handleEdit(row: ServiceAddress) {
  Object.assign(form, {
    retrieveAETitle: row.retrieveAETitle,
    serviceAddress: row.serviceAddress,
    weight: row.weight,
    aeTitleOrgName: row.aeTitleOrgName
  })
  isEdit.value = true
  dialogVisible.value = true
}
async function handleDelete(row: ServiceAddress) {
  const { code, msg } = await deleteServiceAddress(row)
  if (code === 200) {
    ElMessage.success(msg || '删除成功')
    getList()
  } else {
    ElMessage.error(msg || '删除失败')
  }
}

function submitForm() {
  ;(formRef.value as any)?.validate(async (valid: boolean) => {
    if (!valid) return
    const { code, msg } = await addOrEditServiceAddress(form)
    if (code === 200) {
      ElMessage.success(msg || '操作成功')
      dialogVisible.value = false
      getList()
      Object.assign(form, {
        retrieveAETitle: '',
        serviceAddress: '',
        weight: 0
      })
    } else {
      ElMessage.error(msg || '操作失败')
    }
  })
}

const getList = async () => {
  const searchQuery: GetServiceInfo = {
    retrieveAETitle: query.retrieveAETitle || '',
    serviceAddress: query.serviceAddress || '',
    currentPage: page.currentPage,
    pageSize: page.pageSize,
    token: '',
    totalRecords: 0
  }
  const res = await GetServiceAddressInfoList(searchQuery)
  rows.value = res?.data || []
  total.value = res?.pageBase?.totalRecords ?? rows.value.length
}
const onPageChange = (val: number) => {
  page.currentPage = val
  getList()
}
const onPageSizeChange = (val: number) => {
  page.pageSize = val
  page.currentPage = 1
  getList()
}
onMounted(() => {
  getList()
})
</script>

<template>
  <div class="page">
    <el-card shadow="never">
      <el-form :inline="true" :model="query" label-width="120px">
        <el-row>
          <el-col :span="6">
            <el-form-item label="医疗机构标识">
              <el-input
                v-model="query.retrieveAETitle"
                placeholder="请输入"
                style="width: 200px"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="服务地址">
              <el-input
                style="width: 200px"
                v-model="query.serviceAddress"
                placeholder="请输入"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" @click="handleCreate">新增</el-button>
              <el-button type="primary" plain @click="handleSearch">搜索</el-button>
              <el-button plain @click="handleViewStatus">查看状态</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="mt8" shadow="never">
      <el-table
        :data="rows"
        v-loading="loading"
        border
        style="width: 100%"
        height="calc(100vh - 270px)"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column prop="aeTitleOrgName" label="医疗机构名称" min-width="180" />
        <el-table-column prop="retrieveAETitle" label="医疗机构标识" min-width="180" />
        <el-table-column prop="weight" label="优先级" width="90" />
        <el-table-column prop="serviceAddress" label="服务地址" min-width="280" />
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
      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :current-page="page.currentPage"
          :page-size="page.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          @current-change="onPageChange"
          @size-change="onPageSizeChange"
        />
      </div>
    </el-card>

    <!-- 新增 / 编辑 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑' : '新增'" width="520px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-form-item label="医疗机构标识" prop="retrieveAETitle">
          <el-input v-model="form.retrieveAETitle" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="服务地址" prop="serviceAddress">
          <el-input v-model="form.serviceAddress" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="优先级" prop="weight">
          <el-input-number v-model="form.weight" :min="0" :step="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.mt8 {
  margin-top: 8px;
}

.dialog-footer {
  display: inline-flex;
  justify-content: flex-end;
  width: 100%;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
