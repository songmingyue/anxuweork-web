<script setup lang="ts">
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useAppStore } from '@/store/modules/app'
// import { Footer } from '@/components/Footer'
import { computed } from 'vue'

const appStore = useAppStore()

const footer = computed(() => appStore.getFooter)

const tagsViewStore = useTagsViewStore()

const getCaches = computed((): string[] => {
  return tagsViewStore.getCachedViews
})
</script>

<template>
  <section :class="['app-view', { 'has-footer': footer }]">
    <router-view>
      <template #default="{ Component, route }">
        <keep-alive :include="getCaches">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </template>
    </router-view>
  </section>
</template>

<style scoped>
.app-view {
  width: 100%;
  padding: var(--app-content-padding);
  background: var(--app-content-bg-color);
  box-sizing: border-box;
}

/* Dark theme override for background */
:deep(.dark) .app-view {
  background: var(--el-bg-color);
}

.has-footer {
  /* equals: min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))] */
  min-height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-footer-height)
  );
  padding-bottom: 0;
}
</style>
