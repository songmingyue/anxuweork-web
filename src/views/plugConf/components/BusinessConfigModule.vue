<template>
  <div class="business-config-module">
    <div v-show="!isCollapsed" class="module-content">
      <!-- 模块选择器 -->
      <div v-if="module.linkPd && module.linkPd.length > 0" class="module-selector">
        <ElFormItem :label="module.modelLabel" class="selector-item">
          <ElSelect
            :model-value="selectedOption"
            :placeholder="`请选择${module.modelLabel}`"
            @update:model-value="handleOptionChange"
            style="width: 100%"
          >
            <ElOption
              v-for="option in module.linkPd"
              :key="option.prop"
              :label="option.label"
              :value="option.prop"
            />
          </ElSelect>
        </ElFormItem>
      </div>

      <!-- 动态表单字段 - 只有当选中选项为"是"时才显示 -->
      <div v-if="shouldShowLinkPd" class="dynamic-fields">
        <template v-for="field in module.linkPd" :key="field.prop || field.label">
          <BusinessFormItem
            :field="field"
            :model-value="getFieldValue(field.prop)"
            @update:model-value="updateFieldValue(field.prop, $event)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElFormItem, ElSelect, ElOption } from 'element-plus'
import BusinessFormItem from './BusinessFormItem.vue'

interface BusinessField {
  type: string
  prop: string
  label?: string
  fieldDescription?: string
  itemType?: string
  dataDefault?: any
  opt?: any[]
  linkFlag?: string
}

interface BusinessModule {
  type: string
  prop: string
  dataDefault?: any
  linkFlag?: string
  linkPd?: BusinessField[]
  modelLabel?: string
  opt?: any[]
  width?: string
}

interface Props {
  module: BusinessModule
  modelValue: Record<string, any>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
}>()

// 控制展开收起状态
const isCollapsed = ref(props.module.dataDefault === 'false')

// 当前选中的选项
const selectedOption = ref('')

// 表单数据
const formData = ref<Record<string, any>>({})

// 计算是否应该显示 linkPd 字段（只有当选中的选项为"是"时才显示）
const shouldShowLinkPd = computed(() => {
  if (!props.module.linkPd || props.module.linkPd.length === 0) {
    return false
  }

  // 如果没有选项，直接显示
  if (!props.module.opt || props.module.opt.length === 0) {
    return true
  }

  // 查找当前选中的选项
  const currentOption = props.module.opt.find((opt) => opt.prop === selectedOption.value)

  // 只有当选中的选项的 label 或 prop 为"是"时才显示 linkPd
  return currentOption && (currentOption.label === '是' || currentOption.prop === '是')
})

// 处理选项变化
const handleOptionChange = (value: string) => {
  selectedOption.value = value
  updateFormData()
}

// 获取字段值
const getFieldValue = (prop: string) => {
  return formData.value[prop]
}

// 更新字段值
const updateFieldValue = (prop: string, value: any) => {
  formData.value[prop] = value
  updateFormData()
}

// 更新表单数据
const updateFormData = () => {
  const data = {
    ...formData.value,
    [props.module.linkFlag || 'selectedOption']: selectedOption.value
  }
  emit('update:modelValue', data)
}

// 初始化数据
const initData = () => {
  if (props.modelValue) {
    formData.value = { ...props.modelValue }
    selectedOption.value = props.modelValue[props.module.linkFlag || 'selectedOption'] || ''
  } else if (props.module.dataDefault) {
    formData.value = { ...props.module.dataDefault }
  }
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  () => {
    initData()
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.business-config-module {
  margin-bottom: 20px;

  .module-card {
    border: 1px solid #e4e7ed;
    border-radius: 8px;

    :deep(.el-card__header) {
      padding: 16px 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-bottom: 1px solid #e4e7ed;
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    .module-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .module-content {
    .module-selector {
      padding-bottom: 20px;
      margin-bottom: 20px;
      border-bottom: 1px dashed #e4e7ed;

      .selector-item {
        margin-bottom: 0;
      }
    }

    .dynamic-fields {
      .business-form-item + .business-form-item {
        margin-top: 16px;
      }
    }
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-select) {
  width: 100%;
}
</style>
