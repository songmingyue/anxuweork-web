<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElButton, ElMessage } from 'element-plus'
import { CodeName, editsysparametersingle } from '@/api/authConf'

const props = defineProps<{ modelValue: boolean; title: string; label: string; value?: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const boolVal = ref<boolean>(false)

watch(
  () => props.value,
  (v) => {
    if (v !== undefined) {
      boolVal.value = v
    }
  }
)

const options = [
  { label: '是', value: true },
  { label: '否', value: false }
]

function onCancel() {
  visible.value = false
}
async function onConfirm() {
  const { isSuccess, message } = await editsysparametersingle({
    code: CodeName.ISDownloadReportInWebAuto,
    value: JSON.stringify(boolVal.value)
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
  <ElDialog v-model="visible" :title="title" width="720px" append-to-body>
    <ElForm label-width="210px">
      <ElFormItem :label="label">
        <ElSelect v-model="boolVal" placeholder="请选择">
          <ElOption v-for="o in options" :key="String(o.value)" :label="o.label" :value="o.value" />
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
