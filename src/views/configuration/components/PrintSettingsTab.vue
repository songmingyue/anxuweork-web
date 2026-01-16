<script setup lang="ts">
import { reactive, ref } from 'vue'
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

type Row = {
  id: number
  name: string
  dept: string
  serviceHost: string
  serviceId: string
  servicePort: string
  defaultType: string
}

const tableData = ref<Row[]>([])

type PrintForm = {
  name: string
  dept: string
  defaultSize: string
  defaultType: string
  printerStatus: string
  printerKind: 'paper' | 'film'
  serviceHost: string
  servicePort: string
  serviceId: string
  insertMode: string
  dpi: string
}

const defaultForm: PrintForm = {
  name: '',
  dept: '',
  defaultSize: '',
  defaultType: '',
  printerStatus: '',
  printerKind: 'paper',
  serviceHost: '',
  servicePort: '0',
  serviceId: '',
  insertMode: '',
  dpi: '300'
}

const form = reactive<PrintForm>({ ...defaultForm })

const onNew = () => {
  Object.assign(form, defaultForm)
}

const onTestDevice = () => {
  ElMessage.success('测试打印设备成功')
}

const onUpdate = () => {
  ElMessage.success('修改成功')
}

const reset = () => {
  Object.assign(form, defaultForm)
}

const submit = () => {
  ElMessage.success('保存成功')
}

defineExpose<ConfigTabExpose>({ submit, reset })
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

    <el-table :data="tableData" border height="260" class="table">
      <el-table-column type="selection" width="40" />
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="name" label="名称描述" min-width="140" />
      <el-table-column prop="dept" label="科室" min-width="110" />
      <el-table-column prop="serviceHost" label="服务地址" min-width="140" />
      <el-table-column prop="serviceId" label="服务标识" min-width="120" />
      <el-table-column prop="servicePort" label="服务端口" min-width="110" />
      <el-table-column prop="defaultType" label="默认类型" min-width="110" />

      <template #empty>
        <div class="table-empty"><el-empty description="暂无数据" /></div>
      </template>
    </el-table>

    <div class="form-wrap">
      <el-form :model="form" label-width="110px" @submit.prevent>
        <div class="grid">
          <el-form-item label="名称描述：" required>
            <el-input v-model="form.name" placeholder="名称描述" />
          </el-form-item>

          <el-form-item label="科室：" required>
            <el-select v-model="form.dept" placeholder="科室" style="width: 100%">
              <el-option label="科室" value="dept" />
            </el-select>
          </el-form-item>

          <el-form-item label="默认尺寸：" required>
            <el-select v-model="form.defaultSize" placeholder="默认尺寸" style="width: 100%">
              <el-option label="默认尺寸" value="default" />
            </el-select>
          </el-form-item>

          <el-form-item label="打印机状态：" required>
            <el-select v-model="form.printerStatus" placeholder="打印机状态" style="width: 100%">
              <el-option label="打印机状态" value="status" />
            </el-select>
          </el-form-item>

          <el-form-item label="默认类型：" required>
            <el-select v-model="form.defaultType" placeholder="默认类型" style="width: 100%">
              <el-option label="默认类型" value="type" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item>
          <el-radio-group v-model="form.printerKind">
            <el-radio-button label="paper">纸张打印机</el-radio-button>
            <el-radio-button label="film">胶片打印机</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <div class="grid">
          <el-form-item label="服务地址：" required>
            <el-input v-model="form.serviceHost" placeholder="服务地址" />
          </el-form-item>

          <el-form-item label="服务标识：" required>
            <el-input v-model="form.serviceId" placeholder="服务标识" />
          </el-form-item>

          <el-form-item label="服务端口：" required>
            <el-input v-model="form.servicePort" />
          </el-form-item>

          <el-form-item label="插值方式：" required>
            <el-select v-model="form.insertMode" placeholder="插值方式" style="width: 100%">
              <el-option label="插值方式" value="mode" />
            </el-select>
          </el-form-item>

          <el-form-item label="打印分辨率：" required>
            <el-input v-model="form.dpi" />
          </el-form-item>
        </div>

        <div class="bottom-actions">
          <el-button type="primary" plain @click="onTestDevice">测试打印设备</el-button>
          <el-button type="primary" @click="onUpdate">修改</el-button>
        </div>
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
</style>
