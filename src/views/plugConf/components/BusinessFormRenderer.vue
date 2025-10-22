<template>
  <div class="business-form-renderer">
    <el-collapse>
      <el-collapse-item
        :title="configItem.modelLabel || '配置项'"
        v-for="configItem in config"
        :key="configItem.prop"
      >
        <DynamicFormField
          v-for="(field, index) in (configItem.opt as any)[0].fiedlInfos"
          :key="field.prop || index"
          :field="field"
          :model="formData"
          @update:model="handleFieldUpdate"
        />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
// import BusinessConfigModule from './BusinessConfigModule.vue'
import DynamicFormField from './DynamicFormField.vue'
import { ElCollapse, ElCollapseItem } from 'element-plus'
interface BusinessModule {
  type: string
  prop: string
  dataDefault?: any
  linkFlag?: string
  linkPd?: any[]
  modelLabel?: string
  opt?: any[]
  width?: string
}

interface Props {
  config: BusinessModule[]
  modelValue: Record<string, any>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
}>()

const formData = ref<Record<string, any>>({})

// 处理字段更新
const handleFieldUpdate = (data: { prop: string; value: any }) => {
  console.log('BusinessFormRenderer 字段更新:', data)
  formData.value[data.prop] = data.value
  console.log('BusinessFormRenderer 当前表单数据:', formData.value)
  emit('update:modelValue', { ...formData.value })
}

// 初始化表单数据
const initFormData = () => {
  const newFormData: Record<string, any> = {}

  props.config?.forEach((module) => {
    // 初始化主字段的默认值
    if (module.dataDefault !== undefined) {
      newFormData[module.prop] = module.dataDefault
    }

    // 如果有opt选项，处理内部的fiedlInfos字段
    if (module.opt && module.opt.length > 0) {
      module.opt.forEach((option) => {
        if (option.fiedlInfos && option.fiedlInfos.length > 0) {
          option.fiedlInfos.forEach((field) => {
            if (field.dataDefault !== undefined) {
              newFormData[field.prop] = field.dataDefault
            }
          })
        }
      })
    }
  })

  // 合并传入的值
  if (props.modelValue) {
    Object.assign(newFormData, props.modelValue)
  }

  console.log('BusinessFormRenderer 初始化数据:', newFormData)
  formData.value = newFormData
}

// 监听配置变化
watch(
  () => props.config,
  (newConfig) => {
    console.log('BusinessFormRenderer 接收到的配置数据:', newConfig)
    initFormData()
  },
  { immediate: true, deep: true }
)

// 监听外部模型值变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && typeof newVal === 'object') {
      formData.value = { ...formData.value, ...newVal }
    }
  },
  { deep: true }
)
</script>

<style scoped>
.business-form-renderer {
  .debug-info {
    padding: 12px;
    margin-bottom: 16px;
    color: #fa8c16;
    background: #fff2e8;
    border: 1px solid #faad14;
    border-radius: 4px;
  }

  .config-item {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .config-item-title {
    padding: 12px 16px;
    margin-bottom: 16px;
    font-weight: 600;
    color: #303133;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-left: 4px solid #409eff;
    border-radius: 6px;
  }

  .main-selector {
    padding: 16px;
    margin-bottom: 16px;
    background: #f8f9fa;
    border-left: 4px solid #409eff;
    border-radius: 6px;
  }

  .direct-field {
    padding: 16px;
    margin-bottom: 16px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-left: 4px solid #67c23a;
    border-radius: 6px;
  }

  .sub-fields {
    padding: 16px;
    margin-top: 16px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;

    :deep(.dynamic-form-field) {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
