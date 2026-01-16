import request from '@/axios'
import { ServiceStatus } from '../dataPage'

export interface MatchResetSetting {
  isEnabled: boolean
  matchResetTime: number
  resetInterval: number
}

export interface MatchPublisherItem {
  publishType: number
  syncParam: string
}

export interface MatchPublishSetting {
  isEnabled: boolean
  publisher: MatchPublisherItem[]
}

export interface ParameterConfig {
  aeTitle: string
  port: number
  storagePath: string
  matchDBType: number
  matchHostName: string | null
  matchDBName: string | null
  matchDBUser: string
  matchDBPWD: string
  matchViewName: string | null
  matchResetSetting: MatchResetSetting
  matchPublishSetting: MatchPublishSetting
}

export interface DiskConfig {
  cleanDiskType: number
  diskLimit: number | null
  reservedDate: number
}

export interface PacsConfig {
  webPacsConfigID: string
  pacsAddress: string | null
  hospitalID: string
  systemUserID: string | null
  isEnabled: boolean | null
  createTime: string
  allowCloudViewPrinted: boolean | null
  reportPrintPublish: any
  filmPrintPublish: boolean
  filmPrintConsumerConfig: any[]
  compressionRatio: number
  delFlag: string
}

export interface AdminConfig {
  parameterConfig?: ParameterConfig
  printerConfig?: any[]
  dicomPeer?: any[]
  diskConfig?: DiskConfig
  userConfig?: any[]
  pacsConfig?: PacsConfig
  limitAutomaticPrint?: boolean
  defaultAutoPrintRestrict?: boolean
}

export interface GetAdminConfig extends ServiceStatus {
  adminConfig: AdminConfig
}

interface PaperSizeConfig {
  filmSize: string | null
  paperSize: string
  width: number
  height: number
}

export interface GetDefaultPaperSizeMappings extends ServiceStatus {
  paperSizeConfigs: PaperSizeConfig[]
}

export interface TestForm {
  dbName: string
  dbPassword: string
  dbType: number
  dbUser: string
  hostName: string
  viewName: string
}

export interface MatchSettingsForm {
  matchDBType: number
  matchHostName: string
  matchDBName: string
  matchDBUser: string
  matchDBPWD: string
  matchViewName: string
  isEnabled: boolean
  matchResetTime: number
  resetInterval: number
}

export const DbTypeList = [
  { label: 'MySql', value: 0 },
  { label: 'SqlServer', value: 1 },
  { label: 'Oracle', value: 2 }
]

export const getAdminConfig = (): Promise<GetAdminConfig> => {
  return request.get({
    url: '/Admin/Config/GetAdminConfig'
  })
}
// 默认值
export const getDefaultPaperSizeMappings = (): Promise<GetDefaultPaperSizeMappings> => {
  return request.post({
    url: '/Admin/Config/GetDefaultPaperSizeMappings'
  })
}
export const CheckPort = (params: { port: number }): Promise<ServiceStatus> => {
  return request.get({
    url: '/Admin/Config/CheckPort',
    params
  })
}

export const testDBConnection = (data: TestForm): Promise<ServiceStatus> => {
  return request.post({
    url: '/Admin/Config/TestDBConnection',
    data
  })
}
