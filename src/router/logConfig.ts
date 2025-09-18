export const logConfig = [
  {
    path: '/logOperate',
    component: () => import('@/views/Login/Login.vue'),
    name: 'logOperate',
    meta: {
      father: 'logConfig',
      hidden: false,
      title: '打印日志"',
      noTagsView: true
    }
  },
  {
    path: '/collectedLog',
    component: () => import('@/views/Login/Login.vue'),
    name: 'collectedLog',
    meta: {
      father: 'logConfig',
      hidden: false,
      title: '采集日志',
      noTagsView: true
    }
  },
  {
    path: '/searchLog',
    component: () => import('@/views/Login/Login.vue'),
    name: 'searchLog',
    meta: {
      father: 'logConfig',
      hidden: false,
      title: '查询日志',
      noTagsView: true
    }
  },
  {
    path: '/abnormalReport',
    component: () => import('@/views/Login/Login.vue'),
    name: 'abnormalReport',
    meta: {
      father: 'logConfig',
      hidden: false,
      title: '上传失败',
      noTagsView: true
    }
  },
  {
    path: '/uploadLog',
    component: () => import('@/views/Login/Login.vue'),
    name: 'uploadLog',
    meta: {
      father: 'logConfig',
      hidden: false,
      title: '上传日志',
      noTagsView: true
    }
  },
  {
    path: '/failTaskManage',
    component: () => import('@/views/Login/Login.vue'),
    name: 'failTaskManage',
    meta: {
      father: 'logConfig',
      hidden: false,
      title: '失败任务管理',
      noTagsView: true
    }
  },
  {
    path: '/sensitiveLogManage',
    component: () => import('@/views/Login/Login.vue'),
    name: 'sensitiveLogManage',
    meta: {
      father: 'logConfig',
      hidden: false,
      title: '敏感操作管理',
      noTagsView: true
    }
  }
]
