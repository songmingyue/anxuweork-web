import request from '@/axios'
import { PageType } from '../type'

/** 状态枚举：'' 为全部，'0' 为开启，'2' 为关闭 */
export enum StatusEnum {
  All = '', // 全部
  Open = '0', // 开启
  Closed = '2' // 关闭
}

/** 可直接用于下拉选项 */
export const StatusOptions = [
  { label: '全部', value: StatusEnum.All },
  { label: '开启', value: StatusEnum.Open },
  { label: '关闭', value: StatusEnum.Closed }
]

export interface UserInfo {
  deptID?: string
  userUID?: string
  loginName?: string
  userName?: string
  workNO?: string
  officePhone?: string
  name?: string
  organizationID?: string
  /** 传值使用 StatusEnum：StatusEnum.All | StatusEnum.Open | StatusEnum.Closed */
  status?: StatusEnum
  deptName?: string
  privatePhone?: string
  email?: string
}

interface UserListData extends PageType, UserInfo {}

export interface UserUID {
  userUID?: string
}

export interface UserOnce {
  account: string
  createDate: string
  createUserName: string
  name: string
  organizationID: string
  organizationName: string
  status: boolean
  type: string
  userStatus: string
  userUID: string
}

export interface RoleData {
  createUserName: string
  createDate: string
  createUserUID: string
  memo: string
  organizationID: string
  organizationName: string
  roleName: string
  roleUID: string
}

// 用户角色

export interface RoleRequest extends PageType {
  roleName?: string
}

export interface RoleMstInputProto {
  /** 角色唯一标识 */
  roleUID: string
  /** 角色名称 */
  roleName: string
  /** 创建者用户UID */
  createUserUID: string
  /** 创建者姓名 */
  createUserName: string
  /** 创建时间（ISO 8601格式） */
  createDate: string
  /** 备注信息 */
  memo?: string // 建议改为可选属性[8](@ref)
  /** 所属组织ID */
  organizationID: string
  /** 所属组织名称 */
  organizationName: string
}

export interface RoleMstProto {
  actionName: string
  active: string
  controllerName?: string
  lAY_CHECKED?: string
  parentRightID?: string
  rightClass?: string
  rightID?: string
  rightName?: string
  sortNO: string
  title: string
}
// 角色权限修改传参
export interface RoleEditProto {
  organizationID: string // 组织ID
  roleUID: string // 角色唯一标识
  right: RoleMstProto[] // 权限列表
}

export interface RoleCreate {
  organizationID: string // 组织ID
  roleName: string // 角色名称
  memo: string // 备注
}

export interface RoleEdit extends RoleCreate {
  createDate?: string // 创建时间
  createUserName?: string // 创建人名称
  createUserUID?: string // 创建人UID
  organizationName?: string // 组织名称
  roleUID?: string // 角色唯一标识
}

export interface Organizationtree {
  organizationName?: string
  searchOrganizationID?: string
}

export interface OrganizationTreeProto {
  alias?: string // 组织别名
  backGroundURL?: string // 背景图URL路径
  cardBackgroundColour?: string // 卡片背景色（十六进制）
  children?: OrganizationTreeProto[] // 子组织数组（递归结构）
  city?: string // 所在城市
  createDate?: string // 创建时间（格式：YYYY-MM-DD HH:mm:ss）
  createUserUID?: string // 创建者UUID（全零表示系统自动创建）
  defaultShareDuration?: number // 默认共享时长（数字类型）
  deleteFlag?: '是' | '否' // 删除标记（联合类型）
  district?: string // 区县信息
  email?: string // 邮箱地址
  logoURL?: string // Logo URL路径
  memo?: string // 备注信息
  officePhoneNO?: string // 办公电话
  organizationCode?: string // 组织编码
  organizationName?: string // 组织名称
  parent?: OrganizationTreeProto[] // 父级类型（固定字符串）
  parentOrganizationID?: string // 父组织ID（"-1"表示根节点）
  province?: string // 省份信息
  searchOrganizationID?: string // 搜索用组织ID
  _expanded?: boolean // 前端控制：是否展开
  _level?: number // 前端控制：节点层级
  _show?: boolean // 前端控制：是否显示
}

export interface DepSearch extends OrganizationTreeProto {
  deptID?: string
  deptName?: string
  pageSize: number
  currentPage: number
}

export interface DeptOnce {
  deleteFlag?: string // 删除标记（联合类型）
  deptID: string // 科室ID
  deptName: string // 科室名称
  deptOrganizationID: string // 科室所属组织ID
  deptType?: string // 科室类型
  deptTypeName?: string // 科室类型名称
}

export interface CreateOrganization {
  alias: string // 组织别名
  backGroundURL: string // 背景图URL路径
  cardBackgroundColour: string // 卡片背景色（十六进制格式，如"#ffffff"）
  city: string // 所在城市
  defaultShareDuration: number // 默认共享时长（数字类型）
  district: string // 区县信息
  email: string // 邮箱地址
  logoURL: string // Logo URL路径
  memo: string // 备注信息（支持换行符）
  officePhoneNO: string // 办公电话
  organizationCode: string // 组织机构代码
  organizationName: string // 机构名称
  parentOrganizationID: string // 父组织ID
  province: string // 省份信息
  searchOrganizationID: string // 搜索用组织ID
}

export const getUsers = async (data: UserListData): Promise<IResponse<UserOnce[]>> => {
  return await request.post({
    url: 'user/getuserslist',
    data,
    requestTem: {
      requestTem: 'UserMstInputProto',
      responseTem: 'UserMstInfoOutputProto'
    }
  })
}

export const getRole = (data: UserUID): Promise<IResponse<RoleData[]>> => {
  return request.post({
    url: 'user/getrolelist',
    data,
    requestTem: {
      requestTem: 'OrganizationIDInputProto',
      responseTem: 'RoleMstProto'
    }
  })
}

export const getorgList = (): Promise<any> => {
  return request.post({
    url: 'register/getorg',
    requestTem: {
      requestTem: 'OrganizationInputProto',
      responseTem: 'OrganizationDtoProto'
    }
  })
}

export const disableUser = (userUID: string, status: boolean): Promise<IResponse<[]>> => {
  return request.post({
    url: 'user/disable',
    data: { userUID, status },
    requestTem: {
      requestTem: 'UserDisableInputProto',
      responseTem: 'whitelist'
    }
  })
}

export const resetUser = (data: UserOnce): Promise<IResponse<[]>> => {
  return request.post({
    url: 'user/reset',
    data,
    requestTem: {
      requestTem: 'UserResetInputProto',
      responseTem: 'whitelist'
    }
  })
}

export const createUser = (data: UserOnce): Promise<any> => {
  return request.post({
    url: 'user/create',
    data,
    requestTem: {
      requestTem: 'UserMstEntityInputProto',
      responseTem: 'whitelist'
    }
  })
}

export const getRolesList = (data: RoleRequest): Promise<IResponse<RoleMstInputProto[]>> => {
  return request.post({
    url: 'role/getroleslist',
    data,
    requestTem: {
      requestTem: 'RoleMstInputProto',
      responseTem: 'RoleMstProto'
    }
  })
}

export const getRightsList = (data?: RoleMstInputProto): Promise<IResponse<RoleMstProto[]>> => {
  return request.post({
    url: 'role/getrightslist',
    data,
    requestTem: {
      requestTem: 'RightInputProto',
      responseTem: 'RightMstOutputProto'
    }
  })
}

// 编辑角色用户权限
export const editUserRight = (data: RoleEditProto): Promise<IResponse<[]>> => {
  return request.post({
    url: 'role/editUserRight',
    data,
    requestTem: {
      requestTem: 'EditUserRightInputProto',
      responseTem: 'whitelist'
    }
  })
}

// 删除角色
export const deleteRole = (data: RoleMstInputProto): Promise<IResponse<[]>> => {
  return request.post({
    url: 'role/delete',
    data,
    requestTem: {
      requestTem: 'RoleMstProto',
      responseTem: 'whitelist'
    }
  })
}

// 新增角色
export const createRole = (data: RoleCreate): Promise<IResponse<[]>> => {
  return request.post({
    url: 'role/create',
    data,
    requestTem: {
      requestTem: 'RoleMstProto',
      responseTem: 'whitelist'
    }
  })
}

// 编辑角色基础信息
export const updateRole = (data: RoleEdit): Promise<IResponse<[]>> => {
  return request.post({
    url: 'role/edit',
    data,
    requestTem: {
      requestTem: 'RoleMstProto',
      responseTem: 'whitelist'
    }
  })
}

// 机构

export const getorganizationtree = (
  data: Organizationtree
): Promise<IResponse<OrganizationTreeProto[]>> => {
  return request.post({
    url: 'org/getorganizationtree',
    data,
    requestTem: {
      requestTem: 'OrgInputProto',
      responseTem: 'OrganizationTreeProto'
    }
  })
}

export const getDepartmentList = (data: DepSearch): Promise<IResponse<DeptOnce[]>> => {
  return request.post({
    url: 'org/getDepartmentList',
    data,
    requestTem: {
      requestTem: 'DeptMstInputProto',
      responseTem: 'DeptMstInfoProto'
    }
  })
}
// 编辑机构
export const editOrganization = (data: OrganizationTreeProto): Promise<IResponse<[]>> => {
  return request.post({
    url: 'org/editOrganization',
    data,
    requestTem: {
      requestTem: 'OrganizationTreeProto',
      responseTem: 'whitelist'
    }
  })
}
// 创建机构
export const createOrganization = (data: CreateOrganization): Promise<IResponse<[]>> => {
  return request.post({
    url: 'org/createOrganization',
    data,
    requestTem: {
      requestTem: 'OrganizationMstProto',
      responseTem: 'whitelist'
    }
  })
}
// 删除机构
export const deleteOrganization = (data: OrganizationTreeProto): Promise<IResponse<[]>> => {
  return request.post({
    url: 'org/deleteOrganization',
    data,
    requestTem: {
      requestTem: 'DeptMstInputProto',
      responseTem: 'whitelist'
    }
  })
}

// 删除科室
export const deleteDepartment = (data: DeptOnce): Promise<IResponse<[]>> => {
  return request.post({
    url: 'org/deleteDepartment',
    data,
    requestTem: {
      requestTem: 'DeptMstInputProto',
      responseTem: 'whitelist'
    }
  })
}
// 编辑科室
export const editDepartment = (data: DeptOnce): Promise<IResponse<[]>> => {
  return request.post({
    url: 'org/editDepartment',
    data,
    requestTem: {
      requestTem: 'DeptMstInfoProto',
      responseTem: 'whitelist'
    }
  })
}

// 新增科室
export const createDepartment = (data: DeptOnce): Promise<IResponse<[]>> => {
  return request.post({
    url: 'org/createDepartment',
    data,
    requestTem: {
      requestTem: 'DeptMstInfoProto',
      responseTem: 'whitelist'
    }
  })
}
// 获取科室类型
export const getdicmsg = (data: DeptOnce): Promise<IResponse<[]>> => {
  return request.post({
    url: 'check/getdicmsg',
    data,
    requestTem: {
      requestTem: 'DicItemMstInputProto',
      responseTem: 'DicItemMstProto'
    }
  })
}
