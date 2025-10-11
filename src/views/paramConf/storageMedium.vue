<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElPagination } from 'element-plus'
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElRow,
  ElCol,
  ElSelect,
  ElCard,
  ElOption,
  ElSwitch
} from 'element-plus'
import { getOrg, getStorage } from '@/api/paramConf'
// import { AddStorageMedium } from './components/AddStorageMedium.vue' // 引入新增存储媒介组件
const searchType = ref('')
const dialogMsg = ref({
  isShowDialog: false
})
const tableData = ref([
  {
    mediaUid: '3A0C1F78-4896-42A1-8618-B1D10126C12A',
    mediaName: '本地存储',
    mediaType: '文件存储',
    pathType: '文档存储',
    path: 'E:\\DATA\\files',
    subDir: '',
    orgName: '哈尔滨市方正县人民医院',
    desc: '',
    status: true
  },
  {
    mediaUid: '820B0961-DE34-436A-AAA3-B1D2017EBC71',
    mediaName: '云存储',
    mediaType: '云存储',
    pathType: '云存储',
    path: 'ewyd3',
    subDir: 'U6LAK8ATCDB... 哈尔滨市方正县人民医院',
    orgName: '哈尔滨市方正县人民医院',
    desc: '',
    status: true
  }
])

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
  dialogMsg.value.isShowDialog = true
}

function onSearch() {
  getStorageList()
}

function onEdit(row: any) {
  console.log('编辑', row)
  // 编辑逻辑
}

function onDelete(row: any) {
  console.log('删除', row)
  // 删除逻辑
}
// const onAddSuccess = (newData: any) => {
//   tableData.value.push(newData)
// }

const getTableList = async () => {
  const aa = await getOrg()
  console.log('aa', aa)
  // 获取表格数据逻辑
}

const getStorageList = async () => {
  const res = await getStorage({
    currentPage: currentPage.value,
    pageSize: pageSize.value
  })
  // 假设后端返回 { total, list }
  if (res) {
    console.log('res', res)
    tableData.value = res.data || []
    total.value = res.total || 0
  }
}
onMounted(() => {
  getTableList()
  getStorageList()
})
</script>
<template>
  <div>
    <el-card shadow="never" class="mb2">
      <el-row :gutter="4">
        <el-col :span="4">
          <el-select v-model="searchType" placeholder="检索机构" clearable>
            <el-option label="南院区" value="南院区" />
            <el-option label="北院区" value="北院区" />
          </el-select>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" @click="onSearch">查 询</el-button>
          <el-button type="success" @click="onAdd">新建存储媒介</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="mediaUid" sortable label="媒质UID" show-overflow-tooltip />
        <el-table-column prop="mediaName" sortable label="媒质名称" show-overflow-tooltip />
        <el-table-column prop="mediaType" sortable label="媒质类型" show-overflow-tooltip />
        <el-table-column prop="pathType" sortable label="路径类型" show-overflow-tooltip />
        <el-table-column prop="path" sortable label="路径/地址" show-overflow-tooltip />
        <el-table-column prop="subDir" sortable label="子目录" show-overflow-tooltip />
        <el-table-column prop="orgName" sortable label="机构名称" show-overflow-tooltip />
        <el-table-column prop="desc" sortable label="描述" show-overflow-tooltip />
        <el-table-column prop="status" label="运行状态" width="150">
          <template #default="{ row }">
            <el-switch v-model="row.status" size="small" active-text="启用" inactive-text="停用" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="onEdit(row)">编辑</el-button>
            <el-button type="text" size="small" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="mt-4 mb-4"
      />
    </el-card>
  </div>
  <!-- <AddStorageMedium ref="addDialog" @success="onAddSuccess" /> -->
</template>
