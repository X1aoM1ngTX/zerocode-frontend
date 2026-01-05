/**
 * 加载状态管理组合式函数
 * 统一的加载状态管理
 */
import { ref, type Ref } from 'vue'

export interface LoadingOptions {
  initial?: boolean
  delay?: number
}

export interface LoadingReturn {
  loading: Ref<boolean>
  startLoading: () => void
  stopLoading: () => void
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
}

/**
 * 加载状态 Hook
 * @param options 配置选项
 */
export function useLoading(options: LoadingOptions = {}): LoadingReturn {
  const { initial = false, delay = 0 } = options

  const loading = ref(initial)
  let timer: NodeJS.Timeout | null = null

  /**
   * 开始加载
   */
  const startLoading = () => {
    if (delay > 0) {
      timer = setTimeout(() => {
        loading.value = true
      }, delay)
    } else {
      loading.value = true
    }
  }

  /**
   * 停止加载
   */
  const stopLoading = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    loading.value = false
  }

  /**
   * 包装异步函数，自动管理加载状态
   * @param fn 异步函数
   */
  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      startLoading()
      return await fn()
    } finally {
      stopLoading()
    }
  }

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading,
  }
}
