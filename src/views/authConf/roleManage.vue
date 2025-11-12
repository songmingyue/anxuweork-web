<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import {
  ElMessage,
  ElTable,
  ElTableColumn,
  ElCard,
  ElInput,
  ElPagination,
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElOption,
  ElSelect
} from 'element-plus'
import {
  deleteRole,
  editUserRight,
  getRightsList,
  getRolesList,
  createRole,
  updateRole,
  RoleMstInputProto,
  RoleMstProto
} from '@/api/userMessage'
import { useStorage } from '@/hooks/web/useStorage'
// 查询条件（角色名）
const filter = reactive({ roleName: '' })
const { getStorage } = useStorage('localStorage')
// 上表：角色 + 分页
const loadingRole = ref(false)
const roleList = ref<RoleMstInputProto[]>([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 下表：权限
const loadingPerm = ref(false)
const permList = ref<RoleMstProto[]>([])
const permTableRef = ref()
const rolePrimission = reactive<{
  organizationID: string
  roleUID: string
}>({
  organizationID: '',
  roleUID: ''
})

// 角色新增/编辑弹窗相关
const roleDialogVisible = ref(false)
const roleDialogTitle = ref('新增角色信息')
const roleFormRef = ref()
const roleForm = reactive<RoleMstInputProto>({
  roleUID: '',
  roleName: '',
  createUserUID: '',
  createUserName: '',
  createDate: '',
  memo: '',
  organizationID: '',
  organizationName: ''
})
const roleRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  organizationID: [{ required: true, message: '请输入机构ID', trigger: 'blur' }]
}

function resetRoleForm() {
  Object.assign(roleForm, {
    roleUID: '',
    roleName: '',
    memo: '',
    organizationID: '',
    organizationName: ''
  })
}

function handleAddRole() {
  roleDialogTitle.value = '新增角色信息'
  resetRoleForm()
  roleDialogVisible.value = true
}

function handleEdit(row: RoleMstInputProto) {
  roleDialogTitle.value = '编辑角色信息'
  Object.assign(roleForm, row)
  roleDialogVisible.value = true
}

function submitRoleForm() {
  roleFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    const isEdit = !!roleForm.roleUID
    const api = isEdit ? updateRole : createRole
    const { isSuccess, message } = await api(roleForm as any)
    if (isSuccess) {
      ElMessage.success(message || '操作成功')
      roleDialogVisible.value = false
    } else {
      ElMessage.error(message || '操作失败')
    }
  })
}

async function fetchRoles() {
  loadingRole.value = true
  try {
    const data = await getRolesList({
      roleName: filter.roleName,
      currentPage: currentPage.value,
      pageSize: pageSize.value
    })
    total.value = data.pageBase?.totalRecords || 0
    roleList.value = data.data
  } finally {
    loadingRole.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchRoles()
}
function handlePageChange(p: number) {
  currentPage.value = p
  fetchRoles()
}
function handleSizeChange(s: number) {
  pageSize.value = s
  currentPage.value = 1
  fetchRoles()
}
const handleRowClick = async (row?: RoleMstInputProto) => {
  if (row) {
    rolePrimission.organizationID = row.organizationID
    rolePrimission.roleUID = row.roleUID
  }
  loadingPerm.value = true
  try {
    permList.value = (await getRightsList(row)).data || []
    await nextTick()
    if (permTableRef.value) {
      permList.value.forEach((item) => {
        if (item.lAY_CHECKED === 'true') {
          permTableRef.value.toggleRowSelection(item, true)
        }
      })
    }
  } finally {
    loadingPerm.value = false
  }
}
const handleDelete = async (row: RoleMstInputProto) => {
  const { message, isSuccess } = await deleteRole(row)
  if (isSuccess) {
    ElMessage.success(message || '操作成功')
    fetchRoles()
  } else {
    ElMessage.error(message || '操作失败')
  }
}

const handleSelectionChange = async (selection: RoleMstProto[]) => {
  const { message, isSuccess } = await editUserRight({
    organizationID: rolePrimission.organizationID,
    roleUID: rolePrimission.roleUID,
    right: selection
  })
  if (isSuccess) {
    ElMessage.success(message || '操作成功')
  } else {
    ElMessage.error(message || '操作失败')
  }
}
const organizationOptions = ref<
  {
    label: string
    value: string
  }[]
>([])
onMounted(() => {
  organizationOptions.value = getStorage('org') || []
  fetchRoles()
  handleRowClick()
})
</script>

<template>
  <div class="role-manage">
    <!-- 顶部查询与新增 -->
    <el-card shadow="never" class="mb8">
      <div class="toolbar">
        <el-input v-model="filter.roleName" placeholder="角色名称" style="width: 220px" clearable />
        <el-button type="primary" class="ml8" @click="handleSearch">检索</el-button>
        <el-button @click="handleAddRole" class="ml8">新增角色</el-button>
      </div>
    </el-card>

    <!-- 上表：角色列表（分页） -->
    <el-card shadow="never">
      <el-table
        :data="roleList"
        v-loading="loadingRole"
        highlight-current-row
        @row-click="handleRowClick"
        style="width: 100%"
        height="304"
      >
        <el-table-column prop="roleName" label="角色名称" min-width="160" />
        <el-table-column prop="organizationName" label="所属机构名称" min-width="160" />
        <el-table-column prop="memo" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createUserName" label="创建用户" min-width="140" />
        <el-table-column prop="createDate" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="handleEdit(row)"
              >编辑</el-button
            >
            <el-button link type="danger" size="small" @click.stop="handleDelete(row)"
              >删除</el-button
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

    <!-- 下表：权限（不分页） -->
    <el-card shadow="never" class="mt8" header="权限列表">
      <el-table
        :data="permList"
        height="304"
        v-loading="loadingPerm"
        style="width: 100%"
        ref="permTableRef"
        row-key="rightID"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column prop="rightName" label="权限名称" min-width="200" />
        <el-table-column prop="rightID" label="权限ID" min-width="160" />
        <el-table-column prop="rightClass" label="权限分类" min-width="120" />
        <el-table-column prop="memo" label="备注" min-width="160" />
      </el-table>
    </el-card>
  </div>
  <el-dialog v-model="roleDialogVisible" :title="roleDialogTitle" width="520px" destroy-on-close>
    <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="96px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="机构ID" prop="organizationID">
        <el-select v-model="roleForm.organizationID" placeholder="请选择机构" style="width: 100%">
          <el-option
            v-for="org in organizationOptions"
            :key="org.value"
            :label="org.label"
            :value="org.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="memo">
        <el-input v-model="roleForm.memo" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="roleDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitRoleForm">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
}

.ml8 {
  margin-left: 8px;
}

.mb8 {
  margin-bottom: 8px;
}

.mt8 {
  margin-top: 8px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
}
</style>
