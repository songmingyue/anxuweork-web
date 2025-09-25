import { Layout } from '@/utils/routerHelper'

export const serviceCof = [
  {
    path: '/sysConfig',
    component: Layout,
    name: 'sysConfig',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/serviceCof/serviceCof.vue'),
        name: 'sysConfigChild',
        meta: {
          title: '基础信息',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/wado',
    component: Layout,
    name: 'wado',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/serviceCof/wado.vue'),
        name: 'wadoChild',
        meta: {
          title: 'wado管理',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/scpDeviceManage',
    component: Layout,
    name: 'scpDeviceManage',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/serviceCof/scpDeviceManage.vue'),
        name: 'scpDeviceManageChild',
        meta: {
          title: 'SCP设备管理',
          icon: ''
        }
      }
    ]
  }
]
