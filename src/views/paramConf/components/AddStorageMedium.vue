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
  ElMessage,
  ElSwitch
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
const form = reactive<CloudStorageConfig & Record<string, any>>({})

const typeOptions = [
  { label: '云存储', value: 'AmazonS3' },
  { label: '本地存储', value: 'Virtual' }
]

const isCloud = computed(() => form.type === 'AmazonS3')
const requiredWhen = (predicate: () => boolean, message: string) => ({
  validator: (_: any, val: any, cb: any) => {
    if (predicate() && (!val || String(val).trim() === '')) cb(new Error(message))
    else cb()
  },
  trigger: ['blur', 'change']
})

const rules: Record<string, any[]> = {
  mediaUID: [{ required: true, message: '请输入媒介UID', trigger: 'blur' }],
  mediaName: [{ required: true, message: '请输入媒质名称', trigger: 'blur' }],
  pathType: [{ required: true, message: '请选择路径类型', trigger: 'change' }],
  host: [requiredWhen(() => isCloud.value, '请输入主机域名')],

  mediaHost: [requiredWhen(() => isCloud.value, '请输入媒体主机地址')]
}

async function loadOrgOptions() {
  const userUID = userStore.getUserUID
  form.userUID = userUID || ''
  form.organizationID = props.orgOptions[0]?.value || ''
  form.type = typeOptions[0].value

  if (props.isEdit && props.formData) {
    form.host = ''
    form.accessID = ''
    form.accessKey = ''
    form.subDir = ''
    form.uploadMediaUID = ''
    form.uploadURL = ''
    form.downloadURL = ''
    Object.assign(form, props.formData)
    if (form.type === '文档存储') {
      form.type = 'Virtual'
    } else {
      form.type = typeOptions.find((it) => it.label === form.type)?.value || 'AmazonS3'
    }
  } else {
    // Object.assign(form, formStorageMedium)
    fetch('/config.json')
      .then((response) => response.text())
      .then((data) => {
        Object.assign(form, JSON.parse(data).formStorageMedium)
        form.organizationID = props.orgOptions[0]?.value || ''
        form.userUID = userUID || ''
      })
      .finally(() => {
        form.organizationID = props.orgOptions[0]?.value || ''
        form.userUID = userUID || ''
      })
  }
}

onMounted(loadOrgOptions)

function onConfirm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    const org = props.orgOptions.find((o) => o.value === form.organizationID)
    form.organizationName = org?.label || form.organizationName
    if (form.id) {
      const { isSuccess, message } = await storageEdit(form)
      if (isSuccess) {
        emit('confirm', { ...form })
        ElMessage.success(message || '操作成功')
      } else {
        ElMessage.error(message || '操作失败')
      }
    } else {
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
    class="user-new-dialog"
    width="720px"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="130px">
      <el-form-item v-if="isEdit" label="媒介UID" prop="mediaUID">
        <span>{{ form.mediaUID }}</span>
      </el-form-item>
      <el-form-item v-else label="媒介UID" prop="mediaUID">
        <el-input v-model="form.mediaUID" />
      </el-form-item>
      <el-form-item label="媒质名称" prop="mediaName" required>
        <el-input v-model="form.mediaName" />
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

      <el-form-item label="路径类型" prop="pathType" required>
        <el-select v-model="form.pathType" placeholder="请选择">
          <el-option
            v-for="opt in typeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="地址" prop="path" required>
        <el-input v-model="form.path" />
      </el-form-item>
      <el-form-item
        v-show="form.pathType === 'AmazonS3'"
        label="媒体主机地址"
        prop="mediaHost"
        :required="isCloud"
      >
        <el-input v-model="form.mediaHost" />
      </el-form-item>
      <el-form-item v-show="form.pathType === 'AmazonS3'" label="当前使用标志" prop="currentFlag">
        <el-switch v-model="form.currentFlag" active-value="true" inactive-value="false" />
        <!-- <el-input v-model="form.currentFlag" /> -->
      </el-form-item>
      <el-form-item v-show="form.pathType === 'AmazonS3'" label="访问ID" prop="accessId">
        <el-input v-model="form.accessId" />
      </el-form-item>
      <el-form-item v-show="form.pathType === 'AmazonS3'" label="访问密钥" prop="accessKey">
        <el-input v-model="form.accessKey" />
      </el-form-item>
      <el-form-item v-if="form.pathType === 'AmazonS3'" label="存储总容量" prop="storageSize">
        <el-input v-model="form.storageSize" />
      </el-form-item>
      <el-form-item v-if="form.pathType === 'AmazonS3'" label="是否直连访问" prop="isDirect">
        <el-switch v-model="form.isDirect" active-value="true" inactive-value="false" />
      </el-form-item>
      <el-form-item v-if="form.pathType === 'AmazonS3'" label="对象存储ID" prop="ossId">
        <el-input v-model="form.ossId" />
      </el-form-item>
      <el-form-item v-if="form.pathType === 'AmazonS3'" label="已使用容量" prop="usedSize">
        <el-input v-model="form.usedSize" />
      </el-form-item>

      <el-form-item label="备注" prop="memo">
        <el-input v-model="form.memo" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
