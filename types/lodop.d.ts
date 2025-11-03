// Minimal global declarations for C-Lodop to satisfy TypeScript
// See: http://www.lodop.net/

declare interface LodopInstance {
  PRINT_INIT?(title?: string): void
  SET_PRINT_MODE?(name: string, value: any): void
  ADD_PRINT_HTM?(top: any, left: any, width: any, height: any, html: string): void
  ADD_PRINT_IMAGE?(top: any, left: any, width: any, height: any, src: string): void
  NEWPAGEA?(): void
  PREVIEW?(): void
  PRINT?(): string | void
}

declare interface Window {
  getCLodop?: () => LodopInstance | undefined
  CLODOP?: any
  LODOP?: LodopInstance
}

export {}
