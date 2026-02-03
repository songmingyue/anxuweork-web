import { Layout } from '@/utils/routerHelper'

export const statistics = [
  {
    path: '/workstation',
    component: Layout,
    name: 'workstation',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/workstation/index.vue'),
        name: 'workstationChild',
        meta: {
          title: '首页',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/filmStatistics',
    component: Layout,
    name: 'filmStatistics',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/statistics/filmStatistics.vue'),
        name: 'filmStatisticsChild',
        meta: {
          title: '胶片统计',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/operationalAudit',
    component: Layout,
    name: 'operationalAudit',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/statistics/operationalAudit.vue'),
        name: 'operationalAuditChild',
        meta: {
          title: '操作审计',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/inspectStatistics',
    component: Layout,
    name: 'inspectStatistics',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/statistics/inspectStatistics.vue'),
        name: 'inspectStatisticsChild',
        meta: {
          title: '检查统计',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/statisticsInfo',
    component: Layout,
    name: 'statisticsInfo',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/statistics/statisticsInfo.vue'),
        name: 'statisticsInfoChild',
        meta: {
          title: '统计信息',
          icon: ''
        }
      }
    ]
  }
]
