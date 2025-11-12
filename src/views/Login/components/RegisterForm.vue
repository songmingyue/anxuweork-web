<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { reactive, ref } from 'vue'
import { useForm } from '@/hooks/web/useForm'
import { FormRules, ElMessage, ElButton } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { register } from '@/api/login'

const emit = defineEmits(['to-login'])
const org = JSON.parse(localStorage.getItem('org') || '{}')
const orgList = org.value
const { formRegister, formMethods } = useForm()
const { getElFormExpose } = formMethods

// 这里不再使用验证码/同意协议，保持界面简洁与需求一致

// 机构与科室选项
const deptOptions = ref<{ label: string; value: string }[]>([])

const schema = reactive<FormSchema[]>([
  {
    field: 'title',
    colProps: { span: 24 },
    formItemProps: {
      slots: {
        default: () => <h2 class="form-title">注册账号</h2>
      }
    }
  },
  {
    field: 'account',
    label: '用户名',
    value: '',
    component: 'Input',
    colProps: { span: 24 },
    componentProps: {
      placeholder: '请输入用户名',
      // 禁用浏览器自动填充
      autocomplete: 'off'
    }
  },
  {
    field: 'password',
    label: '密码强度',
    value: '',
    component: 'RadioButton',
    colProps: { span: 24 },
    componentProps: {
      style: { width: '100%' },
      options: [
        { label: '弱', value: 'weak' },
        { label: '中', value: 'medium' },
        { label: '强', value: 'strong' }
      ],
      disabled: true,
      strength: true,
      placeholder: '请输入密码',
      // 禁用浏览器自动填充
      autocomplete: 'new-password'
    }
  },
  {
    field: 'password',
    label: '密码',
    value: '',
    component: 'InputPassword',
    colProps: { span: 24 },
    componentProps: {
      style: { width: '100%' },
      strength: true,
      placeholder: '请输入密码',
      // 禁用浏览器自动填充
      autocomplete: 'new-password'
    }
  },
  {
    field: 'check_password',
    label: '确认密码',
    value: '',
    component: 'InputPassword',
    colProps: { span: 24 },
    componentProps: {
      style: { width: '100%' },
      strength: true,
      placeholder: '请再次输入密码',
      autocomplete: 'new-password'
    }
  },
  {
    field: 'name',
    label: '姓名',
    value: '',
    component: 'Input',
    colProps: { span: 24 },
    componentProps: { placeholder: '请输入姓名' }
  },
  {
    field: 'workNO',
    label: '工号',
    value: '',
    component: 'Input',
    colProps: { span: 24 },
    componentProps: { placeholder: '请输入工号' }
  },
  {
    field: 'officePhone',
    label: '办公电话',
    value: '',
    component: 'Input',
    colProps: { span: 24 },
    componentProps: { placeholder: '请输入办公电话' }
  },
  {
    field: 'privatePhone',
    label: '个人电话',
    value: '',
    component: 'Input',
    colProps: { span: 24 },
    componentProps: { placeholder: '请输入个人电话' }
  },
  {
    field: 'email',
    label: '电子邮件',
    value: '',
    component: 'Input',
    colProps: { span: 24 },
    componentProps: { placeholder: '请输入邮箱' }
  },
  {
    field: 'organizationID',
    label: '机构',
    component: 'Select',
    colProps: { span: 24 },
    componentProps: {
      style: { width: '100%' },
      placeholder: '请选择机构',
      options: orgList,
      filterable: true,
      clearable: true,
      onChange: async (val: string) => {
        const selectsOrg = orgList.find((ite) => ite.value === val)
        // 兼容后端不同字段命名：DeptMstDto / departments / deptList
        deptOptions.value = selectsOrg?.DeptMstDto
        // 重置已选科室
        try {
          ;(formMethods as any)?.setValues?.({ deptID: '' })
        } catch (e) {
          // 忽略重置科室失败，不影响后续 options 更新
        }
        // 强制触发 schema 中科室下拉的 options 更新（如果 Form 内部未深度追踪引用）
        const deptField = schema.find((f) => f.field === 'deptID')
        if (deptField) {
          deptField.componentProps = {
            ...(deptField.componentProps || {}),
            options: [...deptOptions.value]
          }
        }
      }
    }
  },
  {
    field: 'deptID',
    label: '科室',
    component: 'Select',
    colProps: { span: 24 },
    componentProps: {
      style: { width: '100%' },
      placeholder: '请选择科室',
      options: deptOptions.value,
      filterable: true,
      clearable: true
    }
  },

  {
    field: 'register',
    colProps: { span: 24 },
    formItemProps: {
      slots: {
        default: () => (
          <>
            <div class="full-width">
              <BaseButton
                type="primary"
                class="full-width"
                loading={loading.value}
                onClick={loginRegister}
              >
                注册
              </BaseButton>
            </div>
            <div class="full-width" style="margin-left: 15px">
              <ElButton onClick={toLogin}>已有账号？去登录</ElButton>
              {/* <BaseButton class="full-width" color="#333" type="primary" onClick={toLogin}>
                已有账号？去登录
              </BaseButton> */}
            </div>
          </>
        )
      }
    }
  }
])

const passwordSame = (_: any, value: string, cb: any) => {
  // 使用 then 回调避免返回 Promise，满足 Element Plus 同步校验签名
  formMethods
    .getFormData<any>()
    .then((forms) => {
      if (value !== forms.password) {
        cb(new Error('两次密码不一致'))
      } else {
        cb()
      }
    })
    .catch(() => cb(new Error('校验失败')))
}

const emailPattern = (value: string) => /.+@.+\..+/.test(value)
const mobilePattern = (value: string) => /^1[3-9]\d{9}$/.test(value)
const accountPattern = (value: string) => /^[A-Za-z0-9_\-]{4,20}$/.test(value)
const passwordPattern = (value: string) => /^.{6,32}$/.test(value)

const rules: FormRules = {
  account: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'change'] },
    {
      validator: (_: any, v: string, cb: any) => {
        if (v && !accountPattern(v)) return cb(new Error('用户名需为4-20位字母/数字/下划线'))
        cb()
      },
      trigger: ['blur']
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['blur', 'change'] },
    {
      validator: (_: any, v: string, cb: any) => {
        if (v && !passwordPattern(v)) return cb(new Error('密码长度需为6-32位'))
        cb()
      },
      trigger: ['blur']
    }
  ],
  check_password: [
    { required: true, message: '请再次输入密码', trigger: ['blur', 'change'] },
    { validator: passwordSame, trigger: ['blur', 'change'] }
  ],
  name: [{ required: true, message: '请输入姓名', trigger: ['blur', 'change'] }],
  workNO: [{ required: true, message: '请输入工号', trigger: ['blur', 'change'] }],
  privatePhone: [
    { required: true, message: '请输入个人电话', trigger: ['blur', 'change'] },
    {
      validator: (_: any, v: string, cb: any) => {
        if (v && !mobilePattern(v)) return cb(new Error('请输入有效的11位手机号'))
        cb()
      },
      trigger: ['blur']
    }
  ],
  email: [
    {
      validator: (_: any, v: string, cb: any) => {
        if (v && !emailPattern(v)) return cb(new Error('邮箱格式不正确'))
        cb()
      },
      trigger: ['blur']
    }
  ],
  organizationID: [{ required: true, message: '请选择机构', trigger: ['blur', 'change'] }]
}

const toLogin = () => {
  emit('to-login')
}

const loading = ref(false)

const loginRegister = async () => {
  const formRef = await getElFormExpose()
  formRef?.validate(async (valid) => {
    if (!valid) return
    try {
      loading.value = true
      const formData = await formMethods.getFormData<any>()
      // 组装后端需要的用户对象（缺少的字段使用默认值）
      const payload: any = {
        account: formData.account,
        name: formData.name,
        organizationID: formData.organizationID,
        status: true,
        workNO: formData.workNO,
        officePhone: formData.officePhone,
        privatePhone: formData.privatePhone,
        email: formData.email,
        deptID: formData.deptID,
        password: formData.password // 如果后端暂不接收会被忽略
      }
      try {
        await register(payload)
        ElMessage.success('注册成功，请登录')
        toLogin()
      } catch (e: any) {
        ElMessage.error(e?.message || '注册失败')
      }
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <Form
    :schema="schema"
    :rules="rules"
    hide-required-asterisk
    size="default"
    class="themed-border"
    @register="formRegister"
  />
</template>

<style scoped>
.form-title {
  width: 100%;
  font-size: var(--el-font-size-extra-large);
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-align: center;
}

.code-row {
  display: flex;
  width: 100%;
  align-items: center;
}

.ml-10 {
  margin-left: 10px;
}

.full-width {
  width: 100%;
}

.mt-15 {
  margin-top: 15px;
}

.themed-border {
  /* 使用 Element Plus 变量以跟随主题变化 */
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
}
</style>
