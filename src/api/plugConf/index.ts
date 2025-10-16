import request from '@/axios'
import { PageType } from '../type'

interface ServiceConfig {
  ifEnable: boolean
  serviceName: string
  serviceUID: string
}

enum DBType {
  MySQL = '0'
}

enum QueryType {
  Plugin = 'plugin'
}

interface StrictQueryConfig {
  defaultFlag: '0' | '1'
  name: string
  publicFlag: '0' | '1'
  queryCondition: DBType
  querySeq: number
  queryType: QueryType
  sortNO: string
  userUID: string
}

// 获取服务
export const getdictypelist = (data: PageType): Promise<IResponse<ServiceConfig[]>> => {
  return request.post({
    url: 'plugin/getservicelist',
    data,
    requestTem: {
      requestTem: 'ServiceInputProto',
      responseTem: 'ServiceOutputProto'
    }
  })
}

// 获取模板
export const getpreset = (data: ServiceConfig): Promise<IResponse<StrictQueryConfig[]>> => {
  return request.post({
    url: 'check/getpreset',
    data,
    requestTem: {
      requestTem: 'UserQuerySetInputProto',
      responseTem: 'UserQuerySetMstProto'
    }
  })
}
