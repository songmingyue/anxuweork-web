<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox, ElPagination } from 'element-plus'
import { ElTable, ElTableColumn, ElButton, ElSelect, ElCard, ElOption } from 'element-plus'
import { CloudStorageConfig, getOrg, getStorage, storageDelete } from '@/api/paramConf'
import AddStorageMedium from './components/AddStorageMedium.vue'
interface OrgOption {
  label: string
  value: string
}
const searchType = ref('')
const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const dialogFormData = ref<Partial<CloudStorageConfig>>({})
const tableData = ref<CloudStorageConfig[]>()

const orgOptions = ref<OrgOption[]>([])
// 分页相关变量
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

function handleSizeChange(val: number) {
  pageSize.value = val
  getStorageList()
}
function handleCurrentChange(val: number) {
  currentPage.value = val
  getStorageList()
}

const onAdd = () => {
  dialogIsEdit.value = false
  dialogFormData.value = {}
  dialogVisible.value = true
}

function onSearch() {
  currentPage.value = 1
  getStorageList()
}

function onEdit(row: CloudStorageConfig) {
  dialogIsEdit.value = true
  dialogFormData.value = { ...row }
  dialogVisible.value = true
}

async function onDelete(row: CloudStorageConfig) {
  ElMessageBox.confirm('确定删除该存储媒介吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => deleteConfirmed(row))
    .catch(() => {
      /* 取消删除 */
    })
}

const deleteConfirmed = async (row: CloudStorageConfig) => {
  const { isSuccess, message } = await storageDelete(row)
  if (isSuccess) {
    getStorageList()
    ElMessage.success(message || '删除成功')
  } else {
    ElMessage.error(message || '删除失败')
  }
  // 删除逻辑
}

const getStorageList = async () => {
  const { data, pageBase } = await getStorage({
    organizationID: searchType.value,
    currentPage: currentPage.value,
    pageSize: pageSize.value
  })
  tableData.value = data || []
  // 假设后端返回 { total, list }
  total.value = pageBase?.totalRecords || 0
}

const getOrgList = async () => {
  const res = await getOrg()
  const list = Array.isArray(res?.data) ? res.data : []
  orgOptions.value = list.map((o: any) => ({ label: o.organizationName, value: o.organizationID }))
}
// 运行状态

onMounted(() => {
  getStorageList()
  getOrgList()
})

async function onConfirmStorage() {
  dialogVisible.value = false
  getStorageList()
}
</script>
<template>
  <div class="page">
    <el-card shadow="never" class="mb2">
      <div class="class-flex">
        <span style="font-size: 14px; color: #333">检查机构</span>
        <el-select v-model="searchType" style="width: 180px" placeholder="检查机构" clearable>
          <el-option
            v-for="opt in orgOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <span>
          <el-button type="primary" @click="onSearch">查 询</el-button>
          <el-button type="success" @click="onAdd">新增存储媒介</el-button>
        </span>
      </div>
    </el-card>

    <el-card shadow="never" class="card-table nopadding-card-top">
      <el-table
        align="center"
        :header-cell-style="{ textAlign: 'center', background: '#f5f7fa', padding: '13px' }"
        :data="tableData"
        style="width: 100%; margin-bottom: 10px"
        height="calc(100vh - 230px)"
      >
        <el-table-column
          align="center"
          fixed="left"
          prop="mediaUID"
          sortable
          label="媒质UID"
          min-width="290"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="mediaName"
          sortable
          label="媒质名称"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="pathType"
          sortable
          label="路径类型"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="mediaHost"
          min-width="150"
          sortable
          label="媒体主机地址"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="path"
          min-width="120"
          sortable
          label="存储路径"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="currentFlag"
          min-width="150"
          sortable
          label="当前使用标志"
          show-overflow-tooltip
          ><template #default="{ row }">
            <el-tag :type="row.currentFlag ? 'success' : 'warning'">{{
              row.currentFlag ? '是' : '否'
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="createUserUID"
          min-width="145"
          sortable
          label="创建用户ID"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="createUserName"
          min-width="150"
          sortable
          label="创建用户姓名"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="CreateDate"
          min-width="120"
          sortable
          label="创建时间"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="sortNO"
          min-width="120"
          sortable
          label="排序序号"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="accessId"
          min-width="120"
          sortable
          label="访问ID"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="accessKey"
          min-width="120"
          sortable
          label="访问密钥"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="organizationName"
          min-width="120"
          sortable
          label="组织名称"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="storageSize"
          min-width="140"
          sortable
          label="存储总容量"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="isDirect"
          min-width="150"
          sortable
          label="是否直连访问"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="ossId"
          min-width="150"
          sortable
          label=" 对象存储ID"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          prop="usedSize"
          min-width="130"
          sortable
          label="已使用容量"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="onEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
  <AddStorageMedium
    v-if="dialogVisible"
    v-model:visible="dialogVisible"
    :isEdit="dialogIsEdit"
    :formData="dialogFormData"
    :orgOptions="orgOptions"
    @confirm="onConfirmStorage"
  />
</template>

<style scoped>
.mb2 {
  margin-bottom: 8px;
}

.class-flex {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pager {
  display: flex;
  justify-content: center;
  padding: 0;
}
</style>
