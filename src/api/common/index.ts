import request from '@/axios'

// 获取所有字典
export const getDictApi = () => {
  return request.get({ url: '/mock/dict/list' })
}

// 模拟获取某个字典
export const getDictOneApi = async () => {
  return request.get({ url: '/mock/dict/one' })
}

export const getLoginKey = async (): Promise<string> => {
  const response = await request.post({ url: '/api/Login/key', responseType: 'json' })
  return response.data.data
}

export const getVersion = async (): Promise<string> => {
  const response = await request.get({ url: '/api/system/version', responseType: 'json' })
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
