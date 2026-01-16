export const menuList = [
  {
    url: '/index',
    meta: {
      requiresAuth: true,
      title: '管理平台'
    }
  },
  {
    url: '/configuration',
    meta: {
      requiresAuth: true,
      title: '参数设置'
    }
  },
  {
    url: '/management',
    children: [
      {
        url: '/systemManagement',
        meta: {
          requiresAuth: true,
          title: '参数配置'
        }
      },
      {
        url: '/scriptManagement',
        meta: {
          requiresAuth: true,
          title: '脚本管理'
        }
      }
    ],
    meta: {
      requiresAuth: true,
      title: '配置管理'
    }
  },
  {
    url: '/client',
    children: [
      {
        url: '/clientRegister',
        meta: {
          requiresAuth: true,
          title: '客户端注册'
        }
      }
    ],
    meta: {
      requiresAuth: true,
      title: '注册'
    }
  }
]
