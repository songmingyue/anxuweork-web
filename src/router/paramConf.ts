import { Layout } from '@/utils/routerHelper'

export const paramConf = [
  {
    path: '/storageMedium',
    component: () => Layout,
    name: 'storageMedium',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/paramConf/storageMedium.vue'),
        name: 'storageMediumChild',
        meta: {
          title: '存储媒介',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/systemParam',
    component: () => Layout,
    name: 'systemParam',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/paramConf/systemParam.vue'),
        name: 'systemParamChild',
        meta: {
          title: '系统参数',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/dataDictionary',
    component: () => Layout,
    name: 'dataDictionary',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/paramConf/dataDictionary.vue'),
        name: 'dataDictionaryChild',
        meta: {
          title: '数据字典',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/plugTaskConfig',
    component: () => Layout,
    name: 'plugTaskConfig',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/paramConf/plugTaskConfig.vue'),
        name: 'plugTaskConfigChild',
        meta: {
          title: '插件设置',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/taskConfig',
    component: () => Layout,
    name: 'taskConfig',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/paramConf/taskConfig.vue'),
        name: 'taskConfigChild',
        meta: {
          title: '任务配置',
          icon: ''
        }
      }
    ]
  }
]
