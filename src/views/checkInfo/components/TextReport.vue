<template>
  <div class="text-report">
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
import { PropType } from 'vue'
import type { CheckInfoRow, CheckReportDetail } from '@/api/checkInfo'

const props = defineProps({
  detail: {
    type: Object as PropType<Partial<CheckInfoRow & CheckReportDetail>>,
    default: () => ({})
  }
})

const detail = props.detail
</script>

<style scoped>
.block {
  margin-top: 25px;
  margin-bottom: 10px;
  background: #fff;
  border-radius: 4px;
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
</style>
