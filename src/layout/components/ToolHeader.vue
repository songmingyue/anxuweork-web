<script lang="tsx">
import { defineComponent, computed } from 'vue'

import { ThemeSwitch } from '@/components/ThemeSwitch'

import { LocaleDropdown } from '@/components/LocaleDropdown'
import { SizeDropdown } from '@/components/SizeDropdown'
import { UserInfo } from '@/components/UserInfo'
import { Screenfull } from '@/components/Screenfull'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('tool-header')

const appStore = useAppStore()

// 面包屑

// 折叠图标

// 全屏图标
const screenfull = computed(() => appStore.getScreenfull)

// 尺寸图标
const size = computed(() => appStore.getSize)

// 布局
const layout = computed(() => appStore.getLayout)

// 多语言图标
const locale = computed(() => appStore.getLocale)

export default defineComponent({
  name: 'ToolHeader',
  setup() {
    return () => (
      <div id={`${variables.namespace}-tool-header`} class={[prefixCls, 'tool-header']}>
        {layout.value !== 'top' ? <div class="left"></div> : undefined}

        <div class="right">
          {screenfull.value ? (
            <Screenfull class="custom-hover" color="var(--top-header-text-color)"></Screenfull>
          ) : undefined}
          {size.value ? (
            <SizeDropdown class="custom-hover" color="var(--top-header-text-color)"></SizeDropdown>
          ) : undefined}
          {locale.value ? (
            <LocaleDropdown
              class="custom-hover"
              color="var(--top-header-text-color)"
            ></LocaleDropdown>
          ) : undefined}
          {/* <span>主题</span> */}
          {/* <span class="custom-hover marginright" onClick={openSettingDrawer}>
            <ElIcon color="var(--el-color-primary)">
              <Tools />
            </ElIcon>
          </span> */}

          <ThemeSwitch></ThemeSwitch>
          <span style="margin-right: 10px"></span>
          <UserInfo></UserInfo>
        </div>
      </div>
    )
  }
})
</script>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-tool-header';

.@{prefix-cls} {
  transition: left var(--transition-time-02);
}

.tool-header {
  position: relative;
  display: flex;
  width: 100%;
  height: var(--top-tool-height);
  padding-right: var(--top-tool-p-x);
  padding-left: var(--top-tool-p-x);
  background-color: #fff;
  align-items: center;
  justify-content: space-between;
}

.left,
.right {
  display: flex;
  height: 100%;
  align-items: center;
}

.custom-hover {
  cursor: pointer;
}

.marginright {
  margin-right: 12px;
}

.left-icon {
  position: fixed;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}
</style>
