import request from '@/axios'

export interface InputPrintLog {
  currentPage: number
  operateTime?: string
  oprerator?: string
  organizationID?: string
  pageSize: number
}

export interface DataPrintLog {
  // 来源（如：前端、后端、第三方等）
  sourceType: string
  // 操作者
  oprerator: string
  // 请求设备IP
  requestIP: string
  // 病人姓名
  patientName: string
  // 医院名称/机构名称
  organizationName: string
  // 操作时间，后端一般返回字符串时间
  operateTime: string
}

//
// 统计类型枚举
export enum TypeGain {
  Null = '', // 全部
  Exam = '1', // 检查
  Report = '2', // 报告
  Film = '3', // 胶片
  Image = '4' // 影像
}

// 可用于下拉选项
export const TypeGainOptions = [
  { label: '检查', value: TypeGain.Exam },
  { label: '报告', value: TypeGain.Report },
  { label: '胶片', value: TypeGain.Film },
  { label: '影像', value: TypeGain.Image }
]

export interface InputGainList {
  currentPage: number
  date: string | string[]
  organizationID: string
  pageSize: number
  type: TypeGain
}

export interface InputOperateList {
  currentPage: number
  date?: string
  organizationID?: string
  pageSize?: number
  type?: TypeGain
}

export interface UploadFailList {
  currentPage: number
  pageSize: number
  accessionNumber?: string
  examTimeRange?: string
}
export interface UploadFailOnce {
  accessionNumber?: string
  examTimeRange?: string
  examUID?: string
  fileUID?: string
  typeCode?: string
}

export interface UploadList {
  createTime: string
  organizationName: string
  type: number
  typeName: string
  uploadUID: string
}

export interface InputFailTask {
  // 检查开始时间，格式建议 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss
  examStartTime: string
  // 检查结束时间
  examEndTime: string
  // 检查号
  accessionNumber: string
  // 失败级别，可为空
  failLevel: string
  // 任务类型（可多选）
  taskType: string[]
  // 科室ID/服务分区ID
  serviceSectID: string
  // 插件名称
  pluginName: string
  // 当前页码
  currentPage: number
  pageSize: number
}

export interface FailTaskOnce {
  failureUID: string
  examUID: string
  fileUID: string
  accessionNumber: string
  examDate: string
  serviceSectID: string
  organizationID: string
  failReason: string
  failLink: string
  // 原始任务内容，后端提供为 JSON 字符串
  taskContent: string
  exceptionContent: string | null
  taskType: string | number | null
  pluginUID: string
  pluginName: string
  serviceUID: string
  failLevel: string
  taskMessage: string | null
  taskMessageExt1: string | null
  taskMessageExt2: string | null
  createTime: string
  lastUpdateTime: string
}
// 更新任务
export const getprintlog = (data: InputPrintLog): Promise<IResponse<DataPrintLog[]>> => {
  return request.post({
    url: 'check/getprintlog',
    data,
    requestTem: {
      requestTem: 'PrintLogInputProto',
      responseTem: 'PrintLogRequestDtoProto'
    }
  })
}

//

export const getGainList = (data: InputGainList): Promise<IResponse<DataPrintLog[]>> => {
  return request.post({
    url: 'log/getGainList',
    data,
    requestTem: {
      requestTem: 'GetGainRecordListInputProto',
      responseTem: 'GetGainRecordListOutProto'
    }
  })
}

export const getOperateList = (data: InputOperateList): Promise<IResponse<DataPrintLog[]>> => {
  return request.post({
    url: 'log/getOperateList',
    data,
    requestTem: {
      requestTem: 'GetOperateRecordListInputProto',
      responseTem: 'GetOperateRecordListOutputProto'
    }
  })
}

// 敏感日志管理
export interface InputSensitiveLog {
  currentPage: number
  pageSize: number
  operationType?: string
  operationLink?: string
  operationContent?: string
}

export interface SensitiveLogOnce {
  operationType: string
  operationLink: string
  operationContent: string
  operationIP: string
  operationUserUID: string
  operationAccount: string
  createTime: string
  lastUpdateTime: string
}

export const getUploadFailList = (data: UploadFailList): Promise<IResponse<UploadFailOnce[]>> => {
  return request.post({
    url: 'doc/GetUploadFailList',
    data,
    responseType: 'json'
  })
}

export const getUploadList = (data: InputOperateList): Promise<IResponse<UploadList[]>> => {
  return request.post({
    url: 'log/getUploadList',
    data,
    requestTem: {
      requestTem: 'GetUploadRecordListInputProto',
      responseTem: 'GetUploadRecordListOutputProto'
    }
  })
}

// 失败任务管理
export const getFailTaskList = (data: InputFailTask): Promise<IResponse<FailTaskOnce[]>> => {
  return request.post({
    url: 'doc/GetFailTaskList',
    data,
    responseType: 'json'
  })
}

// 敏感日志列表
export const getSensitiveLogList = (
  data: InputSensitiveLog
): Promise<IResponse<SensitiveLogOnce[]>> => {
  return request.post({
    url: 'doc/GetSensitiveLogList',
    data,
    responseType: 'json'
  })
}
// 插件名称
export const getFailTaskPluginName = (): Promise<IResponse<string[]>> => {
  return request.get({
    url: 'doc/GetFailTaskPluginName',
    responseType: 'json'
  })
}
