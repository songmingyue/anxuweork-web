<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElMessage
} from 'element-plus'
import { CodeName, editsysparametersingle, SettingValue } from '@/api/authConf'

interface ImageViewerConfig {
  ImageViewUrl: string
  IsEnable: string
  ImageViewUrlParameterByPACS: string
  ResultStatusCode?: string
  ServiceSectID?: string
}

const props = defineProps<{ modelValue: boolean; model?: SettingValue }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: ImageViewerConfig): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const form = reactive<ImageViewerConfig>({
  ImageViewUrl: '',
  IsEnable: 'false',
  ImageViewUrlParameterByPACS: '',
  ResultStatusCode: '',
  ServiceSectID: ''
})

watch(
  () => props.model,
  (v) => v && Object.assign(form, v.value ? JSON.parse(v.value) : {}),
  { immediate: true }
)

const boolOptions = [
  { label: '是', value: 'true' },
  { label: '否', value: 'false' }
]

function onCancel() {
  visible.value = false
}
async function onConfirm() {
  const { isSuccess, message } = await editsysparametersingle({
    code: CodeName.ImageViewConfig,
    value: JSON.stringify(form)
  })
  if (isSuccess) {
    ElMessage.success(message || '保存成功')
    visible.value = false
  } else {
    ElMessage.error(message || '保存失败')
    return
  }
  // emit('save', { ...form })
  // visible.value = false
}
</script>

<template>
  <ElDialog v-model="visible" title="影像浏览器读取配置" width="720px" append-to-body>
    <ElForm label-width="180px">
      <ElFormItem label="浏览器地址">
        <ElInput v-model="form.ImageViewUrl" placeholder="http://<host>:<port>/imageView" />
      </ElFormItem>
      <ElFormItem label="是否启用PACS浏览">
        <ElSelect v-model="form.IsEnable" placeholder="请选择">
          <ElOption
            v-for="o in boolOptions"
            :key="String(o.value)"
            :label="o.label"
            :value="o.value"
          />
        </ElSelect>
      </ElFormItem>
      <div v-show="form.IsEnable === 'true'">
        <ElFormItem label="检查状态">
          <ElInput v-model="form.ResultStatusCode" placeholder="http://<host>:<port>/imageView" />
        </ElFormItem>
        <ElFormItem label="检查类型">
          <ElInput v-model="form.ServiceSectID" placeholder="http://<host>:<port>/imageView" />
        </ElFormItem>
        <ElFormItem label="检查类型">
          <ElInput
            type="textarea"
            v-model="form.ImageViewUrlParameterByPACS"
            placeholder="http://<host>:<port>/imageView"
          />
        </ElFormItem>
      </div>
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
