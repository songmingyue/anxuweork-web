import request from '@/axios'
import { PageBase } from '../type'

export interface CheckInfoRow {
  serviceSectID?: string
  examItem?: string
  checkArea?: string
  medRecNO?: string
  patientClass?: string
  visitID?: string
  alternateVisitID?: string
  outPatientID?: string
  pointOfCare?: string
  bed?: string
  organizationName?: string
  requestOrgName?: string
  requestDept?: string
  requestDocName?: string
  requestTime?: string
  regTime?: string
  examTime?: string
  patientID?: string
  accessionNumber?: string
  abnormalFlags?: string
  criticalValue?: string
  ifHasImage?: boolean | string
  resultStatus?: string
  // common presentational fields
  type?: string
  item?: string
  name?: string
  sex?: string
  age?: string
  dept?: string
}

export interface CheckInfoQuery extends PageBase {
  examKey?: string
  examValue?: string
  name?: string
  start?: string | Date
  end?: string | Date
  dept?: string
}

// 查询检查信息列表
export const getcheckinfolist = (data: CheckInfoQuery): Promise<IResponse<CheckInfoRow[]>> => {
  return request.post({
    url: 'check/getcheckinfolist',
    data,
    requestTem: {
      requestTem: 'SearchInputProto',
      responseTem: 'CheckInfoDtoProto'
    }
  })
}
