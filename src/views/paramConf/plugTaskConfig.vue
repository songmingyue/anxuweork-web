<template>
  <div class="page">
    <el-table
      :data="list"
      v-loading="loading"
      row-key="id"
      border
      style="width: 100%"
      height="calc(100vh - 90px)"
    >
      <!-- 是否展示：勾选即触发接口 -->
      <el-table-column label="是否展示" width="120" align="center">
        <template #default="{ row }">
          <el-checkbox v-model="row.isShow" :disabled="row._saving" @change="onToggleShow(row)" />
        </template>
      </el-table-column>

      <el-table-column prop="pluginName" label="插件名" min-width="260" />
      <el-table-column prop="description" label="描述" min-width="420" show-overflow-tooltip />
      <el-table-column prop="configVersion" label="版本" width="120" align="center" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElTable, ElTableColumn, ElCheckbox } from 'element-plus'
import { editPluginIsShow, getAllPluginWithOutIsShow, PluginWithOut } from '@/api/authConf'

const loading = ref(false)
const list = ref<PluginWithOut[]>([])

/* 加载列表 */
async function fetchList() {
  loading.value = true
  try {
    const { data } = await getAllPluginWithOutIsShow()
    list.value = data
  } finally {
    loading.value = false
  }
}

/* “是否展示”变化即请求接口。失败则回滚，并提示 */
async function onToggleShow(row: PluginWithOut) {
  const prev = !row.isShow ? true : false // 变化后 row.isShow 为新值，因此 prev=相反
  try {
    const { isSuccess, message } = await editPluginIsShow(row)
    if (isSuccess) {
      ElMessage.success(message || '操作成功')
    } else {
      row.isShow = prev // 回滚
      ElMessage.error(message || '操作失败')
    }
  } catch (e: any) {
    row.isShow = prev // 回滚
    ElMessage.error(e?.message || '更新失败，请稍后重试')
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
