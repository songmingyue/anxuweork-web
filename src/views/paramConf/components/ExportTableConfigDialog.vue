<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElDialog, ElButton, ElTransfer } from 'element-plus'

export interface Options {
  prop: string
  label: string
  sort: boolean
  width: number
}

const props = defineProps<{
  modelValue: boolean
  // 左侧可选列表（Options[]），不传则使用内置 table 列集合
  available?: Options[]
  // 右侧已选列表（Options[]）
  selected?: Options[]
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: Options[]): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

// 内置全量列集合（作为默认 available）
const tables = ref<Options[]>([
  { prop: 'examItemName', label: '检查项目', sort: true, width: 80 },
  { prop: 'serviceSectID', label: '类型', sort: true, width: 80 },
  { prop: 'procedureName', label: '检查部位', sort: true, width: 80 },
  { prop: 'patientName', label: '姓名', sort: true, width: 80 },
  { prop: 'gender', label: '性别', sort: true, width: 80 },
  { prop: 'age', label: '年龄', sort: true, width: 80 },
  { prop: 'contactPhoneNO', label: '电话', sort: true, width: 80 },
  { prop: 'birthDay', label: '生日', sort: true, width: 80 },
  { prop: 'idCardNo', label: '身份证', sort: true, width: 80 },
  { prop: 'medRecNO', label: '病历号', sort: true, width: 80 },
  { prop: 'patientClass', label: '就诊类型', sort: true, width: 80 },
  { prop: 'visitID', label: '就诊号', sort: true, width: 80 },
  { prop: 'inPatientNO', label: '住院号', sort: true, width: 80 },
  { prop: 'outPatientNO', label: '门诊号', sort: true, width: 80 },
  { prop: 'pointOfCare', label: '病区', sort: true, width: 80 },
  { prop: 'bed', label: '床号', sort: true, width: 80 },
  { prop: 'requestOrgName', label: '申请机构', sort: true, width: 80 },
  { prop: 'requestDeptName', label: '申请科室', sort: true, width: 80 },
  { prop: 'requestDocName', label: '申请医生', sort: true, width: 80 },
  { prop: 'requestedDate', label: '申请时间', sort: true, width: 80 },
  { prop: 'regTime', label: '登记时间', sort: true, width: 80 },
  { prop: 'organizationName', label: '检查机构', sort: true, width: 80 },
  { prop: 'examDeptName', label: '检查科室', sort: true, width: 80 },
  { prop: 'examDate', label: '检查时间', sort: true, width: 80 },
  { prop: 'auditDate', label: '审核时间', sort: true, width: 80 },
  { prop: 'patientID', label: '患者编号', sort: true, width: 80 },
  { prop: 'accessionNumber', label: '检查号', sort: true, width: 80 },
  { prop: 'abnormalFlags', label: '阴阳性', sort: true, width: 80 },
  { prop: 'imagingFinding', label: '影像所见', sort: true, width: 80 },
  { prop: 'imagingDiagnosis', label: '影像诊断', sort: true, width: 80 }
])

// 实际数据源：优先使用外部 available，否则使用内置 tables
const fullList = computed<Options[]>(() =>
  props.available && props.available.length ? props.available : tables.value
)

// Transfer 需要的数据结构：key + label（必须包含右侧 keys 对应项）
const transferData = computed(() => fullList.value.map((o) => ({ key: o.prop, label: o.label })))
// 右侧目标 keys（由右侧 Options 生成）
const targetKeys = ref<string[]>([])

// 当弹窗打开或 selectValue 变化时，初始化 targetKeys
watch(
  () => props.selected,
  () => {
    targetKeys.value = (props.selected || []).map((x) => x.prop)
  },
  { immediate: true, deep: true }
)

function onConfirm() {
  // 将 targetKeys 映射回 Options[]（按当前右侧顺序）
  const dict = new Map(fullList.value.map((o) => [o.prop, o]))
  const right = targetKeys.value.map((k) => dict.get(k)).filter(Boolean) as Options[]
  emit('save', right)
  visible.value = false
}
function onCancel() {
  visible.value = false
}
</script>

<template>
  <ElDialog v-model="visible" title="检查信息表格导出配置" width="900px" append-to-body>
    <ElTransfer
      v-model="targetKeys"
      :data="transferData"
      :titles="['列表选项', '列表显示']"
      target-order="push"
    />

    <template #footer>
      <div class="dlg-footer">
        <ElButton @click="onCancel">取消</ElButton>
        <ElButton type="primary" @click="onConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped lang="less">
.dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
