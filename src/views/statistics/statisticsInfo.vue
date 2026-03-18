<script setup lang="ts">
import { Data, getDropDownConfig, getPatientTypeList } from '@/api/common'
import { ExamPrintDetail, getExamPrintMonthlyStatistics } from '@/api/statisticsInfo'
import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn
} from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import * as XLSX from 'xlsx'
defineOptions({
  name: 'StatisticsInfo'
})

const query = reactive({
  patientType: [] as string[],
  examType: [] as string[],
  dateRange: [] as string[]
})

const patientTypeOptions = ref<string[]>([])

const examTypeOptions = ref<Data[]>([])

export interface ExamPrint {
  examPatientTotal: number
  examPrinted: number
  examType: string
  examTypeTotal: number
  filmPaid: number
  filmPrinted: number
  patientType: string
  month: string
}

const tableData = ref<ExamPrint[]>([])
const getCommonList = async () => {
  const { data } = await getDropDownConfig()
  const { data: data1 } = await getPatientTypeList()
  patientTypeOptions.value = data1
  examTypeOptions.value = data

  query.dateRange = [
    new Date(new Date().valueOf() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  ]
  onSelectQuery()
}

const onSearch = async (querys: string) => {
  const result = await getExamPrintMonthlyStatistics({
    examType: [],
    startDate: query.dateRange[0] + ' 00:00:00',
    endDate: query.dateRange[1] + ' 23:59:59',
    patientType: [querys]
  })

  const dataChanges: ExamPrint[] = []
  result.examPrintResult.map((item) => {
    item.examPrintDetail.map((items: ExamPrintDetail) => {
      dataChanges.push({
        month: item.month,
        examPrinted: items.examPrinted,
        examPatientTotal: items.examPatientTotal,
        patientType: querys,
        examType: items.examType,
        examTypeTotal: items.examTypeTotal,
        filmPrinted: items.filmPrinted,
        filmPaid: items.filmPaid
      })
    })
  })
  return dataChanges
  // tableData.value = dataChanges
}
const tableDataAll: ExamPrint[] = reactive([])
// 处理数据
const onSelectQuery = async () => {
  tableDataAll.length = 0
  const { patientType } = query
  let patientTypeList = [...(patientType as string[])]
  if (patientTypeList.length === 0) {
    patientTypeList = patientTypeOptions.value
  }
  const res = await Promise.all(patientTypeList.map((item) => onSearch(item)))
  res.forEach((item) => {
    tableDataAll.push(...item)
  })
  if (tableDataAll.length === 0) {
    tableData.value = []
    return
  }
  tableDataAll
    .sort((a, b) => a.month.localeCompare(b.month))
    .push({
      month: '合计',
      examPrinted: tableDataAll.reduce((total, item) => total + item.examPrinted, 0),
      examPatientTotal: tableDataAll.reduce((total, item) => total + item.examPatientTotal, 0),
      patientType: '',
      examType: '',
      examTypeTotal: tableDataAll.reduce((total, item) => total + item.examTypeTotal, 0),
      filmPrinted: tableDataAll.reduce((total, item) => total + item.filmPrinted, 0),
      filmPaid: tableDataAll.reduce((total, item) => total + item.filmPaid, 0)
    })

  tableData.value = tableDataAll
}
onMounted(() => {
  getCommonList()
})
const tableTitle = [
  { label: '打印时间', prop: 'month', sort: 'custom' },
  { label: '就诊类别', prop: 'patientType', sort: 'custom' },
  { label: '检查类型', prop: 'examType', sort: 'custom' },
  { label: '检查量', prop: 'examTypeTotal', sort: false },
  { label: '检查打印量', prop: 'examPrinted', sort: false },
  { label: '胶片打印量', prop: 'filmPrinted', sort: false },
  { label: '补费量', prop: 'filmPaid', sort: false }
]
// 导出Excel
const onExport = () => {
  const header = tableTitle.map((item) => item.label)
  const data = tableData.value.map((item) => [
    item.month,
    item.patientType,
    item.examType,
    item.examTypeTotal,
    item.examPrinted,
    item.filmPrinted,
    item.filmPaid
  ])

  const sheet = XLSX.utils.aoa_to_sheet([header, ...data])

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1')

  XLSX.writeFile(workbook, '统计详情.xlsx')
}

type SortOrder = 'ascending' | 'descending' | null

const SUMMARY_MONTH = '合计'

const detachSummaryRow = (rows: ExamPrint[]) => {
  const index = rows.findIndex((row) => row.month === SUMMARY_MONTH)
  if (index === -1) return undefined
  return rows.splice(index, 1)[0]
}

const compareValues = (valueA: unknown, valueB: unknown) => {
  if (valueA == null && valueB == null) return 0
  if (valueA == null) return -1
  if (valueB == null) return 1

  if (typeof valueA === 'number' && typeof valueB === 'number') {
    return valueA - valueB
  }

  return String(valueA).localeCompare(String(valueB), 'zh-CN')
}

const handleSort = (data: { prop: string; order: SortOrder }) => {
  const { prop, order } = data
  const rows = tableData.value
  if (rows.length === 0) return

  const summaryRow = detachSummaryRow(rows)

  if (!order) {
    // 恢复为查询后的默认排序（按月份升序），并保证合计行固定在最后
    rows.sort((a, b) => compareValues(a.month, b.month))
    if (summaryRow) rows.push(summaryRow)
    return
  }

  const direction = order === 'ascending' ? 1 : -1
  rows.sort((a, b) => direction * compareValues((a as any)[prop], (b as any)[prop]))

  if (summaryRow) rows.push(summaryRow)
}
</script>

<template>
  <div class="statistics-detail-page">
    <ElCard shadow="never" class="detail-card">
      <div class="detail-head">
        <div class="detail-title">统计详情</div>
        <ElForm inline class="detail-form" size="small">
          <ElFormItem style="margin-right: 10px">
            <ElSelect
              v-model="query.patientType"
              placeholder="请选择患者类型"
              multiple
              clearable
              style="width: 220px"
            >
              <ElOption
                v-for="item in patientTypeOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem style="margin-right: 8px">
            <ElSelect
              v-model="query.examType"
              placeholder="请选择检查类型"
              multiple
              clearable
              style="width: 220px"
            >
              <ElOption
                v-for="item in examTypeOptions"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem style="margin-right: 8px">
            <ElDatePicker
              v-model="query.dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              unlink-panels
              style="width: 260px"
            />
          </ElFormItem>

          <ElFormItem style="margin-right: 8px">
            <ElButton type="primary" plain @click="onSelectQuery">查询</ElButton>
            <ElButton @click="onExport">导出Excel</ElButton>
          </ElFormItem>
        </ElForm>
      </div>

      <ElTable
        :data="tableData"
        class="detail-table"
        height="calc(100vh - 140px)"
        empty-text="暂无数据"
        @sort-change="handleSort"
      >
        <ElTableColumn
          v-for="item in tableTitle"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :sortable="item.sort"
          align="center"
        />
      </ElTable>
    </ElCard>
  </div>
</template>

<style scoped>
.statistics-detail-page {
  height: calc(100vh - 160px);
  min-height: 600px;
}

.detail-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;

  /* height: 100%; */
  padding: 10px;
}

.detail-head {
  display: flex;
  min-height: 42px;
  margin-bottom: 8px;
  align-items: center;
  justify-content: space-between;
}

.detail-title {
  margin-right: 12px;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.detail-form {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.detail-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-left: 8px;
}

.detail-table {
  width: 100%;
}
</style>
