<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { CodeName, editsysparametersingle } from '@/api/authConf'

interface HeNanCfg {
  Url: string
  ProviderID: string
  ProviderKey: string
}

const props = defineProps<{ modelValue: boolean; model?: any }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: HeNanCfg): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const form = reactive<HeNanCfg>({ Url: '', ProviderID: '', ProviderKey: '' })
watch(
  () => props.model,
  (v) => v && typeof v === 'string' && Object.assign(form, JSON.parse(v)),
  { immediate: true }
)

function onCancel() {
  visible.value = false
}
async function onConfirm() {
  const { isSuccess, message } = await editsysparametersingle({
    code: CodeName.HeNanProviceImageAppInfo,
    value: JSON.stringify(form)
  })
  // emit('save', state.val ?? '')
  if (isSuccess) {
    ElMessage.success(message || '保存成功')
    visible.value = false
  } else {
    // 可以根据需要添加错误处理逻辑
    ElMessage.error(message || '保存失败')
  }
}
</script>

<template>
  <ElDialog v-model="visible" title="河南省平台相关配置" width="720px" append-to-body>
    <ElForm label-width="220px">
      <ElFormItem label="河南省平台注册地址">
        <ElInput v-model="form.Url" placeholder="http://..." />
      </ElFormItem>
      <ElFormItem label="厂商ID">
        <input type="text" style="display: none" autocomplete="username" />
        <ElInput v-model="form.ProviderID" placeholder="请输入厂商ID" autocomplete="off" />
      </ElFormItem>
      <ElFormItem label="厂商密钥">
        <input type="password" style="display: none" autocomplete="new-password" />
        <ElInput
          type="password"
          v-model="form.ProviderKey"
          placeholder="请输入厂商密钥"
          autocomplete="off"
          show-password
        />
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
