<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import {
  ElButton,
  ElCard,
  ElDialog,
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
import CryptoJS from 'crypto-js'
import {
  getPrintPublisher,
  MatchPublisherItem,
  PacsConfig,
  PrintPublisherItem,
  verifyEngineerPassword
} from '@/api/configuration'

const props = defineProps({
  adminConfigInfo: {
    type: Object,
    required: false,
    default: () => ({})
  },
  defaultConfigInfo: {
    type: Object,
    required: false,
    default: () => ({})
  }
})

const emit = defineEmits(['onChangeConfig'])

const toBool = (val: unknown): boolean => Boolean(val)

const defaultForm: PacsConfig = {
  webPacsConfigID: '',
  pacsAddress: null,
  hospitalID: '',
  systemUserID: null,
  isEnabled: false,
  createTime: '',
  allowCloudViewPrinted: null,
  reportPrintPublish: [],
  filmPrintPublish: false,
  filmPrintConsumerConfig: [],
  compressionRatio: 1,
  delFlag: '',
  keepChargeStatus: false,
  reportPrintNotify: false,
  matchDoneNotifyRis: false,
  matchDoneNotifyRisAddress: ''
}

const form = reactive<PacsConfig>({ ...defaultForm })

const publisherOptions = ref<PrintPublisherItem['data']>([])
const publisherList = ref<MatchPublisherItem[]>([])

const initialSnapshot = ref<any>(null)

const getPacsConfig = (): any => (props.adminConfigInfo as any)?.pacsConfig || {}

const deepClone = <T,>(val: T): T => JSON.parse(JSON.stringify(val))

const loadFromPacsConfig = (pacsCfg: any) => {
  const cfg = pacsCfg || {}
  form.webPacsConfigID = String(cfg.webPacsConfigID ?? '')
  form.pacsAddress = cfg.pacsAddress ?? null
  form.hospitalID = String(cfg.hospitalID ?? '')
  form.systemUserID = cfg.systemUserID ?? null
  form.isEnabled = toBool(cfg.isEnabled)
  form.createTime = String(cfg.createTime ?? '')
  form.allowCloudViewPrinted = cfg.allowCloudViewPrinted ?? null
  form.reportPrintPublish = cfg.reportPrintPublish ?? []
  form.filmPrintPublish = toBool(cfg.filmPrintPublish)
  form.filmPrintConsumerConfig = Array.isArray(cfg.filmPrintConsumerConfig)
    ? cfg.filmPrintConsumerConfig
    : []
  form.compressionRatio = Number(cfg.compressionRatio ?? 1)
  form.delFlag = String(cfg.delFlag ?? '')

  form.keepChargeStatus = toBool(cfg.keepChargeStatus)
  form.reportPrintNotify = toBool(cfg.reportPrintNotify)
  form.matchDoneNotifyRis = toBool(cfg.matchDoneNotifyRis)
  form.matchDoneNotifyRisAddress = String(cfg.matchDoneNotifyRisAddress ?? cfg.risAddress ?? '')

  const list = cfg.publisherList ?? cfg.reportPrintPublish ?? []
  publisherList.value = Array.isArray(list) ? deepClone(list) : []
}

const buildPacsConfig = () => {
  const base = getPacsConfig()

  return {
    ...base,
    ...deepClone(form),
    isEnabled: toBool(form.isEnabled),
    filmPrintPublish: toBool(form.filmPrintPublish),
    reportPrintPublish: deepClone(publisherList.value),
    keepChargeStatus: toBool(form.keepChargeStatus),
    reportPrintNotify: toBool(form.reportPrintNotify),
    matchDoneNotifyRis: toBool(form.matchDoneNotifyRis),
    matchDoneNotifyRisAddress: form.matchDoneNotifyRisAddress,
    risAddress: form.matchDoneNotifyRisAddress,
    publisherList: deepClone(publisherList.value)
  }
}

const syncToParent = () => {
  emit('onChangeConfig', {
    ...(props.adminConfigInfo as any),
    pacsConfig: buildPacsConfig()
  })
}

// 密码校验：不更新收费状态变更时触发
const keepChargePrev = ref<boolean>(Boolean(defaultForm.keepChargeStatus))
const pwdDialogVisible = ref(false)
const pwdInput = ref('')
const pendingKeepCharge = ref<boolean | null>(null)

const onKeepChargeStatusChange = (val: boolean) => {
  pendingKeepCharge.value = val
  // 先回滚选择，待校验通过再设置
  form.keepChargeStatus = keepChargePrev.value
  pwdInput.value = ''
  pwdDialogVisible.value = true
  nextTick(() => {
    // no-op: 等待用户输入
  })
}

const onPwdCancel = () => {
  pwdDialogVisible.value = false
  pendingKeepCharge.value = null
  pwdInput.value = ''
}

const onPwdConfirm = async () => {
  const rawPwd = pwdInput.value.trim()
  if (!rawPwd) {
    ElMessage.warning('请输入密码')
    return
  }
  const md5Pwd = CryptoJS.MD5(rawPwd).toString()
  const { status, desc } = await verifyEngineerPassword({ password: md5Pwd })
  if (status) {
    ElMessage.error(desc || '密码校验失败')
    onPwdCancel()
    return
  }
  const nextVal = pendingKeepCharge.value
  if (nextVal !== null) {
    form.keepChargeStatus = nextVal
    keepChargePrev.value = nextVal
    syncToParent()
  }
  pwdDialogVisible.value = false
  pendingKeepCharge.value = null
  pwdInput.value = ''
}

// 推送类型弹窗
const publisherDialogVisible = ref(false)
type PublisherDialogMode = 'create' | 'edit'
const publisherDialogMode = ref<PublisherDialogMode>('create')
const editingIndex = ref<number>(-1)
const publisherForm = reactive<{ publishType: number | undefined; syncParam: string }>({
  publishType: undefined,
  syncParam: ''
})

const publishTypeName = (val: number) =>
  publisherOptions.value.find((x) => x.value === val)?.text || String(val)

const usedTypeSet = computed(() => new Set(publisherList.value.map((x) => x.publishType)))

const openCreatePublisher = () => {
  const available = publisherOptions.value.filter((x) => !usedTypeSet.value.has(x.value))
  if (!available.length) {
    ElMessage.warning('推送类型已全部新增')
    return
  }
  publisherDialogMode.value = 'create'
  editingIndex.value = -1
  publisherForm.publishType = undefined
  publisherForm.syncParam = ''
  publisherDialogVisible.value = true
}

const openEditPublisher = (row: MatchPublisherItem, index: number) => {
  publisherDialogMode.value = 'edit'
  editingIndex.value = index
  publisherForm.publishType = row.publishType
  publisherForm.syncParam = row.syncParam
  publisherDialogVisible.value = true
}

const deletePublisher = (index: number) => {
  publisherList.value = publisherList.value.filter((_, i) => i !== index)
  syncToParent()
}

const onPublisherCancel = () => {
  publisherDialogVisible.value = false
  editingIndex.value = -1
  publisherForm.publishType = undefined
  publisherForm.syncParam = ''
}

const onPublisherConfirm = () => {
  if (publisherForm.publishType === undefined) {
    ElMessage.warning('请选择推送类型')
    return
  }
  const typeVal = publisherForm.publishType
  const syncParam = publisherForm.syncParam || ''

  const existsIndex = publisherList.value.findIndex((x) => x.publishType === typeVal)
  if (publisherDialogMode.value === 'create' && existsIndex >= 0) {
    ElMessage.warning('该推送类型已存在')
    return
  }
  if (publisherDialogMode.value === 'edit') {
    const idx = editingIndex.value
    if (idx < 0) return
    const otherExists = publisherList.value.some((x, i) => i !== idx && x.publishType === typeVal)
    if (otherExists) {
      ElMessage.warning('该推送类型已存在')
      return
    }
    const next = [...publisherList.value]
    next[idx] = { publishType: typeVal, syncParam }
    publisherList.value = next
  } else {
    publisherList.value = [...publisherList.value, { publishType: typeVal, syncParam }]
  }
  syncToParent()
  onPublisherCancel()
}

const onCancel = () => {
  if (!initialSnapshot.value) return
  loadFromPacsConfig(deepClone(initialSnapshot.value))
  keepChargePrev.value = Boolean(form.keepChargeStatus)
  syncToParent()
}

// 重置到图7：清空地址/机构，压缩比率=90，其余按截图默认否；同时清空推送列表
const onReset = () => {
  Object.assign(form, { ...defaultForm, compressionRatio: 90, isEnabled: false })
  form.keepChargeStatus = false
  form.reportPrintNotify = false
  form.matchDoneNotifyRis = true
  form.matchDoneNotifyRisAddress = ''
  publisherList.value = []
  keepChargePrev.value = Boolean(form.keepChargeStatus)
  syncToParent()
}

const reset = () => {
  onReset()
}

const submit = async () => {
  syncToParent()
}

defineExpose<ConfigTabExpose>({ submit, reset })

onMounted(async () => {
  const pacsCfg = getPacsConfig()
  initialSnapshot.value = deepClone(pacsCfg)
  loadFromPacsConfig(pacsCfg)
  keepChargePrev.value = Boolean(form.keepChargeStatus)

  try {
    const res = await getPrintPublisher()
    publisherOptions.value = res.data || []
  } catch (e) {
    publisherOptions.value = []
  }
})
</script>

<template>
  <el-card shadow="never" class="tab-card">
    <div class="tab-header">
      <div class="tab-title">集成平台</div>
      <div class="tab-actions">
        <el-button @click="onReset">重置</el-button>
        <el-button @click="onCancel">取消</el-button>
      </div>
    </div>

    <el-form :model="form" label-width="180px" class="form" @submit.prevent>
      <el-form-item label="上传地址：">
        <el-input v-model="form.pacsAddress" placeholder="上传地址" @change="syncToParent" />
      </el-form-item>

      <el-form-item label="机构ID：">
        <el-input v-model="form.hospitalID" placeholder="机构ID" @change="syncToParent" />
      </el-form-item>

      <el-form-item label="图像压缩比率：">
        <el-input v-model.number="form.compressionRatio" @change="syncToParent" />
      </el-form-item>

      <el-form-item label="启用上传：">
        <el-radio-group v-model="form.isEnabled" @change="syncToParent">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="不更新收费状态：">
        <el-radio-group v-model="form.keepChargeStatus" @change="onKeepChargeStatusChange">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="报告打印结果是否通知：">
        <el-radio-group v-model="form.reportPrintNotify" @change="syncToParent">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="匹配完成是否通知RIS：">
        <div class="inline">
          <el-radio-group v-model="form.matchDoneNotifyRis" @change="syncToParent">
            <el-radio-button :label="true">是</el-radio-button>
            <el-radio-button :label="false">否</el-radio-button>
          </el-radio-group>

          <template v-if="form.matchDoneNotifyRis">
            <span class="inline-label">地址：</span>
            <el-input
              v-model="form.matchDoneNotifyRisAddress"
              placeholder="地址"
              class="inline-input"
              @change="syncToParent"
            />
          </template>
        </div>
      </el-form-item>

      <el-form-item label="胶片打印结果是否通知：">
        <el-radio-group v-model="form.filmPrintPublish" @change="syncToParent">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-table :data="publisherList" border class="table" row-key="publishType">
        <el-table-column prop="publishType" label="推送类型" min-width="160">
          <template #default="scope">
            <span>{{ publishTypeName(scope.row.publishType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="syncParam" label="同步参数" min-width="260" />
        <el-table-column label="操作" width="260">
          <template #default="scope">
            <el-button type="primary" plain @click="openCreatePublisher">新增</el-button>
            <el-button type="primary" plain @click="openEditPublisher(scope.row, scope.$index)">
              编辑
            </el-button>
            <el-button type="danger" plain @click="deletePublisher(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!publisherList.length" class="table-actions">
        <el-button type="primary" plain @click="openCreatePublisher">新增</el-button>
      </div>
    </el-form>
  </el-card>

  <el-dialog v-model="pwdDialogVisible" title="校验密码" width="520px" @close="onPwdCancel">
    <el-form label-width="90px" @submit.prevent>
      <el-form-item label="密码：" required>
        <el-input v-model="pwdInput" type="password" show-password autocomplete="off" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="onPwdCancel">取消</el-button>
      <el-button type="primary" @click="onPwdConfirm">确定</el-button>
    </template>
  </el-dialog>

  <el-dialog
    v-model="publisherDialogVisible"
    :title="publisherDialogMode === 'create' ? '编辑推送' : '编辑推送'"
    width="520px"
    @close="onPublisherCancel"
  >
    <el-form label-width="90px" @submit.prevent>
      <el-form-item label="推送类型：" required>
        <el-select v-model="publisherForm.publishType" placeholder="推送类型" style="width: 100%">
          <el-option
            v-for="opt in publisherOptions"
            :key="opt.value"
            :label="opt.text"
            :value="opt.value"
            :disabled="
              publisherDialogMode === 'create'
                ? usedTypeSet.has(opt.value)
                : usedTypeSet.has(opt.value) && opt.value !== publisherForm.publishType
            "
          />
        </el-select>
      </el-form-item>
      <el-form-item label="推送地址：">
        <el-input v-model="publisherForm.syncParam" placeholder="推送地址" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="onPublisherCancel">取消</el-button>
      <el-button type="primary" @click="onPublisherConfirm">确定</el-button>
    </template>
  </el-dialog>
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

.form {
  max-width: 760px;
}

.inline {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.inline-label {
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.inline-input {
  width: 260px;
}

.table {
  margin-top: 18px;
}

.table-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
