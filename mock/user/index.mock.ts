import { SUCCESS_CODE } from '@/constants'

const timeout = 1000
const menuList = [
  {
    url: '/paramConf',
    children: [
      {
        url: '/storageMedium',
        meta: {
          requiresAuth: true,
          title: '存储媒介'
        }
      },
      {
        url: '/systemParam',
        meta: {
          requiresAuth: true,
          title: '系统参数'
        }
      },
      {
        url: '/dataDictionary',
        meta: {
          requiresAuth: true,
          title: '数据字典'
        }
      },
      {
        url: 'plugTaskConfig',
        meta: {
          requiresAuth: true,
          title: '插件设置'
        }
      },
      {
        url: '/taskConfig',
        meta: {
          requiresAuth: true,
          title: '任务配置'
        }
      }
    ],
    meta: {
      title: '参数配置'
    }
  },
  {
    url: '/authConf',
    children: [
      {
        url: '/userManage',
        meta: {
          requiresAuth: true,
          title: '用户管理'
        }
      },
      {
        url: '/roleManage',
        meta: {
          requiresAuth: true,
          title: '角色管理'
        }
      }
    ],
    meta: {
      title: '权限配置'
    }
  },
  {
    url: '/plugConf',
    meta: {
      requiresAuth: true,
      title: '插件配置'
    }
  },
  {
    url: '/serviceCof',
    children: [
      {
        url: '/sysConfig',
        meta: {
          title: '基础信息'
        }
      },
      {
        url: '/wado',
        meta: {
          requiresAuth: true,
          title: 'wado管理'
        }
      },
      {
        url: '/scpDeviceManage',
        meta: {
          requiresAuth: true,
          title: 'SCP设备管理'
        }
      }
    ],
    meta: {
      title: '服务配置'
    }
  },
  {
    url: '/checkInfo',
    meta: {
      requiresAuth: true,
      title: '检查信息'
    }
  },
  {
    url: '/diagnosisInfo',
    children: [
      {
        url: '/patientView',
        meta: {
          requiresAuth: true,
          title: '病人视图'
        }
      },
      {
        url: '/diagnosisView',
        meta: {
          requiresAuth: true,
          title: '就诊视图'
        }
      }
    ],
    meta: {
      title: '诊疗信息'
    }
  },
  {
    url: '/logConfig',
    children: [
      {
        url: '/logOperate',
        meta: {
          title: '打印日志'
        }
      },
      {
        url: '/collectedLog',
        meta: {
          title: '采集日志'
        }
      },
      {
        url: '/searchLog',
        meta: {
          title: '查询日志'
        }
      },
      {
        url: '/abnormalReport',
        meta: {
          title: '上传失败'
        }
      },
      {
        url: '/uploadLog',
        meta: {
          title: '上传日志'
        }
      },
      {
        url: '/failTaskManage',
        meta: {
          title: '失败任务管理'
        }
      },
      {
        url: '/sensitiveLogManage',
        meta: {
          title: '敏感操作管理'
        }
      }
    ],
    meta: {
      title: '日志信息'
    }
  }
]
const List: {
  username: string
  password: string
  role: string
  roleId: string
  permissions: string | string[]
}[] = [
  {
    username: 'admin',
    password: 'admin',
    role: 'admin',
    roleId: '1',
    permissions: ['*.*.*']
  },
  {
    username: 'test',
    password: 'test',
    role: 'test',
    roleId: '2',
    permissions: ['example:dialog:create', 'example:dialog:delete']
  }
]

export default [
  // 列表接口
  {
    url: '/mock/user/list',
    method: 'get',
    response: ({ query }) => {
      const { username, pageIndex, pageSize } = query

      const mockList = List.filter((item) => {
        if (username && item.username.indexOf(username) < 0) return false
        return true
      })
      const pageList = mockList.filter(
        (_, index) => index < pageSize * pageIndex && index >= pageSize * (pageIndex - 1)
      )

      return {
        code: SUCCESS_CODE,
        data: {
          total: mockList.length,
          list: pageList
        }
      }
    }
  },
  // 登录接口
  {
    url: '/api/login/userlogin',
    method: 'post',
    timeout,
    response: ({ body }) => {
      const data = body
      let hasUser = false
      for (const user of List) {
        if (user.username === data.username && user.password === data.password) {
          hasUser = true
          return {
            code: SUCCESS_CODE,
            data: {
              ...user,
              menuList
            }
          }
        }
      }
      if (!hasUser) {
        return {
          code: 500,
          message: '账号或密码错误'
        }
      }
    }
  },
  // 退出接口
  {
    url: '/mock/user/loginOut',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: null
      }
    }
  }
]
