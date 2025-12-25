import request from '@/axios'
import { PageBase } from '../type'

export interface CheckInfoRow {
  id?: string
  patientName?: string
  gender?: string
  age?: number
  birthDay?: string
  serviceSectID?: string
  examItem?: string
  checkArea?: string
  medRecNO?: string
  patientClass?: string
  visitID?: string
  organizationName?: string
  requestOrgName?: string
  requestDept?: string
  regTime?: string
  examTime?: string
  examEndDate?: string
  auditDate?: string
  patientID?: string
  accessionNumber?: string
  abnormalFlags?: string
  criticalValue?: string
  consultationStatus?: string
  ifHasImage?: string
  examStatus?: string
  examCode?: string
  patientMasterID?: string
  examUID?: string
  resultStatus?: string
  studyInstanceUID?: string
  ifHasReport?: string
  digitalimageneed?: string
  organizationID?: string
  pIDAssigningAuthority?: string
  lockFlag?: string
  examUploadFlag?: string
  reportUploadFlag?: string
  imageUploadFlag?: string
  filmUploadFlag?: string
  isInterconnectData?: string
  displayAge?: string
  isCanPrint?: string
  qrCodeUrl?: string
  examPushFlag?: string
  reportPushFlag?: string
  imagePushFlag?: string
  filmPushFlag?: string
  ifHasFilm?: string
  ifReportUpload?: string
  ifFilmUpload?: string
  ifImageUpload?: string
  relatedExamURL?: string
  bed?: string
  clinicDiagnosis?: string
  outPatientID?: string
  pointOfCare?: string
  observationMethod?: string
  resultReviseName?: string
  reviseDate?: string
  iDCardNo?: string
  editType?: number
  contactPhoneNO?: string
  lockReason?: string
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

/**
 * 检查各类文档/文件是否已生成或可用的状态标记
 * - 字段均为布尔值，true 表示已存在/可用，false 表示不存在/不可用
 */
export interface DocStatusProto {
  /** 是否存在结构化检查结果（ExamResult），通常代表系统内生成的结果文档 */
  examResultStatus: boolean
  /** 是否存在书写报告（WrittenReport），通常代表手写/文本型报告文档 */
  examWrittenStatus: boolean
  /** 是否存在胶片（Film）相关文件或记录 */
  examFilmStatus: boolean
  /** 是否存在影像（Image）文件（如 DICOM 影像等） */
  examImgStatus: boolean
}

export interface DocumentDtoProto {
  businessType: string // 业务类型
  businessTime: string // 业务时间
  classCode: string // 类别代码
  typeCode: string // 类型代码
  mimeType: string // MIME 类型
  fileSize: string // 文件大小
  fileCreateTime: string // 文件创建时间
  fileCreateUserID: string // 文件创建用户 ID
  fileCreateUserName: string // 文件创建用户名称
  originalFileName: string // 原始文件名
  title: string // 标题
  uploadTime: string // 上传时间
  dicomInfo: string // DICOM 信息
  fileRelativePath: string // 文件相对路径
  mediaName: string // 媒体名称
  pathType: string // 路径类型
  mediaHost: string // 媒体主机
  path: string // 路径
  base64url: any // Base64 URL（以字节形式存储）
  subDir: string // 子目录
  patientID: string // 病人 ID
  accessionNumber: string // 记录号
  serviceSectID: string // 服务部门 ID
  studyInstanceUID: string // 学习实例 UID
  organizationID: string // 机构 ID
  imgUrl: string // 图片 URL
  access_Token: string // 访问令牌
  examUID: string // 考试 UID
  resultSeq: string // 结果顺序
  imagingFinding: string // 影像发现
  imagingDiagnosis: string // 影像诊断
  resultStatusCode: string // 结果状态代码
  fileUID: string // 文件 UID
}

export interface DocumentListProto {
  document: DocumentProto
}
export interface DocumentProto {
  documentDtos: DocumentDtoProto[]
}
export interface RequestReportDetail {
  /** 姓名 */
  patientName?: string
  /** 性别 */
  gender?: '男' | '女' | '其他' | string
  /** 年龄（数值） */
  age?: number
  /** 年龄单位（当前数据是字符串“17”，若应为单位可改为：'岁' | '月' | '天'） */
  ageUnit?: string
  /** 病历号 */
  medRecNO?: string
  /** 检查部位/区域 */
  checkArea?: string
  /** 申请科室 */
  requestDept?: string
  /** 展示年龄（带单位或原样展示） */
  displayAge?: string
  otherClinicalInfo?: string // 其他临床信息
  attention?: string // 注意事项
  clinicDiagnosis?: string // 临床诊断
  symptom?: string // 病状体征
  reason?: string // 检查目的
  examItem?: string // 检查项目
  requestTime?: string // 申请时间
  requestDocName?: string // 申请医生
  placerOrderNO?: string // 申请单号
  bed?: string // 床号
  outPatientID?: string // 门诊号
  contactPhoneNO?: string // 联系电话
  patientClass?: string // 类型
  alternateVisitID?: string // 住院号
}

// 查询检查信息列表
export const getcheckinfolist = (data: CheckInfoQuery): Promise<IResponse<CheckInfoRow[]>> => {
  return request.post({
    url: 'check/alllist',
    data,
    requestTem: {
      requestTem: 'ExamInputProto',
      responseTem: 'DocDBProto'
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

export const getdocstatus = (data: CheckInfoRow): Promise<IResponse<DocStatusProto[]>> => {
  return request.post({
    url: 'check/getdocstatus',
    requestTem: {
      requestTem: 'DocumentInputProto',
      responseTem: 'DocStatusProto'
    },
    data
  })
}
export const getdoc = (
  data: Partial<CheckInfoRow & { userInfo: any } & { typeCode: string }>
): Promise<IResponse<DocumentListProto[]>> => {
  return request.post({
    url: 'check/getdoc',
    requestTem: {
      requestTem: 'DocumentInputProto',
      responseTem: 'DocumentListProto'
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

// 获取申请单详细信息
export const getrequest = (
  data: Partial<CheckInfoRow & { userInfo: any }>
): Promise<IResponse<RequestReportDetail>> => {
  return request.post({
    url: 'check/getrequest',
    requestTem: {
      requestTem: 'WrittenInputProto',
      responseTem: 'RequestReportDtoProto'
    },
    data
  })
}

// 手动更新
export const UpdatePatientInfo = (data: CheckInfoRow): Promise<IResponse<void>> => {
  return request.post({
    url: 'CommonData/UpdatePatientInfo',
    data,
    responseType: 'json'
  })
}

// 更新打印状态
export const pePrintStatus = (data: { examUID: string }): Promise<IResponse<void>> => {
  return request.post({
    url: 'doc/RePrintStatus',
    data,
    responseType: 'json'
  })
}

// 文件检查重采 plugin/resetBusinessStatus
export const resetBusinessStatus = (data: {
  accessionNumber?: string
  examUID?: string
  fileType: string
  ExamUIDList?: string[]
}) => {
  return request.post({
    url: 'plugin/resetBusinessStatus',
    requestTem: {
      requestTem: 'ResetBusinessStatusProto',
      responseTem: 'whitelist'
    },
    data
  })
}

// 检查信息重传
// /doc/upload
export const reUploadCheckInfo = (data: { examUID: string; type: string }) => {
  return request.post({
    url: 'doc/upload',
    responseType: 'json',
    data
  })
}

// 重置会诊标志
export const resetConsultationFlag = (data: { examUID: string }) => {
  return request.post({
    url: 'CommonData/ResetConsultationFlag',
    responseType: 'json',
    data
  })
}

// 批量重采
export const batchResetBusinessStatus = (data: { ExamUIDList: string[]; fileType: string }) => {
  return request.post({
    url: 'plugin/batchResetBusinessStatus',
    responseType: 'json',
    data
  })
}

export const getValidPrintlist = (data: {
  examUID: string
}): Promise<IResponse<{ examUID: string }>> => {
  return request.post({
    url: 'check/getValidPrintlist',
    data,
    requestTem: {
      requestTem: 'PrintInputProto',
      responseTem: 'PrintInputProto'
    }
  })
}

// province  "pageApply" // 默认 "province" // 互联互通
export const apiGetrecordexam = (
  data: Partial<CheckInfoRow & { userInfo: any } & { applyMethod: string }>
): Promise<IResponse<[]>> => {
  return request.post({
    url: 'check/getrecordexam',
    data,
    requestTem: {
      requestTem: 'PersonalCheckRcdInputProto',
      responseTem: 'PersonalCheckRcdDtoProto'
    }
  })
}

export const upDownload = (data: any) => {
  return request.post({
    url: 'doc/ExportExamHZRMYY',
    data,
    responseType: 'arraybuffer'
  })
}
// 锁定

export const lockcheck = (data: { examUID: string; isLock: boolean; lockReason?: string }) => {
  return request.post({
    url: 'check/lockcheck',
    data,
    responseType: 'json'
  })
}

// 取消star
export const cancelPreset = (data: any): Promise<IResponse<void>> => {
  return request.post({
    url: 'check/cancelpreset',
    data,
    requestTem: {
      requestTem: 'UserQuerySetMstProto',
      responseTem: 'whitelist'
    }
  })
}

// 取消star
export const updatepresetdefaul = (data: any): Promise<IResponse<void>> => {
  return request.post({
    url: 'check/updatepresetdefaul',
    data,
    requestTem: {
      requestTem: 'UserQuerySetMstDtoProto',
      responseTem: 'whitelist'
    }
  })
}
