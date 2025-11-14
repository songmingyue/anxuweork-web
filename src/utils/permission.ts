import { useUserStoreWithOut } from '@/store/modules/user'

// 权限
export const permissionsMsd = (type, code, falseValue = 'True') => {
  const userStore = useUserStoreWithOut()
  const org = userStore.getorganizationID || ''
  const userInfo = Array.isArray(userStore.getUserInfo)
    ? userStore.getUserInfo[0]
    : userStore.getUserInfo

  const { UserRight } = userInfo
  if (org === '-1') {
    return falseValue !== 'True' ? false : true
  }
  // 不是超管检查机构的处理
  if (!type) {
    return false
  }
  if (UserRight[type][code] === falseValue) {
    return true
  }
  return false
}
