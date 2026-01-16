<script setup lang="ts">
import { reactive } from 'vue'
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElRadioButton,
  ElRadioGroup,
  ElMessage
} from 'element-plus'
import type { ConfigTabExpose } from './types'

type DiskForm = {
  autoDelete: 'none' | 'days' | 'percent'
}

const defaultForm: DiskForm = {
  autoDelete: 'none'
}

const form = reactive<DiskForm>({ ...defaultForm })

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
      <div class="tab-title">磁盘管理</div>
      <div class="tab-actions">
        <el-button @click="reset">重置</el-button>
        <el-button @click="reset">取消</el-button>
      </div>
    </div>

    <el-form :model="form" label-width="110px" class="form" @submit.prevent>
      <el-form-item label="自动删除：">
        <el-radio-group v-model="form.autoDelete">
          <el-radio-button label="none">不删除</el-radio-button>
          <el-radio-button label="days">按天数删除</el-radio-button>
          <el-radio-button label="percent">按磁盘百分比删除</el-radio-button>
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
