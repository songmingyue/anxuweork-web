<template>
  <div class="checkinfo-page">
    <!-- 顶部搜索条 -->
    <div class="toolbar">
      <el-form :inline="true" :model="q">
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
              v-model="q.examValue"
              placeholder="请输入"
              style="width: 180px"
            />
          </div>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="q.name" size="small" placeholder="请输入" style="width: 160px" />
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
                    :key="item.prop"
                    :command="item.prop"
                    >{{ item.label }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-date-picker
              v-model="q.start"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
            />
          </div>
        </el-form-item>
        <el-form-item label="检查科室">
          <el-select
            size="small"
            v-model="q.dept"
            placeholder="请选择"
            style="width: 160px"
            clearable
          >
            <el-option label="急诊科" value="ER" />
            <el-option label="内科" value="IM" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button>筛查</el-button>
          <el-button>导出</el-button>
          <el-button>存为方案</el-button>
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
        <div class="advance-head">
          <div>患者信息 / 就诊信息 / 检查信息 / 状态标识 / 检查结果</div>
          <el-button circle size="small" @click="showAdvance = false">×</el-button>
        </div>
        <div class="advance-grid">
          <el-form :model="advance" label-width="100px">
            <!-- 行1 -->
            <div class="row">
              <el-form-item label="性别"
                ><el-select v-model="advance.sex" clearable
                  ><el-option label="男" value="M" /><el-option label="女" value="F" /></el-select
              ></el-form-item>
              <el-form-item label="年龄">
                <div class="age-range">
                  <el-input v-model="advance.ageFrom" placeholder="最小" />
                  <span class="sep">-</span>
                  <el-input v-model="advance.ageTo" placeholder="最大" />
                </div>
              </el-form-item>
              <el-form-item label="生日"
                ><el-date-picker v-model="advance.birthday" type="date" placeholder="请选择"
              /></el-form-item>
              <el-form-item label="就诊类型"
                ><el-select v-model="advance.period" clearable
              /></el-form-item>
            </div>
            <!-- 行2 -->
            <div class="row">
              <el-form-item label="申请科室"
                ><el-select v-model="advance.applyDept" clearable
              /></el-form-item>
              <el-form-item label="申请医生"
                ><el-select v-model="advance.applyDoctor" clearable
              /></el-form-item>
              <el-form-item label="审核医生"
                ><el-select v-model="advance.reviewDoctor" clearable
              /></el-form-item>
              <el-form-item label="报告医生"
                ><el-select v-model="advance.reportDoctor" clearable
              /></el-form-item>
            </div>
            <!-- 行3 -->
            <div class="row">
              <el-form-item label="检查类型"
                ><el-select v-model="advance.examType" clearable
              /></el-form-item>
              <el-form-item label="检查设备"
                ><el-select v-model="advance.device" clearable
              /></el-form-item>
              <el-form-item label="影像状态"
                ><el-select v-model="advance.statistics" clearable
              /></el-form-item>
              <el-form-item label="报告状态"
                ><el-select v-model="advance.printStatus" clearable
              /></el-form-item>
            </div>
            <!-- 行4 -->
            <div class="row">
              <el-form-item label="胶片状态"
                ><el-select v-model="advance.filmStatus" clearable
              /></el-form-item>
              <el-form-item label="打印状态"
                ><el-select v-model="advance.lockStatus" clearable
              /></el-form-item>
              <el-form-item label="标记状态"
                ><el-select v-model="advance.examStatus" clearable
              /></el-form-item>
              <el-form-item label="所属机构"
                ><el-select v-model="advance.org" clearable
              /></el-form-item>
            </div>
          </el-form>
        </div>
        <div class="advance-footer">
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onResetAdvance">重置</el-button>
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
              列表字段
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
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
        >
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

      <!-- 右预览 -->
      <div class="right">
        <div class="preview-toolbar">
          <span>预览</span>
          <div class="spacer"></div>
          <el-button size="small">缩放</el-button>
          <el-button size="small">下载</el-button>
        </div>
        <div class="preview-body">
          <img :src="previewUrl" alt="report" />
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
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { CheckInfoRow, getcheckinfolist } from '@/api/checkInfo'
import { useUserStoreWithOut } from '@/store/modules/user'
import { getOrg } from '@/api/paramConf'
import { alternative, timeAlternative, checkBoxList, examOptions } from './index'
const checkedColumns = ref<string[]>([])
// 顶部简单搜索

const tableList = computed(() => {
  return checkBoxList.filter((item) => checkedColumns.value.includes(item.prop))
})

const q = reactive({
  examKey: 'examNo',
  timeLabel: 'examTime',
  examValue: '',
  name: '',
  start: '',
  end: '',
  modality: '',
  dept: ''
})

const selectedExamLabel = computed(() => {
  const opt = examOptions.find((o) => o.value === q.examKey)
  return opt ? opt.label : '检查号'
})
const selectTimeOption = computed(() => {
  const opt = timeAlternative.find((o) => o.prop === q.start)
  return opt ? opt.label : '检查时间'
})

function onExamKeyChange(key: string) {
  q.examKey = key
}

function onTimeKeyChange(key: string) {
  q.start = key
}
// 展开筛选
const showAdvance = ref(false)
const advance = reactive({
  sex: '',
  ageFrom: '',
  ageTo: '',
  birthday: '',
  applyDept: '',
  applyDoctor: '',
  reviewDoctor: '',
  reportDoctor: '',
  examType: '',
  device: '',
  examStatus: '',
  filmStatus: '',
  printStatus: '',
  lockStatus: '',
  statistics: '',
  org: '',
  period: ''
})

const loading = ref(false)
const list = ref<CheckInfoRow[]>([])
const total = ref(114)
const page = ref(1)
const size = ref(20)

// 右侧预览
const previewUrl = ref('https://picsum.photos/900/1200?grayscale')

// 查询
async function onSearch() {
  try {
    const userStore = useUserStoreWithOut()
    loading.value = true
    const query = {
      pagesize: size.value,
      currentPage: page.value,
      userInfo: Array.isArray(userStore.getUserInfo)
        ? userStore.getUserInfo[0]
        : userStore.getUserInfo,
      token: userStore.getToken
    }
    const data = await getcheckinfolist(query)
    list.value = data.data
  } finally {
    loading.value = false
  }
}
function onResetAdvance() {
  Object.keys(advance).forEach((k) => ((advance as any)[k] = ''))
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
const leftWidth = ref(62) // 百分比
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
  leftWidth.value = Math.min(80, Math.max(35, percent))
}
function stopDrag() {
  dragging = false
  document.body.style.userSelect = ''
}
const getTorg = async () => {
  const { data } = await getOrg()
  console.log(data)
}
onMounted(() => {
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', stopDrag)
  getTorg()
  onSearch()
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
  width: 86%;
  transform: translateX(-50%);
}

.advance-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.advance-grid .row {
  display: grid;
  grid-template-columns: repeat(4, minmax(220px, 1fr));
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
</style>
