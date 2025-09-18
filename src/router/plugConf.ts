export const plugConf = [
  {
    path: '/plugConf',
    component: () => import('@/views/Login/Login.vue'),
    name: 'plugConf',
    meta: {
      father: 'plugConf',
      hidden: false,
      title: '插件配置',
      noTagsView: true
    }
  }
]
