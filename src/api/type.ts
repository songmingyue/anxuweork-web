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
  currentPage: number
  pageSize: number
  token: string
  totalRecords: number
}
