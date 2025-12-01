<template>
  <div class="page-wrap">
    <el-card>
      <el-input
        v-model="modelInput"
        style="max-width: 600px"
        placeholder="请输入就诊类别"
        class="input-with-select"
        @keyup.enter="getSmsLists"
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
      <el-button type="primary" @click="getSmsLists">搜索</el-button>
    </el-card>
    <el-card class="mt8">
      <el-table :data="roleList" v-loading="loadingRole" style="height: calc(100vh - 220px)">
        <el-table-column prop="accessionNumber" label="检查号" />
        <el-table-column prop="patientClass" label="就诊类别" />
        <el-table-column prop="serviceSectId" label="检查类型">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.serviceSectId }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="contactPhoneNo" label="联系方式" min-width="110" />
        <el-table-column prop="sendTime" label="发送时间" />
        <el-table-column prop="deliveryTime" label="送达时间" />
        <el-table-column prop="" label="发送状态">
          <template #default="{ row }">
            <el-tag type="success" v-if="row.sendState === 1">已发送</el-tag>
            <el-tag v-else type="info">未发送</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="" label="操作">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              v-if="row.contactPhoneNo"
              size="small"
              @click="getPhone(row)"
              >重发</el-button
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
    <el-dialog
      title="发送到"
      width="400px"
      v-model="dialogVisible"
      :before-close="
        () => {
          dialogVisible = false
        }
      "
    >
      <el-radio-group v-model="selectPhoneType">
        <el-radio label="1">原手机号：{{ decryptionPhone }}</el-radio>
        <el-radio label="2">手动输入新手机号</el-radio>
      </el-radio-group>
      <el-input
        v-if="selectPhoneType === '2'"
        v-model="newPhone"
        placeholder="请输入手机号"
        style="margin-top: 15px"
      />
      <template #footer>
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="resetMsg">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
  ElDialog,
  ElRadioGroup,
  ElRadio
} from 'element-plus'
import { getoneSmss, getSmsList, resetSmss, SmsItem } from '@/api/dataConf'

const select = ref('1')
const dialogVisible = ref(false)
const total = ref(0)
const totalPages = ref(0)
const page = ref(1)
const size = ref(20)
const roleList = ref<SmsItem[]>([])
const loadingRole = ref(false)
const form = ref({})
const newPhone = ref('')
const selectPhoneType = ref('1')
const modelInput = ref('')
const changeSelect = (key) => {
  form.value = {}
  switch (key) {
    case '1':
      form.value['accessionNumber'] = modelInput.value
      break
    case '2':
      form.value['name '] = modelInput.value
      break

    default:
      break
  }
}
const getSmsLists = async () => {
  changeSelect(select.value)
  const { data, pageBase } = await getSmsList({
    currentPage: page.value,
    ...form.value,
    pageSize: size.value
  })
  roleList.value = data
  total.value = pageBase?.totalRecords || 0
  totalPages.value = pageBase
    ? Math.max(1, Math.ceil((pageBase.totalRecords || 0) / (pageBase.pageSize || size.value)))
    : 1
  page.value = pageBase?.currentPage || 1
  size.value = pageBase?.pageSize || 20
}
const decryptionPhone = ref('')
const rowValue = ref<SmsItem>({})
const getPhone = async (row) => {
  rowValue.value = row
  const { data } = await getoneSmss(row)
  decryptionPhone.value = data[0]?.contactPhoneNo || ''
  dialogVisible.value = true
}

const resetMsg = async () => {
  loadingRole.value = true
  const { isSuccess, message } = await resetSmss({
    fileUid: rowValue.value.fileUid,
    contactPhoneNo: selectPhoneType.value === '1' ? decryptionPhone.value : newPhone.value
  })
  loadingRole.value = false
  if (isSuccess) {
    getSmsLists()
    dialogVisible.value = false
    ElMessage.success(message)
  } else {
    ElMessage.error(message)
  }
}
const onCancel = () => {
  dialogVisible.value = false
  newPhone.value = ''
  selectPhoneType.value = '1'
}
function onPageChange(p: number) {
  page.value = p
  getSmsLists()
}
function onSizeChange(s: number) {
  size.value = s
  page.value = 1
  getSmsLists()
}
onMounted(() => {
  getSmsLists()
})
</script>

<style>
.mt8 {
  margin-top: 8px;
}
</style>
