import axios, { AxiosError } from 'axios'

import { AxiosInstance, InternalAxiosRequestConfig, RequestConfig, AxiosResponse } from './types'
import { ElMessage } from 'element-plus'
import { REQUEST_TIMEOUT } from '@/constants'
import { nowTimestamp } from '@/utils/timeDate'
import { decodeProtoMsg, encodeProtoMsg } from '@/utils/encrypt'

export const PATH_URL = import.meta.env.VITE_API_BASE_PATH

const abortControllerMap: Map<string, AbortController> = new Map()

const axiosInstance: AxiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: PATH_URL
})

const filderUrl = ['/system/version', '/key'] // 加密白名单

axiosInstance.interceptors.request.use((res: InternalAxiosRequestConfig) => {
  const controller = new AbortController()
  const url = res.url || ''
  // 只对非白名单接口做protobuf序列化
  if (!filderUrl.find((item) => url.includes(item))) {
    if (res.data) {
      if (res.proto && res.proto.requestTem) {
        const buffer = encodeProtoMsg(res.data, res.proto.requestTem)
        res.data = buffer
      }
    }
    // 设置请求头为二进制（移到条件内部）
    if (res.headers) {
      res.headers['Content-Type'] = 'application/octet-stream'
    }
    res.url = `${url}?t=${nowTimestamp}`
  }
  res.signal = controller.signal
  abortControllerMap.set(
    import.meta.env.VITE_USE_MOCK === 'true' ? url.replace('/mock', '') : url,
    controller
  )
  return res
})

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    const { config } = res
    if (config.proto && config.proto.responseTem) {
      const buffer = decodeProtoMsg(res.data, config.proto.responseTem)
      console.log('解密后的数据', buffer)

      res.data = buffer
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
