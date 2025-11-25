<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, watch } from 'vue'
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElDialog, ElButton } from 'element-plus'

type Option = { label: string; value: string }

const props = defineProps<{
  visible: boolean
  isEdit: boolean
  formData?: Record<string, any>
  examClassOptions?: Option[]
  deptTypeOptions?: Option[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'confirm', payload: Record<string, any>): void
}>()

const innerVisible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val)
})

const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const form = ref<Record<string, any>>({
  deptID: '',
  deptName: '',
  deptType: '',
  examClass: '',
  officePhoneNO: '',
  memo: ''
})

const rules = {
  deptID: [{ required: true, message: '请输入科室编号', trigger: 'blur' }],
  deptName: [{ required: true, message: '请输入科室名称', trigger: 'blur' }],
  deptType: [{ required: true, message: '请选择科室类型', trigger: 'change' }],
  examClass: [
    {
      validator: (_: any, __: any, cb: any) => {
        if (form.value.deptType === 'ExamDept' && !form.value.examClass) {
          cb(new Error('请选择医技科室分类'))
        } else cb()
      },
      trigger: 'change'
    }
  ]
}

// 打开时初始化
watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.value = {
        deptName: '',
        deptType: '',
        examClass: '',
        officePhoneNO: '',
        memo: '',
        ...(props.formData || {}),
        deptID: props.isEdit ? props.formData?.deptCode : ''
      }
    }
  }
)

const showExamClass = computed(() => form.value.deptType === 'ExamDept')

// 切换科室类型时，非医技则清空医技分类
watch(
  () => form.value.deptType,
  (val) => {
    if (val !== 'ExamDept') {
      form.value.examClass = ''
    }
  }
)

function onCancel() {
  emit('update:visible', false)
}
function onConfirm() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    emit('confirm', { ...form.value })
  })
}
</script>

<template>
  <el-dialog
    :title="(props.isEdit ? '编辑' : '新增') + '科室信息'"
    v-model="innerVisible"
    width="640px"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="科室编号" prop="deptID" required>
        <el-input v-model="form.deptID" :disabled="props.isEdit" />
      </el-form-item>
      <el-form-item label="科室名称" prop="deptName" required>
        <el-input v-model="form.deptName" />
      </el-form-item>
      <el-form-item label="科室类型" prop="deptType" required>
        <el-select v-model="form.deptType" placeholder="请选择">
          <el-option
            v-for="opt in deptTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="showExamClass" label="医技科室分类" prop="examClass">
        <el-select v-model="form.examClass" placeholder="请选择" :disabled="props.isEdit">
          <el-option
            v-for="opt in props.examClassOptions || []"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="电话" prop="officePhoneNO">
        <el-input v-model="form.officePhoneNO" />
      </el-form-item>
      <el-form-item label="备注" prop="memo">
        <el-input v-model="form.memo" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
