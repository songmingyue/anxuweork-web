<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElSelect,
  ElMessage,
  ElMessageBox,
  ElLoading
} from 'element-plus'
import { DbTypeList, testDBConnection } from '@/api/configuration'
import { getDbAndLogConfig, setDbAndLogConfig } from '@/api/systemManagement'
import { startServiceMsd, stopServiceMsd } from '@/api/dataPage'

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
  hostName: '',
  dbName: '',
  dbUser: '',
  dbPassword: '',
  logPath: ''
})

const onTest = async () => {
  const { status } = await testDBConnection({
    dbType: form.dbType,
    hostName: form.hostName,
    dbName: form.dbName,
    dbUser: form.dbUser,
    dbPassword: form.dbPassword,
    viewName: ''
  })
  if (status === 0) {
    ElMessage.success('数据库连接成功')
  } else {
    ElMessage.error('数据库连接失败')
  }
}

const onSave = async () => {
  try {
    await ElMessageBox.confirm('需要重启服务器才能使修改的配置生效，是否确认保存配置？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const loading = ElLoading.service({
      lock: true,
      fullscreen: true,
      text: '正在保存并重启服务，请稍候…',
      background: 'rgba(0, 0, 0, 0.4)'
    })
    try {
      const { status } = await setDbAndLogConfig({
        initDBSetting: {
          dbType: form.dbType,
          dbHost: form.hostName,
          dbName: form.dbName,
          dbUser: form.dbUser,
          dbPassword: form.dbPassword
        },
        logSetting: {
          logFilePath: form.logPath
        }
      })
      if (status === 0) {
        await stopServiceMsd()
        await startServiceMsd()
        ElMessage.success('保存成功')
      } else {
        ElMessage.error('保存失败')
      }
    } finally {
      loading.close()
    }
  } catch (e) {
    // 用户取消或关闭弹窗，无需处理
  }
}
const getDbAndLogConfigMsd = async () => {
  const { data, status } = await getDbAndLogConfig()
  if (status === 0) {
    form.dbType = data.initDBSetting.dbType
    form.hostName = data.initDBSetting.dbHost
    form.dbName = data.initDBSetting.dbName
    form.dbUser = data.initDBSetting.dbUser
    form.dbPassword = data.initDBSetting.dbPassword
    form.logPath = data.logSetting.logFilePath
  }
}
onMounted(() => {
  getDbAndLogConfigMsd()
})
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
