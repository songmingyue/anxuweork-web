// 每个接口都要加上
export const nowTimestamp = Math.floor(Date.now())
export const formatDate = (timestamp, type) => {
  const date = new Date(timestamp.getTime()) // 转换为毫秒
  const formattedDate = date.toISOString().split('T')[0] // 取日期部分
  const formattedTime = date.toTimeString().split(' ')[1] // 取时间部分
  if (type === 'date') {
    return formattedDate
  }
  return formattedDate + ' ' + formattedTime
}
