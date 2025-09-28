<template>
  <div class="sys-config-layout">
    <!-- 左侧：固定步骤，铺满高度 -->
    <aside class="sidebar">
      <div class="title">
        <i class="icon">⚙️</i>
        <span>集成平台系统配置</span>
      </div>
      <ul class="steps">
        <li
          v-for="(s, i) in steps"
          :key="s.key"
          :class="['step', { active: curr === i }]"
          @click="goto(i)"
        >
          <span class="badge">{{ i + 1 }}</span>
          <span class="label">{{ s.title }}</span>
        </li>
      </ul>
    </aside>

    <!-- 右侧：内容区域铺满 -->
    <section class="content">
      <div class="nav left" :class="{ disabled: !canPrev }" @click="prev">‹</div>

      <div class="panel">
        <!-- 1 数据库配置（对应第一张图） -->
        <div v-if="curr === 0" class="pane">
          <div class="desc">该配置页面用于集成平台数据库配置，点击确定后提交即生效</div>
          <el-form :model="dbForm" label-width="160px" class="form">
            <el-form-item label="数据库安装类型">
              <el-select v-model="dbForm.installType" placeholder="请选择">
                <el-option label="升级安装" value="upgrade" />
                <el-option label="全新安装" value="fresh" />
              </el-select>
            </el-form-item>
            <el-form-item label="数据库类型">
              <el-select v-model="dbForm.dbType" placeholder="请选择">
                <el-option label="SqlServer" value="mssql" />
                <el-option label="PostgreSQL" value="pg" />
              </el-select>
            </el-form-item>
            <el-form-item label="主从关系">
              <el-input v-model="dbForm.relation" placeholder="可留空" />
            </el-form-item>
            <el-form-item label="数据库服务器IP">
              <el-input v-model="dbForm.host" placeholder="127.0.0.1" />
            </el-form-item>
            <el-form-item label="数据库名称">
              <el-input v-model="dbForm.dbName" placeholder="IMCIS" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="dbForm.user" placeholder="sa" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="dbForm.password" type="password" placeholder="•••" show-password />
            </el-form-item>
            <el-form-item label="数据库服务端口">
              <el-input v-model="dbForm.port" placeholder="(可选)" />
            </el-form-item>
            <el-button type="primary">确定</el-button>
          </el-form>
        </div>

        <!-- 2 数据库脚本升级（对应第二张图，左右双栏占位） -->
        <div v-else-if="curr === 1" class="pane">
          <div class="desc">该配置页面用于集成平台数据库脚本升级，选择相应脚本后执行生效</div>
          <div class="ddl-wrap">
            <el-card class="ddl-col" shadow="never">
              <template #header>可执行脚本列表</template>
              <el-table :data="[]" border height="360">
                <el-table-column prop="id" label="脚本id" width="120" />
                <el-table-column prop="program" label="程序版本" />
                <el-table-column prop="script" label="脚本版本" />
              </el-table>
              <el-empty v-if="true" description="当前无可执行脚本" />
            </el-card>
            <el-card class="ddl-col" shadow="never">
              <template #header>本地脚本仓库</template>
              <el-empty description="当前无需扫描脚本" />
            </el-card>
          </div>
          <el-button type="primary" class="mt16">确定</el-button>
        </div>

        <!-- 3 log配置（对应第三张图） -->
        <div v-else-if="curr === 2" class="pane">
          <div class="desc">该配置页面用于集成平台 API 日志配置</div>
          <el-form :model="logForm" label-width="160px" class="form">
            <el-form-item label="输出完整路径">
              <el-input v-model="logForm.outPath" placeholder="D:\path\to\Logs\" />
            </el-form-item>
            <el-form-item label="备份文件的个数">
              <el-input v-model="logForm.backupCount" placeholder="100" />
            </el-form-item>
            <el-form-item label="是否覆盖">
              <el-select v-model="logForm.overwrite" placeholder="请选择">
                <el-option label="是" value="1" />
                <el-option label="否" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item label="最大大小">
              <el-input v-model="logForm.maxSize" placeholder="5MB" />
            </el-form-item>
            <el-form-item label="错误日志布局">
              <el-input v-model="logForm.errLayout" placeholder="格式占位符" />
            </el-form-item>
            <el-form-item label="文件创建的方式">
              <el-select v-model="logForm.fileCreateMode">
                <el-option label="Date" value="Date" />
                <el-option label="Size" value="Size" />
              </el-select>
            </el-form-item>
            <el-form-item label="日志级别">
              <el-select v-model="logForm.level">
                <el-option label="Trace" value="Trace" />
                <el-option label="Debug" value="Debug" />
                <el-option label="Info" value="Info" />
                <el-option label="Warn" value="Warn" />
                <el-option label="Error" value="Error" />
              </el-select>
            </el-form-item>
            <el-form-item label="日期格式">
              <el-input v-model="logForm.dateFormat" placeholder="yyyyMMdd" />
            </el-form-item>
            <el-button type="primary">确定</el-button>
          </el-form>
        </div>

        <!-- 4 token配置（对应第四张图） -->
        <div v-else class="pane">
          <div class="desc">该配置页面用于集成平台 token 配置</div>
          <el-form :model="tokenForm" label-width="140px" class="form">
            <el-form-item label="Token服务地址">
              <el-input v-model="tokenForm.url" placeholder="http://127.0.0.1:8090/" />
            </el-form-item>
            <el-form-item label="机构ID">
              <el-input v-model="tokenForm.orgId" placeholder="请输入机构ID" />
            </el-form-item>
            <el-button type="primary">确定</el-button>
          </el-form>
        </div>
      </div>

      <div class="nav right" :class="{ disabled: !canNext }" @click="next">›</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElButton
} from 'element-plus'
const steps = [
  { key: 'db', title: '数据库配置' },
  { key: 'ddl', title: '数据库脚本升级' },
  { key: 'log', title: 'log配置' },
  { key: 'token', title: 'token配置' }
]
const curr = ref(0)
const canPrev = computed(() => curr.value > 0)
const canNext = computed(() => curr.value < steps.length - 1)
function goto(i: number) {
  curr.value = Math.max(0, Math.min(steps.length - 1, i))
}
function prev() {
  if (canPrev.value) goto(curr.value - 1)
}
function next() {
  if (canNext.value) goto(curr.value + 1)
}

// 简单的表单模型（按需替换为你的实际数据）
const dbForm = ref({
  installType: 'upgrade',
  dbType: 'mssql',
  relation: '',
  host: '127.0.0.1',
  dbName: 'IMCIS',
  user: 'sa',
  password: '',
  port: ''
})
const logForm = ref({
  outPath: '',
  backupCount: 100,
  overwrite: '1',
  maxSize: '5MB',
  errLayout: '%n [%时间] %d%n 【线程】%t%n 【级别】%p',
  fileCreateMode: 'Date',
  level: 'Info',
  dateFormat: 'yyyyMMdd'
})
const tokenForm = ref({
  url: 'http://127.0.0.1:8090/',
  orgId: '123456789'
})
</script>

<style scoped>
/* 整页高度=视口-20px，底部留白20px，无滚动条 */
.sys-config-layout {
  display: flex;
  height: calc(100vh - 20px);
  margin-bottom: 20px; /* 距离下面 20px */
  overflow: hidden; /* 不出现滚动条 */
  box-sizing: border-box;
}

/* 左侧侧栏：固定宽度，不收缩，铺满高度 */
.sidebar {
  display: flex;
  height: 100%;
  min-width: 340px;
  padding: 24px 16px;
  color: #fff;
  background: #19bfd0;
  box-sizing: border-box;
  flex: 0 0 340px; /* 固定 340px 宽，不收缩 */
  flex-direction: column;
}

/* 左侧标题与步骤样式（恢复可视效果） */
.title {
  display: flex;
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: 600;
  align-items: center;
}

.title .icon {
  margin-right: 8px;
}

.steps {
  padding: 0;
  margin: 0;
  list-style: none;
}

.step {
  display: flex;
  padding: 10px 8px;
  cursor: pointer;
  border-radius: 6px;
  opacity: 0.9;
  transition: background 0.2s;
  align-items: center;
}

.step:hover {
  background: rgb(255 255 255 / 12%);
}

.step.active {
  background: rgb(255 255 255 / 20%);
}

.badge {
  display: inline-flex;
  width: 28px;
  height: 28px;
  margin-right: 10px;
  font-weight: 700;
  color: #19bfd0;
  background: #fff;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
}

.label {
  font-size: 16px;
}

/* 右侧区域：铺满剩余宽高，无滚动条 */
.content {
  position: relative;
  display: flex;
  height: 100%;
  padding: 16px 56px;
  overflow: hidden; /* 不出现滚动条 */
  box-sizing: border-box;
  flex: 1;
  align-items: stretch;
}

.panel {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 24px;
  overflow: hidden; /* 不出现滚动条 */
  background: #fff;
  border-radius: 6px;
  box-sizing: border-box;
  flex-direction: column;
}

.pane {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pane .desc {
  margin-bottom: 16px;
  color: #909399;
}

.form {
  max-width: 820px;
}

/* 第二步双列区域，高度自适应容器，不滚动 */
.ddl-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1; /* 占满剩余高度 */
  min-height: 360px;
}

.ddl-col {
  min-height: 360px;
}

/* 左右切换箭头 */
.nav {
  position: absolute;
  top: 50%;
  display: flex;
  width: 36px;
  height: 36px;
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  background: #19bfd0;
  border-radius: 50%;
  transform: translateY(-50%);
  user-select: none;
  align-items: center;
  justify-content: center;
}

.nav.left {
  left: 12px;
}

.nav.right {
  right: 12px;
}

.nav.disabled {
  cursor: not-allowed;
  background: #dcdfe6;
}
</style>
