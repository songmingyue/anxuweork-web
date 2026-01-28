<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ElButton,
  ElDialog,
  ElEmpty,
  ElMessage,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn
} from 'element-plus'
import MedicalImageViewer from '@/components/coMedicalImageViewerLeft/settings.vue'
import SelectSampleDialog from './SelectSampleDialog.vue'
import type { FilmBoxInSampleItem } from '@/api/configuration'
type Option = {
  label: string
  value: string
}

type TemplateRow = {
  id: string
  aeTitle: string
  name: string
  filmSize: string
  direction: string
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
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

const selectedAeTitle = ref('')

const imageUrl = ref('')
const imageFile = ref<File | null>(null)

const tableLoading = ref(false)
const selectedRows = ref<TemplateRow[]>([])

const allRows = ref<TemplateRow[]>([])

const selectSampleVisible = ref(false)
const selectedSample = ref<FilmBoxInSampleItem | null>(null)

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

const filteredRows = computed(() => {
  if (!selectedAeTitle.value) return allRows.value
  return allRows.value.filter((r) => r.aeTitle === selectedAeTitle.value)
})

const initRowsForDemo = () => {
  const titles = aeTitleOptionsNormalized.value.map((o) => o.value)
  const t0 = titles[0] || props.defaultAeTitle || ''
  const t1 = titles[1] || t0

  allRows.value = [
    { id: 't-001', aeTitle: t0, name: '001', filmSize: '8INX10IN', direction: 'PORTRAIT' },
    { id: 't-002', aeTitle: t0, name: '21b001', filmSize: '8INX10IN', direction: 'PORTRAIT' },
    { id: 't-003', aeTitle: t1, name: '123', filmSize: '14INX17IN', direction: 'PORTRAIT' }
  ].filter((r) => r.aeTitle)
}

watch(
  () => props.modelValue,
  (val) => {
    if (!val) return
    selectedAeTitle.value =
      props.defaultAeTitle ||
      aeTitleOptionsNormalized.value[0]?.value ||
      selectedAeTitle.value ||
      ''

    // 这里先用 demo 数据，后续接入接口后替换为真实列表
    initRowsForDemo()
  },
  { immediate: true }
)

const onSearch = async () => {
  // 预留：后续按 selectedAeTitle 拉取模板列表
  tableLoading.value = true
  try {
    await Promise.resolve()
  } finally {
    tableLoading.value = false
  }
}

const onCreate = () => {
  selectSampleVisible.value = true
}

const onSampleConfirm = (row: FilmBoxInSampleItem) => {
  selectedSample.value = row
  if (row.callingAE) selectedAeTitle.value = row.callingAE
  ElMessage.success(`已选择样片：${row.taskNo}`)
}

const onDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的模板')
    return
  }
  ElMessage.info('删除：待接入')
}
const currentImageUrl = computed(() => {
  return imageFile.value ? URL.createObjectURL(imageFile.value) : imageUrl.value
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="模板匹配"
    width="92vw"
    top="4vh"
    class="template-match-dialog"
    :close-on-click-modal="false"
  >
    <div class="tm-body">
      <div class="tm-left">
        <div class="tm-viewer">
          <MedicalImageViewer :image-url="currentImageUrl" />
        </div>
      </div>

      <div class="tm-right">
        <div class="tm-toolbar">
          <el-button size="small" disabled>一键检测</el-button>

          <el-select
            v-model="selectedAeTitle"
            class="tm-ae"
            filterable
            clearable
            placeholder="AE Title"
          >
            <el-option
              v-for="opt in aeTitleOptionsNormalized"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>

          <el-button size="small" type="primary" @click="onSearch">拷贝</el-button>
          <el-button size="small" type="primary" @click="onCreate">新增</el-button>
          <el-button size="small" disabled @click="onDelete">删除</el-button>
        </div>

        <el-table
          v-loading="tableLoading"
          :data="filteredRows"
          border
          height="260"
          @selection-change="(rows: any) => (selectedRows = rows)"
        >
          <el-table-column type="selection" width="44" />
          <el-table-column prop="name" label="名称" min-width="160" />
          <el-table-column prop="filmSize" label="规格大小" min-width="160" />
          <el-table-column prop="direction" label="出片方向" min-width="140" />

          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
      </div>
    </div>
  </el-dialog>

  <SelectSampleDialog
    v-model="selectSampleVisible"
    :ae-title-options="aeTitleOptionsNormalized"
    :default-ae-title="selectedAeTitle"
    @confirm="onSampleConfirm"
  />
</template>

<style scoped>
.tm-body {
  display: grid;
  grid-template-columns: 56% 1fr;
  gap: 12px;
  height: 80vh;
  min-height: 640px;
}

.tm-left {
  display: flex;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  flex-direction: column;
  gap: 10px;
}

.tm-left-tools {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  overflow: hidden;
  align-items: center;
}

.tm-file {
  display: none;
}

.tm-viewer {
  min-height: 0;
  overflow: hidden;
  background: #111;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  flex: 1;
}

.tm-right {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
}

.tm-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tm-ae {
  width: 220px;
  margin-left: auto;
}

@media (width <= 1200px) {
  .tm-body {
    height: auto;
    overflow: hi;
    grid-template-columns: 1fr;
  }

  .tm-viewer {
    height: 60vh;
  }
}
</style>
