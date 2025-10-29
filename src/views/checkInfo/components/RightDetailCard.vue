<template>
  <div class="right-detail">
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
      <div>
        <template v-if="top.charged !== null">
          <span class="sep">·</span>
          <span class="dot" :class="{ ok: top.charged === true }"></span>
          <span class="charged">{{ top.charged ? '已收费' : '未收费' }}</span>
        </template>
        <el-dropdown>
          <span class="el-dropdown-link">
            <img class="image-icon" src="@/assets/imgs/info/push.png" alt="imgs" />
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>检查推送状态</el-dropdown-item>
              <el-dropdown-item>报告推送状态</el-dropdown-item>
              <el-dropdown-item>胶片推送状态</el-dropdown-item>
              <el-dropdown-item>影像推送状态</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <img class="image-icon icon-margin" src="@/assets/imgs/info/related_check.png" alt="imgs" />
        <img class="image-icon icon-margin" src="@/assets/imgs/info/ims-icon.png" alt="imgs" />
        <el-dropdown>
          <span class="el-dropdown-link">
            <img class="image-icon" src="@/assets/imgs/info/updata-icon.png" alt="imgs" />
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>报告文件重传</el-dropdown-item>
              <el-dropdown-item>胶片文件重传</el-dropdown-item>
              <el-dropdown-item>影像文件重传</el-dropdown-item>
              <el-dropdown-item>检查信息重传</el-dropdown-item>
              <el-dropdown-item>重置诊断/会诊状态</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown>
          <span class="el-dropdown-link">
            <img class="image-icon icon-margin" src="@/assets/imgs/info/collect.png" alt="imgs" />
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>文件重采</el-dropdown-item>
              <el-dropdown-item>检查重采</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown>
          <span class="el-dropdown-link">
            <img class="image-icon" src="@/assets/imgs/info/upload.png" alt="imgs" />
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>文件重采</el-dropdown-item>
              <el-dropdown-item>检查重采</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <img
          class="image-icon icon-margin"
          src="@/assets/imgs/info/report_selected.png"
          alt="imgs"
        />
        <img class="image-icon icon-margin" src="@/assets/imgs/info/image_normal.png" alt="imgs" />
        <img class="image-icon icon-margin" src="@/assets/imgs/info/film_disable.png" alt="imgs" />
        <img
          class="image-icon icon-margin"
          src="@/assets/imgs/info/application_normal.png"
          alt="imgs"
        />
        <img class="image-icon icon-margin" src="@/assets/imgs/info/zoom_normal.png" alt="imgs" />
        <img
          class="image-icon icon-margin"
          src="@/assets/imgs/info/enlarge_normal.png"
          alt="imgs"
        />
      </div>
    </div>
    <section class="block">
      <div class="block-title">患者信息</div>
      <div class="grid">
        <div class="cell">
          <span class="label">姓名</span>
          <span class="value">{{ detail?.patientName || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">年龄</span>
          <span class="value">{{ detail?.age || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">性别</span>
          <span class="value">{{ detail?.gender || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">病历号</span>
          <span class="value">{{ detail?.medRecNO || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">门诊号</span>
          <span class="value">{{ detail?.outPatientID || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">病区</span>
          <span class="value">{{ detail?.pointOfCare || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">患者编号</span>
          <span class="value">{{ detail?.patientID || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">住院号</span>
          <span class="value">{{ detail?.patientID || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">申请科室</span>
          <span class="value">{{ detail?.requestDept || detail?.requestOrgName || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">床位</span>
          <span class="value">{{ detail?.bed || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">临床诊断</span>
          <span class="value">{{ detail?.clinicDiagnosis || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">机构名称</span>
          <span class="value">{{ detail?.organizationName || '-' }}</span>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="block-title">检查信息</div>
      <div class="grid">
        <div class="cell">
          <span class="label">检查类型</span>
          <span class="value">{{ detail?.serviceSectID || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">检查项目</span>
          <span class="value">{{ detail?.examItem || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">检查时间</span>
          <span class="value">{{ detail?.examTime || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">检查方法</span>
          <span class="value">{{ detail?.observationMethod || '-' }}</span>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="block-title">报告信息</div>
      <div class="grid single">
        <div class="cell">
          <span class="label">影像所见</span>
          <span class="value">{{ detail?.dicomView || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">影像诊断</span>
          <span class="value">{{ detail?.dicomConsultation || '-' }}</span>
        </div>
      </div>
      <div class="grid">
        <div class="cell">
          <span class="label">报告医生</span>
          <span class="value">{{ detail?.resultAssistantName || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">审核医生</span>
          <span class="value">{{ detail?.resultPrincipalName || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">修订医生</span>
          <span class="value">{{ detail?.resultReviseName || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">报告时间</span>
          <span class="value">{{ detail?.resultDate || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">审核时间</span>
          <span class="value">{{ detail?.auditDate || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">修订时间</span>
          <span class="value">{{ detail?.reviseDate || '-' }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'
import type { CheckInfoRow, CheckReportDetail } from '@/api/checkInfo'
import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElIcon } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
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
    type: Object as PropType<Partial<CheckInfoRow & CheckReportDetail>>,
    default: () => ({})
  }
})

// 顶部信息汇总
const top = computed(() => {
  const d = (props.detail || {}) as Detail
  const chargedRaw: any = (d as any).digitalimageneed ?? (d as any).charged ?? (d as any).chargeFlag
  let charged: boolean | null = null
  if (chargedRaw === true || chargedRaw === 'true' || chargedRaw === 1 || chargedRaw === '1')
    charged = true
  else if (chargedRaw === false || chargedRaw === 'false' || chargedRaw === 0 || chargedRaw === '0')
    charged = false

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
</script>

<style scoped>
.right-detail {
  padding: 8px 12px;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 10px;
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
  background: #fff;
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
  background-color: #f7f7f7;
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
}

.icon-margin {
  margin-right: 28px;
  cursor: pointer;
}

.el-dropdown-link {
  margin-right: 20px;
}
</style>
