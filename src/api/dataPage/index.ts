import request from '@/axios'

export interface ServiceStatus {
  desc: string | null
  status: number
}

export const stopServiceMsd = (): Promise<ServiceStatus> => {
  return request.get({
    url: 'Admin/Config/GetTableConfig',
    params: {
      tableName: 'ExamList'
    }
  })
}
