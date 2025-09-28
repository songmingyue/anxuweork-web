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
