import request from '@/axios'
import { CommonList } from '@/store/modules/common'
import { ServiceStatus } from '../dataPage'

export interface OperateLog {
  aa: string
}
export interface PageInfo {
  pageIndex: number
  count: number
  pageSize: number
}
export interface GetFilmOperate {
  operateLog: OperateLog[]
  pageInfo: PageInfo
  status: number
}

export interface OperateQuery {
  accessionNumber: string
  clientIP: string
  operateType: string
  operator: string
  patientID: string
  pageInfo: {
    pageIndex: number
    pageSize: number
  }
}

// OperateLog/GetFilmOperate
export const getFilmOperate = (data: OperateQuery): Promise<GetFilmOperate> => {
  return request.post({
    url: 'OperateLog/GetFilmOperate',
    data
  })
}
export interface GetDropDownConfig extends ServiceStatus {
  dropdownConfig: CommonList
}

export const configGetDropDownConfig = (): Promise<GetDropDownConfig> => {
  return request.get({
    url: 'Admin/Config/GetDropDownConfig'
  })
}
