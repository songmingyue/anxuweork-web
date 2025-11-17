<template>
  <div class="right-detail" v-if="detail.isShowDialog">
    <div class="detail-top">
      <div class="top-left">
        <span v-if="top.abnormal" :class="top.abnormal === '阴性' ? 'abnormal' : 'redabnormal'"
          >[{{ top.abnormal }}]</span
        >
        <span class="name">{{ top.patientName || '-' }}</span>
        <span class="modality">{{ detail.serviceSectID || '-' }}</span>
        <span class="status">{{ top.status || '-' }}</span>
        <span class="time">{{ top.time || '-' }}</span>
        <span class="acc">{{ top.accession || '-' }}</span>
      </div>
      <div class="top-right">
        <div
          class="flex-status-money"
          v-if="permissionsMsd('displayStyleRightInfo', 'chargeStatusVisible')"
        >
          <span class="dot" :class="{ ok: detail.digitalimageneed === '是' }"></span>
          <span class="charged">{{ detail.digitalimageneed === '是' ? '已收费' : '未收费' }}</span>
        </div>
        <el-dropdown v-if="permissionsMsd('displayStyleRightInfo', 'manualPushVisible')">
          <span class="el-dropdown-link">
            <img class="image-icon" src="@/assets/imgs/info/push.png" alt="imgs" />
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in pushStatus" :key="item.label">
                <span :class="item.value ? 'is-success' : 'is-default'"></span
                >{{ item.label }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-tooltip
          class="box-item"
          effect="dark"
          content="相关检查"
          placement="top"
          v-if="permissionsMsd('displayStyleRightInfo', 'relatedExamVisible')"
        >
          <a href="http://example.com" target="_blank">
            <img
              class="image-icon icon-margin"
              src="@/assets/imgs/info/related_check.png"
              alt="imgs"
          /></a>
        </el-tooltip>
        <el-dropdown v-if="permissionsMsd('displayStyleRightInfo', 'manualEditVisible')">
          <span class="el-dropdown-link">
            <img class="image-icon" src="@/assets/imgs/info/updata-icon.png" alt="imgs" />
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="isUpdatePatientInfo = true">手动更新</el-dropdown-item>
              <el-dropdown-item @click="showEcard = true">二维码</el-dropdown-item>
              <el-dropdown-item @click="updateStatus">更新打印状态</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown v-if="permissionsMsd('displayStyleRightInfo', 'reGainRightFileVisible')">
          <span class="el-dropdown-link">
            <img class="image-icon" src="@/assets/imgs/info/collect.png" alt="imgs" />
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="isFileResampling = true">文件重采</el-dropdown-item>
              <el-dropdown-item @click="checkResampling">检查重采</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown @command="changeFileType" v-if="permissionsMsd('data', 'isOpenUpload')">
          <span class="el-dropdown-link">
            <img class="image-icon" src="@/assets/imgs/info/upload.png" alt="imgs" />
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="item in fileStatus"
                :key="item.label"
                :command="item.key || 'reset'"
              >
                <span
                  v-if="!item.unShowLable"
                  :class="item.value ? 'is-success' : 'is-default'"
                ></span
                >{{ item.label }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown v-if="permissionsMsd('data', 'reportVisible')">
          <span class="el-dropdown-link">
            <img
              class="image-icon"
              v-if="['reportImage', 'reportText'].includes(activeIcon)"
              src="@/assets/imgs/info/report_selected.png"
              alt="imgs"
            />
            <img class="image-icon" v-else src="@/assets/imgs/info/report_normal.png" alt="imgs" />

            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="reportChange('reportText')"> 文字报告</el-dropdown-item>
              <el-dropdown-item v-if="detail.examResultStatus" @click="reportChange('reportImage')">
                图文报告</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-tooltip
          class="box-item"
          effect="dark"
          content="影像"
          placement="top"
          v-if="permissionsMsd('data', 'imageVisible')"
        >
          <img
            class="image-icon icon-margin"
            @click="getPortrai"
            v-if="detail.ifHasImage === '有'"
            src="@/assets/imgs/info/image_normal.png"
            alt="imgs"
          />
          <img
            v-else
            class="image-icon icon-margin icon-disabled"
            src="@/assets/imgs/info/image_disable.png"
            alt="imgs"
          />
        </el-tooltip>
        <el-tooltip
          class="box-item"
          effect="dark"
          content="胶片"
          placement="top"
          v-if="permissionsMsd('examInfo', 'filmVisible')"
        >
          <img
            v-if="detail.examFilmStatus && activeIcon !== 'film'"
            @click="getFilm"
            class="image-icon icon-margin"
            src="@/assets/imgs/info/film_normal.png"
            alt="imgs"
          />
          <img
            v-if="!detail.examFilmStatus"
            class="image-icon icon-margin icon-disabled"
            src="@/assets/imgs/info/film_disable.png"
            alt="imgs"
          />
          <img
            v-if="activeIcon === 'film'"
            class="image-icon icon-margin"
            src="@/assets/imgs/info/film_selected.png"
            alt="imgs"
          />
        </el-tooltip>

        <el-tooltip
          class="box-item"
          effect="dark"
          content="申请单"
          placement="top"
          v-if="permissionsMsd('data', 'requestVisible')"
        >
          <img
            class="image-icon icon-margin"
            src="@/assets/imgs/info/application_selected.png"
            v-if="activeIcon === 'requestReport'"
            alt="imgs"
          />
          <img
            v-else
            class="image-icon icon-margin"
            src="@/assets/imgs/info/application_normal.png"
            @click="getRequestList"
            alt="imgs"
          />
        </el-tooltip>

        <el-tooltip class="box-item" effect="dark" v-if="!isBig" content="放大" placement="top">
          <img
            @click="changeSize('big')"
            class="image-icon"
            src="@/assets/imgs/info/enlarge_normal.png"
            alt="imgs"
          />
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="缩小" v-else placement="top">
          <img
            @click="changeSize('small')"
            class="image-icon"
            src="@/assets/imgs/info/zoom_normal.png"
            alt="imgs"
          />
        </el-tooltip>
      </div>
    </div>
    <TextReport :detail="detail" v-if="activeIcon === 'reportText'" />
    <RequestReport :detail="requestReportDetail" v-if="activeIcon === 'requestReport'" />
    <div v-if="activeIcon === 'reportImage'" class="film-wrap" ref="carouselWrap">
      <el-carousel :height="carouselHeight" @change="onCarouselChange" :autoplay="false">
        <el-carousel-item v-for="(item, index) in detail.documentDtos" :key="index">
          <div class="film-item">
            <img :src="item.base64url" alt="film" />
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    <div v-if="activeIcon === 'film'" class="film-wrap" ref="carouselWrap">
      <el-carousel :height="carouselHeight" @change="onCarouselChange" :autoplay="false">
        <el-carousel-item v-for="(item, index) in documentDtos" :key="index">
          <div class="film-item">
            <img :src="item.base64url" alt="film" />
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    <el-dialog v-model="isUpdatePatientInfo" title="手动更新患者信息" width="600">
      <el-form :model="formUpdate" label-width="190px">
        <el-form-item label="机构">
          <span>{{ formUpdate.organizationName || '-' }}</span>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="formUpdate.patientName" disabled />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="formUpdate.contactPhoneNO" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="formUpdate.iDCardNo" />
        </el-form-item>
        <el-form-item label="是否同步到患者的所有检查">
          <el-switch
            size="small"
            v-model="formUpdate.editType"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isUpdatePatientInfo = false">取消</el-button>
        <el-button type="primary" :loading="loadingUpdate" @click="updateMsg">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEcard" :title="`${detail.patientName}的二维码`" width="300">
      <Qrcode :text="detail.qrCodeUrl" :width="250" />
    </el-dialog>
    <el-dialog v-model="isFileResampling" title="文件重采" width="600">
      <el-radio-group v-model="radioFileResampling">
        <el-radio value="0">全部重采</el-radio>
        <el-radio label="8">报告</el-radio>
        <el-radio label="16">影像</el-radio>
        <el-radio label="32">胶片</el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="isFileResampling = false">取消</el-button>
        <el-button type="primary" :loading="loadingUpdate" @click="sureResampling">确认</el-button>
      </template>
    </el-dialog>
  </div>
  <div class="right-empty" v-else>
    <el-empty description="该检查已被锁定" />
  </div>
</template>

<script setup lang="ts">
import { PropType, computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { permissionsMsd } from '@/utils/permission'
import {
  DocStatusProto,
  DocumentDtoProto,
  DocumentProto,
  getdoc,
  getrequest,
  pePrintStatus,
  RequestReportDetail,
  resetBusinessStatus,
  resetConsultationFlag,
  reUploadCheckInfo,
  UpdatePatientInfo,
  type CheckInfoRow,
  type CheckReportDetail,
  type PushStatus
} from '@/api/checkInfo'
import {
  ElCarousel,
  ElCarouselItem,
  ElEmpty,
  // ElImage,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElDialog,
  ElForm,
  ElSwitch,
  ElFormItem,
  ElInput,
  ElButton,
  ElMessage,
  ElRadioGroup,
  ElRadio,
  ElMessageBox,
  ElLoading,
  ElTooltip
} from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { Qrcode } from '@/components/Qrcode'
import TextReport from './TextReport.vue'
import RequestReport from './requestReport.vue'
import { arrayBufferToBase64 } from '@/utils/base64'
interface Detail extends Partial<CheckInfoRow> {
  imagingDiagnosis?: string
  imageView?: string
  resultAssistantName?: string
  resultPrincipalName?: string
  modifyDoctor?: string
  reportTime?: string
  auditTime?: string
  modifyTime?: string
  clinicalDiagnosis?: string
}

const props = defineProps({
  detail: {
    type: Object as PropType<
      Partial<
        CheckInfoRow &
          CheckReportDetail &
          PushStatus &
          DocStatusProto &
          DocumentProto & { isShowDialog: boolean }
      >
    >,
    default: () => ({})
  }
})

const formUpdate = ref({
  organizationID: '',
  organizationName: '',
  patientName: '',
  contactPhoneNO: '',
  iDCardNo: '',
  editType: 0
})

const loadingUpdate = ref(false)
const isUpdatePatientInfo = ref(false)
const emit = defineEmits(['updated', 'reportText', 'reportImage', 'sizeChange'])
const requestReportDetail = ref<RequestReportDetail>({}) // 申请单详情
// 使用 store 或 localStorage 中已保存的机构信息作为默认值
import { useUserStoreWithOut } from '@/store/modules/user'
const userStore = useUserStoreWithOut()
const ui: any = Array.isArray(userStore.getUserInfo)
  ? userStore.getUserInfo[0]
  : userStore.getUserInfo
// 当弹窗打开时，初始化表单：机构取 userStore 中的值（已持久化到 localStorage），姓名取 top.patientName 并不可编辑
watch(
  () => isUpdatePatientInfo.value,
  (val) => {
    if (val) {
      formUpdate.value.organizationID = userStore.getorganizationID || ''
      // 若 userInfo 存在，优先取组织名
      formUpdate.value.organizationName = (ui && ui.organizationName) || ''
      formUpdate.value.patientName =
        top.value.patientName || (props.detail && (props.detail as any).patientName) || ''
      formUpdate.value.contactPhoneNO = ''
      formUpdate.value.iDCardNo = ''
      formUpdate.value.editType = 0
    }
  }
)
const showEcard = ref(false)
const isFileResampling = ref(false)
const radioFileResampling = ref('0')
const documentDtos = ref<DocumentDtoProto[]>([])
// 轮播高度与自适应
const carouselWrap = ref<HTMLElement | null>(null)
const carouselHeight = ref('300px')
const currentSlide = ref(0)
const pushStatus = computed(() => {
  const { examPushStatus, reportPushStatus, filmPushStatus, imagePushStatus } = props.detail || {}
  console.log('pushStatus', props.detail)
  return [
    {
      label: '检查推送状态',
      value: Boolean(examPushStatus)
    },
    {
      label: '报告推送状态',
      value: Boolean(reportPushStatus)
    },
    {
      label: '胶片推送状态',
      value: Boolean(filmPushStatus)
    },
    {
      label: '影像推送状态',
      value: Boolean(imagePushStatus)
    }
  ]
})

const fileStatus = computed(() => {
  const { reportUploadFlag, filmUploadFlag, imageUploadFlag, examUploadFlag } = props.detail || {}
  console.log('pushStatus', props.detail)
  return [
    {
      label: '报告文件重传',
      value: reportUploadFlag === '是',
      key: '1'
    },
    {
      label: '胶片文件重传',
      value: filmUploadFlag === '是',
      key: '2'
    },
    {
      label: '影像文件重传',
      value: imageUploadFlag === '是',
      key: '3'
    },
    {
      label: '检查信息重传',
      value: examUploadFlag === '是',
      key: '0'
    },
    {
      label: '重置诊断/会诊状态',
      unShowLable: true,
      key: 'reset'
    }
  ]
})
const changeFileType = async (key: string) => {
  if (key === 'reset') {
    // 这里按需实现重置逻辑（若后端有单独的接口）
    await resetConsultationFlag({
      examUID: props.detail.examUID || ''
    })
    return
  } else {
    ElMessageBox.confirm(`即将为您上传，是否继续`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        const loading = ElLoading.service({
          lock: true,
          text: 'Loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        try {
          await reUploadCheckInfo({
            examUID: props.detail.examUID || '',
            type: key
          })
        } finally {
          loading.close()
        }
      })
      .catch(() => {
        // 取消操作
      })
  }
}
// 顶部信息汇总
const top = computed(() => {
  const d = (props.detail || {}) as Detail
  const charged = props.detail.digitalimageneed
  return {
    abnormal: d.abnormalFlags || '',
    patientName: d.patientName || '',
    modality: d.serviceSectID || '',
    status: d.resultStatus || '',
    time: d.examTime || d.reportTime || '',
    accession: d.accessionNumber || d.patientID || '',
    charged
  }
})

const reportChange = (type: string) => {
  activeIcon.value = type
  if (type === 'reportText') {
    emit('reportText')
    // 文字报告
  } else if (type === 'reportImage') {
    emit('reportImage')
    // 图文报告
  }
}
const updateMsg = async () => {
  loadingUpdate.value = true
  const details = props.detail || {}
  const query = {
    ...details,
    contactPhoneNO: formUpdate.value.contactPhoneNO || '',
    iDCardNo: formUpdate.value.iDCardNo || '',
    editType: formUpdate.value.editType || 0
  }
  await UpdatePatientInfo(query as any)
  loadingUpdate.value = false
  isUpdatePatientInfo.value = false
  // 通知父组件刷新
  emit('updated')
}
const activeIcon = ref('reportText') // 当前激活的图标

const getFilm = async () => {
  if (!props.detail.examFilmStatus) {
    ElMessage.warning(`${props.detail.patientName}无胶片文件`)
    return
  }
  activeIcon.value = 'film'
  const { data } = await getdoc({
    ...props.detail,
    userInfo: ui,
    typeCode: 'ExamFilm'
  })
  documentDtos.value = data[0].document.documentDtos.map((item) => {
    return {
      ...item,
      base64url: arrayBufferToBase64(item.base64url)
    }
  })
  // 等待 DOM 更新后根据可用空间计算高度
  await nextTick()
  computeAvailableHeight()
}

const getPortrai = async () => {
  if (!props.detail.examImgStatus) {
    ElMessage.warning(`${props.detail.patientName}无影像文件`)
    return
  }
  const { data } = await getdoc({
    ...props.detail,
    userInfo: ui,
    typeCode: 'ExamImage'
  })
  let details = ''
  if (Array.isArray(data[0].document)) {
    details = data[0].document[0].documentDtos[0].imgUrl
  } else {
    details = data[0].document.documentDtos[0].imgUrl
  }
  window.open(details || '')
}

function onCarouselChange(newIndex: number) {
  currentSlide.value = newIndex
  computeAvailableHeight()
}

function handleResize() {
  computeAvailableHeight()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

// 缓存下这个高度，为了放大缩小
const heightCache = ref('')

// 计算可用高度：以 film 容器到视窗底部的空间为准
function computeAvailableHeight() {
  const wrap = carouselWrap.value
  if (!wrap) return
  const rect = wrap.getBoundingClientRect()
  const padding = 0 // 底部预留
  const available = Math.max(160, Math.floor(window.innerHeight - rect.top - padding))
  carouselHeight.value = `${available}px`
  heightCache.value = `${available}px`
}

// 当切换到胶片视图时，等待 DOM 就绪后计算一次高度
watch(
  () => activeIcon.value,
  async (val) => {
    if (val === 'film' || val === 'reportImage') {
      await nextTick()
      computeAvailableHeight()
    }
  }
)

watch(
  () => props.detail,
  async () => {
    // 每次 detail 变化时，重置当前视图为文字报告
    if (props.detail.examResultStatus) {
      activeIcon.value = 'reportImage'
    } else {
      activeIcon.value = 'reportText'
    }
  }
)

const checkResampling = async () => {
  ElMessageBox.confirm(`即将为您重新采集${props.detail.patientName}的检查是否继续`, '危险操作', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      loadingUpdate.value = true
      await resetBusinessStatus({
        examUID: props.detail.examUID || '',
        fileType: '1'
      })
      loadingUpdate.value = false
    })
    .catch(() => {
      // 取消操作
    })
}
// 获取申请单
const getRequestList = async () => {
  activeIcon.value = 'requestReport'
  console.log(props.detail, 'props.detail')
  const { data } = await getrequest({
    ...props.detail,
    userInfo: ui
  })
  requestReportDetail.value = data[0]
}

const sureResampling = async () => {
  loadingUpdate.value = true
  await resetBusinessStatus({
    examUID: props.detail.examUID || '',
    fileType: radioFileResampling.value,
    accessionNumber: props.detail.accessionNumber || ''
  })
  loadingUpdate.value = false
  isFileResampling.value = false
  ElMessage.success('重采请求已发送')
}
const updateStatus = async () => {
  await pePrintStatus({
    examUID: props.detail.examUID || ''
  })
}
const isBig = ref(false) //最大状态
const changeSize = (type: 'small' | 'big') => {
  isBig.value = type === 'big'
  carouselHeight.value = type === 'big' ? '100vh' : heightCache.value
  emit('sizeChange', type)
}
</script>

<style scoped>
.right-detail {
  padding: 8px 12px;
}

.right-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-right {
  display: flex;
  width: 550px;
  min-width: 545px;
  justify-content: end;
}

.detail-top {
  display: flex;
  height: 36px;
  padding: 0 2px 6px;
  font-size: 12px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.detail-top .abnormal {
  color: #67c23a;
}

.redabnormal {
  color: #f56c6c;
}

.detail-top .name {
  font-weight: 600;
}

.detail-top .sep {
  color: #c0c4cc;
}

.dot {
  margin-right: 5px;
}

.detail-top .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #f56c6c; /* 未收费 红 */
  border-radius: 50%;
}

.detail-top .dot.ok {
  background: #67c23a;
} /* 已收费 绿 */
.block {
  margin-top: 25px;
  margin-bottom: 10px;

  /* background: var(--el-fill-color-blank); */
  border-radius: 4px;

  /* padding-left: 16px; */
}

.block-title {
  display: flex;
  height: 36px;
  padding: 0 18px;
  font-weight: 500;
  line-height: 36px;
  color: #606266;

  /* background-color: #f7f7f7; */
  background: var(--el-fill-color-blank);
  border-bottom: 1px solid #ebeef5;
  align-items: center;
}

.mr4 {
  margin-right: 4px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 16px;
  padding: 10px 20px;
  font-size: 12px;
}

.grid.single {
  grid-template-columns: 1fr;
}

.cell {
  display: flex;
  padding: 5px 0;
  color: #606266;
  gap: 8px;
}

.label {
  min-width: 72px;
  color: #909399;
}

.value {
  color: #303133;
  flex: 1;
}

.image-icon {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.icon-margin {
  margin-right: 28px;
  cursor: pointer;
}

.el-dropdown-link {
  margin-right: 20px;
}

.film-wrap {
  width: 100%;
}

.film-item {
  height: 100%;
  overflow: auto;
}

.film-item img {
  display: block;
  width: 100%;
  height: auto;
}

.is-success {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 10px;
  background-color: #67c23a;
  border-radius: 50%;
}

.is-default {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 10px;
  background-color: #f56c6c;
  border-radius: 50%;
}

.icon-disabled {
  cursor: no-drop;
}

.flex-status-money {
  display: flex;
  align-items: center;
  margin-right: 8px;
}
</style>
