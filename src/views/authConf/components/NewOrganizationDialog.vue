<script lang="ts" setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import { ElDialog, ElButton, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus'
import { createOrganization, editOrganization } from '@/api/userMessage'

const props = defineProps<{
  visible: boolean
  isEdit: boolean
  EditData?: any
}>()
const formRef = ref()
const visible = props.visible
const isEdit = props.isEdit
const dialogForm = ref<any>({})
const emit = defineEmits(['update:visible', 'confirm'])
const rules = {
  searchOrganizationID: [{ required: true, message: '请输入机构编号', trigger: 'blur' }],
  organizationName: [{ required: true, message: '请输入机构名称', trigger: 'blur' }]
}

const handleCancel = () => {
  emit('update:visible', false)
}

const handleConfirm = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      submitForm()
    }
  })
  emit('confirm', dialogForm.value)
}
const submitForm = async () => {
  const req = Object.assign(props.EditData, dialogForm.value)
  // 提交表单数据
  if (isEdit) {
    const { isSuccess, message } = await editOrganization(req)
    ElMessage(message)
    isSuccess ? emit('confirm', false) : ''
  } else {
    // 新增逻辑
    const { isSuccess, message } = await createOrganization(req)
    ElMessage(message)
    console.log(message, 'message')
    isSuccess ? emit('confirm', false) : ''
  }
}
onMounted(() => {
  if (isEdit) {
    Object.assign(dialogForm.value, props.EditData)
  }
})
</script>
<template>
  <div>
    <el-dialog
      :title="isEdit ? '编辑机构' : '新增机构'"
      v-model="visible"
      width="600px"
      @close="handleCancel"
    >
      <el-form :model="dialogForm" label-width="110px" :rules="rules" ref="formRef">
        <el-form-item label="机构编号" prop="searchOrganizationID" required>
          <el-input v-model="dialogForm.searchOrganizationID" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="机构名称" prop="organizationName" required>
          <el-input v-model="dialogForm.organizationName" />
        </el-form-item>
        <el-form-item label="组织机构代码" prop="organizationCode">
          <el-input v-model="dialogForm.organizationCode" />
        </el-form-item>
        <el-form-item label="别名" prop="alias">
          <el-input v-model="dialogForm.alias" />
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-input v-model="dialogForm.province" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="dialogForm.city" />
        </el-form-item>
        <el-form-item label="区县" prop="district">
          <el-input v-model="dialogForm.district" />
        </el-form-item>
        <el-form-item label="电话" prop="officePhoneNO">
          <el-input v-model="dialogForm.officePhoneNO" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dialogForm.email" />
        </el-form-item>
        <el-form-item label="备注" prop="memo">
          <el-input type="textarea" v-model="dialogForm.memo" />
        </el-form-item>
        <el-form-item label="默认分享时间" prop="defaultShareDuration">
          <el-input v-model="dialogForm.defaultShareDuration" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
