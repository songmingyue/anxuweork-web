import { Layout } from '@/utils/routerHelper'

export const logConfig = [
  {
    path: '/logOperate',
    component: Layout,
    name: 'logOperate',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/logConfig/logOperate.vue'),
        name: 'logOperateChild',
        meta: {
          title: '打印日志',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/collectedLog',
    component: Layout,
    name: 'collectedLog',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/logConfig/collectedLog.vue'),
        name: 'collectedLogChild',
        meta: {
          title: '采集日志',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/searchLog',
    component: Layout,
    name: 'searchLog',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/logConfig/searchLog.vue'),
        name: 'searchLogChild',
        meta: {
          title: '查询日志',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/abnormalReport',
    component: Layout,
    name: 'abnormalReport',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/logConfig/abnormalReport.vue'),
        name: 'abnormalReportChild',
        meta: {
          title: '上传失败',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/uploadLog',
    component: Layout,
    name: 'uploadLog',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/logConfig/uploadLog.vue'),
        name: 'uploadLogChild',
        meta: {
          title: '上传日志',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/failTaskManage',
    component: Layout,
    name: 'failTaskManage',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/logConfig/failTaskManage.vue'),
        name: 'failTaskManageChild',
        meta: {
          title: '失败任务管理',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/sensitiveLogManage',
    component: Layout,
    name: 'sensitiveLogManage',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/logConfig/sensitiveLogManage.vue'),
        name: 'sensitiveLogManageChild',
        meta: {
          title: '敏感操作管理',
          icon: ''
        }
      }
    ]
  }
]
