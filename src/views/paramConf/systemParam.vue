<template>
  <div class="sys-param">
    <el-collapse v-model="activeNames">
      <el-collapse-item v-for="g in groups" :key="g.key" :name="g.key" class="group">
        <template #title>
          <div class="collapse-title">
            <svg class="hdr-icon" aria-hidden="true">
              <use :xlink:href="g.icon" />
            </svg>
            <span class="title">{{ g.title }}</span>
          </div>
        </template>

        <div class="group-body">
          <el-row v-for="item in items[g.key]" :key="item.key" :gutter="40" class="cfg-item">
            <el-col :span="8" :xs="10" class="flex-col"
              ><div class="name">{{ item.name }}</div></el-col
            >
            <el-col :span="10" :xs="10" class="flex-col">
              <div v-if="item.desc" class="desc">{{ item.desc }}</div>
            </el-col>

            <el-col :span="6" :xs="4" class="flex-col">
              <div class="float-right">
                <el-button type="primary" size="small" @click="onConfig(item)"> 配置 </el-button>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 拆分任务插入上传和推送表配置 弹窗 -->
    <SplitTaskConfigDialog v-model="showSplitTaskDlg" :model="splitTaskModel" @save="onSplitSave" />
    <!-- 收费状态默认值配置 弹窗 -->
    <ChargeStatusDefaultDialog v-model="showChargeDlg" />
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
import { ElMessage, ElCollapse, ElCollapseItem, ElButton, ElCol, ElRow } from 'element-plus'
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
type GroupKey = 'plugin' | 'archive' | 'exam' | 'system' | 'province' | 'others'
interface Group {
  key: GroupKey
  title: string
  icon: string
}
const dialogMsg = ref('')
const groups: Group[] = [
  { key: 'plugin', title: '插件', icon: '#icon-a-bianzu23' },
  { key: 'archive', title: '归档', icon: '#icon-guidang' },
  { key: 'exam', title: '检查', icon: '#icon-jiancharenwufenpei' },
  { key: 'system', title: '系统', icon: '#icon-xitong' },
  { key: 'province', title: '省平台', icon: '#icon-yinhangcunguan' },
  { key: 'others', title: '其他平台', icon: '#icon-a-106_other' }
]

const items: Record<GroupKey, CfgItem[]> = {
  // 插件（图2）
  plugin: [
    {
      key: 'InsertTaskInfo',
      name: '拆分任务插入上传和推送表配置',
      desc: '区分插入上传任务/推送任务，第三方调用检查推送接口采集(任务插入)也在此配置'
    },
    {
      key: 'DigitalImageNeedDefaultValue',
      name: '采集或推送接收收费状态默认值配置',
      desc: '初次采集/推送，如果检查采集视图中收费状态为空；或者对方推送检查的时候收费状态为空，则此配置在不为空的情况下起作用，如果为空，则默认已经收费。如果后面采集同一个检查（数据库中已经存在同样检查记录），收费状态为空，则还是按照初次采集一样赋值收费状态，然后，再判断：如果不从his查询收费状态并且系统参数中默认值为空，则不更新收费状态。否则，更新。如果从his查询，则按照his的值来更新，如果his中的收费状态查出来为空，则按照初次采集一样赋值收费状态，然后更新收费状态。'
    },
    { key: 'GainServiceBaseAddress', name: '采集程序服务地址', desc: '采集程序根据这个地址启动' },
    { key: 'GainServiceName', name: '采集服务安装名称', desc: '采集服务安装名称' },
    { key: 'UploadServiceName', name: '上传服务安装名称', desc: '上传服务安装名称' },
    { key: 'UploadServiceBaseAddress', name: '上传程序服务地址', desc: '上传程序服务地址' },
    {
      key: 'UploadServiceMappingAddress',
      name: '上传程序经过网闸时的地址',
      desc: '用于调用上传程序中的接口'
    },
    {
      key: 'QrCodeUrl',
      name: '集成端调二维吗地址配置',
      desc: '集成前端二维码展示用的二维码地址配置'
    },
    {
      key: 'WebAPIServiceBaseAddress',
      name: '推送功能接收端地址',
      desc: '接收检查、报告、影像、胶片推送的上级/集成API地址'
    },
    {
      key: 'PodServiceBaseAddress',
      name: '按需打印删除胶片接口地址',
      desc: '需打印删除胶片接口地址'
    },
    { key: 'ConfigValuesRK', name: '瑞康医院二维码服务配置', desc: '瑞康医院二维码服务配置' },
    { key: 'WebAPIServiceSelfAddress', name: '集成平台自身api地址', desc: '集成平台自身api地址' }
  ],
  // 归档（图3）
  archive: [{ key: 'QRConfig', name: 'PACS相关功能配置', desc: 'cmove, cstore 等接收端配置' }],
  // 检查（图4）
  exam: [
    {
      key: 'ISDownloadReportInWebAuto',
      name: '浏览报告自动从云端下载',
      desc: '浏览报告时，是否自动从云端下载'
    },
    { key: 'IMCISAPIHost', name: '集成平台移动端地址', desc: '集成平台移动端地址' },
    {
      key: 'SuperiorServiceAddress',
      name: '从云端下载报告的上级地址',
      desc: '从云端下载报告的上级地址'
    },
    { key: 'ImageViewConfig', name: '影像浏览器读取配置', desc: '影像浏览器读取配置' },
    {
      key: 'IsCanRePrint',
      name: '前端页面是否可以重复打印报告',
      desc: '前端页面是否可以重复打印报告'
    },
    { key: 'RelatedExamConfig', name: '互联网互通配置', desc: '互联网互通配置' },
    { key: 'ExamLockMethod', name: '检查锁定方式', desc: '检查锁定方式' },
    { key: 'CheckInfoTableConfig', name: '检查信息表格导出配置', desc: '检查信息表格导出配置' }
  ],
  // 系统（图5）
  system: [
    { key: 'HardDiskThreshold', name: '磁盘使用最高百分比', desc: '磁盘使用最高百分比' },
    { key: 'PrintConfig', name: '打印相关配置', desc: '打印相关配置' },
    { key: 'DicomSCPConfig', name: 'Dicom节点配置', desc: 'Dicom节点配置' }
  ],
  // 省平台（图6）
  province: [
    { key: 'ProvinceSXConfig', name: '浙江省平台相关配置' },
    { key: 'HeNanProviceImageAppInfo', name: '河南省平台相关配置' }
  ],
  // 其他平台（图7）
  others: [{ key: 'eWordMSNInfo', name: '消息系统配置', desc: '消息系统配置' }]
}

// 默认全部收起；如需默认展开某些，填入对应 key 数组
const activeNames = ref<GroupKey[]>([])
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
    autoCloudVal.value = Boolean((data as any)?.[0]?.value ?? false)
    showAutoCloudDlg.value = true
    return
  }
  if (item.key === 'ImageViewConfig') {
    imageViewerModel.value = data[0]
    showImageViewerDlg.value = true
    return
  }
  if (item.key === 'IsCanRePrint') {
    reprintVal.value = Boolean((data as any)?.[0]?.value ?? true)
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
    exportSelected.value = []
    if (tableData.data && tableData.data[0]?.queryCondition) {
      exportSelected.value = JSON.parse(tableData.data[0]?.queryCondition) || []
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
    case 'HardDiskThreshold':
      openSimple('磁盘使用最高百分比', '0-100之间的整数')
      return
    case 'IMCISAPIHost':
      openSimple('集成平台移动端地址', 'https://your.domain/path')
      return
    case 'SuperiorServiceAddress':
      openSimple('从云端下载报告的上级地址', 'http://<host>:<port>/')
      return
    case 'GainServiceBaseAddress':
      openSimple('采集程序服务地址', 'http://<host>:<port>/')
      return
    case 'DicomSCPConfig':
      openSimple('节点接受数椐临时目录', '路径如：C:\temp 或 /Users/username/temp')
      return
    case 'eWordMSNInfo':
      openSimple('消息系统配置', 'http://<host>:<port>/')
      return
    case 'GainServiceName':
      openSimple('采集服务安装名称', '请输入服务名称')
      return
    case 'UploadServiceName':
      openSimple('上传服务安装名称', '请输入服务名称')
      return
    case 'UploadServiceBaseAddress':
      openSimple('上传程序服务地址', 'http://<host>:<port>/')
      return
    case 'UploadServiceMappingAddress':
      openSimple('上传程序经过网闸映射地址', 'http://<gateway-host>:<port>/')
      return
    case 'QrCodeUrl':
      openSimple('集成前端二维码地址配置', 'https://your.domain/path')
      return
    case 'WebAPIServiceBaseAddress':
      openSimple('推送功能接收端地址', 'http://<host>:<port>/')
      return
    case 'PodServiceBaseAddress':
      openSimple('按需打印删除胶片接口地址', 'http://<host>:<port>/FilmExam/DeleteFilmByAc')
      return
    case 'ConfigValuesRK':
      openSimple('瑞康医院二维码服务配置', 'JSON，例如 {"QRCodeAddress":"..."}', true)
      return
    case 'WebAPIServiceSelfAddress':
      openSimple('集成平台自身api地址', 'http://<host>:<port>/')
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
  padding: 12px 16px;
  background: #fff;
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
  font-size: 18px;
  font-weight: 600;
  color: #303133;
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
  font-size: 15px;
  color: #303133;
}

.cfg-item .desc {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.flex-col {
  display: flex !important;
  flex-direction: row;
  place-items: center center;
  justify-content: flex-start;
}

.float-right {
  margin-left: auto;
}

.icon {
  width: 50px;
  height: 50px;
}
</style>
