<template>
  <el-dialog v-model="visible" title="新建存储媒介" width="500px" @close="onCancel">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="媒质名称" prop="mediaName" required>
        <el-input v-model="form.mediaName" placeholder="请输入媒质名称" />
      </el-form-item>
      <el-form-item label="机构名称" prop="orgName" required>
        <el-select v-model="form.orgName" placeholder="请选择机构名称">
          <el-option label="哈尔滨市方正县人民医院" value="哈尔滨市方正县人民医院" />
          <el-option label="南院区" value="南院区" />
        </el-select>
      </el-form-item>
      <el-form-item label="地址" prop="address" required>
        <el-input v-model="form.address" placeholder="请输入地址" />
      </el-form-item>
      <el-form-item label="媒质类型" prop="mediaType" required>
        <el-select v-model="form.mediaType" placeholder="请选择媒质类型">
          <el-option label="云存储" value="云存储" />
          <el-option label="本地存储" value="本地存储" />
        </el-select>
      </el-form-item>
      <el-form-item label="主机地址" prop="host" required>
        <el-input v-model="form.host" placeholder="请输入主机地址" />
      </el-form-item>
      <el-form-item label="访问UID" prop="visitUid" required>
        <el-input v-model="form.visitUid" placeholder="请输入访问UID" />
      </el-form-item>
      <el-form-item label="访问Key" prop="visitKey" required>
        <el-input v-model="form.visitKey" placeholder="请输入访问Key" />
      </el-form-item>
      <el-form-item label="子目录" prop="subDir" required>
        <el-input v-model="form.subDir" placeholder="请输入子目录" />
      </el-form-item>
      <el-form-item label="用户UID" prop="userUid" required>
        <el-input v-model="form.userUid" placeholder="请输入用户UID" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const formRef = ref()
const emits = defineEmits(['success', 'cancel'])

const form = reactive({
  mediaName: '',
  orgName: '',
  address: '',
  mediaType: '',
  host: '',
  visitUid: '',
  visitKey: '',
  subDir: '',
  userUid: ''
})

const rules = {
  mediaName: [{ required: true, message: '请输入媒质名称', trigger: 'blur' }],
  orgName: [{ required: true, message: '请选择机构名称', trigger: 'change' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  mediaType: [{ required: true, message: '请选择媒质类型', trigger: 'change' }],
  host: [{ required: true, message: '请输入主机地址', trigger: 'blur' }],
  visitUid: [{ required: true, message: '请输入访问UID', trigger: 'blur' }],
  visitKey: [{ required: true, message: '请输入访问Key', trigger: 'blur' }],
  subDir: [{ required: true, message: '请输入子目录', trigger: 'blur' }],
  userUid: [{ required: true, message: '请输入用户UID', trigger: 'blur' }]
}

function show() {
  visible.value = true
}

function hide() {
  visible.value = false
}

function resetForm() {
  Object.keys(form).forEach((key) => (form[key] = ''))
}

function onCancel() {
  hide()
  resetForm()
  emits('cancel')
}

function onConfirm() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      emits('success', { ...form })
      hide()
      resetForm()
      ElMessage.success('新增成功')
    }
  })
}

// 对外暴露 show 方法
defineExpose({ show })
</script>
