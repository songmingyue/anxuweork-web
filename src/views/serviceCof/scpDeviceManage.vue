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
  ElSelect,
  ElOption,
  ElMessage,
  ElRow,
  ElPagination,
  ElMessageBox
} from 'element-plus'
import type { FormRules } from 'element-plus'
import {
  DicomScpInfo,
  DicomScpInfoResponse,
  GetDicomScpInfoList,
  addOrUpdateDicomScpInfo,
  deleteServiceAddress
} from '@/api/sysConfig'

const query = reactive({
  orgCode: ''
})
const page = reactive({
  currentPage: 1,
  pageSize: 10
})
const total = ref(0)

const loading = ref(false)
const rows = ref<DicomScpInfo[]>([])

// 新增/编辑弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingIndex = ref<number | null>(null)
const formRef = ref()
const form = reactive<DicomScpInfo>({})

// 校验规则
const formRules: FormRules = {
  orgCode: [{ required: true, message: '请输入设备机构标识', trigger: 'blur' }],
  host: [
    { required: true, message: '请输入设备主机地址', trigger: 'change' },
    {
      validator: (_: any, v: string, cb: (err?: Error) => void) => {
        if (!v) return cb()
        const ok = /^(https?:)\/\//i.test(v)
        return ok ? cb() : cb(new Error('请输入以 http:// 或 https:// 开头的地址'))
      },
      trigger: 'blur'
    }
  ],
  callingAE: [{ required: true, message: '请输入呼叫方AE', trigger: 'change' }],
  calledAE: [{ required: true, message: '请输入被叫方AE', trigger: 'change' }],
  port: [{ required: true, message: '请输入设备端口', trigger: 'change' }]
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
function handleEdit(row: DicomScpInfo) {
  Object.assign(form, {
    orgCode: row.orgCode,
    host: row.host,
    port: row.port,
    calledAE: row.calledAE,
    callingAE: row.callingAE,
    isDefault: row.isDefault,
    id: row.id
  })
  isEdit.value = true
  dialogVisible.value = true
}
async function handleDelete(row: DicomScpInfo) {
  ElMessageBox.confirm(`确认删除设备【${row.orgCode}】吗？`, '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const { code, msg } = await deleteServiceAddress(row as any)
      if (code === 200) {
        ElMessage.success(msg || '删除成功')
        getList()
      } else {
        ElMessage.error(msg || '删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

function submitForm() {
  ;(formRef.value as any)?.validate(async (valid: boolean) => {
    if (!valid) return
    const { code, msg } = await addOrUpdateDicomScpInfo(form)
    if (code === 200) {
      ElMessage.success(msg || '操作成功')
      dialogVisible.value = false
      getList()
      Object.assign(form, {
        orgCode: '',
        host: '',
        port: '',
        calledAE: '',
        callingAE: '',
        isDefault: false,
        id: ''
      })
    } else {
      ElMessage.error(msg || '操作失败')
    }
  })
}

const getList = async () => {
  const searchQuery: DicomScpInfoResponse = {
    orgCode: query.orgCode || '',
    currentPage: page.currentPage,
    pageSize: page.pageSize
  }
  const res = await GetDicomScpInfoList(searchQuery)
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
    <el-card shadow="never" class="padding-none">
      <el-form :inline="true" :model="query" label-width="110px">
        <el-row>
          <el-form-item label="医疗机构标识">
            <el-input v-model="query.orgCode" placeholder="请输入" style="width: 200px" clearable />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleCreate">新增</el-button>
            <el-button type="primary" plain @click="handleSearch">搜索</el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="mt8" shadow="never">
      <el-table
        :data="rows"
        v-loading="loading"
        :style="{ width: '100%' }"
        height="calc(100vh - 270px)"
      >
        <el-table-column prop="orgCode" label="设备机构标识" min-width="180" />
        <el-table-column prop="host" label="设备主机地址" min-width="180" />
        <el-table-column prop="port" label="设备端口" width="90" />
        <el-table-column prop="calledAE" label="设备AE" width="90" />
        <el-table-column prop="callingAE" label="呼叫方AE" width="90" />
        <el-table-column prop="isDefault" label="是否默认" width="90">
          <template #default="{ row }">
            <span>{{ row.isDefault ? '是' : '否' }}</span>
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
        <el-form-item label="设备机构标识" prop="orgCode">
          <el-input v-model="form.orgCode" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="设备主机地址" prop="host">
          <el-input v-model="form.host" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="设备端口" prop="port">
          <el-input v-model="form.port" placeholder="请输入设备端口" />
        </el-form-item>
        <el-form-item label="设备AE" prop="calledAE">
          <el-input v-model="form.calledAE" placeholder="请输入设备AE" />
        </el-form-item>
        <el-form-item label="呼叫方AE" prop="callingAE">
          <el-input v-model="form.callingAE" placeholder="请输入呼叫方AE" />
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-select v-model="form.isDefault" placeholder="请选择是否默认" style="width: 100%">
            <el-option :label="'是'" :value="true" />
            <el-option :label="'否'" :value="false" />
          </el-select>
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
  justify-content: center;
  width: 100%;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}
</style>
