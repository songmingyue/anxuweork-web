<template>
  <div class="sys-param">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane v-for="g in groups" :key="g.key" :name="g.key">
        <template #label>
          <div class="collapse-title">
            <!-- <svg class="hdr-icon" aria-hidden="true">
              <use :xlink:href="g.icon" />
            </svg> -->
            <span :style="g.key === activeTab ? 'color: var(--color)' : ''" class="title">{{
              g.title
            }}</span>
          </div>
        </template>

        <div class="group-body">
          <el-row v-for="item in items[g.key]" :key="item.key" :gutter="40" class="cfg-item">
            <el-col :span="8" :xs="10" class="flex-col" @click="onConfig(item)">
              <el-tooltip effect="dark" :content="item.name" placement="top">
                <div class="name">
                  <el-tooltip class="box-item" effect="dark" content="设置" placement="top-start">
                    <el-icon :size="25"><Setting /></el-icon>
                  </el-tooltip>
                  <span class="name-text">{{ item.name }}</span>
                </div>
              </el-tooltip>
            </el-col>
            <el-col :span="14" :xs="10" class="flex-col">
              <el-tooltip v-if="item.desc" effect="dark" :content="item.desc" placement="top">
                <div class="desc">{{ item.desc }}</div>
              </el-tooltip>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 拆分任务插入上传和推送表配置 弹窗 -->
    <SplitTaskConfigDialog v-model="showSplitTaskDlg" :model="splitTaskModel" @save="onSplitSave" />
    <!-- 收费状态默认值配置 弹窗 -->
    <ChargeStatusDefaultDialog :value="editData.value || '0'" v-model="showChargeDlg" />
    <!-- 通用参数 弹窗 -->
    <SimpleParamDialog
      v-model="showSimpleDlg"
      :title="simpleTitle"
      :value="simpleValue"
      :codeNameVal="editData.code"
      :placeholder="simplePlaceholder"
      :textarea="simpleTextarea"
    />
    <!-- PACS 相关功能配置 弹窗 -->
    <PacsConfigDialog v-model="showPacsDlg" :model="pacsModel" />
    <!-- 检查分组弹窗：浏览报告自动从云端下载 -->
    <BoolSelectDialog
      v-model="showAutoCloudDlg"
      title="浏览报告自动从云端下载"
      label="是否自动从云端下载"
      :value="autoCloudVal"
      @save="onAutoCloudSave"
    />
    <!-- 影像浏览器读取配置 -->
    <ImageViewerConfigDialog v-model="showImageViewerDlg" :model="imageViewerModel" />
    <!-- 前端页面是否可以重复打印报告 -->
    <BoolSelectDialog
      v-model="showReprintDlg"
      title="前端页面是否可以重复打印报告"
      label="前端页面是否可以重复打印报告"
      :value="reprintVal"
      @save="onReprintSave"
    />
    <!-- 互联网互通配置 -->
    <InterconnectConfigDialog v-model="showInterconnectDlg" :model="interconnectModel" />
    <!-- 检查锁定方式 -->
    <ExamLockMethodDialog v-model="showExamLockDlg" :model="examLockModel" @save="onExamLockSave" />
    <!-- 检查信息表格导出配置 -->
    <ExportTableConfigDialog
      v-model="showExportDlg"
      :selected="exportSelected"
      @save="onExportSave"
    />

    <!-- 打印相关配置 -->
    <PrintConfigDialog v-model="showPrintDlg" :model="printModel" @save="onPrintSave" />
    <!-- 河南省平台相关配置 -->
    <HeNanProvinceConfigDialog v-model="showHeNanDlg" :model="heNanModel" />
    <!-- 浙江省平台相关配置 -->
    <ZJProvinceConfigDialog v-model="showZJDlg" :model="zjModel" @save="onZJSave" />
    <!-- 消息系统配置 -->
    <MessageSystemConfigDialog v-model="showMsgDlg" :model="msgModel" @save="onMsgSave" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElTabs, ElTabPane, ElTooltip, ElCol, ElRow, ElIcon } from 'element-plus'
import SplitTaskConfigDialog from './components/SplitTaskConfigDialog.vue'
import ChargeStatusDefaultDialog from './components/ChargeStatusDefaultDialog.vue'
import SimpleParamDialog from './components/SimpleParamDialog.vue'
import PacsConfigDialog from './components/PacsConfigDialog.vue'
import BoolSelectDialog from './components/BoolSelectDialog.vue'
import ImageViewerConfigDialog from './components/ImageViewerConfigDialog.vue'
import InterconnectConfigDialog from './components/InterconnectConfigDialog.vue'
import ExamLockMethodDialog from './components/ExamLockMethodDialog.vue'
import ExportTableConfigDialog from './components/ExportTableConfigDialog.vue'
import PrintConfigDialog from './components/PrintConfigDialog.vue'
import HeNanProvinceConfigDialog from './components/HeNanProvinceConfigDialog.vue'
import MessageSystemConfigDialog from './components/MessageSystemConfigDialog.vue'
import ZJProvinceConfigDialog from './components/ZJProvinceConfigDialog.vue'
import { Setting } from '@element-plus/icons-vue'
import {
  CodeName,
  editsysparametersingle,
  getpreset,
  getsysparametersingle,
  SettingValue
} from '@/api/authConf'
import { useUserStoreWithOut } from '@/store/modules/user'
// import { method } from 'lodash-es'

// 导出列项类型（与 ExportTableConfigDialog 中 Options 保持一致）
type ExportOption = { prop: string; label: string; sort: boolean; width: number }

type CfgItem = { key: string; name: string; desc?: string }
type GroupKey = 'plugin' | 'exam' | 'systemPath'
interface Group {
  key: GroupKey
  title: string
  icon: string
}
const dialogMsg = ref('')
const groups: Group[] = [
  { key: 'plugin', title: '插件', icon: '#icon-a-bianzu23' },
  { key: 'exam', title: '检查', icon: '#icon-jiancharenwufenpei' },
  { key: 'systemPath', title: '系统参数', icon: '#icon-jiancharenwufenpei' }
]

const items: Record<GroupKey, CfgItem[]> = {
  // 插件（图2）
  plugin: [
    { key: 'GainServiceBaseAddress', name: '采集程序服务地址', desc: '采集程序根据这个地址启动' }
  ],
  exam: [
    { key: 'CheckInfoTableConfig', name: '检查信息表格导出配置', desc: '检查信息表格导出配置' }
  ],
  systemPath: [
    { key: 'UploadLogoMainPath', name: '上传logo绝对路径', desc: '上传logo绝对路径' },
    { key: 'TokenConfig', name: '系统参数增加', desc: '系统参数增加' }
  ]
}

// 默认选中的分组 Tab
const activeTab = ref<GroupKey>('plugin')
const showSplitTaskDlg = ref(false)
const splitTaskModel = ref<any>({})
const showChargeDlg = ref(false)
// PACS 弹窗
const showPacsDlg = ref(false)
const pacsModel = ref<any>({})
// exam 相关弹窗
const showAutoCloudDlg = ref(false)
const autoCloudVal = ref<boolean>(false)
const showImageViewerDlg = ref(false)
const imageViewerModel = ref<{
  code: CodeName
  value: string
}>()
const showReprintDlg = ref(false)
const reprintVal = ref<boolean>(true)
const showInterconnectDlg = ref(false)
const interconnectModel = ref<{ url: string; key: string }>({ url: '', key: '' })
const showExamLockDlg = ref(false)
const examLockModel = ref<{ value: string }>({ value: '' })
// 导出表格配置
const showExportDlg = ref(false)
// 系统、平台、消息等弹窗
const editData = ref<SettingValue>({
  code: CodeName.GainServiceName,
  value: ''
})
const showPrintDlg = ref(false)
const printModel = ref<{ judgeByLevel: boolean; pluginType: 'legacy' | 'inhouse' }>({
  judgeByLevel: false,
  pluginType: 'legacy'
})
const showHeNanDlg = ref(false)
const heNanModel = ref<{ regUrl: string; vendorId: string; vendorSecret: string }>({
  regUrl: '',
  vendorId: '',
  vendorSecret: ''
})
const showMsgDlg = ref(false)
const msgModel = ref<{ url: string }>({ url: '' })
const showZJDlg = ref(false)
const zjModel = ref<any>({})
// 基础列清单（与弹窗内置列保持一致）

// 通用简单参数弹窗
const showSimpleDlg = ref(false)
const simpleTitle = ref('')
const simpleValue = ref('')
const simplePlaceholder = ref('请输入')
const simpleTextarea = ref(false)
const exportSelected = ref<ExportOption[]>([])
function openSimple(title: string, placeholder = '请输入', textarea = false) {
  simpleTitle.value = title // 设置标题
  simplePlaceholder.value = placeholder // 设置占位符
  simpleValue.value = editData.value.value // 设置初始值
  simpleTextarea.value = textarea // 设置是否为多行文本框
  showSimpleDlg.value = true // 显示弹窗
}

async function onConfig(item: CfgItem) {
  const { data } = await getsysparametersingle({
    code: item.key as CodeName
  })
  editData.value = data[0]
  dialogMsg.value = (data as any)?.[0]?.value ?? ''
  if (item.key === 'InsertTaskInfo') {
    splitTaskModel.value = JSON.parse((data as any)?.[0]?.value)
    showSplitTaskDlg.value = true
    return
  }
  if (item.key === 'DigitalImageNeedDefaultValue') {
    showChargeDlg.value = true
    return
  }
  if (item.key === 'QRConfig') {
    pacsModel.value = (data as any)?.[0]?.value || {}
    showPacsDlg.value = true
    return
  }
  // 检查（图4）分组的弹窗
  if (item.key === 'ISDownloadReportInWebAuto') {
    // autoCloudVal.value = Boolean((data as any)?.[0]?.value ?? false)
    autoCloudVal.value = (data as any)?.[0]?.value === 'true'
    showAutoCloudDlg.value = true
    return
  }
  if (item.key === 'ImageViewConfig') {
    imageViewerModel.value = data[0]
    showImageViewerDlg.value = true
    return
  }
  if (item.key === 'IsCanRePrint') {
    reprintVal.value = (data as any)?.[0]?.value === 'true'
    showReprintDlg.value = true
    return
  }
  if (item.key === 'RelatedExamConfig') {
    const msg = { url: '', key: '' }
    if ((data as any)?.[0]?.value) {
      Object.assign(msg, JSON.parse((data as any)?.[0]?.value))
    }
    interconnectModel.value = msg
    showInterconnectDlg.value = true
    return
  }
  if (item.key === 'ExamLockMethod') {
    const msg = { value: '' }
    if ((data as any)?.[0]?.value) {
      Object.assign(msg, JSON.parse((data as any)?.[0]?.value))
    }
    examLockModel.value = msg
    showExamLockDlg.value = true
    return
  }
  if (item.key === 'CheckInfoTableConfig') {
    const userStore = useUserStoreWithOut()
    const tableData = await getpreset({
      userInfo: userStore.getUserInfo
    })
    console.log('tableData:', tableData)
    exportSelected.value = []
    if (tableData.data && tableData.data.length > 0) {
      const newTable = tableData.data.filter(
        (item) => item.queryType === 'CustomExportColumns' && item.userUID
      )
      if (newTable.length > 0) {
        exportSelected.value = JSON.parse(newTable[0]?.queryCondition) || []
      } else {
        exportSelected.value = []
      }
    }

    showExportDlg.value = true
    return
  }

  if (item.key === 'PrintConfig') {
    printModel.value = (data as any)?.[0]?.value || { judgeByLevel: false, pluginType: 'legacy' }
    showPrintDlg.value = true
    return
  }
  // 省平台与其他
  if (item.key === 'HeNanProviceImageAppInfo') {
    heNanModel.value = (data as any)?.[0]?.value || {
      regUrl: '',
      vendorId: '',
      vendorSecret: ''
    }
    showHeNanDlg.value = true
    return
  }
  if (item.key === 'ProvinceSXConfig') {
    const {
      ImageAppInfo,
      InterconnectDataConfig,
      LocalFileDirectory,
      ProvinceAddress,
      RegisterServiceAddress,
      StorageInfo
    } = JSON.parse((data as any)?.[0]?.value) || {}
    zjModel.value = {
      ImageAppInfo: JSON.parse(ImageAppInfo || '{}'),
      InterconnectDataConfig,
      LocalFileDirectory,
      ProvinceAddress,
      RegisterServiceAddress,
      StorageInfo: JSON.parse(StorageInfo || '{}')
    }

    showZJDlg.value = true
    return
  }
  // 其余简单参数配置入口
  switch (item.key) {
    case 'GainServiceBaseAddress':
      openSimple('采集程序服务地址', 'http://<host>:<port>/')
      return
    case 'UploadLogoMainPath':
      openSimple('上传logo绝对路径', 'D:\\file')
      return
    case 'TokenConfig':
      openSimple('系统参数增加', '请输入系统参数增加', true)
      return
  }
  ElMessage.info(`配置：${item.name}`)
}

async function onSplitSave(val: any) {
  await editsysparametersingle({
    code: CodeName.InsertTaskInfo,
    value: JSON.stringify(val)
  })
  // TODO: 调用后端保存接口
  console.log('split-task save:', val)
  ElMessage.success('已保存拆分任务配置')
}

// exam 保存回调（可替换为真实接口）
function onAutoCloudSave(v: boolean) {
  console.log('auto cloud download:', v)
  // ElMessage.success('已保存设置')
}

function onReprintSave(v: boolean) {
  console.log('can reprint:', v)
  ElMessage.success('已保存设置')
}

function onExamLockSave(v: any) {
  console.log('exam lock method:', v)
  ElMessage.success('已保存设置')
}

function onExportSave(v: ExportOption[]) {
  console.log('export columns:', v)
  ElMessage.success('已保存导出表格配置')
}

function onPrintSave(v: any) {
  console.log('print config:', v)
  ElMessage.success('已保存打印配置')
}

function onMsgSave(v: { url: string }) {
  console.log('message system url:', v)
  ElMessage.success('已保存消息系统配置')
}
function onZJSave(v: any) {
  console.log('zhejiang cfg:', v)
  ElMessage.success('已保存浙江省平台配置')
}
</script>

<style scoped lang="less">
.sys-param {
  height: calc(100vh - 60px);
  padding: 12px 16px;
  background: var(--el-fill-color-blank);
}

/* 折叠标题 */
.collapse-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hdr-icon {
  display: inline-block;
  width: 28px;
  height: 28px;
  fill: currentcolor;
}

.title {
  margin: 0 12px;
  font-size: 18px;
  color: var(--el-text-color-primary);
}

/* 内容 */
.group-body {
  padding: 8px 0 18px;
}

.cfg-item {
  padding: 15px 0 15px 30px;
  padding-left: 30px;
  border-top: 1px solid #f0f2f5;
}

.cfg-item .text {
  min-width: 0;
  margin-right: 12px;
}

.cfg-item .name {
  display: flex;
  max-width: 100%;
  overflow: hidden;
  font-size: 15px;
  color: var(--el-text-color-primary);
  gap: 8px;
}

.cfg-item .name .name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.cfg-item .desc {
  max-width: 100%;
  margin-top: 4px;
  overflow: hidden;
  font-size: 12px;
  color: #909399;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flex-col {
  display: flex !important;
  flex-direction: row;
  place-items: center center;
  justify-content: flex-start;
  cursor: pointer;
}

.float-right {
  margin-left: auto;
}

.icon {
  width: 50px;
  height: 50px;
}
</style>
