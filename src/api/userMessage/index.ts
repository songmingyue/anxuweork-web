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
  name?: string
  organizationID?: string
  /** 传值使用 StatusEnum：StatusEnum.All | StatusEnum.Open | StatusEnum.Closed */
  status?: StatusEnum
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
  createDate: string
  createUserUID: string
  memo: string
  organizationID: string
  organizationName: string
  roleName: string
  roleUID: string
}

export const getUsers = async (data: UserListData): Promise<IResponse<UserOnce[]>> => {
  return await request.post({
    url: 'api/user/getuserslist',
    data,
    requestTem: {
      requestTem: 'UserMstInputProto',
      responseTem: 'UserMstInfoOutputProto'
    }
  })
}

export const getRole = (data: UserUID): Promise<IResponse<RoleData[]>> => {
  return request.post({
    url: 'api/user/getrolelist',
    data,
    requestTem: {
      requestTem: 'OrganizationIDInputProto',
      responseTem: 'RoleMstProto'
    }
  })
}

export const getorgList = (): Promise<any> => {
  return request.post({
    url: 'api/register/getorg',
    requestTem: {
      requestTem: 'OrganizationInputProto',
      responseTem: 'OrganizationDtoProto'
    }
  })
}

export const disableUser = (userUID: string, status: boolean): Promise<IResponse<[]>> => {
  return request.post({
    url: 'api/user/disable',
    data: { userUID, status },
    requestTem: {
      requestTem: 'UserDisableInputProto',
      responseTem: 'whitelist'
    }
  })
}

export const resetUser = (data: UserOnce): Promise<IResponse<[]>> => {
  return request.post({
    url: 'api/user/reset',
    data,
    requestTem: {
      requestTem: 'UserResetInputProto',
      responseTem: 'whitelist'
    }
  })
}

export const createUser = (data: UserOnce): Promise<any> => {
  return request.post({
    url: 'api/user/create',
    data,
    requestTem: {
      requestTem: 'UserMstEntityInputProto',
      responseTem: 'whitelist'
    }
  })
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

export const getRolesList = (data: RoleRequest): Promise<IResponse<RoleMstInputProto[]>> => {
  return request.post({
    url: 'api/role/getroleslist',
    data,
    requestTem: {
      requestTem: 'RoleRequest',
      responseTem: 'RoleMstInputProto'
    }
  })
}
