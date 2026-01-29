<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  ElButton,
  ElCheckbox,
  ElDivider,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs
} from 'element-plus'
import MedicalImageViewer from '@/components/coMedicalImageViewerLeft/settings.vue'
import SelectSampleDialog from './SelectSampleDialog.vue'
import type { DicomPeer, FilmBoxInSampleItem, MatchSample } from '@/api/configuration'
import { useCommonStore } from '@/store/modules/common'

const commonStore = useCommonStore()
type Option = {
  label: string
  value: string
  peerDes?: string
}

interface Props {
  modelValue: boolean
  aeTitleOptions: Option[]
  defaultAeTitle?: string
  dicomPeer: DicomPeer[]
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

const matchLatestExam = ref(false)
const matchLatestExamHours = ref<number | undefined>(undefined)

const activeMatchTab = ref<'checkNo' | 'patientId' | 'patientName'>('checkNo')

const templateForm = ref({
  name: '',
  filmSize: '',
  direction: ''
})

const imageProcess = ref({
  rotate: '',
  contrast: 0,
  zoom: 1,
  reverse: true,
  binarize: ''
})

type ResultProcessRow = { id: string; type: string; param: string }
const resultProcessRows = ref<ResultProcessRow[]>([])

const ocrConfig = ref({
  matchMode: 'full',
  recognizeMode: 'single',
  checkNo: '',
  x: 0,
  y: 0,
  h: 0,
  w: 0
})

const tableLoading = ref(false)
const selectedRows = ref<MatchSample>({} as MatchSample)

const selectSampleVisible = ref(false)

const aeTitleOptionsNormalized = computed<Option[]>(() => {
  const list = props.aeTitleOptions || []
  const map = new Map<string, Option>()
  list.forEach((o) => {
    const v = (o?.value ?? '').trim()
    if (!v) return
    map.set(v, { label: o.label || v, value: v, peerDes: o.peerDes })
  })
  return Array.from(map.values())
})

const defaultProps = ref({ ...props.dicomPeer })
const newDicopeer = ref({ ...props.dicomPeer })

const filteredRows = computed(() => {
  return newDicopeer.value.find((d) => d.aeTitle === selectedAeTitle.value)?.matchSamples || []
})

const initRowsForDemo = () => {
  // const titles = aeTitleOptionsNormalized.value.map((o) => o.value)
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

watch(
  () => matchLatestExam.value,
  (val) => {
    if (!val) matchLatestExamHours.value = undefined
    else if (matchLatestExamHours.value == null) matchLatestExamHours.value = 0
  }
)
onMounted(() => {
  // 这里先用 demo 数据，后续接入接口后替换为真实列表
  defaultProps.value = JSON.parse(JSON.stringify(props.dicomPeer))
  newDicopeer.value = JSON.parse(JSON.stringify(props.dicomPeer))
})
watch(
  () => selectedRows.value,
  (rows) => {
    if (!rows) return
    const row = rows as MatchSample
    templateForm.value.name = row.sampleName
    templateForm.value.filmSize = row.filmSize
    templateForm.value.direction = row.filmOrientation
    matchLatestExam.value = row.matchStratege.matchLatestExam || false
    matchLatestExamHours.value = row.matchStratege.maxExamDiff || undefined
  },
  { deep: true }
)

const isShowCopyDialog = ref(false) // 拷贝dialog
const selectCopy = ref('')
const onSearch = async () => {
  // 预留：后续按 selectedAeTitle 拉取模板列表
  isShowCopyDialog.value = true
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

const onSampleConfirm = async (row: FilmBoxInSampleItem) => {
  templateForm.value.name = ''
  templateForm.value.filmSize = row.filmSize
  templateForm.value.direction = row.filmOrientation
  matchLatestExam.value = false
  matchLatestExamHours.value = undefined
}

const onDelete = () => {
  if (selectedRows.value) {
    ElMessage.warning('请先选择要删除的模板')
    return
  }
  ElMessage.info('删除：待接入')
}
const currentImageUrl = computed(() => {
  return imageFile.value ? URL.createObjectURL(imageFile.value) : imageUrl.value
})
// 确认拷贝模板
const sureCopyMsd = () => {
  if (!selectCopy.value) {
    ElMessage.warning('请选择一个设备')
    return
  }
  isShowCopyDialog.value = false
  newDicopeer.value = defaultProps.value.map((item) => {
    if (item.aeTitle === selectedAeTitle.value) {
      return {
        ...item,
        matchSamples:
          defaultProps.value.find((d) => d.aeTitle === selectCopy.value)?.matchSamples || []
      }
    }
    return item
  })
  console.log('newDicopeer', newDicopeer.value)
}

const onAddResultProcess = () => {
  resultProcessRows.value.push({
    id: `rp-${Date.now()}`,
    type: '',
    param: ''
  })
}

const onPreview = () => {
  ElMessage.info('预览：待接入')
}

const onSave = () => {
  ElMessage.success('保存：待接入')
}

const selectRow = (row: MatchSample) => {
  selectedRows.value = row
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="模板匹配"
    width="100vw"
    style="height: 100vh"
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

        <div class="tm-right-scroll">
          <el-table
            v-loading="tableLoading"
            :data="filteredRows"
            border
            height="160"
            @row-click="selectRow"
            highlight-current-row
          >
            <el-table-column type="selection" width="44" />
            <el-table-column prop="sampleName" label="名称" min-width="160" />
            <el-table-column prop="filmSize" label="规格大小" min-width="160" />
            <el-table-column prop="filmOrientation" label="出片方向" min-width="140" />
            <template #empty>
              <el-empty class="empty" description="暂无数据" :image-size="80" />
            </template>
          </el-table>

          <div class="tm-form">
            <el-input v-model="templateForm.name" size="small" placeholder="名称" />
            <el-input v-model="templateForm.filmSize" size="small" placeholder="规格大小" />
            <el-input v-model="templateForm.direction" size="small" placeholder="出片方向" />
          </div>

          <div class="tm-recent">
            <el-checkbox v-model="matchLatestExam">匹配最近检查</el-checkbox>
            <div v-if="matchLatestExam" class="tm-recent-time">
              <el-input-number
                v-model="matchLatestExamHours"
                :min="0"
                :controls="false"
                class="tm-recent-input"
              />
              <span class="tm-recent-unit">h</span>
            </div>
          </div>

          <el-divider class="tm-divider" />

          <el-tabs v-model="activeMatchTab" class="tm-tabs">
            <el-tab-pane label="根据检查号匹配" name="checkNo" />
            <el-tab-pane label="根据患者编号匹配" name="patientId" />
            <el-tab-pane label="根据患者姓名匹配" name="patientName" />
          </el-tabs>

          <div class="tm-section">
            <div class="tm-section-title">图像处理</div>
            <el-form
              label-width="51px"
              class="tm-section-form"
              :inline="true"
              size="small"
              label-position="left"
            >
              <el-form-item label="旋转：">
                <el-select v-model="imageProcess.rotate" style="width: 160px">
                  <el-option
                    v-for="value in commonStore.filmRotate"
                    :label="value.text"
                    :value="value.value"
                    :key="value.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="对比度：">
                <el-input-number
                  v-model="imageProcess.contrast"
                  :controls="false"
                  style="width: 160px"
                />
              </el-form-item>
              <el-form-item label="放大：">
                <el-input-number
                  v-model="imageProcess.zoom"
                  :min="0.1"
                  :step="0.1"
                  :controls="false"
                  style="width: 160px"
                />
              </el-form-item>
              <el-form-item label="反相：">
                <el-radio-group v-model="imageProcess.reverse">
                  <el-radio-button :label="true">是</el-radio-button>
                  <el-radio-button :label="false">否</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="二值化：">
                <el-select v-model="imageProcess.binarize" style="width: 160px">
                  <el-option
                    v-for="value in commonStore.binaryzationType"
                    :label="value.text"
                    :value="value.value"
                    :key="value.value"
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </div>

          <div class="tm-section">
            <div class="tm-section-title">结果处理</div>
            <el-table :data="resultProcessRows" border height="140" class="tm-rp-table">
              <el-table-column prop="type" label="类型" min-width="140" />
              <el-table-column prop="param" label="参数" min-width="220" />
              <el-table-column label="操作" width="120">
                <template #default>
                  <el-button size="small" disabled>删除</el-button>
                </template>
              </el-table-column>
              <template #empty>
                <div class="tm-rp-empty">
                  <el-button size="small" @click="onAddResultProcess">+ 新增</el-button>
                </div>
              </template>
            </el-table>
          </div>

          <div class="tm-section">
            <div class="tm-section-title">图像识别</div>
            <el-form label-width="84px" class="tm-section-form" :inline="true" size="small">
              <el-form-item label="匹配方式：">
                <el-select v-model="ocrConfig.matchMode" style="width: 160px">
                  <el-option label="全值匹配" value="full" />
                  <el-option label="模糊匹配" value="fuzzy" />
                </el-select>
              </el-form-item>
              <el-form-item label="识别模式：">
                <el-select v-model="ocrConfig.recognizeMode" style="width: 160px">
                  <el-option label="单行" value="single" />
                  <el-option label="多行" value="multi" />
                </el-select>
              </el-form-item>
            </el-form>

            <div class="tm-ocr-actions">
              <el-button size="small" type="primary">检查号</el-button>
              <el-button size="small" disabled>描述</el-button>
              <el-button size="small" type="primary">识别</el-button>
              <el-input size="small" v-model="ocrConfig.checkNo" placeholder="" />
            </div>

            <div class="tm-ocr-rect">
              <div class="tm-ocr-rect-item">
                <span class="tm-ocr-label">X:</span>
                <el-input-number size="small" v-model="ocrConfig.x" :controls="false" />
              </div>
              <div class="tm-ocr-rect-item">
                <span class="tm-ocr-label">Y:</span>
                <el-input-number size="small" v-model="ocrConfig.y" :controls="false" />
              </div>
              <div class="tm-ocr-rect-item">
                <span class="tm-ocr-label">H:</span>
                <el-input-number size="small" v-model="ocrConfig.h" :min="0" :controls="false" />
              </div>
              <div class="tm-ocr-rect-item">
                <span class="tm-ocr-label">W:</span>
                <el-input-number size="small" v-model="ocrConfig.w" :min="0" :controls="false" />
              </div>
            </div>
          </div>

          <div class="tm-bottom">
            <el-button type="primary" @click="onSave">保存</el-button>
            <el-button @click="visible = false">取消</el-button>
            <el-button disabled>预览</el-button>
            <el-button type="primary" @click="onPreview">样片选择</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
  <el-dialog title="请选择一个设备" v-model="isShowCopyDialog" width="300px">
    <el-select v-model="selectCopy" filterable clearable>
      <el-option
        v-for="opt in aeTitleOptionsNormalized"
        :key="opt.value"
        :label="opt.peerDes"
        :value="opt.value"
    /></el-select>
    <template #footer>
      <el-button @click="isShowCopyDialog = false">取 消</el-button>
      <el-button type="primary" @click="sureCopyMsd">确定</el-button>
    </template>
  </el-dialog>
  <SelectSampleDialog
    v-model="selectSampleVisible"
    :ae-title-options="aeTitleOptionsNormalized"
    :default-ae-title="selectedAeTitle"
    @confirm="onSampleConfirm"
  />
</template>

<style scoped lang="less">
.tm-body {
  display: grid;
  height: calc(100vh - 60px);
  min-height: 640px;
  overflow: hidden;
  grid-template-columns: 56% 1fr;
  gap: 12px;
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
  height: 100%;
  min-width: 0;
  overflow: hidden;
  flex-direction: column;
  gap: 10px;
}

.tm-right-scroll {
  min-height: 0;
  padding-right: 4px;
  overflow: auto;
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

.tm-recent {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.tm-recent-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tm-recent-input {
  width: 90px;
}

.tm-recent-unit {
  color: var(--el-text-color-secondary);
}

.tm-form {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}

.tm-divider {
  margin: 10px 0;
}

.tm-tabs {
  margin-bottom: 6px;
}

.tm-section {
  padding: 10px;
  margin-top: 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
}

.tm-section-title {
  margin-bottom: 10px;
  font-weight: 600;
}

.tm-section-form :deep(.el-form-item) {
  margin-bottom: 10px;
}

.tm-section-form :deep(.el-form-item__label) {
  padding-right: 3px;
}

.tm-rp-empty {
  display: grid;
  padding: 20px 0;
  place-items: center;
}

.tm-ocr-actions {
  display: grid;
  grid-template-columns: auto auto auto 1fr;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}

.tm-ocr-rect {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}

.tm-ocr-rect-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tm-ocr-label {
  width: 18px;
  color: var(--el-text-color-secondary);
}

.tm-bottom {
  display: flex;
  padding-bottom: 4px;
  margin-top: 12px;
  justify-content: flex-end;
  gap: 10px;
}

.empty :deep(.el-empty__description) {
  margin-top: -22px;
}
</style>
