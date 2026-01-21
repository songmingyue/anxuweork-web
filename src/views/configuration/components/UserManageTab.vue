<script setup lang="ts">
import { computed, onMounted, PropType, reactive, ref, nextTick } from 'vue'
import {
  ElButton,
  ElCard,
  ElEmpty,
  ElCheckbox,
  ElCheckboxGroup,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElMessage,
  ElMessageBox
} from 'element-plus'
import CryptoJS from 'crypto-js'
import {
  AdminConfig,
  DepartmentItem,
  getDepartment,
  getUserPermissionList,
  registerUser,
  resetPassword,
  UserConfig,
  UserPermissionList
} from '@/api/configuration'
const props = defineProps({
  adminConfigInfo: {
    type: Object as PropType<AdminConfig>,
    required: false,
    default: (): AdminConfig => ({ printerConfig: [] })
  }
})

const tableData = ref<UserConfig[]>([])
const tableRef = ref<any>(null)
const currentRow = ref<UserConfig | null>(null)
const previousRow = ref<UserConfig | null>(null)
const mode = ref<'view' | 'create' | 'edit'>('view')

const isCreateMode = computed(() => mode.value === 'create')
const isEditMode = computed(() => mode.value === 'edit')
const isViewMode = computed(() => mode.value === 'view')
const isFormDisabled = computed(() => mode.value === 'view')
const canClickNew = computed(() => mode.value === 'view')

const defaultForm: UserConfig = {
  userID: '',
  account: '',
  userName: '',
  password: '',
  dateCreated: '',
  departmentCode: '',
  permission: null,
  role: ''
}

interface FormCreate extends UserConfig {
  confirmPassword: string
}

const form = reactive<FormCreate>({ ...defaultForm, confirmPassword: '' })

const permissionList = ref<UserPermissionList[]>([])
const permissionChecked = ref<string[]>([])

const syncPermissionToForm = () => {
  form.permission = permissionChecked.value.length ? 1 : null
}

const fillFormFromRow = (row: UserConfig | null) => {
  if (!row) {
    Object.assign(form, { ...defaultForm, confirmPassword: '' })
    permissionChecked.value = []
    return
  }

  Object.assign(form, {
    ...defaultForm,
    ...row,
    confirmPassword: ''
  })
  permissionChecked.value = row.permission ? [String(row.permission)] : []
}

const clearAllFields = () => {
  Object.assign(form, { ...defaultForm, confirmPassword: '' })
  permissionChecked.value = []
}

const clearAllExceptAccount = () => {
  const keepAccount = form.account
  const keepUserId = form.userID
  Object.assign(form, {
    ...defaultForm,
    userID: keepUserId,
    account: keepAccount,
    confirmPassword: ''
  })
  permissionChecked.value = []
}

const onNew = () => {
  previousRow.value = currentRow.value
  mode.value = 'create'
  clearAllFields()
}

const onEdit = () => {
  if (!currentRow.value) {
    ElMessage.warning('请先选择一条数据')
    return
  }
  previousRow.value = currentRow.value
  mode.value = 'edit'
  fillFormFromRow(currentRow.value)
}

const onCancel = () => {
  mode.value = 'view'
  // 取消后回到图1状态：回填当前选中行（若有）
  const row = currentRow.value ?? previousRow.value
  currentRow.value = row
  fillFormFromRow(row)
}

const onResetPassword = async () => {
  if (!form.account?.trim()) {
    ElMessage.warning('请先选择用户')
    return
  }

  try {
    await ElMessageBox.confirm('是否确定重置密码？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const { status, desc } = await resetPassword({ account: form.account })
    if (status === 0) {
      ElMessage.success('重置成功')
    } else {
      ElMessage.error(desc || '重置失败')
    }
  } catch {
    // 用户取消
  }
}

const onSave = async () => {
  syncPermissionToForm()

  if (isCreateMode.value && form.password !== form.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  const payload = {
    userID: form.userID,
    account: form.account,
    userName: form.userName,
    password: CryptoJS.MD5(form.password).toString(),
    dateCreated: form.dateCreated,
    departmentCode: form.departmentCode,
    permission: String(form.permission ?? 0),
    role: form.role
  }

  const { status, desc } = await registerUser(payload as any)
  if (status === 0) {
    ElMessage.success('保存成功')
    mode.value = 'view'
    // 保存后回到图1：保持当前行显示（若新增可按需要刷新列表，这里不额外增加 UX）
  } else {
    ElMessage.error(desc || '保存失败')
  }
}

const onReset = () => {
  if (isCreateMode.value) {
    clearAllFields()
    return
  }

  if (isEditMode.value) {
    clearAllExceptAccount()
  }
}

// const submit = () => {
//   onSave()
// }
const getUserPermission = async () => {
  permissionList.value = await getUserPermissionList()
}

onMounted(async () => {
  tableData.value = props.adminConfigInfo.userConfig || []
  if (tableData.value.length > 0) {
    await nextTick()
    const first = tableData.value[0]
    fillFormFromRow(first)
    tableRef.value?.setCurrentRow?.(first)
    tableRef.value?.toggleRowSelection?.(first, true)
    currentRow.value = first
    mode.value = 'view'
  }
  getUserPermission()
  getDepartmentList()
})
const departmentList = ref<DepartmentItem[]>([])
const getDepartmentList = async () => {
  const { data } = await getDepartment()
  departmentList.value = data
}

const selectRow = (row: UserConfig) => {
  currentRow.value = row
  mode.value = 'view'
  fillFormFromRow(row)
  // 选择行事件
}

// defineExpose<ConfigTabExpose>({ submit, reset })
</script>

<template>
  <el-card shadow="never" class="tab-card">
    <div class="tab-header">
      <div class="tab-title">用户管理</div>
      <div class="tab-actions">
        <el-button type="primary" plain :disabled="!canClickNew" @click="onNew">新增</el-button>
        <el-button @click="onCancel">取消</el-button>
        <el-button disabled>删除</el-button>
      </div>
    </div>

    <el-table
      ref="tableRef"
      :data="tableData"
      border
      height="260"
      class="table"
      @row-click="selectRow"
      highlight-current-row
    >
      <el-table-column type="selection" width="40" />
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="account" label="账号" min-width="120" />
      <el-table-column prop="userName" label="用户名" min-width="120" />
      <el-table-column prop="departmentCode" label="科室" min-width="120" />
      <el-table-column prop="role" label="权限角色" min-width="120">
        <template #default="scope">
          <span v-if="scope.row.role === '0'">管理员</span>
          <span v-else-if="scope.row.role === '1'">护士</span>
        </template>
      </el-table-column>
      <el-table-column prop="dateCreated" label="创建时间" min-width="140" />

      <template #empty>
        <div class="table-empty"><el-empty description="暂无数据" /></div>
      </template>
    </el-table>

    <div class="form-wrap">
      <el-form :model="form" label-width="110px" @submit.prevent :disabled="isFormDisabled">
        <div class="grid">
          <el-form-item label="账号：" required>
            <el-input v-model="form.account" placeholder="账号" :disabled="!isCreateMode" />
          </el-form-item>

          <el-form-item label="用户名：" required>
            <el-input v-model="form.userName" placeholder="用户名" clearable />
          </el-form-item>

          <el-form-item label="密码：" required v-if="isCreateMode">
            <el-input
              v-model="form.password"
              type="password"
              clearable
              show-password
              placeholder="密码"
            />
          </el-form-item>

          <el-form-item label="确认密码：" required v-if="isCreateMode">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              show-password
              placeholder="确认密码"
            />
          </el-form-item>

          <el-form-item label="科室：" required>
            <el-select v-model="form.departmentCode" placeholder="科室" style="width: 100%">
              <el-option
                v-for="dept in departmentList"
                :key="dept.departmentCode"
                :label="dept.departmentName"
                :value="dept.departmentCode"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="角色：" required>
            <el-radio-group v-model="form.role">
              <el-radio-button value="0">管理员</el-radio-button>
              <el-radio-button value="1">护士</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="权限：" v-if="form.role === '1'">
            <el-checkbox-group v-model="permissionChecked" @change="syncPermissionToForm">
              <el-checkbox v-for="p in permissionList" :key="p.value" :label="p.value">
                {{ p.text }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>
      </el-form>
      <div class="bottom-actions">
        <template v-if="isViewMode">
          <el-button plain :disabled="false" @click="onResetPassword">重置密码</el-button>
          <el-button type="primary" plain :disabled="false" @click="onEdit">修改信息</el-button>
        </template>

        <template v-else-if="isCreateMode">
          <el-button type="primary" plain @click="onSave">保存</el-button>
          <el-button @click="onReset">重置</el-button>
        </template>

        <template v-else>
          <el-button plain @click="onResetPassword">重置密码</el-button>
          <el-button type="primary" plain @click="onSave">保存</el-button>
          <el-button @click="onReset">重置</el-button>
        </template>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.tab-card {
  min-height: 620px;
}

.tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px 14px;
}

.tab-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.tab-actions {
  display: flex;
  gap: 10px;
}

.table {
  width: 100%;
}

.table-empty {
  padding: 40px 0;
}

.form-wrap {
  margin-top: 16px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px 20px;
  max-width: 620px;
}

.bottom-actions {
  display: flex;
  margin-top: 12px;
  justify-content: center;
  gap: 12px;
}
</style>
