import request from '@/axios'

export interface SmsQuery {
  currentPage: number
  pageSize: number
  accessionNumber?: string
  patientClass?: string
  serviceSectId?: string
  name?: string
  contactPhoneNo?: string
}

export interface DocQuery {
  // 主键
  id?: string
  // 就诊号
  accessionNumber?: string
  // 姓名
  name?: string
  // 医院名称
  organizationName?: string
  // 检查类型
  serviceSectID?: string
  // 就诊类别
  patientClass?: string
  // 文件类型
  TypeCodeName?: string
  // 手机号码
  contactPhoneNo?: string
  // 状态码
  resultStatusCode?: string
  // 检查时间开始
  observationDateStart?: string
  // 检查时间结束
  observationDateEnd?: string
  // 影像标志
  abnormalFlags?: string
  // 数据状态
  deleteFlag?: string
  // 页码
  currentPage: number
  // 行数
  pageSize: number
  lockFlag?: number
}

export interface DocData {
  id?: number
  name?: string
  sex?: string
  age?: string
  ageUnit?: string
  birthDate?: string
  contactPhoneNo?: string
  organizationName?: string
  accessionNumber?: string
  serviceSectID?: string
  patientClass?: string
  procedureName?: string
  fileRelativePath?: string
  serviceUID?: string
  mimeType?: string
  fileCreateTime?: string
  typeCode?: string
  deleteFlag?: string
  medRecNO?: string
  lockFlag: number
  organizationID?: string
  patientID?: string
  email?: string
  fileSize?: string // 注意：int64 在 JS 中可能超出 number 精度，常用 string 表示
  businessType?: string
  classCode?: string
  identityID?: string
  idCardNO?: string
  insuranceID?: string
  healthCardNO?: string
  observationUID?: string
  observationDate?: string
  resultDate?: string
  uploadTime?: string
  visitUID?: string
  mediaUID?: string
  fileUID?: string
  resultSeq?: string
  observationID?: string
  imp?: string
  gdt?: string
  resultStatusCode?: string
  pidAssigningAuthority?: string
  addressDetail?: string
  mediaName?: string
  path?: string
  preliminaryDate?: string
  requestDeptName?: string
  resultPrincipalName?: string
  resultAssistantName?: string
  dataSource?: string
  charges?: number
  payments?: number
  abnormalFlags?: string
  studyInstanceUID?: string
  lockReason?: string
  filmCount?: number
  digitalImageNeed?: string
  expr1?: string
  createdDate?: string
  modifiedDate?: string
}

export interface SmsItem {
  fileUid?: string
  accessionNumber?: string
  patientClass?: string
  serviceSectId?: string
  name?: string
  contactPhoneNo?: string
  uploadTime?: string
  createTime?: string
}

export const getSmsList = (data: SmsQuery): Promise<IResponse<SmsItem[]>> => {
  return request.post({
    url: 'smss/list', // 最终请求为 `/api/sms/list`
    data,
    requestTem: {
      requestTem: 'SMSSInputProto',
      responseTem: 'SMSSProto'
    }
  })
}

export const resetSmss = (data: SmsItem): Promise<IResponse<SmsItem[]>> => {
  return request.post({
    url: 'smss/reset', // 最终请求为 `/api/sms/list`
    data,
    requestTem: {
      requestTem: 'SMSSInputProto',
      responseTem: 'whitelist'
    }
  })
}

export const getoneSmss = (data: SmsItem): Promise<IResponse<SmsItem[]>> => {
  return request.post({
    data,
    url: 'smss/getone', // 最终请求为 `/api/sms/list`
    requestTem: {
      requestTem: 'SMSSInputProto',
      responseTem: 'SMSSProto'
    }
  })
}

// 病患查询
export const listDoc = (data: DocQuery): Promise<IResponse<DocData[]>> => {
  return request.post({
    url: 'doc/list', // 最终请求为 `/api/sms/list`
    data,
    requestTem: {
      requestTem: 'PatientInfoInputProto',
      responseTem: 'PatientInfoProto'
    }
  })
}

// 病患查询
export const deleteDoc = (data: DocQuery): Promise<IResponse<DocData[]>> => {
  return request.post({
    url: 'doc/delete', // 最终请求为 `/api/sms/list`
    data,
    requestTem: {
      requestTem: 'PatientInfoInputProto',
      responseTem: 'DocDBProto'
    }
  })
}
// 病患查询
export const updatelockDoc = (data: DocQuery): Promise<IResponse<DocData[]>> => {
  return request.post({
    url: 'doc/updatelock', // 最终请求为 `/api/sms/list`
    data,
    requestTem: {
      requestTem: 'PatientInfoInputProto',
      responseTem: 'DocDBProto'
    }
  })
}
