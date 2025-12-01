import request from '@/axios'

export const getLoginKey = async (): Promise<string> => {
  const response = await request.get({ url: 'authorize/key', responseType: 'json' })
  return response.data.data
}

export const getVersion = async (): Promise<string> => {
  const response = await request.get({ url: 'system/version', responseType: 'json' })
  return response.data.data
}
// api/system/getsysparametersingle
export const getsysparametersingle = async (): Promise<any> => {
  const response = await request.post({
    url: 'api/system/getsysparametersingle',
    data: { code: 'PrintConfig' },
    requestTem: {
      requestTem: 'SysParameterMstProto',
      responseTem: 'SysParameterMstProto'
    }
  })
  return response.data.data
}
