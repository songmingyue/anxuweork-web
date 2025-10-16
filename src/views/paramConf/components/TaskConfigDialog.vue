<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElMessage
} from 'element-plus'
import { addConfig, ConfigItem, updateConfig } from '@/api/authConf'
import { conditionOptions } from './option'

const props = defineProps<{
  modelValue: boolean
  title?: string
  model?: Partial<ConfigItem>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const form = ref<ConfigItem>({})
const isInitializing = ref(false) // 标识是否正在初始化

// 监听弹窗打开,初始化表单
watch(
  () => [props.modelValue, props.model],
  () => {
    if (!props.modelValue) return

    isInitializing.value = true
    form.value = {
      taskName: props.model?.taskName || '',
      taskType: props.model?.taskType || '',
      taskTarget: props.model?.taskTarget || '',
      dataType: props.model?.dataType || ''
    }
    // 使用 nextTick 确保初始化完成后再允许清空逻辑
    setTimeout(() => {
      isInitializing.value = false
    }, 0)
  },
  { immediate: true }
)

// 监听任务类型变化,清空后续关联字段
watch(
  () => form.value.taskType,
  () => {
    if (isInitializing.value) return // 初始化时不清空
    form.value.taskTarget = ''
    form.value.dataType = ''
  }
)

// 监听任务目的地变化,清空数据类型
watch(
  () => form.value.taskTarget,
  () => {
    if (isInitializing.value) return // 初始化时不清空
    form.value.dataType = ''
  }
)

const rules: Record<string, any> = {
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  taskTarget: [{ required: true, message: '请选择任务目的地', trigger: 'change' }],
  dataType: [{ required: true, message: '请选择数据类型', trigger: 'change' }]
}

// 根据任务类型动态获取任务目的地选项
const dynamicTaskTargetOptions = computed(
  () => conditionOptions.find((item) => item.value === form.value.taskType)?.children || []
)

// 根据任务目的地动态获取数据类型选项
const computedDataTypeOptions = computed(
  () =>
    dynamicTaskTargetOptions.value.find((item) => item.value === form.value.taskTarget)?.children ||
    []
)

// 动态表单选项配置
const taskOptions = computed(() => [
  {
    label: '任务类型',
    value: 'taskType',
    options: conditionOptions
  },
  {
    label: '任务目的地',
    value: 'taskTarget',
    options: dynamicTaskTargetOptions.value
  },
  {
    label: '数据类型',
    value: 'dataType',
    options: computedDataTypeOptions.value
  }
])

function onConfirm() {
  formRef.value?.validate(async (ok) => {
    if (!ok) return
    let data = {} as any
    if (props.model?.id) {
      form.value.id = props.model.id
      data = await updateConfig({ ...form.value, id: props.model.id })
    } else {
      data = await addConfig(form.value)
    }
    if (data.isSuccess) {
      emit('save')
      visible.value = false
      ElMessage.success(data.message || '操作成功')
    } else {
      // 失败不关闭弹窗
      ElMessage.error(data.message || '操作失败')
      return
    }
  })
}

function onCancel() {
  visible.value = false
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="title || '新增任务'"
    width="560px"
    destroy-on-close
    append-to-body
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem prop="taskName" label="任务名称" required>
        <ElInput v-model="form.taskName" placeholder="请输入任务名称" />
      </ElFormItem>
      <ElFormItem
        v-for="item in taskOptions"
        :label="item.label"
        :prop="item.value"
        :key="item.value"
      >
        <ElSelect v-model="form[item.value]" placeholder="请选择" clearable>
          <ElOption
            v-for="opt in item.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dlg-footer">
        <ElButton @click="onCancel">取消</ElButton>
        <ElButton type="primary" @click="onConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
