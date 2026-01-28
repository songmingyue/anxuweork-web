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

export interface FilmBoxListOrderInfo {
  columnName: string
  orderType: number
}

export interface FilmBoxListFilter {
  requestStartDate: string
  requestEndDate: string
  accessionNumber: string
  patientID: string
  dicomPeerId: string[]
  matchState: string
  printState: string
}

export interface FilmBoxListPageInfo {
  pageIndex: number
  pageSize: number
  count: number
}

export interface FilmBoxListQuery {
  orderInfo: FilmBoxListOrderInfo
  filmBox: FilmBoxListFilter
  pageInfo: FilmBoxListPageInfo
}

export interface FilmBoxResultItem {
  filmBoxID: string
  studyID: string
  printState: string
  matchState: string
  accessionNumber: string
  patientID: string
  callingAE: string
  requestTime: string
  examineType: string
  printer: string
  filmSize: string
  mediumType: string
  displayFormat: string
  filmOrientation: string
  filmBoxPath: string
  thumbnailString: string | null
  taskNo: number
  cloudFilmPaid: boolean
  autoPrint: boolean
  lastPrintTime: string | null
}

export interface GetFilmBoxList extends ServiceStatus {
  filmBoxResult: FilmBoxResultItem[]
  pageInfo: FilmBoxListPageInfo
}

export const getFilmBoxList = (data: FilmBoxListQuery): Promise<GetFilmBoxList> => {
  return request.post({
    url: '/Film/GetFilmBoxList',
    data
  })
}

export interface DicomPeerOption {
  text: string
  value: string
}

export interface DicomPeerDropDown extends ServiceStatus {
  dicomPeers: DicomPeerOption[]
}

export const getDicomPeerDropDown = (): Promise<DicomPeerDropDown> => {
  return request.get({
    url: '/Admin/Config/GetDicomPeerDropDown'
  })
}

//

export interface ExamPrintRestrict {
  accessionNumber: string
  flag: boolean
}

export const updateExamPrintRestrict = (data: ExamPrintRestrict): Promise<ServiceStatus> => {
  return request.post({
    url: '/Exam/UpdateExamPrintRestrict',
    data
  })
}

export interface UpdateFilmPaidTag {
  accessionNumberList: string[]
  paidTag: boolean
}

// 批量修改付费状态

export const updateFilmPaidTag = (data: UpdateFilmPaidTag): Promise<ServiceStatus> => {
  return request.post({
    url: '/Exam/UpdateFilmPaidTag',
    data
  })
}
// 重置配置
export const resetMatch = (data: string[]): Promise<ServiceStatus> => {
  return request.post({
    url: '/Film/ResetMatch',
    data
  })
}

// shanchu /Film/DeleteFilmList
export const deleteFilmList = (data: { filmBoxList: string[] }): Promise<ServiceStatus> => {
  return request.post({
    url: '/Film/DeleteFilmList',
    data
  })
}

export const deleteFilm = (data: { filmBoxID: string }): Promise<ServiceStatus> => {
  return request.post({
    url: '/Film/DeleteFilm',
    data
  })
}

// /Admin/Config/GetPrinterDropDown 获取打印机下拉列表
export interface PrinterDropDown extends ServiceStatus {
  printer: DicomPeerOption[]
}
export const getPrinterDropDown = (): Promise<PrinterDropDown> => {
  return request.get({
    url: '/Admin/Config/GetPrinterDropDown'
  })
}

export interface SetFilmboxPrinter {
  printerName: string
  printerID: string
  filmBoxIDList: string[]
}
// 修改打印机
export const setFilmboxPrinter = (data: SetFilmboxPrinter): Promise<ServiceStatus> => {
  return request.post({
    url: '/Film/SetFilmboxPrinter',
    data
  })
}

// 打印
export const printFilmBox = (data: { filmBoxIDList: string[] }): Promise<ServiceStatus> => {
  return request.post({
    url: '/Film/Print',
    data
  })
}

// 获取图片

export const getImageByFilmBox = (query: string): Promise<ServiceStatus> => {
  return request.get({
    url: '/Film/GetImageByFilmBox',
    requestTem: true,
    params: { filmBoxID: query }
  })
}

export interface FilmBoxInMatchManualMatch {
  matchState: string
  taskNo: any
  dicomPeerId: string
  accessionNumber: string
  endDate: string
  startDate: string
}

export interface FilmBoxInMatchPageInfo {
  pageIndex: number
  pageSize: number
}

export interface GetFilmBoxInMatchQuery {
  manualMatch: FilmBoxInMatchManualMatch
  pageInfo: FilmBoxInMatchPageInfo
}

export interface FilmBoxInMatchItem {
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
  taskNo: any
  width: number
  height: number
}

export interface GetFilmBoxInMatchResult extends ServiceStatus {
  film: FilmBoxInMatchItem[]
  pageInfo: FilmBoxListPageInfo
}

export const getFilmBoxInMatch = (
  data: GetFilmBoxInMatchQuery
): Promise<GetFilmBoxInMatchResult> => {
  return request.post({
    url: '/Film/GetFilmBoxInMatch',
    data
  })
}

export interface ExamStudyItem {
  studyID: string
  accessionNumber: string
  patientID: string
  patientSex: string
  patientName: string
  patientNameENG: string
  examinePart: string | null
  age: string
  examineType: string
  examineDate: string
  patientType: string
  cloudFilmPaid: boolean | null
  autoPrint: boolean | null
}

export interface GetExamByAccNumOrPatientIDResult extends ServiceStatus {
  study: ExamStudyItem[]
}

export const getExamByAccNumOrPatientID = (data: {
  accessionNumber: string
  patientID: string
}): Promise<GetExamByAccNumOrPatientIDResult> => {
  return request.get({
    url: '/Exam/GetExamByAccNumOrPatientID',
    params: data
  })
}
export const doManualMatch = (data: {
  accessionNumber: string
  filmBoxID: string
}): Promise<ServiceStatus> => {
  return request.post({
    url: '/Film/DoManualMatch',
    data
  })
}
