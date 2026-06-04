<template>
  <main id="homePage">
    <section class="hero-shell">
      <div class="hero-copy">
        <h1>AI 驱动的<br />零代码应用生成平台</h1>
        <p>用 AI 创造无限可能，让每个想法都能快速变为现实</p>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <div class="visual-card">
          <div class="visual-logo">Vexor</div>
          <div class="visual-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="visual-chip code">&lt;/&gt;</div>
          <div class="visual-chip bolt">
            <ThunderboltOutlined />
          </div>
        </div>
      </div>

      <div class="prompt-panel">
        <a-textarea
          v-model:value="userPrompt"
          placeholder="描述你想要创建的应用，例如：帮我创建一个现代化的个人博客网站..."
          :auto-size="{ minRows: 5, maxRows: 8 }"
          :maxlength="1000"
          class="prompt-input"
          @keydown.ctrl.enter="createApp"
        />
        <div class="prompt-actions">
          <a-button @click="optimizePrompt" :loading="optimizing" class="optimize-btn">
            <template #icon>
              <ThunderboltOutlined />
            </template>
            {{ optimizing ? '优化中' : '优化提示词' }}
          </a-button>
          <a-button
            type="primary"
            @click="createApp"
            :loading="creating"
            class="create-btn"
          >
            {{ creating ? '创建中' : '开始创建' }}
            <template #icon>
              <EnterOutlined />
            </template>
          </a-button>
        </div>
      </div>

      <div class="quick-start">
        <span class="quick-label">快速开始：</span>
        <button
          v-for="template in appTemplates"
          :key="template.id"
          type="button"
          @click="setPrompt(template.prompt)"
        >
          {{ template.title }}
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ThunderboltOutlined, EnterOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { addApp, optimizePrompt as optimizePromptApi } from '@/api/app'
import { useErrorHandler } from '@/composables'

const router = useRouter()
const loginUserStore = useLoginUserStore()
const { handleError } = useErrorHandler()

const userPrompt = ref('')
const creating = ref(false)
const optimizing = ref(false)

interface AppTemplate {
  id: string
  title: string
  prompt: string
}

const appTemplates: AppTemplate[] = [
  {
    id: 'blog',
    title: '个人博客',
    prompt:
      '创建一个现代化的个人博客网站，包含文章列表、详情页、分类标签、搜索功能和个人简介页面。采用简洁的设计风格，支持响应式布局。',
  },
  {
    id: 'company',
    title: '电商网站',
    prompt:
      '构建一个现代化电商网站，包含商品展示、商品详情、购物车、分类筛选和优惠活动区域。整体风格简洁、专业、适合移动端。',
  },
  {
    id: 'task',
    title: '任务管理工具',
    prompt:
      '开发一个任务管理工具，包含任务列表、优先级、截止日期、标签筛选、进度统计和简洁的工作台界面。',
  },
  {
    id: 'official',
    title: '产品官网',
    prompt:
      '设计一个产品官网，包含品牌首屏、核心卖点、功能介绍、客户案例、价格方案和联系我们区域，视觉风格清爽可信。',
  },
  {
    id: 'dashboard',
    title: '数据看板',
    prompt:
      '创建一个数据看板页面，包含核心指标卡片、趋势图、排行榜、筛选器和明细表格，适合运营人员快速查看业务状态。',
  },
]

const setPrompt = (prompt: string) => {
  userPrompt.value = prompt
}

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
      await router.push(`/app/chat/${String(res.data.data)}?tab=code`)
    } else {
      message.error('创建失败：' + res.data.message)
    }
  } catch (error) {
    handleError(error, { defaultMessage: '创建失败，请重试' })
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
#homePage {
  min-height: calc(100vh - var(--layout-header-height));
  background:
    linear-gradient(rgba(65, 105, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(65, 105, 255, 0.035) 1px, transparent 1px),
    radial-gradient(circle at 78% 30%, rgba(78, 117, 255, 0.18), transparent 26%),
    linear-gradient(180deg, #fbfdff 0%, #eef4ff 100%);
  background-size: 64px 64px, 64px 64px, auto, auto;
}

.hero-shell {
  width: min(100%, 1160px);
  margin: 0 auto;
  padding: 78px 24px 84px;
  position: relative;
}

.hero-copy {
  max-width: 560px;
  position: relative;
  z-index: 2;
}

.hero-copy h1 {
  margin: 0;
  color: #172033;
  font-size: 44px;
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: 0;
}

.hero-copy p {
  margin: 24px 0 0;
  color: #546179;
  font-size: 16px;
  line-height: 1.8;
}

.hero-visual {
  position: absolute;
  top: 56px;
  right: 42px;
  width: 420px;
  height: 300px;
  pointer-events: none;
}

.hero-visual::before {
  content: '';
  position: absolute;
  inset: 18px 0 0 42px;
  border: 1px solid rgba(90, 129, 255, 0.18);
  border-radius: 20px;
  transform: rotate(4deg);
}

.visual-card {
  position: absolute;
  inset: 36px 30px 18px 54px;
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 24px;
  align-content: start;
  padding: 34px;
  border: 1px solid rgba(118, 153, 255, 0.28);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 24px 80px rgba(65, 105, 255, 0.16);
  transform: rotate(5deg);
}

.visual-logo {
  display: grid;
  place-items: center;
  width: 88px;
  height: 78px;
  border-radius: 10px;
  background: linear-gradient(135deg, #eff4ff 0%, #ffffff 100%);
  color: #5b86ff;
  font-size: 32px;
  font-weight: 800;
}

.visual-lines {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 6px;
}

.visual-lines span {
  display: block;
  height: 10px;
  border-radius: 999px;
  background: #dfe7ff;
}

.visual-lines span:nth-child(1) {
  width: 72%;
}

.visual-lines span:nth-child(2) {
  width: 92%;
}

.visual-lines span:nth-child(3) {
  width: 58%;
}

.visual-chip {
  position: absolute;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #eef4ff;
  color: #5a7cff;
  box-shadow: 0 12px 32px rgba(65, 105, 255, 0.16);
}

.visual-chip.code {
  left: -18px;
  bottom: 50px;
  font-weight: 700;
}

.visual-chip.bolt {
  right: 22px;
  bottom: 44px;
  font-size: 20px;
}

.prompt-panel {
  width: min(100%, 760px);
  margin-top: 42px;
  position: relative;
  z-index: 2;
  border: 1px solid rgba(192, 204, 228, 0.82);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 55px rgba(31, 56, 111, 0.1);
}

.prompt-input {
  background: transparent;
  border: none;
  padding: 24px 24px 80px;
  box-shadow: none;
  resize: none;
}

.prompt-input:focus {
  box-shadow: none;
}

.prompt-actions {
  position: absolute;
  right: 16px;
  bottom: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.optimize-btn {
  height: 36px;
  border-radius: 4px;
  color: #526178;
  font-weight: 600;
}

.create-btn {
  height: 42px;
  padding: 0 22px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #4b67ff 0%, #254ff0 100%);
  box-shadow: 0 10px 24px rgba(48, 88, 244, 0.26);
  font-weight: 700;
}

.quick-start {
  margin-top: 26px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  color: #344157;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  z-index: 2;
}

.quick-start button {
  height: 34px;
  padding: 0 16px;
  border: 1px solid #d7e0f0;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.86);
  color: #344157;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s,
    box-shadow 0.2s;
}

.quick-start button:hover {
  border-color: #4169ff;
  color: #254ff0;
  box-shadow: 0 8px 20px rgba(65, 105, 255, 0.12);
}

@media (max-width: 960px) {
  .hero-shell {
    padding-top: 48px;
  }

  .hero-copy {
    max-width: none;
  }

  .hero-visual {
    position: relative;
    top: auto;
    right: auto;
    width: min(100%, 420px);
    margin: 28px auto 0;
  }

  .prompt-panel {
    margin-top: 24px;
  }
}

@media (max-width: 640px) {
  .hero-shell {
    padding: 36px 16px 56px;
  }

  .hero-copy h1 {
    font-size: 34px;
  }

  .hero-visual {
    display: none;
  }

  .prompt-actions {
    position: static;
    padding: 0 16px 16px;
    align-items: stretch;
    flex-direction: column;
  }

  .prompt-input {
    padding-bottom: 20px;
  }
}
</style>
