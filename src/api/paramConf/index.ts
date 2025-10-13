import request from '@/axios'

export interface StorageList {
  currentPage: number
  organizationID?: string
  pageSize: number
}

export interface CloudStorageConfig {
  accessID: string // 访问ID（如API密钥ID）
  accessKey: string // 访问密钥（敏感信息，建议加密存储）
  bucket: string // 存储桶名称
  customConfig: string // 自定义配置（JSON字符串，需二次解析）
  downloadURL: string // 文件下载地址
  host: string // 服务主机地址
  ifEnable: string // 是否启用配置
  mediaUID: string // 媒体资源唯一标识
  name: string // 配置名称
  organizationID: string // 组织ID
  organizationName: string // 组织名称
  path: string // 路径（如域名）
  subDir: string // 子目录路径
  type: string // 存储类型（如"云存储"）
  uploadMediaUID: string // 上传媒体资源唯一标识
  uploadURL: string // 文件上传地址
  userUID: string // 用户唯一标识
  isSharePath: string
  description: string
  httpPath: string
  shareAddress: string
  sharePassWord: string
  shareUserName: string
}

export const getStorage = (data: StorageList): Promise<IResponse<CloudStorageConfig[]>> => {
  return request.post({
    url: 'storage/getstoragelist',
    data,
    requestTem: {
      requestTem: 'StorageInputProto',
      responseTem: 'StorageTempProto'
    }
  })
}

export const getDicmsg = (data): Promise<IResponse<any[]>> => {
  return request.post({
    url: 'check/getdicmsg',
    data,
    requestTem: {
      requestTem: 'DicItemMstInputProto',
      responseTem: 'DicItemMstProto'
    }
  })
}

export const getOrg = (): Promise<IResponse<[]>> => {
  return request.post({
    url: 'register/getorg',
    requestTem: {
      requestTem: 'OrganizationInputProto',
      responseTem: 'OrganizationDtoProto'
    }
  })
}
// 删除存储媒介
export const storageDelete = (data: CloudStorageConfig): Promise<IResponse<[]>> => {
  return request.post({
    url: 'storage/delete',
    data,
    requestTem: {
      requestTem: 'StorageDtoProto',
      responseTem: 'whitelist'
    }
  })
}
// 编辑存储媒介&&启用停用存储媒介
export const storageEdit = (data: CloudStorageConfig): Promise<IResponse<[]>> => {
  return request.post({
    url: 'storage/edit',
    data,
    requestTem: {
      requestTem: 'StorageDtoProto',
      responseTem: 'whitelist'
    }
  })
}
// 新增存储媒介
export const storageAdd = (data: CloudStorageConfig): Promise<IResponse<[]>> => {
  return request.post({
    url: 'storage/create',
    data,
    requestTem: {
      requestTem: 'StorageDtoProto',
      responseTem: 'whitelist'
    }
  })
}
