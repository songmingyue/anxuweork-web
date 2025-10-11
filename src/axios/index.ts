import service from './service'
import { useUserStoreWithOut } from '@/store/modules/user'

const request = (option: AxiosConfig) => {
  const { url, method, params, data, headers, responseType, requestTem } = option
  const baseURL = 'api/'
  const userStore = useUserStoreWithOut()
  return service.request({
    url: baseURL + url,
    method,
    params,
    data: data,
    responseType: responseType ? responseType : 'arraybuffer',
    headers: {
      [userStore.getTokenKey ?? 'Authorization']: userStore.getToken ?? '',
      UserInfo: userStore.getUserInfo
        ? JSON.stringify({
            userUID: userStore.getUserInfo[0].userUID,
            organizationID: userStore.getUserInfo[0].organizationID
          })
        : '',
      'X-Requested-With': 'XMLHttpRequest',
      ...headers
    },
    proto: requestTem
  })
}

export default {
  get: <T = any>(option: AxiosConfig) => {
    return request({ method: 'get', ...option }) as Promise<IResponse<T>>
  },
  post: <T = any>(option: AxiosConfig) => {
    return request({ method: 'post', ...option }) as Promise<IResponse<T>>
  },
  delete: <T = any>(option: AxiosConfig) => {
    return request({ method: 'delete', ...option }) as Promise<IResponse<T>>
  },
  put: <T = any>(option: AxiosConfig) => {
    return request({ method: 'put', ...option }) as Promise<IResponse<T>>
  },
  cancelRequest: (url: string | string[]) => {
    return service.cancelRequest(url)
  },
  cancelAllRequest: () => {
    return service.cancelAllRequest()
  }
}
