<script setup lang="ts">
import { MedicalImageViewer } from 'vue-computer'

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
    <MedicalImageViewer
      :image-url="props.imageUrl"
      :image-file="props.imageFile"
      :template-config-height="props.templateConfigHeight"
      :aspect-ratio="props.aspectRatio"
    />
  </div>
</template>

<style scoped>
.co-miv-left :deep(.miv-right) {
  display: none;
}

.co-miv-left :deep(.miv-left) {
  width: 100%;
}

.co-miv-left {
  background: #111;
}
</style>
