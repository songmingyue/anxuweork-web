<script setup lang="tsx">
import { reactive, ref, watch, onMounted, unref } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { ElCheckbox } from 'element-plus'
import { useForm } from '@/hooks/web/useForm'
import { loginApi, getTestRoleApi, getAdminRoleApi } from '@/api/login'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
import { UserLoginTypes, UserType } from '@/api/login/types'
import { useValidator } from '@/hooks/web/useValidator'
import { useUserStore } from '@/store/modules/user'
import { BaseButton } from '@/components/Button'
import { encryptWithPublicKey } from '@/utils/encrypt'
import { getLoginKey } from '@/api/common'
const publicKey = ref('')
const { required } = useValidator()

const emit = defineEmits(['to-register'])

const appStore = useAppStore()

const userStore = useUserStore()

const permissionStore = usePermissionStore()

const { currentRoute, addRoute, push } = useRouter()

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
        default: () => <h2 class="text-2xl font-bold text-center w-[100%]">登录</h2>
      }
    }
  },
  {
    field: 'organizationID',
    label: '机构',
    component: 'Select',
    colProps: { span: 24 },
    componentProps: {
      style: { width: '100%' },
      placeholder: '请选择机构',
      options: [{ label: '机构一', value: '-1' }],
      filterable: true,
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
      placeholder: '请输入用户名'
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
          <div class="flex justify-between items-center w-[100%]">
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
            <div class="w-[100%]">
              <BaseButton loading={loading.value} type="primary" class="w-[100%]" onClick={signIn}>
                登录
              </BaseButton>
            </div>
            <div class="w-[100%] mt-15px">
              <BaseButton class="w-[100%]" onClick={toRegister}>
                注册
              </BaseButton>
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
          // 是否使用动态路由
          if (appStore.getDynamicRouter) {
            getRole(res.data.viewParts)
          }
        }
      } finally {
        loading.value = false
      }
    }
  })
}

// 获取角色信息
const getRole = async (menuList: MenuList[]) => {
  const formData = await getFormData<UserType>()
  const params = {
    roleName: formData.username
  }
  const res =
    appStore.getDynamicRouter && appStore.getServerDynamicRouter
      ? await getAdminRoleApi(params)
      : await getTestRoleApi(params)
  if (res) {
    userStore.setRoleRouters(menuList)
    await permissionStore.generateRoutes(menuList).catch(() => {})
    permissionStore.getAddRouters.forEach((route) => {
      addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
    })
    permissionStore.setIsAddRouters(true)
    push({ path: redirect.value || permissionStore.addRouters[0].path })
  }
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
    class="dark:(border-1 border-[var(--el-border-color)] border-solid)"
    @register="formRegister"
  />
</template>
