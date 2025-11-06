<template>
  <div class="tips-config">
    <!-- 根据 type 显示不同的图片 -->
    <el-tooltip
      v-if="fieldDescription && !type"
      :content="fieldDescription"
      placement="top"
      effect="dark"
    >
      <img src="@/assets/imgs/plugConf/task_qa.png" class="tips-icon" />
    </el-tooltip>

    <template v-else-if="type">
      <!-- business 类型显示第2张图片 -->
      <el-tooltip :content="fieldDescription" placement="top">
        <img
          v-if="type === 'business'"
          src="@/assets/imgs/plugConf/plug_buss.png"
          class="tips-icon"
        />

        <!-- db 类型显示第3张图片 -->
        <img v-else-if="type === 'db'" src="@/assets/imgs/plugConf/task_db.png" class="tips-icon" />

        <!-- plug 类型显示第1张图片 -->
        <img v-else-if="type === 'plug'" src="@/assets/imgs/plugConf/plug.png" class="tips-icon" />
      </el-tooltip>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ElTooltip } from 'element-plus'
interface Props {
  type?: string
  fieldDescription?: string
}

withDefaults(defineProps<Props>(), {
  type: '',
  fieldDescription: ''
})
</script>

<style scoped>
.tips-config {
  position: absolute;
  right: 15px;
  display: inline-block;
}

.tips-icon {
  width: 15px;
  height: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tips-icon:hover {
  transform: scale(1.1);
}
</style>
