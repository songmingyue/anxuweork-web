<script setup lang="ts">
import { ref } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElRow,
  ElCol,
  ElSelect,
  ElOption,
  ElSwitch
} from 'element-plus'
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

const onAdd = () => {
  dialogMsg.value.isShowDialog = true
}

function onSearch() {
  // 查询逻辑
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
</script>
<template>
  <div>
    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="4">
        <el-select v-model="searchType" placeholder="检索机构">
          <el-option label="南院区" value="南院区" />
          <el-option label="北院区" value="北院区" />
        </el-select>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="onSearch">查 询</el-button>
        <el-button type="success" @click="onAdd">新建存储媒介</el-button>
      </el-col>
    </el-row>
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="mediaUid" label="媒质UID" show-overflow-tooltip />
      <el-table-column prop="mediaName" label="媒质名称" show-overflow-tooltip />
      <el-table-column prop="mediaType" label="媒质类型" show-overflow-tooltip />
      <el-table-column prop="pathType" label="路径类型" show-overflow-tooltip />
      <el-table-column prop="path" label="路径/地址" show-overflow-tooltip />
      <el-table-column prop="subDir" label="子目录" show-overflow-tooltip />
      <el-table-column prop="orgName" label="机构名称" show-overflow-tooltip />
      <el-table-column prop="desc" label="描述" show-overflow-tooltip />
      <el-table-column prop="status" label="运行状态" width="150">
        <template #default="{ row }">
          <el-switch v-model="row.status" active-text="启用" inactive-text="停用" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="onEdit(row)">编辑</el-button>
          <el-button type="text" size="small" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <!-- <AddStorageMedium ref="addDialog" @success="onAddSuccess" /> -->
</template>
