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

    <section class="content">
      <div class="nav left" :class="{ disabled: !canPrev }" @click="prev">‹</div>

      <div class="panel">
        <!-- 1 数据库配置 -->
        <div v-if="curr === 0" class="pane">
          <el-card>
            <strong>说明:</strong>
            <span class="title-tips"
              >该配置页面用于集成平台数据库配置,为方便配置已根据常用配置默认填充,当前安装环境无数据库配置时选择全新安装,
              请根据实际业务场景完成配置,点击确定提交后即可生效</span
            >
          </el-card>
          <el-card class="mt-10">
            <el-form
              ref="dbFormRef"
              :model="dbForm"
              :rules="dbFormRule"
              label-width="160px"
              class="form"
            >
              <el-form-item label="数据库安装类型" prop="dbInstallType">
                <el-select v-model="dbForm.dbInstallType" placeholder="请选择">
                  <el-option label="升级安装" value="0" />
                  <el-option label="全新安装" value="1" />
                </el-select>
              </el-form-item>
              <el-form-item label="数据库类型" prop="dbType">
                <el-select v-model="dbForm.dbType" placeholder="请选择">
                  <el-option label="MySql" value="0" />
                  <el-option label="SqlServer" value="1" />
                  <el-option label="Sqlite" value="2" />
                  <el-option label="Oracle" value="3" />
                  <el-option label="PostgreSQL" value="4" />
                  <el-option label="达梦" value="5" />
                </el-select>
              </el-form-item>
              <el-form-item label="主从关系" prop="lsSlave">
                <el-input v-model="dbForm.lsSlave" placeholder="可留空" />
              </el-form-item>
              <el-form-item label="数据库服务器IP" required prop="dataSource">
                <el-input v-model="dbForm.dataSource" placeholder="127.0.0.1" />
              </el-form-item>
              <el-form-item label="数据库名称" required prop="initialCatalog">
                <el-input v-model="dbForm.initialCatalog" placeholder="IMCIS" />
              </el-form-item>
              <el-form-item label="用户名" required prop="userId">
                <el-input v-model="dbForm.userId" placeholder="sa" />
              </el-form-item>
              <el-form-item label="密码" required prop="password">
                <!-- 隐藏的占位密码输入，诱导浏览器不要自动填充下面真实输入框 -->
                <input
                  type="password"
                  class="hidden-pwd-dummy"
                  autocomplete="new-password"
                  aria-hidden="true"
                />
                <el-input
                  v-model="dbForm.password"
                  type="password"
                  placeholder="请输入密码"
                  show-password
                  :name="passwordFieldName"
                  autocomplete="new-password"
                  autocapitalize="off"
                  autocorrect="off"
                  spellcheck="false"
                />
              </el-form-item>
              <el-form-item label="数据库服务端口" prop="hostPort">
                <el-input v-model="dbForm.hostPort" placeholder="(可选)" />
              </el-form-item>
              <el-form-item>
                <div class="form-actions">
                  <el-button type="primary" @click="editservice">确定</el-button>
                </div>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <!-- 2 数据库脚本升级 -->
        <div v-else-if="curr === 1" class="pane">
          <el-card>
            <strong>说明:</strong>
            <span class="title-tips"
              >该配置页面用于集成平台数据库脚本升级执行，选择对应脚本后执行即可生效</span
            >
          </el-card>
          <el-card class="mt-10">
            <div class="ddl-wrap">
              <el-card class="ddl-col" shadow="never">
                <template #header>可执行脚本列表</template>
                <el-table
                  ref="scriptTableRef"
                  :data="scriptList"
                  row-key="scriptId"
                  @row-click="onScriptRowClick"
                  @selection-change="onSelectionChange"
                >
                  <el-table-column type="selection" width="48" reserve-selection />
                  <el-table-column prop="scriptId" label="脚本id" width="70" />
                  <el-table-column prop="scriptMemo" label="程序版本" />
                  <el-table-column prop="programVersion" label="脚本版本" />
                </el-table>
                <el-empty v-if="scriptList.length === 0" description="当前无可执行脚本" />
              </el-card>
              <el-card class="ddl-col-detail" shadow="never">
                <template #header>插件详情</template>
                <template v-if="currentDetail">
                  <el-descriptions :column="1" size="small">
                    <el-descriptions-item label="版本id">{{
                      currentDetail.scriptId
                    }}</el-descriptions-item>
                    <el-descriptions-item label="脚本版本号">{{
                      currentDetail.programVersion
                    }}</el-descriptions-item>
                    <el-descriptions-item label="脚本类型">{{
                      currentDetail.scriptType
                    }}</el-descriptions-item>
                    <el-descriptions-item label="程序版本号">{{
                      currentDetail.scriptMemo
                    }}</el-descriptions-item>
                    <el-descriptions-item label="脚本描述">{{
                      currentDetail.scriptDescription
                    }}</el-descriptions-item>
                    <el-descriptions-item label="脚本内容">
                      <div class="script-content">
                        <pre
                          class="pre"
                          @click="copyScriptContent"
                          title="点击复制"
                          v-text="currentDetail.scriptContent"
                        ></pre>
                      </div>
                    </el-descriptions-item>
                  </el-descriptions>
                </template>
                <el-empty v-else description="暂无插件" />
              </el-card>
            </div>
            <div class="form-actions">
              <el-button type="primary" @click="executeScript" class="mt16">执行</el-button>
            </div>
          </el-card>
        </div>

        <!-- 3 log配置（对应第三张图） -->
        <div v-else-if="curr === 2" class="pane">
          <el-card>
            <strong>说明:</strong>
            <span class="title-tips"
              >该配置页面用于集成平台API日志配置,为方便配置已根据常用配置默认填充,请根据实际业务场景完成配置,点击确定提交后即可生效</span
            >
          </el-card>
          <el-card class="mt-10">
            <el-form
              ref="logFormRef"
              :model="logForm"
              :rules="logFormRule"
              label-width="160px"
              class="form"
            >
              <el-form-item label="输出完整路径" prop="file">
                <el-input v-model="logForm.file" placeholder="D:\path\to\Logs\" />
              </el-form-item>
              <el-form-item label="备份文件的个数">
                <el-input v-model="logForm.maxSizeRollBackups" placeholder="100" />
              </el-form-item>
              <el-form-item label="是否覆盖">
                <el-select v-model="logForm.appendToFile" placeholder="请选择">
                  <el-option label="是" value="true" />
                  <el-option label="否" value="false" />
                </el-select>
              </el-form-item>
              <el-form-item label="最大大小">
                <el-input v-model="logForm.maximumFileSize" placeholder="5MB" />
              </el-form-item>
              <el-form-item label="错误日志布局">
                <el-input disabled v-model="logForm.layoutPattern" placeholder="格式占位符" />
              </el-form-item>
              <el-form-item label="文件创建的方式">
                <el-select v-model="logForm.rollingStyle" disabled>
                  <el-option label="Date" value="Date" />
                  <el-option label="Size" value="Size" />
                </el-select>
              </el-form-item>
              <el-form-item label="日志级别">
                <el-select v-model="logForm.level">
                  <el-option label="Fatal" value="Fatal" />
                  <el-option label="Error" value="Error" />
                  <el-option label="Warn" value="Warn" />
                  <el-option label="Info" value="Info" />
                  <el-option label="Debug" value="Debug" />
                  <el-option label="All" value="All" />
                </el-select>
              </el-form-item>
              <el-form-item label="日期格式" disabled prop="datePattern">
                <el-input v-model="logForm.datePattern" placeholder="yyyyMMdd" />
              </el-form-item>
              <el-form-item>
                <div class="form-actions">
                  <el-button type="primary" @click="editLogConfigList">确定</el-button>
                </div>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <!-- 4 token配置（对应第四张图） -->
        <div v-else class="pane">
          <el-card>
            <strong>说明:</strong>
            <span class="title-tips"
              >该配置页面用于集成平台Token服务配置,请根据实际业务场景完成配置,点击确定提交后即可生效</span
            >
          </el-card>
          <el-card class="mt-10">
            <el-form
              ref="tokenFormRef"
              :model="tokenForm"
              :rules="formRule"
              label-width="140px"
              class="form"
            >
              <el-form-item label="Token服务地址" prop="tokenServer">
                <el-input v-model="tokenForm.tokenServer" placeholder="http://127.0.0.1:8090/" />
              </el-form-item>
              <el-form-item label="机构ID" prop="organizationID">
                <el-input v-model="tokenForm.organizationID" placeholder="请输入机构ID" />
              </el-form-item>
              <el-form-item>
                <div class="form-actions">
                  <el-button type="primary" @click="editTokenConfigList">确定</el-button>
                </div>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </div>

      <div class="nav right" :class="{ disabled: !canNext }" @click="next">›</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formRule, logFormRule, dbFormRule } from './formRule'
import {
  ElTable,
  ElTableColumn,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElButton,
  ElOption,
  ElMessage,
  ElEmpty,
  ElMessageBox,
  ElDescriptions,
  ElDescriptionsItem
} from 'element-plus'
import {
  editservicelist,
  executeScriptBatch,
  getScriptList,
  getservicelist,
  ScriptConfig,
  getLogConfig,
  LogConfig,
  editLogConfig,
  getTokenConfig,
  TokenConfig,
  editTokenConfig
} from '@/api/sysConfig'
import { useUserStore } from '@/store/modules/user'

const steps = [
  { key: 'db', title: '数据库配置' },
  { key: 'ddl', title: '数据库脚本升级' },
  { key: 'log', title: 'log配置' },
  { key: 'token', title: 'token配置' }
]

const dbFormRef = ref<any>(null)
const tokenFormRef = ref<any>(null)
const logFormRef = ref<any>(null)
const curr = ref(0)
const scriptList = ref<ScriptConfig[]>([])
const selectedScript = ref<ScriptConfig | null>(null)
const scriptTableRef = ref<any>(null)
const canPrev = computed(() => curr.value > 0)
const canNext = computed(() => curr.value < steps.length - 1)
function goto(i: number) {
  curr.value = Math.max(0, Math.min(steps.length - 1, i))
  switch (i) {
    case 0:
      // 获取数据库配置
      getservice()
      break
    case 1:
      // 获取脚本列表
      getScript()
      break
    case 2:
      // 获取log配置
      getConfigList()
      break
    case 3:
      getTokenConfigList()
      break
  }
}
function prev() {
  if (canPrev.value) goto(curr.value - 1)
}
function next() {
  if (canNext.value) goto(curr.value + 1)
}

// 简单的表单模型（按需替换为你的实际数据）
const dbForm = ref<any>({})
const logForm = ref<LogConfig>({})
const tokenForm = ref<TokenConfig>({
  tokenServer: '',
  organizationID: '',
  accessToken: ''
})
// 随机化密码输入的 name，进一步降低浏览器自动填充概率
const passwordFieldName = ref('pwd_' + Math.random().toString(36).slice(2))
const userStore = useUserStore()
const editservice = async () => {
  dbFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      ElMessageBox.confirm(
        '此操作将根据当前配置数据重置服务器数据,并在配置成功后返回登录页面, 是否继续?',
        '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(async () => {
          const { isSuccess, message } = await editservicelist(dbForm.value)
          if (isSuccess) {
            ElMessage.success(message || '操作成功')
            userStore.logoutConfirm()
          } else {
            ElMessage.error(message || '操作失败')
          }
        })
        .catch(() => {
          // 取消操作
        })
    }
  })
}

const getScript = async () => {
  scriptList.value = []
  const { isSuccess, data, message } = await getScriptList()
  if (isSuccess) {
    scriptList.value = data
    selectedScript.value = data && data.length > 0 ? data[0] : null
  } else {
    ElMessage.warning(message || '操作失败')
  }
}

const getConfigList = async () => {
  const { data, isSuccess, message } = await getLogConfig()
  if (isSuccess) {
    logForm.value = data[0]
  } else {
    ElMessage.warning(message || '操作失败')
  }
}
const editLogConfigList = async () => {
  logFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    const { isSuccess, message } = await editLogConfig(logForm.value)
    if (isSuccess) {
      ElMessage.success(message || '操作成功')
    } else {
      ElMessage.error(message || '操作失败')
    }
  })
}
// 左侧表格行点击，展示右侧详情
const onScriptRowClick = (row: ScriptConfig) => {
  selectedScript.value = row
}
const selectList = ref<number[]>([])

// 根据“选中最大ID -> 自动勾选所有更小ID”的规则，规范化当前选择集
const onSelectionChange = (selection: ScriptConfig[]) => {
  // 找最大的
  const id: number = selection[selection.length - 1]?.scriptId || 0
  const shouldSelect = scriptList.value.filter(
    (item: ScriptConfig) => (item.scriptId as number) <= id
  )
  selectList.value = shouldSelect.map((s) => s.scriptId as number)
  const unShouldSelect = scriptList.value.filter(
    (item: ScriptConfig) => (item.scriptId as number) > id
  )
  // 按要求：把 shouldSelect 里的都选中
  if (scriptTableRef.value) {
    shouldSelect.forEach((r) => scriptTableRef.value.toggleRowSelection(r, true))
    unShouldSelect.forEach((r) => scriptTableRef.value.toggleRowSelection(r, false))
  }
}
// 归一化详情结构，兼容后端字段大小写及变体
const currentDetail = computed(() => {
  return selectedScript.value
})
// 点击复制脚本内容
const copyScriptContent = async () => {
  const text = currentDetail.value?.scriptContent || ''
  if (!text) {
    ElMessage.warning('无脚本内容可复制')
    return
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    ElMessage.success('脚本内容已复制')
  } catch (e) {
    ElMessage.error('复制失败，请手动复制')
  }
}
// 获取服务配置
const getservice = async () => {
  const { data } = await getservicelist()
  dbForm.value = data[0]
  setTimeout(() => {
    dbForm.value.password = data[0].password
  }, 1000)
}
const executeScript = async () => {
  console.log('selectList:', selectList.value)
  ElMessageBox.confirm(`确定要执行所选脚本吗？${selectList.value.join(', ')}`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async (res) => {
    if (res) {
      const { isSuccess, message } = await executeScriptBatch({
        scriptIDs: selectList.value.join(',')
      })
      if (isSuccess) {
        getScriptList()
        ElMessage.success(message || '操作成功')
      } else {
        ElMessage.error(message || '操作失败')
      }
    }
  })
}
// 获取token配置
const getTokenConfigList = async () => {
  const { data } = await getTokenConfig()
  tokenForm.value = data[0]
}
// 编辑token配置
const editTokenConfigList = async () => {
  tokenFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    submitTokenConfig()
  })
}
const submitTokenConfig = async () => {
  ElMessageBox.confirm(
    '此操作将根据当前配置数据重置token配置,并在配置成功后返回登录页面, 是否继续?',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    const { isSuccess, message } = await editTokenConfig(tokenForm.value)
    if (isSuccess) {
      ElMessage.success(message || '操作成功')
    } else {
      ElMessage.error(message || '操作失败')
    }
  })
}
onMounted(() => {
  getservice()
})
</script>

<style scoped>
/* 整页高度=视口-20px，底部留白20px，无滚动条 */
.sys-config-layout {
  display: flex;
  height: calc(100vh - 80px);
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
  margin-top: 60px;
  margin-bottom: 90px;
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
  padding: 10px 30px;
  margin-top: 15px;
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
  min-width: 550px;
  padding: 0;
  margin-left: 10px;
  overflow: hidden; /* 不出现滚动条 */
  background: white;
  box-sizing: border-box;
  flex: 1;
  align-items: stretch;
}

.panel {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 10px;
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
  height: 100%;
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
  display: flex;
  height: 100%;
  gap: 10px;
  flex: 1; /* 占满剩余高度 */
  min-height: 360px;
}

.ddl-col {
  width: 310px;
  min-height: 360px;
}

.ddl-col-detail {
  flex: 1;
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

.mt-10 {
  margin-top: 10px;
  flex: 1;
}

.title-tips {
  margin-left: 7px;
  font-size: 14px;
  color: #999;
}

/* 表单操作区：右对齐“确定”按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 10px;
}

/* 隐藏的占位密码输入，避免浏览器自动填充真实密码框 */
.hidden-pwd-dummy {
  position: absolute;
  width: 0;
  height: 0;
  padding: 0;
  margin: 0;
  pointer-events: none;
  border: 0;
  opacity: 0;
}

/* 可点击复制的脚本内容样式 */
.pre {
  padding: 8px 10px;
  word-break: break-word;
  white-space: pre-wrap;
  cursor: pointer;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.script-content {
  max-height: calc(100vh - 560px);
  overflow-y: auto;
}
</style>
