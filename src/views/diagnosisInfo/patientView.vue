<template>
  <div class="checkinfo-layout" :class="{ zoomed }">
    <!-- 左侧：树状结构 -->
    <aside class="left" v-show="!zoomed">
      <div class="tree-header">
        <el-input v-model="treeFilter" placeholder="病例号/姓名/类型" clearable />
      </div>
      <el-tree
        class="tree"
        :data="treeData"
        :props="{ label: 'label', children: 'children' }"
        node-key="id"
        :filter-node-method="filterNode"
        ref="treeRef"
        highlight-current
        @node-click="onNodeClick"
      />
      <!-- 底部分页占位（可接真实分页） -->
      <div class="tree-footer">
        <span>1 / 2058</span>
        <span class="muted">共 41152 条</span>
      </div>
    </aside>

    <!-- 右侧：内容 + 浮动功能图标 -->
    <section class="right">
      <div class="float-tools">
        <el-tooltip content="纸质报告" placement="bottom">
          <el-button
            :type="view === 'report' ? 'primary' : 'default'"
            circle
            size="small"
            @click="view = 'report'"
            >报</el-button
          >
        </el-tooltip>
        <el-tooltip content="影像" placement="bottom">
          <el-button
            :type="view === 'image' ? 'primary' : 'default'"
            circle
            size="small"
            @click="view = 'image'"
            >影</el-button
          >
        </el-tooltip>
        <el-tooltip content="胶片" placement="bottom">
          <el-button
            :type="view === 'film' ? 'primary' : 'default'"
            circle
            size="small"
            @click="view = 'film'"
            >片</el-button
          >
        </el-tooltip>
        <el-tooltip content="申请单" placement="bottom">
          <el-button
            :type="view === 'order' ? 'primary' : 'default'"
            circle
            size="small"
            @click="view = 'order'"
            >申</el-button
          >
        </el-tooltip>
        <el-tooltip :content="zoomed ? '缩小' : '放大'" placement="bottom">
          <el-button circle size="small" @click="toggleZoom">{{ zoomed ? '小' : '大' }}</el-button>
        </el-tooltip>
      </div>

      <div class="content">
        <!-- 纸质报告（图1效果：整页报告） -->
        <div v-if="view === 'report'" class="pane center">
          <img class="report-img" :src="reportPreview" alt="report" />
          <div class="page-indicator">1 / 1</div>
        </div>

        <!-- 影像预览（占位，可替换为真正影像组件/iframe） -->
        <div v-else-if="view === 'image'" class="pane center">
          <img class="image-img" :src="imagePreview" alt="image" />
        </div>

        <!-- 胶片预览占位 -->
        <div v-else-if="view === 'film'" class="pane center">
          <el-empty description="胶片预览占位（接入你的渲染组件）" />
        </div>

        <!-- 申请单预览占位（图2右侧信息样式） -->
        <div v-else class="pane form-like">
          <el-card shadow="never">
            <template #header>患者信息</template>
            <div class="kv">
              <div
                ><label>姓名</label><span>{{ detail.name }}</span></div
              >
              <div
                ><label>年龄</label><span>{{ detail.age }}</span></div
              >
              <div
                ><label>性别</label><span>{{ detail.sex }}</span></div
              >
              <div
                ><label>病例号</label><span>{{ detail.caseNo }}</span></div
              >
            </div>
          </el-card>
          <el-card shadow="never" class="mt8">
            <template #header>检查信息</template>
            <div class="kv">
              <div
                ><label>检查类型</label><span>{{ detail.modality }}</span></div
              >
              <div
                ><label>检查项目</label><span>{{ detail.item }}</span></div
              >
              <div
                ><label>检查时间</label><span>{{ detail.examTime }}</span></div
              >
              <div
                ><label>机构名称</label><span>{{ detail.org }}</span></div
              >
            </div>
          </el-card>
          <el-card shadow="never" class="mt8">
            <template #header>报告信息</template>
            <div class="kv">
              <div
                ><label>报告医生</label><span>{{ detail.reportDoctor || '-' }}</span></div
              >
              <div
                ><label>报告时间</label><span>{{ detail.reportTime || '-' }}</span></div
              >
              <div
                ><label>审核医生</label><span>{{ detail.reviewDoctor || '-' }}</span></div
              >
              <div
                ><label>修改时间</label><span>{{ detail.modifyTime || '-' }}</span></div
              >
            </div>
          </el-card>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElTree, ElInput, ElButton, ElTooltip, ElCard, ElEmpty } from 'element-plus'

// 左侧树
const treeRef = ref<InstanceType<typeof ElTree> | null>(null)
const treeFilter = ref('')
const treeData = ref<any[]>([
  {
    id: 'p1',
    label: '赵春香 1979-09-12',
    children: [{ id: 'e1', label: 'CR 左髋正位', payload: { examNo: '00001660', modality: 'DR' } }]
  },
  {
    id: 'p2',
    label: '杨思涵 2011-09-04',
    children: [{ id: 'e2', label: 'CR 左踝正侧位', payload: { examNo: '0000093', modality: 'CR' } }]
  }
])
function filterNode(val: string, data: any) {
  if (!val) return true
  return data.label?.toLowerCase().includes(val.toLowerCase())
}
watch(treeFilter, (v) => treeRef.value?.filter(v))
function onNodeClick() {
  // 选中某检查，切到报告视图并更新预览资源（占位）
  view.value = 'report'
  reportPreview.value = 'https://picsum.photos/1100/1500?random=1'
}

// 右侧视图与资源
const view = ref<'report' | 'image' | 'film' | 'order'>('report')
const zoomed = ref(false)
function toggleZoom() {
  zoomed.value = !zoomed.value
}

const reportPreview = ref('https://picsum.photos/1100/1500?grayscale')
const imagePreview = ref('https://picsum.photos/1200/800')

// 申请单/右侧信息占位
const detail = reactive({
  name: '杨思涵',
  age: '14岁',
  sex: '女',
  caseNo: '0000002',
  modality: 'CR',
  item: '左踝正侧位',
  examTime: '2024/9/4 2:28:47',
  org: '哈尔滨市方正县人民医院',
  reportDoctor: '',
  reportTime: '',
  reviewDoctor: '',
  modifyTime: ''
})
</script>

<style scoped>
.checkinfo-layout {
  display: flex;
  height: calc(100vh - 20px);
  margin-bottom: 20px;
  overflow: hidden;
  background: #fff;
}

/* 左侧树 */
.left {
  display: flex;
  min-width: 260px;
  border-right: 1px solid #ebeef5;
  flex: 0 0 300px;
  flex-direction: column;
}

.tree-header {
  padding: 8px;
  border-bottom: 1px solid #ebeef5;
}

.tree {
  flex: 1;
  padding: 6px 8px;
  overflow: auto;
}

.tree-footer {
  display: flex;
  height: 36px;
  padding: 0 10px;
  color: #909399;
  border-top: 1px solid #ebeef5;
  align-items: center;
  justify-content: space-between;
}

.tree-footer .muted {
  color: #b1b3b8;
}

/* 右侧 */
.right {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 浮动功能图标（放大后仍保留） */
.float-tools {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

/* 内容区域 */
.content {
  position: relative;
  min-height: 0;
  flex: 1;
}

.pane {
  width: 100%;
  height: 100%;
}

.pane.center {
  position: relative;
  display: flex;
  overflow: auto;
  align-items: center;
  justify-content: center;
}

.report-img,
.image-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.page-indicator {
  position: absolute;
  bottom: 8px;
  left: 50%;
  padding: 2px 6px;
  font-size: 12px;
  color: #409eff;
  background: rgb(255 255 255 / 90%);
  border-radius: 3px;
  transform: translateX(-50%);
}

/* 申请单信息样式 */
.form-like {
  padding: 12px;
  overflow: auto;
}

.kv {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 8px 16px;
}

.kv label {
  margin-right: 6px;
  color: #909399;
}

/* 放大模式：只显示右侧内容，占满全屏 */
.checkinfo-layout.zoomed .left {
  display: none;
}

.checkinfo-layout.zoomed .right {
  width: 100%;
}
</style>
