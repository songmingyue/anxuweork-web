import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { NO_RESET_WHITE_LIST } from '@/constants'
import { Layout } from '@/utils/routerHelper'
import { management } from '@/router/management'

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: '登录',
      noTagsView: true
    }
  },
  {
    path: '/',
    component: Layout,
    name: 'indexs',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/dataPage/index.vue'),
        name: 'indexPages',
        meta: {
          title: '基础信息',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/index',
    component: Layout,
    name: 'index',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/dataPage/index.vue'),
        name: 'indexPage',
        meta: {
          title: '基础信息',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/configuration',
    component: Layout,
    name: 'configurations',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/configuration/index.vue'),
        name: 'configurationChild',
        meta: {
          title: '参数配置',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/clientRegister',
    component: Layout,
    name: 'clientRegister',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/clientRegister/index.vue'),
        name: 'clientRegisterChild',
        meta: {
          title: '客户端注册',
          icon: ''
        }
      }
    ]
  },

  ...management
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  strict: true,
  routes: [...constantRouterMap, ...asyncRouterMap] as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !NO_RESET_WHITE_LIST.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
