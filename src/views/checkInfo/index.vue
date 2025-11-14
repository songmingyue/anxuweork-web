<template>
  <div class="checkinfo-page page">
    <div
      v-if="permissionsMsd('displayStyleRightInfo', 'ServiceSectIDs')"
      class="header-right-modal"
    >
      <el-dropdown size="small" type="primary">
        <el-button type="primary" size="small">
          模板<el-icon><ArrowDownBold /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="item in presetList" :key="item.sortNO" @click="setForm(item)">
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
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <!-- 顶部搜索条 -->
    <div class="toolbar" v-if="permissionsMsd('displayStyleRightInfo', 'ServiceSectIDs')">
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
              style="width: 120px"
            />
          </div>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input
            v-model="formFirst.patientName"
            size="small"
            clearable
            placeholder="请输入"
            style="width: 120px"
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
              style="width: 120px"
              size="small"
            />
            <span class="sep">-</span>
            <el-date-picker
              v-model="formFirst[timeAlternative[indexTime].propEndTime]"
              value-format="YYYY-MM-DD"
              type="date"
              style="width: 120px"
              placeholder="结束时间"
              size="small"
            />
          </div>
        </el-form-item>
        <el-form-item v-if="permissionsMsd('', '')" label="检查机构">
          <el-select
            size="small"
            v-model="formFirst.organizationID"
            placeholder="请选择"
            style="width: 120px"
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
          <el-button size="small" type="primary" @click="onSearch">搜索</el-button>
          <el-button size="small" @click="onReset">重置</el-button>
          <el-button size="small" @click="upLoad">导出</el-button>
          <el-button size="small" @click="onSaveAdvance">存为预设</el-button>
          <el-button size="small" text type="primary" @click="showAdvance = !showAdvance">
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
            <el-dropdown v-if="permissionsMsd('displayStyleRightInfo', 'printPageVisible')">
              <img class="icon-img" src="@/assets/imgs/info/printer_normal.png" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="printReport('once')">打印当前</el-dropdown-item>
                  <el-dropdown-item @click="printReport('batch')">批量打印</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-tooltip
              content="文件重采"
              v-if="permissionsMsd('displayStyleRightInfo', 'reGainLeftFileVisible')"
            >
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
                <el-icon :size="20"><Operation /></el-icon>
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
                <!-- 影像上传状态 -->
                <el-tooltip
                  v-if="row.ifHasImage === '有'"
                  effect="dark"
                  :content="row.ifImageUpload === '是' ? '影像已上传' : '影像未上传'"
                  placement="top"
                >
                  <div class="positions">
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
                </el-tooltip>
                <!-- 报告 -->
                <el-tooltip
                  v-if="row.ifHasReport === '有'"
                  effect="dark"
                  :content="row.ifReportUpload === '是' ? '报告已上传' : '报告未上传'"
                  placement="top"
                >
                  <div class="positions">
                    <img class="image-icon" src="@/assets/imgs/info/w_report.png" alt="imgs" />
                    <span v-if="row.ifReportUpload === '是'" class="span-icon"></span>
                  </div>
                </el-tooltip>
                <!-- 胶片 -->
                <el-tooltip
                  v-if="row.ifHasFilm === '有'"
                  effect="dark"
                  :content="row.ifFilmUpload === '是' ? '胶片已上传' : '胶片未上传'"
                  placement="top"
                >
                  <div>
                    <img
                      class="image-icon"
                      style="width: 19px; height: 19px"
                      src="@/assets/imgs/info/film_disable.png"
                    />
                  </div>
                </el-tooltip>
                <div
                  class="lock-icon"
                  v-if="permissionsMsd('displayStyleRightInfo', 'manualLockVisible')"
                >
                  <el-tooltip
                    v-if="row.lockFlag === '否'"
                    effect="dark"
                    content="检查未锁定"
                    placement="top"
                  >
                    <img
                      @click.stop="showLockDialog(row, true)"
                      class="image-icon"
                      src="@/assets/imgs/info/unlock-icon.png"
                      alt="imgs"
                    />
                  </el-tooltip>
                  <el-tooltip v-else effect="dark" content="检查已锁定" placement="top">
                    <img
                      @click="showLockDialog(row, false)"
                      class="image-icon"
                      src="@/assets/imgs/info/lock-icon.png"
                      alt="imgs"
                    />
                  </el-tooltip>
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
                <el-tooltip class="icon-hulianhutong" content="互联互通" placement="top">
                  <div class="icon-hulianhutong" @click="getrecordexam('province')">
                    <el-icon><Connection /></el-icon>
                  </div>
                </el-tooltip>
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
        <div style="font-size: 18px; font-weight: 600; text-align: center">{{
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
    <!-- 锁定原因 -->
    <LockDialog
      v-model:visible="lockDialog"
      :model="modelValue"
      :title="lockTitle"
      :loading="upLoadingFileLoading"
      @confirm="sureLock"
    />
    <!-- 存为预设
     
  @todo： 挪出去-->
    <el-dialog
      v-model="isShowTemplate"
      width="600"
      :show-close="true"
      title="请输入预设名"
      :close-on-click-modal="false"
    >
      <el-form :model="modalTemplate" :rules="rules" ref="formRef">
        <el-form-item label="" prop="name">
          <el-input v-model="modalTemplate.name" placeholder="请输入预设名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isShowTemplate = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="onConfirm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { permissionsMsd } from '@/utils/permission'
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
  ElCollapseItem,
  ElMessageBox,
  ElLoading
} from 'element-plus'
import {
  ArrowDown,
  ArrowUp,
  FolderAdd,
  Connection,
  Operation,
  ArrowDownBold,
  CloseBold,
  Star,
  StarFilled
} from '@element-plus/icons-vue'
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
  cancelPreset,
  CheckInfoRow,
  getcheckinfolist,
  getdoc,
  getdocstatus,
  getPushStatus,
  getValidPrintlist,
  getwrittenreport,
  lockcheck,
  updatepresetdefaul,
  upDownload
} from '@/api/checkInfo'
import RightDetailCard from './components/RightDetailCard.vue'
import LockDialog from './components/LockDialog.vue'
import { useUserStoreWithOut } from '@/store/modules/user'
import { getOrg } from '@/api/paramConf'
import { alternative, timeAlternative, checkBoxList, examOptions, defaultStart } from './index'
import { getSearchFormList, permiseListSearch } from './searchOptions'
import { getpreset, PresetList } from '@/api/authConf'
import { getdicitemlists, getDicmsgList } from '@/utils/dicmsg'
import AdvanceSearchForm from './components/AdvanceSearchForm.vue'
import { arrayBufferToBase64 } from '@/utils/base64'
import { ensureCLodop, printImages, detectCLodop } from '@/utils/clodop'
import { detectIEVersionAndArch } from '@/utils'
import { addpreset, deletepreset } from '@/api/plugConf'
// 预设
const modalTemplate = reactive({
  name: ''
})

const rules = {
  name: [{ required: true, message: '预设名不能为空', trigger: 'blur' }]
}

// 锁定
const lockDialog = ref(false)
const modelValue = reactive({
  lockReason: ''
})
const lockTitle = ref('')

// 锁定弹窗由子组件 LockDialog 管理表单与校验

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
  DocumentProto & {
    isShowDialog: boolean
  }
const currentDetail = ref<CurrentDetail>({
  examResultStatus: false,
  examWrittenStatus: false,
  examFilmStatus: false,
  examImgStatus: false,
  documentDtos: [],
  isShowDialog: true
})

const setQuery = () => {
  timeAlternative.forEach((item) => {
    if (formFirst.value[item.propStart]) {
      // 统一起始时间到 00:00:00；若未填结束时间，则默认同日起止
      if (!formFirst.value[item.propStart].includes('00:00:00')) {
        const day = String(formFirst.value[item.propStart]).split(' ')[0]
        formFirst.value[item.propStart] = `${day} 00:00:00`
        if (!formFirst.value[item.propEndTime]) {
          formFirst.value[item.propEndTime] = day
        }
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
const onSaveAdvance = async () => {
  isShowTemplate.value = true
  // 暂存本次高级筛选为预设
}

async function upLoad() {
  const data: any = await upDownload({
    ...formFirst.value,
    ...advance.value
  })
  const timeName =
    new Date().getFullYear() +
    '_' +
    (new Date().getMonth() + 1) +
    '_' +
    new Date().getDate() +
    ',' +
    new Date().getHours() +
    '_' +
    new Date().getMinutes() +
    '_' +
    new Date().getSeconds()
  const blobs = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = window.URL.createObjectURL(blobs)
  const a = document.createElement('a')
  a.href = url
  a.download = `${timeName}导出数据.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}

const getOrganization = () => {
  if (userStore.getorganizationID === '-1') {
    return formFirst.value.organizationID || ''
  } else {
    return userStore.getorganizationID
  }
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
      ...advance.value,
      serviceSectID: advance.value.serviceSectID?.join(',') || '',
      examStatus: advance.value.examStatus?.join(',') || '',
      requestDeptID: advance.value.requestDeptID?.join(',') || '',
      patientClass: advance.value.patientClass?.join(',') || '',
      organizationID: getOrganization()
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
  onSearch()
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
const selectLockRow = ref<CheckInfoRow | null>({})
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
  return newList.flat(Infinity) as any
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
  // 锁定判断
  if (row.lockFlag === '是') {
    ElMessageBox.alert(`该检查已被锁定。锁定原因：${row.lockReason}`, '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    })
    currentDetail.value = {
      examResultStatus: false,
      examWrittenStatus: false,
      examFilmStatus: false,
      examImgStatus: false,
      documentDtos: [],
      isShowDialog: false // 如果已经被锁定了就不展示所有的东西
    }
    return
    // selectLockRow.value = row
  }

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
    documentDtos: documents,
    isShowDialog: true
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
const presetList = ref<PresetList[]>([])
const getpresetList = async () => {
  const { data } = await getpreset({
    userInfo
  })
  presetList.value = data
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

const getrecordexam = async (type: 'province' | 'pageApply') => {
  const loading = ElLoading.service({
    lock: true,
    text: '正在执行',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    const { data, isSuccess, message } = await apiGetrecordexam({
      ...activeRow.value,
      userInfo,
      applyMethod: type
    })
    if (isSuccess) {
      ElMessage.success('已成功获取关联检查')
      nextList.value = data
    } else {
      ElMessage.error(message)
    }
  } finally {
    loading.close()
  }
}
const startGetPresetList = async () => {
  await getpresetList()
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const day = `${yyyy}-${mm}-${dd}`
  if (presetList.value.length > 0) {
    const indexOnce = presetList.value.findIndex((item) => item.defaultFlag === '1')
    if (indexOnce !== -1) {
      // 命中默认预设，直接按预设查询
      setForm(presetList.value[indexOnce])
    } else {
      // 无默认预设：设置“检查时间”为当天 00:00 ~ 23:59:59，再查询

      formFirst.value.examEndTime = day
      formFirst.value.examStartTime = day
      onSearch()
    }
  } else {
    // 无任何预设：设置“检查时间”为当天 00:00 ~ 23:59:59，再查询

    formFirst.value.examEndTime = day
    formFirst.value.examStartTime = day
    onSearch()
  }
}
onMounted(async () => {
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', stopDrag)
  getTorg() // 超管机构才获取

  // getpresetList() //获取预设
  startGetPresetList()
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
// 锁定原因
const sureLock = async () => {
  upLoadingFileLoading.value = true
  try {
    await lockcheck({
      examUID: selectLockRow.value?.examUID || '',
      lockReason: modelValue.lockReason,
      isLock: lockTitle.value === '锁定原因' ? true : false
    })
    ElMessage.success('操作成功')
    lockDialog.value = false
    // 清理输入
    modelValue.lockReason = ''
    onSearch()
  } catch (err: any) {
    ElMessage.error(err?.message || '操作失败')
  } finally {
    upLoadingFileLoading.value = false
  }
}
const isShowTemplate = ref(false)
// 模板
const setForm = (item) => {
  console.log(JSON.parse(item.queryCondition), 'item')
  const formList = JSON.parse(item.queryCondition)
  console.log(formList, 'formList')
  const formArray = Object.keys(formList)
  const isHaveFirstDropdown = examOptions.findIndex((item) => formArray.includes(item.value))
  if (isHaveFirstDropdown !== -1) {
    indexInput.value = isHaveFirstDropdown
  }
  const isHaveSecondDropdown = timeAlternative.findIndex(
    (item) => formArray.includes(item.propStart) && formList[item.propStart]
  )
  if (isHaveSecondDropdown !== -1) {
    indexTime.value = isHaveSecondDropdown
  }

  formFirst.value = formList
  advance.value = formList
  onSearch()
}
const closeModel = async (item) => {
  await deletepreset({
    querySeq: item.querySeq
  })
  getpresetList()
}

const starModal = async (item: PresetList, type: 'star' | 'unstar') => {
  let data
  if (type === 'unstar') {
    data = await updatepresetdefaul({
      defaultFlag: '0',
      publicFlag: item.publicFlag,
      queryCondition: item.queryCondition,
      queryType: 'exam',
      name: item.name,
      querySeq: item.querySeq,
      sortNO: item.sortNO,
      userUID: userInfo.userUID,
      userInfo
    })
  } else {
    data = await cancelPreset({
      querySeq: item.querySeq,
      queryType: 'exam',
      defaultFlag: '1'
    })
  }
  if (data.isSuccess) {
    ElMessage.success('设置成功')
    await getpresetList()
  } else {
    ElMessage.error(data.message || '操作失败')
  }
}

const onConfirm = async () => {
  const { isSuccess, message } = await addpreset({
    name: modalTemplate.name,
    queryCondition: JSON.stringify({ ...formFirst.value, ...advance.value }),
    queryType: 'exam',
    userInfo
  })
  if (isSuccess) {
    ElMessage.success('保存成功')
    isShowTemplate.value = false
    modalTemplate.name = ''
    await getpresetList()
  } else {
    ElMessage.error(message || '保存失败')
  }
}

const showLockDialog = (row, isLock) => {
  selectLockRow.value = row
  lockTitle.value = isLock ? '锁定原因' : '解锁原因'
  lockDialog.value = true
}
onBeforeUnmount(() => {
  permiseListSearch()
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
  padding: 8px 12px 0;
  background: var(--el-fill-color-blank);
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
  background: var(--el-fill-color-blank);
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
  background: var(--el-fill-color-blank);
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
  cursor: pointer;
}

.header-right-modal {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.icon-drop {
  display: flex;
  justify-content: space-between;
  min-width: 150px;
  align-items: center;
  padding: 2px 10px;
}
</style>
