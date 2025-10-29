export interface UserLoginType {
  account: string
  password: string
  organizationID: string
}

enum IsSuper {
  YES = 'True',
  NO = 'False'
}

export interface UserType {
  accessToken: string
  isCurrentPageOpen: string
  isSuperManager: IsSuper
  loginName: string
  organizationName: string // 机构名称
  userUID: string // 用户ID
  username: string
  organizationID: string
  viewParts: MenuList[]
  UserRight: UserRight
}

/**
 * 用户功能/数据权限定义
 * 说明：本接口内所有权限位均采用 IsSuper 枚举（'True' | 'False'）。
 * - True：有权限/可见/允许
 * - False：无权限/不可见/禁止
 */
export interface UserRight {
  /** 当前用户ID（冗余，便于服务端校验） */
  userUID: string

  /** 检查信息相关权限（检查任务、费用等） */
  examInfo: {
    /** 模块总开关：是否可见检查模块 */
    visible: IsSuper
    /** 是否可见医生维度数据/筛选项 */
    doctorVisible: IsSuper
    /** 是否可见科室维度数据/筛选项 */
    departmentVisible: IsSuper
    /** 是否可见机构维度数据/筛选项 */
    organizationVisible: IsSuper
    /** 是否可见列表数据（如检查任务列表） */
    listVisible: IsSuper
    /** 是否可见/可操作检查收费信息 */
    checkChargeVisible: IsSuper
  }

  /** 门诊信息相关权限 */
  clinicInfo: {
    /** 模块总开关：是否可见门诊模块 */
    visible: IsSuper
    /** 是否可见医生维度数据/筛选项 */
    doctorVisible: IsSuper
    /** 是否可见科室维度数据/筛选项 */
    departmentVisible: IsSuper
    /** 是否可见机构维度数据/筛选项 */
    organizationVisible: IsSuper
  }

  /** 统计分析相关权限 */
  statisticInfo: {
    /** 模块总开关：是否可见统计模块 */
    visible: IsSuper
    /** 是否可见医生维度数据/筛选项 */
    doctorVisible: IsSuper
    /** 是否可见科室维度数据/筛选项 */
    departmentVisible: IsSuper
    /** 是否可见机构维度数据/筛选项 */
    organizationVisible: IsSuper
  }

  /** 数据访问/编辑类权限 */
  data: {
    /** 是否可见申请单数据 */
    requestVisible: IsSuper
    /** 是否可见报告数据 */
    reportVisible: IsSuper
    /** 是否可见图像数据 */
    imageVisible: IsSuper
    /** 是否可见胶片数据 */
    filmVisible: IsSuper
    /** 是否开启上传（如影像/报告上传） */
    isOpenUpload: IsSuper
    /** 是否允许编辑检查信息 */
    editExamVisible: IsSuper
  }

  /** 展示风格/范围类权限控制 */
  displayStyleRightInfo: {
    /**
     * 允许访问/展示的服务分组或科室ID集合
     * 说明：为 True 时表示有权限，False 表示无权限；如需细分可在后端根据用户绑定的ID列表进一步控制。
     */
    ServiceSectIDs: IsSuper
  }
}

export interface UserLoginTypes {
  account: string
  password: string
  organizationID: string
  rememberMe: string
}

export interface OrganizationList {
  deptMstDto: any[]
  organizationID: string
  organizationName: string
}
