/**
 * 环境变量配置
 */

import { CodeGenTypeEnum } from "@/utils/codeGenTypes"

// 应用部署域名
export const DEPLOY_DOMAIN = import.meta.env.VITE_DEPLOY_DOMAIN || 'http://localhost'

// API 基础地址
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 静态资源地址
export const STATIC_BASE_URL = `${API_BASE_URL}/static`

// 获取部署应用的完整URL
export const getDeployUrl = (deployKey: string) => {
  // 如果 DEPLOY_DOMAIN 是完整 URL（以 http 开头），直接使用
  if (DEPLOY_DOMAIN.startsWith('http')) {
    return `${DEPLOY_DOMAIN}/${deployKey}`
  }

  // 如果是相对路径，使用当前域名构建完整 URL
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost'

  return `${baseUrl}${DEPLOY_DOMAIN}/${deployKey}`
}

// 获取静态资源预览URL
export const getStaticPreviewUrl = (codeGenType: string, appId: string) => {
  const baseUrl = `${STATIC_BASE_URL}/${codeGenType}_${appId}/`
  // Vue 和 React 项目都需要添加 dist/index.html 后缀
  if (codeGenType === CodeGenTypeEnum.VUE_PROJECT || codeGenType === CodeGenTypeEnum.REACT_PROJECT) {
    return `${baseUrl}dist/index.html`
  }
  return baseUrl
}
