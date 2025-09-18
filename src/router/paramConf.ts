export const paramConf = [
  {
    path: '/storageMedium',
    component: () => import('@/views/Login/Login.vue'),
    name: 'storageMedium',
    meta: {
      father: 'paramConf',
      hidden: false,
      title: '存储媒介',
      noTagsView: true
    }
  },
  {
    path: '/systemParam',
    component: () => import('@/views/Login/Login.vue'),
    name: 'systemParam',
    meta: {
      father: 'paramConf',
      hidden: false,
      title: '系统参数',
      noTagsView: true
    }
  },
  {
    path: '/dataDictionary',
    component: () => import('@/views/Login/Login.vue'),
    name: 'dataDictionary',
    meta: {
      father: 'paramConf',
      hidden: false,
      title: '数据字典',
      noTagsView: true
    }
  },
  {
    path: '/plugTaskConfig',
    component: () => import('@/views/Login/Login.vue'),
    name: 'plugTaskConfig',
    meta: {
      father: 'paramConf',
      hidden: false,
      title: '插件设置',
      noTagsView: true
    }
  },
  {
    path: '/taskConfig',
    component: () => import('@/views/Login/Login.vue'),
    name: 'taskConfig',
    meta: {
      father: 'paramConf',
      hidden: false,
      title: '任务配置',
      noTagsView: true
    }
  }
]
