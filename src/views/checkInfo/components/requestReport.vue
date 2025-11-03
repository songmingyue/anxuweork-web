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
          <span class="label">住院号</span>
          <span class="value">{{ detail?.alternateVisitID || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">类型</span>
          <span class="value">{{ detail?.patientClass || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">电话</span>
          <span class="value">{{ detail?.contactPhoneNO || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">门诊号</span>
          <span class="value">{{ detail?.outPatientID || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">床位</span>
          <span class="value">{{ detail?.bed || '-' }}</span>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="block-title">申请信息</div>
      <div class="grid">
        <div class="cell">
          <span class="label">申请号</span>
          <span class="value">{{ detail?.placerOrderNO || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">申请科室</span>
          <span class="value">{{ detail?.requestDept || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">申请医生</span>
          <span class="value">{{ detail?.requestDocName || '-' }}</span>
        </div>
        <div class="cell">
          <span class="label">申请时间</span>
          <span class="value">{{ detail?.requestTime || '-' }}</span>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="block-title">检查信息</div>
      <el-row>
        <el-col :span="24">
          <div class="flex-special first-flex">
            <span class="label">检查项目</span>
            <span class="value">{{ detail?.examItem || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="flex-special">
            <span class="label">检查目的</span>
            <span class="value">{{ detail?.reason || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="flex-special">
            <span class="label">病状体征</span>
            <span class="value">{{ detail?.symptom || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="flex-special">
            <span class="label">临床诊断</span>
            <span class="value">{{ detail?.clinicDiagnosis || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="flex-special">
            <span class="label">注意事项</span>
            <span class="value">{{ detail?.attention || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="flex-special">
            <span class="label">其他临床信息</span>
            <span class="value">{{ detail?.otherClinicalInfo || '-' }}</span>
          </div>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import type { RequestReportDetail } from '@/api/checkInfo'
import { ElRow, ElCol } from 'element-plus'

const props = defineProps({
  detail: {
    type: Object as PropType<RequestReportDetail>,
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

.flex-special {
  display: flex;
  gap: 8px 16px;
  padding: 10px 20px;
  font-size: 12px;
}

.first-flex {
  margin-top: 10px;
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
  font-size: 12px;
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
