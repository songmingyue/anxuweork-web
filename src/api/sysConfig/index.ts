import request from '@/axios'
import { PageBase } from '../type'

export interface ServiceConfig {
  dataSource?: string
  dbInstallType?: string
  dbType?: string
  initialCatalog?: string
  password?: string
  userId?: string
  lsSlave?: string
  hostPort?: string
}

// 数据库脚本配置（getScriptList 返回项）
export interface ScriptConfig {
  createDate: string // 创建时间，示例：2025/4/9 11:32:00
  creator: string // 创建人
  programVersion: string // 程序版本
  script?: string // 兼容字段：有的接口用 script 存内容
  scriptContent?: string // 脚本内容
  scriptDescription: string // 脚本描述
  scriptID?: number // 脚本ID（数字）
  scriptId?: number // 兼容另一种命名
  scriptMemo: string // 备注
  scriptType: 'incremental' | string // 脚本类型（已知 incremental，保留扩展）
  select?: boolean // 选择状态
}

export interface LogConfig {
  appendToFile?: string
  datePattern?: string
  file?: string
  layoutPattern?: string
  level?: string
  maxSizeRollBackups?: string
  maximumFileSize?: string
  rollingStyle?: string
}

export interface TokenConfig {
  tokenServer?: string
  organizationID?: string
  accessToken?: string
}

export interface GetServiceInfo extends PageBase {
  retrieveAETitle?: string
  serviceAddress?: string
}

export interface ServiceAddress {
  aeTitleOrgName?: string
  retrieveAETitle?: string
  weight?: string
  serviceAddress?: string
  status?: number
  actions?: string
}

export interface CreateAddress {
  retrieveAETitle: string
  serviceAddress: string
  weight: number
  aeTitleOrgName?: string
  organizationID?: string
  status?: number
}

export interface DicomScpInfo {
  orgCode?: string
  host?: string
  port?: string
  calledAE?: string
  callingAE?: string
  isDefault?: boolean
  id?: string
}

export interface DicomScpInfoResponse extends PageBase {
  orgCode?: string
}
// 数据库配置
export const getservicelist = (): Promise<IResponse<ServiceConfig[]>> => {
  return request.post({
    url: 'systeminit/getdbconfig',
    requestTem: {
      requestTem: 'DBConfigDtoProto',
      responseTem: 'DBConfigDtoProto'
    }
  })
}

// 编辑数据库配置
export const editservicelist = (data: ServiceConfig): Promise<IResponse<void>> => {
  return request.post({
    url: 'systeminit/editdbconfig',
    requestTem: {
      requestTem: 'DBConfigDtoProto',
      responseTem: 'whitelist'
    },
    data
  })
}

// 获取数据库脚本
export const getScriptList = (): Promise<IResponse<ScriptConfig[]>> => {
  return request.post({
    url: 'systeminit/getScript',
    requestTem: {
      requestTem: 'ScriptMstProto',
      responseTem: 'ScriptMstProto'
    }
  })
}

// 获取数据库脚本
export const executeScriptBatch = (data: {
  scriptIDs: string
}): Promise<IResponse<ScriptConfig[]>> => {
  return request.post({
    url: 'systeminit/executeScriptBatch',
    requestTem: {
      requestTem: 'ScriptMstBatchProto',
      responseTem: 'whitelist'
    },
    data
  })
}
// 获取log配置
export const getLogConfig = (): Promise<IResponse<LogConfig[]>> => {
  return request.post({
    url: 'systeminit/getlogconfig',
    requestTem: {
      requestTem: 'ParamAppenderProto',
      responseTem: 'ParamAppenderProto'
    }
  })
}

// 编辑log配置
export const editLogConfig = (data: LogConfig): Promise<IResponse<void>> => {
  return request.post({
    url: 'systeminit/editlogconfig',
    requestTem: {
      requestTem: 'ParamAppenderProto',
      responseTem: 'ParamAppenderProto'
    },
    data
  })
}
// 获取token配置
export const getTokenConfig = (): Promise<IResponse<TokenConfig[]>> => {
  return request.post({
    url: 'systeminit/gettokenconfig',
    requestTem: {
      requestTem: 'TokenInfoProto',
      responseTem: 'TokenInfoProto'
    }
  })
}
// 编辑token配置
export const editTokenConfig = (data: TokenConfig): Promise<IResponse<void>> => {
  return request.post({
    url: 'systeminit/edittokenconfig',
    requestTem: {
      requestTem: 'TokenInfoProto',
      responseTem: 'TokenInfoProto'
    },
    data
  })
}

export const getServiceAddressInfo = (data: TokenConfig): Promise<IResponse<void>> => {
  return request.post({
    url: 'Data/GetServiceAddressInfoList',
    requestTem: {
      requestTem: 'TokenInfoProto',
      responseTem: 'TokenInfoProto'
    },
    data
  })
}
// wado管理列表

export const GetServiceAddressInfoList = (
  data: GetServiceInfo
): Promise<IResponse<ServiceAddress[]>> => {
  return request.post({
    url: 'Data/GetServiceAddressInfoList',
    data,
    responseType: 'json'
  })
}
// 新增/编辑 wado 服务器地址
export const addOrEditServiceAddress = (
  data: CreateAddress
): Promise<IResponse<{ time1: boolean }>> => {
  return request.post({
    url: 'Data/AddOrEditServiceAddress',
    data,
    responseType: 'json'
  })
}

export const deleteServiceAddress = (data: ServiceAddress) => {
  return request.post({
    url: 'Data/DeleteServiceAddress',
    data,
    responseType: 'json'
  })
}

// scp设备管理
export const GetDicomScpInfoList = (
  data: DicomScpInfoResponse
): Promise<IResponse<DicomScpInfo[]>> => {
  return request.post({
    url: 'Data/GetDicomScpInfoList',
    data,
    responseType: 'json'
  })
}

// 新建编辑scp设备
export const addOrUpdateDicomScpInfo = (data: DicomScpInfo): Promise<IResponse<[]>> => {
  return request.post({
    url: 'Data/AddOrUpdateDicomScpInfo',
    data,
    responseType: 'json'
  })
}

// 删除scp设备
export const deleteDicomScpInfo = (id: string): Promise<IResponse<void>> => {
  return request.post({
    url: 'Data/DeleteDicomScpInfo',
    data: { id },
    responseType: 'json'
  })
}
