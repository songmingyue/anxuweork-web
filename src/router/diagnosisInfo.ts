import { Layout } from '@/utils/routerHelper'

export const diagnosisInfo = [
  {
    path: '/patientView',
    component: () => Layout,
    name: 'checkInfos',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/diagnosisInfo/patientView.vue'),
        name: 'diagnosisInfo',
        meta: {
          title: '检查信息',
          icon: 'vi-cib:telegram-plane'
        }
      }
    ]
  },
  {
    path: '/diagnosisView',
    component: () => Layout,
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
