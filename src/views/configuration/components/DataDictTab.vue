<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
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
import { getTableConfig, saveTableConfig, TableConfigItem } from '@/api/configuration'
const props = defineProps({
  adminConfigInfo: {
    type: Object,
    required: false,
    default: () => ({})
  },
  defaultConfigInfo: {
    type: Object,
    required: false,
    default: () => ({})
  }
})

const emit = defineEmits(['onChangeConfig'])

const tableData = ref<TableConfigItem[]>([])
const tableRef = ref<any>(null)

type Mode = 'view' | 'edit'
const mode = ref<Mode>('view')
const currentRow = ref<TableConfigItem | null>(null)

type YesNo = 'yes' | 'no'
const toYesNo = (val: boolean): YesNo => (val ? 'yes' : 'no')
const fromYesNo = (val: YesNo): boolean => val === 'yes'

const TABLE_NAME = 'ExamList'

type DictForm = {
  name: string
  width: string
  visible: YesNo
  fixed: YesNo
}

const emptyForm: DictForm = {
  name: '',
  width: '',
  visible: 'yes',
  fixed: 'no'
}

const form = reactive<DictForm>({ ...emptyForm })

const getRowFixed = (row: TableConfigItem): boolean => {
  const anyRow = row as any
  if (typeof anyRow.fix === 'boolean') return anyRow.fix
  if (typeof anyRow.fixed === 'boolean') return anyRow.fixed
  return false
}

const loadRowToForm = (row: TableConfigItem) => {
  form.name = row.label || ''
  form.width = row.width || ''
  form.visible = toYesNo(!!row.selected)
  form.fixed = toYesNo(getRowFixed(row))
}

const applyFormToRow = (row: TableConfigItem) => {
  row.label = form.name
  row.width = form.width
  row.selected = fromYesNo(form.visible)
  ;(row as any).fix = fromYesNo(form.fixed)
  ;(row as any).fixed = fromYesNo(form.fixed)
}

const getRowOrder = (row: TableConfigItem): number => {
  const val = (row as any)?.order
  return typeof val === 'number' && Number.isFinite(val) ? val : 0
}

const setRowOrder = (row: TableConfigItem, val: number) => {
  ;(row as any).order = val
}

const normalizeOrder = () => {
  const rows = [...tableData.value].sort((a, b) => getRowOrder(a) - getRowOrder(b))
  rows.forEach((r, idx) => setRowOrder(r, idx))
  tableData.value = rows
}

const currentOrder = computed(() => (currentRow.value ? getRowOrder(currentRow.value) : -1))
const moveUpDisabled = computed(() => !currentRow.value || currentOrder.value <= 0)
const moveDownDisabled = computed(
  () => !currentRow.value || currentOrder.value >= Math.max(0, tableData.value.length - 1)
)

const syncCurrentRowHighlight = async () => {
  if (!currentRow.value) return
  await nextTick()
  tableRef.value?.setCurrentRow?.(currentRow.value)
}

const onMoveUp = async () => {
  if (!currentRow.value) {
    ElMessage.warning('请先选择一条数据')
    return
  }
  normalizeOrder()
  if (moveUpDisabled.value) return

  const selectedOrder = getRowOrder(currentRow.value)
  const rows = [...tableData.value]
  const prev = rows.find((r) => getRowOrder(r) === selectedOrder - 1)
  if (!prev) return

  setRowOrder(currentRow.value, selectedOrder - 1)
  setRowOrder(prev, selectedOrder)

  tableData.value = [...rows].sort((a, b) => getRowOrder(a) - getRowOrder(b))
  loadRowToForm(currentRow.value)
  await syncCurrentRowHighlight()
}

const onMoveDown = async () => {
  if (!currentRow.value) {
    ElMessage.warning('请先选择一条数据')
    return
  }
  normalizeOrder()
  if (moveDownDisabled.value) return

  const selectedOrder = getRowOrder(currentRow.value)
  const rows = [...tableData.value]
  const next = rows.find((r) => getRowOrder(r) === selectedOrder + 1)
  if (!next) return

  setRowOrder(currentRow.value, selectedOrder + 1)
  setRowOrder(next, selectedOrder)

  tableData.value = [...rows].sort((a, b) => getRowOrder(a) - getRowOrder(b))
  loadRowToForm(currentRow.value)
  await syncCurrentRowHighlight()
}

const onEdit = () => {
  if (!currentRow.value) {
    ElMessage.warning('请先选择一条数据')
    return
  }
  mode.value = 'edit'
  loadRowToForm(currentRow.value)
}

const onCancelEdit = () => {
  mode.value = 'view'
  if (currentRow.value) {
    loadRowToForm(currentRow.value)
  } else {
    Object.assign(form, emptyForm)
  }
}

const reset = () => {
  Object.assign(form, emptyForm)
}

const onSave = async () => {
  if (!currentRow.value) {
    ElMessage.warning('请先选择一条数据')
    return
  }
  applyFormToRow(currentRow.value)

  const { status, desc } = await saveTableConfig({
    tableName: TABLE_NAME,
    table: tableData.value
  })
  if (status) {
    ElMessage.error(desc || '保存失败')
    return
  }
  ElMessage.success('保存成功')
  mode.value = 'view'
}

const submit = async () => {
  await onSave()
}

defineExpose<ConfigTabExpose>({ submit, reset })
const getList = async () => {
  const { data } = await getTableConfig()
  tableData.value = data
  normalizeOrder()
}

const onCurrentChange = (row: TableConfigItem | undefined) => {
  if (!row) return
  if (mode.value === 'edit') {
    mode.value = 'view'
  }
  currentRow.value = row
  loadRowToForm(row)
}

const limitAutomaticPrint = computed<boolean>({
  get: () => Boolean(props.adminConfigInfo?.limitAutomaticPrint),
  set: (val) => {
    emit('onChangeConfig', {
      ...(props.adminConfigInfo as any),
      limitAutomaticPrint: Boolean(val)
    })
  }
})

const defaultAutoPrintRestrict = computed<boolean>({
  get: () => Boolean(props.adminConfigInfo?.defaultAutoPrintRestrict),
  set: (val) => {
    emit('onChangeConfig', {
      ...(props.adminConfigInfo as any),
      defaultAutoPrintRestrict: Boolean(val)
    })
  }
})

onMounted(() => {
  getList()
})
</script>

<template>
  <el-card shadow="never" class="tab-card">
    <div class="tab-header">
      <div class="tab-title">数据字典</div>
      <div class="tab-actions">
        <el-button :disabled="moveUpDisabled" @click="onMoveUp">上移</el-button>
        <el-button type="primary" plain :disabled="moveDownDisabled" @click="onMoveDown">
          下移
        </el-button>
        <el-button @click="onCancelEdit">取消</el-button>
      </div>
    </div>

    <el-table
      :data="tableData"
      border
      height="260"
      class="table"
      highlight-current-row
      row-key="prop"
      ref="tableRef"
      @current-change="onCurrentChange"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="label" label="名称" min-width="120" />
      <el-table-column prop="prop" label="Value" min-width="140" />
      <el-table-column prop="order" label="默认排序" min-width="110" />
      <el-table-column prop="width" label="宽度" min-width="110" />
      <el-table-column prop="visible" label="是否显示" min-width="110">
        <template #default="selected">
          <span>{{ selected.row.selected ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="fixed" label="是否固定" min-width="110">
        <template #default="scope">
          <span>{{ getRowFixed(scope.row) ? '是' : '否' }}</span>
        </template>
      </el-table-column>

      <template #empty>
        <div class="table-empty"><el-empty description="暂无数据" /></div>
      </template>
    </el-table>

    <div class="form-wrap">
      <el-form :model="form" label-width="110px" @submit.prevent>
        <div class="grid">
          <el-form-item label="名称：">
            <el-input v-model="form.name" :disabled="mode === 'view'" />
          </el-form-item>

          <el-form-item label="宽度：">
            <el-input v-model="form.width" placeholder="宽度" :disabled="mode === 'view'" />
          </el-form-item>

          <el-form-item label="是否显示：">
            <el-radio-group v-model="form.visible" :disabled="mode === 'view'">
              <el-radio-button label="yes">是</el-radio-button>
              <el-radio-button label="no">否</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="是否固定：">
            <el-radio-group v-model="form.fixed" :disabled="mode === 'view'">
              <el-radio-button label="yes">是</el-radio-button>
              <el-radio-button label="no">否</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>

        <div class="bottom-controls">
          <div class="control">
            <div class="control-label">限制自动打印：</div>
            <el-radio-group v-model="limitAutomaticPrint">
              <el-radio-button :value="true">是</el-radio-button>
              <el-radio-button :value="false">否</el-radio-button>
            </el-radio-group>
          </div>

          <div class="control">
            <div class="control-label">默认限制：</div>
            <el-radio-group v-model="defaultAutoPrintRestrict">
              <el-radio-button :value="true">是</el-radio-button>
              <el-radio-button :value="false">否</el-radio-button>
            </el-radio-group>
          </div>

          <template v-if="mode === 'view'">
            <el-button type="primary" plain class="update" @click="onEdit">修改</el-button>
          </template>
          <template v-else>
            <el-button type="primary" class="update" @click="onSave">保存</el-button>
            <el-button @click="reset">重置</el-button>
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
