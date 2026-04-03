import dayjs from 'dayjs'

export type DateRangeShortcut = {
  text: string
  value: () => [Date, Date]
}

const endOfToday = () => dayjs().endOf('day').toDate()

export const commonDateRangeShortcuts: DateRangeShortcut[] = [
  {
    text: '今天',
    value: () => [dayjs().startOf('day').toDate(), endOfToday()]
  },
  {
    text: '近两天',
    value: () => [dayjs().subtract(1, 'day').startOf('day').toDate(), endOfToday()]
  },
  {
    text: '近三天',
    value: () => [dayjs().subtract(2, 'day').startOf('day').toDate(), endOfToday()]
  },
  {
    text: '近一周',
    value: () => [dayjs().subtract(6, 'day').startOf('day').toDate(), endOfToday()]
  },
  {
    text: '近一个月',
    value: () => [dayjs().subtract(1, 'month').startOf('day').toDate(), endOfToday()]
  },
  {
    text: '近三个月',
    value: () => [dayjs().subtract(3, 'month').startOf('day').toDate(), endOfToday()]
  },
  {
    text: '近半年',
    value: () => [dayjs().subtract(6, 'month').startOf('day').toDate(), endOfToday()]
  },
  {
    text: '近一年',
    value: () => [dayjs().subtract(1, 'year').startOf('day').toDate(), endOfToday()]
  }
]
