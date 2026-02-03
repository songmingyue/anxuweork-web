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
  cleanDiskType: 0 | 1 | 2
  diskLimit: number | null
  reservedDate: number
}

export interface PacsConfig {
  webPacsConfigID: string
  pacsAddress: string | null
  hospitalID: string
  systemUserID: string | null
  isEnabled: boolean
  createTime: string
  allowCloudViewPrinted: boolean | null
  reportPrintPublish: any
  filmPrintPublish: boolean
  filmPrintConsumerConfig: FilmPrintConsumerConfig[]
  compressionRatio: number
  delFlag: string
  keepChargeStatus: boolean
  reportPrintNotify: boolean
  matchDoneNotifyRis: boolean
  matchDoneNotifyRisAddress: any
}

export interface FilmPrintConsumerConfig {
  publishType: number
  syncParam: string
}
export interface AdminConfig {
  parameterConfig?: ParameterConfig
  printerConfig?: any[]
  dicomPeer?: DicomPeer[]
  diskConfig?: DiskConfig
  userConfig?: UserConfig[] | any
  pacsConfig?: PacsConfig
  limitAutomaticPrint?: boolean
  defaultAutoPrintRestrict?: boolean
}

export interface DicomPeer {
  /** DICOM对等节点唯一标识 */
  dicomPeerID?: string
  /** 主机名称 */
  hostName: string
  /** 对等节点描述 */
  peerDes: string
  /** AE Title（应用实体标题），DICOM网络中节点的名称，最多16个字符[5](@ref) */
  aeTitle: string
  /** 端口号 */
  port: number
  /** 是否自动打印 */
  autoPrint: boolean
  /** 默认打印机ID */
  defaultPrinterID: string
  /** 默认打印机名称 */
  defaultPrinter: string
  /** 是否包含检查信息 */
  containsExamInfo: boolean
  /** 检查科室信息 */
  examSection: any | null
  /** DICOM节点信息 */
  dicomNode: any | null
  /** 部门代码 */
  departmentCode: string
  /** 部门名称 */
  departmentName: string
  /** 匹配延迟时间（分钟） */
  matchDelayMinutes: number
  /** 匹配样本列表 */
  matchSamples: MatchSample[]
  /** 模态列表（如MR、CT等） */
  modalities: string[]
}

export interface MatchStratege {
  matchLatestExam: boolean
  /** 最大检查时间差（由后端定义单位，如分钟/小时） */
  maxExamDiff: number
}

export interface MatchMethodSpliterMatch {
  spliter: string
  count: number
}

export interface MatchMethodRegexMatch {
  regex: string
}

export interface MatchMethodSimiliarMatch {
  rate: number
}

export interface MatchMethodConfig {
  /** 匹配类型（由后端定义枚举） */
  matchType: number
  spliterMatch: MatchMethodSpliterMatch
  regexMatch: MatchMethodRegexMatch
  similiarMatch: MatchMethodSimiliarMatch
}

export interface MatchImageProcessConfig {
  magnification: number
  /** 旋转（由后端定义枚举/角度） */
  rotate: number
  contrastEnhangce: number
  isReverse: boolean
  /** 二值化类型（由后端定义枚举） */
  binaryzationType: number
  threshold: number
}

export interface MatchResultProcessItem {
  /** 处理类型（由后端定义枚举） */
  processType: number
  configString: string
}

export interface MatchOcrMethodConfig {
  x: number
  y: number
  width: number
  height: number
  /** 识别类型（由后端定义枚举） */
  recognizeType: number
  /** 行号/行数（由后端定义） */
  rowNumber: number
  imageProcess: MatchImageProcessConfig
  matchMethod: MatchMethodConfig
  resultProcess: MatchResultProcessItem[]
}

export interface MatchSample {
  filmSampleID: string
  dicomPeerID: string
  sampleName: string
  filmSize: string
  filmOrientation: string
  filmSamplePath: string
  matchRate: number
  /** 注意：后端字段名就是 matchStratege（拼写如此） */
  matchStratege: MatchStratege
  accMatchMethod: MatchOcrMethodConfig
  patientIDMatchMethod: MatchOcrMethodConfig
  patientNameMatch: MatchOcrMethodConfig
}

export interface UserConfig {
  userID: string
  account: string
  userName: string
  password: string
  dateCreated: string
  departmentCode: string
  permission: number | string | null
  role: string
}

export interface RegisterUserForm {
  userID?: string
  account: string
  userName: string
  password: string
  dateCreated?: string
  departmentCode: string
  permission: string
  role: string
}

export interface ResetPasswordForm {
  account: string
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

export interface UserPermissionList {
  text: string
  value: number
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
  return request.get({
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

export const getUserPermissionList = (): Promise<UserPermissionList[]> => {
  return request.get({
    url: '/Admin/Config/GetUserPermissionList'
  })
}
// 新增用户

export const registerUser = (data: RegisterUserForm): Promise<ServiceStatus> => {
  return request.post({
    url: '/Admin/Register/RegisterUser',
    data
  })
}
// 重置密码

export const resetPassword = (data: ResetPasswordForm): Promise<ServiceStatus> => {
  return request.post({
    url: '/Admin/Config/ResetPassword',
    data
  })
}
// 获取科室
export interface DepartmentConfig extends ServiceStatus {
  data: DepartmentDetailItem[]
}

export interface DepartmentDetailItem {
  departmentCode: string
  examType: ExamTypeItem[]
}
export interface ExamTypeItem {
  isNew: boolean
  isSelect: boolean
  text: string
  value: string
}
export const getDepartmentConfig = (): Promise<DepartmentConfig> => {
  return request.get({
    url: '/Admin/Config/GetDepartmentConfig'
  })
}

export interface DepartmentItemResponse extends ServiceStatus {
  data: DepartmentItem[]
}

export interface DepartmentItem {
  departmentCode: string
  departmentID: string
  departmentName: string
  hospitalID: string
}

export const getDepartment = (): Promise<DepartmentItemResponse> => {
  return request.get({
    url: '/Home/GetDepartment'
  })
}

export interface TableConfig extends ServiceStatus {
  data: TableConfigItem[]
}

export interface TableConfigItem {
  order: number
  label: string
  prop: string
  selected: boolean
  sort: boolean
  width: string
  fix: boolean
}

export const getTableConfig = (): Promise<TableConfig> => {
  return request.get({
    url: '/Admin/Config/GetTableConfig?tableName=ExamList'
  })
}

export interface SaveTableConfig {
  table: TableConfigItem[]
  tableName: string
}
export const saveTableConfig = (data: SaveTableConfig): Promise<ServiceStatus> => {
  return request.post({
    url: '/Admin/Config/SaveTableConfig',
    data
  })
}

export const save = (data: SaveTableConfig): Promise<ServiceStatus> => {
  return request.post({
    url: '/Admin/Config/Save',
    data
  })
}

export const saveDepartmentConfig = (data: DepartmentDetailItem): Promise<ServiceStatus> => {
  return request.post({
    url: '/Admin/Config/SaveDepartmentConfig',
    data
  })
}

export const verifyEngineerPassword = (data: { password: string }): Promise<ServiceStatus> => {
  return request.post({
    url: '/Admin/Config/VerifyEngineerPassword',
    data
  })
}

export interface PrintPublisherItem {
  data: UserPermissionList[]
  desc: string
  status: number
}

export const getPrintPublisher = (): Promise<PrintPublisherItem> => {
  return request.get({
    url: '/Admin/Config/GetPrintPublisher'
  })
}

export interface PrintConnection {
  ip: string
  port: number
  callingAE: string
  calledAE: string
}

export const testPrintConnection = (data: PrintConnection): Promise<PrintPublisherItem> => {
  return request.post({
    url: '/Admin/Config/TestPrintConnection',
    data
  })
}

// Film/GetFilmBoxInSample
export interface FilmBoxInSampleManualMatch {
  /** 打印时间筛选（由后端定义取值，如 0/1） */
  printTime?: number
  /** 匹配状态（通常为字符串枚举，如 "0"/"1"） */
  matchState?: string
  /** 请求设备 / Calling AE */
  callingAE?: string
  /** 任务号（查询输入通常为字符串） */
  taskNo?: string
}

export interface FilmBoxInSamplePageInfo {
  pageIndex: number
  pageSize: number
  count: number
}

export interface GetFilmBoxInSampleRequest {
  manualMatch: FilmBoxInSampleManualMatch
  pageInfo: FilmBoxInSamplePageInfo
}

export interface FilmBoxInSampleItem {
  filmBoxID: string
  filmImagePath: string
  requestTime: string
  accessionNumber: string | null
  filmSize: string
  callingAE: string
  mediumType: string
  peerDes: string | null
  displayFormat: string
  filmOrientation: string
  taskNo: number
  width: number
  height: number
}

export interface GetFilmBoxInSampleResponse extends ServiceStatus {
  film: FilmBoxInSampleItem[]
  pageInfo: FilmBoxInSamplePageInfo
}

export const getFilmBoxInSample = (
  data: GetFilmBoxInSampleRequest
): Promise<GetFilmBoxInSampleResponse> => {
  return request.post({
    url: '/Film/GetFilmBoxInSample',
    data
  })
}

export interface GetOCRResultRequest {
  filmBoxID: string
  matchMethod: MatchOcrMethodConfig
}

export interface GetOCRResultResponse extends ServiceStatus {
  result: string
}

export const getOCRResult = (data: GetOCRResultRequest): Promise<GetOCRResultResponse> => {
  return request.post({
    url: '/Film/GetOCRResult',
    data
  })
}

export interface GetTemplatePreview extends ServiceStatus {
  filmSource: string
}

export const getTemplatePreview = (data: GetOCRResultRequest): Promise<GetTemplatePreview> => {
  return request.post({
    url: '/Film/GetTemplatePreview',
    data
  })
}
