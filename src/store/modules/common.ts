import { defineStore } from 'pinia'
import { store } from '../index'

export interface ArrList {
  text: string
  value: string
}

export interface CommonList {
  binaryzationType?: ArrList[]
  cleanDiskType?: ArrList[]
  enumDeleteState?: ArrList[]
  enumOperateType?: ArrList[]
  filmOrientation?: ArrList[]
  filmRotate?: ArrList[]
  filmSize?: ArrList[]
  magnificationType?: ArrList[]
  matchState?: ArrList[]
  matchType?: ArrList[]
  matchdbType?: ArrList[]
  mediumType?: ArrList[]
  printState?: ArrList[]
  printerStatus?: ArrList[]
  resultProcess?: ArrList[]
}

export interface CommonMsg {
  dropdownConfig: CommonList
  examTypeDropdown: ArrList[]
  areaNoDropdown: ArrList[]
  patientTypeDropdown: ArrList[]
}

export const useCommonStore = defineStore('commonList', {
  state: (): CommonMsg => {
    return {
      dropdownConfig: {},
      examTypeDropdown: [],
      areaNoDropdown: [],
      patientTypeDropdown: []
    }
  },
  getters: {
    getCommonOptionList: (state) => (value: string) => {
      return state.dropdownConfig[value as keyof CommonList]
    }
  },
  actions: {
    setCommonOptionList(value: CommonList) {
      const optionNameList = Object.keys(value) as (keyof CommonList)[]
      optionNameList.forEach((item) => {
        this.dropdownConfig[item] = value[item]
      })
      console.log('setCommonOptionList', this)
    },
    setExamTypeDropdown(value: ArrList[]) {
      this.examTypeDropdown = value
    },
    setAreaNoDropdown(value: ArrList[]) {
      this.areaNoDropdown = value
    },
    setPatientTypeDropdown(value: ArrList[]) {
      this.patientTypeDropdown = value
    }
  },
  persist: true
})

export const useCommonStoreWithOut = () => {
  return useCommonStore(store)
}
