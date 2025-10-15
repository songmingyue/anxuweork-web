<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { CodeName, editsysparametersingle } from '@/api/authConf'

interface InterconnectConfig {
  url: string
  key: string
}

const props = defineProps<{ modelValue: boolean; model?: Partial<InterconnectConfig> }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: InterconnectConfig): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const form = reactive<InterconnectConfig>({ url: '', key: '' })
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
    code: CodeName.RelatedExamConfig,
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
  <ElDialog v-model="visible" title="互联网互通配置" width="720px" append-to-body>
    <ElForm label-width="180px">
      <ElFormItem label="互联网通道地址">
        <ElInput v-model="form.url" placeholder="http://sample.com" />
      </ElFormItem>
      <ElFormItem label="秘钥">
        <ElInput v-model="form.key" placeholder="请输入秘钥" />
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
