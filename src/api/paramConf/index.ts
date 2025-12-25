import request from '@/axios'

export interface StorageList {
  currentPage: number
  organizationID?: string
  pageSize: number
}

export interface CloudStorageConfig {
  mediaUID?: string // 媒体唯一标识符
  mediaName?: string // 媒体名称
  pathType?: string // 路径类型
  mediaHost?: string // 媒体主机地址
  path?: string // 存储路径
  currentFlag?: boolean // 当前使用标志
  createUserUID?: string // 创建用户ID
  createUserName?: string // 创建用户姓名
  createDate?: string // 创建时间
  memo?: string // 备注
  sortNO?: number // 排序序号
  organizationID?: string // 组织ID
  accessId?: string // 访问ID
  accessKey?: string // 访问密钥
  organizationName?: string // 组织名称
  storageSize?: number // 存储总容量
  isDirect?: boolean // 是否直连访问
  ossId?: number // 对象存储ID
  usedSize?: number // 已使用容量
}

export const getStorage = (data: StorageList): Promise<IResponse<CloudStorageConfig[]>> => {
  return request.post({
    url: 'store/getstoragelist',
    data,
    requestTem: {
      requestTem: 'MediaMstProto',
      responseTem: 'MediaMstProto'
    }
  })
}

export const getDicmsg = (data): Promise<IResponse<any[]>> => {
  return request.post({
    url: 'dic/getdicmsg',
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
    url: 'store/delete',
    data,
    requestTem: {
      requestTem: 'MediaMstProto',
      responseTem: 'whitelist'
    }
  })
}
// 编辑存储媒介&&启用停用存储媒介
export const storageEdit = (data: CloudStorageConfig): Promise<IResponse<[]>> => {
  return request.post({
    url: 'store/edit',
    data,
    requestTem: {
      requestTem: 'MediaMstProto',
      responseTem: 'whitelist'
    }
  })
}
// 新增存储媒介
export const storageAdd = (data: CloudStorageConfig): Promise<IResponse<[]>> => {
  return request.post({
    url: 'store/create',
    data,
    requestTem: {
      requestTem: 'MediaMstProto',
      responseTem: 'whitelist'
    }
  })
}
