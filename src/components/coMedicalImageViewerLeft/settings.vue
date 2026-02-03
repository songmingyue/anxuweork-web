<script setup lang="ts">
import { MedicalImageViewerLeft11 } from 'vue-computer'

const emit = defineEmits<{
  (e: 'image-point', point: { x: number; y: number; w: number; h: number }): void
}>()
interface Props {
  imageUrl?: string
  imageFile?: File | null
  templateConfigHeight?: number
  aspectRatio?: number
  height?: number
  width?: number
  boxX?: number
  boxY?: number
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
    <MedicalImageViewerLeft11
      :image-url="props.imageUrl"
      :image-file="props.imageFile"
      :template-config-height="props.templateConfigHeight"
      :aspect-ratio="props.aspectRatio"
      @image-point="(p) => emit('image-point', p)"
      :height="props.height"
      :width="props.width"
      :box-x="props.boxX"
      :box-y="props.boxY"
    />
  </div>
</template>

<style scoped>
.co-miv-left :deep(.miv-left) {
  width: 100%;
}

.co-miv-left {
  background: #111;
}
</style>
