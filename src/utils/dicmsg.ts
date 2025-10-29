import { getdicitemlist } from '@/api/authConf'
import { getDicmsg } from '@/api/paramConf'
import { useUserStoreWithOut } from '@/store/modules/user'
const userStore = useUserStoreWithOut()

const userInfo = Array.isArray(userStore.getUserInfo)
  ? userStore.getUserInfo[0]
  : userStore.getUserInfo

export const getdicitemlists = async () => {
  const { data: datas } = await getdicitemlist({
    organizationID: userStore.getorganizationID || ''
  })
  userStore.setDicitemlists(datas)
}

export const getDicmsgList = async () => {
  const { data: datas } = await getDicmsg({
    userInfo
  })
  userStore.setDicmsList(datas)
}
