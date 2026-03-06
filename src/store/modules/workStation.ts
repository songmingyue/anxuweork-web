import { defineStore } from 'pinia'
import { store } from '../index'
import { getTableConfig } from '@/api/workstation'

export interface TableList {
  // table 数据
  order: number // 排序
  label: string
  prop: string // key
  selected: boolean
  sort: boolean
  fix: boolean
  width: string
}

export interface StateMsg {
  tableList: TableList[]
}

export const useWorkStationStore = defineStore('workStation', {
  state: (): StateMsg => {
    return {
      tableList: []
    }
  },
  getters: {
    getTableList(state): TableList[] {
      return state.tableList
    }
  },
  actions: {
    async asyncSetTableList() {
      const { data, status, desc } = await getTableConfig()
      if (status === 0) {
        this.tableList = data
      } else {
        console.error('获取失败', desc)
      }
    }
  },
  persist: true
})

export function useWorkStationStoreWithOut() {
  return useWorkStationStore(store)
}
