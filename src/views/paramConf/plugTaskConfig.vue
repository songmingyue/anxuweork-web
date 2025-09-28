<template>
  <div class="page">
    <el-card shadow="never" body-style="{padding:'10px 12px'}">
      <div class="header">
        <div class="title">插件设置</div>
        <el-button size="small" :loading="loading" @click="fetchList">刷新</el-button>
      </div>
      <el-table :data="list" v-loading="loading" row-key="id" border style="width: 100%">
        <!-- 是否展示：勾选即触发接口 -->
        <el-table-column label="是否展示" width="120" align="center">
          <template #default="{ row }">
            <el-checkbox v-model="row.show" :disabled="row._saving" @change="onToggleShow(row)" />
          </template>
        </el-table-column>

        <el-table-column prop="name" label="插件名" min-width="260" />
        <el-table-column prop="desc" label="描述" min-width="420" show-overflow-tooltip />
        <el-table-column prop="version" label="版本" width="120" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElCard, ElTable, ElTableColumn, ElButton, ElCheckbox } from 'element-plus'

type PluginRow = {
  id: string
  name: string
  desc: string
  version: string | number
  show: boolean
  _saving?: boolean
}

const loading = ref(false)
const list = ref<PluginRow[]>([])

/* 模拟接口：替换为真实请求 */
async function apiFetchPlugins(): Promise<PluginRow[]> {
  await new Promise((r) => setTimeout(r, 200))
  return [
    { id: '1', name: '通用文件采集插件', desc: '通用文件采集', version: '2.0', show: true },
    { id: '2', name: '检查采集插件', desc: '检查采集', version: '1.0', show: true },
    { id: '3', name: '文件采集', desc: '文件采集', version: '2.0', show: false },
    {
      id: '4',
      name: '报告采集插件(WebServiceSX)',
      desc: '报告采集插件(WebServiceSX)',
      version: '1.0',
      show: true
    },
    { id: '5', name: '影像采集插件', desc: '影像采集', version: '1.0', show: false }
  ]
}
async function apiUpdatePluginShow(): Promise<void> {
  // 这里调用真实接口，如：return request.post('/plugin/show', { id, show })
  await new Promise((r) => setTimeout(r, 200))
  // 模拟随机失败可注释
  // if (Math.random() < 0.05) throw new Error('网络异常')
}

/* 加载列表 */
async function fetchList() {
  loading.value = true
  try {
    list.value = await apiFetchPlugins()
  } finally {
    loading.value = false
  }
}

/* “是否展示”变化即请求接口。失败则回滚，并提示 */
async function onToggleShow(row: PluginRow) {
  const prev = !row.show ? true : false // 变化后 row.show 为新值，因此 prev=相反
  row._saving = true
  try {
    await apiUpdatePluginShow()
    ElMessage.success(`已${row.show ? '启用展示' : '关闭展示'}：${row.name}`)
  } catch (e: any) {
    row.show = prev // 回滚
    ElMessage.error(e?.message || '更新失败，请稍后重试')
  } finally {
    row._saving = false
  }
}

onMounted(fetchList)
</script>

<style scoped>
.page {
  padding: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title {
  font-weight: 600;
}
</style>
