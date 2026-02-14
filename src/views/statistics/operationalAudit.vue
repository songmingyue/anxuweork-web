<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  ElButton,
  ElCard,
  ElCol,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElPagination,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn
} from 'element-plus'

defineOptions({
  name: 'OperationalAudit'
})

type OperationType = '' | 'PRINT' | 'MATCH' | 'DELETE' | 'OTHER'

interface AuditRow {
  opType?: string
  opUser?: string
  clientAddress?: string
  opTime?: string
  taskNo?: string
  requestDevice?: string
  requestTime?: string
  filmSize?: string
  patientNo?: string
  checkNo?: string
  matchStatus?: string
  printStatus?: string
  lastPrinterName?: string
  lastPrintTime?: string
  printCopies?: number
  deleteStatus?: string
}

const query = reactive({
  patientNo: '',
  checkNo: '',
  opType: '' as OperationType,
  opUser: '',
  clientAddress: ''
})

const opTypeOptions: Array<{ label: string; value: OperationType }> = [
  { label: '全部类型', value: '' },
  { label: '打印', value: 'PRINT' },
  { label: '匹配', value: 'MATCH' },
  { label: '删除', value: 'DELETE' },
  { label: '其它', value: 'OTHER' }
]

const tableLoading = ref(false)
const tableData = ref<AuditRow[]>([])

const page = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

async function fetchList() {
  tableLoading.value = true
  try {
    // TODO: 接口待接入
    // 参数：query.patientNo/query.checkNo/query.opType/query.opUser/query.clientAddress
    // 分页：page.pageNum/page.pageSize
    tableData.value = []
    page.total = 0
  } finally {
    tableLoading.value = false
  }
}

function onSearch() {
  page.pageNum = 1
  fetchList()
}

function onReset() {
  query.patientNo = ''
  query.checkNo = ''
  query.opType = ''
  query.opUser = ''
  query.clientAddress = ''
  page.pageNum = 1
  fetchList()
}

function onPageChange() {
  fetchList()
}

function onSizeChange() {
  page.pageNum = 1
  fetchList()
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="oa-page">
    <ElCard shadow="never" class="oa-card">
      <ElForm :model="query" class="oa-form">
        <ElRow :gutter="10" class="oa-form__row">
          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElInput v-model="query.patientNo" placeholder="患者编号" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElInput v-model="query.checkNo" placeholder="检查号" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElSelect v-model="query.opType" placeholder="操作类型" clearable>
                <ElOption
                  v-for="o in opTypeOptions"
                  :key="o.value || 'ALL'"
                  :label="o.label"
                  :value="o.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElInput v-model="query.opUser" placeholder="操作用户" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8" :lg="4">
            <ElFormItem>
              <ElInput v-model="query.clientAddress" placeholder="客户端地址" clearable />
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :sm="24" :md="24" :lg="4">
            <ElFormItem>
              <div class="oa-form__actions">
                <ElButton type="primary" @click="onSearch">查询</ElButton>
                <ElButton @click="onReset">重置</ElButton>
              </div>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </ElCard>

    <ElCard shadow="never" class="oa-card card-table">
      <div class="oa-sectionHead">
        <div class="oa-sectionHead__title">操作列表</div>
      </div>

      <ElTable
        :data="tableData"
        :loading="tableLoading"
        size="small"
        height="560"
        class="oa-table"
        empty-text="暂无数据"
      >
        <ElTableColumn type="index" label="#" width="52" align="center" />
        <ElTableColumn prop="opType" label="操作类型" align="center" min-width="90" />
        <ElTableColumn prop="opUser" label="操作用户" align="center" min-width="90" />
        <ElTableColumn prop="clientAddress" label="客户端地址" align="center" min-width="130" />
        <ElTableColumn prop="opTime" label="操作时间" align="center" min-width="150" />
        <ElTableColumn prop="taskNo" label="任务号" align="center" min-width="110" />
        <ElTableColumn prop="requestDevice" label="请求设备" align="center" min-width="110" />
        <ElTableColumn prop="requestTime" label="请求时间" align="center" min-width="150" />
        <ElTableColumn prop="filmSize" label="胶片尺寸" align="center" min-width="90" />
        <ElTableColumn prop="patientNo" label="患者编号" align="center" min-width="110" />
        <ElTableColumn prop="checkNo" label="检查编号" align="center" min-width="110" />
        <ElTableColumn prop="matchStatus" label="匹配状态" align="center" min-width="90" />
        <ElTableColumn prop="printStatus" label="打印状态" align="center" min-width="90" />
        <ElTableColumn
          prop="lastPrinterName"
          label="最后打印机名称"
          align="center"
          min-width="130"
        />
        <ElTableColumn prop="lastPrintTime" label="最后打印时间" align="center" min-width="150" />
        <ElTableColumn prop="printCopies" label="打印份数" align="center" min-width="90" />
        <ElTableColumn prop="deleteStatus" label="删除状态" align="center" min-width="90" />
      </ElTable>

      <div class="oa-pagination">
        <div class="oa-pagination__left">共 {{ page.total }} 条</div>
        <ElPagination
          v-model:current-page="page.pageNum"
          v-model:page-size="page.pageSize"
          :total="page.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="sizes, prev, pager, next, jumper"
          small
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.oa-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.oa-card {
  width: 100%;
}

.oa-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.oa-form__row {
  align-items: center;
}

.oa-form__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.oa-sectionHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.oa-sectionHead__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.oa-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.oa-pagination__left {
  font-size: 12px;
  color: var(--el-text-color-regular);
}
</style>
