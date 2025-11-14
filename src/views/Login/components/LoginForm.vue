<script setup lang="tsx">
import { reactive, ref, watch, onMounted, unref } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { ElCheckbox, ElButton } from 'element-plus'
import { useForm } from '@/hooks/web/useForm'
import { loginApi } from '@/api/login'
import { useAppStore } from '@/store/modules/app'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { OrganizationList, UserLoginTypes } from '@/api/login/types'
import { useValidator } from '@/hooks/web/useValidator'
import { useUserStore } from '@/store/modules/user'
import { BaseButton } from '@/components/Button'
import { encryptWithPublicKey } from '@/utils/encrypt'
import { getLoginKey } from '@/api/common'
import { underlineToHump } from '@/utils'
const publicKey = ref('')
const { required } = useValidator()

const emit = defineEmits(['to-register'])
const props = defineProps<{
  organizationList: OrganizationList[]
}>()

console.log('传入的机构列表', props.organizationList)
const appStore = useAppStore()

const userStore = useUserStore()

const { currentRoute, push } = useRouter()

const rules = {
  username: [required()],
  password: [required()]
}
const getLoginKeyMsd = async () => {
  publicKey.value = await getLoginKey()
  console.log('获取的公钥', publicKey.value)
}

const schema = reactive<FormSchema[]>([
  {
    field: 'title',
    colProps: { span: 24 },
    formItemProps: {
      slots: {
        default: () => <h2 class="form-title">{underlineToHump(appStore.getTitle)}登录</h2>
      }
    }
  },
  {
    field: 'organizationID',
    label: '机构',
    component: 'Select',
    colProps: { span: 24 },
    componentProps: {
      autocomplete: 'off',
      style: { width: '100%' },
      placeholder: '请选择机构',
      options: props.organizationList.map((org) => ({
        label: org.label,
        value: org.value
      })),

      clearable: true,
      onChange: (value: string) => {
        console.log('选择的机构ID:', value)
      }
    }
  },
  {
    field: 'account',
    label: '用户名',
    component: 'Input',
    colProps: { span: 24 },
    componentProps: {
      placeholder: '请输入用户名',
      autocomplete: 'username'
    }
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    colProps: { span: 24 },
    componentProps: {
      style: { width: '100%' },
      placeholder: '请输入密码',
      autocomplete: 'off',
      onKeydown: (_e: any) => {
        if (_e.key === 'Enter') {
          _e.stopPropagation()
          signIn()
        }
      }
    }
  },
  {
    field: 'tool',
    colProps: { span: 24 },
    formItemProps: {
      slots: {
        default: () => (
          <div class="tool-row">
            <ElCheckbox v-model={remember.value} label="记住我" size="small" />
          </div>
        )
      }
    }
  },
  {
    field: 'login',
    colProps: { span: 24 },
    formItemProps: {
      slots: {
        default: () => (
          <>
            <BaseButton
              style="width: 100%"
              loading={loading.value}
              type="primary"
              class="full-width"
              onClick={signIn}
            >
              登录
            </BaseButton>
            <div style="display: flex">
              <span class="register">还没有账号？</span>
              <ElButton link onClick={toRegister} type="primary">
                去注册
              </ElButton>
            </div>
          </>
        )
      }
    }
  }
])

const remember = ref(userStore.getRememberMe)

const initLoginInfo = () => {
  const loginInfo = userStore.getLoginInfo
  if (loginInfo) {
    const { account, password, organizationID } = loginInfo
    setValues({ username: account, password, organizationID })
  }
}
onMounted(() => {
  initLoginInfo()
  getLoginKeyMsd()
})

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose, setValues } = formMethods

const loading = ref(false)

const redirect = ref<string>('')

watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)
// 登录
const signIn = async () => {
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      loading.value = true
      const formData = await getFormData<UserLoginTypes>()

      try {
        const passwordEncrypted: UserLoginTypes = {
          password: encryptWithPublicKey(formData.password || '', unref(publicKey)) || '',
          account: encryptWithPublicKey(formData.account || '', unref(publicKey)) || '',
          organizationID:
            encryptWithPublicKey(formData.organizationID || '', unref(publicKey)) || '',
          rememberMe: encryptWithPublicKey('', unref(publicKey)) || ''
        }
        const res = await loginApi(passwordEncrypted)
        console.log('登录返回的信息', res)
        if (res) {
          // 是否记住我
          if (unref(remember)) {
            userStore.setLoginInfo({
              account: formData.account,
              password: formData.password,
              organizationID: formData.organizationID
            })
          } else {
            userStore.setLoginInfo(undefined)
          }
          userStore.setRememberMe(unref(remember))
          userStore.setUserInfo(res.data)
          userStore.setToken(res.pageBase?.token || '')
          let pushUrl = '/userManage'
          if (res.data[0].viewParts[0].children.length > 0) {
            pushUrl = res.data[0].viewParts[0].children[0].url
          } else {
            pushUrl = res.data[0].viewParts[0].url
          }
          push({ path: pushUrl })
        }
      } finally {
        loading.value = false
      }
    }
  })
}

// 去注册页面
const toRegister = () => {
  emit('to-register')
}
</script>

<template>
  <Form
    :schema="schema"
    :rules="rules"
    label-position="top"
    hide-required-asterisk
    size="large"
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

.tool-row {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.full-width {
  width: 100%;
}

.mt-15 {
  margin-top: 15px;
}

.themed-border {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
}

.register {
  margin-left: 15px;
}

.register-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
</style>
