<script setup lang="tsx">
import { reactive, ref, watch, onMounted, unref } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { ElCheckbox, ElButton } from 'element-plus'
import { useForm } from '@/hooks/web/useForm'
import { loginApi } from '@/api/login'
import { underlineToHump } from '@/utils'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { OrganizationList, UserLoginTypes } from '@/api/login/types'
import { useValidator } from '@/hooks/web/useValidator'
import { useUserStore } from '@/store/modules/user'
import { BaseButton } from '@/components/Button'
import { encryptWithPublicKey } from '@/utils/encrypt'
import { getLoginKey } from '@/api/common'
import { useAppStore } from '@/store/modules/app'
const publicKey = ref('')
const { required } = useValidator()

const emit = defineEmits(['to-register'])
const props = defineProps<{
  organizationList: OrganizationList[]
}>()

console.log('传入的机构列表', props.organizationList)

const userStore = useUserStore()
const appStore = useAppStore()
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
        default: () => <h2 style="color:#666">登录</h2>
      }
    }
  },
  {
    field: 'organizationID',
    label: '',
    component: 'Select',
    colProps: { span: 24 },
    componentProps: {
      autocomplete: 'off',
      style: { width: '100%', zIndex: 11 },
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
    label: '',
    component: 'Input',
    colProps: { span: 24 },
    componentProps: {
      style: { zIndex: 11 },
      placeholder: '请输入用户名',
      autocomplete: 'username'
    }
  },
  {
    field: 'password',
    label: '',
    component: 'InputPassword',
    colProps: { span: 24 },
    componentProps: {
      style: { width: '100%', zIndex: 11 },
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
              style="width: 100%; z-index: 11"
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
        appStore.setCollapse(true)
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
  <div class="forms-box">
    <Form
      :schema="schema"
      :rules="rules"
      label-position="top"
      hide-required-asterisk
      size="large"
      class="themed-border"
      @register="formRegister"
    />
    <div>
      <img
        style="position: absolute; top: 93px; left: 431px; z-index: 10; height: 314px"
        src="@/assets/imgs/logo.png
                    "
      />
      <h3 class="login-img">{{ underlineToHump(appStore.getTitle) }}</h3>
    </div>
  </div>
</template>

<style scoped>
.form-title {
  width: 100%;
  font-size: var(--el-font-size-extra-large);
  font-weight: 600;
  color: #666;

  /* color: var(--el-text-color-primary); */
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
  width: 393px;
  height: 448px;
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

.forms-box {
  position: relative;
  display: flex;
  width: 776px;
  flex-direction: row;
  align-items: center;
}

.login-img {
  position: absolute;
  top: 26px;
  right: 30px;
  color: #666;
}
</style>
