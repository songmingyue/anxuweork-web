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
        height="calc(50vh - 207px)"
        style="width: 100%"
      >
        <el-table-column prop="typeClass" label="字典分类" min-width="140" />
        <el-table-column prop="typeCode" label="类型代码" min-width="180" />
        <el-table-column prop="typeName" label="类型名称" min-width="180" />
        <el-table-column prop="allowCreateItem" label="创建字典项" width="120" />
        <el-table-column prop="allowUpdateItem" label="修改字典项" width="120" />
        <el-table-column prop="allowDeleteItem" label="删除字典项" width="120" />
        <el-table-column prop="memo" label="备注" min-width="240" show-overflow-tooltip />
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
          <el-button
            type="success"
            v-if="selectedType.typeClass === '功能字典'"
            :disabled="!selectedType"
            @click="onCreateItem"
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
        height="calc(50vh - 207px)"
        style="width: 100%"
        :empty-text="selectedType ? '暂无数据' : '请先在上方选择一个类型'"
      >
        <el-table-column prop="itemCode" label="字典代码" min-width="85" />
        <el-table-column prop="itemName" label="字典名称" min-width="85" />
        <el-table-column prop="isDefault" label="是否默认" min-width="85">
          <template #default="{ row }">{{ row.defaultFlag ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column
          prop="itemRepresenExt1"
          label="字典扩展1"
          min-width="90"
          show-overflow-tooltip
        />
        <el-table-column
          prop="itemRepresenExt2"
          label="字典扩展2"
          min-width="90"
          show-overflow-tooltip
        />
        <el-table-column
          prop="itemRepresenExt3"
          label="字典扩展3"
          min-width="90"
          show-overflow-tooltip
        />
        <el-table-column prop="memo" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column
          label="操作"
          width="160"
          fixed="right"
          v-if="selectedType.typeClass === '功能字典'"
        >
          <template #default="{ row }">
            <el-button link type="primary" @click="onEditItem(row)">编辑</el-button>
            <el-button link type="danger" @click="onDeleteItem(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑 字典项 弹窗 -->
    <DataDictItemDialog
      v-model="showItemDlg"
      :title="dlgTitle"
      :model="editRow || undefined"
      :isEdit="!!editRow?.itemCode"
      @save="onItemSave"
    />
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
  ElButton,
  ElPagination,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption
} from 'element-plus'
import DataDictItemDialog from './components/DataDictItemDialog.vue'
import { deletedicitem, DicItem, DictItemRow, getdicitemlist, getdictypelist } from '@/api/authConf'
import { useUserStore } from '@/store/modules/user'

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
const userStore = useUserStore()
const categoryOptions = [
  { label: '功能字典', value: '1' },
  { label: '系统字典', value: '0' }
]

/* 上表：查询、分页与数据 */
const topQuery = reactive({
  category: undefined as '0' | '1' | undefined,
  typeCode: '',
  typeName: ''
})
const topLoading = ref(false)
const topList = ref<DicItem[]>([])
const topPage = ref(1)
const topSize = ref(10)
const topTotal = ref(0)
const selectedType = ref<DicItem>({})

/* 下表：查询与数据（无分页） */
const bottomQuery = reactive({
  itemCode: '',
  itemName: ''
})
const bottomLoading = ref(false)
const bottomList = ref<DictItemRow[]>([])

// 字典项新增/编辑弹窗状态
const showItemDlg = ref(false)
const dlgTitle = ref('新增字典项')
const editRow = ref<Partial<DictItemRow> | null>(null)

/* 事件与方法 */
async function fetchTop() {
  topLoading.value = true
  try {
    const { data, pageBase } = await getdictypelist({
      typeClass: topQuery.category || '0',
      typeCode: topQuery.typeCode || '',
      typeName: topQuery.typeName || '',
      currentPage: topPage.value,
      pageSize: topSize.value
    })
    topTotal.value = pageBase?.totalRecords || 0
    topList.value = data || []
    bottomList.value = []
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
    const { data } = await getdicitemlist({
      ...selectedType.value,
      itemCode: bottomQuery.itemCode,
      itemName: bottomQuery.itemName,
      organizationID: userStore.getorganizationID
    })
    bottomList.value = data || []
  } finally {
    bottomLoading.value = false
  }
}
function onBottomSearch() {
  fetchBottom()
}

function onCreateItem() {
  if (!selectedType.value) return
  dlgTitle.value = '新增字典项'
  editRow.value = {}
  editRow.value = { typeCode: selectedType.value.typeCode }
  showItemDlg.value = true
}
function onEditItem(row: DictItemRow) {
  dlgTitle.value = '编辑字典项'
  editRow.value = { ...row }
  showItemDlg.value = true
}
function onDeleteItem(row: DictItemRow) {
  ElMessageBox.confirm(`确认删除字典项【${row.itemName}】吗？`, '提示', { type: 'warning' })
    .then(async () => {
      // TODO: 删除接口
      const { isSuccess, message } = await deletedicitem(row)
      if (isSuccess) {
        ElMessage.success(message || '已删除')
        fetchBottom()
      } else {
        ElMessage.error(message || '删除失败')
      }
    })
    .catch(() => {})
}

onMounted(fetchTop)
function onItemSave() {
  showItemDlg.value = false
  fetchBottom()
}
</script>

<style scoped>
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
