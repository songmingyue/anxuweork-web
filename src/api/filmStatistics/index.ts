// Config/GetDicomPeerDropDown

import request from '@/axios'

export interface OptionList {
  text: string
  value: string
}

export interface GetDicomPeerDropDown {
  dicomPeers: OptionList[]
  status: number
}

export interface GetPrinterDropDown {
  printer: OptionList[]
  status: number
}

export interface GetExamTypeDropdown {
  data: OptionList[]
  status: number
  desc: string
}
// 设备列表
export const getDicomPeerDropDown = (): Promise<GetDicomPeerDropDown> => {
  return request.get({
    url: 'Admin/Config/GetDicomPeerDropDown'
  })
}
// 设备列表
export const getPrinterDropDown = (): Promise<GetPrinterDropDown> => {
  return request.get({
    url: 'Admin/Config/GetPrinterDropDown'
  })
}
// 胶片日用量检查类型
export const getExamTypeDropdown = (): Promise<GetExamTypeDropdown> => {
  return request.get({
    url: 'Admin/Config/GetExamTypeDropdown'
  })
}
export interface DicomPeerStatisticsOptions {
  startDate: string
  endDate: string
  printState?: null
  dicomPeers: string[]
  examType?: string | null
}

export interface DicomPeerStatisticsDataItem {
  filmSize: string
  printCount: number
  totalCount: number
}

export interface DicomPeerStatistics {
  peerDes: string
  data: DicomPeerStatisticsDataItem[]
}

export interface DicomPeerStatisticsData {
  dicomPeerStatistics: DicomPeerStatistics[]
  status: number
}
// 设备用量
export const getDicomPeerStatistics = (
  data: DicomPeerStatisticsOptions
): Promise<DicomPeerStatisticsData> => {
  return request.post({
    url: 'Statistic/GetDicomPeerStatistics',
    data
  })
}
// Statistic/GetPrinterStatistics
export const getPrinterStatistics = (
  data: DicomPeerStatisticsOptions
): Promise<DicomPeerStatisticsData> => {
  return request.post({
    url: 'Statistic/GetPrinterStatistics',
    data
  })
}
// 匹配率
export const getMatchRateStatistics = (
  data: DicomPeerStatisticsOptions
): Promise<DicomPeerStatisticsData> => {
  return request.post({
    url: 'Statistic/GetMatchRateStatistics',
    data
  })
}
// 胶片月用量

export const getFilmMonthlyStatistics = (
  data: DicomPeerStatisticsOptions
): Promise<DicomPeerStatisticsData> => {
  return request.post({
    url: 'Statistic/GetFilmMonthlyStatistics',
    data
  })
}

// 胶片日用量
export const getExamTypePrintStatistic = (
  data: DicomPeerStatisticsOptions
): Promise<DicomPeerStatisticsData> => {
  return request.post({
    url: 'Statistic/GetExamTypePrintStatistic',
    data
  })
}
