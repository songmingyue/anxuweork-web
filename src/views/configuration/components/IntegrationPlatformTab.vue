<script setup lang="ts">
import { reactive } from 'vue'
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElRadioButton,
  ElRadioGroup,
  ElMessage
} from 'element-plus'
import type { ConfigTabExpose } from './types'

type IntegrationForm = {
  uploadUrl: string
  orgId: string
  imageCompressRatio: string
  enableUpload: 'yes' | 'no'
  keepChargeStatus: 'yes' | 'no'
  reportPrintNotify: 'yes' | 'no'
  matchDoneNotifyRis: 'yes' | 'no'
  filmPrintNotify: 'yes' | 'no'
}

const defaultForm: IntegrationForm = {
  uploadUrl: '',
  orgId: '',
  imageCompressRatio: '1',
  enableUpload: 'no',
  keepChargeStatus: 'yes',
  reportPrintNotify: 'no',
  matchDoneNotifyRis: 'no',
  filmPrintNotify: 'no'
}

const form = reactive<IntegrationForm>({ ...defaultForm })

const reset = () => {
  Object.assign(form, defaultForm)
}

const submit = () => {
  ElMessage.success('保存成功')
}

defineExpose<ConfigTabExpose>({ submit, reset })
</script>

<template>
  <el-card shadow="never" class="tab-card">
    <div class="tab-header">
      <div class="tab-title">集成平台</div>
      <div class="tab-actions">
        <el-button @click="reset">重置</el-button>
        <el-button @click="reset">取消</el-button>
      </div>
    </div>

    <el-form :model="form" label-width="140px" class="form" @submit.prevent>
      <el-form-item label="上传地址：">
        <el-input v-model="form.uploadUrl" placeholder="上传地址" />
      </el-form-item>

      <el-form-item label="机构ID：">
        <el-input v-model="form.orgId" placeholder="机构ID" />
      </el-form-item>

      <el-form-item label="图像压缩比率：">
        <el-input v-model="form.imageCompressRatio" />
      </el-form-item>

      <el-form-item label="启用上传：">
        <el-radio-group v-model="form.enableUpload">
          <el-radio-button label="yes">是</el-radio-button>
          <el-radio-button label="no">否</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="不更新收费状态：">
        <el-radio-group v-model="form.keepChargeStatus">
          <el-radio-button label="yes">是</el-radio-button>
          <el-radio-button label="no">否</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="报告打印结果是否通知：">
        <el-radio-group v-model="form.reportPrintNotify">
          <el-radio-button label="yes">是</el-radio-button>
          <el-radio-button label="no">否</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="匹配完成是否通知RIS：">
        <el-radio-group v-model="form.matchDoneNotifyRis">
          <el-radio-button label="yes">是</el-radio-button>
          <el-radio-button label="no">否</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="胶片打印结果是否通知：">
        <el-radio-group v-model="form.filmPrintNotify">
          <el-radio-button label="yes">是</el-radio-button>
          <el-radio-button label="no">否</el-radio-button>
        </el-radio-group>
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
  max-width: 760px;
}
</style>
