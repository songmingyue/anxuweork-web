<script setup lang="ts">
import { LoginForm, RegisterForm } from './components'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { LocaleDropdown } from '@/components/LocaleDropdown'
import { underlineToHump } from '@/utils'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
import { onMounted, ref, unref } from 'vue'
import { ElScrollbar } from 'element-plus'
import { getOrganization } from '@/api/login'
import { getVersion } from '@/api/common'
import { OrganizationList } from '@/api/login/types'
import { useStorage } from '@/hooks/web/useStorage'
const { setStorage } = useStorage('localStorage')
const { getPrefixCls } = useDesign()
const version = ref('')
const prefixCls = getPrefixCls('login')
const organizationList = ref<OrganizationList[]>([])
const appStore = useAppStore()
const isLogin = ref(true)
// 读取环境变量中的公司名称
const companyName = (import.meta as any).env?.VITE_APP_COMPANY_NAME || ''
const eword = (import.meta as any).env?.VITE_APP_COMPANY_EN_NAME || ''

const toRegister = () => {
  isLogin.value = false
}
const toLogin = () => {
  isLogin.value = true
}

const getVersionMsd = async () => {
  const data = await getVersion()
  version.value = data
  localStorage.setItem('version', data)
}

const getorgbylogin = async () => {
  const { data } = await getOrganization()
  organizationList.value = data || []
  const orgList = unref(organizationList).filter((item) => item.value !== '-1')
  setStorage('org', orgList)
}
onMounted(() => {
  getVersionMsd()
  getorgbylogin()
})
</script>

<template>
  <div :class="prefixCls" class="login-root">
    <ElScrollbar class="scroll">
      <div class="wrapper">
        <div :class="`${prefixCls}__left left-pane`">
          <div class="brand">
            <!-- <img src="@/assets/imgs/logo.svg" alt="" class="logo" /> -->
            <span class="brand-title">{{ underlineToHump(appStore.getTitle) }}</span>
          </div>
          <div class="left-inner">
            <TransitionGroup
              appear
              tag="div"
              enter-active-class="animate__animated animate__bounceInLeft"
            >
              <img src="@/assets/svgs/login-box-bg.png" key="1" alt="" class="big-illustration" />
            </TransitionGroup>
          </div>
        </div>
        <div class="right-pane">
          <div class="header-row">
            <div class="brand-mini">
              <!-- <img src="@/assets/imgs/logo.svg" alt="" class="logo" /> -->
              <span class="brand-title">{{ underlineToHump(appStore.getTitle) }}</span>
            </div>

            <div class="actions">
              <ThemeSwitch />
              <LocaleDropdown />
            </div>
          </div>
          <Transition appear enter-active-class="animate__animated animate__bounceInRight">
            <div class="right-inner">
              <div
                class="form-box"
                :style="isLogin && organizationList.length > 0 ? 'width: 400px;' : 'width: 500px'"
              >
                <LoginForm
                  v-if="isLogin && organizationList.length > 0"
                  :organizationList="organizationList"
                  class="form-card"
                  @to-register="toRegister"
                />

                <RegisterForm v-else class="form-card" @to-login="toLogin" />
                <div class="class-message">{{ companyName }} {{ eword }} {{ version }}</div>
              </div>
              <div class="right-img" v-if="isLogin && organizationList.length > 0">
                <img
                  style="height: 250px; margin-top: 56px"
                  src="@/assets/imgs/logo.png
                  "
                />
                <h3 class="login-img">{{ underlineToHump(appStore.getTitle) }}</h3>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </ElScrollbar>
  </div>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-login';

.@{prefix-cls} {
  position: relative;
  height: 100%;

  // 小于 xl 时背景与左右留白userManage
  // @media (width <= 1279px) {
  padding-right: 10px;
  padding-left: 10px;
  overflow: auto;
  background: var(--login-bg-color);
  // background: url('../../assets/imgs/bac-login3.jpg') no-repeat;
  background-position: center;
  background-size: cover;
  // }

  &__left {
    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      background-image: url('@/assets/svgs/login-bg.svg');
      background-position: center;
      background-repeat: no-repeat;
      content: '';
    }
  }
}

.login-root {
  position: relative;
  height: 100%;
}

.scroll {
  height: 100%;
}

.wrapper {
  position: relative;
  display: flex;
  min-height: 100vh;
  margin: 0 auto;
}

.left-pane {
  position: relative;

  // 小于 xl 隐藏
  // @media (width <= 1279px) {
  display: none;
  padding: 30px;
  background: rgb(107 114 128 / 20%); // gray-500 with 20% opacity
  flex: 1 1 0;
  // }
}

.brand {
  display: flex;
  align-items: center;
  color: #fff;
}

.logo {
  width: 48px;
  height: 48px;
  margin-right: 10px;
}

.brand-title {
  display: none;
  font-size: 20px;
  font-weight: bold;
}

.left-inner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 60px);
}

.big-illustration {
  width: 450px;
}

.right-pane {
  position: relative;
  flex: 1 1 0;
  padding: 30px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;

  // >= xl 时右对齐
  // @media (width >= 1280px) {
  // justify-content: flex-end;
  // }
}

.brand-mini {
  display: flex;
  align-items: center;

  // >= xl 时隐藏（有左侧大面板和品牌）
  // @media (width >= 1280px) {
  // display: none;
  // }
}

.actions {
  display: none;
  align-items: center;
  justify-content: flex-end;
}

.actions > * + * {
  margin-left: 10px;
}

.right-inner {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: calc(100% - 60px);
}

.form-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 417px;
  max-width: 100%;
}

.form-card {
  height: auto;
  padding: 20px;
  margin: 0 auto;

  // 小于 xl 圆角+白底（light）
  // @media (width <= 1279px) {
  background: #fff;
  border-radius: 0;
  // }header-row
}

.class-message {
  margin-top: 20px;
  color: #fff;
  text-align: center;
}

.right-img {
  position: relative;
  display: flex;
  width: 345px;
  height: 457px;
  margin-top: -43px;
  background: #fff;
  align-items: center;
  justify-content: center;
}

.login-img {
  position: absolute;
  top: 26px;
  right: 30px;
  color: #666;
}
</style>
