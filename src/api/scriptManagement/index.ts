import type { ServiceStatus } from '@/api/dataPage'

export interface ScriptListItem {
  scriptId: string
  programVersion: string
  scriptVersion: string
}

export interface ScriptDetail extends ScriptListItem {
  canAutoExecute: boolean
  description: string
  content: string
}

export interface GetScriptListResponse {
  list: ScriptListItem[]
}

export interface GetScriptDetailResponse {
  detail: ScriptDetail | null
}

// 接口占位：后续接入真实后端时，用 request.get/post 替换这里的实现即可
export const getScriptList = async (): Promise<GetScriptListResponse> => {
  return { list: [] }
}

export const getScriptDetail = async (params: {
  scriptId: string
}): Promise<GetScriptDetailResponse> => {
  void params
  return { detail: null }
}

export const executeScript = async (params: { scriptId: string }): Promise<ServiceStatus> => {
  void params
  return { desc: null, status: 0 }
}

export const deleteScript = async (params: { scriptId: string }): Promise<ServiceStatus> => {
  void params
  return { desc: null, status: 0 }
}
