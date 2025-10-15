<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { CodeName, editsysparametersingle } from '@/api/authConf'

const props = defineProps<{
  modelValue: boolean
  title: string
  value?: string
  placeholder?: string
  textarea?: boolean
  codeNameVal: CodeName
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: string): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const state = reactive<{ val: string }>({ val: props.value ?? '' })

watch(
  () => props.value,
  (v) => {
    if (props.title === '节点接受数椐临时目录') {
      state.val = (JSON.parse(v as any) as any).TemporaryDirectory
    } else if (props.title === '消息系统配置') {
      state.val = (JSON.parse(v as any) as any).Url
    } else {
      state.val = v ?? ''
    }
  }
)

function onCancel() {
  visible.value = false
}

async function onConfirm() {
  const { isSuccess, message } = await editsysparametersingle({
    code: props.codeNameVal,
    value:
      props.title === '节点接受数椐临时目录'
        ? JSON.stringify({
            TemporaryDirectory: state.val
          })
        : props.title === '消息系统配置'
          ? JSON.stringify({
              Url: state.val
            })
          : String(state.val || '')
  })
  // emit('save', state.val ?? '')
  if (isSuccess) {
    emit('save', state.val ?? '')
    ElMessage.success(message || '保存成功')
    visible.value = false
  } else {
    // 可以根据需要添加错误处理逻辑
    ElMessage.error(message || '保存失败')
  }
}
</script>

<template>
  <ElDialog v-model="visible" :title="title" width="720px" append-to-body>
    <ElForm label-width="100px">
      <ElFormItem label="参数值">
        <ElInput
          v-model="state.val"
          :placeholder="placeholder || '请输入'"
          :type="textarea ? 'textarea' : 'text'"
          :autosize="textarea ? { minRows: 3, maxRows: 10 } : undefined"
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
