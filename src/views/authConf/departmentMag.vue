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

// 上表：机构查询
const orgQuery = reactive({ orgCode: '', orgName: '' })
const orgLoading = ref(false)
const orgList = ref<
  Array<{
    orgCode: string
    orgName: string
    orgCodeExt?: string
    createdAt?: string
    remark?: string
  }>
>([])
const activeOrg = ref<{ orgCode: string; orgName: string } | null>(null)

// 下表：科室查询 + 分页
const deptQuery = reactive({ deptCode: '', deptName: '' })
const deptLoading = ref(false)
const deptList = ref<
  Array<{
    deptCode: string
    deptName: string
    deptType?: string
    category?: string
    phone?: string
    remark?: string
    deleted?: string
  }>
>([])
const deptTotal = ref(0)
const deptPageSize = ref(10)
const deptCurrent = ref(1)

// TODO: 替换为你的真实接口
async function apiFetchOrganizations(params: { orgCode: string; orgName: string }) {
  await new Promise((r) => setTimeout(r, 200))
  console.log('查询机构，参数：', params)
  return [
    {
      orgCode: '-1',
      orgName: '超管机构',
      orgCodeExt: '—',
      createdAt: '2018-12-05 10:41:45',
      remark: ''
    },
    {
      orgCode: '001',
      orgName: '测试机构',
      orgCodeExt: '—',
      createdAt: '2025-09-25 11:30:29',
      remark: ''
    },
    {
      orgCode: '02',
      orgName: '测试呀',
      orgCodeExt: '—',
      createdAt: '2025-09-25 12:16:49',
      remark: ''
    }
  ]
}

async function apiFetchDepts(params: {
  orgCode: string
  deptCode: string
  deptName: string
  pageIndex: number
  pageSize: number
}) {
  await new Promise((r) => setTimeout(r, 200))
  // 模拟数据与分页
  const all = [
    {
      deptCode: '1001',
      deptName: '内科',
      deptType: '临床',
      category: '医技',
      phone: '010-888888',
      remark: '',
      deleted: '否'
    },
    {
      deptCode: '1002',
      deptName: '外科',
      deptType: '临床',
      category: '医技',
      phone: '010-888889',
      remark: '',
      deleted: '否'
    }
  ]
  const filtered = all.filter(
    (d) =>
      (!params.deptCode || d.deptCode.includes(params.deptCode)) &&
      (!params.deptName || d.deptName.includes(params.deptName))
  )
  const start = (params.pageIndex - 1) * params.pageSize
  return { total: filtered.length, records: filtered.slice(start, start + params.pageSize) }
}

// 加载机构（无分页）
async function loadOrganizations() {
  orgLoading.value = true
  try {
    const list = await apiFetchOrganizations(orgQuery)
    orgList.value = list
    if (!activeOrg.value && list.length) {
      activeOrg.value = { orgCode: list[0].orgCode, orgName: list[0].orgName }
      await loadDepts()
    }
  } finally {
    orgLoading.value = false
  }
}

// 加载科室（有分页）
async function loadDepts() {
  if (!activeOrg.value) {
    deptList.value = []
    deptTotal.value = 0
    return
  }
  deptLoading.value = true
  try {
    const { records, total } = await apiFetchDepts({
      orgCode: activeOrg.value.orgCode,
      deptCode: deptQuery.deptCode,
      deptName: deptQuery.deptName,
      pageIndex: deptCurrent.value,
      pageSize: deptPageSize.value
    })
    deptList.value = records
    deptTotal.value = total
  } finally {
    deptLoading.value = false
  }
}

// 事件
function onSearchOrg() {
  activeOrg.value = null
  loadOrganizations()
}
function onOrgRowClick(row: any) {
  activeOrg.value = { orgCode: row.orgCode, orgName: row.orgName }
  deptCurrent.value = 1
  loadDepts()
}
function onSearchDept() {
  deptCurrent.value = 1
  loadDepts()
}
function onDeptPageChange(p: number) {
  deptCurrent.value = p
  loadDepts()
}
function onDeptSizeChange(s: number) {
  deptPageSize.value = s
  deptCurrent.value = 1
  loadDepts()
}

function onCreateOrgChild(row: any) {
  ElMessage.info(`新增下级机构：${row.orgName}`)
}
function onEditOrg(row: any) {
  ElMessage.info(`编辑机构：${row.orgName}`)
}
function onDeleteOrg(row: any) {
  ElMessage.info(`删除机构：${row.orgName}`)
}

onMounted(() => {
  loadOrganizations()
})
</script>

<template>
  <div class="page org-dept-manage">
    <!-- 上：机构（无分页） -->
    <el-card shadow="never" class="mb8">
      <el-form :inline="true" label-width="90px">
        <el-form-item label="机构编号">
          <el-input
            v-model="orgQuery.orgCode"
            placeholder="请输入"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="机构名称">
          <el-input
            v-model="orgQuery.orgName"
            placeholder="请输入"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearchOrg">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" class="mb8">
      <el-table
        :data="orgList"
        v-loading="orgLoading"
        border
        highlight-current-row
        @row-click="onOrgRowClick"
        style="width: 100%"
      >
        <el-table-column prop="orgCode" label="机构编号" min-width="120" />
        <el-table-column prop="orgName" label="机构名称" min-width="200" />
        <el-table-column prop="orgCodeExt" label="组织机构代码" min-width="160" />
        <el-table-column prop="createdAt" label="创建时间" min-width="180" />
        <el-table-column prop="remark" label="备注" min-width="160" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click.stop="onCreateOrgChild(row)"
              >新增下级机构</el-button
            >
            <el-button size="small" @click.stop="onEditOrg(row)">编辑</el-button>
            <el-button size="small" type="danger" @click.stop="onDeleteOrg(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 上表不分页：不放 el-pagination 即可 -->

    <!-- 分割线 -->
    <el-divider />

    <!-- 下：科室（有分页） -->
    <el-card shadow="never" class="mb8">
      <el-form :inline="true" label-width="90px">
        <el-form-item label="科室编号">
          <el-input
            v-model="deptQuery.deptCode"
            placeholder="请输入"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="科室名称">
          <el-input
            v-model="deptQuery.deptName"
            placeholder="请输入"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearchDept" :disabled="!activeOrg">搜索</el-button>
          <el-button @click="() => ElMessage.info('新增科室')">新增科室</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" class="mb8">
      <el-table :data="deptList" v-loading="deptLoading" border style="width: 100%">
        <el-table-column prop="deptCode" label="科室编号" min-width="120" />
        <el-table-column prop="deptName" label="科室名称" min-width="160" />
        <el-table-column prop="deptType" label="科室类型" min-width="120" />
        <el-table-column prop="category" label="医技科室分类" min-width="140" />
        <el-table-column prop="phone" label="电话" min-width="140" />
        <el-table-column prop="remark" label="备注" min-width="160" />
        <el-table-column prop="deleted" label="删除" width="80" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="ElMessage.info(row)">编辑</el-button>
            <el-button link type="danger" @click.stop="ElMessage.info(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="deptTotal"
          :page-size="deptPageSize"
          :current-page="deptCurrent"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="onDeptPageChange"
          @size-change="onDeptSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
