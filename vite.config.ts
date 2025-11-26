import { resolve } from 'path'
import { readFileSync } from 'fs'
import { loadEnv } from 'vite'
import type { UserConfig, ConfigEnv } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import progress from 'vite-plugin-progress'
import EslintPlugin from 'vite-plugin-eslint'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import { viteMockServe } from 'vite-plugin-mock'
import PurgeIcons from 'vite-plugin-purge-icons'
import ServerUrlCopy from 'vite-plugin-url-copy'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { createStyleImportPlugin, ElementPlusResolve } from 'vite-plugin-style-import'
import { visualizer } from 'rollup-plugin-visualizer'
import type { Plugin } from 'vite'

// https://vitejs.dev/config/
const root = process.cwd()

function pathResolve(dir: string) {
  return resolve(root, '.', dir)
}

export default ({ command, mode }: ConfigEnv): UserConfig => {
  let env = {} as any
  const isBuild = command === 'build'
  if (!isBuild) {
    env = loadEnv(process.argv[3] === '--mode' ? process.argv[4] : process.argv[3], root)
  } else {
    env = loadEnv(mode, root)
  }
  return {
    base: env.VITE_BASE_PATH,
    plugins: [
      // 自定义插件：将 .env 中的 VITE_ 前缀变量生成为运行时可加载的文件，而不是直接内联
      runtimeEnvPlugin(env),
      // 额外产出一份源码级 config.ts 到 dist 根目录
      Vue({
        script: {
          // 开启defineModel
          defineModel: true
        }
      }),
      VueJsx(),
      ServerUrlCopy(),
      progress(),
      env.VITE_USE_ALL_ELEMENT_PLUS_STYLE === 'false'
        ? createStyleImportPlugin({
            resolves: [ElementPlusResolve()],
            libs: [
              {
                libraryName: 'element-plus',
                esModule: true,
                resolveStyle: (name) => {
                  if (name === 'click-outside') {
                    return ''
                  }
                  return `element-plus/es/components/${name.replace(/^el-/, '')}/style/css`
                }
              }
            ]
          })
        : undefined,
      EslintPlugin({
        cache: false,
        failOnWarning: false,
        failOnError: false,
        include: ['src/**/*.vue', 'src/**/*.ts', 'src/**/*.tsx'] // 检查的文件
      }),
      createSvgIconsPlugin({
        iconDirs: [pathResolve('src/assets/svgs')],
        symbolId: 'icon-[dir]-[name]',
        svgoOptions: true
      }),
      PurgeIcons(),
      env.VITE_USE_MOCK === 'true'
        ? viteMockServe({
            ignore: /^\_/,
            mockPath: 'mock',
            localEnabled: !isBuild,
            prodEnabled: isBuild,
            injectCode: `
          import { setupProdMockServer } from '../mock/_createProductionServer'

          setupProdMockServer()
          `
          })
        : undefined,
      ViteEjsPlugin({
        title: env.VITE_APP_TITLE
      })
    ],

    css: {
      preprocessorOptions: {
        less: {
          additionalData: '@import "./src/styles/variables.module.less";',
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.less', '.css'],
      alias: [
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.cjs.js'
        },
        {
          find: /\@\//,
          replacement: `${pathResolve('src')}/`
        }
      ]
    },
    esbuild: {
      target: 'es2022', // enable top-level await in esbuild transform
      pure: env.VITE_DROP_CONSOLE === 'true' ? ['console.log'] : undefined,
      drop: env.VITE_DROP_DEBUGGER === 'true' ? ['debugger'] : undefined
    },
    build: {
      // Top-level await requires modern targets (ES2022+). If you need legacy support,
      // consider using a transform plugin instead.
      target: 'es2022',
      outDir: env.VITE_OUT_DIR || 'dist',
      sourcemap: env.VITE_SOURCEMAP === 'true',
      // brotliSize: false,
      rollupOptions: {
        plugins: env.VITE_USE_BUNDLE_ANALYZER === 'true' ? [visualizer()] : undefined,
        // 拆包
        output: {
          manualChunks: {
            'vue-chunks': ['vue', 'vue-router', 'pinia', 'vue-i18n'],
            'element-plus': ['element-plus'],
            'wang-editor': ['@wangeditor/editor', '@wangeditor/editor-for-vue'],
            echarts: ['echarts', 'echarts-wordcloud'],
            // 单独拆出 config，确保生成 js/config-[hash].js
            config: [pathResolve('src/config/index.ts')]
          },
          // JS 输出到 js 目录
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          // 资源分类：css 单独目录，png 单独目录，其它归类到 assets
          assetFileNames: ({ name }) => {
            if (!name) return 'assets/[name]-[hash][extname]'
            const ext = name.split('.').pop()?.toLowerCase()
            if (ext === 'css') {
              return 'css/[name]-[hash][extname]'
            }
            if (ext === 'png') {
              return 'png/[name]-[hash][extname]'
            }
            // 其它静态资源
            return 'assets/[name]-[hash][extname]'
          }
        }
      },
      cssCodeSplit: !(env.VITE_USE_CSS_SPLIT === 'false'),
      cssTarget: ['chrome31']
    },
    server: {
      port: 3001,
      proxy: {
        // 选项写法
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      hmr: {
        overlay: false
      },
      host: '0.0.0.0'
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'vue-types',
        'element-plus/es/locale/lang/zh-cn',
        'element-plus/es/locale/lang/en',
        '@iconify/iconify',
        '@vueuse/core',
        'axios',
        'qs',
        'echarts',
        'echarts-wordcloud',
        'qrcode',
        '@wangeditor/editor',
        '@wangeditor/editor-for-vue',
        'vue-json-pretty',
        '@zxcvbn-ts/core',
        'dayjs',
        'cropperjs'
      ]
    }
  }
}

// 运行时环境变量插件：生成 public/runtime-env.js （构建后位于 dist/runtime-env.js）
function runtimeEnvPlugin(env: Record<string, string>): Plugin {
  // 仅收集 VITE_ 前缀变量
  const viteEnv: Record<string, string> = {}
  Object.keys(env).forEach((key) => {
    if (key.startsWith('VITE_')) {
      viteEnv[key] = env[key]
    }
  })
  let base = '/'
  return {
    name: 'runtime-env-plugin',
    apply: 'build',
    enforce: 'pre',
    configResolved(resolved) {
      base = resolved.base || '/'
    },
    // 将源码中的 import.meta.env.XXX 替换为 window.__APP_ENV__.XXX，避免值被内联到 bundle
    transform(code, id) {
      // 只处理脚本和 Vue 单文件组件
      if (!/(\.(ts|tsx|js|jsx)$|\.vue(\?.*)?$)/.test(id)) return null
      const replaced = code
        .replace(/\bimport\.meta\.env\.(VITE_[A-Z0-9_]+)/g, 'window.__APP_ENV__.$1')
        .replace(/\bimport\.meta\.env\.BASE_URL\b/g, 'window.__APP_ENV__.BASE_URL')
      return replaced === code ? null : { code: replaced, map: null }
    },
    transformIndexHtml(html) {
      // 注入运行时配置脚本，需在应用主脚本之前加载
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: { src: `${base}runtime-env.js` },
            injectTo: 'head-prepend'
          }
        ]
      }
    },
    // 产物阶段生成 runtime-env.js
    generateBundle() {
      // 将 BASE_URL 一并注入，便于在代码中读取
      const payload = { ...viteEnv, BASE_URL: base }
      const code =
        `// 自动生成，构建时写入。不要手动修改\n` +
        `window.__APP_ENV__ = ${JSON.stringify(payload, null, 2)};\n`
      this.emitFile({
        type: 'asset',
        fileName: 'runtime-env.js',
        source: code
      })
    }
  }
}
