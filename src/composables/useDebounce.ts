/**
 * 防抖节流组合式函数
 */
import { ref, watch, type Ref } from 'vue'

export interface DebounceOptions {
  delay?: number
  immediate?: boolean
}

export interface ThrottleOptions {
  delay?: number
  leading?: boolean
  trailing?: boolean
}

/**
 * 防抖 Hook
 * @param value 响应式值
 * @param options 配置选项
 */
export function useDebounce<T>(value: Ref<T>, options: DebounceOptions = {}) {
  const { delay = 300, immediate = false } = options

  const debouncedValue = ref(value.value) as Ref<T>
  let timer: NodeJS.Timeout | null = null

  watch(
    value,
    (newValue) => {
      if (timer) {
        clearTimeout(timer)
      }

      if (immediate && !timer) {
        debouncedValue.value = newValue
      }

      timer = setTimeout(() => {
        if (!immediate) {
          debouncedValue.value = newValue
        }
        timer = null
      }, delay)
    },
    { flush: 'sync' }
  )

  return debouncedValue
}

/**
 * 防抖函数 Hook
 * @param fn 要防抖的函数
 * @param options 配置选项
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  options: DebounceOptions = {}
) {
  const { delay = 300 } = options

  let timer: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数 Hook
 * @param fn 要节流的函数
 * @param options 配置选项
 */
export function useThrottleFn<T extends (...args: any[]) => any>(
  fn: T,
  options: ThrottleOptions = {}
) {
  const { delay = 300, leading = true, trailing = true } = options

  let timer: NodeJS.Timeout | null = null
  let lastArgs: Parameters<T> | null = null

  return (...args: Parameters<T>) => {
    lastArgs = args

    if (!timer) {
      if (leading) {
        fn(...args)
      }

      timer = setTimeout(() => {
        if (trailing && lastArgs) {
          fn(...lastArgs)
        }
        timer = null
        lastArgs = null
      }, delay)
    }
  }
}
