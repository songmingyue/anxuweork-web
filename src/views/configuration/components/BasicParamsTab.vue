<script setup lang="ts">
import { reactive } from 'vue'
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox
} from 'element-plus'
import type { ConfigTabExpose } from './types'
import { CheckPort } from '@/api/configuration'
const props = defineProps({
  adminConfigInfo: {
    type: Object,
    required: false,
    default: () => ({})
  }
})
const emit = defineEmits(['onChangeConfig'])
type BasicParamsForm = {
  aeTitle: string
  port: number
  storagePath: string
}

const defaults: BasicParamsForm = {
  aeTitle: '',
  port: 0,
  storagePath: ''
}

const cancelForm: BasicParamsForm = {
  aeTitle: props.adminConfigInfo.parameterConfig.aeTitle || '',
  port: props.adminConfigInfo.parameterConfig.port || 0,
  storagePath: props.adminConfigInfo.parameterConfig.storagePath || ''
}

const form = reactive<BasicParamsForm>(JSON.parse(JSON.stringify(cancelForm)))

const onTest = async () => {
  const { status, desc } = await CheckPort({ port: form.port })
  if (status) {
    ElMessage.error(desc || '端口不可用')
  } else {
    ElMessage.success('端口可用')
  }
}

const reset = () => {
  Object.assign(form, defaults)
}

const cancel = () => {
  ElMessageBox.confirm('是否确定取消当前修改内容?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      console.log('取消修改', cancelForm)
      Object.assign(form, cancelForm)
    })
    .catch(() => {
      // 取消操作
    })
}

const submit = () => {
  ElMessage.success('保存成功')
}

const changeForm = () => {
  const newConfig = props.adminConfigInfo
  newConfig.parameterConfig.aeTitle = form.aeTitle
  newConfig.parameterConfig.port = form.port
  newConfig.parameterConfig.storagePath = form.storagePath
  emit('onChangeConfig', newConfig)
}

defineExpose<ConfigTabExpose>({ submit, reset })
</script>

<template>
  <el-card shadow="never" class="tab-card">
    <div class="tab-header">
      <div class="tab-title">基本参数</div>
      <div class="tab-actions">
        <el-button @click="reset">重置</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </div>

    <el-form :model="form" label-width="110px" class="form" @submit.prevent>
      <el-form-item label="应用标识：">
        <el-input v-model="form.aeTitle" @change="changeForm" />
      </el-form-item>

      <el-form-item label="服务端口：">
        <el-input v-model="form.port" @change="changeForm">
          <template #append>
            <el-button @click="onTest">测试</el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="存储路径：">
        <el-input v-model="form.storagePath" @change="changeForm" />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
.tab-card {
  min-height: 620px;
}

.tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px 14px;
}

.tab-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.tab-actions {
  display: flex;
  gap: 10px;
}

.form {
  max-width: 680px;
}
</style>
