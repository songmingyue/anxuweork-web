<script setup lang="ts">
import { reactive } from 'vue'
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElSelect,
  ElMessage
} from 'element-plus'
import { DbTypeList } from '@/api/configuration'

defineOptions({
  name: 'SystemManagement'
})

type DbLogForm = {
  dbType: number
  hostName: string
  dbName: string
  dbUser: string
  dbPassword: string
  logPath: string
}

const form = reactive<DbLogForm>({
  dbType: 1,
  hostName: '127.0.0.1',
  dbName: 'eWordPOD',
  dbUser: 'sa',
  dbPassword: '',
  logPath: 'D:\\eWord\\eWordPOD\\logs'
})

const onTest = async () => {
  // TODO: 接入真实接口后在此调用测试连接/检测逻辑
  ElMessage.success('测试成功（接口占位）')
}

const onSave = async () => {
  // TODO: 接入真实接口后在此调用保存逻辑
  ElMessage.success('保存成功（接口占位）')
}
</script>

<template>
  <div class="system-management-page">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="card-header">
          <div class="title">数据库及日志配置</div>
        </div>
      </template>

      <div class="content">
        <el-form :model="form" label-width="110px" class="form" @submit.prevent>
          <el-form-item label="数据库类型：" required>
            <el-select v-model="form.dbType" style="width: 100%" placeholder="请选择">
              <el-option
                v-for="it in DbTypeList"
                :key="it.value"
                :label="it.label"
                :value="it.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="服务器名称：" required>
            <el-input v-model="form.hostName" placeholder="请输入服务器名称" />
          </el-form-item>

          <el-form-item label="数据库名称：" required>
            <el-input v-model="form.dbName" placeholder="请输入数据库名称" />
          </el-form-item>

          <el-form-item label="用户：" required>
            <el-input v-model="form.dbUser" placeholder="请输入用户名" />
          </el-form-item>

          <el-form-item label="密码：" required>
            <el-input
              v-model="form.dbPassword"
              type="password"
              show-password
              placeholder="请输入密码"
            />
          </el-form-item>

          <el-form-item label="日志路径：" required>
            <el-input v-model="form.logPath" placeholder="请输入日志路径" />
          </el-form-item>

          <div class="form-actions">
            <el-button @click="onTest">测试</el-button>
            <el-button type="primary" @click="onSave">保存</el-button>
          </div>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.system-management-page {
  width: 100%;
}

.page-card :deep(.el-card__body) {
  height: calc(100vh - 130px);
  padding: 24px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.content {
  display: flex;
  justify-content: flex-start;
}

.form {
  width: 520px;
  max-width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  padding-left: 110px;
  margin-top: 8px;
}
</style>
