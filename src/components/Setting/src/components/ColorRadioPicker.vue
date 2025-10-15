<script setup lang="ts">
import { PropType, watch, unref, ref } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('color-radio-picker')

const props = defineProps({
  schema: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  modelValue: propTypes.string.def('')
})

const emit = defineEmits(['update:modelValue', 'change'])

const colorVal = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val: string) => {
    if (val === unref(colorVal)) return
    colorVal.value = val
  }
)

// 监听
watch(
  () => colorVal.value,
  (val: string) => {
    emit('update:modelValue', val)
    emit('change', val)
  }
)
</script>

<template>
  <div :class="[prefixCls, 'crp']">
    <span
      v-for="(item, i) in schema"
      :key="`radio-${i}`"
      class="crp__item"
      :class="{ 'is-active': colorVal === item }"
      :style="{
        background: item
      }"
      @click="colorVal = item"
    >
      <Icon v-if="colorVal === item" color="#fff" icon="vi-ep:check" :size="16" />
    </span>
  </div>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-color-radio-picker';

.@{prefix-cls} {
  .is-active {
    border-color: var(--el-color-primary);
  }
}

.crp {
  display: flex;
  flex-wrap: wrap;
  gap: 0 14px;
}

.crp__item {
  width: 20px;
  height: 20px;
  margin-bottom: 5px;
  line-height: 20px;
  text-align: center;
  cursor: pointer;
  border-color: #d1d5db; // gray-300
  border-style: solid;
  border-width: 2px;
  border-radius: 2px;
}
</style>
