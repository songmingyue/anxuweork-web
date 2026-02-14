import { defineStore } from 'pinia'
import { store } from '../index'

export interface UserMsg {
  account: string
  desc?: string
  permission?: number
  role?: string
  status?: number
  token: string
  userName: string
}
type Flag = '0' | '1'
export interface MedicalRecordDicItem {
  typeCode: string
  itemCode: string
  organizationID: string
  itemName: string
  // 后端当前返回为字符串，若需要数值排序可在使用处转 number
  sortNO: string
  defaultFlag: Flag
  deleteFlag: Flag
}
export const useUserStore = defineStore('user', {
  state: (): UserMsg => {
    return {
      account: '',
      token: '',
      userName: ''
    }
  },
  getters: {
    getToken(): string {
      return this.token
    },
    getUserName(): string {
      return this.userName
    },
    getAccount(): string {
      return this.account
    }
  },
  actions: {
    setUseMsg() {
      const usersString = localStorage.getItem('userMsg')
      if (!usersString) return
      const userMsg: UserMsg = JSON.parse(usersString)
      this.account = userMsg.account
      this.token = userMsg.token
      this.userName = userMsg.userName
    },
    setLocalstorage(userMsg: UserMsg) {
      localStorage.setItem('userMsg', JSON.stringify(userMsg))
    },
    setToken(token: string) {
      this.token = token
      localStorage.setItem(
        'userMsg',
        JSON.stringify({ token, account: this.account, userName: this.userName })
      )
    },
    logoutConfirm() {
      this.account = ''
      this.token = ''
      this.userName = ''
    }
  },
  persist: true
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
