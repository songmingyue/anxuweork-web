export const formRule = {
  tokenServer: [
    {
      required: true,
      message: '请填写Token服务地址',
      trigger: 'blur'
    }
  ],
  organizationID: [
    {
      required: true,
      message: '请填写机构信息',
      trigger: 'blur'
    }
  ]
}

export const logFormRule = {
  file: [
    {
      required: true,
      message: '请输入输出目录',
      trigger: 'blur'
    }
  ],
  maxSizeRollBackups: [
    {
      required: true,
      message: '请输入备份文件的个数',
      trigger: 'blur'
    }
  ],
  appendToFile: [
    {
      required: true,
      message: '请选择是否覆盖',
      trigger: 'blur'
    }
  ],
  maximumFileSize: [
    {
      required: true,
      message: '请输入最大大小',
      trigger: 'blur'
    }
  ],
  layoutPattern: [
    {
      required: true,
      message: '请输入错误日志布局',
      trigger: 'blur'
    }
  ],
  rollingStyle: [
    {
      required: true,
      message: '请输入文件创建的方式',
      trigger: 'blur'
    }
  ],
  datePattern: [
    {
      required: true,
      message: '请输入日志文件名',
      trigger: 'blur'
    }
  ],
  level: [
    {
      required: true,
      message: '请选择日志级别',
      trigger: 'blur'
    }
  ]
}

export const dbFormRule = {
  dbType: [
    {
      required: true,
      message: '请选择数据库类型',
      trigger: 'blur'
    }
  ],
  dbInstallType: [
    {
      required: true,
      message: '请选择数据库安装类型',
      trigger: 'blur'
    }
  ],
  dataSource: [
    {
      required: true,
      message: '请输入数据库服务IP',
      trigger: 'blur'
    }
  ],
  initialCatalog: [
    {
      required: true,
      message: '请输入数据库名称',
      trigger: 'blur'
    }
  ],
  userId: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur'
    }
  ]
}
