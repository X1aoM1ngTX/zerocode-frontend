<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧装饰区域 -->
      <div class="login-decorate">
        <div class="decorate-content">
          <div class="decorate-logo">
            <span class="logo-icon">✨</span>
            <h1 class="logo-title">ZeroCode</h1>
          </div>
          <p class="decorate-slogan">AI 驱动的零代码应用生成平台</p>
          <div class="decorate-features">
            <div class="feature-item">
              <div class="feature-icon">🚀</div>
              <div class="feature-text">快速创建应用</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎨</div>
              <div class="feature-text">精美界面设计</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⚡</div>
              <div class="feature-text">智能代码生成</div>
            </div>
          </div>
        </div>
        <div class="decorate-bg">
          <div class="bg-circle circle-1"></div>
          <div class="bg-circle circle-2"></div>
          <div class="bg-circle circle-3"></div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="login-form-container">
        <div class="login-form-wrapper">
          <div class="form-header">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">登录到 ZeroCode 开始创作</p>
          </div>

          <a-form
            :model="formState"
            name="login"
            class="login-form"
            autocomplete="off"
            @finish="handleSubmit"
          >
            <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
              <a-input
                v-model:value="formState.userAccount"
                placeholder="请输入账号"
                size="large"
                :prefix="h(UserOutlined)"
                allow-clear
              />
            </a-form-item>

            <a-form-item
              name="userPassword"
              :rules="[
                { required: true, message: '请输入密码' },
                { min: 8, message: '密码长度不能小于 8 位' },
              ]"
            >
              <a-input-password
                v-model:value="formState.userPassword"
                placeholder="请输入密码"
                size="large"
                :prefix="h(LockOutlined)"
              />
            </a-form-item>

            <div class="form-actions">
              <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
              <a class="forgot-link" @click="handleForgotPassword">忘记密码？</a>
            </div>

            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                :loading="submitting"
                block
              >
                {{ submitting ? '登录中...' : '登录' }}
              </a-button>
            </a-form-item>
          </a-form>

          <div class="form-footer">
            <span class="footer-text">还没有账号？</span>
            <RouterLink to="/user/register" class="register-link">
              立即注册
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, h } from 'vue'
import { useRoute } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { userLogin } from '@/api/user'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { useErrorHandler } from '@/composables'

const route = useRoute()
const loginUserStore = useLoginUserStore()
const { handleError } = useErrorHandler()

const submitting = ref(false)
const rememberMe = ref(false)

// 表单数据
const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

/**
 * 提交表单
 */
const handleSubmit = async (values: API.UserLoginRequest) => {
  submitting.value = true
  try {
    const res = await userLogin(values)

    if (res.data.code === 0 && res.data.data) {
      // 保存登录态
      loginUserStore.setLoginUser(res.data.data)

      // 根据记住我选项决定是否保存到 localStorage
      if (rememberMe.value) {
        localStorage.setItem('login-user', JSON.stringify(res.data.data))
      } else {
        sessionStorage.setItem('login-user', JSON.stringify(res.data.data))
      }

      message.success('登录成功')

      // 获取重定向地址
      const redirect = route.query.redirect as string
      const targetUrl = redirect || '/'

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        window.location.href = targetUrl
      }, 300)
    } else {
      message.error('登录失败，' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    handleError(error, { defaultMessage: '登录失败，请重试' })
  } finally {
    submitting.value = false
  }
}

/**
 * 忘记密码处理
 */
const handleForgotPassword = () => {
  // 显示提示信息
  message.info('忘记密码功能正在开发中，请联系管理员重置密码')
  // TODO: 实现忘记密码功能
  // 1. 跳转到忘记密码页面
  // 2. 或者打开忘记密码弹窗
  // 3. 发送重置密码邮件
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* AI 主题渐变背景 */
  background:
    radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.3), transparent 40%),
    radial-gradient(ellipse at 80% 80%, rgba(6, 182, 212, 0.3), transparent 40%),
    linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

.login-container {
  width: 100%;
  max-width: 1100px;
  display: flex;
  background: var(--glass-bg-light);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--glass-border);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), var(--shadow-glow-mixed);
  overflow: hidden;
  animation: slide-in-up 0.6s ease-out;
  position: relative;
  z-index: 1;
}

/* 左侧装饰区域 */
.login-decorate {
  flex: 1;
  padding: 60px 40px;
  background: var(--gradient-ai-dark);
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-decorate::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3), transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.2), transparent 50%);
  pointer-events: none;
}

.decorate-content {
  position: relative;
  z-index: 2;
}

.decorate-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.logo-icon {
  font-size: 48px;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.8));
}

.logo-title {
  font-family: var(--font-family-heading);
  font-size: 36px;
  font-weight: var(--font-weight-bold);
  margin: 0;
  background: var(--gradient-ai-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.decorate-slogan {
  font-family: var(--font-family-body);
  font-size: var(--font-size-lg);
  opacity: 0.9;
  margin-bottom: 60px;
  color: rgba(248, 250, 252, 0.8);
}

.decorate-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateX(8px);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
}

.feature-icon {
  font-size: 32px;
}

.feature-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: rgba(248, 250, 252, 0.9);
}

.decorate-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%);
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation: float 10s ease-in-out infinite reverse;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.15), transparent 70%);
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 12s ease-in-out infinite;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.12), transparent 70%);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 右侧表单区域 */
.login-form-container {
  flex: 1;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-container);
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-base);
  margin: 0 0 12px 0;
}

.form-subtitle {
  font-family: var(--font-family-body);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.login-form {
  margin-top: 32px;
}

.login-form :deep(.ant-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.ant-input-affix-wrapper),
.login-form :deep(.ant-input) {
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  border: 2px solid var(--color-border);
  transition: all var(--transition-base);
}

.login-form :deep(.ant-input-affix-wrapper:focus),
.login-form :deep(.ant-input-affix-wrapper-focused),
.login-form :deep(.ant-input:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.login-form :deep(.ant-input-prefix) {
  color: var(--color-primary);
  margin-right: 12px;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.forgot-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-base);
  cursor: pointer;
}

.forgot-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.login-form :deep(.ant-btn-primary) {
  height: 50px;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  background: var(--gradient-ai-primary);
  border: none;
  transition: all var(--transition-base);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
}

.login-form :deep(.ant-btn-primary:hover) {
  box-shadow: var(--shadow-glow-mixed);
  transform: translateY(-2px);
}

.form-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.footer-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.register-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  margin-left: 8px;
  transition: color var(--transition-base);
}

.register-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-decorate {
    padding: 40px 20px;
  }

  .decorate-features {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .feature-item {
    flex: 1;
    min-width: 200px;
  }

  .login-form-container {
    padding: 40px 20px;
  }

  .form-title {
    font-size: 24px;
  }
}
</style>
