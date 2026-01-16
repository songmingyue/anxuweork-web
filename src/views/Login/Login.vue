<script setup lang="ts">
import { LoginForm } from './components'
import { ThemeSwitch } from '@/components/ThemeSwitch'

import { useDesign } from '@/hooks/web/useDesign'
import { ref } from 'vue'
import { ElScrollbar } from 'element-plus'
import { OrganizationList } from '@/api/login/types'

const { getPrefixCls } = useDesign()
const version = ref('')
const prefixCls = getPrefixCls('login')
const organizationList = ref<OrganizationList[]>([])
const isLogin = ref(true)
// 读取环境变量中的公司名称
const companyName = (import.meta as any).env?.VITE_APP_COMPANY_NAME || ''
const eword = (import.meta as any).env?.VITE_APP_COMPANY_EN_NAME || ''

const toRegister = () => {
  isLogin.value = false
}
</script>

<template>
  <div :class="prefixCls" class="login-root">
    <ElScrollbar class="scroll">
      <div class="wrapper">
        <div :class="`${prefixCls}__left left-pane`">
          <div class="brand">
            <!-- <img src="@/assets/imgs/logo.svg" alt="" class="logo" /> -->
            <!-- <span class="brand-title">{{ underlineToHump(appStore.getTitle) }}</span> -->
          </div>
        </div>
        <div class="right-pane">
          <div class="header-row">
            <div class="brand-mini">
              <!-- <img src="@/assets/imgs/logo.svg" alt="" class="logo" /> -->
              <!-- <span class="brand-title">{{ underlineToHump(appStore.getTitle) }}</span> -->
            </div>

            <div class="actions">
              <ThemeSwitch />
              <!-- <LocaleDropdown /> -->
            </div>
          </div>
          <div class="body-item">
            <div>
              <img class="body-left-img" src="@/assets/imgs/login/left_logo.png" />
            </div>

            <div class="right-inner">
              <div class="form-box">
                <LoginForm
                  :organizationList="organizationList"
                  class="form-card"
                  @to-register="toRegister"
                />

                <!-- <RegisterForm v-else-if="!isLogin" class="form-card" @to-login="toLogin" /> -->
                <div class="class-message">{{ companyName }} {{ eword }} {{ version }}</div>
              </div>
            </div>
          </div>
          <!-- </Transition> -->
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
  background-image: url('@/assets/imgs/login/login_backgroud.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
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
  // display: flex;
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
  display: none;
  color: #fff;
  justify-content: space-between;
  align-items: center;

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
  // display: none;
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
  width: 500px;
  max-width: 100%;
}

.form-card {
  height: auto;
  padding: 30px 20px;
  margin: 0 auto;

  // 小于 xl 圆角+白底（light）
  // @media (width <= 1279px) {
  background-color: var(--app-content-bg-light-color);
  border-radius: 0;
  // }header-row
}

.class-message {
  margin-top: 20px;
  color: #ccc;
  text-align: center;
}

.right-img {
  position: relative;
  display: flex;
  width: 345px;
  height: 455px;
  margin-top: -43px;
  margin-left: -24px;
  background-color: var(--app-content-bg-color);
  align-items: center;
  justify-content: center;
}

.body-left-img {
  position: absolute;
  bottom: 124px;
  width: 45vw;
}

.body-item {
  display: flex;
  height: 100%;
  padding: 10vh 6vw 0;
  align-items: center;
  justify-content: space-between;
  // position: absolute;
  // bottom: 124px;
}

@media (width <= 1023px) {
  .body-left-img {
    display: none;
  }

  .body-item {
    justify-content: center;
  }
}
</style>
