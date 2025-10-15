<script setup lang="ts">
import { ref, watch, computed, onMounted, unref } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('logo')

const appStore = useAppStore()

const show = ref(true)

const title = computed(() => appStore.getTitle)

const layout = computed(() => appStore.getLayout)

const collapse = computed(() => appStore.getCollapse)

onMounted(() => {
  if (unref(collapse)) show.value = false
})

watch(
  () => collapse.value,
  (collapse: boolean) => {
    if (unref(layout) === 'topLeft' || unref(layout) === 'cutMenu') {
      show.value = true
      return
    }
    show.value = !collapse
  }
)

watch(
  () => layout.value,
  (layout) => {
    if (layout === 'top' || layout === 'cutMenu') {
      show.value = true
    } else {
      if (unref(collapse)) {
        show.value = false
      } else {
        show.value = true
      }
    }
  }
)
</script>

<template>
  <div>
    <router-link
      :class="[prefixCls, layout !== 'classic' ? `${prefixCls}__Top` : '', 'logo-link']"
      to="/"
    >
      <img src="@/assets/imgs/logo.svg" class="logo-img" />
      <div
        v-if="show"
        :class="[
          'logo-title',
          {
            'color-classic': layout === 'classic',
            'color-top': layout === 'topLeft' || layout === 'top' || layout === 'cutMenu'
          }
        ]"
      >
        {{ title }}
      </div>
    </router-link>
  </div>
</template>

<style scoped>
.logo-link {
  position: relative;
  display: flex;
  height: var(--logo-height) !important;
  padding-left: 8px;
  overflow: hidden;
  text-decoration: none;
  cursor: pointer;
  align-items: center;
}

.logo-img {
  width: calc(var(--logo-height) - 10px);
  height: calc(var(--logo-height) - 10px);
}

.logo-title {
  margin-left: 10px;
  font-size: 16px;
  font-weight: 700;
}

.logo-title.color-classic {
  color: var(--logo-title-text-color);
}

.logo-title.color-top {
  color: var(--top-header-text-color);
}
</style>
