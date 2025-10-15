<script setup lang="ts">
import { computed, ref, unref, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { CreateDicitem, createdicitem, DictItemRow, editdicitem } from '@/api/authConf'

const props = defineProps<{
  modelValue: boolean
  title?: string
  // 初始值（用于编辑时预填）
  model?: Partial<DictItemRow>
  isEdit?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const form = ref<CreateDicitem>({})

watch(
  () => [props.modelValue, props.model],
  () => {
    if (!props.modelValue) {
      form.value = {}
    } else {
      Object.assign(form.value, props.model)
    }
  },
  { immediate: true }
)

const rules: Record<string, any> = {
  itemCode: [{ required: true, message: '请输入字典代码', trigger: 'blur' }],
  itemName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }]
}

function onConfirm() {
  formRef.value?.validate(async (ok) => {
    if (!ok) return
    let isSuccess, message
    if (props.isEdit) {
      const data = await editdicitem(unref(form))
      isSuccess = data.isSuccess
      message = data.message
    } else {
      const data = await createdicitem(unref(form))
      isSuccess = data.isSuccess
      message = data.message
    }
    if (isSuccess) {
      ElMessage.success(message || '操作成功')
      visible.value = false
      emit('save')
    } else {
      ElMessage.error(message || '操作失败')
    }
  })
}
function onCancel() {
  visible.value = false
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="title || '新增字典项'"
    width="560px"
    destroy-on-close
    append-to-body
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="90px">
      <ElFormItem prop="itemCode" label="字典代码" v-if="isEdit" required>
        <span style="color: #333">{{ form.itemCode }}</span>
      </ElFormItem>
      <ElFormItem prop="itemCode" label="字典代码" v-else required>
        <ElInput v-model="form.itemCode" placeholder="请输入字典代码" />
      </ElFormItem>
      <ElFormItem prop="itemName" label="字典名称" required>
        <ElInput v-model="form.itemName" placeholder="请输入字典名称" />
      </ElFormItem>
      <ElFormItem label="字典扩展1">
        <ElInput v-model="form.itemRepresenExt1" placeholder="" />
      </ElFormItem>
      <ElFormItem label="字典扩展2">
        <ElInput v-model="form.itemRepresenExt2" placeholder="" />
      </ElFormItem>
      <ElFormItem label="字典扩展3">
        <ElInput v-model="form.itemRepresenExt3" placeholder="" />
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput v-model="form.memo" type="textarea" :rows="3" placeholder="" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dlg-footer">
        <ElButton @click="onCancel">取消</ElButton>
        <ElButton type="primary" @click="onConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
