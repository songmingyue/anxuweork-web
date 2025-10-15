<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'

interface DicomNodeCfg {
  tempDir: string
}

const props = defineProps<{ modelValue: boolean; model?: Partial<DicomNodeCfg> }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: DicomNodeCfg): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const form = reactive<DicomNodeCfg>({ tempDir: '' })
watch(
  () => props.model,
  (v) => v && Object.assign(form, v),
  { immediate: true }
)

function onCancel() {
  visible.value = false
}
function onConfirm() {
  emit('save', { ...form })
  visible.value = false
}
</script>

<template>
  <ElDialog v-model="visible" title="Dicom节点配置" width="720px" append-to-body>
    <ElForm label-width="220px">
      <ElFormItem label="节点接受数据临时目录">
        <ElInput v-model="form.tempDir" placeholder="路径如：C:\\temp 或 /Users/username/temp" />
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
