import { Layout } from '@/utils/routerHelper'

export const plugConf = [
  {
    path: '/plugConf',
    component: () => Layout,
    name: 'plugConf',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/plugConf/index.vue'),
        name: 'plugConfChild',
        meta: {
          title: '插件配置',
          icon: ''
        }
      }
    ]
  }
]
