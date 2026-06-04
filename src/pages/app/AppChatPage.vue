<template>
  <div id="appChatPage">
    <header class="workbench-header">
      <div class="brand-area">
        <router-link to="/" class="brand-link">
          <img src="@/assets/vexor-argb.png" alt="Vexor" />
        </router-link>
        <button type="button" class="project-switch" @click="showAppDetail">
          <span>{{ appInfo?.appName || '我的项目' }}</span>
          <InfoCircleOutlined />
        </button>
        <a-tag v-if="appInfo?.codeGenType" class="code-gen-type-tag">
          {{ formatCodeGenType(appInfo.codeGenType) }}
        </a-tag>
      </div>

      <div class="header-actions">
        <a-button class="toolbar-btn" @click="showAppDetail">
          <template #icon>
            <InfoCircleOutlined />
          </template>
          详情
        </a-button>
        <a-tooltip v-if="!isDeployed" title="请先部署应用后再下载代码">
          <a-button class="toolbar-btn" @click="downloadCode" :loading="downloading" :disabled="!isOwner || !isDeployed">
            <template #icon>
              <DownloadOutlined />
            </template>
            导出
          </a-button>
        </a-tooltip>
        <a-button
          v-else
          class="toolbar-btn"
          @click="downloadCode"
          :loading="downloading"
          :disabled="!isOwner"
        >
          <template #icon>
            <DownloadOutlined />
          </template>
          导出
        </a-button>
        <a-button class="deploy-btn" type="primary" @click="deployApp" :loading="deploying">
          <template #icon>
            <CloudUploadOutlined />
          </template>
          部署
        </a-button>
      </div>
    </header>

    <div class="workbench-body">
      <aside class="chat-panel">
        <div class="messages-container" ref="messagesContainer">
          <div v-if="hasMoreHistory" class="load-more-container">
            <a-button type="link" @click="loadMoreHistory" :loading="loadingHistory" size="small">
              加载更多历史消息
            </a-button>
          </div>
          <div v-for="(message, index) in messages" :key="index" class="message-item">
            <div v-if="message.type === 'user'" class="user-message">
              <div class="message-content">{{ message.content }}</div>
              <div class="message-time">{{ message.createTime || '' }}</div>
            </div>
            <div v-else class="ai-message">
              <div class="message-avatar">
                <a-avatar :src="aiAvatar" />
              </div>
              <div class="message-content">
                <div class="ai-name">Vexor AI</div>
                <MarkdownRenderer
                  v-if="message.content"
                  :content="displayMessageContent(message.content)"
                />
                <div v-if="message.loading" class="loading-indicator">
                  <a-spin size="small" />
                  <span>AI 正在生成...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a-alert
          v-if="selectedElementInfo"
          class="selected-element-alert"
          type="info"
          closable
          @close="clearSelectedElement"
        >
          <template #message>
            <div class="selected-element-info">
              <div class="element-header">
                <span class="element-tag">
                  选中元素：{{ selectedElementInfo.tagName.toLowerCase() }}
                </span>
                <span v-if="selectedElementInfo.id" class="element-id">#{{ selectedElementInfo.id }}</span>
                <span v-if="selectedElementInfo.className" class="element-class">
                  .{{ selectedElementInfo.className.split(' ').join('.') }}
                </span>
              </div>
              <div class="element-details">
                <div v-if="selectedElementInfo.textContent" class="element-item">
                  内容: {{ selectedElementInfo.textContent.substring(0, 50) }}
                  {{ selectedElementInfo.textContent.length > 50 ? '...' : '' }}
                </div>
                <div v-if="selectedElementInfo.pagePath" class="element-item">
                  页面路径: {{ selectedElementInfo.pagePath }}
                </div>
                <div class="element-item">
                  选择器:
                  <code class="element-selector-code">{{ selectedElementInfo.selector }}</code>
                </div>
              </div>
            </div>
          </template>
        </a-alert>

        <div class="input-container">
          <div class="input-wrapper">
            <a-tooltip v-if="!isOwner" title="无法在别人的作品下对话哦~" placement="top">
              <a-textarea
                v-model:value="userInput"
                :placeholder="getInputPlaceholder()"
                :rows="4"
                :maxlength="1000"
                @keydown.enter.prevent="sendMessage"
                :disabled="isGenerating || !isOwner"
              />
            </a-tooltip>
            <a-textarea
              v-else
              v-model:value="userInput"
              :placeholder="getInputPlaceholder()"
              :rows="4"
              :maxlength="1000"
              @keydown.enter.prevent="sendMessage"
              :disabled="isGenerating"
            />
            <div class="input-actions">
              <a-tooltip v-if="isOwner" title="AI优化提示词">
                <a-button
                  class="icon-action-btn"
                  @click="optimizeUserPrompt"
                  :loading="optimizing"
                  :disabled="!userInput.trim() || isGenerating"
                >
                  <template #icon>
                    <StarOutlined v-if="!optimizing" />
                    <LoadingOutlined v-else />
                  </template>
                </a-button>
              </a-tooltip>
              <a-button
                class="send-btn"
                type="primary"
                @click="sendMessage"
                :loading="isGenerating"
                :disabled="!isOwner"
              >
                <template #icon>
                  <SendOutlined />
                </template>
              </a-button>
            </div>
          </div>
        </div>
      </aside>

      <section class="workspace-panel">
        <div class="workspace-tabs">
          <button
            type="button"
            :class="{ active: activeWorkspaceTab === 'preview' }"
            @click="activeWorkspaceTab = 'preview'"
          >
            预览
          </button>
          <button
            type="button"
            :class="{ active: activeWorkspaceTab === 'code' }"
            @click="activeWorkspaceTab = 'code'"
          >
            代码
          </button>
          <div class="workspace-spacer"></div>
          <a-button
            v-if="isOwner && previewUrl && activeWorkspaceTab === 'preview'"
            class="workspace-action"
            :danger="isEditMode"
            @click="toggleEditMode"
            :class="{ 'edit-mode-active': isEditMode }"
          >
            <template #icon>
              <EditOutlined />
            </template>
            {{ isEditMode ? '退出编辑' : '编辑模式' }}
          </a-button>
          <a-button v-if="previewUrl" class="workspace-action" @click="openInNewTab">
            <template #icon>
              <ExportOutlined />
            </template>
            新窗口
          </a-button>
        </div>

        <div v-if="activeWorkspaceTab === 'preview'" class="preview-content">
          <div class="browser-bar">
            <div class="browser-controls">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="address-bar">{{ previewUrl || 'http://localhost:3000' }}</div>
          </div>
          <div v-if="!previewUrl && !isGenerating" class="preview-placeholder">
            <div class="placeholder-icon">
              <GlobalOutlined />
            </div>
            <p>网站文件生成完成后将在这里展示</p>
          </div>
          <div v-else-if="isGenerating" class="preview-loading">
            <a-spin size="large" />
            <p>正在生成网站...</p>
          </div>
          <iframe
            v-else
            :src="previewUrl"
            class="preview-iframe"
            frameborder="0"
            @load="onIframeLoad"
          ></iframe>
        </div>

        <div v-else-if="activeWorkspaceTab === 'code'" class="code-workspace">
          <aside class="file-tree">
            <div class="file-tree-title">文件树</div>
            <AppFileTreeNode
              :nodes="fileTree"
              :active-path="activeFilePath"
              @select="setActiveFile"
            />
          </aside>
          <div class="code-pane">
            <div class="code-pane-header">
              <span>{{ activeFilePath || generatedFiles[0]?.path || 'index.html' }}</span>
            </div>
            <div ref="codePreviewContainer" class="code-preview-scroller">
              <div class="code-gutter" aria-hidden="true">
                <span v-for="line in codeLineNumbers" :key="line">{{ line }}</span>
              </div>
              <pre><code :class="`language-${activeCodeLanguage || 'plaintext'}`" v-html="highlightedCode"></code></pre>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 应用详情弹窗 -->
    <AppDetailModal
      v-model:open="appDetailVisible"
      :app="appInfo"
      :show-actions="isOwner || isAdmin"
      @edit="editApp"
      @delete="deleteApp"
    />

    <!-- 部署成功弹窗 -->
    <DeploySuccessModal
      v-model:open="deployModalVisible"
      :deploy-url="deployUrl"
      @open-site="openDeployedSite"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import {
  getAppVoById,
  deployApp as deployAppApi,
  deleteApp as deleteAppApi,
  optimizePrompt,
} from '@/api/app'
import { listAppChatHistory } from '@/api/chatHistory'
import { CodeGenTypeEnum, formatCodeGenType } from '@/utils/codeGenTypes'
import request from '@/request'
import hljs from 'highlight.js'

import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import AppDetailModal from '@/components/AppDetailModal.vue'
import DeploySuccessModal from '@/components/DeploySuccessModal.vue'
import AppFileTreeNode from '@/components/AppFileTreeNode.vue'
import aiAvatar from '@/assets/vexor.png'
import { API_BASE_URL, getStaticPreviewUrl } from '@/config/env'
import { VisualEditor, type ElementInfo } from '@/utils/visualEditor'
import { logger } from '@/utils/logger'

import {
  CloudUploadOutlined,
  SendOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  GlobalOutlined,
  StarOutlined,
  LoadingOutlined,
  MessageOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 应用信息
const appInfo = ref<API.AppVO>()
const appId = ref<string>()

// 对话相关
interface Message {
  type: 'user' | 'ai'
  content: string
  loading?: boolean
  createTime?: string
}

interface AppFileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  language?: string
  status?: string
  children?: AppFileNode[]
}

interface FlatFileItem {
  name: string
  path: string
  status: string
  language?: string
}

interface GenerationEvent {
  type: string
  appId?: number
  path?: string
  content?: string
  overwrite?: boolean
  status?: string
  message?: string
}

const messages = ref<Message[]>([])
const userInput = ref('')
const isGenerating = ref(false)
const messagesContainer = ref<HTMLElement>()
const codePreviewContainer = ref<HTMLElement>()

// 对话历史相关
const loadingHistory = ref(false)
const hasMoreHistory = ref(false)
const lastCreateTime = ref<string>()
const historyLoaded = ref(false)

// 预览相关
const previewUrl = ref('')
const previewReady = ref(false)
const shouldOpenCodeTab = route.query.tab === 'code'
const activeWorkspaceTab = ref<'preview' | 'code'>(shouldOpenCodeTab ? 'code' : 'preview')
const activeFilePath = ref('')
const fileTree = ref<AppFileNode[]>([])
const fileContents = reactive<Record<string, string>>({})
const fileStatus = reactive<Record<string, string>>({})
const buildStatus = ref<'idle' | 'generating' | 'building' | 'success' | 'error'>('idle')
const buildMessage = ref('')

const generatedFiles = computed<FlatFileItem[]>(() => {
  const files: FlatFileItem[] = []
  const walk = (nodes: AppFileNode[]) => {
    nodes.forEach((node) => {
      if (node.type === 'directory') {
        walk(node.children || [])
      } else {
        files.push({
          name: node.name,
          path: node.path,
          language: node.language,
          status: fileStatus[node.path] || node.status || '已生成',
        })
      }
    })
  }
  walk(fileTree.value)
  return files
})

const codePreview = computed(() => {
  const path = activeFilePath.value || generatedFiles.value[0]?.path
  if (path && fileContents[path]) {
    return fileContents[path]
  }
  if (isGenerating.value) {
    return '// Vexor 正在生成代码，请稍候...'
  }
  return '// 选择文件后，这里会展示代码内容。'
})

const activeFile = computed(() => {
  const fallback = generatedFiles.value[0]
  return generatedFiles.value.find((file) => file.path === activeFilePath.value) || fallback
})

const activeCodeLanguage = computed(() => {
  const source = activeFile.value?.language || activeFile.value?.path || activeFilePath.value
  return normalizeHighlightLanguage(source || '')
})

const highlightedCode = computed(() => {
  const code = codePreview.value
  const language = activeCodeLanguage.value
  try {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language, ignoreIllegals: true }).value
    }
    return hljs.highlightAuto(code).value
  } catch {
    return escapeHtml(code)
  }
})

const codeLineNumbers = computed(() => {
  const lineCount = Math.max(1, codePreview.value.split(/\r\n|\r|\n/).length)
  return Array.from({ length: lineCount }, (_, index) => index + 1)
})

const setActiveFile = async (path: string) => {
  activeFilePath.value = path
  if (!fileContents[path]) {
    await loadFileContent(path)
  }
  scrollCodeToBottom()
}

const normalizeHighlightLanguage = (input: string) => {
  const raw = input.toLowerCase().trim()
  const extension = raw.includes('.') ? raw.split('.').pop() || raw : raw
  const languageMap: Record<string, string> = {
    html: 'xml',
    htm: 'xml',
    vue: 'xml',
    xml: 'xml',
    js: 'javascript',
    jsx: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    javascript: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    typescript: 'typescript',
    css: 'css',
    scss: 'scss',
    less: 'less',
    json: 'json',
    md: 'markdown',
    markdown: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
    java: 'java',
    py: 'python',
    python: 'python',
    txt: 'plaintext',
  }
  return languageMap[extension] || extension || 'plaintext'
}

const escapeHtml = (content: string) => {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const loadFileTree = async () => {
  if (!appId.value) return
  try {
    const res = await request.get(`/app/${appId.value}/files`)
    if (res.data.code === 0) {
      fileTree.value = res.data.data || []
      const firstFile = findFirstFile(fileTree.value)
      if (!activeFilePath.value && firstFile) {
        await setActiveFile(firstFile.path)
      }
    }
  } catch (error) {
    logger.warn('读取文件树失败：', error)
  }
}

const loadFileContent = async (path: string) => {
  if (!appId.value || !path) return
  try {
    const res = await request.get(`/app/${appId.value}/files/content`, {
      params: { path },
    })
    if (res.data.code === 0 && res.data.data) {
      fileContents[path] = res.data.data.content || ''
      fileStatus[path] = '已生成'
    }
  } catch (error) {
    logger.warn('读取文件内容失败：', error)
    fileStatus[path] = '读取失败'
  }
}

const findFirstFile = (nodes: AppFileNode[]): AppFileNode | undefined => {
  for (const node of nodes) {
    if (node.type === 'file') {
      return node
    }
    const child = findFirstFile(node.children || [])
    if (child) {
      return child
    }
  }
  return undefined
}

const upsertFileNode = (path: string, status = '生成中') => {
  const segments = path.split('/').filter(Boolean)
  let nodes = fileTree.value
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath = currentPath ? `${currentPath}/${segment}` : segment
    const isFile = index === segments.length - 1
    let node = nodes.find((item) => item.name === segment && item.path === currentPath)
    if (!node) {
      node = {
        name: segment,
        path: currentPath,
        type: isFile ? 'file' : 'directory',
        status,
        children: isFile ? undefined : [],
      }
      nodes.push(node)
    }
    if (isFile) {
      node.status = status
      fileStatus[path] = status
    } else {
      node.children ||= []
      nodes = node.children
    }
  })
}

const displayMessageContent = (content: string) => {
  return content.trim()
}

// 部署相关
const deploying = ref(false)
const deployModalVisible = ref(false)
const deployUrl = ref('')

// 下载相关
const downloading = ref(false)

// 提示词优化相关
const optimizing = ref(false)

// 可视化编辑相关
const isEditMode = ref(false)
const selectedElementInfo = ref<ElementInfo | null>(null)
const visualEditor = new VisualEditor({
  onElementSelected: (elementInfo: ElementInfo) => {
    selectedElementInfo.value = elementInfo
  },
})

// 权限相关
const isOwner = computed(() => {
  const appUserId = appInfo.value?.userId
  const loginUserId = loginUserStore.loginUser.id
  return appUserId != null && loginUserId != null && String(appUserId) === String(loginUserId)
})

const isAdmin = computed(() => {
  return loginUserStore.loginUser.userRole === 'admin'
})

const isDeployed = computed(() => {
  return !!(appInfo.value?.deployKey && appInfo.value?.deployedTime)
})

// 应用详情相关
const appDetailVisible = ref(false)

// 显示应用详情
const showAppDetail = () => {
  appDetailVisible.value = true
}

// 加载对话历史
const loadChatHistory = async (isLoadMore = false) => {
  if (!appId.value || loadingHistory.value) return
  loadingHistory.value = true
  try {
    const params: API.listAppChatHistoryParams = {
      appId: appId.value as unknown as number,
      pageSize: 10,
    }
    // 如果是加载更多，传递最后一条消息的创建时间作为游标
    if (isLoadMore && lastCreateTime.value) {
      params.lastCreateTime = lastCreateTime.value
    }
    const res = await listAppChatHistory(params)
    if (res.data.code === 0 && res.data.data) {
      const chatHistories = res.data.data.records || []
      if (chatHistories.length > 0) {
        // 将对话历史转换为消息格式，并按时间正序排列（老消息在前）
        const historyMessages: Message[] = chatHistories
          .map((chat) => ({
            type: (chat.messageType === 'user' ? 'user' : 'ai') as 'user' | 'ai',
            content: chat.message || '',
            createTime: chat.createTime,
          }))
          .reverse() // 反转数组，让老消息在前
        if (isLoadMore) {
          // 加载更多时，将历史消息添加到开头
          messages.value.unshift(...historyMessages)
        } else {
          // 初始加载，直接设置消息列表
          messages.value = historyMessages
        }
        // 更新游标
        lastCreateTime.value = chatHistories[chatHistories.length - 1]?.createTime
        // 检查是否还有更多历史
        hasMoreHistory.value = chatHistories.length === 10
      } else {
        hasMoreHistory.value = false
      }
      historyLoaded.value = true
    }
  } catch (error) {
    logger.error('加载对话历史失败：', error)
    message.error('加载对话历史失败')
  } finally {
    loadingHistory.value = false
  }
}

// 加载更多历史消息
const loadMoreHistory = async () => {
  await loadChatHistory(true)
}

// 获取应用信息
const fetchAppInfo = async () => {
  const id = route.params.id as string
  if (!id) {
    message.error('应用ID不存在')
    router.push('/')
    return
  }

  appId.value = id

  try {
    const res = await getAppVoById({ id: id as unknown as number })
    if (res.data.code === 0 && res.data.data) {
      appInfo.value = res.data.data
      // 先加载对话历史
      await loadChatHistory()
      await loadFileTree()
      // 如果有至少2条对话记录，展示对应的网站
      if (messages.value.length >= 2 || generatedFiles.value.length > 0) {
        updatePreview()
      }
      // 检查是否需要自动发送初始提示词
      // 只有在是自己的应用且没有对话历史时才自动发送
      if (
        appInfo.value.initPrompt &&
        isOwner.value &&
        messages.value.length === 0 &&
        historyLoaded.value
      ) {
        await sendInitialMessage(appInfo.value.initPrompt)
      }
    } else {
      message.error('获取应用信息失败')
      router.push('/')
    }
  } catch (error) {
    logger.error('获取应用信息失败：', error)
    message.error('获取应用信息失败')
    router.push('/')
  }
}

// 发送初始消息
const sendInitialMessage = async (prompt: string) => {
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: prompt,
  })

  // 添加AI消息占位符
  const aiMessageIndex = messages.value.length
  messages.value.push({
    type: 'ai',
    content: '',
    loading: true,
  })

  await nextTick()
  scrollToBottom()

  // 开始生成
  isGenerating.value = true
  await generateCode(prompt, aiMessageIndex)
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isGenerating.value) {
    return
  }

  let message = userInput.value.trim()
  // 如果有选中的元素，将元素信息添加到提示词中
  if (selectedElementInfo.value) {
    let elementContext = `\n\n选中元素信息：`
    if (selectedElementInfo.value.pagePath) {
      elementContext += `\n- 页面路径: ${selectedElementInfo.value.pagePath}`
    }
    elementContext += `\n- 标签: ${selectedElementInfo.value.tagName.toLowerCase()}\n- 选择器: ${selectedElementInfo.value.selector}`
    if (selectedElementInfo.value.textContent) {
      elementContext += `\n- 当前内容: ${selectedElementInfo.value.textContent.substring(0, 100)}`
    }
    message += elementContext
  }
  userInput.value = ''
  // 添加用户消息（包含元素信息）
  messages.value.push({
    type: 'user',
    content: message,
  })

  // 发送消息后，清除选中元素并退出编辑模式
  if (selectedElementInfo.value) {
    clearSelectedElement()
    if (isEditMode.value) {
      toggleEditMode()
    }
  }

  // 添加AI消息占位符
  const aiMessageIndex = messages.value.length
  messages.value.push({
    type: 'ai',
    content: '',
    loading: true,
  })

  await nextTick()
  scrollToBottom()

  // 开始生成
  isGenerating.value = true
  await generateCode(message, aiMessageIndex)
}

// 生成代码 - 使用 EventSource 处理流式响应
const generateCode = async (userMessage: string, aiMessageIndex: number) => {
  let eventSource: EventSource | null = null
  let streamCompleted = false

  try {
    activeWorkspaceTab.value = 'code'
    previewReady.value = false
    buildStatus.value = 'generating'
    buildMessage.value = '正在生成代码'

    // 获取 axios 配置的 baseURL
    const baseURL = request.defaults.baseURL || API_BASE_URL

    // 构建URL参数
    const params = new URLSearchParams({
      appId: appId.value || '',
      message: userMessage,
    })

    const url = `${baseURL}/app/chat/gen/code/v2?${params}`

    // 创建 EventSource 连接
    eventSource = new EventSource(url, {
      withCredentials: true,
    })

    const handleGenerationEvent = (event: MessageEvent) => {
      if (streamCompleted) return
      try {
        const parsed = JSON.parse(event.data) as GenerationEvent
        processGenerationEvent(parsed, aiMessageIndex)
      } catch (error) {
        logger.error('解析生成事件失败:', error)
        handleError(error, aiMessageIndex)
      }
    }

    const eventTypes = [
      'assistant_message',
      'tool_call',
      'file_start',
      'file_delta',
      'file_done',
      'file_delete',
      'build_status',
      'preview_ready',
      'generation_error',
    ]
    eventTypes.forEach((type) => {
      eventSource?.addEventListener(type, handleGenerationEvent as EventListener)
    })

    eventSource.addEventListener('done', function () {
      if (streamCompleted) return

      streamCompleted = true
      isGenerating.value = false
      messages.value[aiMessageIndex].loading = false
      eventSource?.close()

      setTimeout(async () => {
        await fetchAppInfo()
        await loadFileTree()
        updatePreview()
        if (buildStatus.value !== 'error') {
          activeWorkspaceTab.value = 'preview'
        }
      }, 500)
    })

    eventSource.addEventListener('business-error', function (event: MessageEvent) {
      if (streamCompleted) return

      try {
        const errorData = JSON.parse(event.data)
        logger.error('SSE业务错误事件:', errorData)

        // 显示具体的错误信息
        const errorMessage = errorData.message || '生成过程中出现错误'
        messages.value[aiMessageIndex].content = `❌ ${errorMessage}`
        messages.value[aiMessageIndex].loading = false
        message.error(errorMessage)

        streamCompleted = true
        isGenerating.value = false
        eventSource?.close()
      } catch (parseError) {
        logger.error('解析错误事件失败:', parseError, '原始数据:', event.data)
        handleError(new Error('服务器返回错误'), aiMessageIndex)
      }
    })

    // 处理错误
    eventSource.onerror = function () {
      if (streamCompleted || !isGenerating.value) return
      // 检查是否是正常的连接关闭
      if (eventSource?.readyState === EventSource.CONNECTING) {
        streamCompleted = true
        isGenerating.value = false
        messages.value[aiMessageIndex].loading = false
        eventSource?.close()

        setTimeout(async () => {
          await fetchAppInfo()
          await loadFileTree()
          updatePreview()
          if (buildStatus.value !== 'error') {
            activeWorkspaceTab.value = 'preview'
          }
        }, 500)
      } else {
        handleError(new Error('SSE连接错误'), aiMessageIndex)
      }
    }
  } catch (error) {
    logger.error('创建 EventSource 失败：', error)
    handleError(error, aiMessageIndex)
  }
}

const processGenerationEvent = (event: GenerationEvent, aiMessageIndex: number) => {
  switch (event.type) {
    case 'assistant_message':
      appendAiMessage(aiMessageIndex, event.content || '')
      break
    case 'tool_call':
      appendToolMessage(aiMessageIndex, event.message || event.content || '')
      break
    case 'file_start':
      if (event.path) {
        upsertFileNode(event.path, '生成中')
        activeFilePath.value = event.path
        activeWorkspaceTab.value = 'code'
        scrollCodeToBottom()
      }
      break
    case 'file_delta':
      if (event.path) {
        upsertFileNode(event.path, '生成中')
        fileContents[event.path] = event.overwrite === false
          ? `${fileContents[event.path] || ''}${event.content || ''}`
          : event.content || ''
        activeFilePath.value = event.path
        activeWorkspaceTab.value = 'code'
        scrollCodeToBottom()
      }
      break
    case 'file_done':
      if (event.path) {
        upsertFileNode(event.path, '已生成')
        fileStatus[event.path] = '已生成'
      }
      break
    case 'build_status':
      buildStatus.value = normalizeBuildStatus(event.status)
      buildMessage.value = event.message || event.content || ''
      appendToolMessage(aiMessageIndex, buildMessage.value)
      break
    case 'preview_ready':
      buildStatus.value = 'success'
      buildMessage.value = event.message || event.content || '预览已更新'
      updatePreview()
      loadFileTree()
      activeWorkspaceTab.value = 'preview'
      break
    case 'generation_error':
      buildStatus.value = 'error'
      appendToolMessage(aiMessageIndex, event.message || event.content || '生成过程中出现错误')
      message.error(event.message || event.content || '生成过程中出现错误')
      break
  }
  messages.value[aiMessageIndex].loading = false
  scrollToBottom()
}

const appendAiMessage = (aiMessageIndex: number, content: string) => {
  if (!content) return
  messages.value[aiMessageIndex].content += content
}

const appendToolMessage = (aiMessageIndex: number, content: string) => {
  if (!content) return
  messages.value[aiMessageIndex].content += `\n\n> ${content}\n`
}

const normalizeBuildStatus = (status?: string) => {
  if (status === 'building') return 'building'
  if (status === 'success') return 'success'
  if (status === 'error') return 'error'
  return 'generating'
}

// 错误处理函数
const handleError = (error: unknown, aiMessageIndex: number) => {
  logger.error('生成代码失败：', error)
  messages.value[aiMessageIndex].content = '抱歉，生成过程中出现了错误，请重试。'
  messages.value[aiMessageIndex].loading = false
  message.error('生成失败，请重试')
  isGenerating.value = false
}

// 更新预览
const updatePreview = () => {
  if (appId.value) {
    const codeGenType = appInfo.value?.codeGenType || CodeGenTypeEnum.HTML
    const newPreviewUrl = getStaticPreviewUrl(codeGenType, appId.value)
    // 添加时间戳确保iframe刷新
    const timestamp = new Date().getTime()
    previewUrl.value = `${newPreviewUrl}?t=${timestamp}`
    previewReady.value = true
    loadFileTree()
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const scrollCodeToBottom = () => {
  nextTick(() => {
    if (codePreviewContainer.value) {
      codePreviewContainer.value.scrollTop = codePreviewContainer.value.scrollHeight
    }
  })
}

// 下载代码
const downloadCode = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }

  // 检查应用是否已部署
  if (!isDeployed.value) {
    message.error('请先部署应用后再下载代码')
    return
  }

  downloading.value = true
  try {
    const API_BASE_URL = request.defaults.baseURL || ''
    const url = `${API_BASE_URL}/app/download/${appId.value}`
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) {
      const errorText = await response.text()
      if (errorText.includes('应用未部署')) {
        message.error('请先部署应用后再下载代码')
      } else {
        throw new Error(`下载失败: ${response.status}`)
      }
      return
    }
    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition')
    const fileName = contentDisposition?.match(/filename="(.+)"/)?.[1] || `app-${appId.value}.zip`
    // 下载文件
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    link.click()
    // 清理
    URL.revokeObjectURL(downloadUrl)
    message.success('代码下载成功')
  } catch (error) {
    logger.error('下载失败：', error)
    message.error('下载失败，请重试')
  } finally {
    downloading.value = false
  }
}

// 部署应用
const deployApp = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }

  deploying.value = true
  try {
    const res = await deployAppApi({
      appId: appId.value as unknown as number,
    })

    if (res.data.code === 0 && res.data.data) {
      deployUrl.value = res.data.data
      deployModalVisible.value = true
      message.success('部署成功')
    } else {
      message.error('部署失败：' + res.data.message)
    }
  } catch (error) {
    logger.error('部署失败：', error)
    message.error('部署失败，请重试')
  } finally {
    deploying.value = false
  }
}

// 在新窗口打开预览
const openInNewTab = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
  }
}

// 打开部署的网站
const openDeployedSite = () => {
  if (deployUrl.value) {
    window.open(deployUrl.value, '_blank')
  }
}

// iframe加载完成
const onIframeLoad = () => {
  previewReady.value = true
  // 移除URL中的时间戳参数，保持URL整洁
  if (previewUrl.value.includes('?t=')) {
    const baseUrl = previewUrl.value.split('?t=')[0]
    previewUrl.value = baseUrl
  }
  // 初始化可视化编辑器
  const iframe = document.querySelector('.preview-iframe') as HTMLIFrameElement
  if (iframe) {
    visualEditor.init(iframe)
    visualEditor.onIframeLoad()
  }
}

// 编辑应用
const editApp = () => {
  if (appInfo.value?.id) {
    router.push(`/app/edit/${appInfo.value.id}`)
  }
}

// 删除应用
const deleteApp = async () => {
  if (!appInfo.value?.id) return

  try {
    const res = await deleteAppApi({ id: appInfo.value.id })
    if (res.data.code === 0) {
      message.success('删除成功')
      appDetailVisible.value = false
      router.push('/')
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (error) {
    logger.error('删除失败：', error)
    message.error('删除失败')
  }
}

// 可视化编辑相关函数
const toggleEditMode = () => {
  // 检查 iframe 是否已经加载
  const iframe = document.querySelector('.preview-iframe') as HTMLIFrameElement
  if (!iframe) {
    message.warning('请等待页面加载完成')
    return
  }
  // 确保 visualEditor 已初始化
  if (!previewReady.value) {
    message.warning('请等待页面加载完成')
    return
  }
  const newEditMode = visualEditor.toggleEditMode()
  isEditMode.value = newEditMode
}

const clearSelectedElement = () => {
  selectedElementInfo.value = null
  visualEditor.clearSelection()
}

const getInputPlaceholder = () => {
  if (selectedElementInfo.value) {
    return `正在编辑 ${selectedElementInfo.value.tagName.toLowerCase()} 元素，描述您想要的修改...`
  }
  return '请描述你想生成的网站，越详细效果越好哦'
}

// 优化用户提示词
const optimizeUserPrompt = async () => {
  const originalPrompt = userInput.value.trim()
  if (!originalPrompt) {
    message.warning('请先输入提示词')
    return
  }

  optimizing.value = true
  try {
    const res = await optimizePrompt({ originalPrompt })
    logger.info('优化提示词响应：', res)
    if (res.data.code === 0 && res.data.data) {
      userInput.value = res.data.data
      message.success('提示词优化成功！')
    } else {
      message.error('优化失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    logger.error('优化提示词失败：', error)
    message.error('优化失败，请重试')
  } finally {
    optimizing.value = false
  }
}

// 页面加载时获取应用信息
onMounted(() => {
  fetchAppInfo()

  // 监听 iframe 消息
  window.addEventListener('message', (event) => {
    visualEditor.handleIframeMessage(event)
  })
})

// 清理资源
onUnmounted(() => {
  // EventSource 会在组件卸载时自动清理
})
</script>

<style scoped>
#appChatPage {
  height: 100vh;
  min-height: 680px;
  display: flex;
  flex-direction: column;
  background: #070b14;
  color: #e5ebf7;
  overflow: hidden;
}

.workbench-header {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 0 18px;
  background: #0a0f1c;
  border-bottom: 1px solid #20283a;
}

.brand-area,
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.brand-link {
  display: flex;
  align-items: center;
}

.brand-link img {
  width: 86px;
  height: 30px;
  object-fit: contain;
  filter: brightness(1.2);
}

.project-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 220px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #263149;
  border-radius: 5px;
  background: #111827;
  color: #d8e2f4;
  cursor: pointer;
}

.project-switch span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code-gen-type-tag {
  color: #9fb6ff;
  background: rgba(65, 105, 255, 0.12);
  border-color: rgba(65, 105, 255, 0.32);
}

.toolbar-btn,
.workspace-action {
  height: 32px;
  border-color: #263149;
  background: #111827;
  color: #d8e2f4;
}

.toolbar-btn:hover,
.workspace-action:hover {
  border-color: #4169ff;
  color: #ffffff;
  background: #172036;
}

.deploy-btn {
  height: 32px;
  border: none;
  background: linear-gradient(135deg, #4169ff 0%, #254ff0 100%);
  font-weight: 700;
}

.workbench-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(360px, 34%) 1fr;
  gap: 1px;
  overflow: hidden;
  background: #20283a;
}

.chat-panel {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #0b111d;
}

.chat-panel-header {
  padding: 14px 16px 12px;
  border-bottom: 1px solid #1f293a;
}

.new-chat-btn {
  width: 100%;
  height: 38px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #4b67ff 0%, #254ff0 100%);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.workspace-nav {
  display: grid;
  gap: 6px;
  margin-top: 14px;
}

.workspace-nav-item {
  height: 34px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #9ca9bd;
  cursor: pointer;
  text-align: left;
}

.workspace-nav-item.active,
.workspace-nav-item:hover {
  color: #f8fbff;
  background: #161f31;
  border-color: #263149;
}

.messages-container {
  flex: 1;
  height: 100%;
  min-height: 0;
  padding: 18px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
}

.messages-container::-webkit-scrollbar,
.code-preview-scroller::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

.messages-container::-webkit-scrollbar-track,
.code-preview-scroller::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb,
.code-preview-scroller::-webkit-scrollbar-thumb {
  background: #263149;
  border-radius: 999px;
}

.message-item {
  margin-bottom: 18px;
}

.user-message {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.ai-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.message-content {
  max-width: 88%;
  padding: 13px 15px;
  border-radius: 8px;
  line-height: 1.7;
  word-wrap: break-word;
  font-size: 14px;
}

.user-message .message-content {
  background: linear-gradient(135deg, #4169ff 0%, #254ff0 100%);
  color: #ffffff;
  border-bottom-right-radius: 3px;
}

.ai-message .message-content {
  background: transparent;
  color: #d8e2f4;
  padding: 0;
}

.ai-name {
  margin-bottom: 8px;
  color: #f8fbff;
  font-weight: 700;
}

.message-time {
  margin-top: 6px;
  color: #69758a;
  font-size: 12px;
}

.message-avatar {
  flex-shrink: 0;
}

.message-avatar .ant-avatar {
  background: #15213a;
  border: 1px solid #2a3650;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #91a8ff;
  font-size: 14px;
  font-weight: 600;
}

.load-more-container {
  text-align: center;
  padding: 6px 0 12px;
}

.generated-files-card {
  margin: 14px 0 4px 44px;
  padding: 14px;
  border: 1px solid #263149;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(22, 31, 49, 0.96), rgba(13, 19, 32, 0.96));
}

.generated-files-title {
  margin-bottom: 10px;
  color: #e5ebf7;
  font-weight: 700;
}

.generated-file-row {
  display: grid;
  grid-template-columns: 18px 1fr auto;
  align-items: center;
  gap: 9px;
  padding: 6px 0;
  color: #aebbd0;
  font-size: 13px;
}

.generated-file-row em {
  color: #6f7d91;
  font-style: normal;
}

.input-container {
  padding: 14px;
  background: #0b111d;
  border-top: 1px solid #1f293a;
}

.input-wrapper {
  position: relative;
}

.input-wrapper :deep(.ant-input) {
  min-height: 96px;
  padding: 14px 84px 14px 14px;
  border: 1px solid #263149;
  border-radius: 8px;
  background: #111827;
  color: #e5ebf7;
  resize: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrapper :deep(.ant-input::placeholder) {
  color: #69758a;
}

.input-wrapper :deep(.ant-input:focus) {
  border-color: #4169ff;
  box-shadow: 0 0 0 3px rgba(65, 105, 255, 0.16);
}

.input-actions {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  gap: 8px;
}

.icon-action-btn,
.send-btn {
  width: 34px;
  height: 34px;
  display: inline-grid;
  place-items: center;
  border-radius: 6px;
}

.icon-action-btn {
  border-color: #263149;
  background: #0b111d;
  color: #aebbd0;
}

.send-btn {
  border: none;
  background: linear-gradient(135deg, #4169ff 0%, #254ff0 100%);
}

.workspace-panel {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #090e19;
}

.workspace-tabs {
  height: 44px;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 12px;
  background: #0b111d;
  border-bottom: 1px solid #20283a;
}

.workspace-tabs > button {
  height: 32px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: #9ca9bd;
  font-weight: 700;
  cursor: pointer;
}

.workspace-tabs > button.active,
.workspace-tabs > button:hover {
  color: #ffffff;
  background: #151d2e;
  border-color: #263149;
}

.workspace-spacer {
  flex: 1;
}

.preview-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fbff;
}

.browser-bar {
  height: 42px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  background: #111827;
  border-bottom: 1px solid #263149;
}

.browser-controls {
  display: flex;
  gap: 6px;
}

.browser-controls span {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #39445a;
}

.address-bar {
  flex: 1;
  min-width: 0;
  height: 26px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 5px;
  background: #1b2436;
  color: #aebbd0;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-placeholder,
.preview-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #61708a;
}

.placeholder-icon {
  margin-bottom: 14px;
  color: #4169ff;
  font-size: 44px;
}

.preview-loading p {
  margin-top: 16px;
  font-weight: 700;
}

.preview-iframe {
  flex: 1;
  width: 100%;
  min-height: 0;
  border: none;
  background: #ffffff;
}

.code-workspace {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 240px 1fr;
  overflow: hidden;
  background: #090e19;
}

.file-tree {
  min-height: 0;
  padding: 14px;
  overflow: auto;
  background: #0b111d;
  border-right: 1px solid #20283a;
}

.file-tree-title {
  margin-bottom: 10px;
  color: #e5ebf7;
  font-size: 13px;
  font-weight: 800;
}

.code-pane {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.code-pane-header {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  background: #111827;
  border-bottom: 1px solid #20283a;
  color: #e5ebf7;
}

.code-pane-header em {
  color: #69758a;
  font-style: normal;
  font-size: 12px;
}

.code-preview-scroller {
  flex: 1;
  height: 0;
  max-height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  overflow: auto;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
  color: #24292f;
  background: #ffffff;
  font-family: var(--font-family-code);
  font-size: 13px;
  line-height: 22px;
  tab-size: 2;
}

.code-gutter {
  position: sticky;
  left: 0;
  z-index: 1;
  flex: 0 0 52px;
  padding: 18px 10px 18px 0;
  border-right: 1px solid #d8dee4;
  background: #f6f8fa;
  color: #8c959f;
  text-align: right;
  user-select: none;
}

.code-gutter span {
  display: block;
  height: 22px;
  line-height: 22px;
}

.code-preview-scroller pre {
  min-width: max-content;
  margin: 0;
  padding: 18px;
  overflow: visible;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: 22px;
  white-space: pre;
}

.code-preview-scroller code {
  display: block;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: 22px;
}

.code-preview-scroller :deep(.hljs-tag),
.code-preview-scroller :deep(.hljs-name),
.code-preview-scroller :deep(.hljs-selector-tag) {
  color: #116329;
}

.code-preview-scroller :deep(.hljs-attr),
.code-preview-scroller :deep(.hljs-attribute),
.code-preview-scroller :deep(.hljs-property),
.code-preview-scroller :deep(.hljs-variable) {
  color: #0550ae;
}

.code-preview-scroller :deep(.hljs-string),
.code-preview-scroller :deep(.hljs-section) {
  color: #0a3069;
}

.code-preview-scroller :deep(.hljs-keyword),
.code-preview-scroller :deep(.hljs-built_in) {
  color: #cf222e;
}

.code-preview-scroller :deep(.hljs-title),
.code-preview-scroller :deep(.hljs-selector-class),
.code-preview-scroller :deep(.hljs-selector-id) {
  color: #8250df;
}

.code-preview-scroller :deep(.hljs-number),
.code-preview-scroller :deep(.hljs-literal) {
  color: #0550ae;
}

.code-preview-scroller :deep(.hljs-comment) {
  color: #6e7781;
  font-style: italic;
}

.selected-element-alert {
  margin: 0 14px;
  border-radius: 8px;
  background: rgba(65, 105, 255, 0.12);
  border: 1px solid rgba(65, 105, 255, 0.28);
}

.selected-element-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.element-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.element-tag {
  padding: 4px 10px;
  background: linear-gradient(135deg, #4169ff 0%, #254ff0 100%);
  color: white;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.element-id {
  padding: 4px 10px;
  background: rgba(90, 124, 255, 0.16);
  color: #9fb6ff;
  border-radius: 999px;
  font-size: 12px;
  font-family: var(--font-family-code);
}

.element-class {
  padding: 4px 10px;
  background: rgba(37, 207, 173, 0.12);
  color: #7de8d2;
  border-radius: 999px;
  font-size: 12px;
  font-family: var(--font-family-code);
}

.element-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.element-item {
  font-size: 13px;
  color: #aebbd0;
  display: flex;
  gap: 8px;
}

.element-selector-code {
  padding: 2px 8px;
  background: rgba(7, 11, 20, 0.6);
  border-radius: 4px;
  font-family: var(--font-family-code);
  font-size: 12px;
}

/* Light workbench theme */
#appChatPage {
  background: #eef3fb;
  color: #172033;
}

.workbench-header {
  background: rgba(255, 255, 255, 0.96);
  border-bottom-color: #dbe3ef;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

.brand-link img {
  filter: none;
}

.project-switch,
.toolbar-btn,
.workspace-action {
  border-color: #d7dfec;
  background: #ffffff;
  color: #334155;
}

.project-switch:hover,
.toolbar-btn:hover,
.workspace-action:hover {
  border-color: #9db4ff;
  background: #f2f6ff;
  color: #254ff0;
}

.code-gen-type-tag {
  color: #3157d5;
  background: #eef3ff;
  border-color: #cbd7ff;
}

.deploy-btn,
.send-btn,
.new-chat-btn,
.element-tag {
  background: linear-gradient(135deg, #4169ff 0%, #254ff0 100%);
  color: #ffffff;
}

.workbench-body {
  background: #dbe3ef;
}

.chat-panel,
.input-container {
  background: #f7f9fc;
}

.chat-panel-header,
.input-container {
  border-color: #dbe3ef;
}

.workspace-nav-item {
  color: #64748b;
}

.workspace-nav-item.active,
.workspace-nav-item:hover {
  color: #254ff0;
  background: #eef3ff;
  border-color: #cbd7ff;
}

.messages-container::-webkit-scrollbar-thumb,
.code-preview-scroller::-webkit-scrollbar-thumb {
  background: #c7d0df;
}

.ai-message .message-content {
  color: #273449;
}

.ai-name,
.generated-files-title,
.file-tree-title {
  color: #172033;
}

.message-time,
.generated-file-row em,
.code-pane-header em {
  color: #7b8798;
}

.message-avatar .ant-avatar {
  background: #eef3ff;
  border-color: #d7dfec;
}

.loading-indicator,
.placeholder-icon {
  color: #3157d5;
}

.generated-files-card {
  border-color: #dbe3ef;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.generated-file-row,
.element-item {
  color: #516078;
}

.input-wrapper :deep(.ant-input) {
  border-color: #d7dfec;
  background: #ffffff;
  color: #172033;
}

.input-wrapper :deep(.ant-input::placeholder) {
  color: #8793a6;
}

.input-wrapper :deep(.ant-input:focus) {
  border-color: #4169ff;
  box-shadow: 0 0 0 3px rgba(65, 105, 255, 0.13);
}

.icon-action-btn {
  border-color: #d7dfec;
  background: #ffffff;
  color: #64748b;
}

.icon-action-btn:hover {
  border-color: #9db4ff;
  background: #f2f6ff;
  color: #254ff0;
}

.workspace-panel,
.workspace-tabs,
.code-workspace {
  background: #ffffff;
}

.workspace-tabs {
  border-bottom-color: #dbe3ef;
}

.workspace-tabs > button {
  color: #64748b;
}

.workspace-tabs > button.active,
.workspace-tabs > button:hover {
  color: #254ff0;
  background: #eef3ff;
  border-color: #cbd7ff;
}

.browser-bar {
  background: #f3f6fb;
  border-bottom-color: #dbe3ef;
}

.browser-controls span {
  background: #c7d0df;
}

.address-bar {
  border: 1px solid #dbe3ef;
  background: #ffffff;
  color: #64748b;
}

.preview-placeholder,
.preview-loading {
  color: #64748b;
}

.file-tree {
  background: #f8fafd;
  border-right-color: #dbe3ef;
}

.code-pane-header {
  background: #f8fafd;
  border-bottom-color: #dbe3ef;
  color: #172033;
}

.code-preview-scroller {
  color: #24292f;
  background: #ffffff;
  box-shadow: inset 0 1px 0 rgba(15, 23, 42, 0.04);
}

.code-gutter {
  background: #f6f8fa;
  border-right-color: #d8dee4;
}

.selected-element-alert {
  background: #eef3ff;
  border-color: #cbd7ff;
}

.element-id {
  background: #eef3ff;
  color: #3157d5;
}

.element-class {
  background: #ecfdf7;
  color: #087f5b;
}

.element-selector-code {
  background: #eef2f7;
  color: #334155;
}

@media (max-width: 1024px) {
  #appChatPage {
    min-height: 900px;
  }

  .workbench-body {
    grid-template-columns: 1fr;
    grid-template-rows: 420px minmax(0, 1fr);
  }

  .code-workspace {
    grid-template-columns: 190px 1fr;
  }
}

@media (max-width: 768px) {
  .workbench-header {
    height: auto;
    min-height: 54px;
    align-items: flex-start;
    flex-direction: column;
    padding: 10px 12px;
  }

  .brand-area,
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .workbench-body {
    grid-template-rows: 420px minmax(0, 1fr);
  }

  .message-content {
    max-width: 94%;
  }

  .workspace-tabs {
    overflow-x: auto;
  }

  .code-workspace {
    grid-template-columns: 1fr;
  }

  .file-tree {
    display: none;
  }

}
</style>
