export const authConf = [
  {
    path: '/userManage',
    component: () => import('@/views/Login/Login.vue'),
    name: 'userManage',
    meta: {
      father: 'authConf',
      hidden: false,
      title: '用户管理',
      noTagsView: true
    }
  },
  {
    path: '/roleManage',
    component: () => import('@/views/Login/Login.vue'),
    name: 'roleManage',
    meta: {
      father: 'authConf',
      hidden: false,
      title: '角色管理',
      noTagsView: true
    }
  },
  {
    path: '/systemParam',
    component: () => import('@/views/Login/Login.vue'),
    name: 'systemParam',
    meta: {
      father: 'authConf',
      hidden: false,
      title: '机构管理',
      noTagsView: true
    }
  }
]
