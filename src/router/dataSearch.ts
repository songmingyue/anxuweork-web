import { Layout } from '@/utils/routerHelper'

export const dataSearch = [
  {
    path: '/dataSearch',
    component: Layout,
    name: 'DataSearchs',
    meta: {
      title: '数据查询',
      icon: 'vi-cib:telegram-plane'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/dataConf/dataSearch.vue'),
        name: 'DataSearch',
        meta: {
          title: '病患查询',
          icon: 'vi-cib:telegram-plane'
        }
      }
    ]
  },
  {
    path: '/smssSearch',
    component: Layout,
    name: 'smssSearchs',
    meta: {
      title: '短信查询',
      icon: 'vi-cib:telegram-plane'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/dataConf/smssSearch.vue'),
        name: 'SmssSearch',
        meta: {
          title: '短信查询',
          icon: 'vi-cib:telegram-plane'
        }
      }
    ]
  }
]
