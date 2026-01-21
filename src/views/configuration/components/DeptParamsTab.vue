<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
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
  ElMessage,
  ElTag,
  ElInput
} from 'element-plus'
import type { ConfigTabExpose } from './types'
import {
  DepartmentDetailItem,
  ExamTypeItem,
  getDepartmentConfig,
  saveDepartmentConfig
} from '@/api/configuration'

const tableData = ref<DepartmentDetailItem[]>([])
const tableRef = ref<any>(null)

type Mode = 'view' | 'edit'
const mode = ref<Mode>('view')
const currentRow = ref<DepartmentDetailItem | null>(null)
const originalExamTypes = ref<ExamTypeItem[]>([])

type DeptForm = {
  dept: string
  selected: string[]
}

const defaultForm: DeptForm = {
  dept: '',
  selected: []
}

const form = reactive<DeptForm>({ ...defaultForm })

const inputVisible = ref(false)
const inputValue = ref('')
const InputRef = ref<any>(null)

const showInput = async () => {
  if (mode.value !== 'edit') return
  inputVisible.value = true
  inputValue.value = ''
  await nextTick()
  InputRef.value?.focus?.()
}

const handleInputConfirm = () => {
  if (mode.value !== 'edit') {
    inputVisible.value = false
    inputValue.value = ''
    return
  }

  const val = inputValue.value.trim()
  if (val) {
    const exists = typesList.value.some((x) => x.value === val)
    if (!exists) {
      const newItem: ExamTypeItem = {
        isNew: true,
        isSelect: true,
        text: val,
        value: val
      }
      typesList.value = [...typesList.value, newItem]
    }
  }

  inputVisible.value = false
  inputValue.value = ''
}

const onEdit = () => {
  if (!currentRow.value) {
    ElMessage.warning('请先选择一条数据')
    return
  }
  mode.value = 'edit'
  originalExamTypes.value = JSON.parse(JSON.stringify(typesList.value || []))
}

const onCancel = () => {
  mode.value = 'view'
  typesList.value = JSON.parse(JSON.stringify(originalExamTypes.value || []))
}

const onResetTypes = () => {
  typesList.value = []
}

const removeType = (val: string) => {
  if (mode.value !== 'edit') return
  typesList.value = typesList.value.filter((t) => t.value !== val)
}

const onSave = async () => {
  if (!currentRow.value) {
    ElMessage.warning('请先选择一条数据')
    return
  }
  const deptCode = currentRow.value.departmentCode
  const examType = (typesList.value || []).map((t) => ({
    isNew: Boolean(t.isNew),
    isSelect: true,
    text: t.text,
    value: t.value
  }))

  const { status, desc } = await saveDepartmentConfig({
    departmentCode: deptCode,
    examType
  })
  if (status) {
    ElMessage.error(desc || '保存失败')
    return
  }

  const idx = tableData.value.findIndex((x) => x.departmentCode === deptCode)
  if (idx >= 0) {
    tableData.value[idx] = {
      ...tableData.value[idx],
      examType
    }
  }
  originalExamTypes.value = JSON.parse(JSON.stringify(examType))
  ElMessage.success('保存成功')
  mode.value = 'view'
}

const reset = () => {
  Object.assign(form, defaultForm)
}

const submit = async () => {
  if (mode.value === 'edit') {
    await onSave()
  }
}

defineExpose<ConfigTabExpose>({ submit, reset })
const getList = async () => {
  const { data } = await getDepartmentConfig()
  tableData.value = data
  await nextTick()
  const first = tableData.value?.[0]
  if (first) {
    currentRow.value = first
    form.dept = first.departmentCode
    typesList.value = JSON.parse(JSON.stringify(first.examType || []))
    originalExamTypes.value = JSON.parse(JSON.stringify(first.examType || []))
    tableRef.value?.setCurrentRow?.(first)
  }
}
onMounted(() => {
  getList()
})
const typesList = ref<ExamTypeItem[]>([])
const onCurrentChange = (row: DepartmentDetailItem | undefined) => {
  if (!row) return
  if (mode.value === 'edit') return
  currentRow.value = row
  form.dept = row.departmentCode
  typesList.value = JSON.parse(JSON.stringify(row.examType || []))
  originalExamTypes.value = JSON.parse(JSON.stringify(row.examType || []))
}
</script>

<template>
  <el-card shadow="never" class="tab-card">
    <div class="tab-header">
      <div class="tab-title">科室参数</div>
      <div class="tab-actions">
        <el-button @click="onCancel">取消</el-button>
      </div>
    </div>

    <el-table
      highlight-current-row
      @current-change="onCurrentChange"
      :data="tableData"
      border
      height="260"
      class="table"
      ref="tableRef"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="departmentCode" label="科室" min-width="160" />
      <el-table-column prop="examType" label="检查类型" min-width="260">
        <template #default="{ row }">
          <span v-for="(type, index) in row.examType" :key="index">{{ type.text }},</span>
        </template>
      </el-table-column>

      <template #empty>
        <div class="table-empty"><el-empty description="暂无数据" /></div>
      </template>
    </el-table>

    <div class="form-wrap">
      <el-form :model="form" label-width="110px" @submit.prevent>
        <el-form-item label="科室：">
          <el-select v-model="form.dept" style="width: 360px" disabled>
            <el-option
              v-for="value in tableData"
              :key="value.departmentCode"
              :label="value.departmentCode"
              :value="value.departmentCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="检查类型：">
          <el-tag
            v-for="type in typesList"
            :key="type.value"
            style="margin-right: 10px"
            :closable="mode === 'edit'"
            :disable-transitions="true"
            @close="removeType(type.value)"
          >
            {{ type.text }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="InputRef"
            v-model="inputValue"
            size="small"
            style="width: 120px"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button
            v-else
            class="button-new-tag"
            size="small"
            :disabled="mode !== 'edit'"
            @click="showInput"
          >
            +新增
          </el-button>
        </el-form-item>

        <div class="bottom-actions">
          <template v-if="mode === 'view'">
            <el-button type="primary" plain @click="onEdit">修改</el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="onSave">保存</el-button>
            <el-button @click="onResetTypes">重置</el-button>
          </template>
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
