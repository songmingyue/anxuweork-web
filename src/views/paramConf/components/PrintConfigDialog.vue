<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElButton,
  ElInput,
  ElMessage
} from 'element-plus'
import { CodeName, editsysparametersingle } from '@/api/authConf'

type PluginType = 'lodop' | 'qwy'

interface PrintConfig {
  judgeByLevel: boolean
  PrintPlugin: PluginType
  PluginPlatformAddress: string
  PrinterName: string
  PrintSetFlag: string
  PrintPreviewFlag: string
  PrinterPaperSetFlag: string
}

const props = defineProps<{ modelValue: boolean; model?: Partial<PrintConfig> }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: PrintConfig): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const form = reactive<PrintConfig>({
  judgeByLevel: false,
  PrintPlugin: 'lodop',
  PluginPlatformAddress: '',
  PrinterName: '',
  PrintSetFlag: '',
  PrintPreviewFlag: '',
  PrinterPaperSetFlag: ''
})

watch(
  () => props.model,
  (v: any) => v && typeof v === 'string' && Object.assign(form, JSON.parse(v)),
  { immediate: true }
)

const boolOptions = [
  { label: '是', value: true },
  { label: '否', value: false }
]
const optionsSetting = [
  { label: '弹出', value: 1 },
  { label: '不弹出', value: 0 }
]
const optionsWatch = [
  { label: '预览', value: 1 },
  { label: '不预览', value: 0 }
]
const pluginOptions: Array<{ label: string; value: PluginType }> = [
  { label: '老版本第三方插件', value: 'lodop' },
  { label: '公司自研插件', value: 'qwy' }
]

function onCancel() {
  visible.value = false
}
async function onConfirm() {
  const { isSuccess, message } = await editsysparametersingle({
    code: CodeName.PrintConfig,
    value: JSON.stringify(form)
  })
  if (isSuccess) {
    ElMessage.success(message || '保存成功')
    visible.value = false
  } else {
    ElMessage.error(message || '保存失败')
  }
}
</script>

<template>
  <ElDialog v-model="visible" title="打印相关配置" width="720px" append-to-body>
    <ElForm label-width="220px">
      <ElFormItem label="根据打印类别判断打印权限">
        <ElSelect v-model="form.judgeByLevel" placeholder="请选择">
          <ElOption
            v-for="o in boolOptions"
            :key="String(o.value)"
            :label="o.label"
            :value="o.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="打印插件类型">
        <ElSelect v-model="form.PrintPlugin" placeholder="请选择">
          <ElOption v-for="o in pluginOptions" :key="o.value" :label="o.label" :value="o.value" />
        </ElSelect>
      </ElFormItem>

      <div v-show="form.PrintPlugin === 'qwy'">
        <ElFormItem label="打印插件下载平台地址">
          <el-input v-model="form.PluginPlatformAddress" placeholder="请输入打印插件下载平台地址" />
        </ElFormItem>
        <ElFormItem label="打印机名称">
          <el-input v-model="form.PrinterName" placeholder="请输入打印机名称" />
        </ElFormItem>
        <ElFormItem label="打印机设置弹出">
          <ElSelect v-model="form.PrintSetFlag" placeholder="请选择">
            <ElOption
              v-for="o in optionsSetting"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="打印预览">
          <ElSelect v-model="form.PrintPreviewFlag" placeholder="请选择">
            <ElOption v-for="o in optionsWatch" :key="o.value" :label="o.label" :value="o.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="打印机纸张设置弹出">
          <ElSelect v-model="form.PrinterPaperSetFlag" placeholder="请选择">
            <ElOption
              v-for="o in optionsSetting"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>
        </ElFormItem>
      </div>
    </ElForm>

    <template #footer>
      <div class="dlg-footer">
        <ElButton @click="onCancel">取消</ElButton>
        <ElButton type="primary" @click="onConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped lang="less">
.dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
