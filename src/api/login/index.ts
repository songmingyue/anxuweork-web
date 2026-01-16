import request from '@/axios'
import type { OrganizationList, UserType } from './types'
import { UserMsg } from '@/store/modules/user'

export const loginApi = (data: any): Promise<UserMsg> => {
  return request.post({
    url: '/Home/Login',
    data
  })
}

export const userLogout = (): Promise<IResponse<UserType>> => {
  return request.post({
    url: 'Home/Logout'
  })
}

export const changepwd = (data: any): Promise<IResponse<UserType>> => {
  return request.post({
    url: 'login/changepwd',
    data,
    requestTem: {
      requestTem: 'AdminChangePasswordInputProto',
      responseTem: 'whitelist'
    }
  })
}
export const getOrganization = () => {
  return request.post({
    url: 'register/getorgbylogin',
    requestTem: {
      requestTem: 'OrganizationInputProto',
      responseTem: 'OrganizationDtoNewProto'
    }
  })
}

export const register = (data: any): Promise<IResponse<UserType>> => {
  return request.post({
    url: 'login/register',
    data,
    requestTem: {
      requestTem: 'UserMstProto',
      responseTem: 'whitelist'
    }
  })
}
export const getLoginList = (): Promise<IResponse<OrganizationList[]>> => {
  return request.post({
    url: `register/getorgbylogin`,
    requestTem: {
      responseTem: 'OrganizationDtoProto'
    }
  })
}
