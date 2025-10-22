<template>
  <div class="business-form-item">
    <ElFormItem :label="field.label" :prop="field.prop" class="form-item">
      <!-- 输入框 -->
      <ElInput
        v-if="field.type === 'input'"
        :model-value="modelValue"
        :placeholder="field.prop || `请输入${field.label}`"
        @update:model-value="handleValueChange"
      />

      <!-- 数字输入框 -->
      <ElInputNumber
        v-else-if="field.type === 'number'"
        :model-value="modelValue"
        :placeholder="field.fieldDescription || `请输入${field.label}`"
        style="width: 100%"
        @update:model-value="handleValueChange"
      />

      <!-- 选择器 -->
      <ElSelect
        v-else-if="field.type === 'select'"
        :model-value="modelValue"
        :placeholder="field.fieldDescription || `请选择${field.label}`"
        clearable
        @update:model-value="handleValueChange"
      >
        <ElOption
          v-for="option in field.opt"
          :key="option.value || option.key"
          :label="option.label || option.name"
          :value="option.value || option.key"
        />
      </ElSelect>

      <!-- 链接输入 -->
      <ElInput
        v-else-if="field.type === 'link'"
        :model-value="modelValue"
        :placeholder="field.fieldDescription || `请输入${field.label}`"
        @update:model-value="handleValueChange"
      >
        <template #prepend>
          <span>{{ field.itemType || 'URL' }}</span>
        </template>
      </ElInput>

      <!-- 业务类型选择器 -->
      <ElSelect
        v-else-if="field.itemType === 'business'"
        :model-value="modelValue"
        :placeholder="field.fieldDescription || `请选择${field.label}`"
        clearable
        @update:model-value="handleValueChange"
      >
        <ElOption label="检查采集数量是否达标" value="checkCount" />
        <ElOption label="是否合并多部位检查数据" value="mergeData" />
        <ElOption label="是否删除云端已有报告" value="deleteReport" />
        <ElOption label="是否通过his查询胶片还是否收费" value="queryFee" />
      </ElSelect>

      <!-- 数据库类型选择器 -->
      <ElSelect
        v-else-if="field.itemType === 'database'"
        :model-value="modelValue"
        :placeholder="field.fieldDescription || `请选择${field.label}`"
        clearable
        @update:model-value="handleValueChange"
      >
        <ElOption label="SqlServer" value="sqlserver" />
        <ElOption label="MySQL" value="mysql" />
        <ElOption label="Oracle" value="oracle" />
        <ElOption label="PostgreSQL" value="postgresql" />
      </ElSelect>

      <!-- 连接字符串输入 -->
      <ElInput
        v-else-if="field.label && field.label.includes('连接字符串')"
        :model-value="modelValue"
        type="textarea"
        :rows="3"
        :placeholder="field.fieldDescription || '请输入数据库连接字符串'"
        @update:model-value="handleValueChange"
      />

      <!-- 视图名称输入 -->
      <ElInput
        v-else-if="field.label && field.label.includes('视图名称')"
        :model-value="modelValue"
        :placeholder="field.fieldDescription || '请输入视图名称'"
        @update:model-value="handleValueChange"
      />

      <!-- 默认输入框 -->
      <ElInput
        v-else
        :model-value="modelValue"
        :placeholder="field.fieldDescription || `请输入${field.label}`"
        @update:model-value="handleValueChange"
      />

      <!-- 字段描述 -->
      <div v-if="field.fieldDescription" class="field-description">
        {{ field.fieldDescription }}
      </div>
    </ElFormItem>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { ElFormItem, ElInput, ElInputNumber, ElSelect, ElOption } from 'element-plus'

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

interface Props {
  field: BusinessField
  modelValue: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

// 字段配置
const { field, modelValue } = toRefs(props)

// 处理值变化
const handleValueChange = (value: any) => {
  console.log(value)
  emit('update:modelValue', value)
}
</script>

<style scoped>
.business-form-item {
  margin-bottom: 16px;

  .form-item {
    margin-bottom: 0;
  }

  .field-description {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.4;
    color: #909399;
  }
}

:deep(.el-form-item__label) {
  min-width: 140px;
  font-weight: 500;
  color: #606266;
}

:deep(.el-input),
:deep(.el-select),
:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-group__prepend) {
  color: #606266;
  background: #f5f7fa;
  border-color: #dcdfe6;
}
</style>
