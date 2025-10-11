import request from '@/axios'
import type { OrganizationList, UserType } from './types'
interface RoleParams {
  roleName: string
}

export const loginApi = (data: any): Promise<IResponse<UserType>> => {
  return request.post({
    url: 'login/userlogin',
    data,
    requestTem: {
      requestTem: 'AdminLoginInputProto',
      responseTem: 'AdminLoginUserInfoProto'
    }
  })
}

export const loginOutApi = (): Promise<IResponse> => {
  return request.get({ url: '/mock/user/loginOut' })
}

export const getUserListApi = ({ params }: AxiosConfig) => {
  return request.get<{
    code: string
    data: {
      list: UserType[]
      total: number
    }
  }>({ url: '/mock/user/list', params })
}

export const getAdminRoleApi = (
  params: RoleParams
): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  return request.get({ url: '/mock/role/list', params })
}

export const getTestRoleApi = (params: RoleParams): Promise<IResponse<string[]>> => {
  return request.get({ url: '/mock/role/list2', params })
}

export const getLoginList = (): Promise<IResponse<OrganizationList[]>> => {
  return request.post({
    url: `register/getorgbylogin`,
    requestTem: {
      responseTem: 'OrganizationDtoProto'
    }
  })
}
