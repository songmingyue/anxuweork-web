export const diagnosisInfo = [
  {
    path: '/patientView',
    component: () => import('@/views/Login/Login.vue'),
    name: 'patientView',
    meta: {
      father: 'diagnosisInfo',
      hidden: false,
      title: '病人视图',
      noTagsView: true
    }
  },
  {
    path: '/diagnosisView',
    component: () => import('@/views/Login/Login.vue'),
    name: 'diagnosisView',
    meta: {
      father: 'diagnosisInfo',
      hidden: false,
      title: '就诊视图',
      noTagsView: true
    }
  }
]
