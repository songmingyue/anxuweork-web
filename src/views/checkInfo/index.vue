<template>
  <div class="checkinfo-page page">
    <!-- 顶部搜索条 -->
    <div class="toolbar">
      <el-form :inline="true" :model="formFirst" class="from-inline-margin">
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
              style="width: 150px"
            />
          </div>
        </el-form-item>
        <el-form-item label="姓名" label-width="40" label-position="left">
          <el-input
            v-model="formFirst.name"
            size="small"
            clearable
            placeholder="请输入"
            style="width: 150px"
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
              style="width: 150px; margin-top: -5px"
              size="small"
              :shortcuts="dateShortcuts"
            />
            <span class="sep sep-span">-</span>
            <el-date-picker
              v-model="formFirst[timeAlternative[indexTime].propEndTime]"
              value-format="YYYY-MM-DD"
              type="date"
              style="width: 150px; margin-top: -5px"
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
            style="width: 150px"
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
          <el-button
            size="small"
            class="btn-show"
            text
            type="primary"
            @click="toggleAdvance"
            ref="btnClickShow"
          >
            {{ showAdvance ? '收起' : '展开' }}
            <el-icon style="margin-left: 6px">
              <arrow-up v-if="showAdvance" />
              <arrow-down v-else />
            </el-icon>
          </el-button>
          <el-button size="small" type="primary" @click="onSearch">搜索</el-button>
          <el-button size="small" @click="onReset">重置</el-button>
          <el-button size="small" @click="upLoad">导出</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 展开筛选面板（图二） -->
    <div v-if="showAdvance" name="fade" ref="advanceCardRef">
      <el-card shadow="always" class="advance-card">
        <AdvanceSearchForm v-model="advance" :form-options="formOptions" />
        <div class="advance-footer">
          <el-button type="primary" style="width: 100%" @click="onSearch">搜索</el-button>
        </div>
      </el-card>
    </div>

    <!-- 中间主区域：左表格 + 分隔条 + 右预览（图三） -->
    <div class="checkinfo-main">
      <div class="left">
        <!-- 工具条（打印、导出等） -->
        <div class="left-tools">
          <div class="tools-flex">
            <el-dropdown :hide-on-click="false">
              <span class="el-dropdown-link">
                <el-icon :size="20"><Operation /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <div style="width: 350px; height: 300px">
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
        </div>

        <el-table
          :data="list"
          v-loading="loading"
          height="calc(100vh - 230px)"
          :header-cell-style="{ textAlign: 'center', background: '#f5f7fa', padding: '13px' }"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            show-overflow-tooltip
            v-for="item in tableList"
            :key="item.prop"
            :min-width="item.width"
            align="center"
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
import { ArrowDown, ArrowUp, Operation } from '@element-plus/icons-vue'
import { CheckInfoRow, getcheckinfolist, upDownload } from '@/api/checkInfo'

import { useUserStoreWithOut } from '@/store/modules/user'
import { getOrg } from '@/api/paramConf'
import { alternative, timeAlternative, checkBoxList, defaultStart } from './index'
import { getSearchFormList, permiseListSearch } from './searchOptions'
import { getpreset, PresetList } from '@/api/authConf'
import { getdicitemlists, getDicmsgList } from '@/utils/dicmsg'
import AdvanceSearchForm from './components/AdvanceSearchForm.vue'

import { formatDate } from '@/utils/timeDate'

// 锁定弹窗由子组件 LockDialog 管理表单与校验

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
  const opt = alternative[indexInput.value]
  return opt.label ? opt.label : '检查号'
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

// 本地日期快捷项：点击时同时填充 formFirst 的开始/结束字段
const dateShortcuts = [
  {
    text: '所有',
    value() {
      const end = new Date()
      const start = new Date('1970-01-01')
      const t = timeAlternative[indexTime.value]
      if (t) {
        formFirst.value[t.propEndTime] = formatDate(end, 'date')
        formFirst.value[t.prop] = `,${formatDate(end, 'date')}`
      }
      return [start]
    }
  },
  {
    text: '自定义',
    onClick() {
      const t = timeAlternative[indexTime.value]
      if (t) {
        formFirst.value[t.propStart] = ''
        formFirst.value[t.propEndTime] = ''
      }
    }
  },
  {
    text: '今天',
    value() {
      const end = new Date()
      const start = new Date()
      const t = timeAlternative[indexTime.value]
      if (t) {
        formFirst.value[t.propStart] = formatDate(start, 'date')
        formFirst.value[t.propEndTime] = formatDate(end, 'date')
        formFirst.value[t.prop] = `${formatDate(start, 'date')},${formatDate(end, 'date')}`
      }
      return [start]
    }
  },
  {
    text: '两天',
    value() {
      const end = new Date()
      const start = new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000)
      const t = timeAlternative[indexTime.value]
      if (t) {
        formFirst.value[t.propStart] = formatDate(start, 'date')
        formFirst.value[t.propEndTime] = formatDate(end, 'date')
        formFirst.value[t.prop] = `${formatDate(start, 'date')},${formatDate(end, 'date')}`
      }
      return [start]
    }
  },
  {
    text: '三天',
    value() {
      const end = new Date()
      const start = new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000)
      const t = timeAlternative[indexTime.value]
      if (t) {
        formFirst.value[t.propStart] = formatDate(start, 'date')
        formFirst.value[t.propEndTime] = formatDate(end, 'date')
        formFirst.value[t.prop] = `${formatDate(start, 'date')},${formatDate(end, 'date')}`
      }
      return [start]
    }
  },
  {
    text: '七天',
    value() {
      const end = new Date()
      const start = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
      const t = timeAlternative[indexTime.value]
      if (t) {
        formFirst.value[t.propStart] = formatDate(start, 'date')
        formFirst.value[t.propEndTime] = formatDate(end, 'date')
        formFirst.value[t.prop] = `${formatDate(start, 'date')},${formatDate(end, 'date')}`
      }
      return [start]
    }
  },
  {
    text: '本周',
    value() {
      const end = new Date()
      const start = new Date()
      const day = start.getDay() || 7 // 周日为0，转换为7
      start.setDate(start.getDate() - day + 1) // 设置为本周一
      const t = timeAlternative[indexTime.value]
      if (t) {
        formFirst.value[t.propStart] = formatDate(start, 'date')
        formFirst.value[t.propEndTime] = formatDate(end, 'date')
        formFirst.value[t.prop] = `${formatDate(start, 'date')},${formatDate(end, 'date')}`
      }
      return [start]
    }
  },
  {
    text: '本月',
    value() {
      const end = new Date()
      const start = new Date()
      start.setDate(1) // 设置为本月1号
      const t = timeAlternative[indexTime.value]
      if (t) {
        formFirst.value[t.propStart] = formatDate(start, 'date')
        formFirst.value[t.propEndTime] = formatDate(end, 'date')
        formFirst.value[t.prop] = `${formatDate(start, 'date')},${formatDate(end, 'date')}`
      }
      return [start]
    }
  },
  {
    text: '本年',
    value() {
      const end = new Date()
      const start = new Date()
      start.setMonth(0) // 设置为1月
      start.setDate(1) // 设置为1号
      const t = timeAlternative[indexTime.value]
      if (t) {
        formFirst.value[t.propStart] = formatDate(start, 'date')
        formFirst.value[t.propEndTime] = formatDate(end, 'date')
        formFirst.value[t.prop] = `${formatDate(start, 'date')},${formatDate(end, 'date')}`
      }
      return [start]
    }
  }
]

function onTimeKeyChange(key: string) {
  indexTime.value = timeAlternative.findIndex((item) => item.propStart === key)
  timeAlternative.forEach((item) => {
    formFirst.value[item.propEndTime] = ''
    formFirst.value[item.propStart] = ''
    formFirst.value[item.prop] = ''
  })
}
// 展开筛选
const showAdvance = ref(false)

const toggleAdvance = () => {
  setTimeout(() => {
    showAdvance.value = !showAdvance.value
  }, 10)
}

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
    formFirst.value[item.prop] =
      `${formFirst.value[item.propStart]},${formFirst.value[item.propEndTime]}`
  })

  return {
    ...formFirst.value,
    ...advance.value
  }
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
  return formFirst.value.organizationID || ''
}

// 查询
async function onSearch() {
  showAdvance.value = false
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
    // 默认选中第一条作为右侧详情
  } finally {
    loading.value = false
  }
}

const onReset = () => {
  formFirst.value = {}
  advance.value = {}
  formFirst.value.examEndTime = formatDate(new Date(), 'date')
  formFirst.value.examStartTime = formatDate(new Date(), 'date')
  formFirst.value.prop = `${formFirst.value.examStartTime},${formFirst.value.examEndTime}`
  onSearch()
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

// 左右拖拽分隔

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

const selectRow = ref<CheckInfoRow[]>([])

const handleSelectionChange = (val) => {
  selectRow.value = val
}

const startGetPresetList = async () => {
  await getpresetList()
  if (presetList.value.length > 0) {
    // 无默认预设：设置“检查时间”为当天 00:00 ~ 23:59:59，再查询

    formFirst.value.examEndTime = formatDate(new Date(), 'date')
    formFirst.value.examStartTime = formatDate(new Date(), 'date')
    onSearch()
  } else {
    // 无任何预设：设置“检查时间”为当天 00:00 ~ 23:59:59，再查询

    formFirst.value.examEndTime = formatDate(new Date(), 'date')
    formFirst.value.examStartTime = formatDate(new Date(), 'date')
    onSearch()
  }
}
onMounted(async () => {
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

onBeforeUnmount(() => {
  permiseListSearch()
})
</script>

<style scoped>
.checkinfo-page {
  display: flex;
  flex-direction: column;
}

.toolbar {
  padding: 20px 12px 0;
  margin-bottom: 10px;
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
  min-height: 0;
}

.left {
  display: flex;
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
  place-items: center center;
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
  left: 2px;
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

.class-very-big {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.arrow-icon {
  width: 19.8px;
}

.icon-img {
  margin-right: 16px;
  color: var(--el-text-color-regular);
}

.tools-flex {
  display: flex;
  align-items: flex-start;
  margin: 5px 0;
  color: var(--el-text-color-regular);
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

.icon-drop {
  display: flex;
  justify-content: space-between;
  min-width: 150px;
  align-items: center;
  padding: 2px 10px;
}

.btn-show {
  margin-right: -12px;
  margin-left: -12px;
}
</style>
