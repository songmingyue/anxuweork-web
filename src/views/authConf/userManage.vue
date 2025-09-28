<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
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
  ElButton
} from 'element-plus'
import { getorgList, getRole, StatusOptions, UserInfo } from '@/api/userMessage'

type User = {
  id: string
  name: string
  jobNo: string
  orgName: string
  deptName: string
  officePhone?: string
  privatePhone?: string
  email?: string
  lastLogin?: string
  createUser?: string
  createTime?: string
  remark?: string
  status: '启用' | '停用'
}

type Role = {
  id: string
  roleName: string
  remark?: string
  orgName?: string
  addTime?: string
}
// 查询条件
const filters = reactive<UserInfo>({
  name: '',
  organizationID: '',
  deptID: '',
  status: StatusOptions[0].value
})

const orgOptions = ref([
  { label: '全部机构', value: '' },
  { label: '总院', value: 'org-1' },
  { label: '分院A', value: 'org-2' }
])

const deptOptions = ref([
  { label: '全部科室', value: '' },
  { label: '内科', value: 'dept-1' },
  { label: '外科', value: 'dept-2' }
])

// 列表与分页
const loading = ref(false)
const tableData = ref<User[]>([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 角色列表（选中用户后展示）
const roleList = ref<Role[]>([])

function resetFilters() {
  filters.name = ''
  filters.organizationID = ''
  filters.deptID = ''
  filters.status = StatusOptions[0].value
}

async function fetchUsers() {
  loading.value = true
  try {
    // TODO: 替换为真实接口
    await new Promise((r) => setTimeout(r, 300))
    const all: User[] = [
      {
        id: 'u1',
        name: '张三',
        jobNo: '0001',
        orgName: '总院',
        deptName: '内科',
        officePhone: '010-888888',
        privatePhone: '13800000000',
        email: 'zhangsan@example.com',
        lastLogin: '2025-09-20 10:20:30',
        createUser: 'admin',
        createTime: '2025-01-01 09:00:00',
        remark: '测试用户',
        status: '启用'
      }
    ]
    // 简单过滤模拟
    total.value = 10
    const start = (currentPage.value - 1) * pageSize.value
    tableData.value = all.slice(start, start + pageSize.value)

    // 角色表：可根据选中用户加载
    roleList.value = [
      {
        id: 'r1',
        roleName: '可分配影像管理员',
        remark: '内置角色',
        orgName: '总院',
        addTime: '2018-12-05 10:41:45'
      }
    ]
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchUsers()
}

function handlePageChange(p: number) {
  currentPage.value = p
  fetchUsers()
}

function handleSizeChange(s: number) {
  pageSize.value = s
  currentPage.value = 1
  fetchUsers()
}

function handleCreate() {
  ElMessage.info('点击了“新增用户”')
}

function handleEdit(row: User) {
  ElMessage.info(`编辑用户：${row.name}`)
}

function handleToggle(row: User) {
  const to = row.status === '启用' ? '停用' : '启用'
  ElMessageBox.confirm(`确认将用户【${row.name}】设置为【${to}】吗？`, '提示', { type: 'warning' })
    .then(() => {
      row.status = to as any
      ElMessage.success('操作成功')
    })
    .catch(() => {})
}

function handleDelete(row: User) {
  ElMessageBox.confirm(`确认删除用户【${row.name}】吗？`, '危险操作', { type: 'warning' })
    .then(() => {
      tableData.value = tableData.value.filter((x) => x.id !== row.id)
      ElMessage.success('已删除')
    })
    .catch(() => {})
}

const getRoleList = async () => {
  const data = await getRole({
    organizationID: '02'
  })
  console.log(data, 'data')
}

// const getUserList = async () => {
//   const data = await getUsersList({
//     pageSize: unref(pageSize),
//     currentPage: unref(currentPage)
//   })
//   console.log(data, 'data')
// }

const getOrgList = async () => {
  const data = await getorgList()
  console.log(data, 'datas')
}
onMounted(() => {
  // fetchUsers()
  getRoleList()
  // getUserList()
  // getUserList()
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
      <el-table :data="tableData" v-loading="loading" border style="width: 100%">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="jobNo" label="工号" min-width="100" />
        <el-table-column prop="orgName" label="机构" min-width="120" />
        <el-table-column prop="deptName" label="科室" min-width="120" />
        <el-table-column prop="officePhone" label="办公电话" min-width="120" />
        <el-table-column prop="privatePhone" label="个人电话" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="160" />
        <el-table-column prop="lastLogin" label="最后登录" min-width="160" />
        <el-table-column prop="createUser" label="创建用户" min-width="120" />
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="90" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="handleToggle(row)">{{
              row.status === '启用' ? '停用' : '启用'
            }}</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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
      <el-table :data="roleList" border>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="roleName" label="角色" min-width="160" />
        <el-table-column prop="remark" label="备注" min-width="140" />
        <el-table-column prop="orgName" label="所属机构名称" min-width="160" />
        <el-table-column prop="addTime" label="添加时间" min-width="160" />
      </el-table>
    </el-card>
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
