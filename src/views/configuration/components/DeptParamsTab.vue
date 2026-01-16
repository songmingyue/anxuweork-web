<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  ElButton,
  ElCard,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElMessage
} from 'element-plus'
import type { ConfigTabExpose } from './types'

type Row = {
  id: number
  dept: string
  examTypes: string
}

const tableData = ref<Row[]>([
  {
    id: 1,
    dept: '放射科',
    examTypes: 'CT,MR,CR,DX,MG,XA,RF,44,'
  },
  {
    id: 2,
    dept: '',
    examTypes: 'CT,MR,CR,DX,MG,XA,RF,'
  }
])

const allTypes = ['CT', 'MR', 'CR', 'DX', 'MG', 'XA', 'RF', '44']

type DeptForm = {
  dept: string
  selected: string[]
}

const defaultForm: DeptForm = {
  dept: '放射科',
  selected: [...allTypes]
}

const form = reactive<DeptForm>({ ...defaultForm })

const selectedSet = computed(() => new Set(form.selected))

const toggle = (t: string) => {
  if (selectedSet.value.has(t)) {
    form.selected = form.selected.filter((x) => x !== t)
  } else {
    form.selected = [...form.selected, t]
  }
}

const onAdd = () => {
  ElMessage.success('新增')
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
      <div class="tab-title">科室参数</div>
      <div class="tab-actions">
        <el-button>取消</el-button>
      </div>
    </div>

    <el-table :data="tableData" border height="260" class="table">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="dept" label="科室" min-width="160" />
      <el-table-column prop="examTypes" label="检查类型" min-width="260" />

      <template #empty>
        <div class="table-empty"><el-empty description="暂无数据" /></div>
      </template>
    </el-table>

    <div class="form-wrap">
      <el-form :model="form" label-width="110px" @submit.prevent>
        <el-form-item label="科室：">
          <el-select v-model="form.dept" style="width: 360px">
            <el-option label="放射科" value="放射科" />
          </el-select>
        </el-form-item>

        <el-form-item label="检查类型：">
          <div class="tags">
            <el-button
              v-for="t in allTypes"
              :key="t"
              size="small"
              :type="selectedSet.has(t) ? 'primary' : ''"
              plain
              @click="toggle(t)"
              >{{ t }}</el-button
            >
            <el-button size="small" plain @click="onAdd">+ 新增</el-button>
          </div>
        </el-form-item>

        <div class="bottom-actions">
          <el-button type="primary" plain @click="onUpdate">修改</el-button>
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

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.bottom-actions {
  display: flex;
  margin-top: 12px;
  justify-content: flex-end;
}
</style>
