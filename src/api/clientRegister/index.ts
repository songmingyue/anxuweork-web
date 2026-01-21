import request from '@/axios'
import { ServiceStatus } from '../dataPage'
import { Department } from '../common'

export interface HospitalInfo {
  hospitalCode: string
  hospitalID: string
  hospitalName: string
  requestDeviceCount: number
}

export interface HospitalAndDepartment extends ServiceStatus {
  hospitalInfo: HospitalInfo
}

export const getHospitalAndDepartment = (): Promise<HospitalAndDepartment> => {
  return request.get({
    url: '/Home/GetHospitalAndDepartment'
  })
}
// 注册科室
export const registerDepartment = (data: Department): Promise<HospitalAndDepartment> => {
  return request.post({
    data,
    url: '/Admin/Register/RegisterDepartment'
  })
}
// 医院注册

export const registerHospital = (data: HospitalInfo): Promise<HospitalAndDepartment> => {
  return request.post({
    data,
    url: '/Admin/Register/Hospital'
  })
}

export const deleteDepartment = (data: {
  departmentId: string
}): Promise<HospitalAndDepartment> => {
  return request.delete({
    data,
    url: '/Admin/Register/DeleteDepartment'
  })
}
