import request from '@/axios'
import { PageType } from '../type'
import { UserType } from '../login/types'

export enum CodeName {
  InsertTaskInfo = 'InsertTaskInfo', // 拆分任务插入上传和推送表配置
  DigitalImageNeedDefaultValue = 'DigitalImageNeedDefaultValue', // 采集或推送接收收费状态默认值配置
  GainServiceBaseAddress = 'GainServiceBaseAddress', // 采集程序服务地址
  GainServiceName = 'GainServiceName', // 采集程序服务名称
  UploadServiceName = 'UploadServiceName', // 上传服务安装名称
  UploadServiceBaseAddress = 'UploadServiceBaseAddress', // 上传程序服务地址
  UploadServiceMappingAddress = 'UploadServiceMappingAddress', // 上传程序经过网闸映射地址
  QrCodeUrl = 'QrCodeUrl', // 集成前端二维码地址配置
  WebAPIServiceBaseAddress = 'WebAPIServiceBaseAddress', // 推送功能接受端地址
  PodServiceBaseAddress = 'PodServiceBaseAddress', // 按需打印删除胶片接口地址
  ConfigValuesRK = 'ConfigValuesRK', // 瑞康医院二维码服务配置
  WebAPIServiceSelfAddress = 'WebAPIServiceSelfAddress', // 集成平台自身api地址
  QRConfig = 'QRConfig', // PACS相关功能配置
  ISDownloadReportInWebAuto = 'ISDownloadReportInWebAuto', // 浏览报告自动从云端下载
  IMCISAPIHost = 'IMCISAPIHost', // 集成平台移动端地址
  SuperiorServiceAddress = 'SuperiorServiceAddress', // 从云端下载报告的上级地址
  ImageViewConfig = 'ImageViewConfig', // 影像浏览器读取配置
  IsCanRePrint = 'IsCanRePrint', // 前端页面是否可以重复打印报告
  RelatedExamConfig = 'RelatedExamConfig', // 互联互通配置
  ExamLockMethod = 'ExamLockMethod', // 检查锁定方式
  CheckInfoTableConfig = 'CheckInfoTableConfig', // 检查信息表格导出配置
  HardDiskThreshold = 'HardDiskThreshold', // 磁盘使用最高百分比
  PrintConfig = 'PrintConfig', // 打印机配置
  DicomSCPConfig = 'DicomSCPConfig', // Dicom节点配置
  ProvinceSXConfig = 'ProvinceSXConfig', // 浙江省平台相关配置
  HeNanProviceImageAppInfo = 'HeNanProviceImageAppInfo', // 河南省平台相关配置
  eWordMSNInfo = 'eWordMSNInfo' // 消息系统配置
}
export interface PresetList {
  defaultFlag: string
  name: string
  publicFlag: string
  queryCondition: string
  querySeq: number
  queryType: string
  sortNO: string
  userUID: string
}

export interface SettingValue {
  code: CodeName
  value: string
}

export interface DictType extends PageType {
  typeClass?: '0' | '1' | undefined // 类型类别 0系统字典 1功能字典
  typeCode?: string
  typeName?: string
}

export interface DicItem {
  allowCreateItem?: '允许' | '禁止'
  /** 是否允许删除条目 */
  allowDeleteItem?: '允许' | '禁止'
  /** 是否允许更新条目 */
  allowUpdateItem?: '允许' | '禁止'
  /** 类型备注说明 */
  memo?: string
  /** 字典分类 */
  typeClass?: '功能字典'
  /** 字典类型编码 */
  typeCode?: string
  /** 字典类型名称 */
  typeName?: string
}

export interface DicItemZiDian extends DicItem {
  itemCode?: string
  itemName?: string
  organizationID?: string
}

export interface DictItemRow {
  defaultFlag?: string
  deleteFlag?: string
  itemCode?: string
  itemName?: string
  itemRepresenExt1?: string
  itemRepresenExt2?: string
  itemRepresenExt3?: string
  memo?: string
  organizationID?: string
  sortNO?: string
  typeCode?: string
}

export interface CreateDicitem {
  /** 字典代码 */
  itemCode?: string

  /** 字典名称 */
  itemName?: string

  /** 字典扩展字段1 */
  itemRepresenExt1?: string

  /** 字典扩展字段2 */
  itemRepresenExt2?: string

  /** 字典扩展字段3 */
  itemRepresenExt3?: string

  /** 备注信息 */
  memo?: string

  /** 关联的类型编码（固定为审计触发事件） */
  typeCode?: string // 使用字面量类型限定固定值
}

export interface PluginWithOut {
  /** 插件实现类名 */
  className: string

  /** 配置版本 */
  configVersion: string

  /** 默认键值配置（JSON字符串格式） */
  defaultKeyValue: string

  /** 插件描述 */
  description: string

  /** 动态链接库名称 */
  dllName: string

  /** 是否显示插件 */
  isShow: boolean

  /** 插件配置项（JSON数组字符串格式） */
  pluginConfigs: string

  /** 插件名称 */
  pluginName: string

  /** 插件类型 */
  pluginType: string

  /** 插件唯一标识符 */
  pluginUID: string
}

export enum TaskTypeEnum {
  Upload = 'Upload',
  Push = 'Push',
  Download = 'Download',
  Converter = 'Converter'
}

// TaskType 中文映射
export const TaskTypeLabels = {
  [TaskTypeEnum.Upload]: '上传',
  [TaskTypeEnum.Push]: '推送',
  [TaskTypeEnum.Download]: '下载',
  [TaskTypeEnum.Converter]: '转换'
} as const

export enum TaskTargetEnum {
  LocalStorage = 'LocalStorage',
  LocalReport = 'LocalReport',
  CompanyCloud = 'CompanyCloud',
  ZheJiangRecognitionPlatform = 'ZheJiangRecognitionPlatform',
  IMCISCityPlatform = 'IMCISCityPlatform',
  ZhejiangQualityPlatform = 'ZhejiangQualityPlatform'
}

export const TaskTargetLabels = {
  [TaskTargetEnum.LocalStorage]: '本地存储',
  [TaskTargetEnum.LocalReport]: '本地报告',
  [TaskTargetEnum.CompanyCloud]: '云胶片',
  [TaskTargetEnum.ZheJiangRecognitionPlatform]: '浙江省平台',
  [TaskTargetEnum.IMCISCityPlatform]: '集成市平台',
  [TaskTargetEnum.ZhejiangQualityPlatform]: '浙江省质量平台'
} as const

export enum DataTypeEnum {
  Exam = 'Exam',
  Report = 'Report',
  Film = 'Film',
  Image = 'Image',
  Pdf = 'Pdf',
  KosFile = 'KosFile'
}

export const DataTypeLabels = {
  [DataTypeEnum.Exam]: '检查',
  [DataTypeEnum.Report]: '报告',
  [DataTypeEnum.Film]: '胶片',
  [DataTypeEnum.Image]: '影像',
  [DataTypeEnum.Pdf]: 'PDF',
  [DataTypeEnum.KosFile]: 'KOS文件'
} as const

export interface ConfigItem {
  id?: string
  taskName?: string
  taskType?: TaskTypeEnum | string
  taskTarget?: TaskTargetEnum | string
  dataType?: DataTypeEnum | string
  isEnable?: boolean
  conditionDescription?: string
}

export interface Preset {
  userInfo: UserType | undefined
  querySeq?: number
  userId?: string
  queryType?: string
}

export const getrolelist = (data: {
  roleName: string
  page: number
  size: number
}): Promise<IResponse<[]>> => {
  return request.post({
    url: 'user/getrolelist',
    data,
    requestTem: {
      requestTem: 'organizationIDInputProto',
      responseTem: 'RoleMstProto'
    }
  })
}
// 配置获取信息
export const getsysparametersingle = (data: {
  code: CodeName
}): Promise<IResponse<SettingValue[]>> => {
  return request.post({
    url: 'system/getsysparametersingle',
    data,
    requestTem: {
      requestTem: 'SysParameterMstProto',
      responseTem: 'SysParameterMstProto'
    }
  })
}
// 修改配置信息
export const editsysparametersingle = (data: {
  code: CodeName
  value: string
}): Promise<IResponse<[]>> => {
  return request.post({
    url: 'system/editsysparametersingle',
    data,
    requestTem: {
      requestTem: 'SysParameterMstProto',
      responseTem: 'PageResponse'
    }
  })
}
// 获取检查信息表格导出配置 表格
export const getpreset = (data: Preset): Promise<IResponse<PresetList[]>> => {
  return request.post({
    url: 'check/getpreset',
    data,
    requestTem: {
      requestTem: 'UserQuerySetInputProto',
      responseTem: 'UserQuerySetMstProto'
    }
  })
}
// 获取字典类型列表
export const getdictypelist = (data: DictType): Promise<IResponse<DicItem[]>> => {
  return request.post({
    url: 'dic/getdictypelist',
    data,
    requestTem: {
      requestTem: 'DicTypeMstInputProto',
      responseTem: 'DicTypeMstProto'
    }
  })
}

// 获取字典项列表
export const getdicitemlist = (data: DicItemZiDian): Promise<IResponse<DictItemRow[]>> => {
  return request.post({
    url: 'dic/getdicitemlist',
    data,
    requestTem: {
      requestTem: 'DicItemMstProto',
      responseTem: 'DicItemMstProto'
    }
  })
}

// 创建字典项
export const createdicitem = (data: CreateDicitem): Promise<IResponse<[]>> => {
  return request.post({
    url: 'dic/create',
    data,
    requestTem: {
      requestTem: 'DicItemMstProto',
      responseTem: 'whitelist'
    }
  })
}
// 编辑字典项
export const editdicitem = (data: CreateDicitem): Promise<IResponse<[]>> => {
  return request.post({
    url: 'dic/edit',
    data,
    requestTem: {
      requestTem: 'DicItemMstProto',
      responseTem: 'whitelist'
    }
  })
}
// 删除字典项
export const deletedicitem = (data: CreateDicitem): Promise<IResponse<[]>> => {
  return request.post({
    url: 'dic/delete',
    data,
    requestTem: {
      requestTem: 'DicItemMstProto',
      responseTem: 'whitelist'
    }
  })
}

// 插件展示
export const getAllPluginWithOutIsShow = (): Promise<IResponse<PluginWithOut[]>> => {
  return request.post({
    url: 'plugin/getAllPluginWithOutIsShow',
    requestTem: {
      requestTem: 'PluginProto',
      responseTem: 'PluginProto'
    }
  })
}

// 插件左侧修改
export const editPluginIsShow = (data: PluginWithOut): Promise<IResponse<PluginWithOut[]>> => {
  return request.post({
    url: 'plugin/editPluginIsShow',
    data,
    requestTem: {
      requestTem: 'PluginProto',
      responseTem: 'PluginProto'
    }
  })
}

// 任务列表
export const getConfigs = (): Promise<IResponse<ConfigItem[]>> => {
  return request.post({
    responseType: 'json',
    url: 'task/GetConfigs'
  })
}

// 人物列表删除
export const deleteConfig = (data: { id: string }): Promise<IResponse<[]>> => {
  return request.post({
    responseType: 'json',
    url: 'task/DeleteConfig',
    data
  })
}

// 任务列表更新状态
export const updateStatus = (data: ConfigItem): Promise<IResponse<[]>> => {
  return request.post({
    responseType: 'json',
    url: 'task/UpdateStatus',
    data
  })
}
// 任务列表更新状态
export const addConfig = (data: ConfigItem): Promise<IResponse<[]>> => {
  return request.post({
    responseType: 'json',
    url: 'task/AddConfig',
    data
  })
}

// 任务条件更新
export const updateCondition = (data: {
  id: string
  condition: string
}): Promise<IResponse<[]>> => {
  return request.post({
    responseType: 'json',
    url: 'task/UpdateCondition',
    data
  })
}

// 任务条件获取
export const getCondition = (data: {
  id: string
}): Promise<IResponse<{ condition: string; conditionConfigs: any }>> => {
  return request.post({
    responseType: 'json',
    url: 'task/GetCondition',
    data
  })
}

// 创建任务
export const createConfig = (data: {
  taskName: string
  taskType: TaskTypeEnum
  taskTarget: TaskTargetEnum
  dataType: DataTypeEnum
}): Promise<IResponse<ConfigItem>> => {
  return request.post({
    responseType: 'json',
    url: 'task/CreateConfig',
    data
  })
}

// 更新任务
export const updateConfig = (data: ConfigItem): Promise<IResponse<ConfigItem>> => {
  return request.post({
    responseType: 'json',
    url: 'task/UpdateConfig',
    data
  })
}
