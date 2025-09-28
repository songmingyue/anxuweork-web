import request from '@/axios'

export const getrolelist = (): Promise<any> => {
  return request.post({
    url: 'api/user/getrolelist?',
    requestTem: {
      requestTem: 'organizationIDInputProto',
      responseTem: 'RoleMstProto'
    }
  })
}
