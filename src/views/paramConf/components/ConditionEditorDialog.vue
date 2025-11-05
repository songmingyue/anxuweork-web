<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ElDialog,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElRadioGroup,
  ElRadioButton,
  ElDatePicker,
  ElMessage
} from 'element-plus'
import { conditionList, timeOptionsType, timeUnitType } from './option'
import { Delete, Switch } from '@element-plus/icons-vue'
import { updateCondition } from '@/api/authConf'
interface ConditionItem {
  id: string
  field: string // 字段名
  operator: string // 操作符
  compareType: string // 比较类型: 当前时、减、固定时
  value: string | number // 值
  unit: string // 单位: 秒/分/时/天
  dateValue?: string // 固定时间值
  timeType?: string // 时间类型: 当前时，固定时
  input: string // 输入值
}

interface FormData {
  taskName: string
  logic: 'And' | 'Or' // 逻辑关系
  conditions: ConditionItem[]
}

const props = defineProps<{
  modelValue: boolean
  title?: string
  id?: string
  model?: Partial<FormData>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const form = ref<FormData>({
  taskName: '',
  logic: 'And',
  conditions: []
})

// 初始化表单
watch(
  () => [props.modelValue, props.model],
  () => {
    if (!props.modelValue) return

    form.value = {
      taskName: props.model?.taskName || '',
      logic: props.model?.logic || 'And',
      conditions: props.model?.conditions?.length
        ? JSON.parse(JSON.stringify(props.model.conditions))
        : [createEmptyCondition()]
    }
  },
  { immediate: true }
)

// 创建空条件
function createEmptyCondition(): ConditionItem {
  return {
    id: `condition_${Date.now()}_${Math.random()}`,
    field: '',
    operator: '',
    compareType: 'add',
    timeType: 'now',
    value: '10',
    unit: 's',
    dateValue: '',
    input: ''
  }
}

// 新增单项条件
function addCondition() {
  if (form.value.conditions.length >= 10) {
    ElMessage.warning('最多添加10个条件')
    return
  }
  form.value.conditions.push(createEmptyCondition())
}

// 删除条件
function removeCondition(index: number) {
  //   if (form.value.conditions.length <= 1) {
  //     ElMessage.warning('至少保留一个条件')
  //     return
  //   }
  form.value.conditions.splice(index, 1)
}

// 验证表单
function validateForm(): boolean {
  if (!form.value.taskName) {
    ElMessage.error('请输入任务名称')
    return false
  }

  for (let i = 0; i < form.value.conditions.length; i++) {
    const cond = form.value.conditions[i]
    if (!cond.field) {
      ElMessage.error(`条件${i + 1}: 请选择字段`)
      return false
    }
    if (!cond.operator) {
      ElMessage.error(`条件${i + 1}: 请选择操作符`)
      return false
    }
    if (cond.compareType === 'subtract' && !cond.value) {
      ElMessage.error(`条件${i + 1}: 请输入数值`)
      return false
    }
    if (cond.compareType === 'fixed' && !cond.dateValue) {
      ElMessage.error(`条件${i + 1}: 请选择固定时间`)
      return false
    }
  }

  return true
}

// 确认保存
async function onConfirm() {
  if (!validateForm()) return
  const { logic, conditions } = form.value
  let conditionsData: any = []
  if (conditions.length > 0) {
    conditionsData = conditions.map((item, index) => {
      const type = conditionList.find((i) => i.value === item.field)?.type || 'String'
      return {
        IG: false,
        F: item.field,
        CT: type,
        CTV: item.operator,
        V:
          type === 'String'
            ? item.input
            : item.timeType === 'now'
              ? `${item.compareType}|${item.value}|${item.unit}`
              : item.dateValue,
        id: index
      }
    })
  }
  const newDate = {
    LT: logic,
    IG: true,
    CN: conditionsData
  }
  console.log('保存条件:', JSON.stringify(newDate).replace(/"/g, '\\"'))
  const data = await updateCondition({
    id: props.id || '',
    condition: JSON.stringify(newDate)
  })
  if (data.isSuccess) {
    emit('save')
    ElMessage.success(data.message || '操作成功')
    visible.value = false
  } else {
    ElMessage.error(data.message || '操作失败')
    return
  }
}

// 取消
function onCancel() {
  visible.value = false
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="title || '编辑条件'"
    width="780px"
    destroy-on-close
    append-to-body
    class="condition-editor-dialog"
  >
    <div>
      <!-- 任务名称 -->
      <span class="section-label">条件编辑器</span>
      <div class="task-name-section">
        <ElFormItem label="任务名称:" label-width="80px">
          <span>{{ form.taskName }}</span>
        </ElFormItem>
      </div>

      <!-- 条件列表 -->
      <div class="conditions-wrapper">
        <!-- 逻辑关系切换 -->
        <div class="logic-toggle">
          <ElRadioGroup v-model="form.logic" size="small">
            <ElRadioButton label="AND" value="And" />
            <ElRadioButton label="OR" value="Or" />
          </ElRadioGroup>
          <ElButton type="primary" link @click="addCondition" class="add-btn">
            新增单项条件
          </ElButton>
        </div>

        <!-- 条件项列表 -->
        <div class="conditions-list">
          <div
            v-for="(condition, index) in form.conditions"
            :key="condition.id"
            class="condition-item"
          >
            <div class="item-left">
              <!-- 字段选择 -->
              <ElSelect
                v-model="condition.field"
                @change="
                  () => {
                    condition.operator = ''
                  }
                "
                placeholder="请选择字段"
                style="width: 160px"
              >
                <ElOption
                  v-for="field in conditionList"
                  :key="field.value"
                  :label="field.label"
                  :value="field.value"
                />
              </ElSelect>
              <!-- 操作符 -->
              <ElSelect v-model="condition.operator" placeholder="请选择" style="width: 100px">
                <ElOption
                  v-for="op in conditionList.find((item) => item.value === condition.field)
                    ?.options || []"
                  :key="op.value"
                  :label="op.label"
                  :value="op.value"
                />
              </ElSelect>

              <template
                v-if="
                  conditionList.find((item) => item.value === condition.field)?.type === 'Datetime'
                "
              >
                <template v-if="condition.timeType === 'now'">
                  <ElSelect v-model="condition.compareType" style="width: 100px">
                    <ElOption
                      v-for="type in timeOptionsType"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                    />
                  </ElSelect>
                  <ElInput
                    v-model="condition.value"
                    type="number"
                    placeholder="10"
                    style="width: 80px"
                  />
                  <ElSelect v-model="condition.unit" style="width: 80px">
                    <ElOption
                      v-for="unit in timeUnitType"
                      :key="unit.value"
                      :label="unit.label"
                      :value="unit.value"
                    />
                  </ElSelect>
                </template>

                <!-- 固定时 - 显示日期选择器 -->
                <template v-else>
                  <ElDatePicker
                    v-model="condition.dateValue"
                    type="date"
                    placeholder="选择日期"
                    style="width: 160px"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                  <span style="margin-top: 5px">(固定时)</span>
                </template>
              </template>
              <template v-else>
                <ElInput v-model="condition.input" placeholder="请输入值" style="width: 160px"
              /></template>
              <!-- 与 -->
            </div>
            <div class="float-rights">
              <el-button
                v-if="
                  conditionList.find((item) => item.value === condition.field)?.type === 'Datetime'
                "
                type="primary"
                :icon="Switch"
                @click="
                  () => {
                    condition.timeType = condition.timeType === 'fixed' ? 'now' : 'fixed'
                  }
                "
                circle
              />
              <!-- 删除按钮 -->
              <el-button type="danger" :icon="Delete" @click="removeCondition(index)" circle />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dlg-footer">
        <ElButton @click="onCancel">取消</ElButton>
        <ElButton type="primary" @click="onConfirm">保存</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped lang="less">
.task-name-section {
  .section-label {
    display: block;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }
}

.conditions-wrapper {
  padding: 16px;
  background: #fafafa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.logic-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;

  .add-btn {
    font-size: 13px;
  }
}

.conditions-list {
  display: flex;
  padding: 5px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  flex-direction: column;
  gap: 3px;
}

.item-left {
  display: flex;
  gap: 8px;
}

.condition-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 2px;

  .compare-value-placeholder {
    display: inline-block;
    width: 80px;
    font-size: 16px;
    color: #909399;
    text-align: center;
  }

  .conjunction {
    margin: 0 4px;
    font-size: 13px;
    color: #606266;
  }
}

.dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

.float-rights {
  float: right;
}
</style>
