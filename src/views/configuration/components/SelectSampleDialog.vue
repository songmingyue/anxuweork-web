<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  ElButton,
  ElDialog,
  ElEmpty,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn
} from 'element-plus'

import { useCommonStoreWithOut } from '@/store/modules/common'

import {
  getFilmBoxInSample,
  type FilmBoxInSampleItem,
  type GetFilmBoxInSampleRequest
} from '@/api/configuration'

type Option = {
  label: string
  value: string
}

interface Props {
  modelValue: boolean
  aeTitleOptions: Option[]
  defaultAeTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultAeTitle: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', row: FilmBoxInSampleItem): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

const loading = ref(false)
const rows = ref<FilmBoxInSampleItem[]>([])
const currentRow = ref<FilmBoxInSampleItem | null>(null)

const commonStore = useCommonStoreWithOut()
const matchStateOptions = computed(() => commonStore.matchState || [])

const form = reactive({
  taskNo: '',
  printTime: -1,
  matchState: '' as string | undefined,
  callingAE: ''
})

const pageInfo = reactive({
  pageIndex: 1,
  pageSize: 10,
  count: 0
})

const aeTitleOptionsNormalized = computed<Option[]>(() => {
  const list = props.aeTitleOptions || []
  const map = new Map<string, Option>()
  list.forEach((o) => {
    const v = (o?.value ?? '').trim()
    if (!v) return
    map.set(v, { label: o.label || v, value: v })
  })
  return Array.from(map.values())
})

const fetchList = async () => {
  loading.value = true
  try {
    const data: GetFilmBoxInSampleRequest = {
      manualMatch: {
        printTime: form.printTime,
        matchState: form.matchState,
        callingAE: form.callingAE || undefined,
        taskNo: form.taskNo || undefined
      },
      pageInfo: {
        pageIndex: pageInfo.pageIndex,
        pageSize: pageInfo.pageSize,
        count: pageInfo.count
      }
    }

    const res = await getFilmBoxInSample(data)
    if (res.status !== 0) {
      ElMessage.error(res.desc || '获取样片失败')
      rows.value = []
      pageInfo.count = 0
      return
    }

    rows.value = res.film || []
    pageInfo.pageIndex = res.pageInfo?.pageIndex ?? pageInfo.pageIndex
    pageInfo.pageSize = res.pageInfo?.pageSize ?? pageInfo.pageSize
    pageInfo.count = res.pageInfo?.count ?? 0
  } finally {
    loading.value = false
  }
}

const onReset = () => {
  form.taskNo = ''
  form.printTime = 1
  form.matchState = ''
  form.callingAE = props.defaultAeTitle || aeTitleOptionsNormalized.value[0]?.value || ''
  pageInfo.pageIndex = 1
  currentRow.value = null
  fetchList()
}

const onQuery = () => {
  pageInfo.pageIndex = 1
  currentRow.value = null
  fetchList()
}

const onConfirm = () => {
  if (!currentRow.value) {
    ElMessage.warning('请选择一条样片')
    return
  }
  emit('confirm', currentRow.value)
  visible.value = false
}

watch(
  () => props.modelValue,
  (val) => {
    if (!val) return
    form.callingAE = props.defaultAeTitle || aeTitleOptionsNormalized.value[0]?.value || ''
    pageInfo.pageIndex = 1
    currentRow.value = null
    fetchList()
  }
)
</script>

<template>
  <el-dialog
    v-model="visible"
    title="请选择一个样片"
    width="68vw"
    top="10vh"
    :close-on-click-modal="false"
  >
    <div class="ssd-toolbar">
      <el-input v-model="form.taskNo" placeholder="任务号" clearable class="ssd-input" />

      <el-select v-model="form.printTime" placeholder="打印时间" clearable class="ssd-input">
        <el-option label="全部" :value="-1" />
        <el-option label="今天" :value="1" />
        <el-option label="三天内" :value="3" />

        <el-option label="一周内" :value="7" />
        <el-option label="一个月内" :value="30" />
      </el-select>

      <el-select v-model="form.matchState" placeholder="匹配状态" clearable class="ssd-input">
        <el-option
          v-for="item in matchStateOptions"
          :key="item.value"
          :label="item.text"
          :value="item.value"
        />
      </el-select>

      <el-select v-model="form.callingAE" placeholder="请求设备" clearable class="ssd-input">
        <el-option
          v-for="opt in aeTitleOptionsNormalized"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <el-button @click="onReset">重置</el-button>
      <el-button type="primary" @click="onQuery">查询</el-button>
      <el-button type="primary" plain @click="onConfirm">确定</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="rows"
      border
      height="420"
      highlight-current-row
      @current-change="(row: any) => (currentRow = row)"
      @row-dblclick="onConfirm"
    >
      <el-table-column prop="taskNo" label="任务号" min-width="120" />
      <el-table-column prop="callingAE" label="请求设备" min-width="120" />
      <el-table-column prop="requestTime" label="请求时间" min-width="170" />
      <el-table-column prop="filmSize" label="胶片尺寸" min-width="120" />
      <el-table-column prop="mediumType" label="胶片类型" min-width="120" />
      <el-table-column prop="displayFormat" label="显示格式" min-width="140" />
      <el-table-column prop="filmOrientation" label="出片方向" min-width="120" />

      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>

    <div class="ssd-pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="pageInfo.count"
        :page-size="pageInfo.pageSize"
        :current-page="pageInfo.pageIndex"
        @current-change="(p: number) => ((pageInfo.pageIndex = p), fetchList())"
      />
    </div>
  </el-dialog>
</template>

<style scoped>
.ssd-toolbar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto auto auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.ssd-input {
  width: 100%;
}

.ssd-pagination {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

@media (width <= 1200px) {
  .ssd-toolbar {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
