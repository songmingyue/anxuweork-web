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

export interface OrganizationID {
  organizationID?: string
}

export const getUsersList = (data: UserListData): Promise<any> => {
  return request.post({
    url: 'api/user/getuserslist',
    data,
    requestTem: {
      requestTem: 'UserMstInputProto',
      responseTem: 'UserMstInfoOutputProto'
    }
  })
}

export const getRole = (data: OrganizationID): Promise<any> => {
  return request.post({
    url: 'api/user/getrolelist',
    data,
    requestTem: {
      requestTem: 'organizationIDInputProto',
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
