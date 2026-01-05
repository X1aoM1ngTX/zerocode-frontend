/**
 * 权限检查组合式函数
 * 统一的权限管理
 */
import { computed } from 'vue'
import { useLoginUserStore } from '@/stores/loginUser'
import ACCESS_ENUM from '@/access/accessEnum'

/**
 * 权限检查 Hook
 */
export function usePermission() {
  const userStore = useLoginUserStore()

  /**
   * 当前用户登录状态
   */
  const isLoggedIn = computed(() => !!userStore.loginUser?.userRole)

  /**
   * 当前用户是否为管理员
   */
  const isAdmin = computed(() => userStore.loginUser?.userRole === ACCESS_ENUM.ADMIN)

  /**
   * 当前用户是否为普通用户
   */
  const isUser = computed(() => userStore.loginUser?.userRole === ACCESS_ENUM.USER)

  /**
   * 检查是否有指定权限
   * @param access 需要的权限级别
   */
  const hasPermission = (access: string) => {
    const userRole = userStore.loginUser?.userRole
    if (!userRole) return false

    // 管理员拥有所有权限
    if (userRole === ACCESS_ENUM.ADMIN) return true

    // 检查是否匹配所需权限
    return userRole === access
  }

  /**
   * 检查是否有任意权限
   * @param accesses 权限数组
   */
  const hasAnyPermission = (accesses: string[]) => {
    return accesses.some((access) => hasPermission(access))
  }

  /**
   * 检查是否有所有权限
   * @param accesses 权限数组
   */
  const hasAllPermissions = (accesses: string[]) => {
    return accesses.every((access) => hasPermission(access))
  }

  return {
    isLoggedIn,
    isAdmin,
    isUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
