<script setup lang="ts">
import { LoginForm, RegisterForm } from './components'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { LocaleDropdown } from '@/components/LocaleDropdown'
import { underlineToHump } from '@/utils'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
import { onMounted, ref, unref } from 'vue'
import { ElScrollbar } from 'element-plus'
import { getLoginList } from '@/api/login'
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
const toRegister = () => {
  isLogin.value = false
}
const toLogin = () => {
  isLogin.value = true
}

const getVersionMsd = async () => {
  const data = await getVersion()
  version.value = data
}

const getorgbylogin = async () => {
  const datas = await getLoginList()
  organizationList.value = datas.data || []
  const orgList = unref(organizationList)
    .filter((item) => item.organizationID !== '-1')
    .map((item) => ({
      label: item.organizationName,
      value: item.organizationID
    }))
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
            <img src="@/assets/imgs/logo.svg" alt="" class="logo" />
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
              <img src="@/assets/imgs/logo.svg" alt="" class="logo" />
              <span class="brand-title">{{ underlineToHump(appStore.getTitle) }}</span>
            </div>

            <div class="actions">
              <ThemeSwitch />
              <LocaleDropdown />
            </div>
          </div>
          <Transition appear enter-active-class="animate__animated animate__bounceInRight">
            <div class="right-inner">
              <div class="form-box">
                <LoginForm
                  v-if="isLogin && organizationList.length > 0"
                  :organizationList="organizationList"
                  class="form-card"
                  @to-register="toRegister"
                />

                <RegisterForm v-else class="form-card" @to-login="toLogin" />
                <div class="class-message">
                  宁波全网云医疗科技股份有限公司 eWordIMCIS {{ version }}
                </div>
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
  overflow: auto;

  // 小于 xl 时背景与左右留白
  @media (width <= 1279px) {
    padding-right: 10px;
    padding-left: 10px;
    background: var(--login-bg-color);
  }

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
  flex: 1 1 0;
  padding: 30px;
  background: rgb(107 114 128 / 20%); // gray-500 with 20% opacity

  // 小于 xl 隐藏
  @media (width <= 1279px) {
    display: none;
  }
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
  @media (width >= 1280px) {
    justify-content: flex-end;
  }
}

.brand-mini {
  display: flex;
  align-items: center;

  // >= xl 时隐藏（有左侧大面板和品牌）
  @media (width >= 1280px) {
    display: none;
  }
}

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.actions > * + * {
  margin-left: 10px;
}

.right-inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100% - 60px);
}

.form-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 500px;
  max-width: 100%;
}

.form-card {
  height: auto;
  padding: 20px;
  margin: 0 auto;

  // 小于 xl 圆角+白底（light）
  @media (width <= 1279px) {
    background: #fff;
    border-radius: 24px;
  }
}

.class-message {
  margin-top: 20px;
  color: #fff;
  text-align: center;
}
</style>
