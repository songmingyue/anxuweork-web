// 运行时读取 window.__APP_ENV__，避免源码内联具体环境值
// 在 index.html 中于 <script type="module" src="/src/main.ts"></script> 之前插入 <script src="/runtime-env.js"></script>
// 或者在 main.ts 顶部动态加载。

interface RuntimeEnv {
  [key: string]: string
}

export function getRuntimeEnv(): RuntimeEnv {
  return (window as any).__APP_ENV__ || {}
}

export function getEnv(key: string, fallback = ''): string {
  const env = getRuntimeEnv()
  return env[key] ?? fallback
}

export function isDev(): boolean {
  return getEnv('VITE_NODE_ENV') === 'development'
}

export function getApiBasePath(): string {
  return getEnv('VITE_API_BASE_PATH')
}

// 示例：在 axios 等模块中改为使用 getApiBasePath() 取值
