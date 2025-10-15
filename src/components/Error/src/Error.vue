<script setup lang="ts">
import pageError from '@/assets/svgs/404.svg'
import networkError from '@/assets/svgs/500.svg'
import noPermission from '@/assets/svgs/403.svg'
import { propTypes } from '@/utils/propTypes'
import { useI18n } from '@/hooks/web/useI18n'

interface ErrorMap {
  url: string
  message: string
  buttonText: string
}

useI18n()

const errorMap: {
  [key: string]: ErrorMap
} = {
  '404': {
    url: pageError,
    message: '抱歉，您访问的页面不存在。',
    buttonText: '返回首页'
  },
  '500': {
    url: networkError,
    message: '抱歉，服务器报告错误',
    buttonText: '返回首页'
  },
  '403': {
    url: noPermission,
    message: '抱歉，您没有权限访问该页面。',
    buttonText: '返回首页'
  }
}

const props = defineProps({
  type: propTypes.string.validate((v: string) => ['404', '500', '403'].includes(v)).def('404')
})

const emit = defineEmits(['errorClick'])

const btnClick = () => {
  emit('errorClick', props.type)
}
</script>

<template>
  <div class="error-wrap">
    <div class="error-body">
      <img width="350" :src="errorMap[type].url" alt="" />
      <div class="error-message">{{ errorMap[type].message }}</div>
      <div class="error-actions">
        <BaseButton type="primary" @click="btnClick">{{ errorMap[type].buttonText }}</BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.error-wrap {
  display: flex;
  justify-content: center;
}

.error-body {
  text-align: center;
}

.error-message {
  font-size: 14px;
  color: var(--el-color-info);
}

.error-actions {
  margin-top: 20px;
}
</style>
