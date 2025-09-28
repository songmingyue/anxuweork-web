<template>
  <div class="page">
    <!-- 顶部筛选 -->
    <el-card shadow="never">
      <el-form :inline="true" :model="topQuery" label-width="80px">
        <el-form-item label="字典分类">
          <el-select
            v-model="topQuery.category"
            placeholder="请选择"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="o in categoryOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型代码">
          <el-input
            v-model="topQuery.typeCode"
            placeholder="类型代码"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="类型名称">
          <el-input
            v-model="topQuery.typeName"
            placeholder="类型名称"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onTopSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 上表：有分页 -->
    <el-card class="mt8" shadow="never">
      <el-table
        :data="topList"
        v-loading="topLoading"
        border
        highlight-current-row
        @row-click="onTopRowClick"
        style="width: 100%"
      >
        <el-table-column prop="categoryName" label="字典分类" min-width="140" />
        <el-table-column prop="typeCode" label="类型代码" min-width="180" />
        <el-table-column prop="typeName" label="类型名称" min-width="180" />
        <el-table-column prop="createAllowed" label="创建字典项" width="120">
          <template #default="{ row }">{{ row.createAllowed ? '允许' : '禁止' }}</template>
        </el-table-column>
        <el-table-column prop="updateAllowed" label="修改字典项" width="120">
          <template #default="{ row }">{{ row.updateAllowed ? '允许' : '禁止' }}</template>
        </el-table-column>
        <el-table-column prop="deleteAllowed" label="删除字典项" width="120">
          <template #default="{ row }">{{ row.deleteAllowed ? '允许' : '禁止' }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="240" show-overflow-tooltip />
      </el-table>

      <div class="pager">
        <div class="total">共 {{ topTotal }} 条</div>
        <el-pagination
          background
          layout="sizes, prev, pager, next, jumper"
          :total="topTotal"
          :current-page="topPage"
          :page-size="topSize"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="onTopPageChange"
          @size-change="onTopSizeChange"
        />
      </div>
    </el-card>

    <!-- 下方筛选（不分页，仅过滤当前类型下的字典项） -->
    <el-card class="mt8" shadow="never">
      <el-form :inline="true" :model="bottomQuery" label-width="90px">
        <el-form-item label="字典项代码">
          <el-input
            v-model="bottomQuery.itemCode"
            placeholder="请输入"
            clearable
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item label="字典项名称">
          <el-input
            v-model="bottomQuery.itemName"
            placeholder="请输入"
            clearable
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :disabled="!selectedType" @click="onBottomSearch"
            >搜索</el-button
          >
          <el-button type="success" :disabled="!selectedType" @click="onCreateItem"
            >新增字典项</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 下表：无分页，根据上表选中类型加载 -->
    <el-card shadow="never" class="mt8">
      <el-table
        :data="bottomList"
        v-loading="bottomLoading"
        border
        style="width: 100%"
        :empty-text="selectedType ? '暂无数据' : '请先在上方选择一个类型'"
      >
        <el-table-column prop="code" label="字典代码" min-width="160" />
        <el-table-column prop="name" label="字典名称" min-width="200" />
        <el-table-column prop="isDefault" label="是否默认" width="100">
          <template #default="{ row }">{{ row.isDefault ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column prop="ext1" label="字典扩展1" min-width="160" />
        <el-table-column prop="ext2" label="字典扩展2" min-width="160" />
        <el-table-column prop="ext3" label="字典扩展3" min-width="160" />
        <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="onEditItem(row)">编辑</el-button>
            <el-button link type="danger" @click="onDeleteItem(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  ElMessageBox,
  ElMessage,
  ElTable,
  ElTableColumn,
  ElCard,
  ElInput,
  ElButton
} from 'element-plus'

/* 类型定义（可按实际接口调整） */
type DictTypeRow = {
  category: string
  categoryName: string
  typeCode: string
  typeName: string
  createAllowed: boolean
  updateAllowed: boolean
  deleteAllowed: boolean
  remark?: string
}
type DictItemRow = {
  code: string
  name: string
  isDefault: boolean
  ext1?: string
  ext2?: string
  ext3?: string
  remark?: string
}

const categoryOptions = [
  { label: '功能字典', value: 'func' },
  { label: '业务字典', value: 'biz' }
]

/* 上表：查询、分页与数据 */
const topQuery = reactive({
  category: '',
  typeCode: '',
  typeName: ''
})
const topLoading = ref(false)
const topList = ref<DictTypeRow[]>([])
const topPage = ref(1)
const topSize = ref(10)
const topTotal = ref(0)
const selectedType = ref<null | DictTypeRow>(null)

/* 下表：查询与数据（无分页） */
const bottomQuery = reactive({
  itemCode: '',
  itemName: ''
})
const bottomLoading = ref(false)
const bottomList = ref<DictItemRow[]>([])

/* 模拟接口（请替换为真实请求） */
async function apiFetchTypeList(params: {
  category?: string
  typeCode?: string
  typeName?: string
  pageIndex: number
  pageSize: number
}): Promise<{ total: number; records: DictTypeRow[] }> {
  await new Promise((r) => setTimeout(r, 200))
  const all: DictTypeRow[] = [
    {
      category: 'func',
      categoryName: '功能字典',
      typeCode: 'ADTAction',
      typeName: 'ADT所发生的具体动作',
      createAllowed: true,
      updateAllowed: true,
      deleteAllowed: true,
      remark: 'ADT所发生的具体动作，如入院、转科…'
    },
    {
      category: 'func',
      categoryName: '功能字典',
      typeCode: 'AuditEventType',
      typeName: '审计事件类型',
      createAllowed: true,
      updateAllowed: true,
      deleteAllowed: true,
      remark: '审计事件类型'
    },
    {
      category: 'func',
      categoryName: '功能字典',
      typeCode: 'City',
      typeName: '城市',
      createAllowed: true,
      updateAllowed: true,
      deleteAllowed: true,
      remark: ''
    }
  ]
  // 过滤
  let filtered = all.filter(
    (x) =>
      (!params.category || x.category === params.category) &&
      (!params.typeCode || x.typeCode.toLowerCase().includes(params.typeCode.toLowerCase())) &&
      (!params.typeName || x.typeName.includes(params.typeName))
  )
  const total = filtered.length
  const start = (params.pageIndex - 1) * params.pageSize
  const records = filtered.slice(start, start + params.pageSize)
  return { total, records }
}

async function apiFetchItemList(params: {
  typeCode: string
  itemCode?: string
  itemName?: string
}): Promise<DictItemRow[]> {
  await new Promise((r) => setTimeout(r, 200))
  const map: Record<string, DictItemRow[]> = {
    City: [
      { code: '110100', name: '北京市', isDefault: false, ext1: '直辖市' },
      { code: '310100', name: '上海市', isDefault: false, ext1: '直辖市' }
    ],
    ADTAction: [
      { code: 'A01', name: '入院登记', isDefault: false },
      { code: 'A08', name: '住院信息更新', isDefault: false }
    ]
  }
  let list = map[params.typeCode] || []
  list = list.filter(
    (x) =>
      (!params.itemCode || x.code.includes(params.itemCode)) &&
      (!params.itemName || x.name.includes(params.itemName))
  )
  return list
}

/* 事件与方法 */
async function fetchTop() {
  topLoading.value = true
  try {
    const { total, records } = await apiFetchTypeList({
      category: topQuery.category || undefined,
      typeCode: topQuery.typeCode || undefined,
      typeName: topQuery.typeName || undefined,
      pageIndex: topPage.value,
      pageSize: topSize.value
    })
    topTotal.value = total
    topList.value = records
    // 维持选中行逻辑：若当前选中类型不在本页，清空并清空下表
    if (!records.some((x) => x.typeCode === selectedType.value?.typeCode)) {
      selectedType.value = null
      bottomList.value = []
    }
  } finally {
    topLoading.value = false
  }
}

function onTopSearch() {
  topPage.value = 1
  fetchTop()
}
function onTopPageChange(p: number) {
  topPage.value = p
  fetchTop()
}
function onTopSizeChange(s: number) {
  topSize.value = s
  topPage.value = 1
  fetchTop()
}

async function onTopRowClick(row: DictTypeRow) {
  selectedType.value = row
  await fetchBottom()
}

async function fetchBottom() {
  if (!selectedType.value) return
  bottomLoading.value = true
  try {
    bottomList.value = await apiFetchItemList({
      typeCode: selectedType.value.typeCode,
      itemCode: bottomQuery.itemCode || undefined,
      itemName: bottomQuery.itemName || undefined
    })
  } finally {
    bottomLoading.value = false
  }
}
function onBottomSearch() {
  fetchBottom()
}

function onCreateItem() {
  if (!selectedType.value) return
  ElMessageBox.prompt('请输入字典项名称', '新增字典项', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(async ({ value }) => {
      // TODO: 调用新增接口
      ElMessage.success(`已为 ${selectedType.value?.typeCode} 新增字典项：${value}`)
      fetchBottom()
    })
    .catch(() => {})
}
function onEditItem(row: DictItemRow) {
  // TODO: 打开编辑弹窗
  ElMessageBox.alert(`编辑：${row.code} - ${row.name}`, '编辑字典项')
}
function onDeleteItem(row: DictItemRow) {
  ElMessageBox.confirm(`确认删除字典项【${row.name}】吗？`, '提示', { type: 'warning' })
    .then(() => {
      // TODO: 删除接口
      ElMessage.success('已删除')
      fetchBottom()
    })
    .catch(() => {})
}

onMounted(fetchTop)
</script>

<style scoped>
.page {
  padding: 8px;
}

.mt8 {
  margin-top: 8px;
}

.pager {
  display: flex;
  margin-top: 8px;
  align-items: center;
  justify-content: space-between;
}

.total {
  color: #909399;
}
</style>
