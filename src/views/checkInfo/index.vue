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
          <el-button size="small">打印</el-button>
          <el-button size="small">导出</el-button>
          <el-button size="small">批量</el-button>
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
        </div>

        <el-table
          :data="list"
          v-loading="loading"
          border
          height="calc(100% - 40px)"
          highlight-current-row
          @row-click="onRowClick"
        >
          <el-table-column label="" width="108" fixed="left">
            <template #default="{ row }">
              <div class="icon-disable">
                <img
                  v-if="row.ifHasImage === '有'"
                  class="image-icon icon-margin"
                  src="@/assets/imgs/info/img_view.png"
                  alt="imgs"
                />
                <!-- <img
                  v-if="row.ifHasImage === '有'"
                  class="image-icon icon-margin"
                  src="@/assets/imgs/info/img_view_added.png"
                  alt="imgs"
                /> -->
                <img
                  class="image-icon"
                  v-if="row.ifHasReport === '有'"
                  src="@/assets/imgs/info/w_report.png"
                  alt="imgs"
                />
                <img
                  class="image-icon"
                  style="width: 19px; height: 19px"
                  src="@/assets/imgs/info/film_disable.png"
                  alt="imgs"
                />
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
            </template>
          </el-table-column>
          <el-table-column type="selection" width="48" />
          <el-table-column
            v-for="item in tableList"
            :key="item.prop"
            :min-width="item.width"
            :label="item.label"
            :prop="item.prop"
          />
        </el-table>

        <div class="pager">
          <div class="summary">共 {{ total }} 条</div>
          <el-pagination
            background
            layout="prev, pager, next, sizes"
            :total="total"
            :page-sizes="[20, 50, 100]"
            :page-size="size"
            :current-page="page"
            @size-change="onSizeChange"
            @current-change="onPageChange"
          />
        </div>
      </div>

      <!-- 分隔条，可拖动 -->
      <div class="splitter" @mousedown="startDrag">
        <div class="hint">⋮</div>
      </div>

      <!-- 右侧详情 -->
      <div class="right">
        <RightDetailCard :detail="currentDetail" />
      </div>
    </div>
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
  ElCheckboxGroup
} from 'element-plus'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import type { CheckReportDetail, PushStatus } from '@/api/checkInfo'
import { CheckInfoRow, getcheckinfolist, getPushStatus, getwrittenreport } from '@/api/checkInfo'
import RightDetailCard from './components/RightDetailCard.vue'
import { useUserStoreWithOut } from '@/store/modules/user'
import { getOrg } from '@/api/paramConf'
import { alternative, timeAlternative, checkBoxList, examOptions, defaultStart } from './index'
import { getSearchFormList } from './searchOptions'
import { getpreset } from '@/api/authConf'
import { getdicitemlists, getDicmsgList } from '@/utils/dicmsg'
import AdvanceSearchForm from './components/AdvanceSearchForm.vue'
const checkedColumns = ref<string[]>([...defaultStart.map((item) => item.prop)])
// 顶部简单搜索
const userStore = useUserStoreWithOut()
const userInfo = Array.isArray(userStore.getUserInfo)
  ? userStore.getUserInfo[0]
  : userStore.getUserInfo
const tableList = computed(() => {
  return checkBoxList.filter((item) => checkedColumns.value.includes(item.prop))
})

const formFirst = ref<any>({})

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
const orgOptions = ref<{ organizationName: string; organizationID: string }[]>([])
// 右侧详情当前行：同时包含列表行字段与详细报告字段
type CurrentDetail = Partial<CheckInfoRow & CheckReportDetail & PushStatus>
const currentDetail = ref<CurrentDetail>({})

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
    // 默认选中第一条作为右侧详情
    currentDetail.value = list.value?.[0] || null
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

// 行点击时更新右侧详情
async function onRowClick(row: CheckInfoRow) {
  let detailMsg = {}
  const { resultValue } = await getPushStatus(row)
  if (row) {
    const { data } = await getwrittenreport({
      ...row,
      userInfo
    })
    detailMsg = data[0] || {}
  }
  currentDetail.value = { ...row, ...detailMsg, ...resultValue }
}

// 左右拖拽分隔
const leftWidth = ref(5) // 百分比
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
  leftWidth.value = Math.min(80, Math.max(5, percent))
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
})
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
  min-width: 35%;
  background: #fff;
  border-right: 1px solid #ebeef5;
  flex-direction: column;
}

.left-tools {
  padding: 6px 8px;
  border-bottom: 1px solid #ebeef5;
}

.pager {
  display: flex;
  padding: 6px 8px;
  border-top: 1px solid #ebeef5;
  align-items: center;
  justify-content: space-between;
}

.summary {
  color: #909399;
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
  min-width: 20%;
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
</style>
