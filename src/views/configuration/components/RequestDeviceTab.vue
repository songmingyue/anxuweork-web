<script setup lang="ts">
import { computed, onMounted, PropType, reactive, ref } from 'vue'
import {
  ElButton,
  ElCard,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElMessage
} from 'element-plus'
import TemplateMatchDialog from './TemplateMatchDialog.vue'
import type { ConfigTabExpose } from './types'
import type { AdminConfig, DicomPeer } from '@/api/configuration'
import { Department, getDepartment } from '@/api/common'

const tableData = ref<DicomPeer[]>([])
const tableRef = ref<any>(null)

const props = defineProps({
  adminConfigInfo: {
    type: Object as PropType<AdminConfig>,
    required: false,
    default: (): AdminConfig => ({})
  }
})

const emit = defineEmits(['onChangeConfig'])

const currentRow = ref<DicomPeer | any>(null)
const mode = ref<'view' | 'create' | 'edit'>('view')

const templateMatchVisible = ref(false)
const currentAeTitle = computed(() => ((currentRow.value as any)?.aeTitle as string) || '')
const aeTitleOptions = computed(() => {
  const map = new Map<string, { label: string; value: string; peerDes?: string }>()
  ;(tableData.value || []).forEach((r) => {
    const ae = (r as any)?.aeTitle
    if (!ae) return
    map.set(ae, { label: ae, value: ae, peerDes: (r as any)?.peerDes })
  })
  return Array.from(map.values())
})

const isFormVisible = computed(() => mode.value !== 'view')

type DeviceForm = {
  peerDes: string
  dept: string
  hostName: string
  aeTitle: string
  defaultPrinter: string
  modalities: string[]
  autoPrint: boolean
  delayH: number
  delayM: number
  containsExamInfo: boolean
}

const defaultForm: DeviceForm = {
  peerDes: '',
  dept: '',
  hostName: '',
  aeTitle: '',
  defaultPrinter: '',
  autoPrint: false,
  modalities: [],
  delayH: 0,
  delayM: 0,
  containsExamInfo: true
}

const form = reactive<DeviceForm>({ ...defaultForm })

const onNew = () => {
  Object.assign(form, defaultForm)
  currentRow.value = null
  mode.value = 'create'
}

const onEdit = () => {
  if (!currentRow.value) {
    ElMessage.warning('请先选择一条数据')
    return
  }

  Object.assign(form, {
    ...defaultForm,
    ...currentRow.value,
    password: '',
    resetPassword: ''
  })
  mode.value = 'edit'
}

const onCancel = () => {
  mode.value = 'view'
  currentRow.value = null
  Object.assign(form, defaultForm)
}

const onMatchTemplate = () => {
  if (!currentRow.value) {
    ElMessage.warning('请先选择一条设备')
    return
  }
  templateMatchVisible.value = true
}

const persistTableToConfig = () => {
  const newConfig = props.adminConfigInfo.dicomPeer
  // newConfig.dicomPeer = [...tableData.value]
  emit('onChangeConfig', newConfig)
}

const onSave = () => {
  if (mode.value === 'create') {
    tableData.value = [
      ...tableData.value,
      {
        dicomPeerID: crypto.randomUUID()
      } as any
    ]
    ElMessage.success('新增成功')
  }

  if (mode.value === 'edit') {
    if (!currentRow.value) {
      ElMessage.warning('请先选择一条数据')
      return
    }
    const idx = tableData.value.findIndex((r: any) => r.id === currentRow.value?.id)
    if (idx >= 0) {
      tableData.value.splice(idx, 1, {
        ...tableData.value[idx],
        dept: form.dept,
        peerDes: form.peerDes,
        hostName: form.hostName,
        aeTitle: form.aeTitle,
        defaultPrinter: form.defaultPrinter
      } as any)
      ElMessage.success('修改成功')
    }
  }

  persistTableToConfig()
  mode.value = 'view'
  currentRow.value = null
  Object.assign(form, defaultForm)
}

const reset = () => {
  Object.assign(form, defaultForm)
  mode.value = 'view'
  currentRow.value = null
}

const submit = () => {
  ElMessage.success('保存成功')
}

const selectRow = (row: DicomPeer) => {
  currentRow.value = row
  const formData = {
    peerDes: row.peerDes,
    dept: row.departmentCode,
    hostName: row.hostName,
    aeTitle: row.aeTitle,
    defaultPrinter: row.defaultPrinter,
    modalities: [],
    autoPrint: false,
    delayH: 0,
    delayM: 0,
    containsExamInfo: true
  }
  if (row.matchDelayMinutes) {
    formData.delayH = Math.floor(row.matchDelayMinutes / 60)
    formData.delayM = row.matchDelayMinutes % 60
  }
  Object.assign(form, formData)
  mode.value = 'view'
}
const departments = ref<Department[]>([])
const getDepartmentMsd = async () => {
  try {
    const { data } = await getDepartment()
    departments.value = data
  } catch (error) {
    console.error('获取科室列表失败', error)
  }
}

onMounted(async () => {
  tableData.value = props.adminConfigInfo.dicomPeer || []
  getDepartmentMsd()
  if (tableData.value.length > 0) {
    await Promise.resolve()
    const first = tableData.value[0]
    tableRef.value?.setCurrentRow?.(first)
    currentRow.value = first
  }
})

defineExpose<ConfigTabExpose>({ submit, reset })
</script>

<template>
  <el-card shadow="never" class="tab-card">
    <div class="tab-header">
      <div class="tab-title">请求设备</div>
      <div class="tab-actions">
        <el-button type="primary" plain @click="onNew">新增</el-button>
        <el-button @click="onCancel">取消</el-button>
        <el-button disabled>删除</el-button>
      </div>
    </div>

    <el-table
      ref="tableRef"
      :data="tableData"
      border
      height="260"
      class="table"
      @row-click="selectRow"
      highlight-current-row
    >
      <el-table-column type="selection" width="40" />
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="peerDes" label="设备描述" min-width="140" />
      <el-table-column prop="departmentName" label="科室" min-width="110" />
      <el-table-column prop="hostName" label="设备地址" min-width="140" />
      <el-table-column prop="aeTitle" label="设备标识" min-width="120" />
      <el-table-column prop="defaultPrinter" label="默认打印机" min-width="120" />

      <template #empty>
        <div class="table-empty"><el-empty description="暂无数据" /></div>
      </template>
    </el-table>

    <div class="form-wrap">
      <el-form :model="form" label-width="110px" @submit.prevent :disabled="!isFormVisible">
        <div class="grid">
          <el-form-item label="科室：" required>
            <el-select v-model="form.dept" placeholder="科室" style="width: 100%">
              <el-option
                :label="item.departmentName"
                :value="item.departmentCode"
                v-for="item in departments"
                :key="item.departmentCode"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="设备描述：" required>
            <el-input v-model="form.peerDes" placeholder="设备描述" />
          </el-form-item>

          <el-form-item label="设备地址：" required>
            <el-input v-model="form.hostName" placeholder="设备地址" />
          </el-form-item>

          <el-form-item label="设备标识：" required>
            <el-input v-model="form.aeTitle" placeholder="设备标识" />
          </el-form-item>

          <el-form-item label="默认打印机：">
            <el-select v-model="form.defaultPrinter" placeholder="默认打印机" style="width: 100%">
              <el-option label="默认打印机" value="printer" />
            </el-select>
          </el-form-item>

          <el-form-item label="设备类型：">
            <el-select v-model="form.modalities" placeholder="设备类型" style="width: 100%">
              <el-option label="设备类型" value="type" />
            </el-select>
          </el-form-item>

          <el-form-item label="自动发片：">
            <el-radio-group v-model="form.autoPrint">
              <el-radio-button :label="true">是</el-radio-button>
              <el-radio-button :label="false">否</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="延迟匹配：">
            <div class="delay">
              <el-input-number
                v-model="form.delayH"
                :min="0"
                :controls="false"
                class="delay-input"
              />
              <span class="delay-unit">h</span>
              <el-input-number
                v-model="form.delayM"
                :min="0"
                :max="59"
                :controls="false"
                class="delay-input"
              />
              <span class="delay-unit">m</span>
            </div>
          </el-form-item>

          <el-form-item label="是否需要OCR：">
            <el-radio-group v-model="form.containsExamInfo">
              <el-radio-button :label="true">是</el-radio-button>
              <el-radio-button :label="false">否</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>
      </el-form>
      <div class="bottom-actions">
        <el-button type="primary" plain @click="onMatchTemplate">匹配模板</el-button>
        <el-button type="primary" v-if="mode !== 'view'" @click="onSave">保存</el-button>
        <el-button type="primary" v-if="mode === 'view'" @click="onEdit">修改</el-button>
      </div>
    </div>

    <TemplateMatchDialog
      v-if="templateMatchVisible"
      v-model="templateMatchVisible"
      :ae-title-options="aeTitleOptions"
      :default-ae-title="currentAeTitle"
      :dicomPeer="tableData"
    />
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
}

@media (width <= 1100px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.delay {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.delay-input {
  width: 90px;
}

.delay-unit {
  color: var(--el-text-color-secondary);
}

.bottom-actions {
  display: flex;
  margin-top: 12px;
  justify-content: flex-end;
  gap: 12px;
}
</style>
