import request from '@/axios'
import { TableList } from '@/store/modules/workStation'
import { Data } from '../common'
export interface DicomPeerOption {
  text: string
  value: string
}
export interface ServiceMsd {
  count: number
  desc: string | null
  status: number
}

export interface TableListRequest {
  desc: string | null
  status: number
  data: TableList[]
}

export interface ExamInfo {
  medRecNo: string
  patientID: string
  accessionNumber: string
  examType: string[]
  patientType: string[]
  areaNo: string[]
  patientName: string
  hasFilm: any
  isPrinted: any
  dicomPeerIDList: string[]
  reportExists: any
  reportPrinted: any
  cloudFilmPaid: any
  examStartDate: string
  examEndDate: string
  dateRange?: string[]
}

export interface PageInfo {
  pageIndex: number
  pageSize: number
}

export interface OrderInfo {
  columnName: string
  orderType: number
}

export interface ExamListRequestBody {
  examInfo: ExamInfo
  pageInfo: PageInfo
  orderInfo: OrderInfo
}

export interface PageInfoResult {
  pageIndex: number
  pageSize: number
  count: number
}

export interface FilmResultItem {
  filmBoxID: string
  printState: string
  matchState: string
  accessionNumber: string
  patientID: string
  callingAE: string
  requestTime: string
  printer: string
  filmSize: string
  mediumType: string
  displayFormat: string
  filmOrientation: string
  filmBoxPath: string
  taskNo: number
  cloudFilmPaid: boolean
  autoPrint: boolean
  lastPrintTime: string
  thumbnailString: string
}

export interface TExamResult {
  matchState: number
  accessionNumber: string
  patientID: string
  patientName: string
  patientSex: string
  age: string
  cloudFilmPaid: boolean
  examineType: string
  examinePart: string
  examineItem: string
  examineDate: string
  patientType: string
  resultStatus: string
  medRecNo: string
  areaNo: string
  reportExists: boolean
  reportPrinted: boolean
  idNumber: string
  contactPhoneNO: string
  filmResult: FilmResultItem[]
  autoPrint: boolean
  printRestrict?: boolean
  reportResult?: unknown
}

export interface ExamListResponse {
  examResult: TExamResult[]
  pageInfo: PageInfoResult
  status: number
  desc: string | null
}

export const getTableConfig = (): Promise<TableListRequest> => {
  return request.get({
    url: 'Admin/Config/GetTableConfig',
    params: {
      tableName: 'ExamList'
    }
  })
}

export const getTableConfigDialog = (): Promise<TableListRequest> => {
  return request.get({
    url: 'Admin/Config/GetTableConfig',
    params: {
      tableName: 'ManualMatchExamList'
    }
  })
}
// 获取失败数量
export const getMatFailedCount = (): Promise<{
  count: number
  status: number
}> => {
  return request.get({
    url: 'Film/GetMatFailedCount'
  })
}

// /Exam/GetExamList
export const getExamList = (data: ExamListRequestBody): Promise<ExamListResponse> => {
  return request.post({
    url: 'Exam/GetExamList',
    data
  })
}

// Admin/Config/GetCloudViewConfig
// 是否展示付费按钮
export const getCloudViewConfig = (): Promise<{
  allowViewPrintedFilmSwitch: boolean
  status: number
}> => {
  return request.get({
    url: 'Admin/Config/GetCloudViewConfig'
  })
}

// Admin/Config/GetAutoPrintConfig
export const GetAutoPrintConfig = (): Promise<{
  data: boolean
  status: number
  desc: string | null
}> => {
  return request.get({
    url: 'Admin/Config/GetAutoPrintConfig'
  })
}

// Exam/UpdateExamPrintRestrict
// 限制打印是false 解除限制是true
export const updateExamPrintRestrict = (data: {
  accessionNumber: string
  flag: boolean
}): Promise<{
  status: number
  desc: string | null
}> => {
  return request.post({
    url: 'Exam/UpdateExamPrintRestrict',
    data
  })
}

// Exam/UpdateFilmPaidTag
// 胶片付费状态修改
export const updateFilmPaidTag = (data: {
  accessionNumberList: string[]
  paidTag: boolean
}): Promise<{
  status: number
  desc: string | null
}> => {
  return request.post({
    url: 'Exam/UpdateFilmPaidTag',
    data
  })
}

// Admin/Config/GetAreaNoDropdown
export const getAreaNoDropdown = (): Promise<{
  data: Data[]
  status: number
  desc: string | null
}> => {
  return request.get({
    url: 'Admin/Config/GetAreaNoDropdown'
  })
}

// Admin/Config/GetDWDeleteFilmSetting 干啥的暂时不知道
export const getDWDeleteFilmSetting = (): Promise<{
  data: boolean
  status: number
  desc: string | null
}> => {
  return request.get({
    url: 'Admin/Config/GetDWDeleteFilmSetting'
  })
}

export interface GetReportListByAccNum {
  examUID: string
  reportImg: string[]
  status: number
}

// Report/GetReportListByAccNum
export const getReportListByAccNum = (data: {
  accessionNumber: string
}): Promise<GetReportListByAccNum> => {
  return request.post({
    url: 'Report/GetReportListByAccNum',
    data
  })
}
// Film/DeleteFilm
export const deleteFilm = (data: {
  filmBoxID: string
}): Promise<{
  status: number
}> => {
  return request.post({
    url: 'Film/DeleteFilm',
    data
  })
}
// Film/GetImageByFilmBox
export const getImageByFilmBox = (filmBoxID: string): Promise<ArrayBuffer> => {
  return request.get({
    url: 'Film/GetImageByFilmBox',
    params: {
      filmBoxID
    },
    requestTem: true
  })
}

export interface printResult {
  filmBoxID: string
  result: number
}

export interface PrintFilmResponse {
  printResult: printResult[]
  status: number
}

// 打印胶片
export const printFilmMsd = (data: { filmBoxIDList: string[] }): Promise<PrintFilmResponse> => {
  return request.post({
    url: 'Film/Print',
    data
  })
}

export interface PrinterList {
  text: string
  value: string
}

// 目的打印机
// Admin/Config/GetPrinterDropDown
export const getPrinterDropDown = (): Promise<{
  printer: PrinterList[]
  status: number
}> => {
  return request.get({
    url: 'Admin/Config/GetPrinterDropDown'
  })
}

// 修改目的打印机
export const setFilmboxPrinter = (data: {
  printerID: string
  printerName: string
  filmBoxID: string[]
}): Promise<{
  status: number
  desc: string | null
}> => {
  return request.post({
    url: 'Film/SetFilmboxPrinter',
    data
  })
}

export interface FilmList {
  callingAE: string
  displayFormat: string
  filmBoxID: string
  filmImagePath: string
  filmOrientation: string
  filmSize: string
  height: number
  mediumType: string
  peerDes: string
  requestTime: string
  taskNo: number
  width: number
}

export enum MatchState {
  Waiting = 0,
  Fail = 1,
  Success = 2,
  Handled = 3
}

export interface ManualMatch {
  accessionNumber: string
  dicomPeerId: string
  matchState: string
  taskNo: string
  startDate: string
  endDate: string
}
// 手工匹配table 上面的
export const getManualMatchTable = (data: {
  manualMatch: ManualMatch
  pageInfo: PageInfo
}): Promise<{
  film: FilmList[]
  pageInfo: { count: number } & PageInfo
  status: number
  desc: string | null
}> => {
  return request.post({
    url: 'Film/GetFilmBoxInMatch',
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

// Exam/GetExamByAccNumOrPatientID
export const getExamByAccNumOrPatientID = (data: {
  accessionNumber?: string
  patientID?: string
}): Promise<{
  study: ExamStudyItem[] | null
  status: number
  desc: string | null
}> => {
  return request.get({
    url: 'Exam/GetExamByAccNumOrPatientID',
    params: data
  })
}

// Film/DoManualMatch
export const doManualMatch = (data: {
  accessionNumber: string
  filmBoxID: string
}): Promise<{
  status: number
  desc: string | null
}> => {
  return request.post({
    url: 'Film/DoManualMatch',
    data
  })
}
