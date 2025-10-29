import request from '@/axios'
import { PageBase } from '../type'

export interface CheckInfoRow {
  id: string
  patientName: string
  gender: string
  age: number
  birthDay: string
  serviceSectID: string
  examItem: string
  checkArea: string
  medRecNO: string
  patientClass: string
  visitID: string
  organizationName: string
  requestOrgName: string
  requestDept: string
  regTime: string
  examTime: string
  examEndDate: string
  auditDate: string
  patientID: string
  accessionNumber: string
  abnormalFlags: string
  criticalValue: string
  consultationStatus: string
  ifHasImage: string
  examStatus: string
  examCode: string
  patientMasterID: string
  examUID: string
  resultStatus: string
  studyInstanceUID: string
  ifHasReport: string
  digitalimageneed: string
  organizationID: string
  pIDAssigningAuthority: string
  lockFlag: string
  examUploadFlag: string
  reportUploadFlag: string
  imageUploadFlag: string
  filmUploadFlag: string
  isInterconnectData: string
  displayAge: string
  isCanPrint: string
  qrCodeUrl: string
  examPushFlag: string
  reportPushFlag: string
  imagePushFlag: string
  filmPushFlag: string
  ifHasFilm: string
  ifReportUpload: string
  ifFilmUpload: string
  ifImageUpload: string
  relatedExamURL: string
  bed?: string
  clinicDiagnosis?: string
  outPatientID?: string
  pointOfCare?: string
  observationMethod?: string
  resultReviseName?: string
  reviseDate?: string
}

export interface CheckReportDetail {
  patientName: string
  gender: string // 如需更严格可用: '男' | '女' | '其他'
  age: number
  ageUnit: string // 若应为单位（岁/月/天），可改为: '岁' | '月' | '天'
  patientID: string
  medRecNO: string
  requestDept: string
  serviceSectID: string // 如 CT/MR/DR 等
  examItem: string
  examTime: string // 日期时间字符串，如 'YYYY/MM/DD HH:mm:ss'
  checkArea: string
  dicomView: string // 影像所见
  dicomConsultation: string // 影像诊断/会诊结论
  resultAssistantName: string // 报告医生
  resultPrincipalName: string // 审核医生
  resultDate: string // 报告时间
  auditDate: string // 审核时间
  organizationName: string
}
export interface CheckInfoQuery extends PageBase {
  examKey?: string
  examValue?: string
  name?: string
  start?: string | Date
  end?: string | Date
  dept?: string
}

export enum DeptType {
  ClinicDept = 'ClinicDept', // 门诊科室
  PointOfCare = 'PointOfCare' // 病区
}

export interface GetDeptName {
  deptType: DeptType
}

export enum PushStatusEnum {
  NotPushed = 0, // 未推送
  Pushed = 1 // 已推送
}

export interface PushStatus {
  examPushStatus: PushStatusEnum
  filmPushStatus: PushStatusEnum
  imagePushStatus: PushStatusEnum
  reportPushStatus: PushStatusEnum
}
// 查询检查信息列表
export const getcheckinfolist = (data: CheckInfoQuery): Promise<IResponse<CheckInfoRow[]>> => {
  return request.post({
    url: 'check/getcheckinfolist',
    data,
    requestTem: {
      requestTem: 'SearchInputProto',
      responseTem: 'CheckInfoDtoProto'
    }
  })
}
// 获取科室名称列表
export const getdeptname = (data: GetDeptName): Promise<IResponse<string[]>> => {
  return request.post({
    url: 'check/getdeptname',
    data,
    requestTem: {
      requestTem: 'DeptInfoProto',
      responseTem: 'DeptInfoProto'
    }
  })
}

// 获取推送状态
export const getPushStatus = (data: CheckInfoRow): Promise<IResponse<PushStatus>> => {
  return request.post({
    url: 'doc/GetPushStatus',
    responseType: 'json',
    data
  })
}

export const getdocstatus = (data: CheckInfoRow): Promise<IResponse<PushStatus>> => {
  return request.post({
    url: 'check/getdocstatus',
    requestTem: {
      requestTem: 'DocumentInputProto',
      responseTem: 'DocStatusProto'
    },
    data
  })
}
// 获取详细信息
export const getwrittenreport = (
  data: Partial<CheckInfoRow & { userInfo: any }>
): Promise<IResponse<CheckReportDetail[]>> => {
  return request.post({
    url: 'check/getwrittenreport',
    requestTem: {
      requestTem: 'WrittenInputProto',
      responseTem: 'WrittenReportProto'
    },
    data
  })
}
