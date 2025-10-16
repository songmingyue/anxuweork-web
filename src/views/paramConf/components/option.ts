export const conditionOptions = [
  {
    label: '上传',
    value: 'Upload',
    children: [
      {
        label: '云胶片',
        value: 'CompanyCloud',
        children: [
          { label: '检查', value: 'Exam' },
          { label: '报告', value: 'Report' },
          { label: '影像', value: 'Image' },
          { label: '胶片', value: 'Film' }
        ]
      }
    ]
  },
  {
    label: '推送',
    value: 'Push',
    children: [
      {
        label: '集成市平台',
        value: 'IMCISCityPlatform',
        children: [
          { label: '检查', value: 'Exam' },
          { label: '报告', value: 'Report' },
          { label: '影像', value: 'Image' },
          { label: '胶片', value: 'Film' }
        ]
      },
      {
        label: '浙江省平台',
        value: 'ZheJiangRecognitionPlatform',
        children: [
          { label: '检查', value: 'Exam' },
          { label: '报告', value: 'Report' },
          { label: 'kos文件', value: 'KosFile' }
        ]
      },
      {
        label: '浙江省质量平台',
        value: 'ZhejiangQualityPlatform',
        children: [{ label: '影像', value: 'Image' }]
      }
    ]
  },
  {
    label: '下载',
    value: 'Download',
    children: [
      {
        label: '本地存储',
        value: 'LocalStorage',
        children: [
          { label: '报告', value: 'Report' },
          { label: '影像', value: 'Image' },
          { label: '胶片', value: 'Film' }
        ]
      }
    ]
  },
  {
    label: '转化',
    value: 'Converter',
    children: [
      {
        label: '本地报告',
        value: 'LocalReport',
        children: [{ label: 'PDF', value: 'Pdf' }]
      }
    ]
  }
]

export const timeOptions = [
  { label: '小于', value: 'LessThan' },
  { label: '小于等于', value: 'LessThanOrEqual' },
  { label: '等于', value: 'Equal' },
  { label: '大于', value: 'MoreThan' },
  { label: '大于等于', value: 'MoreThanOrEqual' }
]
export const selectOptions = [
  { label: '等于', value: 'Equal' },
  { label: '不等于', value: 'NotEqual' },
  { label: '包含', value: 'Contains' },
  { label: '不包含', value: 'NotContains' },
  { label: '在列表中', value: 'In' },
  { label: '不在列表中', value: 'NotIn' }
]
export const selectOption = {
  date: timeOptions,
  select: selectOptions
}
export const timeOptionsType = [
  {
    label: '加',
    value: 'add'
  },
  {
    label: '减',
    value: 'minus'
  }
]
export const timeUnitType = [
  {
    label: '时',
    value: 'h'
  },
  {
    label: '分',
    value: 'm'
  },
  {
    label: '秒',
    value: 's'
  }
]
export const conditionList: { label: string; value: string; options: any[]; type: string }[] = [
  {
    label: 'PatientID',
    value: 'PatientID',
    options: selectOption['select'],
    type: 'String'
  },
  {
    label: 'PIDAssigningAuthority',
    value: 'PIDAssigningAuthority',
    options: selectOption['select'],
    type: 'String'
  },
  {
    label: 'PatientClass',
    value: 'PatientClass',
    options: selectOption['select'],
    type: 'String'
  },
  {
    label: 'OrganizationID',
    value: 'OrganizationID',
    options: selectOption['select'],
    type: 'String'
  },
  {
    label: 'PlacerOrderNO',
    value: 'PlacerOrderNO',
    options: selectOption['select'],
    type: 'String'
  },
  {
    label: 'AccessionNumber',
    value: 'AccessionNumber',
    options: selectOption['select'],
    type: 'String'
  },
  {
    label: 'ServiceSectID',
    value: 'ServiceSectID',
    options: selectOption['select'],
    type: 'String'
  },
  {
    label: 'RequestedDate',
    value: 'RequestedDate',
    options: selectOption['date'],
    type: 'Datetime'
  },
  {
    label: 'RegTime',
    value: 'RegTime',
    options: selectOption['date'],
    type: 'Datetime'
  },
  {
    label: 'ExamDate',
    value: 'ExamDate',
    options: selectOption['date'],
    type: 'Datetime'
  },
  {
    label: 'PreliminaryDate',
    value: 'PreliminaryDate',
    options: selectOption['date'],
    type: 'Datetime'
  },
  {
    label: 'AuditDate',
    value: 'AuditDate',
    options: selectOption['date'],
    type: 'Datetime'
  },
  {
    label: 'ResultDate',
    value: 'ResultDate',
    options: selectOption['date'],
    type: 'Datetime'
  }
]
