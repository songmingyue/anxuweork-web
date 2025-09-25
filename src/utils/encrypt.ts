import forge from 'node-forge'

import protobuf from 'protobufjs'
import { ElMessage } from 'element-plus'
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
  const baseProtType = ['AdminLoginUserInfoProto']
  const isBaseType = baseProtType.includes(protoType) ? true : false
  const MessageType = isBaseType ? root.lookupType('BaseResponse') : root.lookupType('PageResponse')
  const message: any = MessageType.decode(new Uint8Array(buffer))
  if (!message.isSuccess) {
    ElMessage.error(message.message || 'Error')
    throw new Error(message.message || 'Error')
    return {}
  } else {
    const dataType = root.lookupType(protoType)
    if (!isBaseType && message.data) {
      message.data = message.data.map((item) => {
        return dataType.decode(item.value)
      })
    } else {
      message.data = dataType.decode(message.data.value)
    }
    return message.data
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
