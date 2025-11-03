export const arrayBufferToBase64 = (input: string | ArrayBuffer | undefined) => {
  if (!input) return ''
  if (typeof input === 'string') {
    // if already a data URL or plain base64 string, normalize to a data URL
    return input.startsWith('data:') ? input : `data:image/png;base64,${input}`
  }
  // convert ArrayBuffer to base64 data URL
  const bytes = new Uint8Array(input as ArrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return 'data:image/png;base64,' + btoa(binary)
}
