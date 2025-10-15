import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { Menu } from '@/components/Menu'
import { TabMenu } from '@/components/TabMenu'
import { TagsView } from '@/components/TagsView'
import { Logo } from '@/components/Logo'
import AppView from './AppView.vue'
import ToolHeader from './ToolHeader.vue'
import { ElScrollbar } from 'element-plus'
import { useDesign } from '@/hooks/web/useDesign'
import './useRenderLayout.css'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('layout')

const appStore = useAppStore()

const pageLoading = computed(() => appStore.getPageLoading)

// 标签页
const tagsView = computed(() => appStore.getTagsView)

// 菜单折叠
const collapse = computed(() => appStore.getCollapse)

// logo
const logo = computed(() => appStore.logo)

// 固定头部
const fixedHeader = computed(() => appStore.getFixedHeader)

// 是否是移动端
const mobile = computed(() => appStore.getMobile)

// 固定菜单
const fixedMenu = computed(() => appStore.getFixedMenu)

export const useRenderLayout = () => {
  const renderClassic = () => {
    return (
      <>
        <div class={['rl-aside', 'layout-border__right', { 'is-mobile': mobile.value }]}>
          {logo.value ? (
            <Logo
              class={[
                'rl-logo',
                {
                  'no-pl': mobile.value && collapse.value,
                  'left-min': appStore.getCollapse,
                  'left-max': !appStore.getCollapse
                }
              ]}
              style="transition: all var(--transition-time-02);"
            ></Logo>
          ) : undefined}
          <Menu class={['rl-menu', { 'has-logo': logo.value }]}></Menu>
        </div>
        <div
          class={[
            `${prefixCls}-content`,
            'rl-content',
            {
              'content-left-min': collapse.value && !mobile.value,
              'content-left-max': !collapse.value && !mobile.value,
              mobile: mobile.value
            }
          ]}
          style="transition: all var(--transition-time-02);"
        >
          <ElScrollbar
            v-loading={pageLoading.value}
            class={[`${prefixCls}-content-scrollbar`, { 'fixed-header': fixedHeader.value }]}
          >
            <div
              class={[
                'header-wrap',
                {
                  fixed: fixedHeader.value,
                  'header-left-min': collapse.value && fixedHeader.value && !mobile.value,
                  'header-left-max': !collapse.value && fixedHeader.value && !mobile.value,
                  mobile: mobile.value
                }
              ]}
              style="transition: all var(--transition-time-02);"
            >
              <ToolHeader
                class={['top-header-bg', { 'layout-border__bottom': !tagsView.value }]}
              ></ToolHeader>

              {tagsView.value ? (
                <TagsView class="layout-border__bottom layout-border__top"></TagsView>
              ) : undefined}
            </div>

            <AppView></AppView>
          </ElScrollbar>
        </div>
      </>
    )
  }

  const renderTopLeft = () => {
    return (
      <>
        <div class="topbar layout-border__bottom">
          {logo.value ? <Logo class="custom-hover"></Logo> : undefined}

          <ToolHeader class="flex-1"></ToolHeader>
        </div>
        <div class="below-logo">
          <Menu class="menu-side layout-border__right"></Menu>
          <div
            class={[
              `${prefixCls}-content`,
              'content-pane',
              {
                'content-left-min': collapse.value,
                'content-left-max': !collapse.value
              }
            ]}
            style="transition: all var(--transition-time-02);"
          >
            <ElScrollbar
              v-loading={pageLoading.value}
              class={[
                `${prefixCls}-content-scrollbar`,
                { 'fixed-tags': fixedHeader.value && tagsView.value }
              ]}
            >
              {tagsView.value ? (
                <TagsView
                  class={[
                    'layout-border__bottom absolute',
                    {
                      'tags-fixed': fixedHeader.value,
                      'header-left-min mt-logo': collapse.value && fixedHeader.value,
                      'header-left-max mt-logo': !collapse.value && fixedHeader.value
                    }
                  ]}
                  style="transition: width var(--transition-time-02), left var(--transition-time-02);"
                ></TagsView>
              ) : undefined}

              <AppView></AppView>
            </ElScrollbar>
          </div>
        </div>
      </>
    )
  }

  const renderTop = () => {
    return (
      <>
        <div class={['top-header', { 'layout-border__bottom': !tagsView.value }]}>
          {logo.value ? <Logo class="custom-hover"></Logo> : undefined}
          <Menu class="top-menu flex-1"></Menu>
          <ToolHeader></ToolHeader>
        </div>
        <div
          class={[
            `${prefixCls}-content`,
            'content-top',
            {
              'no-fixed': !fixedHeader.value,
              'with-fixed': fixedHeader.value
            }
          ]}
        >
          <ElScrollbar
            v-loading={pageLoading.value}
            class={[
              `${prefixCls}-content-scrollbar`,
              {
                'scrollbar-with-tags-fixed': fixedHeader.value,
                'scrollbar-no-fixed': !fixedHeader.value
              }
            ]}
          >
            {tagsView.value ? (
              <TagsView
                class={[
                  'layout-border__bottom layout-border__top relative',
                  {
                    'fixed-full': fixedHeader.value
                  }
                ]}
                style="transition: width var(--transition-time-02), left var(--transition-time-02);"
              ></TagsView>
            ) : undefined}

            <AppView></AppView>
          </ElScrollbar>
        </div>
      </>
    )
  }

  const renderCutMenu = () => {
    return (
      <>
        <div class="topbar layout-border__bottom">
          {logo.value ? <Logo class="custom-hover !pr-15px"></Logo> : undefined}

          <ToolHeader class="flex-1"></ToolHeader>
        </div>
        <div class="below-logo-cut">
          <TabMenu></TabMenu>
          <div
            class={[
              `${prefixCls}-content`,
              'content-pane',
              {
                'content-cut-min': collapse.value && !fixedMenu.value,
                'content-cut-max': !collapse.value && !fixedMenu.value,
                'content-cut-min-fixed': collapse.value && fixedMenu.value,
                'content-cut-max-fixed': !collapse.value && fixedMenu.value
              }
            ]}
            style="transition: all var(--transition-time-02);"
          >
            <ElScrollbar
              v-loading={pageLoading.value}
              class={[
                `${prefixCls}-content-scrollbar`,
                { 'fixed-tags': fixedHeader.value && tagsView.value }
              ]}
            >
              {tagsView.value ? (
                <TagsView
                  class={[
                    'relative layout-border__bottom layout-border__top',
                    {
                      'tags-fixed': fixedHeader.value,
                      'tags-cut-min': collapse.value && fixedHeader.value,
                      'tags-cut-max': !collapse.value && fixedHeader.value,
                      'tags-cut-min-fixed': fixedHeader.value && fixedMenu.value && collapse.value,
                      'tags-cut-max-fixed': fixedHeader.value && fixedMenu.value && !collapse.value
                    }
                  ]}
                  style="transition: width var(--transition-time-02), left var(--transition-time-02);"
                ></TagsView>
              ) : undefined}

              <AppView></AppView>
            </ElScrollbar>
          </div>
        </div>
      </>
    )
  }

  return {
    renderClassic,
    renderTopLeft,
    renderTop,
    renderCutMenu
  }
}
