<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElRadio,
  ElRadioGroup,
  ElMessage
} from 'element-plus'
import { addpreset, PresetModal, updateplugindefault } from '@/api/plugConf'

interface ServiceForm {
  dataSource: string // 数据库服务IP
  initialCatalog: string // 数据库名称
  hostPort: string // 数据库服务端口
  userId: string // 数据库连接用户名
  password: string // 数据库连接密码
  dbType: string // 数据库类型
  serviceUID: string // 上传服务UID
  mediaUID: string // 上传媒介UID
  userUID: string // 用户UID
  uploadURL?: string // 上传URL
  queryCondition?: string // 查询条件
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
const visibleName = ref(false)
const formModel = ref({
  name: '',
  defaultFlag: '1'
})
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const form = ref<ServiceForm>({
  dataSource: '',
  initialCatalog: '',
  hostPort: '',
  userId: '',
  password: '',
  dbType: '',
  serviceUID: '',
  mediaUID: '',
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
    let queryCondition: any = {}
    if (props.model?.queryCondition) {
      queryCondition = JSON.parse(props.model?.queryCondition || '')
    }
    form.value = {
      dataSource: queryCondition.dataSource || '',
      initialCatalog: queryCondition.initialCatalog || '',
      hostPort: queryCondition.hostPort || '',
      userId: queryCondition.userId || '',
      password: queryCondition.password || '',
      dbType: queryCondition.dbType || '',
      serviceUID: queryCondition.serviceUID || '',
      mediaUID: queryCondition.mediaUID || '',
      userUID: queryCondition.userUID || '',
      uploadURL: queryCondition.uploadURL || ''
    }
    formModel.value = {
      name: (props.model as any)?.name || '',
      defaultFlag: (props.model as any)?.defaultFlag || '1'
    }
  },
  { immediate: true }
)

const rules: Record<string, any> = {
  name: [{ required: true, message: '请输入模板名', trigger: 'blur' }],
  defaultFlag: [{ required: true, message: '请选择是否为默认模板', trigger: 'change' }]
}

function onConfirm() {
  console.log('formRef', formRef.value)
  formRef.value?.validate(async (ok) => {
    if (!ok) {
      console.log('验证失败')
      return
    }
    // 合并两个表单的数据
    await commitMsg()
    visible.value = false
    visibleName.value = false
    emit('save', form.value)
  })
}

const commitMsg = async () => {
  const submitData: PresetModal = {
    queryCondition: JSON.stringify(form.value),
    name: formModel.value.name,
    defaultFlag: formModel.value.defaultFlag,
    querySeq: (props.model as any)?.querySeq || '',
    queryType: 'plugin'
  }
  let data: any = {}
  if ((props.model as any)?.sortNO) {
    data = await updateplugindefault(submitData)
  } else {
    data = await addpreset(submitData)
  }
  if (data.isSuccess) {
    ElMessage.success(data.message || '保存成功')
    emit('save', form.value)
  } else {
    ElMessage.error(data.message || '保存失败')
  }
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
    <ElForm :model="form" label-width="140px">
      <ElFormItem prop="dataSource" label="数据库服务IP">
        <ElInput v-model="form.dataSource" placeholder="请输入数据库服务IP" />
      </ElFormItem>

      <ElFormItem prop="initialCatalog" label="数据库名称">
        <ElInput v-model="form.initialCatalog" placeholder="请输入数据库名称" />
      </ElFormItem>

      <ElFormItem prop="hostPort" label="数据库服务端口">
        <ElInput v-model="form.hostPort" placeholder="请输入端口号" />
      </ElFormItem>

      <ElFormItem prop="userId" label="数据库连接用户名">
        <input type="text" style="display: none" autocomplete="username" />
        <ElInput v-model="form.userId" placeholder="请输入用户名" />
      </ElFormItem>

      <ElFormItem prop="password" label="数据库连接密码">
        <input type="text" style="display: none" autocomplete="current-password" />
        <ElInput v-model="form.password" type="password" placeholder="请输入密码" show-password />
      </ElFormItem>

      <ElFormItem prop="dbType" label="数据库类型">
        <ElSelect v-model="form.dbType" placeholder="请选择" style="width: 100%">
          <ElOption
            v-for="opt in dbTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem prop="serviceUID" label="上传服务UID">
        <ElInput v-model="form.serviceUID" placeholder="请输入上传服务UID" />
      </ElFormItem>

      <ElFormItem prop="mediaUID" label="上传媒介UID">
        <ElInput v-model="form.mediaUID" placeholder="请输入上传媒介UID" />
      </ElFormItem>

      <ElFormItem prop="userUID" label="用户UID">
        <ElInput v-model="form.userUID" placeholder="请输入用户UID" />
      </ElFormItem>

      <ElFormItem prop="uploadURL" label="上传URL">
        <ElInput v-model="form.uploadURL" placeholder="请输入上传URL" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dlg-footer">
        <ElButton @click="onCancel">取消</ElButton>
        <ElButton type="primary" @click="visibleName = true">确定</ElButton>
      </div>
    </template>
  </ElDialog>
  <ElDialog title="模板名" v-model="visibleName" width="500px">
    <ElForm ref="formRef" :model="formModel" :rules="rules" label-width="140px">
      <ElFormItem prop="name" label="模板名" required>
        <ElInput v-model="formModel.name" placeholder="请输入模板名" />
      </ElFormItem>
      <ElFormItem prop="defaultFlag" label="是否为默认模板" required>
        <ElRadioGroup v-model="formModel.defaultFlag">
          <ElRadio value="1">是</ElRadio>
          <ElRadio value="0">否</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dlg-footer">
        <ElButton @click="visibleName = false">取消</ElButton>
        <ElButton type="primary" @click="onConfirm()">确定</ElButton>
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
