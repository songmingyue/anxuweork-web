<template>
  <el-dialog
    :title="isEdit ? '编辑用户信息' : '新增用户信息'"
    v-model="visible"
    width="500px"
    @close="handleCancel"
  >
    <el-form :model="form" label-width="90px" :rules="rules" ref="formRef">
      <el-form-item label="用户名" prop="account" required>
        <el-input v-model="form.account" />
      </el-form-item>
      <el-form-item label="姓名" prop="name" required>
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="工号" prop="workNO" required>
        <el-input v-model="form.workNO" />
      </el-form-item>
      <el-form-item label="状态" prop="status" required>
        <el-select v-model="form.status">
          <el-option label="启用" :value="true" />
          <el-option label="停用" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item label="机构" prop="organizationID" required>
        <el-select v-model="form.organizationID" placeholder="请选择">
          <el-option v-for="o in orgOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="科室" prop="deptID">
        <el-select v-model="form.deptID" placeholder="请选择">
          <el-option
            v-for="d in deptOptions"
            :key="d.deptID"
            :label="d.deptName"
            :value="d.deptID"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="办公电话" prop="officePhone">
        <el-input v-model="form.officePhone" />
      </el-form-item>
      <el-form-item label="个人电话" prop="privatePhone" required>
        <el-input v-model="form.privatePhone" />
      </el-form-item>
      <el-form-item label="电子邮箱" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="备注" prop="memo">
        <el-input v-model="form.memo" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import {
  ElMessage,
  ElDialog,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption
} from 'element-plus'
import { OrganizationOnce } from '@/api/type'

const props = defineProps<{
  visible: boolean
  isEdit: boolean
  formData?: Record<string, any>
  orgOptions: OrganizationOnce[]
}>()
const emits = defineEmits(['update:visible', 'confirm'])
const deptOptions = ref<any[]>([])

const visible = ref(props.visible)
const isEdit = ref(props.isEdit)
const form = ref({
  account: '',
  name: '',
  workNO: '',
  status: true,
  organizationID: '',
  deptID: '',
  officePhone: '',
  privatePhone: '',
  email: '',
  memo: ''
})
const rules = {
  account: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  workNO: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  organizationID: [{ required: true, message: '请选择机构', trigger: 'change' }],
  privatePhone: [{ required: true, message: '请输入个人电话', trigger: 'blur' }]
}
const formRef = ref()

watch(
  () => props.visible,
  (val) => {
    visible.value = val
    if (val && props.formData) {
      Object.assign(form.value, props.formData)
    } else if (!val) {
      Object.keys(form.value).forEach((k) => (form.value[k] = ''))
      form.value.status = true
    }
  }
)
watch(
  () => props.isEdit,
  (val) => {
    isEdit.value = val
  }
)
watch(
  () => form.value.organizationID,
  (val) => {
    const org = props.orgOptions.find((o) => o.value === val)
    deptOptions.value = org?.DeptMstDto || []
  }
)

const handleCancel = () => {
  emits('update:visible', false)
}
const handleConfirm = () => {
  formRef.value.validate((valid: boolean) => {
    let obj = form.value
    if (props.isEdit) {
      obj = Object.assign({ userUID: props.formData?.userUID }, form.value)
    }
    if (valid) {
      emits('confirm', obj)
      emits('update:visible', false)
    } else {
      ElMessage.error('请完善必填信息')
    }
  })
}
</script>
