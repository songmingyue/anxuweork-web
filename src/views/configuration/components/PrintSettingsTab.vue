<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { PropType } from 'vue'
import {
  ElButton,
  ElCard,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElMessage
} from 'element-plus'
import type { ConfigTabExpose } from './types'
import { useCommonStoreWithOut } from '@/store/modules/common'
import { getDefaultPaperSizeMappings } from '@/api/configuration'

const props = defineProps({
  adminConfigInfo: {
    type: Object as PropType<AdminConfigInfo>,
    required: false,
    default: (): AdminConfigInfo => ({ printerConfig: [] })
  }
})
interface Row {
  printerID: string
  printerName: string
  hostName: string
  aeTitle: string
  port: number
  isColor: '0' | '1' | string
  printerStatus: number
  paperPrinter: string
  filmSize: string
  mediumType: string
  magnificationType: string
  usePreviousAE: string | null
  filmSessionSupported: boolean
  paperPrinterMapping: PaperPrinterMappingRow[]
  presentationLutEnabled: boolean
  resolution: number
  departmentCode: string
  departmentName: string
}

interface PaperPrinterMappingRow {
  filmSize: string
  paperSize: string
  paperLengthMm: number
  paperWidthMm: number
}

type AdminConfigInfo = {
  printerConfig: Row[]
}

const tableData = ref<Row[]>([...props.adminConfigInfo.printerConfig])

interface PrintForm extends Row {
  printType?: string
}

const createEmptyRow = (): Row => ({
  printerID: '',
  printerName: '',
  hostName: '',
  aeTitle: '',
  port: 0,
  isColor: '0',
  printerStatus: 0,
  paperPrinter: '',
  filmSize: '',
  mediumType: '',
  magnificationType: '',
  usePreviousAE: null,
  filmSessionSupported: false,
  paperPrinterMapping: [],
  presentationLutEnabled: false,
  resolution: 300,
  departmentCode: '',
  departmentName: ''
})

const defaultForm: PrintForm = props.adminConfigInfo.printerConfig[0]
  ? { ...props.adminConfigInfo.printerConfig[0] }
  : { ...createEmptyRow() }
const form = reactive<PrintForm>({ ...defaultForm })

const paperMappings = ref<PaperPrinterMappingRow[]>([])
const editingMappingIndex = ref<number | null>(null)

type DefaultPaperSizeConfig = {
  filmSize: string | null
  paperSize: string
  width: number
  height: number
}
const defaultPaperSizeConfigs = ref<DefaultPaperSizeConfig[]>([])

const paperSizeOptions = computed(() => {
  const seen = new Set<string>()
  const options: string[] = []
  for (const cfg of defaultPaperSizeConfigs.value) {
    if (!seen.has(cfg.paperSize)) {
      seen.add(cfg.paperSize)
      options.push(cfg.paperSize)
    }
  }
  return options
})

const syncPaperMappingsFromForm = () => {
  const raw = Array.isArray(form.paperPrinterMapping) ? form.paperPrinterMapping : []
  paperMappings.value = raw.map((item: any) => ({
    filmSize: item?.filmSize ?? '',
    paperSize: item?.paperSize ?? '',
    paperLengthMm: Number(item?.paperLengthMm ?? item?.height ?? 0),
    paperWidthMm: Number(item?.paperWidthMm ?? item?.width ?? 0)
  }))
}

const applyDefaultPaperSize = (mapping: PaperPrinterMappingRow) => {
  const hit = defaultPaperSizeConfigs.value.find(
    (cfg) => cfg.paperSize === mapping.paperSize && (cfg.filmSize ?? '') === mapping.filmSize
  )
  if (!hit) return
  mapping.paperWidthMm = hit.width
  mapping.paperLengthMm = hit.height
}

const onAddMapping = () => {
  editingMappingIndex.value = 0
  paperMappings.value.unshift({
    filmSize: '',
    paperSize: '',
    paperLengthMm: 0,
    paperWidthMm: 0
  })
}

const onEditMapping = (index: number) => {
  editingMappingIndex.value = index
}

const onCancelEditMapping = (index: number) => {
  // 如果是新增（第一行且未填写），取消则移除
  const isNewRow = index === 0 && (paperMappings.value[0]?.filmSize ?? '') === ''
  if (isNewRow) {
    paperMappings.value.shift()
  }
  editingMappingIndex.value = null
}

const onConfirmEditMapping = (index: number) => {
  const row = paperMappings.value[index]
  if (!row) return
  applyDefaultPaperSize(row)
  editingMappingIndex.value = null
}

const onDeleteMapping = (index: number) => {
  paperMappings.value.splice(index, 1)
  if (editingMappingIndex.value === index) editingMappingIndex.value = null
}

const onSavePaperMappings = () => {
  form.paperPrinterMapping = [...paperMappings.value]
  ElMessage.success('保存成功')
}

const onResetPaperMappings = () => {
  syncPaperMappingsFromForm()
  editingMappingIndex.value = null
}

const usePreviousAEUi = computed<'yes' | 'no'>({
  get: () => (form.usePreviousAE ? 'yes' : 'no'),
  set: (v) => {
    form.usePreviousAE = v === 'yes' ? '1' : null
  }
})

const isColorUi = computed<'yes' | 'no'>({
  get: () => (String(form.isColor) === '1' ? 'yes' : 'no'),
  set: (v) => {
    form.isColor = v === 'yes' ? '1' : '0'
  }
})

const onNew = () => {
  Object.assign(form, defaultForm)
  syncPaperMappingsFromForm()
}

const onTestDevice = async () => {
  // await testPrintConnection({
  //   hostName: form.hostName,
  //   aeTitle: form.aeTitle,
  //   port: form.port
  // })
  ElMessage.success('测试打印设备成功')
}

const reset = () => {
  Object.assign(form, defaultForm)
  syncPaperMappingsFromForm()
}

const submit = () => {
  ElMessage.success('保存成功')
}

defineExpose<ConfigTabExpose>({ submit, reset })
const commonStore = useCommonStoreWithOut()
onMounted(() => {
  const first = props.adminConfigInfo.printerConfig[0]
  if (first) {
    form.printType = first.paperPrinter ? 'paper' : 'film'
    syncPaperMappingsFromForm()
  } else {
    form.printType = 'film'
  }

  getDefaultPaperSizeMappings()
    .then((res) => {
      defaultPaperSizeConfigs.value = (res?.paperSizeConfigs ?? []) as DefaultPaperSizeConfig[]
    })
    .catch(() => {
      defaultPaperSizeConfigs.value = []
    })
})

const onRowClick = (row: Row) => {
  Object.assign(form, row)
  form.printType = row.paperPrinter ? 'paper' : 'film'
  syncPaperMappingsFromForm()
}
</script>

<template>
  <el-card shadow="never" class="tab-card">
    <div class="tab-header">
      <div class="tab-title">打印设置</div>
      <div class="tab-actions">
        <el-button type="primary" plain @click="onNew">新增</el-button>
        <el-button>取消</el-button>
        <el-button disabled>删除</el-button>
      </div>
    </div>

    <el-table
      :data="tableData"
      border
      height="200"
      class="table"
      highlight-current-row
      @row-click="onRowClick"
    >
      <el-table-column type="selection" width="40" />
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="departmentCode" label="名称描述" min-width="140" />
      <el-table-column prop="departmentName" label="科室" min-width="110" />
      <el-table-column prop="hostName" label="服务地址" min-width="140" />
      <el-table-column prop="aeTitle" label="服务标识" min-width="120" />
      <el-table-column prop="port" label="服务端口" min-width="110" />
      <el-table-column prop="mediumType" label="默认类型" min-width="110" />

      <template #empty>
        <div class="table-empty"><el-empty description="暂无数据" /></div>
      </template>
    </el-table>

    <div class="form-wrap">
      <el-form :model="form" label-width="110px" @submit.prevent>
        <div class="grid">
          <el-form-item label="名称描述：" required>
            <el-input v-model="form.printerName" placeholder="名称描述" />
          </el-form-item>

          <el-form-item label="科室：" required>
            <el-select v-model="form.departmentCode" placeholder="科室" style="width: 100%">
              <el-option label="科室" value="dept" />
            </el-select>
          </el-form-item>

          <el-form-item label="默认尺寸：" required>
            <el-select v-model="form.filmSize" placeholder="默认尺寸" style="width: 100%">
              <el-option
                v-for="item in commonStore.filmSize"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="打印机状态：" required>
            <el-select v-model="form.printerStatus" placeholder="打印机状态" style="width: 100%">
              <el-option
                v-for="item in commonStore.printerStatus"
                :key="item.value"
                :label="item.text"
                :value="Number(item.value)"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="默认类型：" required>
            <el-select v-model="form.mediumType" placeholder="默认类型" style="width: 100%">
              <el-option
                v-for="item in commonStore.mediumType"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item>
          <el-radio-group v-model="form.printType">
            <el-radio-button value="paper">纸张打印机</el-radio-button>
            <el-radio-button value="film">胶片打印机</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <div v-if="form.printType === 'paper'" class="grid">
          <el-form-item label="打印机名称：" required>
            <el-input v-model="form.paperPrinter" placeholder="打印机名称" />
          </el-form-item>
        </div>

        <div class="grid">
          <el-form-item label="服务地址：" required>
            <el-input v-model="form.hostName" placeholder="服务地址" />
          </el-form-item>

          <el-form-item label="服务标识：" required>
            <el-input v-model="form.aeTitle" placeholder="服务标识" />
          </el-form-item>

          <el-form-item label="服务端口：" required>
            <el-input v-model="form.port" />
          </el-form-item>

          <el-form-item label="插值方式：" required>
            <el-select v-model="form.magnificationType" placeholder="插值方式" style="width: 100%">
              <el-option
                v-for="item in commonStore.magnificationType"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="打印分辨率：" required>
            <el-input v-model="form.resolution" />
          </el-form-item>
        </div>

        <template v-if="form.printType === 'paper'">
          <el-table :data="paperMappings" border height="200" class="table mapping-table">
            <el-table-column prop="filmSize" label="胶片尺寸" min-width="120">
              <template #default="scope">
                <template v-if="editingMappingIndex === scope.$index">
                  <el-select v-model="scope.row.filmSize" placeholder="请选择" style="width: 100%">
                    <el-option
                      v-for="item in commonStore.filmSize"
                      :key="item.value"
                      :label="item.text"
                      :value="item.value"
                    />
                  </el-select>
                </template>
                <template v-else>
                  {{ scope.row.filmSize }}
                </template>
              </template>
            </el-table-column>

            <el-table-column prop="paperSize" label="纸张大小" min-width="120">
              <template #default="scope">
                <template v-if="editingMappingIndex === scope.$index">
                  <el-select
                    v-model="scope.row.paperSize"
                    placeholder="请选择"
                    style="width: 100%"
                    @change="() => applyDefaultPaperSize(scope.row)"
                  >
                    <el-option
                      v-for="size in paperSizeOptions"
                      :key="size"
                      :label="size"
                      :value="size"
                    />
                  </el-select>
                </template>
                <template v-else>
                  {{ scope.row.paperSize }}
                </template>
              </template>
            </el-table-column>

            <el-table-column prop="paperLengthMm" label="纸张长度/mm" min-width="140">
              <template #default="scope">
                <template v-if="editingMappingIndex === scope.$index">
                  <el-input v-model="scope.row.paperLengthMm" />
                </template>
                <template v-else>
                  {{ scope.row.paperLengthMm }}
                </template>
              </template>
            </el-table-column>

            <el-table-column prop="paperWidthMm" label="纸张宽度/mm" min-width="140">
              <template #default="scope">
                <template v-if="editingMappingIndex === scope.$index">
                  <el-input v-model="scope.row.paperWidthMm" />
                </template>
                <template v-else>
                  {{ scope.row.paperWidthMm }}
                </template>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="170" align="center">
              <template #default="scope">
                <template v-if="editingMappingIndex === scope.$index">
                  <el-button size="small" @click="onCancelEditMapping(scope.$index)"
                    >取消</el-button
                  >
                  <el-button
                    size="small"
                    type="primary"
                    @click="onConfirmEditMapping(scope.$index)"
                  >
                    确定
                  </el-button>
                </template>
                <template v-else>
                  <el-button size="small" @click="onEditMapping(scope.$index)">编辑</el-button>
                  <el-button size="small" type="danger" @click="onDeleteMapping(scope.$index)">
                    删除
                  </el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>

          <div class="bottom-actions">
            <el-button type="primary" plain @click="onAddMapping">新增胶片映射</el-button>
            <el-button type="primary" @click="onSavePaperMappings">保存</el-button>
            <el-button @click="onResetPaperMappings">重置</el-button>
          </div>
        </template>

        <template v-else>
          <div class="grid">
            <el-form-item label="原AE打印：" required>
              <el-radio-group v-model="usePreviousAEUi">
                <el-radio-button value="yes">是</el-radio-button>
                <el-radio-button value="no">否</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="支持FilmSession打印：" required>
              <el-radio-group v-model="form.filmSessionSupported">
                <el-radio-button :value="true">是</el-radio-button>
                <el-radio-button :value="false">否</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="支持彩色打印：" required>
              <el-radio-group v-model="isColorUi">
                <el-radio-button value="yes">是</el-radio-button>
                <el-radio-button value="no">否</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="开启presentationLut：" required>
              <el-radio-group v-model="form.presentationLutEnabled">
                <el-radio-button :value="true">是</el-radio-button>
                <el-radio-button :value="false">否</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </div>

          <div class="bottom-actions">
            <el-button type="primary" plain @click="onTestDevice">测试打印设备</el-button>
            <el-button type="primary" @click="submit">保存</el-button>
            <el-button @click="reset">重置</el-button>
          </div>
        </template>
      </el-form>
    </div>
  </el-card>
</template>

<style scoped>
.tab-card {
  min-height: 620px;
}

.tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px 14px;
}

.tab-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.tab-actions {
  display: flex;
  gap: 10px;
}

.table {
  width: 100%;
}

.table-empty {
  padding: 40px 0;
}

.form-wrap {
  margin-top: 16px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
}

@media (width <= 1100px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.bottom-actions {
  display: flex;
  margin-top: 12px;
  justify-content: flex-end;
  gap: 12px;
}

.mapping-table {
  margin-top: 12px;
}
</style>
