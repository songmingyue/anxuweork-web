<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElTable,
  ElTableColumn,
  ElMessage
} from 'element-plus'

type HospitalForm = {
  hospitalName: string
  hospitalCode: string
}

type DepartmentRow = {
  departmentCode: string
  departmentName: string
}

const requestCount = ref(500)

const hospitalRegistered = ref(true)
const hospitalEditing = ref(false)

const hospitalForm = reactive<HospitalForm>({
  hospitalName: '超管机构1',
  hospitalCode: '1'
})

const hospitalSnapshot = reactive<HospitalForm>({
  hospitalName: hospitalForm.hospitalName,
  hospitalCode: hospitalForm.hospitalCode
})

const hospitalTitle = computed(() => {
  if (hospitalRegistered.value && !hospitalEditing.value) {
    return `医院注册（注册成功！） 请求数量： ${requestCount.value} 个`
  }
  return '医院注册'
})

const onHospitalReRegister = () => {
  hospitalSnapshot.hospitalName = hospitalForm.hospitalName
  hospitalSnapshot.hospitalCode = hospitalForm.hospitalCode
  hospitalEditing.value = true
}

const onHospitalCancel = () => {
  hospitalForm.hospitalName = hospitalSnapshot.hospitalName
  hospitalForm.hospitalCode = hospitalSnapshot.hospitalCode
  hospitalEditing.value = false
}

const onHospitalRegister = () => {
  if (!hospitalForm.hospitalName.trim() || !hospitalForm.hospitalCode.trim()) {
    ElMessage.error('请填写医院名称和医院编码')
    return
  }
  hospitalRegistered.value = true
  hospitalEditing.value = false
  ElMessage.success('注册成功')
}

const departments = ref<DepartmentRow[]>([
  { departmentCode: 'fsk2', departmentName: '放射科2' },
  { departmentCode: 'fsk', departmentName: '放射科' }
])

const deptEditingIndex = ref<number | null>(null)
const deptEditingMode = ref<'add' | 'edit' | null>(null)
const deptForm = reactive<DepartmentRow>({
  departmentCode: '',
  departmentName: ''
})
const deptOriginalName = ref('')

const canShowDeptCard = computed(() => hospitalRegistered.value && !hospitalEditing.value)

const onAddDept = () => {
  if (deptEditingIndex.value !== null) return
  departments.value.unshift({ departmentCode: '', departmentName: '' })
  deptEditingIndex.value = 0
  deptEditingMode.value = 'add'
  deptForm.departmentCode = ''
  deptForm.departmentName = ''
}

const onDeptReRegister = (row: DepartmentRow, index: number) => {
  if (deptEditingIndex.value !== null) return
  deptEditingIndex.value = index
  deptEditingMode.value = 'edit'
  deptForm.departmentCode = row.departmentCode
  deptForm.departmentName = row.departmentName
  deptOriginalName.value = row.departmentName
}

const onDeptCancel = (index: number) => {
  if (deptEditingMode.value === 'add' && index === 0) {
    departments.value.shift()
  } else if (deptEditingMode.value === 'edit') {
    const row = departments.value[index]
    if (row) row.departmentName = deptOriginalName.value
  }
  deptEditingIndex.value = null
  deptEditingMode.value = null
}

const onDeptRegister = (index: number) => {
  if (deptEditingMode.value === 'add') {
    if (!deptForm.departmentCode.trim() || !deptForm.departmentName.trim()) {
      ElMessage.error('请填写科室编码和科室名称')
      return
    }
    departments.value[index] = {
      departmentCode: deptForm.departmentCode.trim(),
      departmentName: deptForm.departmentName.trim()
    }
  } else if (deptEditingMode.value === 'edit') {
    if (!deptForm.departmentName.trim()) {
      ElMessage.error('请填写科室名称')
      return
    }
    const row = departments.value[index]
    if (row) row.departmentName = deptForm.departmentName.trim()
  }

  deptEditingIndex.value = null
  deptEditingMode.value = null
  ElMessage.success('注册成功')
}

const onDeptDelete = (index: number) => {
  if (deptEditingIndex.value === index) return
  departments.value.splice(index, 1)
}

const deptRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  return rowIndex === deptEditingIndex.value ? 'dept-row--editing' : ''
}
</script>

<template>
  <div class="client-register-page">
    <el-card shadow="never" class="card">
      <div class="card-header">
        <div class="card-title">{{ hospitalTitle }}</div>
        <div class="card-actions">
          <template v-if="hospitalEditing">
            <el-button type="primary" @click="onHospitalRegister">注册</el-button>
            <el-button @click="onHospitalCancel">取消</el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="onHospitalReRegister">重新注册</el-button>
            <el-button disabled>取消</el-button>
          </template>
        </div>
      </div>

      <el-form :model="hospitalForm" label-width="92px" class="hospital-form" @submit.prevent>
        <div class="grid">
          <el-form-item label="医院名称" required>
            <el-input v-model="hospitalForm.hospitalName" :disabled="!hospitalEditing" />
          </el-form-item>
          <el-form-item label="医院编码" required>
            <el-input v-model="hospitalForm.hospitalCode" :disabled="!hospitalEditing" />
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <el-card v-if="canShowDeptCard" shadow="never" class="card">
      <div class="card-header">
        <div class="card-title">科室注册</div>
        <div class="card-actions">
          <el-button type="primary" @click="onAddDept" :disabled="deptEditingIndex !== null">
            添加科室
          </el-button>
        </div>
      </div>

      <el-table :data="departments" border class="dept-table" :row-class-name="deptRowClassName">
        <el-table-column prop="departmentCode" label="科室编码" min-width="180">
          <template #default="scope">
            <template v-if="deptEditingIndex === scope.$index && deptEditingMode === 'add'">
              <el-input v-model="deptForm.departmentCode" />
            </template>
            <template v-else>
              {{ scope.row.departmentCode }}
            </template>
          </template>
        </el-table-column>

        <el-table-column prop="departmentName" label="科室名称" min-width="260">
          <template #default="scope">
            <template v-if="deptEditingIndex === scope.$index">
              <el-input v-model="deptForm.departmentName" />
            </template>
            <template v-else>
              {{ scope.row.departmentName }}
            </template>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" align="center">
          <template #default="scope">
            <template v-if="deptEditingIndex === scope.$index">
              <el-button @click="onDeptCancel(scope.$index)">取消</el-button>
              <el-button type="primary" @click="onDeptRegister(scope.$index)">注册</el-button>
            </template>
            <template v-else>
              <el-button @click="onDeptReRegister(scope.row, scope.$index)">重新注册</el-button>
              <el-button type="danger" @click="onDeptDelete(scope.$index)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.client-register-page {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 4px 14px;
}

.card-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-actions {
  display: flex;
  gap: 12px;
}

.hospital-form {
  padding-top: 6px;
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

.dept-table :deep(.dept-row--editing) {
  background: var(--el-fill-color-light);
}
</style>
