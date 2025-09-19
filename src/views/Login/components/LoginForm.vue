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
import { UserType } from '@/api/login/types'
import { useValidator } from '@/hooks/web/useValidator'
import { useUserStore } from '@/store/modules/user'
import { BaseButton } from '@/components/Button'
import { decryptWithPrivateKey } from '@/utils/encrypt'

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
      options: [
        { label: '机构一', value: '123456789' },
        { label: '机构二', value: 'org2' },
        { label: '机构三', value: 'org3' }
      ],
      filterable: true,
      clearable: true,
      onChange: (value: string) => {
        console.log('选择的机构ID:', value)
      }
    }
  },
  {
    field: 'username',
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
    const { username, password } = loginInfo
    setValues({ username, password })
  }
}
onMounted(() => {
  initLoginInfo()
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
  const aa =
    '¬NobLtLvubJhK8h+KsD+14QXKFJo6o5OgayGeqOXOtL/QjMZw5bCdefVP8Ge+cC5mzsGqdFJ3nMJiEbXT87rBUEgP8r0jZ2zTprJMqSK0JJSVheqJNCeO/hyq7Uedr0kg9spW5dXnl2P2Y3H+kCq/+0c6YBWjz3Pf/A93HKnQ0bg=¬kaqwekiD5AOJhAWr/vmQkfLapBxsP0k/rGeq9eGddAdXTIB35tz6C6IIR0U4wThkT9/eSqxFEADAlzdy498yG3BxxPM265tm+Isrf2psEHl/XIw87ZBgFbbyLHuVvX5WEPWtwIU7fZIn8mt+dzWWQMNwD1THCKymbR+tlaWO1Bs=¬QjIrk0QXEbFMrz5sQfxeGjcsQPXNuxL/ELVy44SIhoA6EvKZGQqGHO0ASlpOl+Eo1JtYw0T2H/fUk+GgHLtLFVnX7O2F7Z4GKlkAFrjvFj7XyafyK2i3Ti5P4AkARgnyObKQ8XEfqzEAqXaxT6BwqqFTCElzN/EjWoKoSnhJUyk="¬O/LsqZXMirChxTa+76p2zBWjJV1sbW3V9eCEjQwM9GyVIquN1ouPcsu9ztFjDcI5O7uh/9aytJ1XSIxZHnM9KMp4tIAQ4xhYPFfRwoeMPGaNHq3tOrHrztcvHnGpqehWlt7jToYI3f5XZHh0Hy7QtN/1kg8eT/rB5X7hhm6DoOc='
  const bb = decryptWithPrivateKey(aa)
  console.log(bb, '========')
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      loading.value = true
      const formData = await getFormData<UserType>()

      try {
        const res = await loginApi(formData)

        if (res) {
          // 是否记住我
          if (unref(remember)) {
            userStore.setLoginInfo({
              username: formData.username,
              password: formData.password
            })
          } else {
            userStore.setLoginInfo(undefined)
          }
          userStore.setRememberMe(unref(remember))
          userStore.setUserInfo(res.data)
          // 是否使用动态路由
          if (appStore.getDynamicRouter) {
            getRole(res.data.menuList)
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
