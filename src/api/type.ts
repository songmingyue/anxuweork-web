export interface RequestType {
  url: string
  requestTem?: string // 请求的protobuf类型
  responseTem?: string // 响应的protobuf类型
}

export interface PageType {
  currentPage: number
  pageSize: number
}

export interface PageBase {
  currentPage?: number
  pageSize?: number
  token?: string
  totalRecords?: number
}

export interface OptionDeptMstDto {
  deptID: string
  deptName: string
  deptType: 'ClinicDept' | 'ExamDept'
  organizationID: string
  organizationName: string
}

export interface OrganizationOnce {
  value: string
  label: string
  deptMstDto: OptionDeptMstDto[]
}
