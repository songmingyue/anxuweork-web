<template>
  <div class="linkpd-array-renderer">
    <div v-if="linkPdArray && linkPdArray.length > 0" class="linkpd-container">
      <!-- 遍历每个 linkPd 数组项 -->
      <!-- 如果是复杂对象 -->
      <div class="complex-object">
        <BusinessFormItems
          v-for="(value, key) in linkPdArray"
          :key="`${key}-${key}`"
          :field="value as any"
          :model-value="getObjectFieldValue(key, key.toString())"
          @update:model-value="updateObjectFieldValue(key, key.toString(), $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BusinessFormItems from './BusinessFormItem.vue'

interface LinkPdField {
  type?: string
  prop: string
  label?: string
  fieldDescription?: string
  dataDefault?: any
  opt?: any[]
  width?: string
}

interface Props {
  linkPdArray: (LinkPdField[] | Record<string, any>)[]
  modelValue: Record<string, any>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
}>()

// 表单数据
const formData = ref<Record<string, any>>({})

// 折叠状态管理
const collapsedStates = ref<boolean[]>([])

// 初始化折叠状态
const initCollapsedStates = () => {
  if (props.linkPdArray) {
    collapsedStates.value = props.linkPdArray.map(() => false)
  }
}

// 判断是否为简单数组（包含 field 对象）
const isSimpleArray = (item: any): item is LinkPdField[] => {
  return Array.isArray(item) && item.length > 0 && typeof item[0] === 'object' && 'prop' in item[0]
}

// 获取对象字段值
const getObjectFieldValue = (itemIndex: number, key: string) => {
  return formData.value[`obj_${itemIndex}_${key}`]
}

// 更新对象字段值
const updateObjectFieldValue = (itemIndex: number, key: string, value: any) => {
  formData.value[`obj_${itemIndex}_${key}`] = value
  emitUpdate()
}

// 发送更新事件
const emitUpdate = () => {
  emit('update:modelValue', { ...formData.value })
}

// 初始化表单数据
const initFormData = () => {
  const newFormData: Record<string, any> = {}

  if (props.linkPdArray) {
    props.linkPdArray.forEach((item, itemIndex) => {
      if (isSimpleArray(item)) {
        // 处理简单数组
        item.forEach((field) => {
          newFormData[`${itemIndex}_${field.prop}`] = field.dataDefault || ''
        })
      } else if (typeof item === 'object' && item !== null) {
        // 处理对象
        Object.keys(item).forEach((key) => {
          newFormData[`obj_${itemIndex}_${key}`] = item[key]
        })
      }
    })
  }

  // 合并传入的值
  if (props.modelValue) {
    Object.assign(newFormData, props.modelValue)
  }

  formData.value = newFormData
}

// 监听 linkPdArray 变化
watch(
  () => props.linkPdArray,
  () => {
    initCollapsedStates()
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

// 初始化
initCollapsedStates()
</script>

<style scoped>
.linkpd-array-renderer {
  .no-linkpd {
    padding: 40px 0;
    font-size: 14px;
    color: #909399;
    text-align: center;
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}
</style>
