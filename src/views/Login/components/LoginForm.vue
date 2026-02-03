<script setup lang="tsx">
import { reactive, ref, watch, onMounted } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { ElCheckbox } from 'element-plus'
import { useForm } from '@/hooks/web/useForm'
import { loginApi } from '@/api/login'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { OrganizationList, UserLoginTypes } from '@/api/login/types'
import { useValidator } from '@/hooks/web/useValidator'
import { useUserStore } from '@/store/modules/user'
import { BaseButton } from '@/components/Button'
import CryptoJS from 'crypto-js'
import { useAppStore } from '@/store/modules/app'
import iconHeader from '@/assets/imgs/login/icon_header.png'
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

const schema = reactive<FormSchema[]>([
  {
    field: 'icon',
    colProps: { span: 24 },
    formItemProps: {
      slots: {
        default: () => <img style="margin: auto; width: 60px" src={iconHeader} alt="集成平台" />
      }
    }
  },
  {
    field: 'title',
    colProps: { span: 24 },
    formItemProps: {
      slots: {
        default: () => (
          <h2 style="color:#666; margin: auto; font-size: 28px; letter-spacing: 4px">
            {appStore.title}
          </h2>
        )
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
            <div style="display: flex"></div>
          </>
        )
      }
    }
  }
])

const remember = ref(false)

// const initLoginInfo = () => {
//   const loginInfo = userStore.getLoginInfo
//   if (loginInfo) {
//     const { account, password } = loginInfo
//     setValues({ username: account, password })
//   }
// }
onMounted(() => {
  // initLoginInfo()
})

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose } = formMethods

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
          password: CryptoJS.MD5(formData.password).toString(),
          loginType: 1,
          account: formData.account || ''
        }
        const res = await loginApi(passwordEncrypted)
        console.log('登录返回的信息', res)
        appStore.setCollapse(true)
        if (res) {
          console.log('登录成功，设置用户信息', res)
          userStore.setLocalstorage(res)
          userStore.setUseMsg()
          const pushUrl = '/workstation'
          push(redirect.value || pushUrl)
        }
      } finally {
        loading.value = false
      }
    }
  })
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
  width: 432px;
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
