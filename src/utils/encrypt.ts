import forge from 'node-forge'

import protobuf from 'protobufjs'
import { ElMessage } from 'element-plus'
import { useUserStoreWithOut } from '@/store/modules/user'
const root = await protobuf.load('/storage.proto')
// 用指定公钥字符串加密明文，返回base64

export function encryptWithPublicKey(text: string, pemPublicKey: string): string | null {
  try {
    const pub = forge.pki.publicKeyFromPem(pemPublicKey)
    const encrypted = pub.encrypt(text, 'RSAES-PKCS1-V1_5')
    return forge.util.encode64(encrypted)
  } catch (e) {
    return null
  }
}

export const decodeProtoMsg = (buffer: Uint8Array, protoType: string): any => {
  const MessageType = root.lookupType('PageResponse')
  const message: any = MessageType.decode(new Uint8Array(buffer))
  const userStore = useUserStoreWithOut()
  if (!message.isSuccess) {
    ElMessage.error(message.message || 'Error')
    throw new Error(message.message || 'Error')
    return {}
  } else {
    if (protoType === 'whitelist') {
      if (message?.pageBase?.token) {
        userStore.setToken(message.pageBase.token)
      }
      return message || {}
    }
    const dataType = root.lookupType(protoType)
    if (message.data) {
      if (Array.isArray(message.data)) {
        message.data = message.data.map((item) => {
          return dataType.decode(item.value)
        })
      } else {
        message.data = dataType.decode(message.data.value)
      }
      if (message?.pageBase) {
        message.data = { pageBase: message.pageBase, data: message.data }
        if (message?.pageBase?.token) {
          userStore.setToken(message.pageBase.token)
        }
      }
      message.data = Object.assign(
        { message: message.message, isSuccess: message.isSuccess },
        message.data
      )
      return message.data
    } else {
      return {}
    }
  }
  // const
}

export const encodeProtoMsg = (obj: any, protoType: string): any => {
  const MessageType = root.lookupType(protoType)
  const message = MessageType.create(obj)
  const buffer: any = MessageType.encode(message).finish()
  const blobArray = new Blob([buffer], { type: 'application/octet-stream' })
  return blobArray
}
