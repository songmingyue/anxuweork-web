import request from '@/axios'
import { TableList } from '@/store/modules/workStation'

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
  hasFilm: boolean
  isPrinted: string
  dicomPeerIDList: string[]
  reportExists: boolean
  reportPrinted: string
  cloudFilmPaid: null
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

export interface ExamListResponse<TExamResult = unknown> {
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
// 获取失败数量
export const getMatFailedCount = (): Promise<TableListRequest> => {
  return request.get({
    url: 'Film/GetMatFailedCount'
  })
}

// /Exam/GetExamList
export const getExamList = (params: ExamListRequestBody): Promise<ExamListResponse> => {
  return request.get({
    url: 'Exam/GetExamList',
    params
  })
}
