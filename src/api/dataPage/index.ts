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
  return request.get({
    url: '/Exam/UpdateExamPrintRestrict',
    params: data
  })
}
