import request from '@/axios'

export interface StorageList {
  currentPage: number
  organizationID?: string
  pageSize: number
}

export const getStorage = (data: StorageList): Promise<any> => {
  return request.post({
    url: 'storage/getstoragelist',
    data,
    requestTem: {
      requestTem: 'StorageInputProto',
      responseTem: 'StorageTempProto'
    }
  })
}

export const getDicmsg = (data): Promise<any> => {
  return request.post({
    url: 'check/getdicmsg',
    data,
    requestTem: {
      requestTem: 'DicItemMstInputProto',
      responseTem: 'DicItemMstProto'
    }
  })
}

export const getOrg = (): Promise<any> => {
  return request.post({
    url: 'register/getorg',
    requestTem: {
      requestTem: 'OrganizationInputProto',
      responseTem: 'OrganizationDtoProto'
    }
  })
}
