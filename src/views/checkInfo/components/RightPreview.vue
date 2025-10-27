<template>
  <div class="right">
    <div class="preview-toolbar">
      <span>预览</span>
      <div class="spacer"></div>
      <el-button size="small">缩放</el-button>
      <el-button size="small">下载</el-button>
    </div>
    <div class="preview-body">
      <img :src="url" alt="report" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus'

interface Props {
  url: string
}

const props = defineProps<Props>()
const url = props.url
</script>

<style scoped>
.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 20%;
  background: #fff;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-bottom: 1px solid #ebeef5;
}

.preview-toolbar .spacer {
  flex: 1;
}

.preview-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-body img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
