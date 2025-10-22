<template>
  <ElDialog
    v-model="visible"
    :title="title || '新增任务'"
    width="80%"
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
            <ElFormItem prop="pluginUID" label="任务用途" required>
              <ElSelect
                v-model="baseForm.pluginUID"
                placeholder="请选择任务用途"
                style="width: 100%"
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

        <!-- 动态表单区域 -->
        <div v-if="formActive && formActive.length > 0" class="dynamic-form-container">
          <DynamicFormRenderer
            v-for="(configItem, index) in formActiveSmall"
            :key="index"
            :config="configItem"
            :model-value="formData"
            @update:modelValue="updateFormData"
          />
        </div>
        <!-- 展开收起 -->
        <BusinessFormRenderer
          :config="formHavecollapse"
          :model-value="formData"
          @update:model-value="updateFormData"
        />

        <!-- LinkPd 数组渲染器（用于纯输入字段，无 opt 属性的配置） -->
        <div v-if="formJustInput && formJustInput.length > 0">
          <LinkPdArrayRenderer
            :linkPdArray="formJustInput"
            :model-value="formData"
            @update:model-value="updateFormData"
          />
        </div>
      </ElForm>
    </div>
    <el-steps
      align-center
      :active="stepActive"
      v-if="formActive && formActive.length > 0"
      finish-status="success"
    >
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
        <ElButton @click="visible = false">取消</ElButton>
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
import DynamicFormRenderer from './DynamicFormRenderer.vue'
import BusinessFormRenderer from './BusinessFormRenderer.vue'
import LinkPdArrayRenderer from './LinkPdArrayRenderer.vue'

interface Props {
  modelValue: boolean
  title?: string
  configData?: any[]
  taskPurposeOptions: any[]
}

const formActive = ref<any[]>([])
const formActiveSmall = ref<any>([])
const formHavecollapse = ref<any[]>([])
const formJustInput = ref<any[]>([])
const stepActive = ref(0)

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

const baseRules = ref({
  pluginName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  pluginUID: [{ required: true, message: '请选择任务用途', trigger: 'change' }]
})

// 步骤配置
const currentStep = ref(0)
const steps = computed(() => {
  if (!props.configData || props.configData.length === 0) {
    return []
  }
  return props.configData.map((config, index) => ({
    label: config.label || `步骤${index + 1}`,
    key: config.prop
  }))
})

// 表单数据
const formData = ref<Record<string, any>>({})

// 更新表单数据
const updateFormData = (data: Record<string, any>) => {
  formData.value = { ...formData.value, ...data }
}

// 提交处理
const handleSubmit = async () => {
  try {
    // 验证基础表单
    await baseFormRef.value?.validate()

    // 合并所有表单数据
    const submitData = {
      ...baseForm.value,
      ...formData.value,
      configSteps: steps.value.map((step) => step.key)
    }

    emit('save', submitData)
    ElMessage.success('任务配置保存成功')
    visible.value = false
  } catch (error) {
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
    const activeLable = props.taskPurposeOptions.find((item) => item.pluginUid === val)
    const formRules = activeLable.pluginRule.map((item) => {
      return {
        [item.prop]: [{ required: true, message: `请填写${item.label}`, trigger: 'blur' }]
      }
    })
    Object.assign(baseRules.value, formRules) // 重置表单rules
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
        formActive.value = []
        if (activeLable.pluginName.includes('文件采集')) {
          formActive.value = Array.isArray(configData) ? configData : [configData]
          formActiveSmall.value = [formActive.value[0]]
          console.log('formActiveSmall', formActiveSmall.value)
          stepActive.value = 1
        } else {
          const datas = Array.isArray(configData) ? configData : [configData]
          if (datas[0]['opt']) {
            formHavecollapse.value = datas
          } else {
            formJustInput.value = datas
          }
          console.log('datas', datas)
          formActive.value = []
          stepActive.value = 0
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
// 监听弹窗打开，重置数据
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      currentStep.value = 0
      baseForm.value = {
        pluginName: '',
        pluginUID: ''
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
