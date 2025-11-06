<template>
  <div class="dynamic-form-field">
    <ElFormItem
      v-if="
        (field.type === 'select' || field.type === 'link' || field.type === 'linkSelect') &&
        shouldShowField
      "
      :prop="field.prop"
      :label="field.fieldLabel || field.label"
    >
      <ElSelect
        :model-value="fieldValue"
        :placeholder="`请选择${field.fieldLabel || field.label}`"
        :clearable="true"
        @update:model-value="handleFieldChange"
        style="width: 450px"
      >
        <ElOption
          v-for="option in currentOptions"
          :key="option.value || option.key || option.prop"
          :label="option.label || option.name"
          :value="option.value || option.key || option.prop"
        />
      </ElSelect>
      <TipsConfig :type="field.itemType" :fieldDescription="field.fieldDescription" />
    </ElFormItem>

    <!-- 普通 input 输入框 -->
    <ElFormItem
      v-else-if="field.type === 'input' && shouldShowField"
      :prop="field.prop"
      :label="field.label || field.fieldLabel"
    >
      <ElInput
        :model-value="fieldValue"
        :placeholder="`请输入${field.fieldLabel || field.label}`"
        style="width: 450px"
        @update:model-value="handleFieldChange"
      />
      <TipsConfig :type="field.itemType" :fieldDescription="field.fieldDescription" />
    </ElFormItem>

    <!-- password 密码框 -->
    <ElFormItem
      v-else-if="field.type === 'password' && shouldShowField"
      :prop="field.prop"
      :label="field.fieldLabel || field.label"
    >
      <ElInput
        :model-value="fieldValue"
        type="password"
        :placeholder="`请输入${field.fieldLabel || field.label}`"
        show-password
        style="width: 450px"
        @update:model-value="handleFieldChange"
      />
      <TipsConfig :type="field.itemType" :fieldDescription="field.fieldDescription" />
    </ElFormItem>

    <!-- 数字输入 -->
    <ElFormItem
      v-else-if="field.type === 'number' && shouldShowField"
      :prop="field.prop"
      :label="field.fieldLabel || field.label"
      :rules="fieldRules"
    >
      <ElInputNumber
        :model-value="fieldValue"
        :placeholder="`请输入${field.fieldLabel || field.label}`"
        style="width: 450px"
        @update:model-value="handleFieldChange"
      />
      <TipsConfig :type="field.itemType" :fieldDescription="field.fieldDescription" />
    </ElFormItem>

    <!-- 文本域 -->
    <ElFormItem
      v-else-if="field.type === 'textarea' && shouldShowField"
      :prop="field.prop"
      :label="field.fieldLabel || field.label"
    >
      <ElInput
        :model-value="fieldValue"
        type="textarea"
        :rows="3"
        :placeholder="`请输入${field.fieldLabel || field.label}`"
        @update:model-value="handleFieldChange"
      />
      <TipsConfig :type="field.itemType" :fieldDescription="field.fieldDescription" />
    </ElFormItem>
    <!-- 时间选择器 -->
    <ElFormItem
      v-else-if="field.type === 'time' && shouldShowField"
      :prop="field.prop"
      :label="field.fieldLabel || field.label"
    >
      <ElTimePicker
        value-format="HH:mm:ss"
        format="HH:mm:ss"
        :model-value="fieldValue"
        placeholder="请选择时间"
        @update:model-value="handleFieldChange"
      />
      <TipsConfig :type="field.itemType" :fieldDescription="field.fieldDescription" />
    </ElFormItem>
    <ElFormItem
      v-else-if="field.type === 'date' && shouldShowField"
      :prop="field.prop"
      :label="field.fieldLabel || field.label"
    >
      <ElDatePicker
        :model-value="fieldValue"
        type="date"
        placeholder="请选择日期"
        @update:model-value="handleFieldChange"
      />
      <TipsConfig :type="field.itemType" :fieldDescription="field.fieldDescription" />
    </ElFormItem>

    <!-- 嵌套字段组 -->
    <div v-if="shouldShowField && changeField.length > 0" class="nested-fields">
      <div class="field-group-content">
        <DynamicFormField
          v-for="childField in changeField"
          :key="childField.prop"
          :field="childField"
          :model="model"
          :rules="props.rules"
          :parent-value="fieldValue"
          @update:model="handleChildFieldUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {
  ElFormItem,
  ElSelect,
  ElOption,
  ElInput,
  ElInputNumber,
  ElTimePicker,
  ElDatePicker
} from 'element-plus'
import TipsConfig from './TipsConfig.vue'

interface FieldConfig {
  type: string
  prop: string
  label: string
  fieldLabel?: string
  modelLabel?: string
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
  linkPd?: FieldConfig[]
  linkFlag?: string
  required?: boolean
}

interface Props {
  field: FieldConfig
  model: Record<string, any>
  parentValue?: any
  rules?: Record<string, any>
}
const changeField = ref<any[]>([])
const props = defineProps<Props>()

const emit = defineEmits<{
  'update:model': [{ prop: string; value: any }]
}>()

// 控制 modelSelect 的展开收起状态
// 字段当前值
const fieldValue = computed(() => {
  const value = props.model[props.field.prop] ?? props.field.dataDefault

  // 如果是 select 类型且没有值，尝试使用第一个选项作为默认值
  if (props.field.type === 'select' && (value === undefined || value === null || value === '')) {
    const options = props.field.opt?.length ? props.field.opt : props.field.defaultOpt
    if (options && options.length > 0) {
      const firstOption = options[0]
      const defaultValue = firstOption.value || firstOption.key || firstOption.prop
      console.log('设置选择器默认值:', defaultValue)
      return defaultValue
    }
  }

  // 时间类型的特殊处理
  if (props.field.type === 'time') {
    // 如果值为空或无效，返回 undefined 让时间选择器显示占位符
    if (value === undefined || value === null || value === '') {
      return undefined
    }
    // 确保返回的时间值格式正确
    return value
  }

  return value
})

// 字段验证规则
const fieldRules = computed(() => {
  // 优先使用传入的rules
  if (props.rules && props.rules[props.field.prop]) {
    return props.rules[props.field.prop]
  }

  return props.rules
})

// 当前可用选项
const currentOptions = computed(() => {
  // 如果有父节点依赖，根据父节点值获取选项
  if (props.field.parentNode && props.field.linkedModelList) {
    const parentVal = props.parentValue
    if (parentVal) {
      const linkedData = props.field.linkedModelList.find(
        (item) => item.key === parentVal || item.value === parentVal
      )
      return linkedData?.children || linkedData?.options || []
    }
    return []
  }

  const options = props.field.opt?.length ? props.field.opt : props.field.defaultOpt
  // 默认选项
  return options || []
})

// 是否显示字段
const shouldShowField = computed(() => {
  // 如果有父节点依赖，需要父节点有值才显示
  if (props.field.parentNode) {
    return props.parentValue !== undefined && props.parentValue !== null && props.parentValue !== ''
  }

  return true
})

// 处理字段值变化
const handleFieldChange = (value: any) => {
  // 对于 select 类型，查找选中选项的子字段
  if (
    props.field.type === 'select' ||
    props.field.type === 'linkSelect' ||
    props.field.type === 'link'
  ) {
    const selectedOption = props.field?.opt?.find(
      (item) => item.prop === value || item.value === value
    )
    console.log('选中的选项:', selectedOption)

    changeField.value = selectedOption?.fiedlInfos || []
    console.log('子字段:', changeField.value)
  }

  // 对于时间类型，直接传递值
  console.log('字段值变化:', props.field.prop, '新值:', value)
  emit('update:model', { prop: props.field.prop, value })

  // 如果当前字段变化，清空依赖此字段的子字段
  clearDependentFields(props.field.prop)
}

// 处理子字段更新
const handleChildFieldUpdate = (event: { prop: string; value: any }) => {
  emit('update:model', event)
}

// 清空依赖字段
const clearDependentFields = (parentProp: string) => {
  // 查找所有依赖当前字段的子字段并清空
  const clearChildFields = (fields: FieldConfig[]) => {
    fields?.forEach((field) => {
      if (field.parentNode === parentProp) {
        emit('update:model', { prop: field.prop, value: undefined })
        // 递归清空更深层的依赖
        clearChildFields(field.fiedlInfos || [])
      }
      // 继续检查嵌套字段
      if (field.fiedlInfos) {
        clearChildFields(field.fiedlInfos)
      }
    })
  }

  // 这里需要从根配置开始查找，但由于组件层级限制，
  // 实际使用时可能需要通过事件向上传递来处理
}

// 组件挂载时初始化默认值
onMounted(() => {
  // 延迟执行以确保父组件已经初始化
  setTimeout(() => {
    // 如果是select类型且没有值，设置默认值
    if (props.field.type === 'select') {
      const currentValue = props.model[props.field.prop]
      if (currentValue === undefined || currentValue === null || currentValue === '') {
        const options = props.field.opt?.length ? props.field.opt : props.field.defaultOpt
        if (options && options.length > 0) {
          const firstOption = options[0]
          const defaultValue = firstOption.value || firstOption.key || firstOption.prop
          if (defaultValue !== undefined) {
            console.log('初始化选择器默认值:', defaultValue, '字段:', props.field.prop)
            emit('update:model', { prop: props.field.prop, value: defaultValue })
          }
        }
      }
    }
  }, 100)
})
</script>

<style scoped>
.dynamic-form-field {
  margin-bottom: 16px;

  .model-select-container {
    margin-bottom: 20px;

    .model-card {
      border-radius: 8px;

      :deep(.el-card__header) {
        padding: 12px 16px;
        background: #f5f7fa;
        border-bottom: 1px solid #ebeef5;
      }

      :deep(.el-card__body) {
        padding: 16px;
      }
    }

    .model-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;

      .model-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }

    .model-content {
      .mb-3 {
        margin-bottom: 16px;
      }

      .sub-form-items {
        padding-left: 20px;
        margin-top: 16px;
        border-left: 2px solid #e4e7ed;

        .dynamic-form-field {
          margin-bottom: 12px;
        }
      }
    }
  }

  .nested-fields {
    padding-left: 20px;
    margin-top: 10px;
    margin-left: 20px;
    border-left: 2px solid #e4e7ed;
  }

  .field-group-title {
    margin-bottom: 15px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .field-group-content {
    .el-form-item {
      margin-bottom: 18px;
    }
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input),
:deep(.el-select) {
  width: 100%;
}
</style>
