/**
 * pnpm hooks
 * - 将 vue-computer 的版本号依赖重写为本地私服 tarball
 * - 避免每次 pnpm i 都手动切换 registry
 */

const DEFAULT_TGZ = 'http://localhost:4873/vue-computer/-/vue-computer-1.0.1.tgz'
const VUE_COMPUTER_TGZ = process.env.VUE_COMPUTER_TGZ || DEFAULT_TGZ

function rewriteVueComputer(deps) {
  if (!deps) return
  if (process.env.DISABLE_VUE_COMPUTER_TGZ === '1') return
  if (typeof deps['vue-computer'] === 'string') {
    deps['vue-computer'] = VUE_COMPUTER_TGZ
  }
}

module.exports = {
  hooks: {
    readPackage(pkg) {
      rewriteVueComputer(pkg.dependencies)
      rewriteVueComputer(pkg.devDependencies)
      rewriteVueComputer(pkg.optionalDependencies)
      return pkg
    }
  }
}
