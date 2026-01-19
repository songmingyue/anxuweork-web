import request from '@/axios'
import { ServiceStatus } from '../dataPage'
import { CommonList } from '@/store/modules/common'

export interface GetDropDownConfig extends ServiceStatus {
  dropdownConfig: CommonList
}

export interface Department {
  departmentID: string
  hospitalID: string
  departmentCode: string
  departmentName: string
}

export interface GetDepartment extends ServiceStatus {
  data: Department[]
}

export const getDropDownConfig = (): Promise<GetDropDownConfig> => {
  return request.get({
    url: '/Admin/Config/GetDropDownConfig'
  })
}

export const getDepartment = (): Promise<GetDepartment> => {
  return request.get({
    url: '/Home/GetDepartment'
  })
}
