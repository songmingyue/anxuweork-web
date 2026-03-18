import axios, { AxiosError } from 'axios'

import { AxiosInstance, RequestConfig } from './types'
import { ElMessage } from 'element-plus'
import { REQUEST_TIMEOUT } from '@/constants'
import { useUserStoreWithOut } from '@/store/modules/user'
export const PATH_URL = import.meta.env.VITE_API_BASE_PATH
const userStore = useUserStoreWithOut()
const abortControllerMap: Map<string, AbortController> = new Map()

const axiosInstance: AxiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  // Use runtime env API base path when provided; fallback to same-origin.
  baseURL: PATH_URL || '',
  withCredentials: true
})

axiosInstance.interceptors.request.use((res: any) => {
  // axiosInstance.interceptors.request.use((res: InternalAxiosRequestConfig) => {
  const controller = new AbortController()
  const url = res.url || ''
  res.headers['Content-Type'] = 'application/json;charset=UTF-8'
  res.headers['authorization'] = userStore.getToken || ''
  // 只对非白名单接口做protobuf序列化
  res.signal = controller.signal
  abortControllerMap.set(
    import.meta.env.VITE_USE_MOCK === 'true' ? url.replace('/mock', '') : url,
    controller
  )
  return res
})

const whiteList = ['/Admin/Config/GetUserPermissionList', '/Film/GetImageByFilmBox']
// 二进制/非标准 {status,desc,data} 返回的接口，直接透传 res.data
const justData = ['Film/GetImageByFilmBox', '/Film/GetImageByFilmBox']
axiosInstance.interceptors.response.use(
  (res: any) => {
    if (res.status == 200) {
      const { data } = res
      if (justData.includes(res.config.url || '')) {
        return data
      }
      if (data.status !== 0) {
        if (whiteList.includes(res.config.url || '')) {
          return res.data
        }
        ElMessage.error(data.desc || '请求出错')
        return Promise.reject(data)
      } else {
        return res.data
      }
    }
    return res
  },
  (error: AxiosError) => {
    console.log('err： ' + error) // for debug
    ElMessage.error(error.message)
    return Promise.reject(error)
  }
)

const service = {
  request: (config: RequestConfig) => {
    return new Promise((resolve, reject) => {
      if (config.interceptors?.requestInterceptors) {
        config = config.interceptors.requestInterceptors(config as any)
      }
      axiosInstance
        .request(config)
        .then((res) => {
          resolve(res)
        })
        .catch((err: any) => {
          if (err.status === '401' || err.status === 401) {
            location.href = '/login'
            localStorage.clear()
          }
          reject(err)
        })
    })
  },
  cancelRequest: (url: string | string[]) => {
    const urlList = Array.isArray(url) ? url : [url]
    for (const _url of urlList) {
      abortControllerMap.get(_url)?.abort()
      abortControllerMap.delete(_url)
    }
  },
  cancelAllRequest() {
    for (const [_, controller] of abortControllerMap) {
      controller.abort()
    }
    abortControllerMap.clear()
  }
}

export default service
