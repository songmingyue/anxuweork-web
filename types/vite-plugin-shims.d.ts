declare module 'vite-plugin-eslint' {
  import type { PluginOption } from 'vite'
  const plugin: (options?: any) => PluginOption
  export default plugin
}

declare module 'vite-plugin-purge-icons' {
  import type { PluginOption } from 'vite'
  const plugin: (options?: any) => PluginOption
  export default plugin
}
