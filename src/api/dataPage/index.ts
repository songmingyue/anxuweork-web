import request from '@/axios'

export interface ServiceStatus {
  desc: string | null
  status: number
}

export enum ServiceEmum {
  Running = 'Running',
  Stopping = 'Stopped'
}

export interface ServiceConfig extends ServiceStatus {
  serviceStatus: ServiceEmum
}

export interface DriverSpace {
  remainSpace: number
  totalSpace: number
}

export interface DriverInfo extends ServiceStatus {
  driverSpace: DriverSpace
}

export const stopServiceMsd = (): Promise<ServiceStatus> => {
  return request.post({
    url: '/Service/StopService'
  })
}

export const startServiceMsd = (): Promise<ServiceStatus> => {
  return request.post({
    url: '/Service/StartService'
  })
}

export const getServiceStateMsd = (): Promise<ServiceConfig> => {
  return request.post({
    url: '/Service/GetServiceState'
  })
}
// 获取总容量，可用空间
export const getDriverInfo = (): Promise<DriverInfo> => {
  return request.get({
    url: '/Home/GetDriverInfo'
  })
}

export interface FailedCount extends ServiceStatus {
  count: number
}

// 获取打印失败数量
export const getPrintFailedCountMsd = (): Promise<FailedCount> => {
  return request.get({
    url: '/Film/GetPrintFailedCount'
  })
}
// 获取匹配失败数量
export const getMatFailedCountMsd = (): Promise<FailedCount> => {
  return request.get({
    url: '/Film/GetMatFailedCount'
  })
}
// 获取云视图配置情况
export const getCloudViewConfig = (): Promise<FailedCount> => {
  return request.get({
    url: '/Admin/Config/GetCloudViewConfig'
  })
}
// 获取自动打印配置情况
export const getAutoPrintConfig = (): Promise<FailedCount> => {
  return request.get({
    url: '/Admin/Config/GetAutoPrintConfig'
  })
}

//
