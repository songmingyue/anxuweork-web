<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  ElMessage,
  ElTable,
  ElTableColumn,
  ElCard,
  ElInput,
  ElPagination,
  ElButton
} from 'element-plus'
import { getrolelist } from '@/api/authConf'
type Role = {
  id: string
  roleName: string
  orgName?: string
  remark?: string
  createUser?: string
  createTime?: string
}
type Permission = {
  id: string
  name: string
  code: string
  category?: string
  remark?: string
}

// 查询条件（角色名）
const filter = reactive({ roleName: '' })

// 上表：角色 + 分页
const loadingRole = ref(false)
const roleList = ref<Role[]>([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 下表：权限
const loadingPerm = ref(false)
const permList = ref<Permission[]>([])
const activeRoleId = ref<string>('')

// 模拟请求（替换为你的接口）
async function apiFetchRoles(params: { roleName: string; page: number; size: number }) {
  await new Promise((r) => setTimeout(r, 200))
  const all: Role[] = [
    {
      id: 'r1',
      roleName: '医技用户',
      orgName: '总院',
      remark: '内置角色',
      createUser: '系统初始化创建',
      createTime: '2018-12-05 10:41:45'
    },
    {
      id: 'r2',
      roleName: '医技用户',
      orgName: '超管机构',
      remark: '内置角色',
      createUser: '系统初始化创建',
      createTime: '2018-12-05 10:41:45'
    },
    {
      id: 'r3',
      roleName: '医技用户',
      orgName: '测试机构',
      remark: '内置角色',
      createUser: '系统初始化创建',
      createTime: '2025-09-25 11:30:29'
    },
    {
      id: 'r4',
      roleName: '医技用户',
      orgName: '测试呀',
      remark: '内置角色',
      createUser: '系统初始化创建',
      createTime: '2025-09-25 12:16:49'
    },
    {
      id: 'r5',
      roleName: '医技用户',
      orgName: '测试呀',
      remark: '内置角色',
      createUser: '系统初始化创建',
      createTime: '2025-09-25 12:16:49'
    },
    {
      id: 'r6',
      roleName: '医技用户',
      orgName: '测试呀',
      remark: '内置角色',
      createUser: '系统初始化创建',
      createTime: '2025-09-25 12:16:49'
    },
    {
      id: 'r7',
      roleName: '医技用户',
      orgName: '测试呀',
      remark: '内置角色',
      createUser: '系统初始化创建',
      createTime: '2025-09-25 12:16:49'
    },
    {
      id: 'r8',
      roleName: '医技用户',
      orgName: '测试呀',
      remark: '内置角色',
      createUser: '系统初始化创建',
      createTime: '2025-09-25 12:16:49'
    },
    {
      id: 'r9',
      roleName: '医技用户',
      orgName: '测试呀',
      remark: '内置角色',
      createUser: '系统初始化创建',
      createTime: '2025-09-25 12:16:49'
    },
    {
      id: 'r10',
      roleName: '医技用户',
      orgName: '测试呀',
      remark: '内置角色',
      createUser: '系统初始化创建',
      createTime: '2025-09-25 12:16:49'
    }
  ]
  const filtered = params.roleName ? all.filter((r) => r.roleName.includes(params.roleName)) : all
  const start = (params.page - 1) * params.size
  return { total: filtered.length, records: filtered.slice(start, start + params.size) }
}

async function apiFetchPermissions() {
  await new Promise((r) => setTimeout(r, 150))
  const all: Permission[] = [
    { id: 'p1', name: '检查信息', code: '00-01-00', category: '模块' },
    { id: 'p2', name: '检查信息医生', code: '00-01-00-01', category: '模块' },
    { id: 'p3', name: '检查信息部门', code: '00-01-00-02', category: '模块' },
    { id: 'p4', name: '浏览申请单', code: '00-01-00-04', category: '数据' },
    { id: 'p5', name: '浏览报告', code: '00-01-00-05', category: '数据' },
    { id: 'p6', name: '浏览胶片', code: '00-01-00-06', category: '数据' },
    { id: 'p7', name: '浏览影像', code: '00-01-00-07', category: '数据' }
  ]
  return all // 直接返回全量
}

async function fetchRoles() {
  loadingRole.value = true
  try {
    const { total: t, records } = await apiFetchRoles({
      roleName: filter.roleName,
      page: currentPage.value,
      size: pageSize.value
    })
    total.value = t
    roleList.value = records
    // 默认选中第一条并加载权限
    if (records.length) {
      handleRowClick(records[0])
    } else {
      activeRoleId.value = ''
      permList.value = []
    }
  } finally {
    loadingRole.value = false
  }
}

async function fetchPerms() {
  loadingPerm.value = true
  try {
    permList.value = await apiFetchPermissions()
  } finally {
    loadingPerm.value = false
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
function handleRowClick(row: Role) {
  activeRoleId.value = row.id
  fetchPerms()
}
function handleEdit(row: Role) {
  ElMessage.info(`编辑角色：${row.roleName}`)
}
function handleDelete(row: Role) {
  ElMessage.info(`删除角色：${row.roleName}`)
}
const getRoleListApi = async () => {
  await getrolelist()
}
onMounted(() => {
  fetchRoles()
  getRoleListApi()
})
</script>

<template>
  <div class="role-manage">
    <!-- 顶部查询与新增 -->
    <el-card shadow="never" class="mb8">
      <div class="toolbar">
        <el-input v-model="filter.roleName" placeholder="角色名称" style="width: 220px" clearable />
        <el-button type="primary" class="ml8" @click="handleSearch">检索</el-button>
        <el-button class="ml8">新增角色</el-button>
      </div>
    </el-card>

    <!-- 上表：角色列表（分页） -->
    <el-card shadow="never">
      <el-table
        :data="roleList"
        v-loading="loadingRole"
        border
        highlight-current-row
        @row-click="handleRowClick"
        style="width: 100%"
        height="304"
      >
        <el-table-column prop="roleName" label="角色名称" min-width="160" />
        <el-table-column prop="orgName" label="所属机构名称" min-width="160" />
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createUser" label="创建用户" min-width="140" />
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click.stop="handleDelete(row)">删除</el-button>
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
      <el-table :data="permList" height="304" v-loading="loadingPerm" border style="width: 100%">
        <el-table-column type="selection" width="48" />
        <el-table-column prop="name" label="权限名称" min-width="200" />
        <el-table-column prop="code" label="权限ID" min-width="160" />
        <el-table-column prop="category" label="权限分类" min-width="120" />
        <el-table-column prop="remark" label="备注" min-width="160" />
      </el-table>
    </el-card>
  </div>
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
