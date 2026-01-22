<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { ElButton, ElMessage } from 'element-plus'

import type { ConfigTabExpose } from './components/types'
import BasicParamsTab from './components/BasicParamsTab.vue'
import MatchSettingsTab from './components/MatchSettingsTab.vue'
import PrintSettingsTab from './components/PrintSettingsTab.vue'
import RequestDeviceTab from './components/RequestDeviceTab.vue'
import DiskManageTab from './components/DiskManageTab.vue'
import UserManageTab from './components/UserManageTab.vue'
import IntegrationPlatformTab from './components/IntegrationPlatformTab.vue'
import DataDictTab from './components/DataDictTab.vue'
import DeptParamsTab from './components/DeptParamsTab.vue'
import { AdminConfig, getAdminConfig, save } from '@/api/configuration'

type TabKey =
  | 'basic'
  | 'match'
  | 'print'
  | 'device'
  | 'disk'
  | 'user'
  | 'integration'
  | 'dict'
  | 'dept'

const tabs: Array<{ key: TabKey; label: string; component: any }> = [
  { key: 'basic', label: '基本参数', component: BasicParamsTab },
  { key: 'match', label: '匹配设置', component: MatchSettingsTab },
  { key: 'print', label: '打印设置', component: PrintSettingsTab },
  { key: 'device', label: '请求设备', component: RequestDeviceTab },
  { key: 'disk', label: '磁盘管理', component: DiskManageTab },
  { key: 'user', label: '用户管理', component: UserManageTab },
  { key: 'integration', label: '集成平台', component: IntegrationPlatformTab },
  { key: 'dict', label: '数据字典', component: DataDictTab },
  { key: 'dept', label: '科室参数', component: DeptParamsTab }
]

const activeKey = ref<TabKey>('basic')
const activeRef = ref<ConfigTabExpose | null>(null)

const activeTab = computed(() => tabs.find((t) => t.key === activeKey.value)!)

const onCancel = () => {
  activeRef.value?.reset?.()
  ElMessage.info('已取消')
}

const onSave = async () => {
  const forms = { ...adminConfigInfo.value }
  forms.userConfig = null
  const { status, desc } = await save(forms as any)
  if (status) {
    ElMessage.error(desc || '保存失败')
    return
  }
  ElMessage.success('保存成功')
}

const adminConfigInfo = ref<AdminConfig>({})
const defaultConfigInfo = ref<AdminConfig>({})
const getInfo = async () => {
  const { adminConfig } = await getAdminConfig()
  adminConfigInfo.value = JSON.parse(JSON.stringify(adminConfig))
  defaultConfigInfo.value = JSON.parse(JSON.stringify(adminConfig))
}

const changeConfig = (newConfig: AdminConfig) => {
  adminConfigInfo.value = { ...adminConfigInfo.value, ...newConfig }
  console.log('newConfig', adminConfigInfo.value)
}

onMounted(() => {
  getInfo()
})
</script>

<template>
  <div class="configuration-page">
    <div class="page-header">
      <div class="header-actions">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </div>
    </div>

    <div class="page-body">
      <div class="side">
        <button
          v-for="t in tabs"
          :key="t.key"
          class="side-item"
          :class="{ 'side-item--active': t.key === activeKey }"
          type="button"
          @click="activeKey = t.key"
        >
          {{ t.label }}
        </button>
      </div>

      <div class="content">
        <component
          v-if="Object.keys(adminConfigInfo).length"
          :is="activeTab.component"
          ref="activeRef"
          :adminConfigInfo="adminConfigInfo"
          :defaultConfigInfo="defaultConfigInfo"
          @onChangeConfig="changeConfig"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.configuration-page {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: flex-end;
  padding: 10px 12px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.page-body {
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: 16px;
  padding: 0 12px 12px;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.side-item {
  height: 52px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 2px;
}

.side-item--active {
  color: var(--el-color-white);
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.content {
  min-width: 0;
}

@media (width <= 1100px) {
  .page-body {
    grid-template-columns: 1fr;
  }

  .side {
    flex-flow: row wrap;
  }

  .side-item {
    width: 160px;
  }
}
</style>
