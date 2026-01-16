import { Layout } from '@/utils/routerHelper'

export const management = [
  {
    path: '/systemManagement',
    component: Layout,
    name: 'systemManagement',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/management/systemManagement.vue'),
        name: 'systemManagementChild',
        meta: {
          title: '参数配置',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/scriptManagement',
    component: Layout,
    name: 'scriptManagement',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/management/scriptManagement.vue'),
        name: 'scriptManagementChild',
        meta: {
          title: '脚本管理',
          icon: ''
        }
      }
    ]
  }
]
