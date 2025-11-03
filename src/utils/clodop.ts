// Lightweight C-Lodop loader and simple print helpers

declare global {
  interface Window {
    getCLodop?: () => any
    CLODOP?: any
    LODOP?: any
  }
}

const SCRIPT_IDS = {
  http1: 'clodop-script-http-8000',
  http2: 'clodop-script-http-18000'
}

const CLODOP_SCRIPT_URLS = [
  { id: SCRIPT_IDS.http1, src: 'http://localhost:8000/CLodopfuncs.js?priority=1' },
  { id: SCRIPT_IDS.http2, src: 'http://localhost:18000/CLodopfuncs.js?priority=0' }
]

function appendScriptOnce(id: string, src: string): void {
  if (document.getElementById(id)) return
  const s = document.createElement('script')
  s.id = id
  s.src = src
  s.async = true
  s.type = 'text/javascript'
  document.head.appendChild(s)
}

export async function ensureCLodop(timeout = 3000): Promise<any | undefined> {
  // Already loaded
  if (typeof window.getCLodop === 'function') {
    try {
      const LODOP = window.getCLodop()
      if (LODOP) return LODOP
    } catch (_) {
      // fallthrough to (re)load
    }
  }
  // Inject scripts (both http/https, multiple ports)
  CLODOP_SCRIPT_URLS.forEach((u) => appendScriptOnce(u.id, u.src))

  const start = Date.now()
  // Polling until available or timeout
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      try {
        if (typeof window.getCLodop === 'function') {
          const LODOP = window.getCLodop()
          if (LODOP) {
            clearInterval(timer)
            resolve(LODOP)
          }
        }
      } catch (_) {
        // ignore
      }
      if (Date.now() - start > timeout) {
        clearInterval(timer)
        resolve(undefined)
      }
    }, 200)
  })
}

const MIN_VERSION = '4.1.9.7'

function cmpVersion(a: string, b: string): number {
  const as = (a || '').split('.').map((n) => parseInt(n, 10) || 0)
  const bs = (b || '').split('.').map((n) => parseInt(n, 10) || 0)
  const len = Math.max(as.length, bs.length)
  for (let i = 0; i < len; i++) {
    const av = as[i] || 0
    const bv = bs[i] || 0
    if (av > bv) return 1
    if (av < bv) return -1
  }
  return 0
}

export async function detectCLodop(timeout = 1200): Promise<{
  installed: boolean
  needsUpgrade: boolean
  version?: string
}> {
  const lodop = await ensureCLodop(timeout)
  if (!lodop) return { installed: false, needsUpgrade: false }
  const version: string | undefined = (lodop.CVERSION as string) || (lodop.VERSION as string)
  if (!version) return { installed: true, needsUpgrade: false }
  const needsUpgrade = cmpVersion(version, MIN_VERSION) < 0
  return { installed: true, needsUpgrade, version }
}

export type PrintImageOptions = {
  mode?: 'preview' | 'print'
  margin?: number // mm, 当前实现对 ADD_PRINT_IMAGE 仅做 Top/Left 边距
}

function toLodopImageParam(src: string): string {
  if (!src) return src
  // 远程 URL 使用 URL: 前缀；data: 协议直接传入
  if (/^https?:\/\//i.test(src)) return 'URL:' + src
  return src
}

export function printImages(LODOP: any, dataUrls: string[], options: PrintImageOptions = {}): void {
  if (!LODOP || !Array.isArray(dataUrls) || dataUrls.length === 0) return
  const margin = options.margin ?? 0
  LODOP.PRINT_INIT('Image Print')
  // 拉伸铺满页面，等比缩放
  LODOP.SET_PRINT_MODE('PRINT_PAGE_PERCENT', 'Auto-Width')
  dataUrls.forEach((src, idx) => {
    if (idx > 0) LODOP.NEWPAGEA()
    const imgParam = toLodopImageParam(src)
    LODOP.ADD_PRINT_IMAGE(`${margin}mm`, `${margin}mm`, '100%', '100%', imgParam)
    LODOP.SET_PRINT_STYLEA(0, 'Stretch', 2)
  })
  if (options.mode === 'print') LODOP.PRINT()
  else LODOP.PREVIEW()
}

export type PrintHtmlOptions = {
  mode?: 'preview' | 'print'
  margin?: number // mm
  title?: string
}

export function printHtml(LODOP: any, html: string, options: PrintHtmlOptions = {}): void {
  if (!LODOP || !html) return
  const margin = options.margin ?? 10
  LODOP.PRINT_INIT(options.title || 'HTML Print')
  LODOP.SET_PRINT_MODE('AUTO_CLOSE_PREWINDOW', true)
  LODOP.ADD_PRINT_HTM(`${margin}mm`, `${margin}mm`, 'RightMargin:10mm', 'BottomMargin:10mm', html)
  if (options.mode === 'print') LODOP.PRINT()
  else LODOP.PREVIEW()
}
