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
  account: string
  userName: string
  dept: string
  role: string
  createdAt: string
}

const tableData = ref<Row[]>([])

type UserForm = {
  account: string
  userName: string
  password: string
  confirmPassword: string
  dept: string
  role: 'admin' | 'nurse'
}

const defaultForm: UserForm = {
  account: '',
  userName: 'admin',
  password: '',
  confirmPassword: '',
  dept: '',
  role: 'admin'
}

const form = reactive<UserForm>({ ...defaultForm })

const onNew = () => {
  Object.assign(form, defaultForm)
}

const onSave = () => {
  ElMessage.success('保存成功')
}

const reset = () => {
  Object.assign(form, defaultForm)
}

const submit = () => {
  onSave()
}

defineExpose<ConfigTabExpose>({ submit, reset })
</script>

<template>
  <el-card shadow="never" class="tab-card">
    <div class="tab-header">
      <div class="tab-title">用户管理</div>
      <div class="tab-actions">
        <el-button type="primary" plain @click="onNew">新增</el-button>
        <el-button>取消</el-button>
        <el-button disabled>删除</el-button>
      </div>
    </div>

    <el-table :data="tableData" border height="260" class="table">
      <el-table-column type="selection" width="40" />
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="account" label="账号" min-width="120" />
      <el-table-column prop="userName" label="用户名" min-width="120" />
      <el-table-column prop="dept" label="科室" min-width="120" />
      <el-table-column prop="role" label="权限角色" min-width="120" />
      <el-table-column prop="createdAt" label="创建时间" min-width="140" />

      <template #empty>
        <div class="table-empty"><el-empty description="暂无数据" /></div>
      </template>
    </el-table>

    <div class="form-wrap">
      <el-form :model="form" label-width="110px" @submit.prevent>
        <div class="grid">
          <el-form-item label="账号：" required>
            <el-input v-model="form.account" placeholder="账号" />
          </el-form-item>

          <el-form-item label="用户名：" required>
            <el-input v-model="form.userName" placeholder="用户名" />
          </el-form-item>

          <el-form-item label="密码：" required>
            <el-input v-model="form.password" type="password" show-password placeholder="密码" />
          </el-form-item>

          <el-form-item label="确认密码：" required>
            <el-input
              v-model="form.confirmPassword"
              type="password"
              show-password
              placeholder="确认密码"
            />
          </el-form-item>

          <el-form-item label="科室：" required>
            <el-select v-model="form.dept" placeholder="科室" style="width: 100%">
              <el-option label="科室" value="dept" />
            </el-select>
          </el-form-item>

          <el-form-item label="角色：" required>
            <el-radio-group v-model="form.role">
              <el-radio-button label="admin">管理员</el-radio-button>
              <el-radio-button label="nurse">护士</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>

        <div class="bottom-actions">
          <el-button type="primary" plain @click="onSave">保存</el-button>
          <el-button @click="reset">重置</el-button>
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
  grid-template-columns: 1fr;
  gap: 12px 20px;
  max-width: 620px;
}

.bottom-actions {
  display: flex;
  margin-top: 12px;
  justify-content: center;
  gap: 12px;
}
</style>
