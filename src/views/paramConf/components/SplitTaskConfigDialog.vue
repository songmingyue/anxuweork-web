<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElInput, ElButton } from 'element-plus'

interface SplitTaskConfig {
  /** 是否启用新配置 */
  IsEnableNewConfig: boolean
  /** 是否插入上传任务 */
  IsInsertUploadTask: boolean
  /** 是否插入推送任务 */
  IsInsertPushTask: boolean
  /** 是否插入下载任务 */
  IsInsertDownTask: boolean

  // 上传任务配置
  /** 是否插入检查上传任务 */
  IsInsertExamUpload: boolean
  /** 插入检查上传任务自定义过滤条件 */
  UploadExamCondition: string
  /** 是否插入报告上传任务 */
  IsInsertReportUpload: boolean
  /** 插入报告上传任务自定义过滤条件 */
  UploadReportCondition: string
  /** 是否插入胶片上传任务 */
  IsInsertFilmUpload: boolean
  /** 插入胶片上传任务自定义过滤条件 */
  UploadFilmCondition: string
  /** 是否插入影像上传任务 */
  IsInsertImageUpload: boolean
  /** 插入影像上传任务自定义过滤条件 */
  UploadImageCondition: string

  // 推送任务配置
  /** 是否插入检查推送任务 */
  IsInsertExamPush: boolean
  /** 插入检查推送任务自定义过滤条件 */
  PushExamCondition: string
  /** 是否插入报告推送任务 */
  IsInsertReportPush: boolean
  /** 是否插入报告推送任务 */
  PushReportCondition: string
  /** 是否插入胶片推送任务 */
  IsInsertFilmPush: boolean
  /** 插入胶片推送任务自定义过滤条件 */
  PushFilmCondition: string
  /** 是否插入影像推送任务 */
  IsInsertImagePush: boolean
  /** 插入影像推送任务自定义过滤条件 */
  PushImageCondition: string

  // 下载任务配置
  /** 是否插入报告下载任务 */
  IsInsertReportDown: boolean
  /** 插入报告下载任务自定义过滤条件 */
  DownReportCondition: string
  /** 是否插入胶片下载任务 */
  IsInsertFilmDown: boolean
  /** 插入胶片下载任务自定义过滤条件 */
  DownFilmCondition: string
  /** 是否插入影像下载任务 */
  IsInsertImageDown: boolean
  /** 是否插入影像下载任务 */
  DownImageCondition: string
}

const props = defineProps<{
  modelValue: boolean
  model?: Partial<SplitTaskConfig>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: SplitTaskConfig): void
}>()

const visible = computed<boolean>({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const form = reactive<SplitTaskConfig>({
  // 全局开关
  IsEnableNewConfig: false,

  // 顶层任务开关
  IsInsertUploadTask: true,
  IsInsertPushTask: false,
  IsInsertDownTask: true,

  // 上传任务配置
  IsInsertExamUpload: true,
  UploadExamCondition: '',
  IsInsertReportUpload: true,
  UploadReportCondition: '',
  IsInsertFilmUpload: false,
  UploadFilmCondition: '',
  IsInsertImageUpload: false,
  UploadImageCondition: '',

  // 推送任务配置
  IsInsertExamPush: false,
  PushExamCondition: '',
  IsInsertReportPush: false,
  PushReportCondition: '',
  IsInsertFilmPush: false,
  PushFilmCondition: '',
  IsInsertImagePush: false,
  PushImageCondition: '',

  // 下载任务配置
  IsInsertReportDown: false,
  DownReportCondition: '',
  IsInsertFilmDown: false,
  DownFilmCondition: '',
  IsInsertImageDown: false,
  DownImageCondition: ''
})

watch(
  () => props.model,
  (val) => {
    if (!val) return
    Object.assign(form, val)
  },
  { immediate: true, deep: true }
)

const boolOptions = [
  { label: '是', value: true },
  { label: '否', value: false }
]

function onCancel() {
  visible.value = false
}

function onConfirm() {
  emit('save', { ...form })
  visible.value = false
}
</script>

<template>
  <ElDialog v-model="visible" title="拆分任务插入上传和推送表配置" width="720px" append-to-body>
    <div class="split-conf">
      <ElForm label-position="left" label-width="240px">
        <ElFormItem label="是否启用新任务配置">
          <ElSelect v-model="form.IsEnableNewConfig" placeholder="请选择">
            <ElOption
              v-for="o in boolOptions"
              :key="o.value + ''"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>
        </ElFormItem>
        <div class="section-sep"></div>
        <ElFormItem label="是否插入上传任务">
          <ElSelect v-model="form.IsInsertUploadTask" placeholder="请选择">
            <ElOption
              v-for="o in boolOptions"
              :key="'up-' + o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>
        </ElFormItem>
        <div v-show="form.IsInsertUploadTask">
          <ElFormItem label="是否插入检查上传任务">
            <ElSelect v-model="form.IsInsertExamUpload" placeholder="请选择">
              <ElOption
                v-for="o in boolOptions"
                :key="'examup-' + o.value"
                :label="o.label"
                :value="o.value"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="插入检查上传任务自定义过滤条件" v-show="form.IsInsertExamUpload">
            <ElInput v-model="form.UploadExamCondition" placeholder="请输入" />
          </ElFormItem>

          <ElFormItem label="是否插入报告上传任务">
            <ElSelect v-model="form.IsInsertReportUpload" placeholder="请选择">
              <ElOption
                v-for="o in boolOptions"
                :key="'repup-' + o.value"
                :label="o.label"
                :value="o.value"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="插入报告上传任务自定义过滤条件" v-show="form.IsInsertReportUpload">
            <ElInput v-model="form.UploadReportCondition" placeholder="请输入" />
          </ElFormItem>

          <ElFormItem label="是否插入胶片上传任务">
            <ElSelect v-model="form.IsInsertFilmUpload" placeholder="请选择">
              <ElOption
                v-for="o in boolOptions"
                :key="'filmup-' + o.value"
                :label="o.label"
                :value="o.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="插入胶片上传任务自定义过滤条件" v-show="form.IsInsertFilmUpload">
            <ElInput v-model="form.UploadFilmCondition" placeholder="请输入" />
          </ElFormItem>
          <ElFormItem label="是否插入影像上传任务">
            <ElSelect v-model="form.IsInsertImageUpload" placeholder="请选择">
              <ElOption
                v-for="o in boolOptions"
                :key="'imgup-' + o.value"
                :label="o.label"
                :value="o.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="插入影像上传任务自定义过滤条件" v-show="form.IsInsertImageUpload">
            <ElInput v-model="form.UploadImageCondition" placeholder="请输入" />
          </ElFormItem>
        </div>

        <div class="section-sep"></div>
        <ElFormItem label="是否插入推送任务">
          <ElSelect v-model="form.IsInsertPushTask" placeholder="请选择">
            <ElOption
              v-for="o in boolOptions"
              :key="'push-' + o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>
        </ElFormItem>
        <div v-show="form.IsInsertPushTask">
          <ElFormItem label="是否插入检查推送任务">
            <ElSelect v-model="form.IsInsertExamPush" placeholder="请选择">
              <ElOption
                v-for="o in boolOptions"
                :key="'push-' + o.value"
                :label="o.label"
                :value="o.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="插入检查推送任务自定义过滤条件" v-show="form.IsInsertExamPush">
            <ElInput v-model="form.PushExamCondition" placeholder="请输入" />
          </ElFormItem>
          <ElFormItem label="是否插入报告推送任务">
            <ElSelect v-model="form.IsInsertReportPush" placeholder="请选择">
              <ElOption
                v-for="o in boolOptions"
                :key="'push-' + o.value"
                :label="o.label"
                :value="o.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="插入报告推送任务自定义过滤条件" v-show="form.IsInsertReportPush">
            <ElInput v-model="form.PushReportCondition" placeholder="请输入" />
          </ElFormItem>
          <ElFormItem label="是否插入胶片推送任务">
            <ElSelect v-model="form.IsInsertFilmPush" placeholder="请选择">
              <ElOption
                v-for="o in boolOptions"
                :key="'push-' + o.value"
                :label="o.label"
                :value="o.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="插入胶片推送任务自定义过滤条件" v-show="form.IsInsertFilmPush">
            <ElInput v-model="form.PushFilmCondition" placeholder="请输入" />
          </ElFormItem>
          <ElFormItem label="是否插入影像推送任务">
            <ElSelect v-model="form.IsInsertImagePush" placeholder="请选择">
              <ElOption
                v-for="o in boolOptions"
                :key="'push-' + o.value"
                :label="o.label"
                :value="o.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="插入影像推送任务自定义过滤条件" v-show="form.IsInsertImagePush">
            <ElInput v-model="form.PushImageCondition" placeholder="请输入" />
          </ElFormItem>
        </div>

        <div class="section-sep"></div>

        <ElFormItem label="是否插入下载任务">
          <ElSelect v-model="form.IsInsertDownTask" placeholder="请选择">
            <ElOption
              v-for="o in boolOptions"
              :key="'dl-' + o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>
        </ElFormItem>
        <div v-show="form.IsInsertDownTask">
          <ElFormItem label="是否插入报告下载任务">
            <ElSelect v-model="form.IsInsertReportDown" placeholder="请选择">
              <ElOption
                v-for="o in boolOptions"
                :key="'repdl-' + o.value"
                :label="o.label"
                :value="o.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="插入报告下载任务自定义过滤条件" v-show="form.IsInsertReportDown">
            <ElInput v-model="form.DownReportCondition" placeholder="请输入" />
          </ElFormItem>

          <ElFormItem label="是否插入胶片下载任务">
            <ElSelect v-model="form.IsInsertFilmDown" placeholder="请选择">
              <ElOption
                v-for="o in boolOptions"
                :key="'filmdl-' + o.value"
                :label="o.label"
                :value="o.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="插入胶片下载任务自定义过滤条件" v-show="form.IsInsertFilmDown">
            <ElInput v-model="form.DownFilmCondition" placeholder="请输入" />
          </ElFormItem>
          <ElFormItem label="是否插入影像下载任务">
            <ElSelect v-model="form.IsInsertImageDown" placeholder="请选择">
              <ElOption
                v-for="o in boolOptions"
                :key="'imgdl-' + o.value"
                :label="o.label"
                :value="o.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="插入影像下载任务自定义过滤条件" v-show="form.IsInsertImageDown">
            <ElInput v-model="form.DownImageCondition" placeholder="请输入" />
          </ElFormItem>
        </div>
      </ElForm>
    </div>

    <template #footer>
      <div class="dlg-footer">
        <ElButton @click="onCancel">取消</ElButton>
        <ElButton type="primary" @click="onConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped lang="less">
.split-conf {
  max-height: 70vh;
  padding-right: 8px;
  overflow: auto;
}

.section-sep {
  position: relative;
  padding: 8px 0;
  margin: 12px 0;
  color: #606266;
}

.section-sep::after {
  position: absolute;
  top: 50%;
  right: 0;
  left: 160px;
  height: 1px;
  background: #e5e7eb;
  content: '';
}

.dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
