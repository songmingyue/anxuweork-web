<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElRadioButton,
  ElRadioGroup,
  ElMessage
} from 'element-plus'
import type { ConfigTabExpose } from './types'
import { DiskConfig } from '@/api/configuration'
const props = defineProps({
  adminConfigInfo: {
    type: Object,
    required: false,
    default: () => ({})
  },
  defaultConfigInfo: {
    type: Object,
    required: false,
    default: () => ({})
  }
})
const emit = defineEmits(['onChangeConfig'])
const defaultForm: DiskConfig = {
  cleanDiskType: 0,
  diskLimit: null,
  reservedDate: 0
}

const form = reactive<DiskConfig>({ ...defaultForm })

const reset = () => {
  Object.assign(form, defaultForm)
}

const submit = () => {
  ElMessage.success('保存成功')
}

onMounted(() => {
  const { diskConfig } = props.adminConfigInfo || {}
  Object.assign(form, diskConfig)
})
const formChange = () => {
  const newConfig = props.adminConfigInfo
  newConfig.diskConfig = { ...form }
  emit('onChangeConfig', newConfig)
}
watch(
  () => [form.cleanDiskType, form.diskLimit, form.reservedDate],
  (newVal, oldVal) => {
    if (newVal && oldVal) {
      formChange()
    }
  },
  { immediate: true }
)

defineExpose<ConfigTabExpose>({ submit, reset })
</script>

<template>
  <el-card shadow="never" class="tab-card">
    <div class="tab-header">
      <div class="tab-title">磁盘管理</div>
      <div class="tab-actions">
        <el-button @click="reset">重置</el-button>
        <el-button @click="reset">取消</el-button>
      </div>
    </div>

    <el-form :model="form" label-width="110px" class="form" @submit.prevent>
      <el-form-item label="自动删除：">
        <el-radio-group v-model="form.cleanDiskType">
          <el-radio-button :value="0">不删除</el-radio-button>
          <el-radio-button :value="1">按天数删除</el-radio-button>
          <el-radio-button :value="2">按磁盘百分比删除</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="form.cleanDiskType === 1" label="保留：">
        <el-input v-model="form.reservedDate" placeholder="0">
          <template #append>天</template>
        </el-input>
      </el-form-item>

      <template v-if="form.cleanDiskType === 2">
        <el-form-item label="至磁盘：">
          <el-input v-model="form.diskLimit" placeholder="请输入内容">
            <template #append>%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="极限删除保留">
          <el-input v-model="form.reservedDate" placeholder="0">
            <template #append>天</template>
          </el-input>
        </el-form-item>
      </template>
    </el-form>
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

.form {
  max-width: 760px;
}
</style>
