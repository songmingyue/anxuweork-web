<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  ElMessage,
  ElMessageBox,
  ElTable,
  ElTableColumn,
  ElCard,
  ElInput,
  ElPagination,
  ElButton,
  ElForm,
  ElFormItem,
  ElTag,
  ElDivider,
  ElDialog,
  ElUpload,
  ElIcon
} from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  deleteDepartment,
  deleteOrganization,
  DepSearch,
  DeptOnce,
  getDepartmentList,
  getOneOrg,
  getorganizationtree,
  OrganizationTreeProto,
  uploadlogo,
  orgUploadTheme
} from '@/api/userMessage'
import { createDepartment, editDepartment } from '@/api/userMessage'
import NewOrganizationDialog from './components/NewOrganizationDialog.vue'
import DepartmentFormDialog from './components/DepartmentFormDialog.vue'
import { getDicmsg } from '@/api/paramConf'
// 上表：机构查询
const orgQuery = reactive({ searchOrganizationID: '', organizationName: '' })
const fileList = ref<Array<File>>([])
const orgLoading = ref(false)
const orgList = ref<OrganizationTreeProto[]>([])
const uploadFormRef = ref()
const imageUrl = ref<string>('')
const uploadForm = ref<any>({})
const activeOrg = ref<DepSearch>({
  pageSize: 10,
  currentPage: 1
})

const dialogMsg = ref({
  isShowDialog: false,
  isEdit: false,
  EditData: {}
})
// 下表：科室查询 + 分页
const deptQuery = reactive({ deptID: '', deptName: '' })
const deptLoading = ref(false)
const deptList = ref<DeptOnce[]>([])
const rowMsg = ref<any>({})
const deptTotal = ref(0)
const deptPageSize = ref(10)
const deptCurrent = ref(1)
const uploadVisible = ref(false)
const uploadTheme = ref(false)
// 科室新增/编辑弹窗
const deptDialogVisible = ref(false)
const deptDialogIsEdit = ref(false)
const deptDialogFormData = ref<any>({})
// 医技科室分类选项（可改为从字典接口获取）
const examClassOptions = ref<Array<{ label: string; value: string }>>()

const deptTypeOptions = ref<Array<{ label: string; value: string }>>([])

// 加载机构（无分页）
async function loadOrganizations() {
  orgLoading.value = true
  try {
    const list = await getorganizationtree(orgQuery)
    orgList.value = list.data || []
  } finally {
    orgLoading.value = false
  }
}

// 加载科室（有分页）
async function loadDepts() {
  deptLoading.value = true
  activeOrg.value = Object.assign(activeOrg.value, deptQuery, {
    pageSize: deptPageSize.value,
    currentPage: deptCurrent.value
  })
  try {
    const datas = await getDepartmentList(activeOrg.value)
    deptList.value = datas.data || []
    deptTotal.value = datas.pageBase?.totalRecords || 0
  } finally {
    deptLoading.value = false
  }
}

// 事件
function onSearchOrg() {
  activeOrg.value = { pageSize: deptPageSize.value, currentPage: 1 }
  loadOrganizations()
}
function onOrgRowClick(row: any) {
  deptCurrent.value = 1
  activeOrg.value = { ...row, pageSize: deptPageSize.value, currentPage: deptCurrent.value }
  loadDepts()
}
function onSearchDept() {
  deptCurrent.value = 1
  loadDepts()
}
function onDeptPageChange(p: number) {
  deptCurrent.value = p
  loadDepts()
}
function onDeptSizeChange(s: number) {
  deptPageSize.value = s
  deptCurrent.value = 1
  loadDepts()
}

function onAddDept() {
  deptDialogIsEdit.value = false
  deptDialogFormData.value = {
    deptCode: '',
    deptName: '',
    deptType: '',
    examClass: '',
    officePhoneNO: '',
    memo: ''
  }
  deptDialogVisible.value = true
}

function onEditDept(row: any) {
  deptDialogIsEdit.value = true
  deptDialogFormData.value = {
    deptCode: row.deptID || row.deptCode || '',
    deptName: row.deptName || '',
    deptType: row.deptType || '',
    examClass: row.examClass || '',
    officePhoneNO: row.officePhoneNO || row.phone || '',
    memo: row.memo || row.remark || ''
  }
  deptDialogVisible.value = true
}

async function onConfirmDept(payload: any) {
  // 合并组织信息
  const req = {
    ...payload,
    deptOrganizationID: activeOrg.value.searchOrganizationID
  } as DeptOnce
  const isEdit = deptDialogIsEdit.value
  const api = isEdit ? editDepartment : createDepartment
  const { isSuccess, message } = await api(req)
  if (isSuccess) {
    ElMessage.success(message || '操作成功')
    deptDialogVisible.value = false
    loadDepts()
  } else {
    ElMessage.error(message || '操作失败')
  }
}
const onUploadBackground = async (row) => {
  const { data, isSuccess, message } = await getOneOrg({
    searchOrganizationID: row.searchOrganizationID || row.organizationID
  })
  if (isSuccess) {
    imageUrl.value = data[0]?.logoFile || ''
    uploadVisible.value = true
    rowMsg.value = row
  } else {
    ElMessage.error(message || '获取机构信息失败')
    return
  }
}

const onUploadTheme = (row) => {
  rowMsg.value = row
  uploadTheme.value = true
}

function onCreateOrgChild(row: any) {
  dialogMsg.value.EditData = {
    parentOrganizationID: row.searchOrganizationID || row.organizationID
  }
  dialogMsg.value.isShowDialog = true
  dialogMsg.value.isEdit = false
}
async function onEditOrg(row: any) {
  const { data, isSuccess, message } = await getOneOrg({
    searchOrganizationID: row.searchOrganizationID || row.organizationID
  })
  if (isSuccess) {
    dialogMsg.value.EditData = data[0]
  } else {
    ElMessage.error(message || '获取机构信息失败')
    return
  }
  dialogMsg.value.isShowDialog = true
  dialogMsg.value.isEdit = true
}
function onDeleteOrg(row: any) {
  ElMessageBox.confirm(`确认删除机构【${row.organizationName}】吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const { isSuccess, message } = await deleteOrganization(row)
      if (isSuccess) {
        ElMessage.success(message)
        loadOrganizations()
      } else {
        ElMessage.error(message)
      }
    } catch (error) {
      console.error('删除机构失败', error)
    }
  })
}
const onDeleteDept = (row: any) => {
  ElMessageBox.confirm(`确认删除科室【${row.deptName}】吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const req = Object.assign(row, { searchOrganizationID: activeOrg.value.searchOrganizationID })
      const { isSuccess, message } = await deleteDepartment(req)
      if (isSuccess) {
        ElMessage.success(message)
        loadDepts()
      } else {
        ElMessage.error(message)
      }
    } catch (error) {
      console.error('删除机构失败', error)
    }
  })
}
// 获取医技科室类型字典数据
const getDicmsgClassList = async () => {
  try {
    const { data, isSuccess } = await getDicmsg({
      typeCode: 'ExamClass',
      userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')[0]
    })
    if (isSuccess) {
      examClassOptions.value = data.map((item: any) => ({
        label: item.itemName,
        value: item.itemCode
      }))
    }
  } catch (error) {
    console.error('获取字典数据失败', error)
  }
}
// 获取科室类型字典数据
const getDicmsgList = async () => {
  try {
    const { data, isSuccess } = await getDicmsg({
      typeCode: 'DeptType',
      userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')[0]
    })
    if (isSuccess) {
      deptTypeOptions.value = data.map((item: any) => ({
        label: item.itemName,
        value: item.itemCode
      }))
    }
    getDicmsgClassList()
  } catch (error) {
    console.error('获取字典数据失败', error)
  }
}
const confirms = () => {
  dialogMsg.value.isShowDialog = false
  setTimeout(() => {
    console.log('message12121212')
    loadOrganizations()
  }, 10)
}
// 上传前校验文件类型与大小
const beforeAvatarUpload = (rawFile: File) => {
  const isImage = rawFile.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('仅支持上传图片文件')
    return false
  }
  return true
}

// 选择图片后，缓存文件并生成预览
const handleFileChange = (file: any) => {
  uploadForm.value.logoFile = file?.raw || null
  if (uploadForm.value.logoFile) {
    imageUrl.value = URL.createObjectURL(uploadForm.value.logoFile)
  }
}
const sureUpload = async () => {
  if (!imageUrl.value) {
    ElMessage.error('请先选择要上传的图片文件')
    return
  }
  if (!uploadForm.value.logoFile) {
    ElMessage.error('文件未更换')
    return
  }
  // 仅在点击“确定”时以 FormData 上传
  const formData = new FormData()
  formData.append('organizationID', rowMsg.value.searchOrganizationID)
  formData.append('file', uploadForm.value.logoFile)
  const resp = await uploadlogo(formData)
  // 若后端返回图片地址则回填

  if (resp.data.isSuccess) {
    uploadVisible.value = false
    imageUrl.value = ''
  } else {
    ElMessage.error(resp.data.message)
  }
}
const isLoadingUpload = ref(false)
const handleChange = async (file) => {
  isLoadingUpload.value = true
  const formData = new FormData()
  formData.append('organizationID', rowMsg.value.searchOrganizationID)
  formData.append('file', file.raw)
  try {
    const data = await orgUploadTheme(formData)
    if (data.data.isSuccess) {
      uploadVisible.value = false
      imageUrl.value = ''
    } else {
      ElMessage.error(data.data.message)
    }
    isLoadingUpload.value = false
  } catch (error) {
    isLoadingUpload.value = false
  }
}
onMounted(() => {
  loadOrganizations()
  getDicmsgList()
})
</script>

<template>
  <div class="page org-dept-manage">
    <!-- 上：机构（无分页） -->
    <el-card shadow="never" class="mb8 padding-none">
      <el-form :inline="true" label-width="70px" label-position="left">
        <el-form-item label="机构编号">
          <el-input
            v-model="orgQuery.searchOrganizationID"
            placeholder="请输入机构编号"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="机构名称">
          <el-input
            v-model="orgQuery.organizationName"
            placeholder="请输入机构名称"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearchOrg">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" class="mb8 flex-card card-table nopadding-card nopadding-card-top">
      <div class="table-wrap">
        <el-table
          :data="orgList"
          v-loading="orgLoading"
          default-expand-all
          row-key="searchOrganizationID"
          highlight-current-row
          @row-click="onOrgRowClick"
          :style="{ width: '100%' }"
          :header-cell-style="{ textAlign: 'center', background: '#f5f7fa', padding: '13px' }"
          height="100%"
        >
          <el-table-column
            prop="searchOrganizationID"
            label="机构编号"
            min-width="220"
            fixed="left"
          />
          <el-table-column
            prop="organizationName"
            align="center"
            label="机构名称"
            min-width="200"
          />
          <el-table-column
            prop="organizationCode"
            align="center"
            label="组织机构代码"
            min-width="160"
          />
          <el-table-column
            prop="createDate"
            label="创建时间"
            min-width="120"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="memo"
            label="备注"
            align="center"
            min-width="160"
            show-overflow-tooltip
          />
          <el-table-column prop="alias" label="别名" align="center" min-width="160" />
          <el-table-column prop="province" label="省份" align="center" min-width="160" />
          <el-table-column
            prop="city"
            label="城市"
            align="center"
            min-width="160"
            show-overflow-tooltip
          />
          <el-table-column
            prop="district"
            label="区县"
            align="center"
            min-width="160"
            show-overflow-tooltip
          />
          <el-table-column
            prop="officePhoneNO"
            label="电话"
            align="center"
            min-width="160"
            show-overflow-tooltip
          />
          <el-table-column
            prop="email"
            label="邮箱"
            align="center"
            min-width="160"
            show-overflow-tooltip
          />
          <el-table-column
            prop="defaultShareDuration"
            label="默认分享时间（小时）"
            align="center"
            min-width="170"
          >
            <template #default="{ row }">
              <el-tag>{{ row.defaultShareDuration || '0' }}小时</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="cardBackgroundColour" label="背景颜色" min-width="160" />

          <el-table-column label="操作" width="310" fixed="right">
            <template #default="{ row }">
              <el-button size="small" link type="primary" @click.stop="onCreateOrgChild(row)"
                >新增下级机构</el-button
              >
              <el-button size="small" link type="primary" @click.stop="onUploadBackground(row)"
                >上传背景</el-button
              >
              <el-button size="small" link type="primary" @click.stop="onUploadTheme(row)"
                >更换主题</el-button
              >
              <el-button size="small" link type="primary" @click.stop="onEditOrg(row)"
                >编辑</el-button
              >
              <el-button size="small" link type="danger" @click.stop="onDeleteOrg(row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    <!-- 上表不分页：不放 el-pagination 即可 -->

    <!-- 分割线 -->
    <el-divider />

    <!-- 下：科室（有分页） -->
    <el-card shadow="never" class="mb8 padding-none">
      <el-form
        :inline="true"
        label-width="70px"
        label-position="left"
        style="width: 1240px; overflow: auto"
      >
        <el-form-item label="科室编号">
          <el-input
            v-model="deptQuery.deptID"
            placeholder="请输入"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="科室名称">
          <el-input
            v-model="deptQuery.deptName"
            placeholder="请输入"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearchDept" :disabled="!activeOrg">搜索</el-button>
          <el-button @click="onAddDept">新增科室</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" class="mb8 flex-card nopadding-card-top card-table">
      <div class="table-wrap">
        <el-table
          :data="deptList"
          v-loading="deptLoading"
          :style="{ width: '100%' }"
          :header-cell-style="{ textAlign: 'center', background: '#f5f7fa', padding: '13px' }"
          height="100%"
        >
          <el-table-column
            prop="deptID"
            label="科室编号"
            align="center"
            min-width="120"
            sortable
            show-overflow-tooltip
          />
          <el-table-column
            prop="deptName"
            label="科室名称"
            min-width="160"
            align="center"
            sortable
            show-overflow-tooltip
          />
          <el-table-column
            prop="deptTypeName"
            label="科室类型"
            min-width="120"
            align="center"
            sortable
            show-overflow-tooltip
          />
          <el-table-column
            prop="examClassName"
            label="医技科室分类"
            min-width="140"
            sortable
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="officePhoneNO"
            label="电话"
            min-width="140"
            align="center"
            sortable
            show-overflow-tooltip
          />
          <el-table-column
            prop="memo"
            label="备注"
            min-width="160"
            align="center"
            show-overflow-tooltip
            sortable
          />
          <el-table-column prop="deleteFlag" label="删除" width="90" align="center" sortable />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link size="small" type="primary" @click.stop="onEditDept(row)"
                >编辑</el-button
              >
              <el-button link size="small" type="danger" @click.stop="onDeleteDept(row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="deptTotal"
          :page-size="deptPageSize"
          :current-page="deptCurrent"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="onDeptPageChange"
          @size-change="onDeptSizeChange"
        />
      </div>
    </el-card>
    <NewOrganizationDialog
      v-if="dialogMsg.isShowDialog"
      v-model:visible="dialogMsg.isShowDialog"
      :isEdit="dialogMsg.isEdit"
      :EditData="dialogMsg.EditData"
      @confirm="confirms"
    />
    <DepartmentFormDialog
      v-model:visible="deptDialogVisible"
      :isEdit="deptDialogIsEdit"
      :formData="deptDialogFormData"
      :examClassOptions="examClassOptions"
      :deptTypeOptions="deptTypeOptions"
      @confirm="
        (item) => {
          deptDialogVisible = false
          onConfirmDept(item)
        }
      "
    />
    <el-dialog title="上传图片" v-model="uploadVisible" width="500px">
      <el-form :model="uploadForm" label-width="110px" ref="uploadFormRef">
        <el-form-item label="背景图" prop="file">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :auto-upload="false"
            :before-upload="beforeAvatarUpload"
            :on-change="handleFileChange"
            accept=".png"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" @click="sureUpload">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog title="更换主题" v-model="uploadTheme" width="500px">
      <el-form :model="uploadForm" label-width="0px" ref="uploadFormRef">
        <el-form-item label="" prop="file">
          <el-upload
            :auto-upload="false"
            v-model:file-list="fileList"
            class="upload-demo"
            :on-change="handleChange"
            accept=".zip"
          >
            <el-button type="primary">更换主题</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :loading="isLoadingUpload" @click="uploadTheme = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

/* 让页面内容占满可视高度 */
.org-dept-manage {
  display: flex;
  height: 100vh; /* 如果有外层布局头部占位，可酌情减去高度 */
  min-height: 0;
  box-sizing: border-box;
  flex-direction: column;
}

/* 让卡片主体可伸缩 */
.flex-card {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  overflow: hidden;
}

/* 让 el-card 内部 body 成为可伸缩容器 */
.flex-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}

/* 让表格撑满卡片剩余空间 */
.table-wrap {
  flex: 1 1 0;
  min-height: 0; /* 避免子元素高度塌陷 */
}

.avatar-uploader .avatar {
  display: block;
  width: 178px;
  height: 178px;
}

/* 让“更换主题”已上传文件列表区域更高并可滚动 */
.upload-demo :deep(.el-upload-list) {
  max-height: 260px;
  min-height: 140px;
  padding: 8px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}
</style>
