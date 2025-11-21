<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElInput,
  ElButton,
  ElMessage
} from 'element-plus'
import { CodeName, editsysparametersingle } from '@/api/authConf'

enum CStoreTypeEnum {
  CCommandSCP = 'CCommandSCP',
  JSRMYYCCommandSCP = 'JSRMYYCCommandSCP'
}
interface PacsConfig {
  IsQRServiceOpen: string
  QRServiceName: CStoreTypeEnum
  QRServicePort: string
  IsFilmCStoreSCPOpen: string
  FilmCStoreSCPPort: string
  IsImageCStoreSCPOpen: string
  ImageCStoreSCPPort: string
  IsGetDCMByOOSSCPOpen: string
  GetDCMByOOSSCPPort: string
  IsFilmCStoreByCMoveSCPOpen: string
  FilmCStoreByCMoveSCPPort: string
}

const props = defineProps<{ modelValue: boolean; model?: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: PacsConfig): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const form = reactive<PacsConfig>({
  IsQRServiceOpen: 'true',
  QRServiceName: CStoreTypeEnum.CCommandSCP,
  QRServicePort: '105',
  IsFilmCStoreSCPOpen: 'true',
  FilmCStoreSCPPort: '11112',
  IsImageCStoreSCPOpen: 'true',
  ImageCStoreSCPPort: '11113',
  IsGetDCMByOOSSCPOpen: 'true',
  GetDCMByOOSSCPPort: '11114',
  IsFilmCStoreByCMoveSCPOpen: 'true',
  FilmCStoreByCMoveSCPPort: '11115'
})

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    Object.assign(form, JSON.parse(props.model || ''))
  },
  { immediate: true, deep: true }
)

const boolOptions = [
  { label: '是', value: 'true' },
  { label: '否', value: 'false' }
]

const cstoreOptions: Array<{ label: string; value: CStoreTypeEnum }> = [
  { label: '常规实现类', value: CStoreTypeEnum.CCommandSCP },
  { label: '江苏瑞曼医院实现类', value: CStoreTypeEnum.JSRMYYCCommandSCP }
]

function onCancel() {
  visible.value = false
}

async function onConfirm() {
  const { isSuccess, message } = await editsysparametersingle({
    code: CodeName.QRConfig,
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
  <ElDialog v-model="visible" title="PACS相关功能配置" width="720px" append-to-body>
    <ElForm label-width="240px">
      <ElFormItem label="是否开启QR服务">
        <ElSelect v-model="form.IsQRServiceOpen" placeholder="请选择">
          <ElOption
            v-for="o in boolOptions"
            :key="'qr-' + o.value"
            :label="o.label"
            :value="o.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="CSTORE实现类" v-show="form.IsQRServiceOpen === 'true'">
        <ElSelect v-model="form.QRServiceName" placeholder="请选择">
          <ElOption v-for="o in cstoreOptions" :key="o.value" :label="o.label" :value="o.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="端口" v-show="form.IsQRServiceOpen === 'true'">
        <ElInput v-model="form.QRServicePort" placeholder="例如 105" />
      </ElFormItem>

      <ElFormItem label="是否开启胶片推送接收端">
        <ElSelect v-model="form.IsFilmCStoreSCPOpen" placeholder="请选择">
          <ElOption
            v-for="o in boolOptions"
            :key="'film-' + o.value"
            :label="o.label"
            :value="o.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="端口" v-show="form.IsFilmCStoreSCPOpen === 'true'">
        <ElInput v-model="form.FilmCStoreSCPPort" placeholder="例如 11112" />
      </ElFormItem>

      <ElFormItem label="是否开启影像推送接收端">
        <ElSelect v-model="form.IsImageCStoreSCPOpen" placeholder="请选择">
          <ElOption
            v-for="o in boolOptions"
            :key="'img-' + o.value"
            :label="o.label"
            :value="o.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="端口" v-show="form.IsImageCStoreSCPOpen === 'true'">
        <ElInput v-model="form.ImageCStoreSCPPort" placeholder="例如 11113" />
      </ElFormItem>

      <ElFormItem label="是否开启云端下载影像服务端">
        <ElSelect v-model="form.IsGetDCMByOOSSCPOpen" placeholder="请选择">
          <ElOption
            v-for="o in boolOptions"
            :key="'cloud-' + o.value"
            :label="o.label"
            :value="o.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="端口" v-show="form.IsGetDCMByOOSSCPOpen === 'true'">
        <ElInput v-model="form.GetDCMByOOSSCPPort" placeholder="例如 11114" />
      </ElFormItem>

      <ElFormItem label="是否开启胶片CMOVE的接收端服务">
        <ElSelect v-model="form.IsFilmCStoreByCMoveSCPOpen" placeholder="请选择">
          <ElOption
            v-for="o in boolOptions"
            :key="'cmv-' + o.value"
            :label="o.label"
            :value="o.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="端口" v-show="form.IsFilmCStoreByCMoveSCPOpen === 'true'">
        <ElInput v-model="form.FilmCStoreByCMoveSCPPort" placeholder="例如 11115" />
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
