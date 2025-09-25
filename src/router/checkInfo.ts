import { Layout } from '@/utils/routerHelper'

export const checkInfo = [
  {
    path: '/checkInfo',
    component: Layout,
    name: 'checkInfos',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/checkInfo/index.vue'),
        name: 'checkInfo',
        meta: {
          title: '检查信息',
          icon: 'vi-cib:telegram-plane'
        }
      }
    ]
  }
]
