<script setup lang="ts">
import { MedicalImageViewerLeftNew } from 'vue-computer'
const emit = defineEmits<{
  (e: 'delete-report'): void
}>()
interface Props {
  imageUrl?: string
  imageFile?: File | null
  templateConfigHeight?: number
  aspectRatio?: number
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: '',
  imageFile: null,
  templateConfigHeight: 0,
  aspectRatio: 1.64
})
</script>

<template>
  <div class="co-miv-left">
    <MedicalImageViewerLeftNew
      :image-url="props.imageUrl"
      :show-select="false"
      :show-rotate="true"
      :isShowDelete="true"
      @delete-report="() => emit('delete-report')"
    />
  </div>
</template>

<style scoped>
.co-miv-left {
  background: #111;
}

.co-miv-left ::v-deep(.miv-toolbar .el-button.el-button--danger) {
  border-radius: 6px !important;
}
</style>
