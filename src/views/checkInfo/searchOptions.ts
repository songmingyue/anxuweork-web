import { DeptType, getdeptname } from '@/api/checkInfo'
import { useUserStoreWithOut } from '@/store/modules/user'

const userStore = useUserStoreWithOut()
const userInfo = Array.isArray(userStore.getUserInfo)
  ? userStore.getUserInfo[0]
  : userStore.getUserInfo
const { examInfo } = userInfo.UserRight
const commonOptionList = [
  { itemName: '未采集', prop: '100' },
  { itemName: '已采集', prop: '200' },
  { itemName: '未上传', prop: '300' },
  { itemName: '已上传', prop: '400' }
]

const contStatus = [
  { itemName: '已打印', prop: 'true' },
  { itemName: '未打印', prop: 'false' }
]

const lockStatus = [
  { itemName: '已锁定', prop: 'true' },
  { itemName: '未锁定', prop: 'false' }
]
// 申请科室权限过滤
const permiseListSearch = async () => {
  if (examInfo.departmentVisible === 'False') return
  const { data: datas } = await getdeptname({
    deptType: DeptType.ClinicDept
  })
  return datas
}

const getDicmsgList = (codeType: string) => {
  const userStore = useUserStoreWithOut()
  const getCommonList = userStore.getDicmsList
  const selectList = getCommonList.filter((item: any) => item.typeCode === codeType)
  return selectList
}

// 申请医生
const getdicitemlists = (codeType: string) => {
  const userStore = useUserStoreWithOut()
  const getCommonList = userStore.getDicitemlists
  const typeList = getCommonList.filter((item: any) => item.typeCode === codeType)
  return typeList
}

export const optionsList = {
  patientClassList: getDicmsgList('PatientClass'), //就诊类别
  requestDeptIDList: permiseListSearch(), // 申请科室
  requestDocNameList: getdicitemlists('RequestDocName'), // 申请医生
  resultPrincipalNameList: getdicitemlists('ResultPrincipalName'), // 审核医生
  examEquipmentList: getdicitemlists('ExamEquipment'), //检查设备
  serviceSectIDList: getDicmsgList('ExamType'), // 检查类型
  resultAssistantNameList: getdicitemlists('ResultAssistantName'), // 报告医生
  examStatusList: getDicmsgList('ResultAssistantName'), // 检查状态
  ifHasImageList: commonOptionList, //影像状态
  ifHasReportList: commonOptionList, //报告状态
  ifHasFilmList: commonOptionList, //胶片状态
  resultPrintCountList: contStatus, // 报告打印状态
  lockFlagList: lockStatus, // 报告锁定状态
  statisticTypeList: [{ label: '影像创建时间', prop: 'ImageCreateTime' }], // 统计标识
  criticalValueList: [
    { label: '有', prop: 'true' },
    { label: '无', prop: 'false' }
  ], // 危机报告
  abnormalFlagsList: [
    { label: '阴性', prop: '阴性' },
    { label: '阳性', prop: '阳性' },
    { label: '其他', prop: '其他' }
  ]
}

// 使用函数形式，确保每次调用时都能获取到最新的缓存数据
export const getSearchFormList = () => ({
  userMsg: [
    {
      label: '性别',
      type: 'select',
      prop: 'gender',
      width: '180px',
      opt: [
        { lable: '男', prop: '男' },
        { lable: '女', prop: '女' },
        { lable: '其他', prop: '其他' }
      ]
    },
    {
      type: 'double',
      label: '年龄',
      pdList: [
        {
          type: 'number',
          prop: 'age',
          width: '120px',
          min: 0,
          max: 120
        },
        {
          type: 'select',
          prop: 'ageUnit',
          width: '60px',
          opt: [
            { lable: '岁', prop: '岁' },
            { lable: '月', prop: '月' },
            { lable: '天', prop: '天' }
          ]
        }
      ]
    },
    {
      label: '生日',
      type: 'date',
      prop: 'birthDay',
      width: '180px'
    }
  ],
  medicalMsg: [
    {
      label: '就诊类别',
      type: 'muliSelect',
      prop: 'patientClass',
      width: '180px',
      typeCode: 'PatientClass',
      filterable: !0,
      opt: getDicmsgList('PatientClass')
    },
    {
      label: '申请科室',
      type: 'virtualSelect',
      multiple: !0,
      prop: 'requestDeptID',
      width: '180px',
      fcn: 'deptSelected',
      tipShow: !0,
      filterable: !0,
      opt: permiseListSearch()
    },
    {
      label: '申请医生',
      type: 'select',
      prop: 'requestDocName',
      width: '180px',
      loadOptFcn: 'loadApplyDoc',
      filterable: !0,
      opt: getdicitemlists('RequestDocName')
    },
    {
      label: '审核医生',
      type: 'select',
      prop: 'resultPrincipalName',
      width: '180px',
      loadOptFcn: 'loadAssessDoc',
      filterable: !0,
      opt: getdicitemlists('ResultPrincipalName')
    },
    {
      label: '检查设备',
      type: 'select',
      prop: 'examEquipment',
      width: '180px',
      loadOptFcn: 'loadExamEquipment',
      filterable: !0,
      opt: getdicitemlists('ExamEquipment')
    }
  ],
  checkMsg: [
    {
      label: '检查类型',
      type: 'muliSelect',
      prop: 'serviceSectID',
      width: '180px',
      typeCode: 'ExamType',
      filterable: !0,
      opt: getDicmsgList('ExamType')
    },
    {
      label: '报告医生',
      type: 'select',
      prop: 'resultAssistantName',
      width: '180px',
      loadOptFcn: 'loadReportDoc',
      filterable: !0,
      opt: getdicitemlists('ResultAssistantName')
    },
    {
      label: '检查状态',
      type: 'muliSelect',
      prop: 'examStatus',
      width: '180px',
      typeCode: 'ResultStatus_Exam',
      filterable: !0,
      opt: getDicmsgList('ResultStatus_Exam')
    },
    {
      label: '是否收费',
      type: 'select',
      prop: 'digitalimageneed',
      width: '180px',
      opt: [
        { label: '有', prop: 'true' },
        { label: '无', prop: 'false' }
      ]
    },
    {
      label: '影像诊断',
      type: 'input',
      prop: 'imagingDiagnosis',
      width: '180px'
    }
  ],
  statusMsg: [
    {
      label: '影像状态',
      type: 'select',
      prop: 'ifHasImage',
      width: '180px',
      opt: commonOptionList
    },
    {
      label: '报告状态',
      type: 'select',
      prop: 'ifHasReport',
      width: '180px',
      opt: commonOptionList
    },
    {
      label: '胶片状态',
      type: 'select',
      prop: 'ifHasFilm',
      width: '180px',
      opt: commonOptionList
    },
    {
      label: '打印报告',
      type: 'select',
      prop: 'resultPrintCount',
      width: '180px',
      opt: contStatus
    },
    {
      label: '锁定状态',
      type: 'select',
      prop: 'lockFlag',
      width: '180px',
      opt: lockStatus
    },
    {
      label: '统计标识',
      type: 'select',
      prop: 'statisticType',
      width: '180px',
      opt: [{ label: '影像创建时间', prop: 'ImageCreateTime' }]
    }
  ],
  inspectionResults: [
    {
      label: '阴阳性',
      type: 'select',
      prop: 'abnormalFlags',
      width: '180px',
      opt: [
        { label: '阴性', prop: '阴性' },
        { label: '阳性', prop: '阳性' },
        { label: '其他', prop: '其他' }
      ]
    },
    {
      label: '危急值报告',
      type: 'select',
      prop: 'criticalValue',
      width: '180px',
      opt: [
        { label: '有', prop: 'true' },
        { label: '无', prop: 'false' }
      ]
    }
  ]
})

// 保持向后兼容，但建议使用 getSearchFormList()
export const searchFormList = getSearchFormList()
