import 'vue/jsx'

// 引入windi css

// 导入全局的svg图标
import '@/plugins/svgIcon'

// 引入状态管理
import { setupStore } from '@/store'

// 全局组件
import { setupGlobCom } from '@/components'

// 引入element-plus
import { setupElementPlus } from '@/plugins/elementPlus'

// 引入全局样式
import '@/styles/index.less'

// vue-computer 的样式文件在 dist/assets 下带 hash，这里用 glob 自动引入
import.meta.glob('/node_modules/vue-computer/dist/assets/*.css', { eager: true })

// 引入动画
import '@/plugins/animate.css'

// 路由
import { setupRouter } from './router'

// 权限
import { setupPermission } from './directives'

import { createApp } from 'vue'

import App from './App.vue'

import './permission'
import './assets/iconfont/iconfont.js'

// 创建实例
const setupAll = async () => {
  const app = createApp(App)

  setupStore(app)

  setupGlobCom(app)

  setupElementPlus(app)

  setupRouter(app)

  setupPermission(app)

  app.mount('#app')
}

setupAll()
