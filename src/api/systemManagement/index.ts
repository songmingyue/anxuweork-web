import request from '@/axios'
import { ServiceStatus } from '../dataPage'

export interface initDBSetting {
  dbHost: string
  dbName: string
  dbUser: string
  dbType: number
  dbPassword: string
}

export interface logSetting {
  logFilePath: string
}

export interface GetDbAndLogConfig extends ServiceStatus {
  data: DbAndLogConfigForm
}

export interface DbAndLogConfigForm {
  initDBSetting: initDBSetting
  logSetting: logSetting
}

export const getDbAndLogConfig = (): Promise<GetDbAndLogConfig> => {
  return request.get({
    url: '/Admin/Config/GetDbAndLogConfig'
  })
}

export const testDBConnection = (data: initDBSetting): Promise<ServiceStatus> => {
  return request.post({
    url: '/Admin/Config/TestDBConnection',
    data
  })
}
export const setDbAndLogConfig = (data: DbAndLogConfigForm): Promise<ServiceStatus> => {
  return request.post({
    url: '/Admin/Config/SetDbAndLogConfig',
    data
  })
}

export const getUpgradeScriptList = (): Promise<{ data: [] }> => {
  return request.get({
    url: '/Init/GetUpgradeScriptList'
  })
}
