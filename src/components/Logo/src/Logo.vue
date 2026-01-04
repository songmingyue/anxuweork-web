<script setup lang="ts">
import { ref, watch, computed, onMounted, unref } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { Fold, Expand } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
const appStore = useAppStore()

const show = ref(true)

const layout = computed(() => appStore.getLayout)

const collapse = computed(() => appStore.getCollapse)

onMounted(() => {
  if (unref(collapse)) show.value = false
})
const toggleCollapse = () => {
  const collapsed = collapse
  appStore.setCollapse(!collapsed.value)
}
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
    <div class="logo-link">
      <!-- <img src="@/assets/imgs/logo.svg" class="logo-img" /> -->
      <div class="logo-title">
        <div class="left" v-if="layout !== 'top'">
          <span class="header-icon" @click="toggleCollapse">
            <ElIcon :size="30" v-if="collapse"> <Expand /></ElIcon>
            <ElIcon :size="30" v-else><Fold /></ElIcon>
          </span>
          <span style="margin-left: 15px; font-size: 14px" class="header-text" v-if="!collapse">
            <span>
              {{ appStore.getTitle }}
            </span>
          </span>
        </div>
      </div>
    </div></div
  >
</template>

<style scoped>
.left {
  position: fixed;
  top: 10px;
  z-index: 11;
}

.logo-link {
  position: relative;
  display: flex;
  height: var(--logo-height) !important;
  padding-left: 8px;
  overflow: hidden;
  text-decoration: none;
  cursor: pointer;
  align-items: center;
  background-color: #1c3753;
}

.logo-img {
  width: calc(var(--logo-height) - 10px);
  height: calc(var(--logo-height) - 10px);
}

.logo-title {
  margin-left: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--left-menu-text-active-color);
}

.logo-title.color-classic {
  color: var(--left-menu-text-active-color);
}

.logo-title.color-top {
  color: var(--top-header-text-color);
}

.left {
  display: flex;
  align-items: center;
  color: #fff;
}

.header-icon {
  margin-top: 5px;
}

.header-text {
  display: flex;
  align-items: center;
}
</style>
