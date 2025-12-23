import router from '@/router'
import { useLoginUserStore } from '@/stores/loginUser'
import ACCESS_ENUM from './accessEnum'
import checkAccess from './checkAccess'
import { logger } from '@/utils/logger'

router.beforeEach(async (to, from, next) => {
  // 获取登录用户信息
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser

  // 如果之前没登陆过，自动登录
  if (!loginUser || !loginUser.userRole) {
    // 加 await 是为了等用户登录成功之后，再执行后续的代码
    await loginUserStore.fetchLoginUser()
    loginUser = loginUserStore.loginUser
  }

  logger.log('登陆用户信息', loginUser)

  // 获取页面需要的权限
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN

  // 1. 首先判断页面是否需要登录权限，如果不需要，直接放行
  if (needAccess === ACCESS_ENUM.NOT_LOGIN) {
    next()
    return
  }

  // 2. 如果页面需要登录权限
  // 3. 如果用户未登录，则跳转到登录页面
  if (!loginUser || !loginUser.userRole || loginUser.userRole === ACCESS_ENUM.NOT_LOGIN) {
    next(`/user/login?redirect=${to.fullPath}`)
    return
  }

  // 4. 如果已登录，判断登录用户的权限是否符合要求，否则跳转到401无权限页面
  if (!checkAccess(loginUser, needAccess)) {
    next('/noAuth')
    return
  }

  next()
})
