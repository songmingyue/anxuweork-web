<script setup lang="ts">
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus'
import { ArrowDown, Avatar } from '@element-plus/icons-vue'
import { useDesign } from '@/hooks/web/useDesign'
import UserInfoDialog from './components/UserInfoDialog.vue'
import { ref, computed } from 'vue'
import LockPage from './components/LockPage.vue'
import { useLockStore } from '@/store/modules/lock'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const lockStore = useLockStore()

const getIsLock = computed(() => lockStore.getLockInfo?.isLock ?? false)

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('user-info')

const loginOut = () => {
  userStore.logoutConfirm()
}

const modalPerson = () => {
  dialogVisible.value = true
}
const dialogVisible = ref<boolean>(false)

// const toPage = (path: string) => {
//   push(path)
// }
</script>

<template>
  <ElDropdown class="custom-hover" :class="prefixCls" trigger="click">
    <div class="user-info">
      <!-- <img src="@/assets/imgs/avatar.jpg" alt="" class="avatar" /> -->
      <span class="username"
        ><el-icon :size="15"><Avatar /></el-icon>您好，{{
          userStore.getUserInfoObj?.userName
        }}</span
      >
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </div>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem>
          <div @click="modalPerson"> 个人中心 </div>
        </ElDropdownItem>
        <ElDropdownItem>
          <div @click="loginOut">退出登录</div>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>

  <UserInfoDialog v-if="dialogVisible" v-model="dialogVisible" />
  <teleport to="body">
    <transition name="fade-bottom" mode="out-in">
      <LockPage v-if="getIsLock" />
    </transition>
  </teleport>
</template>

<style scoped lang="less">
.fade-bottom-enter-active,
.fade-bottom-leave-active {
  transition:
    opacity 0.25s,
    transform 0.3s;
}

.fade-bottom-enter-from {
  opacity: 0;
  transform: translateY(-10%);
}

.fade-bottom-leave-to {
  opacity: 0;
  transform: translateY(10%);
}

.user-info {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.avatar {
  width: calc(var(--logo-height) - 25px);
  height: calc(var(--logo-height) - 25px);
  border-radius: 50%;
}

.username {
  display: flex;
  padding-left: 5px;
  font-size: 14px;
  color: var(--el-color-primary);
  align-items: center;
}

@media (width <= 1023px) {
  .username {
    display: none;
  }
}
</style>
