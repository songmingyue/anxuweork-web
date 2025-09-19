import forge from 'node-forge'
// 用指定公钥字符串加密明文，返回base64
const pemPublicKey = `-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQClGFhjo0jp58mv6TU2otYfi1LY\nYUw+jSpq8R1odfv3hrZJ5srOnb9cfeHoxk8Mq92I1o7kGFIu54gMsWNZoBH2kkcn\n0Yd7xaBWyEjygIwUshwNAmwEP430UzCVn5FBsguGAdgqs6imQWR//7MV22mjQKYW\nJK5w8Tn/1z3IbpAO3QIDAQAB\n-----END PUBLIC KEY-----`
const privateKeyPem =
  '-----BEGIN RSA PRIVATE KEY-----\r\nMIICXQIBAAKBgQClGFhjo0jp58mv6TU2otYfi1LYYUw+jSpq8R1odfv3hrZJ5srO\r\nnb9cfeHoxk8Mq92I1o7kGFIu54gMsWNZoBH2kkcn0Yd7xaBWyEjygIwUshwNAmwE\r\nP430UzCVn5FBsguGAdgqs6imQWR//7MV22mjQKYWJK5w8Tn/1z3IbpAO3QIDAQAB\r\nAoGABWO/kvUkLrqp62u+GHwFaH84Y6b9gbdDEL2xW5UqdiC4N75olYkx05eqddpv\r\nfzbnIw36GTkwCab2Wo+58hWXMHuKS5HlvQ859RhGq4f/MToj9rV6qeIM0Q3Ei2I7\r\nUHJMVdXIwEt1MU3uVlTWf+OS8bM/IlWjPyjRIyLad4V24UMCQQDf1nSZA/JuL9cI\r\nC7adQ1st257QQOxhyYjdSA5SX5N8yiZWk2dVqfYmj4IQrm371vBKLA9Xyh1j2dEw\r\nPrZUQcMXAkEAvNEgzQcKoc1ujXliGOwV6Nujzs+TBk5eWS34ONRE5iFZrAk5zLx8\r\n4Mhll8+AjuLk9JT/tU9w63K79whb4LRGKwJBAIESqhOeOgqd3ZJPJtOShp5v+Sk/\r\nds+ApkJrjY6kfGjGLMtZnonAQyfDMw4pd1R0ggVTWNmXu9DbRoxabUsyzKsCQHyp\r\nQhO7k2xyWowzWO4FaQ29fbA8YeCm+ym77QdwNjEOUcsAqFWhGH28MT8Cs+kiqnFE\r\nsnL9iRsaPDmEHk0EGNMCQQCTF7MlCTESZvCv4bGKnR3iTgfxSe+UYeYfHdN10eph\r\n0YAp+ZTMuWmyZo0EHn1TD9d+bBQ6dXHMEqaQLfPex0II\r\n-----END RSA PRIVATE KEY-----\r\n'
export function encryptWithPublicKey(text: string): string | null {
  try {
    const pub = forge.pki.publicKeyFromPem(pemPublicKey)
    const encrypted = pub.encrypt(text, 'RSAES-PKCS1-V1_5')
    return forge.util.encode64(encrypted)
  } catch (e) {
    return null
  }
}

/**
 * 用私钥字符串解密base64密文
 * @param encryptedBase64 加密后的base64字符串
 * @param privateKeyPem PEM格式私钥字符串
 * @returns 解密后的明文/null
 */
export function decryptWithPrivateKey(encryptedBase64: string): string | null {
  try {
    const priv = forge.pki.privateKeyFromPem(privateKeyPem)
    const encryptedBytes = forge.util.decode64(encryptedBase64)
    return priv.decrypt(encryptedBytes, 'RSAES-PKCS1-V1_5')
  } catch (e) {
    return null
  }
}
// 生成 RSA 密钥对
export function generateRSAKeyPair(bits: number = 1024): {
  publicKey: forge.pki.PublicKey
  privateKey: forge.pki.PrivateKey
} {
  const keypair = forge.pki.rsa.generateKeyPair({ bits, e: 0x10001 })
  return { publicKey: keypair.publicKey, privateKey: keypair.privateKey }
}

// RSA 加密（公钥）
export function rsaEncrypt(publicKey: forge.pki.PublicKey, message: string): string {
  const encrypted = publicKey.encrypt(message, 'RSAES-PKCS1-V1_5')
  return forge.util.encode64(encrypted) // Base64 输出
}

// RSA 解密（私钥）
export function rsaDecrypt(privateKey: forge.pki.PrivateKey, encryptedBase64: string): string {
  const encryptedBytes = forge.util.decode64(encryptedBase64)
  return privateKey.decrypt(encryptedBytes, 'RSAES-PKCS1-V1_5')
}

// ---------------- 测试 ----------------
const { publicKey, privateKey } = generateRSAKeyPair()

console.log('公钥:\n', forge.pki.publicKeyToPem(publicKey))
console.log('私钥:\n', forge.pki.privateKeyToPem(privateKey))

const message = 'Hello, RSA!'
const encrypted = rsaEncrypt(publicKey, message)
console.log('加密后:', encrypted)

const decrypted = rsaDecrypt(privateKey, encrypted)
console.log('解密后:', decrypted)
