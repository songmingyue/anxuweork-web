<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElButton, ElMessage } from 'element-plus'
import { CodeName, editsysparametersingle } from '@/api/authConf'

interface ExamLockConfig {
  value: string
}

const options = [
  {
    label: 'PACS同步',
    value: 'LockBySync'
  },
  {
    label: '人工锁定',
    value: 'LockByManual'
  }
]
const props = defineProps<{ modelValue: boolean; model?: Partial<ExamLockConfig> }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: ExamLockConfig): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const form = reactive<ExamLockConfig>({ value: 'ExamLockMethod' })
watch(
  () => props.model,
  (v) => v && Object.assign(form, v),
  { immediate: true }
)

function onCancel() {
  visible.value = false
}
async function onConfirm() {
  const { isSuccess, message } = await editsysparametersingle({
    code: CodeName.ExamLockMethod,
    value: JSON.stringify(form)
  })
  if (isSuccess) {
    ElMessage.success(message || '保存成功')
    visible.value = false
  } else {
    ElMessage.error(message || '保存失败')
  }
}
</script>

<template>
  <ElDialog v-model="visible" title="检查锁定方式" width="720px" append-to-body>
    <ElForm label-width="180px">
      <ElFormItem label="检查锁定方式">
        <ElSelect v-model="form.value" placeholder="请选择">
          <ElOption v-for="m in options" :key="m.value" :label="m.label" :value="m.value" />
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

<style scoped lang="less">
.dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
