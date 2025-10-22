<template>
  <div class="dynamic-form-renderer">
    <div v-if="config" class="form-section">
      <!-- 表单标题 -->
      <!-- 动态表单 -->
      <ElForm
        ref="dynamicFormRef"
        :model="formModel"
        :rules="dynamicRules"
        :label-width="config.labelWidth || '220px'"
      >
        <template v-if="config.fiedlInfos && config.fiedlInfos.length > 0">
          <DynamicFormField
            v-for="(field, index) in config.fiedlInfos"
            :key="field.prop || index"
            :field="field"
            :model="formModel"
            :rules="dynamicRules"
            :parent-value="getParentValue(field)"
            @update:model="updateModel"
          />
        </template>
      </ElForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElForm } from 'element-plus'
import DynamicFormField from './DynamicFormField.vue'

interface FieldConfig {
  type: string
  prop: string
  label: string
  fieldLabel?: string
  dataDefault?: any
  width?: string
  opt?: any[]
  defaultOpt?: any[]
  parentNode?: string
  modelLinkType?: string
  linkedModelName?: string
  linkedModelList?: any[]
  linkedComponent?: string
  modelFlag?: any[]
  fieldDescription?: string
  itemType?: string
  fiedlInfos?: FieldConfig[]
  required?: boolean
}

interface FormConfig {
  type: string
  prop: string
  dataDefault?: Record<string, any>
  required?: Record<string, string>
  label: string
  labelWidth?: string
  fiedlInfos: FieldConfig[]
}

interface Props {
  config: FormConfig | null
  modelValue: Record<string, any>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
}>()

const dynamicFormRef = ref()
const formModel = ref<Record<string, any>>({})

// 动态验证规则
const dynamicRules = computed(() => {
  const rules: Record<string, any> = {}

  if (props.config?.required) {
    Object.entries(props.config.required).forEach(([key, message]) => {
      rules[key] = [{ required: true, message: `请输入${message}`, trigger: 'blur' }]
    })
  }

  return rules
})

// 获取父节点值
const getParentValue = (field: FieldConfig) => {
  if (!field.parentNode) return null
  return formModel.value[field.parentNode]
}

// 更新模型数据
const updateModel = (event: { prop: string; value: any }) => {
  formModel.value[event.prop] = event.value
  emit('update:modelValue', { ...formModel.value })
}

// 初始化表单数据
const initFormData = () => {
  const newFormModel: Record<string, any> = {}

  if (props.config?.dataDefault) {
    Object.assign(newFormModel, props.config.dataDefault)
  }

  // 合并传入的值
  if (props.modelValue) {
    Object.assign(newFormModel, props.modelValue)
  }

  formModel.value = newFormModel
}

// 监听配置变化
watch(
  () => props.config,
  () => {
    if (props.config) {
      initFormData()
    }
  },
  { immediate: true, deep: true }
)

// 监听外部模型值变化
watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    // 避免在初始化时触发循环
    if (newVal && typeof newVal === 'object' && newVal !== oldVal) {
      // 检查是否有实际变化
      const hasChanges = Object.keys(newVal).some((key) => formModel.value[key] !== newVal[key])
      if (hasChanges) {
        formModel.value = { ...newVal }
      }
    }
  },
  { deep: true }
)

// 暴露验证方法
defineExpose({
  validate: () => dynamicFormRef.value?.validate(),
  resetFields: () => dynamicFormRef.value?.resetFields(),
  clearValidate: () => dynamicFormRef.value?.clearValidate()
})
</script>

<style scoped>
.dynamic-form-renderer {
  .form-title {
    padding-bottom: 8px;
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    border-bottom: 2px solid #409eff;
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }

  :deep(.el-input),
  :deep(.el-select) {
    width: 100%;
  }
}
</style>
