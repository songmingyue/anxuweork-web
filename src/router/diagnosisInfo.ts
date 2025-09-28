import { Layout } from '@/utils/routerHelper'

export const diagnosisInfo = [
  {
    path: '/patientView',
    component: Layout,
    name: 'diagnosisInfo',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/diagnosisInfo/patientView.vue'),
        name: 'diagnosisInfoChildren',
        meta: {
          title: '检查信息',
          icon: 'vi-cib:telegram-plane'
        }
      }
    ]
  },
  {
    path: '/diagnosisView',
    component: Layout,
    name: 'diagnosisViews',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/diagnosisInfo/patientView.vue'),
        name: 'diagnosisView',
        meta: {
          title: '检查信息',
          icon: 'vi-cib:telegram-plane'
        }
      }
    ]
  }
]
