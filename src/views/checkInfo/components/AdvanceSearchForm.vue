<template>
  <el-form :model="modelValue" label-width="68px" class="advance-grid" label-position="left">
    <div v-for="sec in sections" :key="sec.key">
      <h3 class="form-title">{{ sec.title }}</h3>
      <template v-for="item in formSchema[sec.key]" :key="item.prop || item.label">
        <!-- 双字段（如年龄 + 单位） -->
        <el-form-item
          v-if="item.type === 'double'"
          :label-width="item.labelWidth ? item.labelWidth : '68px'"
          :label="item.label"
        >
          <div class="double-group">
            <template v-for="(sub, idx) in item.pdList" :key="idx">
              <el-input-number
                v-if="sub.type === 'number'"
                :model-value="modelValue[sub.prop]"
                @update:model-value="updateValue(sub.prop, $event)"
                :min="sub.min ?? 0"
                :max="sub.max ?? 99999"
                :style="{ width: sub.width || '120px' }"
                :controls="false"
              />
              <el-select
                v-else-if="sub.type === 'select'"
                :disabled="sub.vIf"
                :model-value="modelValue[sub.prop]"
                @update:model-value="updateValue(sub.prop, $event)"
                :style="{ width: sub.width || '100px' }"
                :filterable="!!sub.filterable"
                clearable
              >
                <el-option
                  v-for="opt in getFieldOptions(sub)"
                  :key="opt.itemCode || opt.prop || opt.value"
                  :label="opt.itemName || opt.name || opt.lable"
                  :value="opt.itemCode || opt.prop || opt.value"
                />
              </el-select>

              <span v-else class="double-gap"></span>
            </template>
          </div>
        </el-form-item>
        <!-- 普通输入类 -->

        <el-form-item
          v-else
          :label-width="item.labelWidth ? item.labelWidth : '68px'"
          :label="item.label"
          :prop="item.prop"
        >
          <el-input
            v-if="item.type === 'input'"
            :model-value="modelValue[item.prop]"
            @update:model-value="updateValue(item.prop, $event)"
            :style="{ width: item.width || '180px' }"
            clearable
            placeholder="请输入"
          />
          <el-date-picker
            v-else-if="item.type === 'date'"
            :model-value="modelValue[item.prop]"
            @update:model-value="updateValue(item.prop, $event)"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            :style="{ width: item.width || '180px' }"
            placeholder="选择日期"
          />
          <el-select
            v-else-if="item.type === 'select'"
            :model-value="modelValue[item.prop]"
            @update:model-value="updateValue(item.prop, $event)"
            :style="{ width: item.width || '180px' }"
            :filterable="!!item.filterable"
            :disabled="item.vIf"
            clearable
          >
            <el-option
              v-for="opt in getFieldOptions(item)"
              :key="opt.itemCode || opt.prop || opt.value"
              :label="opt.itemName || opt.name || opt.lable"
              :value="opt.itemCode || opt.prop || opt.value"
            />
          </el-select>
          <el-select
            v-else-if="item.type === 'selectDoctore'"
            :disabled="item.vIf"
            :model-value="modelValue[item.prop]"
            @update:model-value="updateValue(item.prop, $event)"
            :style="{ width: item.width || '100px' }"
            :filterable="!!item.filterable"
            clearable
          >
            <el-option
              v-for="opt in getFieldOptions(item)"
              :key="opt.itemCode || opt.prop || opt.value"
              :label="opt.itemName || opt.name || opt.lable"
              :value="opt.itemName"
            />
          </el-select>
          <el-select
            v-else-if="item.type === 'muliSelect' || item.type === 'virtualSelect'"
            :model-value="modelValue[item.prop]"
            collapse-tags
            @update:model-value="updateValue(item.prop, $event)"
            multiple
            :style="{ width: item.width || '180px' }"
            :filterable="!!item.filterable"
            :disabled="item.vIf"
            clearable
          >
            <el-option
              v-for="opt in getFieldOptions(item)"
              :key="opt.itemCode || opt.prop || opt.label"
              :label="opt.itemName || opt.name || opt.label || opt.lable"
              :value="opt.itemCode || opt.prop || opt.value"
            />
          </el-select>
        </el-form-item>
      </template>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElInputNumber
} from 'element-plus'
import { getSearchFormList } from '../searchOptions'

interface Props {
  modelValue: Record<string, any>
  formOptions?: Record<string, any[]>
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void
}

const props = withDefaults(defineProps<Props>(), {
  formOptions: () => ({})
})

const emit = defineEmits<Emits>()

// 动态渲染的 schema 段落
const sections = [
  { title: '患者信息', key: 'userMsg' },
  { title: '就诊信息', key: 'medicalMsg' },
  { title: '检查信息', key: 'checkMsg' },
  { title: '状态/标识', key: 'statusMsg' },
  { title: '检查结果', key: 'inspectionResults' }
]

// 动态获取最新的表单配置
const formSchema = computed(() => getSearchFormList())

// 获取字段选项
const getFieldOptions = (field: any) => {
  console.log('获取字段选项:', field)
  // 优先使用从父组件传入的选项
  if (props.formOptions[field.prop] && props.formOptions[field.prop].length > 0) {
    return props.formOptions[field.prop]
  }

  // 如果有 opt 属性且是数组，直接使用
  if (Array.isArray(field.opt)) {
    return field.opt
  }

  // 如果 opt 是函数或者其他值，尝试执行
  if (typeof field.opt === 'function') {
    try {
      return field.opt() || []
    } catch (error) {
      console.warn('执行选项函数失败:', error)
      return []
    }
  }

  // 处理 Promise 返回值
  if (field.opt && typeof field.opt.then === 'function') {
    // 对于异步选项，暂时返回空数组，实际应该在组件挂载时处理
    return []
  }

  return []
}

// 更新单个字段值
const updateValue = (key: string, value: any) => {
  console.log('更新字段:', key, '值:', value)
  const newValue = {
    ...props.modelValue,
    [key]: value
  }
  console.log('新的modelValue:', newValue)
  emit('update:modelValue', newValue)
}
</script>

<style scoped>
.advance-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(220px, 1fr));
  gap: 12px 16px;
}

.double-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.double-gap {
  width: 8px;
}

.form-title {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 700;
}
</style>
