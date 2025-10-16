<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton } from 'element-plus'

interface ServiceForm {
  dbServiceIP: string // 数据库服务IP
  dbName: string // 数据库名称
  dbPort: string // 数据库服务端口
  dbUser: string // 数据库连接用户名
  dbPassword: string // 数据库连接密码
  dbType: string // 数据库类型
  uploadServiceUID: string // 上传服务UID
  uploadMediumUID: string // 上传媒介UID
  userUID: string // 用户UID
}

const props = defineProps<{
  modelValue: boolean
  title?: string
  model?: Partial<ServiceForm>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: ServiceForm): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const form = ref<ServiceForm>({
  dbServiceIP: '',
  dbName: '',
  dbPort: '',
  dbUser: '',
  dbPassword: '',
  dbType: '',
  uploadServiceUID: '',
  uploadMediumUID: '',
  userUID: ''
})

// 数据库类型选项
const dbTypeOptions = [
  { label: 'MySQL', value: 'MySQL' },
  { label: 'SQL Server', value: 'SQLServer' },
  { label: 'Oracle', value: 'Oracle' },
  { label: 'PostgreSQL', value: 'PostgreSQL' }
]

// 监听弹窗打开,初始化表单
watch(
  () => [props.modelValue, props.model],
  () => {
    if (!props.modelValue) return

    form.value = {
      dbServiceIP: props.model?.dbServiceIP || '',
      dbName: props.model?.dbName || '',
      dbPort: props.model?.dbPort || '',
      dbUser: props.model?.dbUser || '',
      dbPassword: props.model?.dbPassword || '',
      dbType: props.model?.dbType || '',
      uploadServiceUID: props.model?.uploadServiceUID || '',
      uploadMediumUID: props.model?.uploadMediumUID || '',
      userUID: props.model?.userUID || ''
    }
  },
  { immediate: true }
)

const rules: Record<string, any> = {
  dbServiceIP: [{ required: true, message: '请输入数据库服务IP', trigger: 'blur' }],
  dbName: [{ required: true, message: '请输入数据库名称', trigger: 'blur' }],
  dbPort: [{ required: true, message: '请输入数据库服务端口', trigger: 'blur' }],
  dbUser: [{ required: true, message: '请输入数据库连接用户名', trigger: 'blur' }],
  dbPassword: [{ required: true, message: '请输入数据库连接密码', trigger: 'blur' }],
  dbType: [{ required: true, message: '请选择数据库类型', trigger: 'change' }],
  uploadServiceUID: [{ required: true, message: '请输入上传服务UID', trigger: 'blur' }],
  uploadMediumUID: [{ required: true, message: '请输入上传媒介UID', trigger: 'blur' }],
  userUID: [{ required: true, message: '请输入用户UID', trigger: 'blur' }]
}

function onConfirm() {
  formRef.value?.validate((ok) => {
    if (!ok) return
    emit('save', { ...form.value })
    visible.value = false
  })
}

function onCancel() {
  visible.value = false
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="title || '新增通用模板'"
    width="600px"
    destroy-on-close
    append-to-body
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="140px">
      <ElFormItem prop="dbServiceIP" label="数据库服务IP" required>
        <ElInput v-model="form.dbServiceIP" placeholder="请输入数据库服务IP" />
      </ElFormItem>

      <ElFormItem prop="dbName" label="数据库名称" required>
        <ElInput v-model="form.dbName" placeholder="请输入数据库名称" />
      </ElFormItem>

      <ElFormItem prop="dbPort" label="数据库服务端口" required>
        <ElInput v-model="form.dbPort" placeholder="请输入端口号" />
      </ElFormItem>

      <ElFormItem prop="dbUser" label="数据库连接用户名" required>
        <ElInput v-model="form.dbUser" placeholder="请输入用户名" />
      </ElFormItem>

      <ElFormItem prop="dbPassword" label="数据库连接密码" required>
        <ElInput v-model="form.dbPassword" type="password" placeholder="请输入密码" show-password />
      </ElFormItem>

      <ElFormItem prop="dbType" label="数据库类型" required>
        <ElSelect v-model="form.dbType" placeholder="请选择" style="width: 100%">
          <ElOption
            v-for="opt in dbTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem prop="uploadServiceUID" label="上传服务UID" required>
        <ElInput v-model="form.uploadServiceUID" placeholder="请输入上传服务UID" />
      </ElFormItem>

      <ElFormItem prop="uploadMediumUID" label="上传媒介UID" required>
        <ElInput v-model="form.uploadMediumUID" placeholder="请输入上传媒介UID" />
      </ElFormItem>

      <ElFormItem prop="userUID" label="用户UID" required>
        <ElInput v-model="form.userUID" placeholder="请输入用户UID" />
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

<style scoped>
.dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
