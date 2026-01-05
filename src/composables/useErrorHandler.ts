/**
 * 错误处理组合式函数
 * 统一的错误处理机制
 */
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'

export interface ErrorHandlerOptions {
  showMessage?: boolean
  defaultMessage?: string
  duration?: number
  callback?: (error: unknown) => void
}

/**
 * 错误处理 Hook
 */
export function useErrorHandler() {
  const userStore = useLoginUserStore()

  /**
   * 处理错误
   * @param error 错误对象
   * @param options 配置选项
   */
  const handleError = (error: unknown, options: ErrorHandlerOptions = {}) => {
    const {
      showMessage = true,
      defaultMessage = '操作失败，请重试',
      duration = 3,
      callback,
    } = options

    // 提取错误信息
    let errorMessage = defaultMessage

    if (error instanceof Error) {
      errorMessage = error.message || defaultMessage
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message)
    }

    // 显示错误提示
    if (showMessage) {
      message.error({
        content: errorMessage,
        duration,
        key: 'global-error',
      })
    }

    // 打印错误到控制台
    console.error('[Error]', error)

    // 执行回调
    if (callback) {
      callback(error)
    }

    // 特殊错误处理
    if (errorMessage.includes('401') || errorMessage.includes('未授权')) {
      // 清除用户信息并跳转登录
      userStore.logout()
      window.location.href = '/user/login'
    }
  }

  /**
   * 异步操作包装器
   * @param asyncFn 异步函数
   * @param options 配置选项
   */
  const withErrorHandling = async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, options)
      return null
    }
  }

  return {
    handleError,
    withErrorHandling,
  }
}
