export const alternative = [
  { label: '检查号', prop: 'accessionNumber' },
  { label: '病历号', prop: 'medRecNO' },
  { label: '就诊号', prop: 'visitUID' },
  { label: '门诊号', prop: 'medRecNO' },
  { label: '住院号', prop: 'medRecNO' },
  { label: '患者编号', prop: 'patientID' },
  { label: '身份证号', prop: 'iDCardNo' },
  { label: '手机号', prop: 'contactPhoneNO' },
  { label: '医保卡号', prop: 'insuranceID' }
  // { label: '申请单号', prop: 'placerOrderNO' }
]
export const timeAlternative: any = [
  {
    label: '检查时间',
    propStart: 'examStartTime',
    propEndTime: 'examEndTime',
    prop: 'observationDate'
  },
  {
    label: '上传时间',
    propStart: 'registerStartTime',
    propEndTime: 'registerEndTime',
    prop: 'uploadTime'
  },
  {
    label: '报告时间',
    propStart: 'resultStartDate',
    propEndTime: 'resultEndDate',
    prop: 'preliminaryDate'
  },
  {
    label: '创建时间',
    propStart: 'requestStartTime',
    propEndTime: 'requestEndTime',
    prop: 'fileCreateTime'
  }
]

export const examOptions = [
  { label: '检查号', value: 'examNo' },
  { label: '病历号', value: 'medRecNO' },
  { label: '就诊号', value: 'visitNo' },
  { label: '门诊号', value: 'outpatientNo' },
  { label: '住院号', value: 'inpatientNo' },
  { label: '患者编号', value: 'patientId' },
  { label: '身份证号', value: 'idNo' },
  { label: '手机号', value: 'mobile' },
  { label: '医保卡号', value: 'insNo' },
  { label: '申请单号', value: 'applyNo' }
]

export const defaultStart: any = [
  { prop: 'serviceSectID', label: '类型', sort: true, width: 90, disabled: true },
  { prop: 'procedureName', label: '检查部位', sort: true, width: 115, disabled: true },
  { prop: 'name', label: '姓名', sort: true, width: 120, disabled: true },
  { prop: 'sex', label: '性别', sort: true, width: 120, disabled: true },
  { prop: 'age', label: '年龄', sort: true, width: 120, disabled: true },
  { prop: 'contactPhoneNo', label: '电话', sort: true, width: 120, disabled: true },
  { prop: 'birthDate', label: '生日', sort: true, width: 120, disabled: true },
  { prop: 'idCardNO', label: '身份证', sort: true, width: 120, disabled: true },
  // { prop: 'examItem', label: '检查项目', sort: true, width: 120, disabled: true },
  { prop: 'medRecNO', label: '病历号', sort: true, width: 120, disabled: true }
]

export const checkBoxList: any = [
  ...defaultStart,
  {
    prop: 'patientClass',
    label: '就诊类型',
    sort: !0,
    width: 120
  },
  { prop: 'medRecNO', label: '就诊号', sort: !0, width: 120 },
  {
    prop: 'medRecNO',
    label: '住院号',
    sort: !0,
    width: 120
  },
  { prop: 'medRecNO', label: '门诊号', sort: !0, width: 120 },
  // { prop: 'pointOfCare', label: '病区', sort: !0, width: 120 },
  // { prop: 'bed', label: '床号', sort: !0, width: 120 },
  {
    prop: 'organizationName',
    label: '检查机构',
    sort: !0,
    width: 120
  },
  // {
  //   prop: 'requestOrgName',
  //   label: '申请机构',
  //   sort: !0,
  //   width: 120
  // },
  { prop: 'requestDeptName', label: '申请科室', sort: !0, width: 120 },
  // {
  //   prop: 'requestDocName',
  //   label: '申请医生',
  //   sort: !0,
  //   width: 120
  // },
  // { prop: 'createdDate', label: '申请时间', sort: !0, width: 120 },

  { prop: 'patientID', label: '患者编号', sort: !0, width: 120 },
  {
    prop: 'accessionNumber',
    label: '检查号',
    sort: !0,
    width: 120
  },
  { prop: 'abnormalFlags', label: '阴阳性', sort: !0, width: 120 },
  { prop: 'observationDate', label: '检查时间', sort: !0, width: 120 },
  { prop: 'uploadTime', label: '上传时间', sort: !0, width: 120 },
  { prop: 'preliminaryDate', label: '报告时间', sort: !0, width: 120 },
  { prop: 'fileCreateTime', label: '创建时间', sort: !0, width: 120 }

  // {
  //   prop: 'criticalValue',
  //   label: '危急报告',
  //   sort: !0,
  //   width: 120
  // },
  // {
  //   prop: 'resultStatusCode',
  //   label: '报告状态',
  //   sort: !0,
  //   width: 120
  // },
  // {
  //   prop: 'examEquipment',
  //   label: '检查设备',
  //   sort: !0,
  //   width: 120
  // }
]

export const medicalVisit = [
  {
    label: '检查设备',
    type: 'select',
    prop: 'examEquipment',
    width: '180px',
    loadOptFcn: 'loadExamEquipment',
    filterable: !0,
    opt: []
  }
]
