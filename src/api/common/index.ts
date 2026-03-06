import request from '@/axios'
import { ServiceStatus } from '../dataPage'

export interface Data {
  text: string
  value: string
}

export interface ExamTypeDropdown extends ServiceStatus {
  data: Data[]
}
export interface Department {
  departmentID: string
  hospitalID: string
  departmentCode: string
  departmentName: string
}

export const getDropDownConfig = (): Promise<ExamTypeDropdown> => {
  return request.get({
    url: 'Admin/Config/GetExamTypeDropdown'
  })
}

export interface GetPatientTypeList {
  data: string[]
  desc: string | null
  status: number
}
// Admin/Config/GetPatientTypeList
export const getPatientTypeList = (): Promise<GetPatientTypeList> => {
  return request.get({
    url: 'Admin/Config/GetPatientTypeList'
  })
}
//
export const getAreaNoDropdown = (): Promise<ExamTypeDropdown> => {
  return request.get({
    url: 'Admin/Config/GetAreaNoDropdown'
  })
}

export const getPatientTypeDropdown = (): Promise<ExamTypeDropdown> => {
  return request.get({
    url: 'Admin/Config/GetPatientTypeDropdown'
  })
}
