export const serviceCof = [
  {
    path: '/sysConfig',
    component: () => import('@/views/Login/Login.vue'),
    name: 'sysConfig',
    meta: {
      father: 'serviceCof',
      hidden: false,
      title: '基础信息',
      noTagsView: true
    }
  },
  {
    path: '/wado',
    component: () => import('@/views/Login/Login.vue'),
    name: 'wado',
    meta: {
      father: 'serviceCof',
      hidden: false,
      title: 'wado管理',
      noTagsView: true
    }
  },
  {
    path: '/scpDeviceManage',
    component: () => import('@/views/Login/Login.vue'),
    name: 'scpDeviceManage',
    meta: {
      father: 'serviceCof',
      hidden: false,
      title: 'SCP设备管理',
      noTagsView: true
    }
  }
]
