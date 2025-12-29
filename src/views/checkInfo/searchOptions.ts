import { DeptType, getdeptname } from '@/api/checkInfo'
import { useUserStoreWithOut } from '@/store/modules/user'
const userStore = useUserStoreWithOut()
const userInfo = Array.isArray(userStore.getUserInfo)
  ? userStore.getUserInfo[0]
  : userStore.getUserInfo
const { examInfo } = userInfo.UserRight
const lockStatus = [
  { itemName: '已锁定', prop: 'true' },
  { itemName: '未锁定', prop: 'false' }
]
const imageStatus = [
  { itemName: '全部', prop: 0 },
  { itemName: '有', prop: 1 },
  { itemName: '无', prop: 2 }
]

let listDephname: any = []
// 申请科室权限过滤
export const permiseListSearch = async () => {
  if (examInfo.departmentVisible === 'False') return
  const { data: datas } = await getdeptname({
    deptType: DeptType.ClinicDept
  })
  console.log('申请科室列表-----------', datas)
  listDephname = datas
  return datas
}

const getDicmsgList = (codeType: string) => {
  const userStore = useUserStoreWithOut()
  const getCommonList = userStore.getDicmisList
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

// 使用函数形式，确保每次调用时都能获取到最新的缓存数据
export const getSearchFormList = () => ({
  userMsg: [
    {
      label: '性别',
      type: 'select',
      prop: 'sex',
      labelWidth: '40px',
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
      labelWidth: '40px',
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
      labelWidth: '40px',

      type: 'date',
      prop: 'birthDate',
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
      type: 'muliSelect',
      multiple: !0,
      prop: 'requestDeptName',
      width: '180px',
      fcn: 'deptSelected',
      tipShow: !0,
      filterable: !0,
      // 使用异步函数，首次渲染时自动拉取并返回最新“申请科室”列表
      opt: async () => {
        try {
          if (!Array.isArray(listDephname) || listDephname.length === 0) {
            await permiseListSearch()
          }
        } catch (_) {
          // ignore 单项失败，交给上层初始化兜底为空数组
        }
        return listDephname
      }
    },
    {
      label: '审核医生',
      type: 'selectDoctore',
      prop: 'resultPrincipalName',
      width: '180px',
      loadOptFcn: 'loadAssessDoc',
      filterable: false,
      opt: getdicitemlists('ResultPrincipalName')
    }
  ],
  checkMsg: [
    {
      label: '检查类型',
      type: 'muliSelect',
      prop: 'serviceSectID',
      width: '180px',
      typeCode: 'ExamType',
      filterable: false,
      opt: getDicmsgList('ExamType')
    },
    {
      label: '报告医生',
      type: 'selectDoctore',
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
      filterable: false,
      opt: getDicmsgList('ResultStatus_Exam')
    },
    {
      label: '是否收费',
      type: 'select',
      prop: 'digitalimageneed',
      width: '180px',
      opt: [
        { name: '有', value: 'true' },
        { name: '无', value: 'false' }
      ]
    }
  ],
  statusMsg: [
    {
      label: '锁定状态',
      type: 'select',
      prop: 'lockFlag',
      width: '180px',
      opt: lockStatus
    },
    {
      label: '胶片状态',
      type: 'select',
      prop: 'ifHasFilm',
      width: '180px',
      opt: imageStatus
    },
    {
      label: '影像状态',
      type: 'select',
      prop: 'ifHasImage',
      width: '180px',
      opt: imageStatus
    }
  ],
  inspectionResults: [
    {
      label: '阴阳性',
      type: 'select',
      prop: 'abnormalFlags',
      width: '180px',
      opt: [
        { name: '阴性', prop: '阴性' },
        { name: '阳性', prop: '阳性' },
        { name: '其他', prop: '其他' }
      ]
    }
  ]
})

// 保持向后兼容，但建议使用 getSearchFormList()
export const searchFormList = getSearchFormList()
