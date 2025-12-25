<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import {
  ElDialog,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElUpload,
  ElIcon
} from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { createOrganization, editOrganization, uploadlogo } from '@/api/userMessage'

const props = defineProps<{
  visible: boolean
  isEdit: boolean
  EditData?: any
}>()
const formRef = ref()
const uploadVisible = ref(false)
const uploadFormRef = ref()

const visible = props.visible
const isEdit = props.isEdit
const dialogForm = ref<any>({})
const uploadForm = ref<any>({})
const imageUrl = ref<string>('')
const emit = defineEmits(['update:visible', 'confirm'])
const rules = {
  searchOrganizationID: [{ required: true, message: '请输入机构编号', trigger: 'blur' }],
  organizationName: [{ required: true, message: '请输入机构名称', trigger: 'blur' }]
}
const uploadRules = {
  searchOrganizationID: [{ required: true, message: '请输入机构编号', trigger: 'blur' }]
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
  // emit('confirm', dialogForm.value)
}

// 选择图片后，缓存文件并生成预览
const handleFileChange = (file: any) => {
  uploadForm.value.logoFile = file?.raw || null
  if (uploadForm.value.logoFile) {
    imageUrl.value = URL.createObjectURL(uploadForm.value.logoFile)
  }
}
const uploadCancel = () => {
  emit('confirm', dialogForm.value)
  uploadVisible.value = false
}
const uploadFormMsd = async () => {
  // 仅在点击“确定”时以 FormData 上传
  const formData = new FormData()
  formData.append('organizationID', uploadForm.value.searchOrganizationID)
  formData.append('file', uploadForm.value.logoFile)
  const resp = await uploadlogo(formData)
  // 若后端返回图片地址则回填

  if (resp.data.isSuccess) {
    emit('confirm', dialogForm.value)
    uploadVisible.value = false
  } else {
    ElMessage.error(resp.data.message)
  }
}

const sureUpload = () => {
  uploadFormRef.value.validate((valid: boolean) => {
    if (valid) {
      uploadFormMsd()

      //
    }
  })
}

// 上传前校验文件类型与大小
const beforeAvatarUpload = (rawFile: File) => {
  const isImage = rawFile.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('仅支持上传图片文件')
    return false
  }
  return true
}
const submitForm = async () => {
  const req = Object.assign(props.EditData, dialogForm.value)
  // 提交表单数据
  if (isEdit) {
    const { isSuccess, message } = await editOrganization(req)
    ElMessage(message)
    if (isSuccess) {
      emit('confirm', req)
    }
  } else {
    // 新增逻辑
    createOrganization(req).then(({ isSuccess, message }) => {
      ElMessage(message)
      if (isSuccess) {
        emit('confirm', req)
      }
    })
  }
}
onMounted(() => {
  if (isEdit) {
    Object.assign(dialogForm.value, props.EditData)

    // 编辑时回显背景图
    imageUrl.value = props.EditData?.logoFile || ''
    uploadForm.value.mainPath = props.EditData?.mainPath || ''
    uploadForm.value.searchOrganizationID = props.EditData?.searchOrganizationID || ''
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
        <el-form-item label="机构名称" prop="organizationName" required>
          <el-input v-model="dialogForm.organizationName" />
        </el-form-item>
        <el-form-item label="机构编号" prop="searchOrganizationID" required>
          <el-input v-model="dialogForm.searchOrganizationID" :disabled="isEdit" />
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
    <el-dialog title="上传图片" v-model="uploadVisible" width="500px">
      <el-form :model="uploadForm" label-width="110px" :rules="uploadRules" ref="uploadFormRef">
        <el-form-item label="背景图" prop="file">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :auto-upload="false"
            :before-upload="beforeAvatarUpload"
            :on-change="handleFileChange"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadCancel">取消</el-button>
        <el-button type="primary" @click="sureUpload">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.avatar-uploader .avatar {
  display: block;
  width: 178px;
  height: 178px;
}
</style>
