<template>
  <div class="page-wrap">
    <el-card>
      <el-input
        v-model="modelInput"
        style="max-width: 600px"
        placeholder="请输入就诊类别"
        class="input-with-select"
        @keyup.enter="getDataList"
      >
        <template #prepend>
          <el-select
            v-model="select"
            placeholder="Select"
            style="width: 115px"
            @change="changeSelect"
          >
            <el-option label="检查号" value="1" />
            <el-option label="姓名" value="2" />
          </el-select>
        </template>
      </el-input>
      <el-button type="primary" @click="getDataList">搜索</el-button>
    </el-card>
    <el-card class="mt8">
      <el-table :data="roleList" v-loading="loadingRole" :style="{ height: 'calc(100vh - 220px)' }">
        <el-table-column
          prop="accessionNumber"
          sortable
          label="检查号"
          min-width="110px"
          fixed="left"
        />
        <el-table-column prop="name" label="姓名" />

        <el-table-column
          prop="organizationName"
          label="医院名称"
          sortable
          min-width="110px"
          show-overflow-tooltip
        />
        <el-table-column prop="serviceSectID" label="检查类型" />
        <el-table-column prop="patientClass" label="就诊类别" />
        <el-table-column prop="mimeType" label="文件类型" min-width="100px" />
        <el-table-column
          prop="contactPhoneNo"
          label="手机号码"
          min-width="110px"
          show-overflow-tooltip
        />
        <el-table-column prop="resultStatusCode" label="状态码" />
        <el-table-column prop="observationDate" label="检查时间" show-overflow-tooltip />
        <el-table-column prop="typeCode" label="影像标志">
          <template #default="{ row }">
            <el-tag v-if="row.typeCode === 'ExamResult'" type="primary">报告</el-tag>
            <el-tag v-if="row.typeCode === 'ExamImage'" type="primary">影像</el-tag>
            <el-tag v-if="row.typeCode === 'ExamFilm'" type="primary">胶片</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="" label="数据状态">
          <template #default="{ row }">
            <el-tag v-if="row.digitalImageNeed === '1'" type="primary">未锁定</el-tag>
            <el-tag type="info" v-else>已锁定</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="" label="操作" width="120px" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" size="small" @click="deleteData(row)">删除</el-button>
            <el-button
              v-if="row.digitalImageNeed === '1'"
              link
              type="warning"
              size="small"
              @click="lockAction(row)"
              >锁定</el-button
            >
            <el-button v-else link type="primary" size="small" @click="lockAction(row)"
              >解锁</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div style="display: flex; margin-top: 10px; justify-content: center">
        <el-pagination
          background
          layout="prev, slot, next, sizes, total"
          :total="total"
          :page-sizes="[20, 50, 100]"
          :page-size="size"
          :current-page="page"
          size="small"
          @size-change="onSizeChange"
          @current-change="onPageChange"
        >
          <span class="page-ratio">{{ page }} / {{ totalPages }}</span>
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import {
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElCard,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElMessage,
  ElTag,
  ElMessageBox
} from 'element-plus'
import { listDoc, DocData, deleteDoc, updatelockDoc } from '@/api/dataConf'

const select = ref('1')
const modelInput = ref('')
const total = ref(0)
const totalPages = ref(0)
const page = ref(1)
const size = ref(20)
const roleList = ref<DocData[]>([])
const loadingRole = ref(false)
const form = ref({})

const changeSelect = (key) => {
  form.value = {}
  switch (key) {
    case '1':
      form.value['accessionNumber'] = modelInput.value
      break
    case '2':
      form.value['name'] = modelInput.value
      break

    default:
      break
  }
}

const lockAction = async (row) => {
  await ElMessageBox.confirm(
    `确定${row.digitalImageNeed === '1' ? '锁定' : '解锁'}该条数据吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      loadingRole.value = true
      const { isSuccess, message } = await updatelockDoc({
        ...row,
        digitalImageNeed: row.digitalImageNeed === '1' ? '0' : '1'
      })
      loadingRole.value = false
      if (isSuccess) {
        getDataList()
        ElMessage.success(message)
      } else {
        ElMessage.error(message)
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消操作'
      })
    })
}

const getDataList = async () => {
  changeSelect(select.value)
  const { data, pageBase } = await listDoc({
    currentPage: page.value,
    ...form.value,
    pageSize: size.value
  })
  roleList.value = (data as any[]) || []
  total.value = pageBase?.totalRecords || 0
  totalPages.value = pageBase
    ? Math.max(1, Math.ceil((pageBase.totalRecords || 0) / (pageBase.pageSize || size.value)))
    : 1
  page.value = pageBase?.currentPage || 1
  size.value = pageBase?.pageSize || 20
}
const deleteData = async (row) => {
  ElMessageBox.confirm('确定删除该条数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await confirmDelete(row)
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除'
      })
    })
}
const confirmDelete = async (row) => {
  loadingRole.value = true
  const { isSuccess, message } = await deleteDoc(row)
  loadingRole.value = false
  if (isSuccess) {
    getDataList()
    ElMessage.success(message)
  } else {
    ElMessage.error(message)
  }
}
function onPageChange(p: number) {
  page.value = p
}
function onSizeChange(s: number) {
  size.value = s
  page.value = 1
}

watch([page, size], () => {
  getDataList()
})
onMounted(() => {
  getDataList()
})
</script>

<style>
.mt8 {
  margin-top: 8px;
}
</style>
