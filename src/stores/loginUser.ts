import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLoginUser } from '@/api/user.ts'
import { logger } from '@/utils/logger'

export const useLoginUserStore = defineStore('loginUser', () => {
  // 默认值
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  // 获取登录用户信息
  async function fetchLoginUser() {
    try {
      const res = await getLoginUser()
      if (res.data.code === 0 && res.data.data) {
        loginUser.value = res.data.data
      }
    } catch (error) {
      logger.error('获取登录用户信息失败:', error)
      // 保持默认的未登录状态
    }
  }

  // 更新登录用户信息
  function setLoginUser(newLoginUser: API.LoginUserVO | null) {
    loginUser.value = newLoginUser || { userName: '未登录' }
  }

  return { loginUser, setLoginUser, fetchLoginUser }
})
