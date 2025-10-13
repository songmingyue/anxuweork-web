import type { App } from 'vue'
import { Permission } from './Permission'
import { BaseButton } from './Button'

export const setupGlobCom = (app: App<Element>): void => {
  app.component('Permission', Permission)
  app.component('BaseButton', BaseButton)
}
