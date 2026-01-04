<template>
  <div class="page-wrap">
    <el-card class="sms-header">
      <template #header> 短信查询 </template>
      <el-input
        v-model="modelInput"
        style="max-width: 600px"
        class="input-with-select"
        :placeholder="`请输入${select === '1' ? '检查号' : '姓名'}`"
        @keyup.enter="getSmsLists"
      >
        <template #prepend>
          <el-select
            v-model="select"
            placeholder="Select"
            class="input-with-selects"
            style="width: 87px"
            @change="changeSelect"
          >
            <el-option label="检查号" value="1" />
            <el-option label="姓名" value="2" />
          </el-select>
        </template>
      </el-input>
      <el-button type="primary" @click="getSmsLists" style="margin-left: 13px" plain
        >搜索</el-button
      >
    </el-card>
    <el-card class="mt8 card-table nopadding-card-top">
      <el-table
        :data="roleList"
        v-loading="loadingRole"
        style="height: calc(100vh - 220px)"
        :header-cell-style="{ textAlign: 'center', padding: '10px' }"
        :row-style="{ textAlign: 'center' }"
      >
        <el-table-column prop="accessionNumber" label="检查号" align="center" />
        <el-table-column prop="patientClass" label="就诊类别" align="center" />
        <el-table-column prop="serviceSectId" label="检查类型" align="center">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.serviceSectId }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" align="center" />
        <el-table-column prop="contactPhoneNo" label="联系方式" min-width="110" align="center" />
        <el-table-column prop="sendTime" label="发送时间" align="center" />
        <el-table-column prop="deliveryTime" label="送达时间" align="center" />
        <el-table-column prop="" label="发送状态" align="center">
          <template #default="{ row }">
            <el-tag type="success" v-if="row.sendState === 1">已发送</el-tag>
            <el-tag v-else type="info">未发送</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="" label="操作" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="getPhone(row)">重发</el-button>
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
import { ref } from 'vue'
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
      form.value['name'] = modelInput.value
      break

    default:
      break
  }
}
const getSmsLists = async () => {
  changeSelect(select.value || '1')
  if (!form.value['accessionNumber'] && !form.value['name']) {
    ElMessage.warning('请输入搜索内容')
    return
  }
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
  if (!decryptionPhone.value && !newPhone.value) {
    ElMessage.warning('手机号不能为空')
    return
  }
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
</script>

<style>
.mt8 {
  margin-top: 8px;
}
</style>
