<template>
  <ElDialog
    v-model="visible"
    :title="title || '新增任务'"
    width="800px"
    @close="cancel"
    destroy-on-close
    append-to-body
    class="task-config-dialog"
  >
    <div class="task-form-container">
      <!-- 基础信息 -->
      <ElForm ref="baseFormRef" :model="baseForm" :rules="baseRules" label-width="220px">
        <ElRow :gutter="20">
          <ElCol :span="24">
            <ElFormItem prop="pluginName" label="任务名称" required>
              <ElInput v-model="baseForm.pluginName" placeholder="请输入任务名称" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem prop="pluginUID" label="任务用途" required v-if="!pluginServiceMapUID">
              <ElSelect
                v-model="baseForm.pluginUID"
                placeholder="请选择任务用途"
                style="width: 100%"
                @change="
                  () => {
                    const filterName = taskPurposeOptions.find(
                      (item) => item.pluginUid === baseForm.pluginUID
                    )
                    if (!filterName.pluginName.includes('文件采集')) {
                      baseForm.pluginName = filterName.pluginName || ''
                    }
                  }
                "
              >
                <ElOption
                  v-for="opt in taskPurposeOptions"
                  :key="opt.pluginUid"
                  :label="opt.pluginName"
                  :value="opt.pluginUid"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>

      <!-- 动态表单区域 -->
      <ElForm ref="dynamicFormRef" :model="formData" :rules="dynamicRules" label-width="220px">
        <div v-if="typeForm === 'step'" class="dynamic-form-container">
          <DynamicFormField
            v-for="(field, index) in processFormActiveSmall.fiedlInfos"
            :key="field.prop || index"
            :field="field"
            :model="formData[processFormActiveSmall.prop]"
            :rules="dynamicRules"
            @update:model="handleFieldUpdate"
          />
        </div>
        <!-- 展开收起 -->
        <BusinessFormRenderer
          v-if="typeForm === 'collapse'"
          :config="formHavecollapse"
          :model-value="formData"
          :rules="dynamicRules"
          @update:model-value="updateFormData"
        />

        <!-- LinkPd 数组渲染器（用于纯输入字段，无 opt 属性的配置） -->
        <div v-if="typeForm === 'justinput'">
          <DynamicFormField
            v-for="(field, index) in formJustInput"
            :key="field.prop || index"
            :field="field"
            :model="formData"
            :rules="dynamicRules"
            @update:model="handleFieldUpdate"
          />
        </div>
      </ElForm>
    </div>
    <el-steps align-center :active="stepActive" v-if="typeForm === 'step'" finish-status="success">
      <el-step
        v-for="(item, index) in formActive"
        :key="item.index || index"
        :title="item.label || item.pluginConfigName"
        style="cursor: pointer"
        @click="handleStepClick(index)"
        :status="getStepStatus(index)"
      />
    </el-steps>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="cancel">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit"> 确定 </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElSteps,
  ElStep,
  ElRow,
  ElCol,
  ElMessage
} from 'element-plus'
import DynamicFormField from './DynamicFormField.vue'
import BusinessFormRenderer from './BusinessFormRenderer.vue'
import { createpluginservicemap, editpluginservicemap } from '@/api/plugConf'

interface Props {
  modelValue: boolean
  title?: string
  configData?: any[]
  serviceUID: string
  taskPurposeOptions: any[]
  // 编辑模式下由父组件传入，用于区分新增/编辑
  pluginServiceMapUID?: string
  pluginConfigKeyValue?: string // 编辑数据
  // 可选：编辑时传入原始数据（当前未使用，仅占位避免透传告警）
  model?: Record<string, any>
}

const formActive = ref<any[]>([])
const formActiveSmall = ref<any>([])
const formHavecollapse = ref<any[]>([])
const formJustInput = ref<any[]>([])
const stepActive = ref(0)
const typeForm = ref('')
const props = withDefaults(defineProps<Props>(), {
  title: '新增任务',
  configData: () => [],
  taskPurposeOptions: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: any]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

// 基础表单
const baseFormRef = ref()
const baseForm = ref({
  pluginName: '',
  pluginUID: ''
})

const baseRules = {
  pluginName: [{ required: true, message: '请输入任务名称', trigger: ['change', 'blur'] }],
  pluginUID: [{ required: true, message: '请选择任务用途', trigger: ['change', 'blur'] }]
}

// 动态表单验证规则
const dynamicFormRef = ref()
const dynamicRules = ref<Record<string, any>>({})

// 生成验证规则
const generateValidationRules = (configData: any[], pluginRules?: any) => {
  const rules: Record<string, any> = {}

  // 递归处理字段，提取所有需要验证的字段
  const extractFieldRules = (fields: any[]) => {
    if (!fields || !Array.isArray(fields)) return

    fields.forEach((field) => {
      // 如果字段有 required 属性，添加验证规则
      if (field.required && field.prop) {
        rules[field.prop] = [
          {
            required: true,
            message: `请${field.type === 'select' ? '选择' : '输入'}${field.label || field.fieldLabel || field.prop}`,
            trigger: ['change', 'blur']
          }
        ]
      }

      // 递归处理 fiedlInfos
      if (field.fiedlInfos && Array.isArray(field.fiedlInfos)) {
        extractFieldRules(field.fiedlInfos)
      }

      // 递归处理 opt 中的 fiedlInfos
      if (field.opt && Array.isArray(field.opt)) {
        field.opt.forEach((option) => {
          if (option.fiedlInfos && Array.isArray(option.fiedlInfos)) {
            extractFieldRules(option.fiedlInfos)
          }
        })
      }
    })
  }

  if (typeForm.value === 'step') {
    // 对于 step 形式，使用 pluginConfigs 下每个数组的 required 字段
    configData.forEach((config) => {
      if (config.required) {
        const propFather = config.prop || ''
        for (const i in config.required) {
          rules[`${propFather}.${i}`] = [
            {
              required: true,
              message: `请${'输入'}${config.required[i]}`,
              trigger: ['change', 'blur']
            }
          ]
        }
      }
    })
  } else if (typeForm.value === 'collapse' || typeForm.value === 'justinput') {
    // 对于 collapse 和 justinput 形式，递归提取所有字段
    extractFieldRules(configData)
  }

  // 如果有 pluginRule 数组，使用它覆盖或补充验证规则
  if (pluginRules) {
    const newRules = JSON.parse(pluginRules)
    newRules.forEach((rule) => {
      if (rule.prop) {
        rules[rule.prop] = [
          {
            required: true,
            message:
              rule.message ||
              `请${rule.type === 'select' ? '选择' : '输入'}${rule.label || rule.prop}`,
            trigger: rule.trigger || ['change', 'blur']
          }
        ]
      }
    })
  }

  dynamicRules.value = rules
  console.log('生成的验证规则:', rules)
  return rules
}

// 步骤配置
const currentStep = ref(0)

// 表单数据
const formData = ref<Record<string, any>>({})

// 解析编辑时传入的 pluginConfigKeyValue（可能包含转义/换行）
const parsePluginConfigKV = (raw?: string): Record<string, any> => {
  if (!raw || typeof raw !== 'string') return {}
  try {
    let text = raw
    // 兼容可能存在的换行/制表符
    text = text.replace(/\r\n|\r|\n|\t/g, '')
    // 一次 JSON.parse 通常即可（后端返回已被转义）
    return JSON.parse(text)
  } catch (e1) {
    try {
      // 如果是多重转义（字符串中还有引号转义），再尝试一次
      return JSON.parse(JSON.parse(raw))
    } catch (e2) {
      console.warn('parsePluginConfigKV 解析失败:', e2)
      return {}
    }
  }
}

// 将编辑值合并到 formData
const applyEditValuesToForm = (editObj: Record<string, any>) => {
  if (!editObj || typeof editObj !== 'object') return

  // step 类型：保持模块分组（formData[module] = {...}）
  if (typeForm.value === 'step') {
    Object.keys(editObj).forEach((k) => {
      const v = (editObj as any)[k]
      if (v && typeof v === 'object') {
        formData.value[k] = { ...(formData.value[k] || {}), ...v }
      } else {
        formData.value[k] = v
      }
    })
  } else {
    // collapse/justinput：将每个模块的子项拍平到顶层（字段 prop 通常是子项）
    Object.keys(editObj).forEach((k) => {
      const v = (editObj as any)[k]
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        Object.assign(formData.value, v)
      } else {
        formData.value[k] = v
      }
    })
  }

  // 触发视图更新
  formData.value = { ...formData.value }
}

// 更新表单数据
const updateFormData = (data: Record<string, any>) => {
  formData.value = { ...formData.value, ...data }
}

// 处理字段更新
const handleFieldUpdate = (data: { prop: string; value: any }) => {
  console.log('字段更新:', data)
  if (typeForm.value !== 'step') {
    formData.value[data.prop] = data.value
  } else {
    formData.value[processFormActiveSmall.value.prop][data.prop] = data.value
  }
  console.log('当前表单数据:', formData.value)

  // 强制触发视图更新
  formData.value = { ...formData.value }
}
const initFormNostep = (activeLabel) => {
  formData.value = { ...formData.value, ...JSON.parse(activeLabel.defaultKeyValue) }
}

// 初始化表单默认值(有分步的)
const initFormData = (configData: any[]) => {
  if (!configData || !configData.length) return

  // 遍历配置数据，设置默认值
  configData.forEach((config) => {
    if (config.dataDefault) {
      formData.value[config.prop] = { ...config.dataDefault }
    }
  })
}

const cancel = () => {
  baseForm.value = {
    pluginName: '',
    pluginUID: ''
  }
  formData.value = {}
  dynamicRules.value = {}
  formActiveSmall.value = []
  formJustInput.value = []
  formHavecollapse.value = []

  visible.value = false
}

// 提交处理
const handleSubmit = async () => {
  try {
    // 验证基础表单
    await baseFormRef.value?.validate()

    // 验证动态表单（如果有验证规则）
    if (Object.keys(dynamicRules.value).length > 0) {
      await dynamicFormRef.value?.validate()
    }
    const { pluginName } = baseForm.value
    console.log('表单数据准备提交:', baseForm.value)
    const { configVersion, pluginUid } = props.taskPurposeOptions.find(
      (item) => item.pluginUid === baseForm.value.pluginUID
    )

    const payload: any = {
      configVersion,
      pluginUID: pluginUid,
      pluginConfigKeyValue: JSON.stringify({ ...formData.value, pluginName }),
      pluginName: pluginName,
      serviceUID: props.serviceUID
    }

    // 若存在 pluginServiceMapUID，则认为是编辑
    if (props.pluginServiceMapUID) {
      payload.pluginServiceMapUID = props.pluginServiceMapUID
    }

    const { message, isSuccess } = props.pluginServiceMapUID
      ? await editpluginservicemap(payload)
      : await createpluginservicemap(payload)
    if (isSuccess) {
      ElMessage.success(message || '操作成功')
      cancel()
    } else {
      ElMessage.error(message || '操作失败')
    }
    // emit('save', submitData)
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请完善必填信息')
  }
}

// 处理步骤点击
const handleStepClick = (index: number) => {
  stepActive.value = index + 1
  console.log('点击步骤:', index)
  formActiveSmall.value = [formActive.value[index]]
  console.log(formActiveSmall.value, 'formActiveSmall')
}

const processFormActiveSmall = computed(() => {
  // 安全检查：确保数据存在
  if (
    !formActiveSmall.value ||
    !formActiveSmall.value.length ||
    !formActiveSmall.value[0] ||
    !formActiveSmall.value[0].fiedlInfos ||
    !formActiveSmall.value[0].fiedlInfos[0]
  ) {
    return { fiedlInfos: [] }
  }

  const currentModule = formActiveSmall.value[0]
  const isNeedProcess = currentModule.prop === 'GetTaskModule'
  const isfileSaveType = currentModule.prop === 'SaveFileModule'

  // 安全获取选项数据
  const firstField = currentModule.fiedlInfos[0]
  const originalOptions = firstField.defaultOpt?.length
    ? firstField.defaultOpt
    : firstField.opt || []

  // 确保选项是数组
  if (!Array.isArray(originalOptions)) {
    console.warn('选项数据不是数组:', originalOptions)
    return currentModule
  }

  // 根据模块类型过滤选项
  let filteredOptions = originalOptions
  if (isNeedProcess && originalOptions.length > 4) {
    filteredOptions = originalOptions.slice(0, 4)
  } else if (isfileSaveType && originalOptions.length > 1) {
    filteredOptions = originalOptions.slice(0, 1)
  }

  // 创建新的对象避免直接修改原数据
  const newOptions = JSON.parse(JSON.stringify(formActiveSmall.value))
  if (newOptions[0] && newOptions[0].fiedlInfos && newOptions[0].fiedlInfos[0]) {
    newOptions[0].fiedlInfos[0].defaultOpt = filteredOptions
    newOptions[0].fiedlInfos[0].opt = filteredOptions
  }

  return newOptions[0]
})
// 获取步骤状态
const getStepStatus = (index: number) => {
  if (index < stepActive.value) {
    return 'finish' // 当前步骤之前的都显示为蓝色（已完成）
  } else if (index === stepActive.value) {
    return 'process' // 当前步骤显示为进行中
  } else {
    return 'wait' // 当前步骤之后的显示为等待
  }
}

const changePlugin = (val) => {
  if (val) {
    // 清空表单数据和验证规则
    formData.value = {}
    dynamicRules.value = {}
    const activeLable = props.taskPurposeOptions.find((item) => item.pluginUid === val)
    if (activeLable && activeLable.pluginConfigs) {
      try {
        // 处理字符串格式的JSON数据
        let configData = activeLable.pluginConfigs

        // 如果是字符串，先解析成JSON
        if (typeof configData === 'string') {
          // 清理字符串中的特殊字符和格式问题
          configData = configData
            .replace(/\r\n/g, '') // 移除回车换行
            .replace(/\r/g, '') // 移除回车
            .replace(/\n/g, '') // 移除换行
            .replace(/\t/g, '') // 移除制表符
            .trim() // 移除首尾空格

          // 解析JSON字符串
          configData = JSON.parse(configData)
        }
        // 确保是数组格式
        formJustInput.value = []
        formActiveSmall.value = []
        formHavecollapse.value = []
        formActive.value = []
        if (activeLable.pluginName.includes('文件采集')) {
          formActive.value = Array.isArray(configData) ? configData : [configData]
          console.log('原始文件采集数据:', JSON.stringify(formActive.value, null, 2))
          formActiveSmall.value = [formActive.value[0]]
          stepActive.value = 1
          // 初始化表单默认值
          initFormData(formActive.value)
          console.log('初始化表单默认值:', formData.value)
          // 设置formData默认值 - 文件采集类型从formActiveSmall的dataDefault获取
          const defaultFormData: Record<string, any> = {}
          if (
            formActiveSmall.value &&
            formActiveSmall.value[0] &&
            formActiveSmall.value[0].fiedlInfos
          ) {
            formActiveSmall.value[0].fiedlInfos.forEach((field) => {
              if (field.prop && field.dataDefault !== undefined) {
                defaultFormData[field.prop] = field.dataDefault
              }
            })
          }
          formData.value = { ...formData.value, ...defaultFormData }
          console.log('文件采集类型默认值:', defaultFormData)

          methodChangeData(formActive.value)
          // 生成验证规则
          generateValidationRules(formActive.value, activeLable.pluginRule)
        } else {
          let datas: any = Array.isArray(configData) ? configData : [configData]
          console.log('原始数据:', JSON.stringify(datas, null, 2))
          datas = methodChangeData(datas)
          if (datas && datas[0]['opt']) {
            formHavecollapse.value = datas
          } else {
            formJustInput.value = datas
          }
          formActive.value = []
          stepActive.value = 0
          // 初始化表单默认值
          initFormNostep(activeLable)
          generateValidationRules(datas, activeLable.pluginRule)
        }
      } catch (error) {
        console.error('解析pluginConfigs失败:', error)
        console.log('原始数据:', activeLable.pluginConfigs)
        formActive.value = []
        stepActive.value = 0
      }
    } else {
      formActive.value = []
      stepActive.value = 0
    }
  } else {
    formActive.value = []
    stepActive.value = 0
  }
}

const methodChangeData = (data) => {
  // 递归处理数据，将 linkPd 塞到 opt 的是选项里重命名为 fiedlInfos
  const processDataRecursively = (items) => {
    if (!Array.isArray(items)) return items

    return items.map((item) => {
      const processedItem = { ...item }

      // 如果有 fiedlInfos，递归处理子字段
      if (processedItem.fiedlInfos && Array.isArray(processedItem.fiedlInfos)) {
        processedItem.fiedlInfos = processDataRecursively(processedItem.fiedlInfos)
      }

      // 如果有 opt 选项数组，需要处理每个选项
      if (processedItem.opt && Array.isArray(processedItem.opt)) {
        processedItem.opt = processedItem.opt.map((option) => {
          const processedOption = { ...option }

          // 查找"是"选项，将 linkPd 数据添加到其中
          // 支持多种"是"的表示方式：'是', 'true', true
          const isYesOption =
            option.label === '是' ||
            option.prop === '是' ||
            option.prop === 'true' ||
            option.prop === true ||
            option.value === 'true' ||
            option.value === true ||
            option.prop === 'expansion'

          if (isYesOption && processedItem.linkPd && Array.isArray(processedItem.linkPd)) {
            // 将 linkPd 重命名为 fiedlInfos 并递归处理
            processedOption.fiedlInfos = processDataRecursively(processedItem.linkPd)
            console.log('找到"是"选项，添加 linkPd 数据:', processedOption)
          }

          return processedOption
        })

        // 处理完成后，删除原始的 linkPd
        delete processedItem.linkPd
      }

      return processedItem
    })
  }

  const processedData = processDataRecursively(data)
  console.log('递归处理后的数据:', processedData)

  // 安全检查：确保 processedData 存在且不为空
  if (!processedData || !Array.isArray(processedData) || processedData.length === 0) {
    console.warn('processedData 为空或无效:', processedData)
    typeForm.value = 'justinput'
    formJustInput.value = []
    return data
  }

  // type: 'step' | 'collapse' | 'justinput'
  if (processedData[0].type === 'modelSelect') {
    if (processedData[0].opt) {
      typeForm.value = 'collapse'
    } else {
      typeForm.value = 'step'
    }
  } else {
    typeForm.value = 'justinput'
  }

  // 更新处理后的数据
  if (typeForm.value === 'step') {
    formActive.value = processedData
    formActiveSmall.value = [processedData[0]]
  } else if (typeForm.value === 'collapse') {
    formHavecollapse.value = processedData
  } else {
    formJustInput.value = processedData
  }

  return processedData
}
// 监听弹窗打开，重置数据
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      currentStep.value = 0
      // 如果有编辑数据，优先回填基础信息（会触发 changePlugin）
      if (props.model) {
        baseForm.value = {
          pluginName: (props.model as any).pluginName || '',
          pluginUID: (props.model as any).pluginUID || ''
        }
      } else {
        baseForm.value = {
          pluginName: '',
          pluginUID: ''
        }
      }
      formData.value = {}
    }
  }
)
watch(
  () => baseForm.value.pluginUID,
  (val) => {
    changePlugin(val)
  }
)

// 当类型结构生成后，把编辑值合并进来
watch(
  () => typeForm.value,
  () => {
    if (!visible.value) return
    if (!props.pluginConfigKeyValue) return
    const editObj = parsePluginConfigKV(props.pluginConfigKeyValue)
    applyEditValuesToForm(editObj)
  }
)

// 若编辑值后续发生变化，也同步一次
watch(
  () => props.pluginConfigKeyValue,
  (nv) => {
    if (!visible.value) return
    if (!nv) return
    const editObj = parsePluginConfigKV(nv)
    applyEditValuesToForm(editObj)
  }
)
</script>

<style scoped>
.task-config-dialog {
  .el-dialog__body {
    height: 75vh;
    overflow: auto;
  }

  .task-form-container {
    max-height: 70vh;
    overflow-y: auto;
  }

  .card-title {
    font-weight: 600;
    color: #303133;
  }

  .mb-4 {
    margin-bottom: 16px;
  }
}

.step-progress {
  .steps-header {
    margin-bottom: 12px;

    .step-label {
      font-weight: 600;
      color: #606266;
    }
  }

  .steps-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 40px;
    padding: 20px 0;
    background: #fafafa;
    border-radius: 8px;
  }

  .step-item {
    position: relative;
    display: flex;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-direction: column;
    align-items: center;

    &:not(:last-child)::after {
      position: absolute;
      top: 15px;
      left: calc(100% + 20px);
      width: 40px;
      height: 2px;
      background: #e4e7ed;
      content: '';
      transition: all 0.3s ease;
    }

    &.completed::after {
      background: #67c23a;
    }

    &.active::after {
      background: #409eff;
    }

    .step-number {
      display: flex;
      width: 32px;
      height: 32px;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #909399;
      background: #e4e7ed;
      border-radius: 50%;
      transition: all 0.3s ease;
      align-items: center;
      justify-content: center;
    }

    .step-text {
      font-size: 12px;
      color: #909399;
      text-align: center;
      transition: all 0.3s ease;
    }

    &.active {
      .step-number {
        color: white;
        background: #409eff;
      }

      .step-text {
        color: #409eff;
      }
    }

    &.completed {
      .step-number {
        color: white;
        background: #67c23a;
      }

      .step-text {
        color: #67c23a;
      }
    }

    &:hover:not(.active, .completed) {
      .step-number {
        background: #c0c4cc;
      }
    }
  }
}

.dynamic-form-card {
  min-height: 400px;
}

.linkpd-form-container {
  padding: 20px;
  margin-top: 20px;
  background: #fafbfc;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
