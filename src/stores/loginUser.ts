import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLoginUser } from '@/api/user.ts'
import { logger } from '@/utils/logger'

export const useLoginUserStore = defineStore('loginUser', () => {
  // 默认值
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  // 请求状态标记，防止重复请求
  let isFetching = false

  // 获取登录用户信息
  async function fetchLoginUser() {
    // 如果正在请求中，直接返回，避免重复请求
    if (isFetching) {
      logger.log('正在获取登录用户信息，跳过重复请求')
      return
    }

    try {
      isFetching = true
      const res = await getLoginUser()
      if (res.data.code === 0 && res.data.data) {
        loginUser.value = res.data.data
      }
    } catch (error) {
      logger.error('获取登录用户信息失败:', error)
      // 保持默认的未登录状态
    } finally {
      isFetching = false
    }
  }

  // 更新登录用户信息
  function setLoginUser(newLoginUser: API.LoginUserVO | null) {
    loginUser.value = newLoginUser || { userName: '未登录' }
  }

  // 退出登录
  function logout() {
    loginUser.value = { userName: '未登录' }
  }

  return { loginUser, setLoginUser, fetchLoginUser, logout }
})
