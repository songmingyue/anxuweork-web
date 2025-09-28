<template>
  <div class="sys-param">
    <el-collapse v-model="activeNames">
      <el-collapse-item v-for="g in groups" :key="g.key" :name="g.key" class="group">
        <template #title>
          <div class="collapse-title">
            <i :class="['hdr-icon', g.icon]" />
            <span class="title">{{ g.title }}</span>
          </div>
        </template>

        <div class="group-body">
          <el-row v-for="item in items[g.key]" :key="item.key" :gutter="40" class="cfg-item">
            <el-col :span="8" :xs="10" class="flex-col"
              ><div class="name">{{ item.name }}</div></el-col
            >
            <el-col :span="10" :xs="10" class="flex-col">
              <div v-if="item.desc" class="desc">{{ item.desc }}</div>
            </el-col>

            <el-col :span="6" :xs="4" class="flex-col">
              <div class="float-right">
                <el-button type="primary" size="small" @click="onConfig(item)"> 配置 </el-button>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElCollapse, ElCollapseItem, ElButton, ElCol, ElRow } from 'element-plus'

type CfgItem = { key: string; name: string; desc?: string }
type GroupKey = 'plugin' | 'archive' | 'exam' | 'system' | 'province' | 'others'

const groups = [
  { key: 'plugin', title: '插件', icon: 'i-plugin' },
  { key: 'archive', title: '归档', icon: 'i-archive' },
  { key: 'exam', title: '检查', icon: 'i-exam' },
  { key: 'system', title: '系统', icon: 'i-system' },
  { key: 'province', title: '省平台', icon: 'i-gov' },
  { key: 'others', title: '其他平台', icon: 'i-others' }
] as { key: GroupKey; title: string; icon: string }[]

const items: Record<GroupKey, CfgItem[]> = {
  // 插件（图2）
  plugin: [
    {
      key: 'split-task',
      name: '拆分任务插入上传和推送表配置',
      desc: '区分插入上传任务/推送任务，第三方调用检查推送接口采集(任务插入)也在此配置'
    },
    {
      key: 'charge-default',
      name: '采集或推送接收收费状态默认值配置',
      desc: '初次采集/推送，如果检查采集视图中收费状态为空；或者对方推送检查的时候收费状态为空，则此配置在不为空的情况下起作用，如果为空，则默认已经收费。如果后面采集同一个检查（数据库中已经存在同样检查记录），收费状态为空，则还是按照初次采集一样赋值收费状态，然后，再判断：如果不从his查询收费状态并且系统参数中默认值为空，则不更新收费状态。否则，更新。如果从his查询，则按照his的值来更新，如果his中的收费状态查出来为空，则按照初次采集一样赋值收费状态，然后更新收费状态。'
    },
    { key: 'collect-host', name: '采集程序服务地址' },
    { key: 'collect-name', name: '采集服务安装名称' },
    { key: 'upload-name', name: '上传服务安装名称' },
    { key: 'upload-host', name: '上传程序服务地址' },
    { key: 'upload-proxy', name: '上传程序经过网闸时的地址', desc: '用于调用上传程序中的接口' },
    { key: 'qr-client', name: '集成端调二维吗地址配置' },
    {
      key: 'push-endpoint',
      name: '推送功能接收端地址',
      desc: '接收检查、报告、影像、胶片推送的上级/集成API地址'
    },
    { key: 'del-film', name: '按需打印删除胶片接口地址' },
    { key: 'rk-qr', name: '瑞康医院二维码服务配置' },
    { key: 'self-api', name: '集成平台自身api地址' }
  ],
  // 归档（图3）
  archive: [{ key: 'pacs', name: 'PACS相关功能配置', desc: 'cmove, cstore 等接收端配置' }],
  // 检查（图4）
  exam: [
    { key: 'cloud-autodl', name: '浏览报告自动从云端下载' },
    { key: 'cloud-autodl-flag', name: '浏览报告时，是否自动从云端下载' },
    { key: 'mobile-url', name: '集成平台移动端地址' },
    { key: 'cloud-parent', name: '从云端下载报告的上级地址' },
    { key: 'viewer-read', name: '影像浏览器读取配置' },
    { key: 'viewer-read-2', name: '影像浏览器读取配置' },
    { key: 'repeat-print', name: '前端页面是否可以重复打印报告' },
    { key: 'internet', name: '互联网互通配置' },
    { key: 'confirm-mode', name: '检查确定方式' },
    { key: 'export-conf', name: '检查信息表格导出配置' }
  ],
  // 系统（图5）
  system: [
    { key: 'disk-top', name: '磁盘使用最高百分比' },
    { key: 'print', name: '打印相关配置' },
    { key: 'dicom-node', name: 'Dicom节点配置' }
  ],
  // 省平台（图6）
  province: [
    { key: 'zj-1', name: '浙江省平台相关配置' },
    { key: 'zj-2', name: '浙江省平台相关配置' },
    { key: 'hn-1', name: '河南省平台相关配置' },
    { key: 'hn-2', name: '河南省平台相关配置' }
  ],
  // 其他平台（图7）
  others: [
    { key: 'msg-1', name: '消息系统配置' },
    { key: 'msg-2', name: '消息系统配置' }
  ]
}

// 默认全部收起；如需默认展开某些，填入对应 key 数组
const activeNames = ref<GroupKey[]>([])

function onConfig(item: CfgItem) {
  ElMessage.info(`配置：${item.name}`)
}
</script>

<style scoped>
.sys-param {
  padding: 12px 16px;
  background: #fff;
}

/* 折叠标题 */
.collapse-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hdr-icon {
  display: inline-block;
  width: 28px;
  height: 28px;
  background: #f2f3f5;
  border-radius: 6px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 内容 */
.group-body {
  padding: 8px 0 18px;
}

.cfg-item {
  padding: 15px 0 15px 30px;
  padding-left: 30px;
  border-top: 1px solid #f0f2f5;
}

.cfg-item .text {
  min-width: 0;
  margin-right: 12px;
}

.cfg-item .name {
  display: flex;
  font-size: 15px;
  color: #303133;
}

.cfg-item .desc {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

/* 简单图标占位（可替换为真实图标库） */
.i-plugin::before {
  display: inline-flex;
  content: '🧩';
  align-items: center;
  justify-content: center;
}

.i-archive::before {
  content: '📄';
}

.i-exam::before {
  content: '🔎';
}

.i-system::before {
  content: '🖥️';
}

.i-gov::before {
  content: '🏛️';
}

.i-others::before {
  content: '🧱';
}

.hdr-icon::before {
  display: flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
}

.flex-col {
  display: flex !important;
  flex-direction: row;
  place-items: center center;
  justify-content: center;
}
</style>
