<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import { Dialog } from '@/components/Dialog'
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useDesign } from '@/hooks/web/useDesign'
import { useUserStoreWithOut } from '@/store/modules/user'
import { ElMessage, ElTabs, ElTabPane } from 'element-plus'
import { changepwd, register } from '@/api/login'

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('lock-dialog')

const userStore = useUserStoreWithOut()

const props = defineProps({
  modelValue: {
    type: Boolean
  }
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => {
    console.log('set: ', val)
    emit('update:modelValue', val)
  }
})

const options = ref<any>([])
const activeTab = ref('profile')
const dialogTitle = ref('用户设置')

// 个人资料表单
const profileSchema = reactive<FormSchema[]>([
  {
    field: 'loginName',
    label: '用户名',
    component: 'Input',
    value: '',
    componentProps: { disabled: true, placeholder: '自动填充' }
  },
  {
    field: 'userName',
    label: '姓名',
    component: 'Input',
    value: '',
    componentProps: { placeholder: '请输入姓名' }
  },
  {
    field: 'workNO',
    label: '工号',
    component: 'Input',
    value: '',
    componentProps: { placeholder: '请输入工号' }
  },
  {
    field: 'officePhone',
    label: '办公电话',
    component: 'Input',
    value: '',
    componentProps: { placeholder: '请输入办公电话' }
  },
  {
    field: 'privatePhone',
    label: '个人电话',
    component: 'Input',
    value: '',
    componentProps: { placeholder: '请输入个人电话' }
  },
  {
    field: 'email',
    label: '电子邮件',
    component: 'Input',
    value: '',
    componentProps: { placeholder: '请输入邮箱' }
  },
  {
    field: 'deptID',
    label: '科室',
    component: 'Select',
    value: '',
    componentProps: {
      placeholder: '请选择',
      clearable: true,
      options: options
    }
  },
  {
    field: 'isCurrentPageOpen',
    label: '影像打开方式',
    component: 'RadioButton',
    value: 'newSingle',
    componentProps: {
      options: [
        { label: '内嵌', value: '1' },
        { label: '多屏幕', value: '2' },
        { label: '新页面单开', value: '3' },
        { label: '新页面多开', value: '0' }
      ]
    }
  }
])

// 密码修改表单
const passwordSchema = reactive<FormSchema[]>([
  {
    field: 'oldPassword',
    label: '旧密码',
    component: 'InputPassword',
    value: '',
    componentProps: { placeholder: '请输入旧密码', autocomplete: 'off' }
  },
  {
    field: 'newPassword',
    label: '新密码',
    component: 'InputPassword',
    value: '',
    componentProps: { placeholder: '至少8位，含大小写数字符号', autocomplete: 'new-password' }
  },
  {
    field: 'confirmPassword',
    label: '确认密码',
    component: 'InputPassword',
    value: '',
    componentProps: { placeholder: '再次输入新密码', autocomplete: 'new-password' }
  }
])

const complexityPattern = (v: string) =>
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$/.test(v)
const passwordSame = (_: any, v: string, cb: any) => {
  const formData = passwordFormMethods?.getFormData?.()
  if (formData && typeof (formData as any).then === 'function') return cb()
  const pwd = (formData as any)?.newPassword
  if (pwd && v !== pwd) return cb(new Error('两次密码不一致'))
  cb()
}

const profileRules = reactive({
  userName: [{ required: true, message: '请输入姓名', trigger: ['blur', 'change'] }],
  privatePhone: [
    { required: true, message: '请输入个人电话', trigger: ['blur', 'change'] },
    {
      validator: (_: any, v: string, cb: any) => {
        if (v && !/^1[3-9]\d{9}$/.test(v)) return cb(new Error('手机号格式不正确'))
        cb()
      },
      trigger: ['blur']
    }
  ],
  email: [
    { required: true, message: '请输入电子邮件', trigger: ['blur', 'change'] },
    {
      validator: (_: any, v: string, cb: any) => {
        if (v && !/.+@.+\..+/.test(v)) return cb(new Error('邮箱格式不正确'))
        cb()
      },
      trigger: ['blur']
    }
  ]
})
const passwordRules = reactive({
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: ['blur', 'change'] }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: ['blur', 'change'] },
    {
      validator: (_: any, v: string, cb: any) => {
        if (v && !complexityPattern(v))
          return cb(new Error('需包含大写、小写、数字和符号，长度8-32位'))
        cb()
      },
      trigger: ['blur', 'change']
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: ['blur', 'change'] },
    { validator: passwordSame, trigger: ['blur', 'change'] }
  ]
})

// 分别注册两个表单
const { formRegister: profileRegister, formMethods: profileFormMethods } = useForm()
const { formRegister: passwordRegister, formMethods: passwordFormMethods } = useForm()

const initProfile = () => {
  const info: any = userStore.getAccount || {}
  try {
    options.value = userStore.getAccount
    profileFormMethods.setValues?.({
      loginName: info.loginName || '',
      userName: info.userName || '',
      workNO: info.workNO || '',
      deptID: info.deptID || '',
      officePhone: info.officePhone || '',
      privatePhone: info.privatePhone || '',
      email: info.email || '',
      isCurrentPageOpen: info.isCurrentPageOpen
        ? (String(info.isCurrentPageOpen) as any)
        : 'newSingle'
    })
  } catch (e) {
    // ignore prefill errors
  }
}

watch(
  dialogVisible,
  (v) => {
    if (v) {
      initProfile()
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  if (activeTab.value === 'profile') {
    const datas: any = await profileFormMethods.getFormData<any>()
    const { isSuccess, message } = await register({
      account: datas.loginName,
      name: datas.userName,
      userName: datas.userName,
      email: datas.email,
      officePhone: datas.officePhone,
      deptID: datas.deptID,
      privatePhone: datas.privatePhone,
      isCurrentPageOpen: datas.isCurrentPageOpen
    })
    if (isSuccess) {
      ElMessage.success('个人资料更新成功')
      changepwd

      // userStore.setUserInfo([Object.assign(userStore.getUserInfoObj as any, datas)] as any)
      dialogVisible.value = false
    } else {
      ElMessage.error(message || '个人资料更新失败')
    }
  } else {
    const { oldPassword, newPassword, confirmPassword } =
      await passwordFormMethods.getFormData<any>()
    const { isSuccess, message } = await changepwd({
      oldPassword,
      newPassword,
      confirmPassword
    })
    if (isSuccess) {
      ElMessage.success('密码修改成功')
      dialogVisible.value = false
    } else {
      ElMessage.error(message || '密码修改失败')
    }
  }
}
</script>

<template>
  <Dialog v-model="dialogVisible" width="650px" :title="dialogTitle" :class="prefixCls">
    <div class="user-setting">
      <ElTabs v-model="activeTab">
        <ElTabPane label="个人资料" name="profile">
          <Form
            :is-col="false"
            :schema="profileSchema"
            :rules="profileRules"
            @register="profileRegister"
          />
        </ElTabPane>
        <ElTabPane label="密码修改" name="password">
          <Form
            :is-col="false"
            :schema="passwordSchema"
            :rules="passwordRules"
            @register="passwordRegister"
          />
        </ElTabPane>
      </ElTabs>
    </div>
    <template #footer>
      <BaseButton type="primary" @click="handleSubmit">确定</BaseButton>
      <BaseButton type="info" @click="dialogVisible = false">关闭</BaseButton>
    </template>
  </Dialog>
</template>

<style lang="less" scoped>
:global(.v-lock-dialog) {
  @media (width <= 767px) {
    max-width: calc(100vw - 16px);
  }
}
</style>
