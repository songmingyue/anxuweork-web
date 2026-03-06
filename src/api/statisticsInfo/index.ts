import request from '@/axios'

export interface GetExamPrintMonthlyStatistics {
  status: number
  examPrintResult: ExamPrintResult[]
}

export interface ExamPrintResult {
  examTotal: number
  month: string
  examPrintDetail: ExamPrintDetail[]
}

export interface ExamPrintDetail {
  examPatientTotal: number
  examPrinted: number
  examType: string
  examTypeTotal: number
  filmPaid: number
  filmPrinted: number
}

export interface StaticsData {
  examType: string[]
  startDate: string
  endDate: string
  patientType: string[]
}

export const getExamPrintMonthlyStatistics = (
  data: StaticsData
): Promise<GetExamPrintMonthlyStatistics> => {
  return request.post({
    url: 'Statistic/GetExamPrintMonthlyStatistics',
    data
  })
}
