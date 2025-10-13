<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { CloudStorageConfig } from '@/api/paramConf'
import { storageAdd, storageEdit } from '@/api/paramConf'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDialog,
  ElButton,
  ElMessage
} from 'element-plus'
import { useUserStoreWithOut } from '@/store/modules/user'
interface OrgOption {
  label: string
  value: string
}

const props = defineProps<{
  visible: boolean
  isEdit?: boolean
  formData?: Partial<CloudStorageConfig>
  orgOptions: OrgOption[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'confirm', payload: CloudStorageConfig): void
}>()

const innerVisible = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v)
})
const userStore = useUserStoreWithOut()
const formRef = ref<any>(null)
const form = reactive<CloudStorageConfig>({
  mediaUID: '',
  isSharePath: 'false',
  name: '测试',
  organizationID: '',
  path: '6f.eword.cn',
  type: '',
  host: 'https://oos-nm2.ctyunapi.cn',
  accessID: 'c765bcfaa4747085cdfd',
  accessKey: '8bca31315848f45315688928c4610e4da3feb6a5',
  bucket: '2',
  subDir: 'c765bcfaa4747085cdfd',
  userUID: '',
  uploadMediaUID: 'ebd020c9-8376-11e9-b514-fa163e13176a',
  uploadURL: 'https://101.91.206.249:8282/PutFileToOOS',
  downloadURL: 'https://101.91.206.249:8282/GetOOSFilesUrl',
  customConfig: '',
  ifEnable: 'true',
  description: '',
  httpPath: '',
  shareAddress: '',
  sharePassWord: '',
  shareUserName: '',
  organizationName: ''
})

const typeOptions = [
  { label: '云存储', value: 'AmazonS3' },
  { label: '本地存储', value: 'Virtual' }
]

const isCloud = computed(() => form.type === 'AmazonS3')
const isLocal = computed(() => form.type === 'Virtual')
const isShared = computed(() => isLocal.value && form.isSharePath === 'true')

const requiredWhen = (predicate: () => boolean, message: string) => ({
  validator: (_: any, val: any, cb: any) => {
    if (predicate() && (!val || String(val).trim() === '')) cb(new Error(message))
    else cb()
  },
  trigger: ['blur', 'change']
})

const rules: Record<string, any[]> = {
  name: [{ required: true, message: '请输入媒质名称', trigger: 'blur' }],
  organizationID: [{ required: true, message: '请选择机构', trigger: 'change' }],
  path: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  type: [{ required: true, message: '请选择路径类型', trigger: 'change' }],
  host: [requiredWhen(() => isCloud.value, '请输入主机域名')],
  accessID: [requiredWhen(() => isCloud.value, '请输入访问ID')],
  accessKey: [requiredWhen(() => isCloud.value, '请输入访问Key')],
  subDir: [requiredWhen(() => isCloud.value, '请输入子目录')],
  uploadURL: [requiredWhen(() => isCloud.value, '请输入上传URL')],
  downloadURL: [requiredWhen(() => isCloud.value, '请输入下载URL')],
  isSharePath: [requiredWhen(() => isLocal.value, '请选择是否共享路径')],
  shareAddress: [requiredWhen(() => isShared.value, '请输入共享路径')],
  shareUserName: [requiredWhen(() => isShared.value, '请输入共享路径用户名')],
  sharePassWord: [requiredWhen(() => isShared.value, '请输入共享路径密码')]
}

async function loadOrgOptions() {
  const userUID = userStore.getUserUID
  form.userUID = userUID || ''
  form.organizationID = props.orgOptions[0]?.value || ''
  form.type = typeOptions[0].value

  if (props.formData) {
    Object.assign(form, props.formData)
    form.type = typeOptions.find((it) => it.label === form.type)?.value || form.type
  }
}

onMounted(loadOrgOptions)

function onConfirm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    const org = props.orgOptions.find((o) => o.value === form.organizationID)
    form.organizationName = org?.label || form.organizationName
    if (form.mediaUID) {
      const { isSuccess, message } = await storageEdit(form)
      if (isSuccess) {
        emit('confirm', { ...form })
        ElMessage.success(message || '操作成功')
      } else {
        ElMessage.error(message || '操作失败')
      }
    } else {
      form.customConfig = JSON.stringify({
        Host: form.host,
        Bucket: form.bucket,
        AccessID: form.accessID,
        AccessKey: form.accessKey,
        SubDir: form.subDir,
        UserUID: form.userUID,
        MediaUID: form.mediaUID,
        UploadURL: form.uploadURL,
        DownloadURL: form.downloadURL
      })
      const { isSuccess, message } = await storageAdd(form)
      if (isSuccess) {
        emit('confirm', { ...form })
        ElMessage.success(message || '操作成功')
      } else {
        ElMessage.error(message || '操作失败')
      }
    }
  })
}

function onCancel() {
  innerVisible.value = false
}
</script>

<template>
  <el-dialog
    :title="(props.isEdit ? '编辑' : '新增') + '存储媒介'"
    v-model="innerVisible"
    width="720px"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="130px">
      <el-form-item label="媒质名称" prop="name" required>
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="机构名称" prop="organizationID" required>
        <el-select v-model="form.organizationID" placeholder="请选择">
          <el-option
            v-for="opt in orgOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="地址" prop="path" required>
        <el-input v-model="form.path" />
      </el-form-item>
      <el-form-item label="路径类型" prop="type" required>
        <el-select v-model="form.type" placeholder="请选择">
          <el-option
            v-for="opt in typeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="form.type === 'AmazonS3'" label="主机域名" prop="host" required>
        <el-input v-model="form.host" />
      </el-form-item>
      <el-form-item v-show="form.type === 'AmazonS3'" label="访问ID" prop="accessID" required>
        <el-input v-model="form.accessID" />
      </el-form-item>
      <el-form-item v-show="form.type === 'AmazonS3'" label="访问Key" prop="accessKey" required>
        <el-input v-model="form.accessKey" />
      </el-form-item>
      <el-form-item v-if="form.type === 'AmazonS3'" label="子目录" prop="subDir" required>
        <el-input v-model="form.subDir" />
      </el-form-item>
      <el-form-item label="用户UID" prop="userUID" required>
        <el-input v-model="form.userUID" />
      </el-form-item>
      <el-form-item label="上传媒介UID" prop="uploadMediaUID">
        <el-input v-model="form.uploadMediaUID" />
      </el-form-item>
      <el-form-item v-if="form.type === 'AmazonS3'" label="上传URL" prop="uploadURL" required>
        <el-input v-model="form.uploadURL" />
      </el-form-item>
      <el-form-item v-if="form.type === 'AmazonS3'" label="下载URL" prop="downloadURL">
        <el-input v-model="form.downloadURL" />
      </el-form-item>
      <el-form-item v-if="form.type === 'Virtual'" label="是否共享路径" prop="isSharePath" required>
        <el-select v-model="form.isSharePath" placeholder="请选择">
          <el-option label="是" value="true" />
          <el-option label="否" value="false" />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="form.type === 'Virtual' && form.isSharePath === 'true'"
        label="共享路径"
        required
        prop="shareAddress"
      >
        <el-input v-model="form.shareAddress" />
      </el-form-item>
      <el-form-item
        v-if="form.type === 'Virtual' && form.isSharePath === 'true'"
        label="共享路径用户名"
        required
        prop="shareUserName"
      >
        <el-input v-model="form.shareUserName" />
      </el-form-item>
      <el-form-item
        v-if="form.type === 'Virtual' && form.isSharePath === 'true'"
        label="共享路径密码"
        required
        prop="sharePassWord"
      >
        <el-input v-model="form.sharePassWord" />
      </el-form-item>
      <el-form-item label="网络路径" v-if="form.type === 'Virtual'" prop="httpPath">
        <el-input v-model="form.httpPath" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
