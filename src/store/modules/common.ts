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
}

export const useCommonStore = defineStore('commonList', {
  state: (): CommonList => {
    return {}
  },
  getters: {
    getCommonOptionList(value: string) {
      return this[value as keyof CommonList]
    }
  },
  actions: {
    // async getDropDownConfig() {
    //   const { dropdownConfig } = await getDropDownConfig()
    //   this.setCommonOptionList(dropdownConfig)
    // },
    setCommonOptionList(value: CommonList) {
      //   console.log('setCommonOptionList', value)
      const optionNameList = Object.keys(value) as (keyof CommonList)[]
      optionNameList.forEach((item) => {
        this[item] = value[item]
      })
      console.log('setCommonOptionList', this)
    }
  },
  persist: true
})

export const useCommonStoreWithOut = () => {
  return useCommonStore(store)
}
