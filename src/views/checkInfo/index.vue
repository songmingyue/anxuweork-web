<template>
  <div class="checkinfo-page">
    <!-- 顶部搜索条 -->
    <div class="toolbar">
      <el-form :inline="true" :model="formFirst">
        <el-form-item label="">
          <div style="display: flex; gap: 8px; align-items: center">
            <el-dropdown @command="onExamKeyChange">
              <span class="el-dropdown-link">
                {{ selectedExamLabel }}
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="item in alternative"
                    :key="item.prop"
                    :command="item.prop"
                    >{{ item.label }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-input
              size="small"
              v-model="formFirst[alternative[indexInput].prop]"
              placeholder="请输入"
              clearable
              style="width: 180px"
            />
          </div>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input
            v-model="formFirst.patientName"
            size="small"
            clearable
            placeholder="请输入"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="">
          <div style="display: flex; gap: 8px; align-items: center">
            <el-dropdown @command="onTimeKeyChange">
              <span class="el-dropdown-link">
                {{ selectTimeOption }}
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="item in timeAlternative"
                    :key="item.propStart"
                    :command="item.propStart"
                    >{{ item.label }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-date-picker
              v-model="formFirst[timeAlternative[indexTime].propStart]"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="开始时间"
              size="small"
            />
            <span class="sep">-</span>
            <el-date-picker
              v-model="formFirst[timeAlternative[indexTime].propEndTime]"
              value-format="YYYY-MM-DD"
              type="date"
              placeholder="结束时间"
              size="small"
            />
          </div>
        </el-form-item>
        <el-form-item label="检查机构">
          <el-select
            size="small"
            v-model="formFirst.organizationID"
            placeholder="请选择"
            style="width: 160px"
            clearable
          >
            <el-option
              v-for="opt in orgOptions"
              :key="opt.organizationID"
              :label="opt.organizationName"
              :value="opt.organizationID"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
          <el-button>导出</el-button>
          <el-button @click="onSaveAdvance">存为预设</el-button>
          <el-button text type="primary" @click="showAdvance = !showAdvance">
            {{ showAdvance ? '收起' : '展开' }}
            <el-icon style="margin-left: 6px">
              <arrow-up v-if="showAdvance" />
              <arrow-down v-else />
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 展开筛选面板（图二） -->
    <transition name="fade">
      <el-card v-if="showAdvance" shadow="always" class="advance-card">
        <AdvanceSearchForm v-model="advance" :form-options="formOptions" />
        <div> </div>
        <div class="advance-footer">
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onResetAdvance">关闭</el-button>
        </div>
      </el-card>
    </transition>

    <!-- 中间主区域：左表格 + 分隔条 + 右预览（图三） -->
    <div class="checkinfo-main">
      <div class="left" :style="{ width: leftWidth + '%' }">
        <!-- 工具条（打印、导出等） -->
        <div class="left-tools">
          <div class="tools-flex">
            <el-dropdown>
              <img class="icon-img" src="@/assets/imgs/info/printer_normal.png" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="printReport('once')">打印当前</el-dropdown-item>
                  <el-dropdown-item @click="printReport('batch')">批量打印</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-tooltip content="文件重采">
              <el-icon :size="20" color="#606266" @click="fileNewUploadDialog = true"
                ><FolderAdd
              /></el-icon>
            </el-tooltip>
            <el-tooltip content="批量追加影像">
              <img
                class="icon-img"
                @click="batchAppend"
                style="margin-left: 16px"
                src="@/assets/imgs/info/add-icon.png"
              />
            </el-tooltip>
          </div>
          <div class="tools-flex tools-flex-right">
            <el-dropdown :hide-on-click="false">
              <span class="el-dropdown-link">
                <el-button size="small">
                  列表字段
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </el-button>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <div style="width: 550px; height: 300px">
                      <el-checkbox-group
                        v-model="checkedColumns"
                        style="display: flex; flex-flow: column wrap; height: 100%"
                      >
                        <el-checkbox
                          v-for="value in checkBoxList"
                          :disabled="value.disabled"
                          :key="value.prop"
                          :label="value.label"
                          :value="value.prop"
                          >{{ value.label }}</el-checkbox
                        >
                      </el-checkbox-group>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <img
              src="@/assets/imgs/info/all_arrow_right.png"
              @click="tableChangeSize('big')"
              v-if="changeSize === 'small'"
              class="arrow-icon arrow-right"
            />
            <img
              src="@/assets/imgs/info/all_arrow_left.png"
              @click="tableChangeSize('small')"
              v-else
              class="arrow-icon arrow-left"
            />
          </div>
        </div>

        <el-table
          :data="list"
          v-loading="loading"
          border
          height="calc(100% - 130px)"
          highlight-current-row
          @row-click="onRowClick"
          @selection-change="handleSelectionChange"
        >
          <el-table-column label="" width="112" fixed="left">
            <template #default="{ row }">
              <div class="line-status" :style="{ backgroundColor: colorMap(row) }"></div>
              <div class="icon-disable">
                <div v-if="row.ifHasImage === '有'" class="positions">
                  <img
                    v-if="selectRow.find((item) => item.examUID === row.examUID)"
                    class="image-icon icon-margin"
                    src="@/assets/imgs/info/img_view_added.png"
                    alt="imgs"
                  />
                  <img
                    v-else
                    class="image-icon icon-margin"
                    src="@/assets/imgs/info/img_view.png"
                    alt="imgs"
                  />
                  <span v-if="row.ifImageUpload === '是'" class="span-icon"></span>
                </div>
                <!-- 报告 -->
                <div v-if="row.ifHasReport === '有'" class="positions">
                  <img class="image-icon" src="@/assets/imgs/info/w_report.png" alt="imgs" />
                  <span v-if="row.ifReportUpload === '是'" class="span-icon"></span>
                </div>
                <div v-if="row.ifHasFilm === '有'">
                  <img
                    class="image-icon"
                    style="width: 19px; height: 19px"
                    src="@/assets/imgs/info/film_disable.png"
                  />
                </div>
                <div class="lock-icon">
                  <img
                    v-if="row.lockFlag === '否'"
                    class="image-icon"
                    src="@/assets/imgs/info/unlock-icon.png"
                    alt="imgs"
                  />
                  <img
                    v-if="row.lockFlag === '是'"
                    class="image-icon"
                    src="@/assets/imgs/info/lock-icon.png"
                    alt="imgs"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column fixed="left" type="selection" width="48" />
          <el-table-column
            show-overflow-tooltip
            v-for="item in tableList"
            :key="item.prop"
            :min-width="item.width"
            :label="item.label"
            :prop="item.prop"
          />
        </el-table>

        <div class="pager">
          <el-pagination
            background
            layout="prev, slot, next, sizes, total"
            :total="total"
            :page-sizes="[20, 50, 100]"
            :page-size="size"
            :current-page="page"
            size="small"
            @size-change="onSizeChange"
            @current-change="onPageChange"
          >
            <span class="page-ratio">{{ page }} / {{ totalPages }}</span>
          </el-pagination>
        </div>
        <div class="column-table">
          <el-collapse>
            <el-collapse-item>
              <template #title="{}">
                <div>
                  <span class="bottom-left-text">{{ activeRow?.patientName }}</span>
                  <span class="bottom-left-text">相关检查【{{ nextList.length }}】</span>
                </div>
                <div class="icon-hulianhutong" @click="getrecordexam">
                  <el-icon><Connection /></el-icon>
                </div>
              </template>
              <el-table
                :data="nextList"
                v-loading="loading"
                border
                highlight-current-row
                @row-click="onRowClick"
                @selection-change="handleSelectionChange"
              >
                <el-table-column label="" width="112" fixed="left">
                  <template #default="{ row }">
                    <div class="line-status" :style="{ backgroundColor: colorMap(row) }"></div>
                  </template>
                </el-table-column>
                <el-table-column
                  show-overflow-tooltip
                  v-for="item in tableList"
                  :key="item.prop"
                  :min-width="item.width"
                  :label="item.label"
                  :prop="item.prop"
                />
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <!-- 分隔条，可拖动 -->
      <div class="splitter" @mousedown="startDrag">
        <div class="hint">⋮</div>
      </div>

      <!-- 右侧详情 -->
      <div class="right" :class="isBig ? 'class-very-big' : ''">
        <RightDetailCard
          :detail="currentDetail"
          @reportText="getTextReport"
          @reportImage="getImageReport"
          @updated="onSearch"
          @sizeChange="onTypeChange"
        />
      </div>
    </div>
    <el-dialog v-model="fileNewUploadDialog" title="文件重采" width="600">
      <el-radio-group v-model="radioFile">
        <el-radio value="0">全部重采</el-radio>
        <el-radio label="8">报告</el-radio>
        <el-radio label="16">影像</el-radio>
        <el-radio label="32">胶片</el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="fileNewUploadDialog = false">取消</el-button>
        <el-button type="primary" :loading="upLoadingFileLoading" @click="sureUploadFile"
          >确认</el-button
        >
      </template>
    </el-dialog>

    <!-- 打印控件未安装/需升级弹窗 -->
    <el-dialog
      v-model="clodopInstallVisible"
      width="600"
      :show-close="true"
      :close-on-click-modal="false"
    >
      <template #header>
        <div style=" font-size: 18px; font-weight: 600;text-align: center">{{
          clodopUpgradeNeeded ? '打印控件需要升级' : '打印控件未安装'
        }}</div>
      </template>
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 8px 12px;
        "
      >
        <img
          src="@/assets/imgs/info/printing_tip.png"
          alt="printer"
          style="width: 72px; height: 72px; opacity: 0.9"
        />
        <div style="font-size: 16px; color: #303133">{{
          clodopUpgradeNeeded
            ? `检测到旧版本（${clodopVersion || '未知版本'}），请升级后继续`
            : '打印控件未安装'
        }}</div>
        <div style="font-size: 12px; line-height: 1.6; color: #606266; text-align: center">
          点击下方按钮执行安装或升级<br />安装后请按 F5 刷新页面
        </div>

        <a :href="downLoadHref" download>
          <el-button type="primary" style="width: 160px">
            {{ clodopUpgradeNeeded ? '升级' : '安装' }}
          </el-button>
        </a>

        <div
          style="
            width: 100%;
            padding: 10px 12px;
            margin-top: 8px;
            font-size: 12px;
            color: #909399;
            background: #f7f7f7;
            border: 1px solid #ebeef5;
            border-radius: 4px;
          "
        >
          <div style="margin-bottom: 4px">注意：</div>
          <div>1. 如曾安装过旧版 LODOP(浏览器插件/npActiveXPlugin)，请在浏览器扩展中先卸载。</div>
          <div>2. 若此前正常，因浏览器升级导致问题，请重新执行以上安装。</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="clodopInstallVisible = false">稍后再说</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElCard,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon,
  ElCheckbox,
  ElCheckboxGroup,
  ElTooltip,
  ElMessage,
  ElDialog,
  ElRadio,
  ElRadioGroup,
  ElCollapse,
  ElCollapseItem
} from 'element-plus'
import { ArrowDown, ArrowUp, FolderAdd, Connection } from '@element-plus/icons-vue'
import type {
  CheckReportDetail,
  DocStatusProto,
  DocumentDtoProto,
  DocumentProto,
  PushStatus
} from '@/api/checkInfo'
import {
  apiGetrecordexam,
  batchResetBusinessStatus,
  CheckInfoRow,
  getcheckinfolist,
  getdoc,
  getdocstatus,
  getPushStatus,
  getValidPrintlist,
  getwrittenreport
} from '@/api/checkInfo'
import RightDetailCard from './components/RightDetailCard.vue'
import { useUserStoreWithOut } from '@/store/modules/user'
import { getOrg } from '@/api/paramConf'
import { alternative, timeAlternative, checkBoxList, examOptions, defaultStart } from './index'
import { getSearchFormList } from './searchOptions'
import { getpreset } from '@/api/authConf'
import { getdicitemlists, getDicmsgList } from '@/utils/dicmsg'
import AdvanceSearchForm from './components/AdvanceSearchForm.vue'
import { arrayBufferToBase64 } from '@/utils/base64'
import { ensureCLodop, printImages, detectCLodop } from '@/utils/clodop'
import { detectIEVersionAndArch } from '@/utils'
const nextList = ref<CheckInfoRow[]>([])
const isBig = ref(false) //最大状态
const checkedColumns = ref<string[]>([...defaultStart.map((item) => item.prop)])
// 顶部简单搜索
const userStore = useUserStoreWithOut()
const userInfo = Array.isArray(userStore.getUserInfo)
  ? userStore.getUserInfo[0]
  : userStore.getUserInfo
const tableList = computed(() => {
  return checkBoxList.filter((item) => checkedColumns.value.includes(item.prop))
})

const fileNewUploadDialog = ref(false)
const upLoadingFileLoading = ref(false) // 文件重采loading
const clodopInstallVisible = ref(false)
const clodopUpgradeNeeded = ref(false)
const clodopVersion = ref<string | undefined>('')
const formFirst = ref<any>({})
const radioFile = ref('0')
const selectedExamLabel = computed(() => {
  const opt = examOptions[indexInput.value]
  return opt ? opt.label : '检查号'
})
const selectTimeOption = computed(() => {
  const opt = timeAlternative[indexTime.value]
  return opt ? opt.label : '检查时间'
})
const indexInput = ref(0)
function onExamKeyChange(key: string) {
  indexInput.value = alternative.findIndex((item) => item.prop === key)
  alternative.map((item) => {
    formFirst.value[item.prop] = ''
  })
}
const indexTime = ref(0)

function onTimeKeyChange(key: string) {
  indexTime.value = timeAlternative.findIndex((item) => item.propStart === key)
  timeAlternative.forEach((item) => {
    formFirst.value[item.propEndTime] = ''
    formFirst.value[item.propStart] = ''
  })
}
// 展开筛选
const showAdvance = ref(false)

// 表单模型与选项缓存
const advance = ref<Record<string, any>>({})
const formOptions = reactive<Record<string, any[]>>({})

// 初始化表单选项
const initFormOptions = async () => {
  try {
    const schema = getSearchFormList()

    // 遍历所有字段，初始化选项
    Object.values(schema)
      .flat()
      .forEach((field: any) => {
        if (
          field.prop &&
          (field.type === 'select' || field.type === 'virtualSelect' || field.type === 'muliSelect')
        ) {
          // 如果有 opt 且是数组，直接使用
          if (Array.isArray(field.opt)) {
            formOptions[field.prop] = field.opt
          }
          // 如果 opt 是函数，执行并获取结果
          else if (typeof field.opt === 'function') {
            try {
              const result = field.opt()
              if (Array.isArray(result)) {
                formOptions[field.prop] = result
              } else if (result && typeof result.then === 'function') {
                // 处理 Promise
                result
                  .then((data: any) => {
                    if (Array.isArray(data)) {
                      formOptions[field.prop] = data
                    }
                  })
                  .catch((error: any) => {
                    console.warn(`加载选项失败 ${field.prop}:`, error)
                    formOptions[field.prop] = []
                  })
              }
            } catch (error) {
              console.warn(`执行选项函数失败 ${field.prop}:`, error)
              formOptions[field.prop] = []
            }
          }
        }

        // 处理 double 类型字段的子字段
        if (field.type === 'double' && field.pdList) {
          field.pdList.forEach((subField: any) => {
            if (subField.prop && subField.type === 'select' && Array.isArray(subField.opt)) {
              formOptions[subField.prop] = subField.opt
            }
          })
        }
      })
  } catch (error) {
    console.error('初始化表单选项失败:', error)
  }
}

const loading = ref(false)
const list = ref<CheckInfoRow[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const totalPages = computed(() => {
  const t = Number(total.value) || 0
  const s = Number(size.value) || 0
  return s > 0 ? Math.ceil(t / s) : 0
})
const orgOptions = ref<{ organizationName: string; organizationID: string }[]>([])
// 右侧详情当前行：同时包含列表行字段与详细报告字段
type CurrentDetail = Partial<CheckInfoRow & CheckReportDetail & PushStatus> &
  DocStatusProto &
  DocumentProto
const currentDetail = ref<CurrentDetail>({
  examResultStatus: false,
  examWrittenStatus: false,
  examFilmStatus: false,
  examImgStatus: false,
  documentDtos: []
})

const setQuery = () => {
  timeAlternative.forEach((item) => {
    if (formFirst.value[item.propStart]) {
      if (!formFirst.value[item.propStart].includes('00:00:00')) {
        formFirst.value[item.propStart] = formFirst.value[item.propStart] + ' 00:00:00'
        formFirst.value[item.propEndTime] = undefined
      }
    }
    if (formFirst.value[item.propEndTime]) {
      if (!formFirst.value[item.propEndTime].includes('23:59:59')) {
        formFirst.value[item.propEndTime] = formFirst.value[item.propEndTime] + ' 23:59:59'
      }
    }
  })

  return {
    ...formFirst.value,
    ...advance.value
  }
}
const advanceList = ref<Record<string, any>[]>([])
const onSaveAdvance = () => {
  const query = {
    ...formFirst.value,
    ...advance.value
  }
  // 暂存本次高级筛选为预设
  advanceList.value.push(query)
}

// 查询
async function onSearch() {
  try {
    loading.value = true
    setQuery()
    const query = {
      pageSize: size.value,
      currentPage: page.value,
      userInfo,
      token: userStore.getToken,
      ...formFirst.value,
      ...advance.value
    }
    console.log(query, 'query')
    const data = await getcheckinfolist(query)
    console.log(data)
    list.value = data.data
    if (data.pageBase) {
      total.value = data.pageBase.totalRecords || 0
    } else {
      total.value = data.data.length || 0
    }
    if (total.value) {
      onRowClick(list.value[0])
    }
    // 默认选中第一条作为右侧详情
  } finally {
    loading.value = false
  }
}

const onReset = () => {
  formFirst.value = {}
  advance.value = {}
}
function onResetAdvance() {
  showAdvance.value = false
  // Object.keys(advance).forEach((k) => ((advance as any)[k] = ''))
}
function onSizeChange(s: number) {
  size.value = s
  page.value = 1
  onSearch()
}
function onPageChange(p: number) {
  page.value = p
  onSearch()
}
const activeRow = ref<CheckInfoRow | null>({})
const getImageReport = async () => {
  const { data } = await getdoc({
    ...activeRow.value,
    userInfo,
    typeCode: 'ExamResult'
  })
  const documents = data && data[0] && data[0].document
  changeDocument(documents)
  currentDetail.value = Object.assign(currentDetail.value, {
    documentDtos: changeDocument(documents)
  })
}

const changeDocument = (documents: DocumentProto) => {
  if (Array.isArray(documents)) {
    return documents[0].documentDtos.map((item) => {
      return {
        ...item,
        base64url: arrayBufferToBase64(item.base64url)
      }
    })
  }
  return documents.documentDtos.map((item) => {
    return {
      ...item,
      base64url: arrayBufferToBase64(item.base64url)
    }
  })
}

const batchChangeDocument = (documents: DocumentProto[]): DocumentDtoProto[] => {
  const newList = documents.map((doc) => {
    return doc.documentDtos.map((item) => {
      return {
        ...item,
        base64url: arrayBufferToBase64(item.base64url)
      }
    })
  })
  return newList.map((item) => item[0]) as any
}

const getTextReport = async () => {
  const { data } = await getwrittenreport({
    ...currentDetail.value,
    userInfo
  })
  const detailMsg = data[0] || {}
  currentDetail.value = Object.assign(currentDetail.value, {
    ...detailMsg
  })
}

// 行点击时更新右侧详情
async function onRowClick(row: CheckInfoRow) {
  activeRow.value = row
  let detailMsg = {}
  let documents: any = {}
  const { resultValue } = await getPushStatus(row)
  const datas = await getdocstatus(row)
  const status = datas.data[0]
  if (status.examResultStatus) {
    const { data } = await getdoc({
      ...row,
      userInfo,
      typeCode: 'ExamResult'
    })
    documents = changeDocument(data && data[0] && data[0].document)
  } else {
    const { data } = await getwrittenreport({
      ...row,
      userInfo
    })
    detailMsg = data[0] || {}
  }
  currentDetail.value = {
    ...row,
    ...detailMsg,
    ...resultValue,
    ...status,
    documentDtos: documents
  }
}

// 左右拖拽分隔
const leftWidth = ref(25) // 百分比
let dragging = false
function startDrag() {
  dragging = true
  document.body.style.userSelect = 'none'
}
function onMove(e: MouseEvent) {
  if (!dragging) return
  const container = document.querySelector('.checkinfo-main') as HTMLElement
  if (!container) return
  const rect = container.getBoundingClientRect()
  const percent = ((e.clientX - rect.left) / rect.width) * 100
  leftWidth.value = Math.min(100, Math.max(15, percent))
}
const changeSize = ref('small')
const tableChangeSize = (size) => {
  changeSize.value = size
  if (size === 'big') {
    leftWidth.value = 100
  } else {
    leftWidth.value = 25
  }
}
function stopDrag() {
  dragging = false
  document.body.style.userSelect = ''
}
const getTorg = async () => {
  const { data } = await getOrg()
  orgOptions.value = data
}
const getpresetList = async () => {
  const { data } = await getpreset({
    userInfo
  })
  console.log(data)
}
const onTypeChange = (type) => {
  isBig.value = type === 'big'
}

const selectRow = ref<CheckInfoRow[]>([])

const handleSelectionChange = (val) => {
  selectRow.value = val
}

const sureUploadFile = async () => {
  // 这里可以打开一个批量追加影像的对话框，传入 selectRow.value 进行处理
  if (selectRow.value.length === 0) {
    ElMessage.warning('请先选择需要重采的记录')
    return
  }
  upLoadingFileLoading.value = true
  await batchResetBusinessStatus({
    ExamUIDList: selectRow.value.length ? selectRow.value.map((item) => item.examUID || '') : [],
    fileType: radioFile.value
  })
  upLoadingFileLoading.value = false
  fileNewUploadDialog.value = false
  ElMessage.success('重采请求已发送')
}

const batchAppend = async () => {
  if (selectRow.value.length === 0) {
    ElMessage.warning('请先选择需要追加影像的记录')
    return
  }
  const { data } = await getdoc({
    examUID: selectRow.value.map((item) => item.examUID || '').join(','),
    typeCode: 'ExamImage',
    userInfo
  })
  const datas = data[0].document.documentDtos
  datas.map((item) => {
    if (item.imgUrl) {
      window.open(item.imgUrl)
    }
  })
}

const printReport = async (type) => {
  if (!activeRow.value && type === 'once') {
    ElMessage.warning('当前选择的检查无报告可打印！')
    return
  } else if (type === 'batch') {
    const noReport = selectRow.value.filter((item) => item.ifHasReport !== '有')
    if (noReport.length === selectRow.value.length) {
      ElMessage.warning('所选检查均无报告可打印！')
      return
    } else if (noReport.length > 0) {
      ElMessage.warning(`${noReport.map((item) => item.patientName)} 无报告可打印！`)
    }
    // 若希望全部有效才打印，可 return；否则继续仅对有效项打印
  }
  const examUIDs =
    type === 'once'
      ? activeRow.value?.examUID || ''
      : selectRow.value.map((item) => item.examUID || '').join(',')
  // 可选：校验有效可打印列表
  try {
    const { data } = await getValidPrintlist({ examUID: examUIDs })
    if (!data[0].examUID) {
      // 打印逻辑
      ElMessage.success('请勿重复打印')
      return
    }
  } catch (_) {
    ElMessage.error('获取可打印列表失败，请稍后重试')
    return
  }

  // 点击时才检测本地打印控件是否安装/需升级
  try {
    const status = await detectCLodop(800)
    if (!status.installed) {
      clodopUpgradeNeeded.value = false
      clodopVersion.value = undefined
      // 预先计算下载地址，确保 a[href] 在点击前已就绪
      openClodopInstaller()
      clodopInstallVisible.value = true
      return
    }
    // if (status.needsUpgrade) {
    //   clodopUpgradeNeeded.value = true
    //   clodopVersion.value = status.version
    //   openClodopInstaller()
    //   clodopInstallVisible.value = true
    //   return
    // }
  } catch (e) {
    // 探测异常时退回到确保加载尝试
  }

  // 仅打印图片（不打印文字报告）
  const LODOP = await ensureCLodop(200)
  if (!LODOP) {
    openClodopInstaller()
    clodopInstallVisible.value = true
    return
  }

  if (type === 'once') {
    // 优先使用右侧已加载的报告图片
    let imgs: string[] = []
    const docs = (currentDetail.value && (currentDetail.value as any).documentDtos) || []
    if (Array.isArray(docs) && docs.length) {
      imgs = docs
        .map((d: any) => d.base64url || d.imgUrl)
        .filter((s: string) => typeof s === 'string' && s.length > 0)
    }
    // 如果右侧未加载，再按 examUID 拉取一次
    if (!imgs.length) {
      try {
        const { data } = await getdoc({
          examUID: activeRow.value?.examUID || '',
          typeCode: 'ExamResult',
          userInfo
        })
        const converted = changeDocument(data[0].document)
        imgs = (converted || [])
          .map((d: any) => d.base64url || d.imgUrl)
          .filter((s: string) => typeof s === 'string' && s.length > 0)
      } catch (err) {
        // ignore
      }
    }
    if (!imgs.length) {
      ElMessage.warning('该检查无可打印图片')
      return
    }
    printImages(LODOP, imgs, { mode: 'preview', margin: 0 })
    return
  } else {
    // 批量打印：合并所有图片为一个打印任务
    // const firstPage = true
    LODOP.PRINT_INIT('批量打印-仅图片')
    LODOP.SET_PRINT_MODE('PRINT_PAGE_PERCENT', 'Auto-Width')
    const { data } = await getdoc({
      examUID: selectRow.value.map((item) => item.examUID || '').join(','),
      typeCode: 'ExamResult',
      userInfo
    })
    const converted = batchChangeDocument(data[0].document as any)
    const printedAny = converted.length > 0 ? true : false
    const imgs = converted.map((item) => item.base64url || item.imgUrl)
    printImages(LODOP, imgs, { mode: 'preview', margin: 0 })

    if (!printedAny) {
      ElMessage.warning('所选记录均无可打印图片')
      return
    }
  }
}

const downLoadHref = ref('')

// 解析 src/assets/lodop 下的真实可访问 URL，避免直接用 /assets 路径导致下载到 HTML
const lodopWin32Url = new URL('../../assets/lodop/CLodop_Setup_for_Win32NT.rar', import.meta.url)
  .href
const lodopIe32Url = new URL('../../assets/lodop/install_lodop32.rar', import.meta.url).href
const lodopIe64Url = new URL('../../assets/lodop/install_lodop64.rar', import.meta.url).href

// 根据系统架构选择安装包并设置下载地址
function openClodopInstaller() {
  const { browser, arch } = detectIEVersionAndArch()
  if (browser.includes('IE') && arch.includes('32')) {
    // IE 32 位特殊处理
    downLoadHref.value = lodopIe32Url
  } else if (browser.includes('IE') && arch.includes('64')) {
    downLoadHref.value = lodopIe64Url
  } else {
    downLoadHref.value = lodopWin32Url
  }
}
const fullscreenLoading = ref(false)
const getrecordexam = async () => {
  fullscreenLoading.value = true
  try {
    await apiGetrecordexam({ ...activeRow.value, userInfo })
  } finally {
    fullscreenLoading.value = false
  }
}

onMounted(async () => {
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', stopDrag)
  getTorg() // 超管机构才获取
  onSearch()
  getpresetList()

  // 确保字典数据加载完成后再初始化表单选项
  try {
    await Promise.all([getDicmsgList(), getdicitemlists()])
    // 等待一下让store更新完成
    await new Promise((resolve) => setTimeout(resolve, 100))
    initFormOptions() // 初始化表单选项
  } catch (error) {
    console.error('加载字典数据失败:', error)
    // 即使失败也要初始化表单选项
    initFormOptions()
  }
  // 进入页面不进行打印控件检测，点击打印时再检测
})
const colorMap = (row) => {
  switch (row.examStatus) {
    case '检查完成':
      return '#24cae3'
    case '审核完成':
      return '#e324af'
    case '修订完成':
      return '#e3b424'
    default:
      return '#67c23a'
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.checkinfo-page {
  display: flex;
  height: calc(100vh - 20px);
  margin-bottom: 20px;
  flex-direction: column;
}

.toolbar {
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.sep {
  margin: 0 8px;
  color: #909399;
}

/* 展开筛选 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.advance-card {
  position: absolute;
  top: 70px;
  left: 50%;
  z-index: 20;
  width: 1400px;
  transform: translateX(-50%);
}

.advance-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.advance-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(220px, 1fr));
  gap: 12px 16px;
}

.age-range {
  display: flex;
  align-items: center;
}

.age-range .sep {
  margin: 0 6px;
}

.advance-footer {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

/* 主区域 */
.checkinfo-main {
  position: relative;
  flex: 1;
  display: flex;
  min-height: 0;
}

.left {
  display: flex;
  min-width: 1%;
  background: #fff;
  border-right: 1px solid #ebeef5;
  flex-direction: column;
}

.left-tools {
  display: flex;
  padding: 6px 8px;
  border-bottom: 1px solid #ebeef5;
  align-items: flex-start;
  justify-content: space-between;
}

.pager {
  display: flex;
  padding: 6px 8px;
  border-top: 1px solid #ebeef5;
  align-items: center;
  justify-content: flex-end;
}

.summary {
  color: #909399;
}

.page-ratio {
  display: inline-block;
  min-width: 56px;
  margin: 0 8px;
  text-align: center;
}

/* 分隔条 */
.splitter {
  display: flex;
  width: 6px;
  cursor: col-resize;
  background: #f5f7fa;
  align-items: center;
  justify-content: center;
}

.splitter .hint {
  color: #c0c4cc;
  user-select: none;
}

/* 右预览 */
.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0%;
  background: #fff;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-bottom: 1px solid #ebeef5;
}

.preview-toolbar .spacer {
  flex: 1;
}

.preview-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-body img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.example-showcase .el-dropdown-link {
  display: flex;
  color: var(--el-color-primary);
  cursor: pointer;
  align-items: center;
}

.image-icon {
  width: 15px;
  height: 15px;
  cursor: pointer;
}

.icon-disable {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.span-icon {
  position: absolute;
  bottom: 3px;
  left: 0;
  display: inline-block;
  width: 15px;
  height: 2px;
  background-color: #409eff;
}

.positions {
  position: relative;
}

.line-status {
  position: absolute;
  top: 9px;
  left: 0;
  display: inline-block;
  width: 4px;
  height: 18px;
}

.lock-icon .image-icon:hover {
  cursor: no-drop;
}

.class-very-big {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.arrow-icon {
  width: 19.8px;
}

.icon-img {
  width: 18px;
  height: 18px;
  margin-right: 16px;
}

.tools-flex {
  display: flex;
  align-items: flex-start;
  margin: 5px 0;
}

.tools-flex-right {
  gap: 10px;
}

.custors {
  cursor: pointer;
}

.bottom-left-text {
  margin-left: 15px;
  font-size: 14px;
  color: #333;
}

.column-table {
  position: relative;
}

.icon-hulianhutong {
  position: absolute;
  top: 3px;
  right: 25px;
}
</style>
