import service from './service'

const request = (option: AxiosConfig) => {
  const { url, method, params, data, headers, requestTem } = option
  const baseURL = ''
  return service.request({
    url: baseURL + url,
    method,
    params,
    data: data,
    headers: {
      ...headers,
      userid: 'admin'
    },
    proto: requestTem
  })
}

export default {
  get: <T = any>(option: AxiosConfig) => {
    return request({ method: 'get', ...option }) as Promise<T>
  },
  post: <T = any>(option: AxiosConfig) => {
    return request({ method: 'post', ...option }) as Promise<T>
  },
  delete: <T = any>(option: AxiosConfig) => {
    return request({ method: 'delete', ...option }) as Promise<T>
  },
  put: <T = any>(option: AxiosConfig) => {
    return request({ method: 'put', ...option }) as Promise<T>
  },
  cancelRequest: (url: string | string[]) => {
    return service.cancelRequest(url)
  },
  cancelAllRequest: () => {
    return service.cancelAllRequest()
  }
}
