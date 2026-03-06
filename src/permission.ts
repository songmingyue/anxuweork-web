import router from './router'
import { useTitle } from '@/hooks/web/useTitle'
import { useNProgress } from '@/hooks/web/useNProgress'
import { usePermissionStoreWithOut } from '@/store/modules/permission'
import { usePageLoading } from '@/hooks/web/usePageLoading'
import { NO_REDIRECT_WHITE_LIST } from '@/constants'
import { useUserStoreWithOut } from '@/store/modules/user'
import { setCssVar } from './utils'
// import { getAreaNoDropdown, getDropDownConfig } from './api/common'
// import { useCommonStoreWithOut } from '@/store/modules/common'
const { start, done } = useNProgress()

const { loadStart, loadDone } = usePageLoading()
// const commonStore = useCommonStoreWithOut()
const userStore = useUserStoreWithOut()
router.beforeEach(async (to, from, next) => {
  start()
  loadStart()
  const permissionStore = usePermissionStoreWithOut()
  userStore.setUseMsg()
  if (userStore.getToken) {
    if (to.path === '/login') {
      next()
      return
    } else {
      if (permissionStore.getIsAddRouters) {
        next()
        return
      }
      setCssVar('--tags-view-height', '0px') // 进入页面时先隐藏标签页 这个标签页不要了
      const redirectPath = from.query.redirect || to.path
      const redirect = decodeURIComponent(redirectPath as string)
      const nextData = to.path === redirect ? { ...to, replace: true } : { path: '/workstation' }
      permissionStore.setIsAddRouters(true)
      next(nextData)
      // getDropDownConfig().then((res) => {
      //   commonStore.setExamTypeDropdown(res.data)
      // })
      // getAreaNoDropdown().then((res) => {
      //   commonStore.setAreaNoDropdown(res.data)
      // })
    }
  } else {
    if (NO_REDIRECT_WHITE_LIST.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
    }
  }
})

router.afterEach((to) => {
  useTitle(to?.meta?.title as string)
  done() // 结束Progress
  loadDone()
})
