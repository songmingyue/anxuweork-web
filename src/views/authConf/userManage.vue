<script setup lang="ts">
import { ref, reactive, onMounted, unref, nextTick } from 'vue'
import {
  ElMessage,
  ElMessageBox,
  ElTable,
  ElTableColumn,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElButton,
  ElOption,
  ElPagination,
  ElSwitch
} from 'element-plus'
import {
  getorgList,
  getRole,
  StatusOptions,
  UserInfo,
  getUsers,
  UserOnce,
  disableUser,
  resetUser,
  RoleData,
  createUser,
  addUserRoles
} from '@/api/userMessage'
import { OrganizationList } from '@/api/login/types'
import UserFormDialog from './components/UserFormDialog.vue'

// 查询条件
const filters = reactive<UserInfo>({
  name: '',
  organizationID: '',
  deptID: '',
  status: StatusOptions[0].value
})

const orgOptions = ref<{ label: string; value: string }[]>([])

const deptOptions = ref([
  { label: '全部科室', value: '' },
  { label: '内科', value: 'dept-1' },
  { label: '外科', value: 'dept-2' }
])

// 列表与分页
const loading = ref(false)
const tableData = ref<UserOnce[]>([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 角色列表（选中用户后展示）
const roleList = ref<RoleData[]>([])
const roleTableRef = ref<InstanceType<typeof ElTable> | null>(null)
const currentUser = ref<UserOnce | null>(null)
const initializingRoles = ref(false) // 避免初始化时触发保存
const prevSelectedRoleUIDs = ref<string[]>([])

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const editRow = reactive<UserOnce>({} as UserOnce)

function resetFilters() {
  filters.name = ''
  filters.organizationID = ''
  filters.deptID = ''
  filters.status = StatusOptions[0].value
  getUserList()
}

function handleSearch() {
  currentPage.value = 1
  getUserList()
}

function handlePageChange(p: number) {
  currentPage.value = p
}

function handleSizeChange(s: number) {
  pageSize.value = s
  currentPage.value = 1
}

function handleCreate() {
  isEdit.value = false
  dialogVisible.value = true
}

function handleEdit(row: UserOnce) {
  isEdit.value = true
  Object.assign(editRow, row)
  dialogVisible.value = true
}

async function handlePassword(row: UserOnce) {
  await ElMessageBox.confirm(`确认重置用户【${row.name}】的密码吗？`, '危险操作', {
    type: 'warning'
  })
  const data = await resetUser(row)
  ElMessage.success(data.message || '操作成功')
  ElMessageBox.confirm('密码已重置为初始密码TomTaw@HZ1993，', '提示', {
    type: 'success',
    confirmButtonText: '复制',
    cancelButtonText: '我知道了'
  }).then(() => {
    navigator.clipboard.writeText('TomTaw@HZ1993')
    ElMessage.success('已复制到剪贴板')
  })
}

const isRowChecked = (row: any) => {
  // 后端可能返回多种命名：lAY_CHECKED / lAYChecked / layChecked / checked
  const v =
    row?.lAY_CHECKED ?? row?.lAYChecked ?? row?.LAY_CHECKED ?? row?.layChecked ?? row?.checked
  return v === true || v === 'true' || v === '1' || v === 1 || v === '是'
}

const syncRoleSelection = async () => {
  if (!roleTableRef.value) return
  initializingRoles.value = true
  await nextTick()
  roleTableRef.value!.clearSelection()
  roleList.value.forEach((row) => {
    if (isRowChecked(row)) {
      roleTableRef.value!.toggleRowSelection(row, true)
    }
  })
  prevSelectedRoleUIDs.value = roleList.value.filter(isRowChecked).map((r: any) => r.roleUID)
  // 小延迟避免紧跟着触发 selection-change
  setTimeout(() => (initializingRoles.value = false), 0)
}

const getRoleList = async (userUID: string) => {
  const data = await getRole({ userUID })
  roleList.value = data.data || []
  await syncRoleSelection()
}

const getUserList = async () => {
  const data = await getUsers({
    pageSize: unref(pageSize),
    currentPage: unref(currentPage),
    ...filters
  })
  total.value = data.pageBase?.totalRecords || 0
  tableData.value = data.data || []
}

const getOrgList = async () => {
  const data = await getorgList()
  orgOptions.value = data.data.map((org: OrganizationList) => ({
    label: org.organizationName,
    value: org.organizationID
  }))
  filters.organizationID = orgOptions.value[0]?.value || ''
  await getUserList()
  if (tableData.value.length > 0) {
    currentUser.value = tableData.value[0]
    await getRoleList(tableData.value[0].userUID)
  }
}

const changeStatus = async (row: UserOnce) => {
  const to = row.status ? '启用' : '停用'
  try {
    await ElMessageBox.confirm(`确认将用户【${row.name}】设置为【${to}】吗？`, '提示', {
      type: 'warning'
    })
    const data = await disableUser(row.userUID, row.status)
    ElMessage.success(data.message || '操作成功')
    getUserList()
  } catch {
    row.status = !row.status // 取消操作，恢复原状态
  }
}

const handleCurrentChange = (val: UserOnce) => {
  currentUser.value = val
  getRoleList(val.userUID)
}

const onRoleSelectionChange = async (selection: RoleData[]) => {
  if (initializingRoles.value) return
  if (!currentUser.value) return
  try {
    await addUserRoles({
      organizationID: currentUser.value.organizationID,
      userUID: currentUser.value.userUID,
      right: selection
    })
    ElMessage.success('已更新用户角色')
    // getRoleList(currentUser.value.userUID)
  } catch (e: any) {
    getRoleList(currentUser.value.userUID)
  }
}

const handleUserConfirm = async (formData: UserOnce) => {
  const data = await createUser(formData)
  ElMessage.success(data.message || '操作成功')
  dialogVisible.value = false
  getUserList()
}

onMounted(() => {
  getOrgList()
})
</script>

<template>
  <div class="page user-manage">
    <el-card shadow="never">
      <el-form :inline="true" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="filters.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="机构">
          <el-select
            v-model="filters.organizationID"
            placeholder="请选择"
            clearable
            style="width: 180px"
          >
            <el-option v-for="o in orgOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="科室">
          <el-select v-model="filters.deptID" placeholder="请选择" clearable style="width: 180px">
            <el-option v-for="d in deptOptions" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="请选择" clearable style="width: 180px">
            <el-option
              v-for="d in StatusOptions"
              :key="d.value"
              :label="d.label"
              :value="d.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">检索</el-button>
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="success" @click="handleCreate">新增用户</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt8" shadow="never">
      <el-table
        :data="tableData"
        v-loading="loading"
        highlight-current-row
        style="width: 100%"
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="name" label="姓名" min-width="100" show-overflow-tooltip />
        <el-table-column prop="workNO" label="工号" min-width="100" show-overflow-tooltip />
        <el-table-column
          prop="organizationName"
          label="机构"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column prop="deptName" label="科室" min-width="120" show-overflow-tooltip />
        <el-table-column
          prop="officePhone"
          label="办公电话"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="privatePhone"
          label="个人电话"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column prop="email" label="邮箱" min-width="160" show-overflow-tooltip />
        <el-table-column
          prop="lastLogonTime"
          label="最后登录"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          prop="createUserName"
          label="创建用户"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column prop="createDate" label="创建时间" min-width="160" show-overflow-tooltip />
        <el-table-column prop="memo" label="备注" min-width="140" show-overflow-tooltip />
        <el-table-column label="状态" width="140">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              size="small"
              :active-value="true"
              :inactive-value="false"
              active-text="启用"
              inactive-text="停用"
              @change="changeStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button link size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link size="small" type="danger" @click="handlePassword(row)"
              >重置密码</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-card class="mt8" shadow="never" header="角色列表">
      <el-table
        :data="roleList"
        border
        ref="roleTableRef"
        row-key="roleUID"
        @selection-change="onRoleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="roleName" label="角色" min-width="160" show-overflow-tooltip />
        <el-table-column prop="memo" label="备注" min-width="140" show-overflow-tooltip />
        <el-table-column
          prop="organizationName"
          label="所属机构名称"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column prop="createDate" label="添加时间" min-width="160" show-overflow-tooltip />
      </el-table>
    </el-card>

    <UserFormDialog
      v-model:visible="dialogVisible"
      :isEdit="isEdit"
      :formData="editRow"
      :orgOptions="orgOptions"
      :deptOptions="deptOptions"
      @confirm="handleUserConfirm"
    />
  </div>
</template>

<style scoped>
.mt8 {
  margin-top: 8px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
