import { Layout } from '@/utils/routerHelper'

export const authConf = [
  {
    path: '/userManage',
    component: Layout,
    name: 'UserManages',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/authConf/userManage.vue'),
        name: 'UserManage',
        meta: {
          title: '用户信息',
          icon: 'vi-cib:telegram-plane'
        }
      }
    ]
  },
  {
    path: '/roleManage',
    component: () => Layout,
    name: 'RoleManages',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/authConf/roleManage.vue'),
        name: 'RroleManages',
        meta: {
          title: '角色管理',
          icon: 'vi-cib:telegram-plane'
        }
      }
    ]
  },
  {
    path: '/departmentMag',
    component: () => Layout,
    name: 'departmentMag',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/authConf/departmentMag.vue'),
        name: 'RdepartmentMag',
        meta: {
          title: '机构管理',
          icon: 'vi-cib:telegram-plane'
        }
      }
    ]
  }
]
