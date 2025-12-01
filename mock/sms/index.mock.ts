import { SUCCESS_CODE } from '@/constants'

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const names = ['张三', '李四', '王五', '赵六', '周七', '吴八']
const visitTypes = ['门诊', '住院', '急诊']
const examTypes = ['CT', 'MR', 'DR', 'B超']
const statuses = ['sent', 'delivered', 'failed', 'pending']

const DB: any[] = Array.from({ length: 123 }).map((_, i) => {
  const id = i + 1
  return {
    examNo: 'EX' + String(100000 + id),
    visitType: randomPick(visitTypes),
    examType: randomPick(examTypes),
    name: randomPick(names),
    phone: '138' + String(10000000 + id).slice(0, 8),
    sendTime: new Date(Date.now() - Math.random() * 7 * 86400000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' '),
    deliveredTime:
      Math.random() > 0.3
        ? new Date(Date.now() - Math.random() * 7 * 86400000)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')
        : null,
    status: randomPick(statuses)
  }
})

export default [
  {
    url: '/api/sms/list',
    method: 'get',
    timeout: 500,
    response: ({ query }: any) => {
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const type = query.type
      const keyword = (query.keyword || '').toLowerCase()

      let filtered = DB
      if (type && keyword) {
        filtered = DB.filter((item) =>
          String(item[type] ?? '')
            .toLowerCase()
            .includes(keyword)
        )
      }

      const start = (page - 1) * pageSize
      const end = start + pageSize

      return {
        code: SUCCESS_CODE,
        data: {
          list: filtered.slice(start, end),
          total: filtered.length
        }
      }
    }
  }
]
