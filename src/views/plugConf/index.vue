<template>
  <div class="plugin-config">
    <!-- 上：服务（有分页） -->

    <el-card body-style="display: flex; align-item: center; justify-content: space-between">
      <el-button type="primary" @click="onCreateService">新增服务</el-button>
      <!-- todo: 应该拆出去，在代码太乱了 -->
      <el-dropdown size="small" type="primary">
        <el-button type="primary" size="small">
          模板<el-icon><ArrowDownBold /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in modalList"
              :key="item.sortNO"
              @click="editModalMed(item)"
            >
              <div class="icon-drop">
                <span>{{ item.name }}</span>
                <div>
                  <el-icon @click.stop="closeModel(item)" class="icon-hover"><CloseBold /></el-icon>
                  <el-icon
                    @click.stop="starModal(item, 'unstar')"
                    class="icon-hover"
                    v-if="item.defaultFlag === '0'"
                    ><Star
                  /></el-icon>
                  <el-icon @click="starModal(item, 'star')" v-else
                    ><StarFilled color="#fbc02d"
                  /></el-icon>
                </div>
              </div>
            </el-dropdown-item>
            <el-dropdown-item divided :icon="Plus" @click="createModal">新增模板</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- 到这里 -->
    </el-card>
    <el-card shadow="never" class="mb8">
      <el-table
        :data="serviceList"
        v-loading="svcLoading"
        border
        highlight-current-row
        @row-click="onServiceRowClick"
        height="273"
        class="mt8"
      >
        <el-table-column prop="serviceUID" label="服务UID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="serviceName" label="任务组名" min-width="200" />
        <el-table-column prop="ifEnable" label="运行状态" min-width="130">
          <template #default="{ row }">
            <el-switch
              v-model="row.ifEnable"
              :active-value="true"
              :inactive-value="false"
              size="small"
              active-text="启用"
              inactive-text="停用"
              @change="() => changeStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="onEditService(row)">编辑</el-button>
            <el-button link type="danger" @click.stop="onDeleteService(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="serviceTotal"
          :page-size="serviceSize"
          :current-page="servicePage"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="onSvcPageChange"
          @size-change="onSvcSizeChange"
        />
      </div>
    </el-card>

    <!-- 下：任务（不分页） -->
    <el-card shadow="never">
      <div class="flex" v-if="activeService?.serviceUID">
        <el-button type="primary" @click="onCreateTask">新增任务</el-button>
        <span style="margin-left: 12px; color: #909399" v-if="activeService">
          当前服务：{{ activeService.serviceName }}（{{ activeService.serviceUID }}）
        </span>
      </div>

      <el-table :data="taskList" v-load ing="taskLoading" border class="mt8">
        <el-table-column prop="pluginUID" label="任务UID" min-width="300" />
        <el-table-column prop="pluginName" label="任务名称" min-width="200" />
        <el-table-column prop="triggerInternal" label="触发间隔" min-width="120" />
        <el-table-column prop="triggerTimes" label="触发次数" min-width="120" />
        <el-table-column prop="ifTriggerByDate" label="是否根据时间触发" min-width="150" />
        <el-table-column prop="triggerBeginTime" label="触发开始时间" min-width="140" />
        <el-table-column prop="triggerEndTime" label="触发结束时间" min-width="140" />
        <el-table-column prop="ifTriggerByDate" label="是否根据日期触发" min-width="150" />
        <el-table-column prop="triggerBeginDate" label="触发开始日期" min-width="160" />
        <el-table-column prop="triggerEndDate" label="触发结束日期" min-width="160" />

        <el-table-column prop="ifEnable" label="状态" width="150" fixed="right">
          <template #default="{ row }">
            <el-switch
              @change="changeSwitch(row)"
              size="small"
              v-model="row.ifEnable"
              active-text="启用"
              inactive-text="停用"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="editPlugin(row)">编辑</el-button>
            <el-button link type="danger" @click.stop="deletepluginservice(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 下表不分页：不渲染 el-pagination -->
    </el-card>

    <!-- 新增服务对话框 -->
    <ServiceConfigDialog
      v-model="showModalDialog"
      :title="modalDialogTitle"
      :model="editModal || undefined"
      @save="onServiceSave" />
    <el-dialog v-model="showServiceModal" :title="serviceDlgTitle" width="600px">
      <el-form :rules="rules" v-model="serviceModal">
        <el-form-item label="任务组名" label-width="80px" required>
          <el-input v-model="serviceModal.serviceName" placeholder="请输入服务名称" />
        </el-form-item>
        <el-form-item label="运行状态" label-width="80px" required>
          <el-select v-model="serviceModal.ifEnable">
            <el-option label="启用" :value="true" />
            <el-option label="停用" :value="false" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showServiceModal = false">取 消</el-button>
        <el-button type="primary" @click="saveService">确 定</el-button>
      </template>
    </el-dialog>
    <TaskConfigDialog
      v-model="showTaskDlg"
      :serviceUID="activeService?.serviceUID || ''"
      :title="dlgTitle"
      :pluginServiceMapUID="pluginServiceMapUID"
      :pluginConfigKeyValue="pluginConfigKeyValue"
      :taskPurposeOptions="taskPurposeOptions"
      :model="editTask || undefined"
      @save="onTaskSave"
  /></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowDownBold, CloseBold, Plus, Star, StarFilled } from '@element-plus/icons-vue'
import {
  ElMessage,
  ElTable,
  ElTableColumn,
  ElCard,
  ElButton,
  ElSwitch,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElPagination,
  ElDialog,
  ElDropdownMenu,
  ElDropdownItem,
  ElDropdown,
  ElIcon
} from 'element-plus'
import ServiceConfigDialog from './components/ServiceConfigDialog.vue'
import {
  createpluginService,
  deletepluginService,
  deletepluginservicemap,
  deletepreset,
  disablepluginservicemap,
  disableService,
  editpluginService,
  getallpluginlist,
  getpluginservicemaplist,
  getservicelist,
  ServiceConfig,
  Servicemaplist,
  updateplugindefault
} from '@/api/plugConf'
import { getpreset, PresetList } from '@/api/authConf'
import { useUserStoreWithOut } from '@/store/modules/user'
import TaskConfigDialog from './components/TaskConfigDialog.vue'
const pluginServiceMapUID = ref('')
const pluginConfigKeyValue = ref('')
// 查询与状态
const svcLoading = ref(false)
const taskLoading = ref(false)
const serviceList = ref<ServiceConfig[]>([])
const serviceTotal = ref(0)
const servicePage = ref(1)
const serviceSize = ref(10)
const activeService = ref<ServiceConfig | null>(null)
const taskList = ref<Servicemaplist[]>([])
const showServiceModal = ref(false)
const serviceModal = ref<ServiceConfig>({
  serviceName: '',
  ifEnable: false
})
const taskPurposeOptions = ref<any[]>([])
const dlgTitle = ref('新增任务')
const editTask = ref({})
const showTaskDlg = ref(false)
// 服务对话框状态
const showModalDialog = ref(false)
const serviceDlgTitle = ref('新增服务信息')
const modalDialogTitle = ref('新增通用模板')
const editService = ref<Partial<ServiceConfig> | null>(null)
const editModal = ref({})
const rules = {
  serviceName: [{ required: true, message: '服务名称不能为空', trigger: 'blur' }],
  ifEnable: [{ required: true, message: '请选择服务状态', trigger: 'change' }]
}

const modalList = ref<PresetList[]>([])
const changeSwitch = async (row: Servicemaplist) => {
  const { isSuccess, message } = await disablepluginservicemap(row)
  if (isSuccess) {
    loadTasks()
    ElMessage.success(message || '操作成功')
  } else {
    ElMessage.warning(message || '操作失败')
  }
}
// 上表：加载服务（有分页）
async function loadServices() {
  svcLoading.value = true
  try {
    const { pageBase, data } = await getservicelist({
      currentPage: servicePage.value,
      pageSize: serviceSize.value
    })
    serviceTotal.value = pageBase?.totalRecords || 0
    serviceList.value = data || []
  } finally {
    svcLoading.value = false
  }
}

const deletepluginservice = async (row: Servicemaplist) => {
  const { isSuccess, message } = await deletepluginservicemap(row)
  if (isSuccess) {
    loadTasks()
    ElMessage.success(message || '操作成功')
  } else {
    ElMessage.warning(message || '操作失败')
  }
}
// 下表：加载任务（不分页）
async function loadTasks() {
  if (!activeService.value) return
  const { ifEnable, serviceName, serviceUID } = activeService.value
  taskLoading.value = true
  try {
    const { data } = await getpluginservicemaplist({
      ifEnable,
      serviceName,
      serviceUID
    })
    taskList.value = data || []
  } finally {
    taskLoading.value = false
  }
}

// 事件
function onServiceRowClick(row: ServiceConfig) {
  activeService.value = row
  loadTasks()
}
function onSvcPageChange(p: number) {
  servicePage.value = p
  loadServices()
}
function onSvcSizeChange(s: number) {
  serviceSize.value = s
  servicePage.value = 1
  loadServices()
}

function onCreateService() {
  serviceDlgTitle.value = '新增服务信息'
  editService.value = {}
  showServiceModal.value = true
}

function onServiceSave(formData: any) {
  console.log('保存服务配置:', formData)
  ElMessage.success('服务配置保存成功')
  getModelList()
  // loadServices()
}

function onEditService(row: ServiceConfig) {
  serviceDlgTitle.value = '编辑服务'
  serviceModal.value = { ...row, ifEnable: row.ifEnable || false }
  showServiceModal.value = true
}

async function onDeleteService(row: ServiceConfig) {
  const { isSuccess, message } = await deletepluginService(row)

  if (isSuccess) {
    ElMessage.success(message || '服务删除成功')
    showServiceModal.value = false
    loadServices()
  } else {
    ElMessage.error(message || '服务删除失败')
  }
  // TODO: 调用API删除服务
}

function onCreateTask() {
  dlgTitle.value = '新增任务'
  editTask.value = {}
  pluginServiceMapUID.value = ''
  pluginConfigKeyValue.value = ''
  showTaskDlg.value = true
}
// 切换状态
const changeStatus = async (row: ServiceConfig) => {
  const { isSuccess, message } = await disableService(row)
  if (isSuccess) {
    ElMessage.success('服务状态修改成功')
    loadServices()
  } else {
    ElMessage.error(`服务状态修改失败: ${message}`)
  }
}
const saveService = async () => {
  let data: any = {}
  if (editService.value && editService.value.serviceUID) {
    data = await editpluginService({
      ...serviceModal.value
    })
  } else {
    data = await createpluginService(serviceModal.value)
  }
  if (data.isSuccess) {
    ElMessage.success('服务保存成功')
    showServiceModal.value = false
    loadServices()
  } else {
    ElMessage.error(`服务保存失败: ${data.message}`)
  }
}
const userStore = useUserStoreWithOut()
const getModelList = async () => {
  // 获取模板列表的逻辑
  const { data } = await getpreset({
    userInfo: userStore.getUserInfo, // 示例参数，根据实际API需求调整
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

const onTaskSave = () => {
  loadTasks()
}

const getPluginlist = async () => {
  const { data } = await getallpluginlist()
  taskPurposeOptions.value = data || []
}
const editPlugin = (row: Servicemaplist) => {
  // 透传用于编辑的关键信息
  pluginServiceMapUID.value = row.pluginServiceMapUID
  pluginConfigKeyValue.value = row.pluginConfigKeyValue
  // 给 TaskConfigDialog 的基础表单回填（名称/用途）
  editTask.value = {
    pluginName: row.pluginName,
    pluginUID: row.pluginUID
  }
  dlgTitle.value = '编辑任务'
  showTaskDlg.value = true
}
// 删除
const closeModel = async (item: PresetList) => {
  const { isSuccess, message } = await deletepreset({
    querySeq: item.querySeq
  })
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
onMounted(() => {
  loadServices()
  getModelList()
  getPluginlist()
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}

.mt8 {
  margin-top: 8px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.flex {
  display: flex;
  align-items: center;
}

.new-modal {
  display: flex;
  border: 1px solid #dcdfe6;
}

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
