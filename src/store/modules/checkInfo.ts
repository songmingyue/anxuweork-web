import { defineStore } from 'pinia'
import { store } from '../index'
import { getdicitemlist } from '@/api/authConf'
import { DeptType, getdeptname } from '@/api/checkInfo'
import { getDicmsg } from '@/api/paramConf'
import { useUserStoreWithOut } from './user'

// 通用静态选项
const commonOptionList = [
  { label: '未采集', prop: '100' },
  { label: '已采集', prop: '200' },
  { label: '未上传', prop: '300' },
  { label: '已上传', prop: '400' }
]

const contStatus = [
  { label: '已打印', prop: 'true' },
  { label: '未打印', prop: 'false' }
]

const lockStatus = [
  { label: '已锁定', prop: 'true' },
  { label: '未锁定', prop: 'false' }
]

interface CheckInfoState {
  // 字典项缓存（按组织）
  dicItemsOrg: string | null
  dicItemsData: any[] | null
}

export const useCheckInfoStore = defineStore('checkInfo', {
  state: (): CheckInfoState => ({
    dicItemsOrg: null,
    dicItemsData: null
  }),
  getters: {
    getCommonOptionList: () => commonOptionList,
    getContStatus: () => contStatus,
    getLockStatus: () => lockStatus
  },
  actions: {
    // 申请科室权限过滤
    async permiseListSearch() {
      const userStore = useUserStoreWithOut()
      const raw = userStore.getUserInfo as any
      const userInfo = Array.isArray(raw) ? raw[0] : raw
      const examInfo = userInfo?.UserRight?.examInfo
      if (examInfo?.departmentVisible === 'False') return
      const { data } = await getdeptname({ deptType: DeptType.ClinicDept })
      return data
    },

    // 就诊类别
    async getPatientClassList() {
      const userStore = useUserStoreWithOut()
      const raw = userStore.getUserInfo as any
      const userInfo = Array.isArray(raw) ? raw[0] : raw
      const { data } = await getDicmsg({ typeCode: 'PatientClass', userInfo })
      return data
    },

    // 加载（且缓存）组织下的字典项列表
    async loadDicItemsOnce(): Promise<any[]> {
      const userStore = useUserStoreWithOut()
      const org = userStore.getorganizationID || ''
      if (!this.dicItemsData || this.dicItemsOrg !== org) {
        this.dicItemsOrg = org
        try {
          const { data } = await getdicitemlist({ organizationID: org })
          this.dicItemsData = data as any[]
        } catch (e) {
          this.dicItemsData = null
          throw e
        }
      }
      return this.dicItemsData || []
    },

    // 按 type 过滤一次性字典项
    async getDicItemsByType(codeType: string) {
      const datas = await this.loadDicItemsOnce()
      return datas.filter((item: any) => item.typeCode === codeType)
    },

    // 组装原 optionsList 结构（返回 Promise 字段与原用法对齐）
    getOptionsList() {
      return {
        examEquipmentList: [],
        organizationIDList: [],
        patientClassList: this.getPatientClassList(),
        requestDeptIDList: this.permiseListSearch(),
        requestDocNameList: this.getDicItemsByType('RequestDocName'),
        resultPrincipalNameList: this.getDicItemsByType('ResultPrincipalName'),
        examEquipmentLIst: [],
        serviceSectIDList: [],
        resultAssistantNameList: [],
        examStatusList: [],
        ifHasImageList: commonOptionList,
        ifHasReportList: commonOptionList,
        ifHasFilmList: commonOptionList,
        resultPrintCountList: contStatus,
        lockFlagList: lockStatus,
        statisticTypeList: [{ label: '影像创建时间', prop: 'ImageCreateTime' }],
        criticalValueList: [
          { label: '有', prop: 'true' },
          { label: '无', prop: 'false' }
        ],
        abnormalFlagsList: [
          { label: '阴性', prop: '阴性' },
          { label: '阳性', prop: '阳性' },
          { label: '其他', prop: '其他' }
        ]
      }
    }
  },
  persist: true
})

export const useCheckInfoStoreWithOut = () => useCheckInfoStore(store)
