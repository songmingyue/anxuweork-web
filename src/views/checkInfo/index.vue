<template>
  <div class="checkinfo-page">
    <!-- 顶部搜索条 -->
    <div class="toolbar">
      <el-form :inline="true" :model="q">
        <el-form-item label="检查号">
          <el-input v-model="q.examNo" placeholder="请输入" style="width: 180px" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="q.name" placeholder="请输入" style="width: 160px" />
        </el-form-item>
        <el-form-item label="检查时间">
          <el-date-picker
            v-model="q.start"
            type="datetime"
            placeholder="开始时间"
            style="width: 190px"
          />
          <span class="sep">至</span>
          <el-date-picker
            v-model="q.end"
            type="datetime"
            placeholder="结束时间"
            style="width: 190px"
          />
        </el-form-item>
        <el-form-item label="检查科室">
          <el-select v-model="q.dept" placeholder="请选择" style="width: 160px" clearable>
            <el-option label="急诊科" value="ER" />
            <el-option label="内科" value="IM" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button>筛查</el-button>
          <el-button>导出</el-button>
          <el-button>存为方案</el-button>
          <el-button text type="primary" @click="showAdvance = true">展开</el-button>
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
        </div>

        <el-table
          :data="list"
          v-loading="loading"
          border
          height="calc(100% - 40px)"
          highlight-current-row
        >
          <el-table-column type="selection" width="48" />
          <el-table-column label="类型" prop="type" width="80" />
          <el-table-column label="检查部位" prop="item" min-width="160" show-overflow-tooltip />
          <el-table-column label="姓名" prop="name" width="100" />
          <el-table-column label="性别" prop="sex" width="80" />
          <el-table-column label="年龄" prop="age" width="100" />
          <el-table-column label="检查号" prop="examNo" width="120" />
          <el-table-column label="申请科室" prop="dept" width="140" />
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
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
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
  ElCard
} from 'element-plus'

// 顶部简单搜索
const q = reactive({
  examNo: '',
  name: '',
  start: '',
  end: '',
  modality: '',
  dept: ''
})

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

// 表格 + 分页
type Row = {
  type: string
  item: string
  name: string
  sex: string
  age: string
  phone?: string
  birthday?: string
  idNo?: string
  examNo: string
  source?: string
  dept?: string
}
const loading = ref(false)
const list = ref<Row[]>([])
const total = ref(114)
const page = ref(1)
const size = ref(20)

// 右侧预览
const previewUrl = ref('https://picsum.photos/900/1200?grayscale')

// 查询
function onSearch() {
  loading.value = true
  // TODO: 调用接口，用 q + advance
  setTimeout(() => {
    list.value = Array.from({ length: size.value }).map((_, i) => ({
      type: 'CT',
      item: i === 0 ? '40排CT平扫颅脑' : '腹部平扫',
      name: i === 0 ? '孙秀波' : '王立国',
      sex: i % 2 ? '男' : '女',
      age: `${48 + (i % 10)}岁`,
      examNo: (5300 + i).toString(),
      dept: i % 2 ? '急诊科' : '内科'
    }))
    loading.value = false
  }, 250)
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
onMounted(() => {
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', stopDrag)
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
</style>
