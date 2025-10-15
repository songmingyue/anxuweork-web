<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElButton, ElMessage } from 'element-plus'
import { CodeName, editsysparametersingle } from '@/api/authConf'

type ChargeValue = '1' | '0'

const props = defineProps<{ modelValue: boolean; value?: ChargeValue }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const state = reactive<{ charge: ChargeValue }>({ charge: props.value ?? '1' })

watch(
  () => props.value,
  (v) => {
    if (v) state.charge = v
  }
)

const options: Array<{ label: string; value: ChargeValue }> = [
  { label: '已收费', value: '1' },
  { label: '未收费', value: '0' }
]

function onCancel() {
  visible.value = false
}

async function onConfirm() {
  const { message, isSuccess } = await editsysparametersingle({
    code: CodeName.DigitalImageNeedDefaultValue,
    value: String(state.charge)
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
  <ElDialog v-model="visible" title="采集或推送接收收费状态默认值配置" width="600px" append-to-body>
    <ElForm label-width="260px">
      <ElFormItem label="采集或推送接收收费状态默认值配置">
        <ElSelect v-model="state.charge" placeholder="请选择">
          <ElOption v-for="o in options" :key="o.value" :label="o.label" :value="o.value" />
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
