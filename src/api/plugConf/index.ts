import request from '@/axios'
import { PageType } from '../type'

export interface ServiceConfig {
  ifEnable: boolean
  serviceName: string
  serviceUID?: string
}

export interface Servicemaplist {
  configVersion: string
  ifSupportCheck: boolean
  ifTriggerByDate: string
  ifTriggerByDay: string
  ifTriggerByTime: string
  pluginName: string
  pluginUID: string
  serviceUID: string
  pluginServiceMapUID: string
  taskFieldValue: string
  triggerInternal: number
  pluginConfigKeyValue: string
  pluginConfigValues: string
  pluginRule: string
}

export interface PresetModal {
  querySeq?: number
  queryType: string
  userUID?: string
  name: string
  queryCondition: string
  sortNO?: string
  defaultFlag?: string // 1star 0 unstar
  publicFlag?: string
  userInfo?: any
}

export interface Checkpluginservicemap {
  configVersion: string
  pluginConfigKeyValue: string
  pluginConfigValues?: string
  pluginName: string
  pluginUID: string
  serviceUID: string
}

// 获取服务
export const getservicelist = (data: PageType): Promise<IResponse<ServiceConfig[]>> => {
  return request.post({
    url: 'plugin/getservicelist',
    data,
    requestTem: {
      requestTem: 'ServiceInputProto',
      responseTem: 'ServiceOutputProto'
    }
  })
}
// 修改服务状态
export const disableService = (data: ServiceConfig): Promise<IResponse<null>> => {
  return request.post({
    url: 'plugin/disablepluginService',
    data,
    requestTem: {
      requestTem: 'ServiceOutputProto',
      responseTem: 'whitelist'
    }
  })
}

// 创建服务
export const createpluginService = (data: ServiceConfig): Promise<IResponse<null>> => {
  return request.post({
    url: 'plugin/createpluginService',
    data,
    requestTem: {
      requestTem: 'ServiceOutputProto',
      responseTem: 'whitelist'
    }
  })
}

// 修改服务
export const editpluginService = (data: ServiceConfig): Promise<IResponse<null>> => {
  return request.post({
    url: 'plugin/editpluginService',
    data,
    requestTem: {
      requestTem: 'ServiceOutputProto',
      responseTem: 'whitelist'
    }
  })
}

// 删除
export const deletepluginService = (data: ServiceConfig): Promise<IResponse<null>> => {
  return request.post({
    url: 'plugin/deletepluginService',
    data,
    requestTem: {
      requestTem: 'ServiceOutputProto',
      responseTem: 'whitelist'
    }
  })
}

// 服务下任务列表

export const getpluginservicemaplist = (
  data: ServiceConfig
): Promise<IResponse<Servicemaplist[]>> => {
  return request.post({
    url: 'plugin/getpluginservicemaplist',
    data,
    requestTem: {
      requestTem: 'ServiceOutputProto',
      responseTem: 'PluginServiceMapProto'
    }
  })
}

export const getallpluginlist = (): Promise<IResponse<Servicemaplist[]>> => {
  return request.post({
    url: 'plugin/getallpluginlist',
    requestTem: {
      requestTem: 'PluginProto',
      responseTem: 'PluginProto'
    }
  })
}
// 新增模板
export const addpreset = (data: PresetModal): Promise<IResponse<[]>> => {
  return request.post({
    url: 'check/addpreset',
    data,
    requestTem: {
      requestTem: 'UserQuerySetMstDtoProto',
      responseTem: 'whitelist'
    }
  })
}
// 编辑模板
export const updateplugindefault = (data: PresetModal): Promise<IResponse<[]>> => {
  return request.post({
    data,
    url: 'plugin/updateplugindefault',
    requestTem: {
      requestTem: 'UserQuerySetMstDtoProto',
      responseTem: 'whitelist'
    }
  })
}
// 自检
export const checkpluginservicemap = (data: Checkpluginservicemap): Promise<IResponse<[]>> => {
  return request.post({
    data,
    url: 'plugin/checkpluginservicemap',
    requestTem: {
      requestTem: 'PluginServiceMapProto',
      responseTem: 'whitelist'
    }
  })
}

// 停用启用
export const disablepluginservicemap = (data: Checkpluginservicemap): Promise<IResponse<[]>> => {
  return request.post({
    data,
    url: 'plugin/disablepluginservicemap',
    requestTem: {
      requestTem: 'PluginServiceMapProto',
      responseTem: 'whitelist'
    }
  })
}
// 停用启用
export const editpluginservicemap = (data: Checkpluginservicemap): Promise<IResponse<[]>> => {
  return request.post({
    data,
    url: 'plugin/editpluginservicemap',
    requestTem: {
      requestTem: 'PluginServiceMapProto',
      responseTem: 'whitelist'
    }
  })
}
// 删除
export const deletepluginservicemap = (data: Checkpluginservicemap): Promise<IResponse<[]>> => {
  return request.post({
    data,
    url: 'plugin/deletepluginservicemap',
    requestTem: {
      requestTem: 'PluginServiceMapProto',
      responseTem: 'whitelist'
    }
  })
}

// 创建
export const createpluginservicemap = (data: Checkpluginservicemap): Promise<IResponse<[]>> => {
  return request.post({
    data,
    url: 'plugin/createpluginservicemap',
    requestTem: {
      requestTem: 'PluginServiceMapProto',
      responseTem: 'whitelist'
    }
  })
}
