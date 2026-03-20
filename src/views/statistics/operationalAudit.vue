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
  ElTableColumn,
  ElTag
} from 'element-plus'
import { configGetDropDownConfig, getFilmOperate, OperateLog } from '@/api/operationalAudit'
import { useCommonStoreWithOut } from '@/store/modules/common'

defineOptions({
  name: 'OperationalAudit'
})

const query = reactive({
  accessionNumber: '',
  clientIP: '',
  operateType: '',
  operator: '',
  patientID: ''
})

const tableLoading = ref(false)
const tableData = ref<OperateLog[]>([])

const page = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

async function fetchList() {
  tableLoading.value = true
  try {
    const queryParams = {
      ...query,
      pageInfo: {
        pageIndex: page.pageNum,
        pageSize: page.pageSize
      }
    }
    const { operateLog, pageInfo, status } = await getFilmOperate(queryParams)
    if (status === 0) {
      tableData.value = operateLog || []
      page.total = pageInfo?.count || 0
    }
  } finally {
    tableLoading.value = false
  }
}

function onSearch() {
  page.pageNum = 1
  fetchList()
}

function onReset() {
  query.patientID = ''
  query.accessionNumber = ''
  query.operateType = ''
  query.operator = ''
  query.clientIP = ''
  page.pageNum = 1
  fetchList()
}

function onPageChange() {
  fetchList()
}

const tableTitle = [
  { label: '操作类型', prop: 'operatorType' },
  { label: '操作用户', prop: 'operator' },
  { label: '客户端地址', prop: 'clientIP' },
  { label: '操作时间', prop: 'operateDate' },
  { label: '任务号', prop: 'taskNo' },
  { label: '请求设备', prop: 'callingAE' },
  { label: '请求时间', prop: 'requestTime' },
  { label: '胶片尺寸', prop: 'filmSize' },
  { label: '患者编号', prop: 'patientID' },
  { label: '检查编号', prop: 'accessionNumber' },
  { label: '匹配状态', prop: 'matchStatus' },
  { label: '打印状态', prop: 'printStatus' },
  { label: '最后打印机名称', prop: 'lastPrinter' },
  { label: '最后打印时间', prop: 'lastPrintTime' },
  { label: '打印份数', prop: 'printCount' },
  { label: '删除状态', prop: 'deleteState' }
]

function onSizeChange() {
  page.pageNum = 1
  fetchList()
}
const commonStore = useCommonStoreWithOut()
const getCommonList = async () => {
  await configGetDropDownConfig().then((res) => {
    commonStore.setCommonOptionList(res.dropdownConfig)
  })
}

onMounted(() => {
  getCommonList()
  fetchList()
})
</script>

<template>
  <div class="oa-page">
    <ElCard shadow="never" class="oa-card">
      <ElForm :model="query" class="oa-form" line>
        <ElRow :gutter="10" class="oa-form__row">
          <ElCol :span="4">
            <ElFormItem>
              <ElInput v-model="query.accessionNumber" placeholder="患者编号" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :span="4">
            <ElFormItem>
              <ElInput v-model="query.patientID" placeholder="检查号" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :span="4">
            <ElFormItem>
              <ElSelect
                v-model="query.operateType"
                placeholder="操作类型"
                clearable
                @change="
                  (val) => {
                    if (!val) {
                      query.operateType = ''
                    }
                  }
                "
              >
                <ElOption
                  v-for="o in commonStore.dropdownConfig.enumOperateType"
                  :key="o.value"
                  :label="o.text"
                  :value="o.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="4">
            <ElFormItem>
              <ElInput v-model="query.operator" placeholder="操作用户" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :span="4">
            <ElFormItem>
              <ElInput v-model="query.clientIP" placeholder="客户端地址" clearable />
            </ElFormItem>
          </ElCol>

          <ElCol :span="4">
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
        height="calc(100vh - 270px)"
        class="oa-table"
        empty-text="暂无数据"
      >
        <ElTableColumn
          v-for="col in tableTitle"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          align="center"
          :min-width="100"
          show-overflow-tooltip
        >
          <template
            v-if="['operatorType', 'matchStatus', 'printStatus', 'deleteState'].includes(col.prop)"
            #default="{ row }"
          >
            <div v-if="col.prop === 'operatorType'">
              <el-tag type="danger" v-if="row.operatorType === '1'">胶片删除</el-tag>
              <el-tag type="success" v-if="row.operatorType === '2'">胶片打印</el-tag>
              <el-tag type="primary" v-if="row.operatorType === '3'">手工匹配</el-tag>
              <el-tag type="info" v-if="row.operatorType === '4'">自动匹配</el-tag>
            </div>
            <div v-else-if="col.prop === 'matchStatus'">
              <el-tag type="warning" v-if="row.matchState === '0'">等待</el-tag>
              <el-tag type="danger" v-if="row.matchState === '1'">失败</el-tag>
              <el-tag type="success" v-if="row.matchState === '2'">成功</el-tag>
              <el-tag type="primary" v-if="row.matchState === '3'">手工匹配</el-tag>
            </div>
            <div v-else-if="col.prop === 'printStatus'">
              <el-tag type="warning" v-if="row.printeState === '0'">等待</el-tag>
              <el-tag type="danger" v-if="row.printeState === '1'">失败</el-tag>
              <el-tag type="success" v-if="row.printeState === '2'">成功</el-tag>
            </div>
            <div v-else-if="col.prop === 'deleteState'">
              <el-tag type="danger" v-if="row.deleteState === '1'">已删除</el-tag>
              <el-tag type="success" v-if="row.deleteState === '0'">未删除</el-tag>
            </div>
          </template>
        </ElTableColumn>
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
  margin-left: 15px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.oa-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.oa-pagination__left {
  font-size: 12px;
  color: var(--el-text-color-regular);
}
</style>
