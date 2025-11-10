<template>
  <el-dropdown size="small" type="primary">
    <el-button type="primary" size="small">
      模板<el-icon><ArrowDownBold /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="item in modalList" :key="item.sortNO" @click="editModalMed(item)">
          <div class="icon-drop">
            <span>{{ item.name }}</span>
            <div>
              <el-icon @click.stop="closeModel(item)" class="icon-hover"><CloseBold /></el-icon>
              <el-icon
                @click.stop="starModal(item, 'unstar')"
                class="icon-hover"
                v-if="item.defaultFlag === '0'"
              >
                <Star />
              </el-icon>
              <el-icon @click.stop="starModal(item, 'star')" v-else>
                <StarFilled color="#fbc02d" />
              </el-icon>
            </div>
          </div>
        </el-dropdown-item>
        <el-dropdown-item divided :icon="Plus" @click="createModal">新增模板</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <!-- 模板编辑弹窗 -->
  <ServiceConfigDialog
    v-model="showModalDialog"
    :title="modalDialogTitle"
    :model="editModal || undefined"
    @save="onServiceSave"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowDownBold, CloseBold, Plus, Star, StarFilled } from '@element-plus/icons-vue'
import {
  ElMessage,
  ElButton,
  ElIcon,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu
} from 'element-plus'
import ServiceConfigDialog from './ServiceConfigDialog.vue'
import { getpreset, PresetList } from '@/api/authConf'
import { deletepreset } from '@/api/plugConf'
import { updateplugindefault } from '@/api/plugConf'
import { useUserStoreWithOut } from '@/store/modules/user'

const modalList = ref<PresetList[]>([])
const showModalDialog = ref(false)
const modalDialogTitle = ref('新增通用模板')
const editModal = ref<any>({})

const userStore = useUserStoreWithOut()

const getModelList = async () => {
  const { data } = await getpreset({
    userInfo: userStore.getUserInfo,
    queryType: 'plugin'
  })
  modalList.value = data || []
}

const createModal = () => {
  modalDialogTitle.value = '新增通用模板'
  editModal.value = {}
  showModalDialog.value = true
}

const editModalMed = (item: PresetList) => {
  modalDialogTitle.value = '编辑通用模板'
  editModal.value = { ...item }
  showModalDialog.value = true
}

const closeModel = async (item: PresetList) => {
  const { isSuccess, message } = await deletepreset({ querySeq: item.querySeq })
  if (isSuccess) {
    ElMessage.success(message || '操作成功')
    await getModelList()
  } else {
    ElMessage.error(message || '操作失败')
  }
}

const starModal = async (item: PresetList, type: 'star' | 'unstar') => {
  const { isSuccess, message } = await updateplugindefault({
    ...item,
    defaultFlag: type === 'star' ? '0' : '1'
  })
  if (isSuccess) {
    ElMessage.success(message || '操作成功')
    await getModelList()
  } else {
    ElMessage.error(message || '操作失败')
  }
}

const onServiceSave = () => {
  getModelList()
}

onMounted(() => {
  getModelList()
})
</script>

<style scoped>
.icon-drop {
  display: flex;
  justify-content: space-between;
  min-width: 150px;
  align-items: center;
  padding: 2px 10px;
}

.icon-hover {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.icon-hover:hover {
  transform: rotate(90deg);
}
</style>
