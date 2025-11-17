<script setup lang="ts">
import { ElButton } from 'element-plus'
const title = '机构检查收11费统计'
const onExport = () => {
  console.log('导出数据')
}
</script>

<template>
  <div class="org-charge-page">
    <el-card shadow="never" class="toolbar">
      <div class="toolbar-row">
        <div class="title">{{ title }}</div>
        <ElButton size="small" type="primary" @click="onExport">导出</ElButton>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.org-charge-page {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toolbar {
  padding-bottom: 4px;
}

.toolbar-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter {
  margin-top: 8px;
}

.chart-card {
  min-height: 560px;
}

.chart {
  width: 100%;
}
</style>
