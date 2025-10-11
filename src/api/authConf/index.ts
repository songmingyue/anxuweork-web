import request from '@/axios'

export const getrolelist = (data: {
  roleName: string
  page: number
  size: number
}): Promise<any> => {
  return request.post({
    url: 'user/getrolelist',
    data,
    requestTem: {
      requestTem: 'organizationIDInputProto',
      responseTem: 'RoleMstProto'
    }
  })
}
