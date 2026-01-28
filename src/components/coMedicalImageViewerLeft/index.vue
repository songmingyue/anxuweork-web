<script setup lang="ts">
import { MedicalImageViewerLeft } from 'vue-computer'

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
    <MedicalImageViewerLeft :image-url="props.imageUrl" :show-select="false" :show-rotate="true" />
  </div>
</template>

<style scoped>
.co-miv-left {
  background: #111;
}
</style>
