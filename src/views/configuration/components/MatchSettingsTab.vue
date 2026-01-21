<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect
} from 'element-plus'
import type { ConfigTabExpose } from './types'
import { MatchSettingsForm, testDBConnection } from '@/api/configuration'
import { useCommonStoreWithOut } from '@/store/modules/common'
const props = defineProps({
  adminConfigInfo: {
    type: Object,
    required: false,
    default: () => ({})
  },
  defaultConfigInfo: {
    type: Object,
    required: false,
    default: () => ({})
  }
})
const emit = defineEmits(['onChangeConfig'])
const commonStore = useCommonStoreWithOut()
const defaultForm: MatchSettingsForm = {
  matchDBType: props.defaultConfigInfo.parameterConfig.matchDBType || '',
  matchHostName: props.defaultConfigInfo.parameterConfig.matchHostName || '',
  matchDBName: props.defaultConfigInfo.parameterConfig.matchDBName || '',
  matchDBUser: props.defaultConfigInfo.parameterConfig.matchDBUser || '',
  matchDBPWD: props.defaultConfigInfo.parameterConfig.matchDBPWD || '',
  matchViewName: props.defaultConfigInfo.parameterConfig.matchViewName || '',
  isEnabled: props.defaultConfigInfo.parameterConfig.matchResetSetting.isEnabled || false,
  matchResetTime: props.defaultConfigInfo.parameterConfig.matchResetSetting.matchResetTime || 0,
  resetInterval: props.defaultConfigInfo.parameterConfig.matchResetSetting.resetInterval || 0
}

const resetForm: MatchSettingsForm = {
  matchDBType: 0,
  matchHostName: '',
  matchDBName: '',
  matchDBUser: '',
  matchDBPWD: '',
  matchViewName: '',
  isEnabled: false,
  matchResetTime: 0,
  resetInterval: 0
}
const form = reactive<MatchSettingsForm>({ ...defaultForm })

const isLoading = ref(false)
const onTest = async () => {
  isLoading.value = true
  const { status, desc } = await testDBConnection({
    dbType: form.matchDBType,
    hostName: form.matchHostName,
    dbName: form.matchDBName,
    dbUser: form.matchDBUser,
    dbPassword: form.matchDBPWD,
    viewName: form.matchViewName
  })
  isLoading.value = false
  if (status) {
    ElMessage.error(desc || '连接失败')
  } else {
    ElMessage.success('连接成功')
  }
}

const cancel = () => {
  ElMessageBox.confirm('是否确定取消当前修改内容?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      Object.assign(form, defaultForm)
      formChange()
    })
    .catch(() => {
      // 取消操作
    })
}

const reset = () => {
  Object.assign(form, resetForm)
  formChange()
}

const formChange = () => {
  const newConfig = props.adminConfigInfo
  newConfig.parameterConfig.matchDBType = form.matchDBType
  newConfig.parameterConfig.matchHostName = form.matchHostName
  newConfig.parameterConfig.matchDBName = form.matchDBName
  newConfig.parameterConfig.matchDBUser = form.matchDBUser
  newConfig.parameterConfig.matchDBPWD = form.matchDBPWD
  newConfig.parameterConfig.matchViewName = form.matchViewName
  newConfig.parameterConfig.matchResetSetting.isEnabled = form.isEnabled
  newConfig.parameterConfig.matchResetSetting.matchResetTime = form.matchResetTime
  newConfig.parameterConfig.matchResetSetting.resetInterval = form.resetInterval
  emit('onChangeConfig', newConfig)
}

const submit = () => {
  ElMessage.success('保存成功')
}

defineExpose<ConfigTabExpose>({ submit, reset })
</script>

<template>
  <el-card shadow="never" class="tab-card">
    <div class="tab-header">
      <div class="tab-title">匹配设置</div>
      <div class="tab-actions">
        <el-button type="primary" :disabled="isLoading" plain @click="onTest">{{
          isLoading ? '测试中...' : '测试'
        }}</el-button>
        <el-button @click="reset">重置</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </div>

    <el-form :model="form" label-width="140px" class="form" @submit.prevent>
      <el-form-item label="数据库类型：">
        <el-select
          @change="formChange"
          v-model="form.matchDBType"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option
            v-for="value in commonStore.matchdbType"
            :label="value.text"
            :value="value.value"
            :key="value.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="服务器名称：">
        <el-input @change="formChange" v-model="form.matchHostName" placeholder="服务器名称" />
      </el-form-item>

      <el-form-item label="数据库名称：">
        <el-input @change="formChange" v-model="form.matchDBName" placeholder="数据库名称" />
      </el-form-item>

      <el-form-item label="用户：">
        <el-input @change="formChange" v-model="form.matchDBUser" />
      </el-form-item>

      <el-form-item label="密码：">
        <el-input @change="formChange" v-model="form.matchDBPWD" show-password type="password" />
      </el-form-item>

      <el-form-item label="视图名称：">
        <el-input @change="formChange" v-model="form.matchViewName" placeholder="视图名称" />
      </el-form-item>

      <el-form-item label="是否启用重置机制：">
        <el-radio-group @change="formChange" v-model="form.isEnabled">
          <el-radio-button :value="true">是</el-radio-button>
          <el-radio-button :value="false">否</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="重置时间段:" v-show="form.isEnabled">
        <el-input @change="formChange" v-model="form.matchResetTime" placeholder="重置时间段" />
      </el-form-item>
      <el-form-item label="重置间隔 / 分钟" v-show="form.isEnabled">
        <el-input @change="formChange" v-model="form.resetInterval" placeholder="重置间隔 / 分钟" />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
.tab-card {
  min-height: 620px;
}

.tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px 14px;
}

.tab-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.tab-actions {
  display: flex;
  gap: 10px;
}

.form {
  max-width: 700px;
}
</style>
