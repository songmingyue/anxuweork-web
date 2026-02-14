<script setup lang="ts">
import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElPagination,
  ElRow,
  ElCol,
  ElSelect,
  ElOption,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTabPane
} from 'element-plus'
import { computed, reactive, ref } from 'vue'

defineOptions({
  name: 'Workstation'
})

const showMore = ref(false)

const query = reactive({
  checkNo: '',
  patientNo: '',
  patientName: '',
  filmNo: '',
  examType: '',
  visitType: '',
  applyDept: '',
  dateRange: [] as string[],

  reportStatus: '',
  examStatus: ''
})

const examTypeOptions = ref([
  { label: '全部', value: '' },
  { label: 'CT', value: 'CT' },
  { label: 'MR', value: 'MR' },
  { label: 'DR', value: 'DR' },
  { label: 'US', value: 'US' }
])

const visitTypeOptions = ref([
  { label: '全部', value: '' },
  { label: '门诊', value: 'outpatient' },
  { label: '住院', value: 'inpatient' },
  { label: '体检', value: 'checkup' }
])

const reportStatusOptions = ref([
  { label: '全部', value: '' },
  { label: '未出报告', value: '0' },
  { label: '已出报告', value: '1' }
])

const examStatusOptions = ref([
  { label: '全部', value: '' },
  { label: '未检查', value: '0' },
  { label: '检查中', value: '1' },
  { label: '已检查', value: '2' }
])

const manualMatchCount = ref(13)

type ExamRow = {
  patientNo: string
  checkNo: string
  name: string
  sex: string
  age: string
  examType: string
  reportStatus: string
  examStatus: string
  examItem: string
  examTime: string
  visitType: string
  medicalNo: string
  applyDept: string
  filmFee: string
  idNo: string
}

const examTableLoading = ref(false)
const examTableData = ref<ExamRow[]>([])

const page = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const filmTab = ref<'list' | 'thumb'>('list')

type FilmRow = {
  taskNo: string
  printStatus: string
  printTime: string
  targetPrinter: string
  requestDevice: string
  requestTime: string
  filmSize: string
  filmDirection: string
  filmType: string
  displayFormat: string
}

const filmTableLoading = ref(false)
const filmTableData = ref<FilmRow[]>([])

const filmPage = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const onSearch = () => {
  examTableLoading.value = true
  setTimeout(() => {
    examTableLoading.value = false
  }, 200)
}

const onReset = () => {
  query.checkNo = ''
  query.patientNo = ''
  query.patientName = ''
  query.filmNo = ''
  query.examType = ''
  query.visitType = ''
  query.applyDept = ''
  query.dateRange = []
  query.reportStatus = ''
  query.examStatus = ''
}

const toggleMore = () => {
  showMore.value = !showMore.value
}

const onExamPageChange = (val: number) => {
  page.pageNum = val
  onSearch()
}

const onExamSizeChange = (val: number) => {
  page.pageSize = val
  page.pageNum = 1
  onSearch()
}

const onFilmPageChange = (val: number) => {
  filmPage.pageNum = val
}

const onFilmSizeChange = (val: number) => {
  filmPage.pageSize = val
  filmPage.pageNum = 1
}

const moreText = computed(() => (showMore.value ? '收起' : '更多'))
</script>

<template>
  <div class="ws-page">
    <ElCard shadow="never" class="ws-card">
      <ElForm :model="query" label-width="0" class="ws-form" size="small">
        <ElRow :gutter="10" class="ws-form__row">
          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElInput v-model="query.checkNo" placeholder="检查号" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElInput v-model="query.patientNo" placeholder="患者编号" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElInput v-model="query.patientName" placeholder="患者姓名" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElInput v-model="query.filmNo" placeholder="病历号" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElSelect v-model="query.examType" placeholder="检查类型" clearable>
                <ElOption
                  v-for="o in examTypeOptions"
                  :key="o.value"
                  :label="o.label"
                  :value="o.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElSelect v-model="query.visitType" placeholder="就诊类别" clearable>
                <ElOption
                  v-for="o in visitTypeOptions"
                  :key="o.value"
                  :label="o.label"
                  :value="o.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElInput v-model="query.applyDept" placeholder="申请科室" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="16" :lg="6">
            <ElFormItem>
              <ElDatePicker
                v-model="query.dateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                unlink-panels
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :sm="24" :md="24" :lg="14">
            <ElFormItem>
              <div class="ws-form__actions">
                <ElButton type="primary" @click="onSearch">查询</ElButton>
                <ElButton @click="onReset">重置</ElButton>
                <ElButton text type="primary" class="ws-form__more" @click="toggleMore">
                  {{ moreText }}
                </ElButton>
              </div>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow v-if="showMore" :gutter="10" class="ws-form__row ws-form__row--more">
          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElSelect v-model="query.reportStatus" placeholder="报告状态" clearable>
                <ElOption
                  v-for="o in reportStatusOptions"
                  :key="o.value"
                  :label="o.label"
                  :value="o.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElSelect v-model="query.examStatus" placeholder="检查状态" clearable>
                <ElOption
                  v-for="o in examStatusOptions"
                  :key="o.value"
                  :label="o.label"
                  :value="o.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </ElCard>

    <ElCard shadow="never" class="ws-card">
      <div class="ws-sectionHead">
        <div class="ws-sectionHead__title">检查列表</div>
        <div class="ws-sectionHead__actions">
          <ElButton size="small" disabled>解除限制</ElButton>
          <ElButton size="small" disabled>付费</ElButton>
          <ElButton size="small" type="primary" plain disabled>查看胶片</ElButton>
          <ElButton size="small" type="primary" plain disabled>查看报告</ElButton>
          <ElButton size="small" type="primary" plain disabled>打印报告</ElButton>
          <ElButton size="small" type="primary" plain disabled>
            手工匹配({{ manualMatchCount }})
          </ElButton>
        </div>
      </div>

      <ElTable
        :data="examTableData"
        :loading="examTableLoading"
        size="small"
        height="420"
        class="ws-table"
      >
        <ElTableColumn type="selection" width="42" />
        <ElTableColumn type="index" label="#" width="48" />
        <ElTableColumn prop="patientNo" label="患者编号" min-width="110" />
        <ElTableColumn prop="checkNo" label="检查号" min-width="110" />
        <ElTableColumn prop="name" label="姓名" min-width="90" />
        <ElTableColumn prop="sex" label="性别" width="70" />
        <ElTableColumn prop="age" label="年龄" width="70" />
        <ElTableColumn prop="examType" label="检查类型" min-width="100" />
        <ElTableColumn prop="reportStatus" label="报告状态" min-width="90" />
        <ElTableColumn prop="examStatus" label="检查状态" min-width="90" />
        <ElTableColumn prop="examItem" label="检查项目" min-width="120" />
        <ElTableColumn prop="examTime" label="检查时间" min-width="140" />
        <ElTableColumn prop="visitType" label="就诊类别" min-width="90" />
        <ElTableColumn prop="medicalNo" label="病历号" min-width="110" />
        <ElTableColumn prop="applyDept" label="申请科室" min-width="110" />
        <ElTableColumn prop="filmFee" label="胶片费用" min-width="90" />
        <ElTableColumn prop="idNo" label="身份证号" min-width="150" />
      </ElTable>

      <div class="ws-pagination">
        <div class="ws-pagination__left">共 {{ page.total }} 条</div>
        <ElPagination
          v-model:current-page="page.pageNum"
          v-model:page-size="page.pageSize"
          :total="page.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="sizes, prev, pager, next, jumper"
          small
          @current-change="onExamPageChange"
          @size-change="onExamSizeChange"
        />
      </div>
    </ElCard>

    <ElCard shadow="never" class="ws-card">
      <div class="ws-filmHead">
        <div class="ws-filmHead__left">
          <span class="ws-filmHead__title">胶片</span>
          <ElTabs v-model="filmTab" class="ws-filmHead__tabs">
            <ElTabPane label="列表" name="list" />
            <ElTabPane label="缩略图" name="thumb" />
          </ElTabs>
        </div>
        <div class="ws-filmHead__actions">
          <ElButton size="small" disabled>选中未打印</ElButton>
          <ElButton size="small" type="primary" plain disabled>打印胶片</ElButton>
          <ElButton size="small" disabled>修改目的打印机</ElButton>
        </div>
      </div>

      <ElTable
        v-if="filmTab === 'list'"
        :data="filmTableData"
        :loading="filmTableLoading"
        size="small"
        border
        height="230"
        class="ws-table"
      >
        <ElTableColumn type="selection" width="42" />
        <ElTableColumn type="index" label="#" width="48" />
        <ElTableColumn prop="taskNo" label="任务号" min-width="110" />
        <ElTableColumn prop="printStatus" label="打印状态" min-width="90" />
        <ElTableColumn prop="printTime" label="胶片打印时间" min-width="140" />
        <ElTableColumn prop="targetPrinter" label="目的打印机" min-width="120" />
        <ElTableColumn prop="requestDevice" label="请求设备" min-width="110" />
        <ElTableColumn prop="requestTime" label="请求时间" min-width="140" />
        <ElTableColumn prop="filmSize" label="胶片尺寸" min-width="90" />
        <ElTableColumn prop="filmDirection" label="出片方向" min-width="90" />
        <ElTableColumn prop="filmType" label="胶片类型" min-width="90" />
        <ElTableColumn prop="displayFormat" label="显示格式" min-width="90" />
      </ElTable>

      <div v-else class="ws-thumbEmpty">
        <div class="ws-thumbEmpty__tip">缩略图模式（待接入数据）</div>
      </div>

      <div class="ws-pagination ws-pagination--film">
        <div class="ws-pagination__left">共 {{ filmPage.total }} 条</div>
        <ElPagination
          v-model:current-page="filmPage.pageNum"
          v-model:page-size="filmPage.pageSize"
          :total="filmPage.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="sizes, prev, pager, next, jumper"
          small
          @current-change="onFilmPageChange"
          @size-change="onFilmSizeChange"
        />
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.ws-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ws-card {
  width: 100%;
}

.ws-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.ws-form__row {
  align-items: center;
}

.ws-form__row--more {
  padding-top: 2px;
}

.ws-form__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.ws-form__more {
  padding: 0 4px;
}

.ws-sectionHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.ws-sectionHead__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.ws-sectionHead__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ws-table :deep(.el-table__empty-text) {
  font-size: 12px;
}

.ws-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
}

.ws-pagination__left {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.ws-filmHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.ws-filmHead__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ws-filmHead__title {
  font-size: 14px;
  font-weight: 700;
}

.ws-filmHead__tabs :deep(.el-tabs__header) {
  margin: 0;
}

.ws-filmHead__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ws-thumbEmpty {
  display: flex;
  height: 230px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 2px;
  align-items: center;
  justify-content: center;
}

.ws-thumbEmpty__tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.ws__divider {
  margin: 0;
}

.ws__todo {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ws__todoItem {
  display: flex;
  width: 100%;
  padding: 10px 12px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  align-items: center;
  justify-content: space-between;
}

.ws__todoItem:hover {
  border-color: var(--el-color-primary);
}

.ws__todoTitle {
  font-size: 13px;
  color: var(--el-text-color-primary);
}
</style>
