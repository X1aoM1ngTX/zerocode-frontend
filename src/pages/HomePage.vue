<template>
  <div id="homePage">
    <!-- 粒子背景 -->
    <ParticleSystem />

    <div class="container">
      <!-- 网站标题和描述 -->
      <div class="hero-section">
        <div class="hero-badge">
          <span class="badge-icon">✨</span>
          <span>AI 驱动的零代码平台</span>
        </div>
        <h1 class="hero-title">
          <span class="title-highlight">AI 应用生成平台</span>
        </h1>
        <p class="hero-description">用 AI 创造无限可能，让每个想法都能快速变为现实</p>
        <!-- <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-value">10K+</div>
            <div class="stat-label">应用创建</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">5K+</div>
            <div class="stat-label">活跃用户</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">99%</div>
            <div class="stat-label">满意度</div>
          </div>
        </div> -->
      </div>

      <!-- 用户提示词输入框 -->
      <div class="input-section">
        <a-textarea
          v-model:value="userPrompt"
          placeholder="描述你想要创建的应用，例如：帮我创建一个现代化的个人博客网站..."
          :auto-size="{ minRows: 4, maxRows: 10 }"
          :maxlength="1000"
          class="prompt-input"
          @keydown.ctrl.enter="createApp"
        />
        <div class="input-actions">
          <a-button @click="optimizePrompt" :loading="optimizing" class="optimize-btn">
            <template #icon>
              <ThunderboltOutlined />
            </template>
            {{ optimizing ? '优化中...' : '优化提示词' }}
          </a-button>
          <a-button
            type="primary"
            @click="createApp"
            :loading="creating"
            size="large"
            class="create-btn"
          >
            <template #icon>
              <EnterOutlined />
            </template>
            {{ creating ? '创建中...' : '开始创建' }}
          </a-button>
        </div>
        <div class="input-hint">
          <span class="hint-icon">💡</span>
          按 Ctrl + Enter 快速创建
        </div>
      </div>

      <!-- 快捷按钮 -->
      <div class="quick-actions">
        <div class="quick-actions-header">
          <h3 class="quick-actions-title">快速开始</h3>
          <p class="quick-actions-subtitle">选择一个模板快速创建应用</p>
        </div>
        <div class="quick-actions-grid">
          <div
            v-for="template in appTemplates"
            :key="template.id"
            class="quick-action-card"
            @click="setPrompt(template.prompt)"
          >
            <div class="card-icon">{{ template.icon }}</div>
            <div class="card-content">
              <div class="card-title">{{ template.title }}</div>
              <div class="card-description">{{ template.description }}</div>
            </div>
            <div class="card-arrow">→</div>
          </div>
        </div>
      </div>

      <!-- 我的作品 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">我的作品</h2>
          <div class="section-actions">
            <a-button type="link" @click="loadMyApps" :loading="loadingMyApps">
              <template #icon>
                <ReloadOutlined />
              </template>
              刷新
            </a-button>
          </div>
        </div>

        <!-- 骨架屏 -->
        <SkeletonLoader v-if="loadingMyApps" type="card" :count="3" />

        <!-- 空状态 -->
        <EmptyState
          v-else-if="myApps.length === 0"
          type="noData"
          title="还没有创建任何应用"
          description="开始创建你的第一个应用吧！"
        >
          <template #action>
            <a-button type="primary" size="large" @click="scrollToInput">
              <template #icon>
                <PlusOutlined />
              </template>
              创建应用
            </a-button>
          </template>
        </EmptyState>

        <!-- 应用列表 -->
        <template v-else>
          <TransitionGroup name="list" tag="div" class="app-grid">
            <AppCard
              v-for="app in myApps"
              :key="app.id"
              :app="app"
              @view-chat="viewChat"
              @view-work="viewWork"
            />
          </TransitionGroup>
          <div v-if="myAppsPage.total > myAppsPage.pageSize" class="pagination-wrapper">
            <a-pagination
              v-model:current="myAppsPage.current"
              v-model:page-size="myAppsPage.pageSize"
              :total="myAppsPage.total"
              :show-size-changer="false"
              :show-total="(total: number) => `共 ${total} 个应用`"
              @change="loadMyApps"
            />
          </div>
        </template>
      </div>

      <!-- 精选案例 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">🔥</span>
            精选案例
          </h2>
        </div>

        <!-- 骨架屏 -->
        <SkeletonLoader v-if="loadingFeatured" type="card" :count="3" />

        <!-- 应用列表 -->
        <template v-else>
          <TransitionGroup name="list" tag="div" class="featured-grid">
            <AppCard
              v-for="app in featuredApps"
              :key="app.id"
              :app="app"
              :featured="true"
              @view-chat="viewChat"
              @view-work="viewWork"
            />
          </TransitionGroup>
          <div v-if="featuredAppsPage.total > featuredAppsPage.pageSize" class="pagination-wrapper">
            <a-pagination
              v-model:current="featuredAppsPage.current"
              v-model:page-size="featuredAppsPage.pageSize"
              :total="featuredAppsPage.total"
              :show-size-changer="false"
              :show-total="(total: number) => `共 ${total} 个案例`"
              @change="loadFeaturedApps"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ThunderboltOutlined,
  EnterOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { addApp, listMyAppVoByPage, listGoodAppVoByPage, optimizePrompt as optimizePromptApi } from '@/api/app'
import { getDeployUrl } from '@/config/env'
import AppCard from '@/components/AppCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ParticleSystem from '@/components/common/ParticleSystem.vue'
import { useLoading, useErrorHandler, useDebounceFn } from '@/composables'

const router = useRouter()
const loginUserStore = useLoginUserStore()
const { handleError } = useErrorHandler()

// 用户提示词
const userPrompt = ref('')
const creating = ref(false)
const optimizing = ref(false)

// 加载状态
const { loading: loadingMyApps, withLoading: loadMyAppsWithLoading } = useLoading()
const { loading: loadingFeatured, withLoading: loadFeaturedWithLoading } = useLoading()

// 我的应用数据
const myApps = ref<API.AppVO[]>([])
const myAppsPage = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

// 精选应用数据
const featuredApps = ref<API.AppVO[]>([])
const featuredAppsPage = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

// 应用模板配置
interface AppTemplate {
  id: string
  icon: string
  title: string
  description: string
  prompt: string
}

const appTemplates: AppTemplate[] = [
  {
    id: 'blog',
    icon: '📝',
    title: '个人博客',
    description: '展示文章、分享想法',
    prompt: '创建一个现代化的个人博客网站，包含文章列表、详情页、分类标签、搜索功能和个人简介页面。采用简洁的设计风格，支持响应式布局，文章支持Markdown格式，首页展示最新文章和热门推荐。',
  },
  {
    id: 'company',
    icon: '🏢',
    title: '企业官网',
    description: '展示公司形象与服务',
    prompt: '设计一个专业的企业官网，包含公司介绍、产品服务展示、新闻资讯、联系我们等页面。采用商务风格的设计，包含轮播图、产品展示卡片、团队介绍、客户案例展示，支持多语言切换。',
  },
  {
    id: 'ecommerce',
    icon: '🛒',
    title: '在线商城',
    description: '电商购物平台',
    prompt: '构建一个功能完整的在线商城，包含商品展示、商品详情、购物车展示等功能。设计现代化的商品卡片布局，支持商品搜索筛选、商品分类、用户评价展示、优惠券展示和会员等级展示。',
  },
  {
    id: 'social',
    icon: '👥',
    title: '社交媒体社区',
    description: '连接用户、分享内容',
    prompt: '开发一个功能丰富的社交媒体社区平台，包含用户主页展示、动态信息流展示、点赞展示、评论展示、关注展示等核心功能。支持图文视频内容展示、话题标签展示、好友推荐展示和内容分享展示。设计现代化的社交界面，支持深色模式，提供数据统计分析展示。',
  },
  {
    id: 'task',
    icon: '✅',
    title: '任务管理',
    description: '高效管理日常任务',
    prompt: '开发一个实用的任务管理系统，包含任务列表、任务分类、优先级设置、截止日期展示、进度追踪等功能。支持拖拽排序、批量操作、任务标签和搜索过滤。设计简洁直观的界面，支持深色模式切换，提供数据统计和可视化图表。',
  },
  {
    id: 'education',
    icon: '📚',
    title: '在线教育',
    description: '学习课程与知识分享',
    prompt: '搭建一个在线教育平台，包含课程展示、视频播放、学习进度展示、测验题目展示、讨论区展示等模块。支持课程分类、讲师介绍、学习路径推荐展示、证书展示等功能。设计清晰的学习界面，支持多端适配，提供学习数据统计和成就展示。',
  },
]

// 设置提示词
const setPrompt = (prompt: string) => {
  userPrompt.value = prompt
}

// 滚动到输入框
const scrollToInput = () => {
  const inputElement = document.querySelector('.input-section')
  if (inputElement) {
    inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => {
      const textarea = inputElement.querySelector('textarea')
      if (textarea) {
        textarea.focus()
      }
    }, 500)
  }
}

// 优化提示词
const optimizePrompt = async () => {
  if (!userPrompt.value.trim()) {
    message.warning('请先输入应用描述')
    return
  }

  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    await router.push('/user/login')
    return
  }

  optimizing.value = true
  try {
    const res = await optimizePromptApi({
      originalPrompt: userPrompt.value,
    })

    if (res.data.code === 0 && res.data.data) {
      userPrompt.value = res.data.data
      message.success('提示词优化成功')
    } else {
      message.error('优化失败：' + res.data.message)
    }
  } catch (error) {
    handleError(error, { defaultMessage: '优化失败，请重试' })
  } finally {
    optimizing.value = false
  }
}

// 创建应用
const createApp = async () => {
  if (!userPrompt.value.trim()) {
    message.warning('请输入应用描述')
    return
  }

  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    await router.push('/user/login')
    return
  }

  creating.value = true
  try {
    const res = await addApp({
      initPrompt: userPrompt.value.trim(),
    })

    if (res.data.code === 0 && res.data.data) {
      message.success('应用创建成功')
      // 跳转到对话页面，确保ID是字符串类型
      const appId = String(res.data.data)
      await router.push(`/app/chat/${appId}`)
    } else {
      message.error('创建失败：' + res.data.message)
    }
  } catch (error) {
    handleError(error, { defaultMessage: '创建失败，请重试' })
  } finally {
    creating.value = false
  }
}

// 加载我的应用
const loadMyApps = async () => {
  if (!loginUserStore.loginUser.id) {
    return
  }

  await loadMyAppsWithLoading(async () => {
    const res = await listMyAppVoByPage({
      current: myAppsPage.current,
      pageSize: myAppsPage.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0 && res.data.data) {
      myApps.value = res.data.data.records || []
      myAppsPage.total = res.data.data.totalRow || 0
    }
  })
}

// 加载精选应用
const loadFeaturedApps = async () => {
  await loadFeaturedWithLoading(async () => {
    const res = await listGoodAppVoByPage({
      current: featuredAppsPage.current,
      pageSize: featuredAppsPage.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0 && res.data.data) {
      featuredApps.value = res.data.data.records || []
      featuredAppsPage.total = res.data.data.totalRow || 0
    }
  })
}

// 查看对话
const viewChat = (appId: string | number | undefined) => {
  if (appId) {
    router.push(`/app/chat/${appId}?view=1`)
  }
}

// 查看作品
const viewWork = (app: API.AppVO) => {
  if (app.deployKey) {
    const url = getDeployUrl(app.deployKey)
    window.open(url, '_blank')
  }
}

// 优化的鼠标移动处理（使用防抖）
const handleMouseMove = useDebounceFn((e: MouseEvent) => {
  const { clientX, clientY } = e
  const { innerWidth, innerHeight } = window
  const x = (clientX / innerWidth) * 100
  const y = (clientY / innerHeight) * 100

  document.documentElement.style.setProperty('--mouse-x', `${x}%`)
  document.documentElement.style.setProperty('--mouse-y', `${y}%`)
}, { delay: 20 }) // 20ms 防抖，大幅减少更新频率

// 页面加载时获取数据
onMounted(() => {
  loadMyApps()
  loadFeaturedApps()

  // 添加鼠标移动监听（已优化）
  document.addEventListener('mousemove', handleMouseMove)
})

// 页面卸载时移除监听器
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
#homePage {
  width: 100%;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  /* AI 主题渐变背景 */
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.15), transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(6, 182, 212, 0.12), transparent),
    linear-gradient(180deg, var(--color-bg-base) 0%, var(--color-bg-layout) 100%);
  position: relative;
  overflow: hidden;
}

/* 科技感网格背景 */
#homePage::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px);
  background-size: 80px 80px;
  pointer-events: none;
  opacity: 0.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}

/* 英雄区域 */
.hero-section {
  text-align: center;
  padding: 80px 0 60px;
  margin-bottom: 60px;
  color: var(--color-text-base);
  position: relative;
  overflow: hidden;
}

/* 英雄区域背景光晕 */
.hero-section::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: var(--glass-bg-light);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-full);
  margin-bottom: 28px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  border: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15);
  animation: slide-in-down 0.6s ease-out;
  position: relative;
  z-index: 1;
  transition: all var(--transition-base);
}

.hero-badge:hover {
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: var(--shadow-glow-purple);
  transform: translateY(-2px);
}

.badge-icon {
  font-size: 18px;
}

.hero-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-hero);
  font-weight: var(--font-weight-bold);
  margin: 0 0 24px;
  line-height: 1.1;
  position: relative;
  z-index: 2;
  animation: slide-in-up 0.6s ease-out 0.1s both;
}

.title-highlight {
  background: var(--gradient-ai-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradient-shift 4s ease infinite;
}

.hero-description {
  font-family: var(--font-family-body);
  font-size: var(--font-size-xl);
  margin: 0 0 48px;
  color: var(--color-text-secondary);
  position: relative;
  z-index: 2;
  animation: slide-in-up 0.6s ease-out 0.2s both;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-top: 40px;
  animation: slide-in-up 0.6s ease-out 0.3s both;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(59, 130, 246, 0.2);
}

/* 输入区域 */
.input-section {
  position: relative;
  margin: 0 auto 48px;
  max-width: 800px;
  animation: slide-in-up 0.6s ease-out 0.4s both;
}

.prompt-input {
  background: var(--glass-bg-light);
  backdrop-filter: blur(12px);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 20px;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-2);
}

.prompt-input:focus {
  background: var(--glass-bg-light);
  border-color: var(--color-primary);
  box-shadow: 0 8px 40px rgba(139, 92, 246, 0.2), var(--shadow-glow-purple);
  transform: translateY(-2px);
}

.prompt-input::placeholder {
  color: var(--color-text-tertiary);
}

.input-actions {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.optimize-btn {
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-base);
}

.optimize-btn:hover {
  background: rgba(139, 92, 246, 0.18);
  border-color: rgba(139, 92, 246, 0.5);
  color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.25);
}

.create-btn {
  padding: 10px 28px;
  height: 44px;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-lg);
  background: var(--gradient-ai-primary);
  border: none;
  transition: all var(--transition-base);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
}

.create-btn:hover {
  box-shadow: var(--shadow-glow-mixed);
  transform: translateY(-2px);
}

.input-hint {
  position: absolute;
  bottom: -32px;
  left: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.hint-icon {
  font-size: 14px;
}

/* 快捷操作 */
.quick-actions {
  margin-bottom: 60px;
  animation: slide-in-up 0.6s ease-out 0.5s both;
}

.quick-actions-header {
  text-align: center;
  margin-bottom: 32px;
}

.quick-actions-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-base);
  margin: 0 0 8px 0;
}

.quick-actions-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.quick-action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--glass-bg-light);
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.quick-action-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-ai-card);
  opacity: 0;
  transition: opacity var(--transition-base);
  z-index: 0;
}

.quick-action-card:hover {
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(139, 92, 246, 0.15);
}

.quick-action-card:hover::before {
  opacity: 1;
}

.card-icon {
  font-size: 36px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.card-content {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.card-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-base);
  margin-bottom: 4px;
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-arrow {
  font-size: 20px;
  color: var(--color-text-tertiary);
  transition: all var(--transition-base);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.quick-action-card:hover .card-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

/* 区域 */
.section {
  margin-bottom: 80px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.section-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-base);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: var(--font-size-xxl);
}

.section-actions {
  display: flex;
  gap: 8px;
}

/* 网格 */
.app-grid,
.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* 列表过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-section {
    padding: 60px 0 40px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-description {
    font-size: var(--font-size-base);
  }

  .hero-badge {
    font-size: var(--font-size-xs);
    padding: 8px 16px;
  }

  .app-grid,
  .featured-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .prompt-input {
    padding-right: 20px;
  }

  .input-actions {
    position: static;
    margin-top: 16px;
    justify-content: flex-end;
  }

  .input-hint {
    position: static;
    margin-top: 12px;
    justify-content: center;
  }
}

/* 深色模式适配 */
[data-theme='dark'] #homePage {
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.12), transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(6, 182, 212, 0.1), transparent),
    linear-gradient(180deg, var(--color-bg-base) 0%, var(--color-bg-layout) 100%);
}

[data-theme='dark'] #homePage::before {
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.04) 1px, transparent 1px);
}

[data-theme='dark'] .hero-badge {
  background: var(--glass-bg-dark);
}

[data-theme='dark'] .quick-action-card {
  background: var(--glass-bg-dark);
}

[data-theme='dark'] .prompt-input {
  background: var(--glass-bg-dark);
}
</style>
