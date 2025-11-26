import { defineStore } from 'pinia'
import { store } from '../index'
import { UserLoginType, UserType } from '@/api/login/types'
import { ElMessageBox } from 'element-plus'
import { userLogout } from '@/api/login'
import { useTagsViewStore } from './tagsView'
import router from '@/router'
import { DictItemRow } from '@/api/authConf'

interface UserState {
  userInfo?: UserType
  tokenKey: string
  token: string
  roleRouters?: string[] | MenuList[]
  rememberMe: boolean
  loginInfo?: UserLoginType
  dicmisList: MedicalRecordDicItem[]
  dicitemlists: DictItemRow[]
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
  state: (): UserState => {
    return {
      userInfo: undefined,
      tokenKey: 'Authorization',
      token: '',
      roleRouters: undefined,
      // 记住我
      rememberMe: true,
      loginInfo: undefined,
      dicmisList: [],
      dicitemlists: []
    }
  },
  getters: {
    getTokenKey(): string {
      return this.tokenKey
    },
    getToken(): string {
      return this.token
    },
    getUserUID(): string | undefined {
      return (this.userInfo && this.userInfo[0]?.userUID) || ''
    },
    getUserInfo(): UserType | undefined {
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      return this.userInfo
    },
    getUserInfoObj(): UserType | undefined {
      return this.userInfo && this.userInfo[0]
    },
    getorganizationID(): string | undefined {
      return (this.userInfo && this.userInfo[0]?.organizationID) || ''
    },
    getRoleRouters(): string[] | MenuList[] | undefined {
      return this.roleRouters
    },
    getRememberMe(): boolean {
      return this.rememberMe
    },
    getLoginInfo(): UserLoginType | undefined {
      return this.loginInfo
    },
    getDicmisList(): MedicalRecordDicItem[] {
      return this.dicmisList
    },
    getDicitemlists(): DictItemRow[] {
      return this.dicitemlists
    },
    // 获取部门选项
    getDeptOptions(): Array<{ label: string; value: string }> {
      const raw = localStorage.getItem('org')
      const list = raw ? JSON.parse(raw) : []
      if (Array.isArray(list.value)) {
        const isHaveDept = list.value.find((item) => item.value === this.getorganizationID)
        if (isHaveDept) {
          return isHaveDept.DeptMstDto || []
        }
      }
      return []
    }
  },
  actions: {
    setTokenKey(tokenKey: string) {
      this.tokenKey = tokenKey
    },
    setToken(token: string) {
      this.token = token
    },
    setUserInfo(userInfo?: UserType) {
      this.userInfo = userInfo
    },
    setRoleRouters(roleRouters: string[] | MenuList[]) {
      this.roleRouters = roleRouters
    },
    logoutConfirm() {
      ElMessageBox.confirm('是否退出本系统', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const res = await userLogout().catch(() => {})
          if (res) {
            this.reset()
          }
        })
        .catch(() => {})
    },
    reset() {
      const tagsViewStore = useTagsViewStore()
      tagsViewStore.delAllViews()
      this.setToken('')
      this.setUserInfo(undefined)
      this.setRoleRouters([])
      router.replace('/login')
    },
    logout() {
      this.reset()
    },
    setRememberMe(rememberMe: boolean) {
      this.rememberMe = rememberMe
    },
    setLoginInfo(loginInfo: UserLoginType | undefined) {
      this.loginInfo = loginInfo
    },
    setDicmsList(dicmisList: any[]) {
      this.dicmisList = dicmisList
    },
    setDicitemlists(dicitemlists: DictItemRow[]) {
      this.dicitemlists = dicitemlists
    }
  },
  persist: true
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
