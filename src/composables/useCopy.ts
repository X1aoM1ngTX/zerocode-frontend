/**
 * 复制到剪贴板组合式函数
 */
import { ref } from 'vue'
import { message } from 'ant-design-vue'

export function useCopy() {
  const copied = ref(false)

  /**
   * 复制文本到剪贴板
   * @param text 要复制的文本
   * @param successMessage 成功提示消息
   */
  const copy = async (text: string, successMessage = '复制成功') => {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      message.success(successMessage)

      // 2秒后重置状态
      setTimeout(() => {
        copied.value = false
      }, 2000)

      return true
    } catch (error) {
      message.error('复制失败，请手动复制')
      console.error('Copy failed:', error)
      return false
    }
  }

  return {
    copied,
    copy,
  }
}
