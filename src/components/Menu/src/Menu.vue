<script setup lang="ts">
import { computed, ref, h, unref, reactive } from 'vue'
import { ElMenu, ElSubMenu, ElMenuItem } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
import { Icon } from '@/components/Icon'

// 获取本地存储的菜单数据
const userinfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const menuList = (userinfo && userinfo[0] && userinfo[0].viewParts) || []
const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('menu')

const router = useRouter()
// 当前激活菜单key，取当前路由path
const activeMenu = computed(() => router.currentRoute.value.path)
const appStore = useAppStore()
const layout = ref(computed(() => appStore.getLayout))
const collapse = computed(() => appStore.getCollapse)
const uniqueOpened = computed(() => appStore.getUniqueOpened)
const menuIconList = reactive<
  Array<{
    key: string
    icon: string
  }>
>([
  {
    key: '/paramConf',
    icon: 'canshu'
  },
  {
    key: '/authConf',
    icon: 'quanxian'
  },
  {
    key: '/plugConf',
    icon: 'chajianpeizhi'
  },
  {
    key: '/serviceCof',
    icon: 'setting'
  },
  {
    key: '/checkInfo',
    icon: 'jiancharenwufenpei'
  },
  {
    key: '/diagnosisInfo',
    icon: 'zhenliao'
  },
  {
    key: '/logConfig',
    icon: 'rizhi'
  }
])
const menuMode = computed((): 'vertical' | 'horizontal' => {
  // 竖
  const vertical: LayoutType[] = ['classic', 'topLeft', 'cutMenu']

  if (vertical.includes(unref(layout))) {
    return 'vertical'
  } else {
    return 'horizontal'
  }
})
// 菜单点击事件
function handleMenuSelect(index: string) {
  // 查找当前点击的菜单项
  function findMenu(list: any[]): any {
    for (const item of list) {
      if (item.url === index) return item
      if (item.children) {
        const found = findMenu(item.children)
        if (found) return found
      }
    }
    return null
  }
  const menu = findMenu(menuList)

  if (menu && !menu.children) {
    // 跳转到url
    router.push(menu.url)
  }
}

// 根据 url 匹配图标
function getMenuIcon(url: string): string | '' {
  const found = menuIconList.find((m) => url?.startsWith(m.key))
  return found ? `svg-icon:${found.icon}` : ''
}

// 判断当前路由是否激活此菜单（自身或子路由）
function isActiveUrl(url: string): boolean {
  const path = router.currentRoute.value.path || ''
  return path === url || path.startsWith(url + '/')
}

// 递归渲染菜单，返回VNode数组
function renderMenu(list: any[]) {
  return list.map((item: any) => {
    if (item.children && item.children.length > 0) {
      const iconName = getMenuIcon(item.url)
      const isAct = isActiveUrl(item.url)
      return h(
        ElSubMenu,
        { index: item.url, key: item.url },
        {
          title: () =>
            h('span', { class: `${prefixCls}__title` }, [
              iconName
                ? h(Icon as any, {
                    icon: iconName,
                    size: 16,
                    color: isAct
                      ? 'var(--menu-icon-active-color, var(--left-menu-text-active-color))'
                      : 'var(--left-menu-text-color)',
                    style: 'margin-right:6px;'
                  })
                : null,
              item.meta?.title || item.url
            ]),
          // icon: () =>
          default: () => renderMenu(item.children)
        }
      )
    } else {
      const iconName = getMenuIcon(item.url)
      const isAct = isActiveUrl(item.url)
      return h(ElMenuItem, { index: item.url, key: item.url }, () =>
        h('span', { class: `${prefixCls}__title` }, [
          iconName
            ? h(Icon as any, {
                icon: iconName,
                size: 16,
                color: isAct
                  ? 'var(--menu-icon-active-color, var(--left-menu-text-active-color))'
                  : 'var(--left-menu-text-color)',
                style: 'margin-right:6px;'
              })
            : null,
          item.meta?.title || item.url
        ])
      )
    }
  })
}
</script>
<template>
  <div class="el-scrollbar__wrap el-scrollbar__wrap--hidden-default">
    <div
      :id="prefixCls"
      style="height: 100%; background-color: var(--left-menu-bg-color)"
      :class="[
        `${prefixCls} ${prefixCls}__${menuMode}`,
        'menu-root',
        {
          'menu--min': collapse && layout !== 'cutMenu',
          'menu--max': !collapse && layout !== 'cutMenu'
        }
      ]"
    >
      <ElMenu
        :uniqueOpened="layout === 'top' ? false : uniqueOpened"
        :collapse="layout === 'top' || layout === 'cutMenu' ? false : collapse"
        backgroundColor="var(--left-menu-bg-color)"
        textColor="var(--left-menu-text-color)"
        activeTextColor="var(--left-menu-text-active-color)"
        :default-active="activeMenu"
        mode="vertical"
        @select="handleMenuSelect"
      >
        <component v-for="item in renderMenu(menuList)" :is="item" :key="item.key" />
      </ElMenu>
    </div>
  </div>
</template>
<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-menu';

.@{prefix-cls} {
  position: relative;
  transition: width var(--transition-time-02);

  .menu-root {
    display: flex;
    height: 100%;
    overflow: hidden;
    flex-direction: column;
    background: var(--left-menu-bg-color);
  }

  .menu--min {
    width: var(--left-menu-min-width);
  }

  .menu--max {
    width: var(--left-menu-max-width);
  }

  :deep(.@{elNamespace}-menu) {
    width: 100% !important;
    border-right: none;

    // 设置选中时子标题的颜色
    .is-active {
      & > .@{elNamespace}-sub-menu__title {
        color: var(--left-menu-text-active-color) !important;
      }
    }

    // 设置子菜单悬停的高亮和背景色
    .@{elNamespace}-sub-menu__title,
    .@{elNamespace}-menu-item {
      &:hover {
        color: var(--left-menu-text-active-color) !important;
        background-color: var(--left-menu-bg-color) !important;
      }
    }

    // 设置选中时的高亮背景和高亮颜色
    .@{elNamespace}-menu-item.is-active {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-active-color) !important;

      &:hover {
        background-color: var(--left-menu-bg-active-color) !important;
      }
    }

    .@{elNamespace}-menu-item.is-active {
      position: relative;
    }

    // 设置子菜单的背景颜色
    .@{elNamespace}-menu {
      .@{elNamespace}-sub-menu__title,
      .@{elNamespace}-menu-item:not(.is-active) {
        background-color: var(--left-menu-bg-light-color) !important;
      }
    }
  }

  // 折叠时的最小宽度
  :deep(.@{elNamespace}-menu--collapse) {
    width: var(--left-menu-min-width);

    & > .is-active,
    & > .is-active > .@{elNamespace}-sub-menu__title {
      position: relative;
      background-color: var(--left-menu-collapse-bg-active-color) !important;
    }
  }

  // 折叠动画的时候，就需要把文字给隐藏掉
  :deep(.horizontal-collapse-transition) {
    .@{prefix-cls}__title {
      display: none;
    }
  }

  // 水平菜单
  &__horizontal {
    height: calc(~'var(--top-tool-height)') !important;

    :deep(.@{elNamespace}-menu--horizontal) {
      height: calc(~'var(--top-tool-height)');
      border-bottom: none;
      // 重新设置底部高亮颜色
      & > .@{elNamespace}-sub-menu.is-active {
        .@{elNamespace}-sub-menu__title {
          border-bottom-color: var(--el-color-primary) !important;
        }
      }

      .@{elNamespace}-menu-item.is-active {
        position: relative;

        &::after {
          display: none !important;
        }
      }

      .@{prefix-cls}__title {
        /* stylelint-disable-next-line */
        max-height: calc(~'var(--top-tool-height) - 2px') !important;
        /* stylelint-disable-next-line */
        line-height: calc(~'var(--top-tool-height) - 2px');
      }
    }
  }
}
</style>

<style lang="less">
@prefix-cls: ~'@{adminNamespace}-menu-popper';

.@{prefix-cls}--vertical,
.@{prefix-cls}--horizontal {
  // 设置选中时子标题的颜色
  .is-active {
    & > .el-sub-menu__title {
      color: var(--left-menu-text-active-color) !important;
    }
  }

  // 设置子菜单悬停的高亮和背景色
  .el-sub-menu__title,
  .el-menu-item {
    &:hover {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-color) !important;
    }
  }

  // 设置选中时的高亮背景
  .el-menu-item.is-active {
    position: relative;
    background-color: var(--left-menu-bg-active-color) !important;

    &:hover {
      background-color: var(--left-menu-bg-active-color) !important;
    }
  }
}

@submenu-prefix-cls: ~'@{adminNamespace}-submenu-popper';

// 设置子菜单溢出时滚动样式
.@{submenu-prefix-cls}--vertical {
  max-height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgb(144 147 153 / 30%);
    border-radius: 4px;
  }
}
</style>
