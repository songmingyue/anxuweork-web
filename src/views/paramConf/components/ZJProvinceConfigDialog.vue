<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { CodeName, editsysparametersingle } from '@/api/authConf'

interface SystemConfig {
  /** 图像应用配置 */
  ImageAppInfo: ImageAppInfo
  /** 对象存储配置 */
  StorageInfo: StorageInfo
  /** 文件路径配置 */
  filePath: string
  /** 互联互通数据同步配置描述 */
  InterconnectDataConfig: string
  /** 省级平台服务注册地址 */
  RegisterServiceAddress: string
  /** 市级平台服务地址（绍兴市特定） */
  ProvinceAddress: string
  /** 本地文件存储目录路径 */
  LocalFileDirecotry: string
}
interface ImageAppInfo {
  /** 平台服务地址（URL格式） */
  Url: string
  /** 平台应用唯一标识符 */
  AppId: string
  /** 平台公钥，用于加密通信 */
  PublicKey: string
}

interface StorageInfo {
  /** 对象存储服务类型（如AWS S3、MinIO等） */
  S3Type: string
  /** 对象存储服务器地址 */
  S3Server: string
  /** 对象存储访问身份标识 */
  KeyID: string
  /** 对象存储访问密钥 */
  KeySecret: string
  /** 对象存储桶名称 */
  BucketName: string
}
const props = defineProps<{ modelValue: boolean; model?: Partial<SystemConfig> }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: SystemConfig): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const form = reactive<SystemConfig>({
  ImageAppInfo: {
    Url: '',
    AppId: '',
    PublicKey: ''
  },
  StorageInfo: {
    S3Type: '',
    S3Server: '',
    KeyID: '',
    KeySecret: '',
    BucketName: ''
  },
  filePath: '',
  InterconnectDataConfig: '',
  RegisterServiceAddress: '',
  ProvinceAddress: '',
  LocalFileDirecotry: ''
})
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
    code: CodeName.ProvinceSXConfig,
    value: JSON.stringify(form)
  })

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
  <ElDialog v-model="visible" title="浙江省平台相关配置" width="820px" append-to-body>
    <ElForm label-width="230px">
      <ElFormItem label="绍兴互联网通道数据同步配置">
        <ElInput v-model="form.InterconnectDataConfig" placeholder="" />
      </ElFormItem>
      <ElFormItem label="浙江省平台注册地址">
        <ElInput v-model="form.RegisterServiceAddress" placeholder="" />
      </ElFormItem>
      <ElFormItem label="绍兴市平台注册地址">
        <ElInput v-model="form.ProvinceAddress" placeholder="http://192.168.1.88:8108/" />
      </ElFormItem>

      <div class="section-title">省质平台基础信息</div>
      <ElFormItem label="平台地址">
        <ElInput v-model="form.ImageAppInfo.Url" placeholder="" />
      </ElFormItem>
      <ElFormItem label="平台公钥">
        <ElInput v-model="form.ImageAppInfo.PublicKey" placeholder="" />
      </ElFormItem>
      <ElFormItem label="平台appid">
        <ElInput v-model="form.ImageAppInfo.AppId" placeholder="" />
      </ElFormItem>

      <div class="section-title">省质量平台基础信息</div>
      <ElFormItem label="对象存储类型">
        <ElInput v-model="form.StorageInfo.S3Type" placeholder="" />
      </ElFormItem>
      <ElFormItem label="对象存储地址">
        <ElInput v-model="form.StorageInfo.S3Server" placeholder="" />
      </ElFormItem>
      <ElFormItem label="对象存储访问ID">
        <ElInput v-model="form.StorageInfo.KeyID" placeholder="" />
      </ElFormItem>
      <ElFormItem label="对象存储访问密码">
        <ElInput v-model="form.StorageInfo.KeySecret" placeholder="" />
      </ElFormItem>
      <ElFormItem label="对象存储桶名">
        <ElInput v-model="form.StorageInfo.BucketName" placeholder="" />
      </ElFormItem>

      <div class="section-title">省质量平台存储信息</div>
      <ElFormItem label="本地文件路径">
        <ElInput v-model="form.LocalFileDirecotry" placeholder="" />
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
.section-title {
  position: relative;
  padding-left: 12px;
  margin: 14px 0 10px;
  color: #20a0ff;
}

.section-title::after {
  display: block;
  margin-top: 6px;
  border-bottom: 2px dotted #20a0ff;
  content: '';
}

.dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
