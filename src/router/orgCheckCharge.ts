import { Layout } from '@/utils/routerHelper'

export const statics = [
  {
    path: '/orgCheckCharge',
    component: Layout,
    name: 'orgCheckCharges',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/orgCheckCharge/index.vue'),
        name: 'orgCheckChargeChild',
        meta: {
          title: '检查信息',
          icon: 'vi-cib:telegram-plane'
        }
      }
    ]
  }
]
