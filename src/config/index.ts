// 统一迁移到 src 下供正常 TS 模块导入
// 原 public/config.ts 内容复制过来，public 中的 TS 文件不会被 Vite 编译，放在 src 下才能用 import 正常引用。

export const formStorageMedium = {
  mediaUID: '',
  isSharePath: 'false',
  name: '测试',
  organizationID: '',
  path: '6f.eword.cn',
  type: 'AmazonS3',
  host: 'https://oos-nm2.ctyunapi.cn',
  accessID: 'c765bcfaa4747085cdfd',
  accessKey: '8bca31315848f45315688928c4610e4da3feb6a5',
  bucket: '2',
  subDir: 'c765bcfaa4747085cdfd',
  userUID: '',
  uploadMediaUID: 'ebd020c9-8376-11e9-b514-fa163e13176a',
  uploadURL: 'https://101.91.206.249:8282/PutFileToOOS',
  downloadURL: 'https://101.91.206.249:8282/GetOOSFilesUrl',
  customConfig: '',
  ifEnable: 'true',
  description: '',
  httpPath: '',
  shareAddress: '',
  sharePassWord: '',
  shareUserName: '',
  organizationName: ''
}
