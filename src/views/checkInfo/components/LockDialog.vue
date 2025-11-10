<template>
  <el-dialog v-model="visibleLocal" :title="title" width="600">
    <el-form :model="modelLocal" :rules="rules" ref="formRef">
      <el-form-item label="锁定原因" prop="lockReason">
        <el-input
          type="textarea"
          v-model="modelLocal.lockReason"
          placeholder="请输入锁定原因"
          :rows="4"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, toRefs } from 'vue'
import { ElForm, ElFormItem, ElInput, ElDialog, ElButton } from 'element-plus'

const props = defineProps<{
  model: Record<string, any>
  visible: boolean
  title?: string
  loading?: boolean
}>()

const emit = defineEmits(['update:visible', 'update:model', 'confirm', 'cancel'])

const { model, visible, title, loading } = toRefs(props)

const formRef = ref<InstanceType<typeof ElForm> | null>(null)

const rules = reactive({
  lockReason: [{ required: true, message: '请输入锁定原因', trigger: ['blur', 'change'] }]
})

// local refs so v-model on dialog works correctly
const visibleLocal = ref<boolean>(visible.value)
const modelLocal = model.value

watch(visible, (v) => {
  visibleLocal.value = v
})
watch(visibleLocal, (v) => {
  emit('update:visible', v)
})

watch(
  () => modelLocal,
  (v) => {
    emit('update:model', v)
  },
  { deep: true }
)

async function onConfirm() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch (err) {
    return
  }
  emit('confirm')
}

function onCancel() {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped></style>
