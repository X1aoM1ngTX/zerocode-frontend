/**
 * 路由守卫
 * 处理页面加载进度条、权限验证等
 */
import type { Router } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置 NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
})

/**
 * 设置路由守卫
 * @param router Vue Router 实例
 */
export function setupRouterGuards(router: Router) {
  // 前置守卫
  router.beforeEach((to, from, next) => {
    // 开始加载进度条
    NProgress.start()

    // 设置页面标题
    if (to.meta.title) {
      document.title = `${to.meta.title} - ZeroCode`
    } else {
      document.title = 'ZeroCode - 零代码开发平台'
    }

    next()
  })

  // 后置守卫
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  router.afterEach((to, from) => {
    // 结束加载进度条
    NProgress.done()

    // 滚动到页面顶部
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })

  // 错误守卫
  router.onError((error) => {
    console.error('路由错误:', error)
    NProgress.done()
  })
}
