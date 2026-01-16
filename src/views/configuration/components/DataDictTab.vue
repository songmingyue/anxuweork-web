<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  ElButton,
  ElCard,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElRadioButton,
  ElRadioGroup,
  ElTable,
  ElTableColumn,
  ElMessage
} from 'element-plus'
import type { ConfigTabExpose } from './types'

type Row = {
  id: number
  name: string
  value: string
  order: number
  width: string
  visible: string
  fixed: string
}

const tableData = ref<Row[]>([
  {
    id: 1,
    name: '胶片',
    value: 'matchState',
    order: 0,
    width: '',
    visible: '是',
    fixed: '否'
  }
])

type DictForm = {
  name: string
  width: string
  visible: 'yes' | 'no'
  fixed: 'yes' | 'no'
  limitAutoPrint: 'yes' | 'no'
  defaultLimit: 'yes' | 'no'
}

const defaultForm: DictForm = {
  name: '胶片',
  width: '',
  visible: 'yes',
  fixed: 'no',
  limitAutoPrint: 'yes',
  defaultLimit: 'yes'
}

const form = reactive<DictForm>({ ...defaultForm })

const onMoveUp = () => {
  ElMessage.success('上移')
}

const onMoveDown = () => {
  ElMessage.success('下移')
}

const onUpdate = () => {
  ElMessage.success('修改成功')
}

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
      <div class="tab-title">数据字典</div>
      <div class="tab-actions">
        <el-button @click="onMoveUp">上移</el-button>
        <el-button type="primary" plain @click="onMoveDown">下移</el-button>
        <el-button>取消</el-button>
      </div>
    </div>

    <el-table :data="tableData" border height="260" class="table">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="name" label="名称" min-width="120" />
      <el-table-column prop="value" label="Value" min-width="140" />
      <el-table-column prop="order" label="默认排序" min-width="110" />
      <el-table-column prop="width" label="宽度" min-width="110" />
      <el-table-column prop="visible" label="是否显示" min-width="110" />
      <el-table-column prop="fixed" label="是否固定" min-width="110" />

      <template #empty>
        <div class="table-empty"><el-empty description="暂无数据" /></div>
      </template>
    </el-table>

    <div class="form-wrap">
      <el-form :model="form" label-width="110px" @submit.prevent>
        <div class="grid">
          <el-form-item label="名称：">
            <el-input v-model="form.name" />
          </el-form-item>

          <el-form-item label="宽度：">
            <el-input v-model="form.width" placeholder="宽度" />
          </el-form-item>

          <el-form-item label="是否显示：">
            <el-radio-group v-model="form.visible">
              <el-radio-button label="yes">是</el-radio-button>
              <el-radio-button label="no">否</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="是否固定：">
            <el-radio-group v-model="form.fixed">
              <el-radio-button label="yes">是</el-radio-button>
              <el-radio-button label="no">否</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>

        <div class="bottom-controls">
          <div class="control">
            <div class="control-label">限制自动打印：</div>
            <el-radio-group v-model="form.limitAutoPrint">
              <el-radio-button label="yes">是</el-radio-button>
              <el-radio-button label="no">否</el-radio-button>
            </el-radio-group>
          </div>

          <div class="control">
            <div class="control-label">默认限制：</div>
            <el-radio-group v-model="form.defaultLimit">
              <el-radio-button label="yes">是</el-radio-button>
              <el-radio-button label="no">否</el-radio-button>
            </el-radio-group>
          </div>

          <el-button type="primary" plain class="update" @click="onUpdate">修改</el-button>
        </div>
      </el-form>
    </div>
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

.table {
  width: 100%;
}

.table-empty {
  padding: 40px 0;
}

.form-wrap {
  margin-top: 16px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
  max-width: 760px;
}

@media (width <= 1100px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.bottom-controls {
  display: flex;
  margin-top: 10px;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-label {
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.update {
  margin-left: auto;
}
</style>
