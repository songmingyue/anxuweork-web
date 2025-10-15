<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'

interface MessageCfg {
  url: string
}

const props = defineProps<{ modelValue: boolean; model?: Partial<MessageCfg> }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: MessageCfg): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const form = reactive<MessageCfg>({ url: '' })
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
  <ElDialog v-model="visible" title="消息系统配置" width="720px" append-to-body>
    <ElForm label-width="220px">
      <ElFormItem label="消息系统配置地址">
        <ElInput v-model="form.url" placeholder="格式： http://192.168.1.18:7080" />
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
